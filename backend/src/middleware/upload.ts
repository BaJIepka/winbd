import multer, { StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';
import { AppError } from '../errors';

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const ALLOWED_EXTENSIONS = /^(jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip)$/;

const EXTENSION_TO_MIME: Record<string, string[]> = {
  jpeg: ['image/jpeg'],
  jpg: ['image/jpeg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  txt: ['text/plain'],
  zip: ['application/zip', 'application/x-zip-compressed'],
};

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (!ALLOWED_EXTENSIONS.test(ext)) {
    cb(new AppError(400, `File type .${ext} is not allowed`));
    return;
  }

  const expectedMimes = EXTENSION_TO_MIME[ext];
  if (expectedMimes && !expectedMimes.includes(file.mimetype)) {
    cb(new AppError(400, `MIME type ${file.mimetype} does not match file extension .${ext}`));
    return;
  }

  cb(null, true);
}

/**
 * Multer instance configured for news uploads.
 * Fields:
 *   - `image`  — single cover image (max 5 MB)
 *   - `files`  — up to 10 attachments (max 20 MB each)
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});
