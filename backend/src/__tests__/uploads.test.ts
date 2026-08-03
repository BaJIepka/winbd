import request from 'supertest';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../createApp';

let mongod: MongoMemoryServer;
const app = createApp();
let token: string;

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Minimal valid 1x1 PNG (67 bytes)
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000000100000001080200000090' +
    '77533de000000000c4944415478016360f8cfc00000000200016dd204560' +
    '0000000049454e44ae426082',
  'hex'
);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'uploader@example.com', password: 'password123' });
  token = res.body.accessToken as string;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Remove any files created during the test
  const files = await fs.readdir(UPLOADS_DIR).catch(() => [] as string[]);
  await Promise.all(files.map((f) => fs.unlink(path.join(UPLOADS_DIR, f)).catch(() => undefined)));
});

describe('POST /api/uploads/image', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .attach('image', TINY_PNG, { filename: 'photo.png', contentType: 'image/png' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/uploads/image').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No image provided');
  });

  it('uploads an image and returns its URL', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', TINY_PNG, { filename: 'photo.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url');
    expect(typeof res.body.url).toBe('string');
    expect(res.body.url).toMatch(/^\/uploads\/.+/);
  });

  it('rejects unsupported file types', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('not an image'), {
        filename: 'script.js',
        contentType: 'application/javascript',
      });

    expect(res.status).toBe(400);
  });
});
