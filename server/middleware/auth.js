import { verifyAuthToken, AUTH_COOKIE } from '../utils/jwt.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {

  try {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No autenticado.' });
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      return res
        .status(401)
        .json({ success: false, error: 'Sesión expirada o inválida.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Usuario no encontrado.' });
    }

    if ((payload.tv ?? 0) !== (user.tokenVersion ?? 0)) {
      return res
        .status(401)
        .json({ success: false, error: 'Sesión invalidada.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}