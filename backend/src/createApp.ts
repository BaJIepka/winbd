import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import uploadsRoutes from './routes/uploads.routes';
import { generateOpenApiDocument } from './docs/openapi';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  const openApiDoc = generateOpenApiDocument();
  app.use(
    '/api-docs',
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(openApiDoc)
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/auth', authLimiter, authRoutes);
  } else {
    app.use('/api/auth', authRoutes);
  }
  app.use('/api/news', newsRoutes);
  app.use('/api/uploads', uploadsRoutes);

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);

  return app;
}
