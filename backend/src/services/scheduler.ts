import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { News } from '../models/News';
import { emitNewsEvent } from '../socket/events';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Starts a cron job that runs every minute and publishes
 * any draft news articles whose `publishAt` time has passed.
 */
export async function runScheduledPublish(): Promise<void> {
  const now = new Date();
  const due = await News.find({ status: 'draft', publishAt: { $lte: now } });

  if (due.length > 0) {
    await News.updateMany(
      { _id: { $in: due.map((n) => n._id) } },
      { $set: { status: 'published', publishedAt: now, publishAt: null } }
    );
    for (const news of due) {
      news.status = 'published';
      news.publishedAt = now;
      news.publishAt = null;
      emitNewsEvent('news:published', news);
      console.log(`Scheduled publish: ${news._id}`);
    }
  }
}

export function startScheduler(): void {
  cron.schedule('* * * * *', async () => {
    try {
      await runScheduledPublish();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  // Orphan file cleanup: every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      await cleanOrphanUploads();
    } catch (error) {
      console.error('Orphan cleanup error:', error);
    }
  });

  console.log('Scheduler started');
}

async function cleanOrphanUploads(): Promise<void> {
  let files: string[];
  try {
    files = await fs.readdir(UPLOADS_DIR);
  } catch {
    return; // uploads dir doesn't exist yet
  }

  const allNews = await News.find({}, { imageUrl: 1, attachments: 1, content: 1 }).lean();

  const referenced = new Set<string>();
  for (const news of allNews) {
    if (news.imageUrl) referenced.add(path.basename(news.imageUrl));
    for (const att of news.attachments) referenced.add(path.basename(att));
    // extract /uploads/<filename> references from TipTap HTML content
    const matches = news.content.matchAll(/\/uploads\/([^"'\s>]+)/g);
    for (const m of matches) referenced.add(m[1]);
  }

  const cutoff = Date.now() - ORPHAN_MAX_AGE_MS;
  for (const filename of files) {
    if (referenced.has(filename)) continue;
    const filePath = path.join(UPLOADS_DIR, filename);
    try {
      const stat = await fs.stat(filePath);
      if (stat.mtimeMs < cutoff) {
        await fs.unlink(filePath);
        console.log(`Orphan removed: ${filename}`);
      }
    } catch (err) {
      // file may have been removed concurrently between readdir and unlink
      console.error(`Orphan cleanup: could not process ${filename}`, (err as NodeJS.ErrnoException).code);
    }
  }
}
