import { Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import { AuthRequest } from '../types';
import * as newsService from '../services/news.service';
import {
  createNewsSchema,
  updateNewsSchema,
  scheduleNewsSchema,
  newsStatusSchema,
  paginationSchema,
} from '../schemas/news.schemas';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  const statusResult = newsStatusSchema.safeParse(req.query.status);
  const status = statusResult.success ? statusResult.data : undefined;

  const paginationResult = paginationSchema.safeParse({ page: req.query.page, limit: req.query.limit });
  const { page, limit } = paginationResult.success ? paginationResult.data : { page: 1, limit: 20 };

  const result = await newsService.getAll(status ? { status } : {}, page, limit);
  res.json(result);
}

export async function getOne(req: AuthRequest, res: Response): Promise<void> {
  const news = await newsService.getById(String(req.params.id));
  res.json(news);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const result = createNewsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
    return;
  }
  const { title, content } = result.data;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const imageFile = files?.['image']?.[0];
  const attachmentFiles = files?.['files'] ?? [];

  const news = await newsService.create({
    title,
    content: sanitizeContent(content),
    authorId: req.user!.userId,
    imageUrl: imageFile ? `/uploads/${imageFile.filename}` : null,
    attachments: attachmentFiles.map((f) => `/uploads/${f.filename}`),
  });

  res.status(201).json(news);
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const result = updateNewsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
    return;
  }
  const { title, content } = result.data;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const imageFile = files?.['image']?.[0];
  const attachmentFiles = files?.['files'];
  const raw = req.body.keepAttachments as string | string[] | undefined;
  const keepAttachments: string[] = raw ? (Array.isArray(raw) ? raw : [raw]) : [];

  const payload: newsService.UpdateNewsPayload = {};
  if (title) payload.title = title;
  if (content) payload.content = sanitizeContent(content);
  if (imageFile) payload.imageUrl = `/uploads/${imageFile.filename}`;
  if (req.body.removeImage === 'true') payload.imageUrl = null;
  if (attachmentFiles?.length || keepAttachments.length) {
    payload.attachments = [
      ...keepAttachments,
      ...(attachmentFiles?.map((f) => `/uploads/${f.filename}`) ?? []),
    ];
  }

  const news = await newsService.update(String(req.params.id), payload);
  res.json(news);
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  await newsService.remove(String(req.params.id));
  res.status(204).send();
}

export async function publish(req: AuthRequest, res: Response): Promise<void> {
  const news = await newsService.publish(String(req.params.id));
  res.json(news);
}

export async function schedulePublish(req: AuthRequest, res: Response): Promise<void> {
  const result = scheduleNewsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation error', errors: result.error.flatten().fieldErrors });
    return;
  }

  const news = await newsService.schedulePublish(String(req.params.id), new Date(result.data.publishAt));
  res.json(news);
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'hr',
  'mark',
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  '*': ['class'],
};

function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ['https', 'http', 'mailto'],
  });
}
