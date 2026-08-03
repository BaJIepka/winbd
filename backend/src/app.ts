import 'dotenv/config';
import http from 'http';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './socket/events';
import { startScheduler } from './services/scheduler';
import { createApp } from './createApp';

const app = createApp();
const server = http.createServer(app);

initSocket(server);

async function bootstrap(): Promise<void> {
  await connectDB();
  startScheduler();
  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app, server };
