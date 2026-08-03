import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '../errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ message: `Invalid ${err.path}: ${String(err.value)}` });
    return;
  }

  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ message: 'Validation error', errors: messages });
    return;
  }

  // MongoDB duplicate key error
  if (isMongoServerError(err) && err.code === 11000) {
    res.status(409).json({ message: 'Already exists' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
}

function isMongoServerError(err: unknown): err is { code: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'MongoServerError'
  );
}
