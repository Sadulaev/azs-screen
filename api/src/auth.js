import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'mustang-dev-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mustang2024';

export function login(password) {
  if (!password || password !== ADMIN_PASSWORD) {
    return null;
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  return { token };
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Hash unused for now — plain env password for simplicity on a single station */
export function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}
