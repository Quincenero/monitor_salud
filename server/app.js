import './env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import { notFoundApi, errorHandler } from './middleware/errors.js';

const app = express();

// En producción, Vercel sirve el frontend estático. En dev, Vite lo sirve.
// El CLIENT_URL en prod es el dominio de Vercel; en dev es localhost:5173.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: CLIENT_URL.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/status', async (req, res) => {
  const { getDatabaseStatus } = await import('./db.js');
  res.json(getDatabaseStatus());
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);

// 404 sólo para /api/*
app.use('/api', notFoundApi);

// Error handler SIEMPRE al final
app.use(errorHandler);

export default app;
