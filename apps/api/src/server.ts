import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from './utils/prisma';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import smsRoutes from './routes/sms';
import mspRoutes from './routes/msp';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Simple health check
app.get('/health', (_req: Request, res: Response) => res.send({ status: 'ok' }));

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications/sms', smsRoutes);
app.use('/api/msp', mspRoutes);

// Error handling (must be after routes)
app.use(errorHandler);

// HTTP server & Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // we could join rooms per centre later
});

// Export for external usage (e.g., tests)
export { app, httpServer, io };

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

