import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates that a required environment variable is set.
 * @param name - Variable name
 * @returns The value of the variable
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET + '_refresh',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',
} as const;
