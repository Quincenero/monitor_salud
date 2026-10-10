export function notFoundApi(req, res) {
  res.status(404).json({ success: false, error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Errores conocidos de Mongoose / Mongo
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'campo';
    return res.status(409).json({
      success: false,
      error: `Ya existe un registro con ese ${field}.`,
    });
  }

  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return res.status(400).json({
      success: false,
      error: first?.message || 'Datos inválidos.',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID inválido.',
    });
  }

  const status = err.status || 500;
  console.error(`[ERROR ${status}]`, err.message);
  if (status >= 500) console.error(err.stack);

  res.status(status).json({
    success: false,
    error: status >= 500 ? 'Error interno del servidor.' : err.message,
  });
}