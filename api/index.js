// api/index.js
import app from '../server/app.js';
import { connectDatabase } from '../server/db.js';

// Vercel reutiliza instancias. Conectar es idempotente (db.js cachea).
export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Error de conexión a base de datos.',
    });
  }
  return app(req, res);
}