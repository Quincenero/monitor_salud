// api/index.js — CommonJS-compatible, dynamic import para cargar ESM
module.exports = async function handler(req, res) {
  try {
    const [{ default: app }, { connectDatabase }] = await Promise.all([
      import('../server/app.js'),
      import('../server/db.js'),
    ]);

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
  } catch (err) {
    console.error('Error cargando la app:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor.',
    });
  }
};