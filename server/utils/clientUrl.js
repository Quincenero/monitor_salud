// Devuelve la URL pública del frontend.
// Prioridad: CLIENT_URL -> dominio de producción de Vercel -> localhost (dev).
export function getClientUrl() {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.split(',')[0].trim().replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:5173';
}

export function getAllowedOrigins() {
  const list = (process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    list.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  if (list.length === 0) list.push('http://localhost:5173');
  return [...new Set(list)];
}
