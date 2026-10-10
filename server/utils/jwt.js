import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'auth_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno.');
  }
  return secret;
}

export function signAuthToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), tv: user.tokenVersion ?? 0 },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getSecret());
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export const AUTH_COOKIE = COOKIE_NAME;