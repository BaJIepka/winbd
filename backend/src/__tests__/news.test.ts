import request from 'supertest';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../createApp';

let mongod: MongoMemoryServer;
const app = createApp();
let token: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'author@example.com', password: 'password123' });
  token = res.body.accessToken as string;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key !== 'users') await collections[key].deleteMany({});
  }
});

async function createNews(overrides: Record<string, unknown> = {}): Promise<request.Response> {
  return request(app)
    .post('/api/news')
    .set('Authorization', `Bearer ${token}`)
    .field('title', (overrides.title as string) ?? 'Test News')
    .field('content', (overrides.content as string) ?? 'Some content here');
}

describe('Auth protection', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/news');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/news').set('Authorization', 'Bearer bad.token.here');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/news', () => {
  it('returns empty data when no news exist', async () => {
    const res = await request(app).get('/api/news').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.page).toBe(1);
  });

  it('returns created news with pagination metadata', async () => {
    await createNews();
    const res = await request(app).get('/api/news').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(1);
  });

  it('filters by status', async () => {
    await createNews();
    const draftRes = await request(app).get('/api/news?status=draft').set('Authorization', `Bearer ${token}`);
    expect(draftRes.body.data).toHaveLength(1);

    const publishedRes = await request(app)
      .get('/api/news?status=published')
      .set('Authorization', `Bearer ${token}`);
    expect(publishedRes.body.data).toHaveLength(0);
  });

  it('ignores invalid status and returns all items', async () => {
    await createNews();
    const res = await request(app).get('/api/news?status=invalid').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('paginates results correctly', async () => {
    await createNews({ title: 'Article 1' });
    await createNews({ title: 'Article 2' });
    await createNews({ title: 'Article 3' });

    const page1 = await request(app).get('/api/news?page=1&limit=2').set('Authorization', `Bearer ${token}`);
    expect(page1.body.data).toHaveLength(2);
    expect(page1.body.total).toBe(3);
    expect(page1.body.totalPages).toBe(2);
    expect(page1.body.page).toBe(1);

    const page2 = await request(app).get('/api/news?page=2&limit=2').set('Authorization', `Bearer ${token}`);
    expect(page2.body.data).toHaveLength(1);
    expect(page2.body.page).toBe(2);
  });
});

describe('POST /api/news', () => {
  it('creates a draft news item', async () => {
    const res = await createNews({ title: 'My Article', content: 'Article body' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'My Article', status: 'draft' });
  });

  it('rejects missing title', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .field('content', 'No title here');
    expect(res.status).toBe(400);
  });

  it('rejects missing content', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'No content');
    expect(res.status).toBe(400);
  });

  it('rejects title exceeding 500 characters', async () => {
    const res = await createNews({ title: 'A'.repeat(501), content: 'Valid content' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

describe('GET /api/news/:id', () => {
  it('returns 404 for a valid but non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/news/${fakeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid ObjectId format', async () => {
    const res = await request(app).get('/api/news/not-a-valid-id').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/news/:id', () => {
  it('updates a news item', async () => {
    const created = await createNews();
    const id = created.body._id as string;

    const res = await request(app)
      .put(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Updated Title');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('returns 404 for non-existent news', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/news/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Updated');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/news/:id - attachments', () => {
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

  // Minimal valid 1x1 PNG (67 bytes)
  const TINY_PNG = Buffer.from(
    '89504e470d0a1a0a0000000d494844520000000100000001080200000090' +
      '77533de000000000c4944415478016360f8cfc00000000200016dd204560' +
      '0000000049454e44ae426082',
    'hex'
  );

  beforeAll(async () => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  });

  afterEach(async () => {
    const files = await fs.readdir(UPLOADS_DIR).catch(() => [] as string[]);
    await Promise.all(files.map((f) => fs.unlink(path.join(UPLOADS_DIR, f)).catch(() => undefined)));
  });

  it('removes the last remaining attachment when the client resubmits an empty list', async () => {
    const created = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'With attachment')
      .field('content', 'Some content')
      .attach('files', TINY_PNG, { filename: 'file.png', contentType: 'image/png' });

    expect(created.body.attachments).toHaveLength(1);
    const id = created.body._id as string;

    const res = await request(app)
      .put(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('attachmentsUpdated', 'true');

    expect(res.status).toBe(200);
    expect(res.body.attachments).toEqual([]);
  });

  it('preserves Cyrillic characters in the stored attachment filename', async () => {
    const created = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'With Cyrillic attachment')
      .field('content', 'Some content')
      .attach('files', TINY_PNG, { filename: 'Отчёт.png', contentType: 'image/png' });

    expect(created.status).toBe(201);
    const [attachmentUrl] = created.body.attachments as string[];
    expect(attachmentUrl).toContain('Отчёт');
  });
});

describe('DELETE /api/news/:id', () => {
  it('deletes a news item', async () => {
    const created = await createNews();
    const id = created.body._id as string;

    const del = await request(app).delete(`/api/news/${id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/news/${id}`).set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  it('returns 404 for non-existent news', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/news/${fakeId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/news/:id/publish', () => {
  it('publishes a draft news item', async () => {
    const created = await createNews();
    const id = created.body._id as string;

    const res = await request(app).post(`/api/news/${id}/publish`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('published');
    expect(res.body.publishedAt).toBeTruthy();
  });
});

describe('POST /api/news/:id/schedule', () => {
  it('schedules a future publication', async () => {
    const created = await createNews();
    const id = created.body._id as string;
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post(`/api/news/${id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ publishAt: futureDate });

    expect(res.status).toBe(200);
    expect(res.body.publishAt).toBeTruthy();
    expect(res.body.status).toBe('draft');
  });

  it('rejects a past date', async () => {
    const created = await createNews();
    const id = created.body._id as string;
    const pastDate = new Date(Date.now() - 1000).toISOString();

    const res = await request(app)
      .post(`/api/news/${id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ publishAt: pastDate });

    expect(res.status).toBe(400);
  });

  it('rejects missing publishAt', async () => {
    const created = await createNews();
    const id = created.body._id as string;

    const res = await request(app)
      .post(`/api/news/${id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects invalid date format', async () => {
    const created = await createNews();
    const id = created.body._id as string;

    const res = await request(app)
      .post(`/api/news/${id}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ publishAt: 'not-a-date' });

    expect(res.status).toBe(400);
  });
});
