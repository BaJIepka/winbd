import { Request } from 'express';
import { Types } from 'mongoose';

/** JWT payload stored in the token */
export interface JwtPayload {
  userId: string;
  email: string;
}

/** Authenticated request — req.user is populated by authenticate middleware */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/** News document status */
export type NewsStatus = 'draft' | 'published';

/** Shape of a news document */
export interface INews {
  _id: Types.ObjectId;
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

/** Shape of a user document */
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
}
