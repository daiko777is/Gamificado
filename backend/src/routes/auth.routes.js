const { Router } = require('express');
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');
const r = Router();
r.post('/register', validateRegister, ctrl.register);
r.post('/login', validateLogin, ctrl.login);
r.get('/me', requireAuth, ctrl.me);
module.exports = r;
