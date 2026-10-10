import { Router } from 'express';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import {
  signAuthToken,
  setAuthCookie,
  clearAuthCookie,
} from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const router = Router();

// ---------- Rate limiters ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados intentos. Probá más tarde.' },
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas solicitudes. Probá más tarde.' },
});

// ---------- Schemas ----------
const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto.').max(80),
  email: z.string().trim().email('Email inválido.').max(200),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(100),
});

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
});

const forgotSchema = z.object({
  email: z.string().trim().email('Email inválido.'),
});

const resetSchema = z.object({
  token: z.string().min(20, 'Token inválido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(100),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto.').max(80),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.').max(100),
});

function parseOr400(schema, data, res) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    res.status(400).json({
      success: false,
      error: first.message,
      field: first.path?.[0],
    });
    return null;
  }
  return result.data;
}

// ---------- Register ----------
router.post('/register', async (req, res, next) => {
  try {
    const data = parseOr400(registerSchema, req.body, res);
    if (!data) return;

    const email = data.email.toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, error: 'Ese email ya está registrado.' });
    }

    const user = new User({ name: data.name, email });
    await user.setPassword(data.password);
    await user.save();

    setAuthCookie(res, signAuthToken(user));
    res.status(201).json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// ---------- Login ----------
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const data = parseOr400(loginSchema, req.body, res);
    if (!data) return;

    const user = await User.findOne({ email: data.email.toLowerCase() });

    // Comparación con timing consistente: siempre ejecutamos un bcrypt.compare
    const ok = user
      ? await user.verifyPassword(data.password)
      : await User.dummyCompare(data.password);

    if (!user || !ok) {
      return res
        .status(401)
        .json({ success: false, error: 'Email o contraseña incorrectos.' });
    }

    setAuthCookie(res, signAuthToken(user));
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// ---------- Logout ----------
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

// ---------- Me ----------
router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// ---------- Forgot password ----------
router.post('/forgot-password', forgotLimiter, async (req, res, next) => {
  try {
    const data = parseOr400(forgotSchema, req.body, res);
    if (!data) return;

    const genericMsg =
      'Si el email existe, te enviamos un link de recuperación.';
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (user) {
      // Invalidar tokens previos sin usar
      await PasswordResetToken.updateMany(
        { userId: user._id, usedAt: null },
        { $set: { usedAt: new Date() } }
      );

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      } catch (mailErr) {
        console.error('[auth] Error enviando email:', mailErr);
        // No exponemos el error
      }
    }

    res.json({ success: true, message: genericMsg });
  } catch (err) {
    next(err);
  }
});

// ---------- Reset password ----------
router.post('/reset-password', async (req, res, next) => {
  try {
    const data = parseOr400(resetSchema, req.body, res);
    if (!data) return;

    const tokenHash = crypto
      .createHash('sha256')
      .update(data.token)
      .digest('hex');

    const record = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res
        .status(400)
        .json({ success: false, error: 'Link inválido o expirado.' });
    }

    const user = await User.findById(record.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'Link inválido o expirado.' });
    }

    await user.setPassword(data.password);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1; // invalida todas las sesiones
    await user.save();

    record.usedAt = new Date();
    await record.save();

    clearAuthCookie(res);
    res.json({
      success: true,
      message: 'Contraseña actualizada. Iniciá sesión de nuevo.',
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Update profile ----------
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const data = parseOr400(updateProfileSchema, req.body, res);
    if (!data) return;

    req.user.name = data.name;
    await req.user.save();

    res.json({ success: true, user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
});

// ---------- Change password ----------
router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const data = parseOr400(changePasswordSchema, req.body, res);
    if (!data) return;

    const ok = await req.user.verifyPassword(data.currentPassword);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, error: 'Contraseña actual incorrecta.' });
    }

    await req.user.setPassword(data.newPassword);
    req.user.tokenVersion = (req.user.tokenVersion ?? 0) + 1;
    await req.user.save();

    // Rotamos el token del usuario actual para no desloguearlo
    setAuthCookie(res, signAuthToken(req.user));

    res.json({ success: true, message: 'Contraseña actualizada.' });
  } catch (err) {
    next(err);
  }
});

export default router;