import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

let io: SocketServer | null = null;

/** News-related Socket.io event names */
export type NewsEvent = 'news:created' | 'news:updated' | 'news:deleted' | 'news:published';

/**
 * Initializes the Socket.io server on the given HTTP server.
 * Must be called once at application startup.
 */
export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emits a news-related event to all connected clients.
 * Safe to call even before socket server is initialized (no-op).
 * @param event - The event name
 * @param data - The payload to send
 */
export function emitNewsEvent(event: NewsEvent, data: unknown): void {
  io?.emit(event, data);
}
