const { Router } = require('express');
const ctrl = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const r = Router();
r.post('/register', validateRegister, ctrl.register);
r.post('/login', validateLogin, ctrl.login);
module.exports = r;
