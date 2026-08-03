import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { z } from 'zod';

extendZodWithOpenApi(z);

import { registerSchema, loginSchema, refreshSchema } from '../schemas/auth.schemas';
import { createNewsSchema, updateNewsSchema, scheduleNewsSchema } from '../schemas/news.schemas';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// --- Shared response schemas ---

const fileSchema = z.string().openapi({ type: 'string', format: 'binary' });

const tokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z
    .number()
    .int()
    .openapi({ description: 'Unix timestamp (ms) when the refresh token expires' }),
});

const newsSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  status: z.enum(['draft', 'published']),
  imageUrl: z.string().nullable(),
  attachments: z.array(z.string()),
  publishAt: z.string().datetime().nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const paginatedNewsSchema = z.object({
  data: z.array(newsSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

// --- Auth routes ---

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: registerSchema } }, required: true },
  },
  responses: {
    201: {
      description: 'Registration successful',
      content: { 'application/json': { schema: tokensSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: validationErrorSchema } },
    },
    409: { description: 'Email already in use' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: loginSchema } }, required: true },
  },
  responses: {
    200: { description: 'Login successful', content: { 'application/json': { schema: tokensSchema } } },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Auth'],
  request: {
    body: { content: { 'application/json': { schema: refreshSchema } }, required: true },
  },
  responses: {
    200: { description: 'Tokens refreshed', content: { 'application/json': { schema: tokensSchema } } },
    401: { description: 'Invalid or expired refresh token' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'application/json': { schema: z.object({ refreshToken: z.string().optional() }) } },
    },
  },
  responses: {
    204: { description: 'Logged out' },
  },
});

// --- News routes ---

registry.registerPath({
  method: 'get',
  path: '/api/news',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(['draft', 'published']).optional(),
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    }),
  },
  responses: {
    200: {
      description: 'Paginated list of news',
      content: { 'application/json': { schema: paginatedNewsSchema } },
    },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/news/{id}',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'News article', content: { 'application/json': { schema: newsSchema } } },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/news',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: createNewsSchema.extend({
            image: fileSchema.optional(),
            files: z.array(fileSchema).optional(),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: { description: 'Article created', content: { 'application/json': { schema: newsSchema } } },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: validationErrorSchema } },
    },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/news/{id}',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'multipart/form-data': {
          schema: updateNewsSchema.extend({
            image: fileSchema.optional(),
            files: z.array(fileSchema).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Article updated', content: { 'application/json': { schema: newsSchema } } },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: validationErrorSchema } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/news/{id}',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Deleted' },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/news/{id}/publish',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Article published', content: { 'application/json': { schema: newsSchema } } },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/news/{id}/schedule',
  tags: ['News'],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: scheduleNewsSchema } }, required: true },
  },
  responses: {
    200: { description: 'Publication scheduled', content: { 'application/json': { schema: newsSchema } } },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: validationErrorSchema } },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Not found' },
  },
});

// --- Uploads routes ---

registry.registerPath({
  method: 'post',
  path: '/api/uploads/image',
  tags: ['Uploads'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({ image: fileSchema }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Image uploaded',
      content: {
        'application/json': {
          schema: z.object({ url: z.string().openapi({ example: '/uploads/1234567890-photo.jpg' }) }),
        },
      },
    },
    400: { description: 'No image provided or unsupported file type' },
    401: { description: 'Unauthorized' },
  },
});

export function generateOpenApiDocument(): OpenAPIObject {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'News API',
      version: '1.0.0',
      description: 'REST API for news articles with JWT auth, Socket.io notifications, and file uploads',
    },
    servers: [{ url: 'http://localhost:5000' }],
  });
}
