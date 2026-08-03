import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import { News, NewsDocument } from '../models/News';
import { emitNewsEvent } from '../socket/events';
import { AppError } from '../errors';

export interface NewsFilter {
  status?: 'draft' | 'published';
}

export interface PaginatedNews {
  data: NewsDocument[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAll(filter: NewsFilter = {}, page = 1, limit = 20): Promise<PaginatedNews> {
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    News.find(query).populate('author', 'email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    News.countDocuments(query),
  ]);

  return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getById(id: string): Promise<NewsDocument> {
  const news = await News.findById(id).populate('author', 'email');
  if (!news) throw new AppError(404, 'News not found');
  return news;
}

export interface CreateNewsPayload {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string | null;
  attachments?: string[];
}

export async function create(payload: CreateNewsPayload): Promise<NewsDocument> {
  const news = await News.create({
    title: payload.title,
    content: payload.content,
    author: new Types.ObjectId(payload.authorId),
    imageUrl: payload.imageUrl ?? null,
    attachments: payload.attachments ?? [],
  });
  emitNewsEvent('news:created', news);
  return news;
}

export interface UpdateNewsPayload {
  title?: string;
  content?: string;
  imageUrl?: string | null;
  attachments?: string[];
}

export async function update(id: string, payload: UpdateNewsPayload): Promise<NewsDocument> {
  const existing = await News.findById(id);
  if (!existing) throw new AppError(404, 'News not found');

  if (payload.imageUrl !== undefined && existing.imageUrl && payload.imageUrl !== existing.imageUrl) {
    deleteUploadedFile(existing.imageUrl);
  }
  if (payload.attachments !== undefined) {
    existing.attachments.filter((a) => !payload.attachments!.includes(a)).forEach(deleteUploadedFile);
  }

  const news = await News.findByIdAndUpdate(
    id,
    { $set: payload },
    { returnDocument: 'after', runValidators: true }
  );
  emitNewsEvent('news:updated', news!);
  return news!;
}

export async function remove(id: string): Promise<void> {
  const news = await News.findByIdAndDelete(id);
  if (!news) throw new AppError(404, 'News not found');

  if (news.imageUrl) deleteUploadedFile(news.imageUrl);
  news.attachments.forEach(deleteUploadedFile);

  emitNewsEvent('news:deleted', { newsId: id });
}

export async function publish(id: string): Promise<NewsDocument> {
  const news = await News.findByIdAndUpdate(
    id,
    { $set: { status: 'published', publishedAt: new Date(), publishAt: null } },
    { returnDocument: 'after' }
  );
  if (!news) throw new AppError(404, 'News not found');
  emitNewsEvent('news:published', news);
  return news;
}

export async function schedulePublish(id: string, publishAt: Date): Promise<NewsDocument> {
  if (publishAt <= new Date()) throw new AppError(400, 'publishAt must be in the future');
  const news = await News.findByIdAndUpdate(id, { $set: { publishAt } }, { returnDocument: 'after' });
  if (!news) throw new AppError(404, 'News not found');
  return news;
}

function deleteUploadedFile(filePath: string): void {
  const fullPath = path.join(process.cwd(), filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.error(`Failed to delete uploaded file: ${fullPath}`, err.message);
  });
}
