import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

// 🔥 CORS FIX (CRITICAL)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://neuroqueue-app-1.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// security + parsing
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

// rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// routes (cleaned — no duplicates)
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;