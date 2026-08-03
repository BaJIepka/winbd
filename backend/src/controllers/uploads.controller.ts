import { Request, Response } from 'express';
import { AppError } from '../errors';

export async function uploadImage(req: Request, res: Response): Promise<void> {
  if (!req.file) throw new AppError(400, 'No image provided');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}
