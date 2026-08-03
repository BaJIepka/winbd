import { Schema, model, Document, Types } from 'mongoose';
import { NewsStatus } from '../types';

/** Mongoose document interface for News */
export interface NewsDocument extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  status: NewsStatus;
  imageUrl: string | null;
  attachments: string[];
  publishAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<NewsDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    imageUrl: { type: String, default: null },
    attachments: { type: [String], default: [] },
    publishAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ status: 1, publishAt: 1 }, { sparse: true });

export const News = model<NewsDocument>('News', newsSchema);
