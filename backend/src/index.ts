import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './socket';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import apiRouter from './routes';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy headers from ngrok / reverse proxies (fixes express-rate-limit X-Forwarded-For warning)
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading static uploads in frontend
}));

// Dynamic CORS configuration to allow local, Vercel, and ngrok requests
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*') return true;
        return (
          origin === allowed ||
          origin.endsWith('.vercel.app') ||
          origin.includes('ngrok-free.app')
        );
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(rateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads (resumes)
const uploadsPath = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api/v1', apiRouter);

// Base route for health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WorkHive API is running smoothly',
    timestamp: new Date(),
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`[Server] WorkHive Backend listening on port ${port}`);
  console.log(`[Server] Serving static files from: ${uploadsPath}`);
});
