import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

export function signAccessToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

export function signRefreshToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
}

export function signUserToken(user) {
  return jwt.sign({ sub: user._id.toString(), kind: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin?.active) return res.status(401).json({ success: false, message: 'Account inactive' });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.admin.role) ? next() : res.status(403).json({ success: false, message: 'Forbidden' });
}

export async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.kind !== 'user') return res.status(401).json({ success: false, message: 'Invalid account session' });
    const user = await User.findById(payload.sub);
    if (!user?.active) return res.status(401).json({ success: false, message: 'Account inactive' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

