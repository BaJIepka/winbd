import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../createApp';

let mongod: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns access + refresh tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('refreshTokenExpiresAt');
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(typeof res.body.refreshTokenExpiresAt).toBe('number');
    expect(res.body.refreshTokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('rejects password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'no-pass@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@example.com', password: 'secret123' });
  });

  it('returns access + refresh tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('refreshTokenExpiresAt');
    expect(typeof res.body.refreshTokenExpiresAt).toBe('number');
    expect(res.body.refreshTokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

describe('POST /api/auth/refresh', () => {
  let refreshToken: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'refresh@example.com', password: 'password123' });
    refreshToken = res.body.refreshToken as string;
  });

  it('returns new tokens for a valid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('refreshTokenExpiresAt');
    expect(res.body.refreshToken).not.toBe(refreshToken);
    expect(typeof res.body.refreshTokenExpiresAt).toBe('number');
    expect(res.body.refreshTokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it('rejects an invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'invalid-token' });

    expect(res.status).toBe(401);
  });

  it('rejects a used refresh token (rotation)', async () => {
    await request(app).post('/api/auth/refresh').send({ refreshToken });
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(401);
  });

  it('rejects missing refreshToken field', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  let refreshToken: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'logout@example.com', password: 'password123' });
    refreshToken = res.body.refreshToken as string;
  });

  it('logs out and invalidates the refresh token', async () => {
    const logoutRes = await request(app).post('/api/auth/logout').send({ refreshToken });
    expect(logoutRes.status).toBe(204);

    const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('returns 204 even without a refresh token', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    expect(res.status).toBe(204);
  });
});
