import crypto from 'node:crypto';

const TOKEN_BYTES = 32;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export function generateVerificationToken() {
  const raw = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + EXPIRY_MS);
  return { raw, hash, expiresAt };
}

export function hashVerificationToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function buildVerificationUrl(rawToken) {
  const base =
    process.env.CLIENT_URL?.split(',')[0]?.trim() ||
    'http://localhost:5173';
  return `${base}/verify-email?token=${rawToken}`;
}