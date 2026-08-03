import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process on failure.
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
