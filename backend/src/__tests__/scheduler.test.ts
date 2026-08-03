import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { News } from '../models/News';
import { runScheduledPublish } from '../services/scheduler';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await News.deleteMany({});
});

const AUTHOR_ID = new mongoose.Types.ObjectId();

async function createDraft(publishAt: Date | null = null) {
  return News.create({
    title: 'Draft',
    content: 'Content',
    author: AUTHOR_ID,
    status: 'draft',
    publishAt,
  });
}

describe('runScheduledPublish', () => {
  it('publishes draft articles whose publishAt has passed', async () => {
    const pastDate = new Date(Date.now() - 1000);
    const news = await createDraft(pastDate);

    await runScheduledPublish();

    const updated = await News.findById(news._id);
    expect(updated?.status).toBe('published');
    expect(updated?.publishedAt).toBeTruthy();
    expect(updated?.publishAt).toBeNull();
  });

  it('does not publish drafts with a future publishAt', async () => {
    const futureDate = new Date(Date.now() + 60_000);
    await createDraft(futureDate);

    await runScheduledPublish();

    const all = await News.find({});
    expect(all[0].status).toBe('draft');
  });

  it('does not publish drafts without a publishAt set', async () => {
    await createDraft(null);

    await runScheduledPublish();

    const all = await News.find({});
    expect(all[0].status).toBe('draft');
  });

  it('publishes multiple due articles in one batch', async () => {
    const past = new Date(Date.now() - 1000);
    await createDraft(past);
    await createDraft(past);

    await runScheduledPublish();

    const all = await News.find({});
    expect(all.every((n) => n.status === 'published')).toBe(true);
  });

  it('does nothing when no articles are due', async () => {
    await runScheduledPublish();
    const all = await News.find({});
    expect(all).toHaveLength(0);
  });
});
