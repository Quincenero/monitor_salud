// Este archivo es SOLO para desarrollo local.
// En producción, Vercel usa `api/index.js` (que importa `app.js`).
import app from './app.js';
import { connectDatabase, getDatabaseStatus } from './db.js';

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`API disponible en http://localhost:${PORT}`);
      console.log(`MongoDB: ${getDatabaseStatus().databaseName}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar la aplicación:', error.message);
    process.exit(1);
  }
}

startServer();