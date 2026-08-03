import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { AppError } from '../errors';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp (ms) when the refresh token expires */
  refreshTokenExpiresAt: number;
}

export async function register(email: string, password: string): Promise<AuthTokens> {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'Email already in use');

  const user = await User.create({ email, password });
  return generateTokens({ userId: String(user._id), email: user.email });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, 'Invalid credentials');

  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  return generateTokens({ userId: String(user._id), email: user.email });
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await stored.deleteOne();
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(stored.userId);
  if (!user) {
    await stored.deleteOne();
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  await stored.deleteOne(); // rotate: старый токен удаляется, выдаётся новый
  return generateTokens({ userId: String(user._id), email: user.email });
}

export async function logout(refreshToken: string): Promise<void> {
  await RefreshToken.deleteOne({ token: refreshToken });
}

export async function generateTokens(payload: JwtPayload): Promise<AuthTokens> {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

  const refreshTokenValue = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + parseExpiry(env.JWT_REFRESH_EXPIRES_IN));

  await RefreshToken.create({ token: refreshTokenValue, userId: payload.userId, expiresAt });

  return { accessToken, refreshToken: refreshTokenValue, refreshTokenExpiresAt: expiresAt.getTime() };
}

function parseExpiry(expiry: string): number {
  const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
  return parseInt(match[1]) * units[match[2]];
}
