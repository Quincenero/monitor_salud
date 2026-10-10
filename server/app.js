import './env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import { notFoundApi, errorHandler } from './middleware/errors.js';
import { getAllowedOrigins } from './utils/clientUrl.js';

const app = express();

// Vercel (y cualquier proxy inverso) pone la IP real del cliente en
// X-Forwarded-For. Sin esto, express-rate-limit ve la IP del proxy y
// todos los usuarios comparten el mismo límite de intentos.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// En producción, Vercel sirve el frontend estático y la API en el mismo origen.
app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(helmet());

// Health checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/status', async (req, res) => {
  const { getDatabaseStatus } = await import('./db.js');
  const status = getDatabaseStatus();
  // En producción no exponemos nombre de la base ni config interna.
  if (process.env.NODE_ENV === 'production') {
    return res.json({ isMongoConnected: status.isMongoConnected });
  }
  res.json(status);
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);

// 404 sólo para /api/*
app.use('/api', notFoundApi);

// Error handler SIEMPRE al final
app.use(errorHandler);

export default app;
