const auth = require('../services/authService');
async function register(req, res, next) {
  try { const r = await auth.register(req.body); res.status(201).json({ success: true, data: r }); }
  catch (e) { next(e); }
}
async function login(req, res, next) {
  try { const r = await auth.login(req.body); res.json({ success: true, data: r }); }
  catch (e) { next(e); }
}
module.exports = { register, login };
