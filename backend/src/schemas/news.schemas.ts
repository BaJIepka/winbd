import { z } from 'zod';

export const createNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  content: z.string().min(1, 'Content is required').max(50000, 'Content is too long'),
});

export const updateNewsSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(50000).optional(),
});

export const scheduleNewsSchema = z.object({
  publishAt: z.string().datetime({ message: 'publishAt must be a valid ISO datetime' }),
});

export const newsStatusSchema = z.enum(['draft', 'published']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type ScheduleNewsInput = z.infer<typeof scheduleNewsSchema>;
