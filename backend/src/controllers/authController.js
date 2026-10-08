const auth = require('../services/authService');
async function register(req, res, next) {
  try { const r = await auth.register(req.body); res.status(201).json({ success: true, data: r }); }
  catch (e) { next(e); }
}
async function login(req, res, next) {
  try { const r = await auth.login(req.body); res.json({ success: true, data: r }); }
  catch (e) { next(e); }
}
// Verifica que el token de la sesión siga válido (el frontend lo llama al arrancar).
function me(req, res) {
  res.json({ success: true, data: { id: req.user.id, email: req.user.email, role: req.user.role } });
}
module.exports = { register, login, me };
