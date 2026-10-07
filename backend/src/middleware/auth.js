const jwt = require('jsonwebtoken');
const config = require('../config');
const { ApiError } = require('./errorHandler');

function sign(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, config.jwtSecret, { expiresIn: '8h' });
}
// Auth opcional para estudiantes (si hay token, lo adjunta; si no, sigue como invitado local)
function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try { req.user = jwt.verify(h.slice(7), config.jwtSecret); } catch (_) { /* invitado */ }
  }
  next();
}
function requireAuth(req, _res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return next(new ApiError(401, 'Falta token de autorización'));
  try { req.user = jwt.verify(h.slice(7), config.jwtSecret); next(); }
  catch (_) { next(new ApiError(401, 'Token inválido o expirado')); }
}
const ROLES = { admin: ['read', 'write', 'delete', 'admin'], user: ['read', 'write'] };
function requirePermission(perm) {
  return (req, _res, next) => {
    const role = (req.user && req.user.role) || 'user';
    if (!(ROLES[role] || []).includes(perm)) return next(new ApiError(403, 'Permisos insuficientes'));
    next();
  };
}
module.exports = { sign, optionalAuth, requireAuth, requirePermission };
