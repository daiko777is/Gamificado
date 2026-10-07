const { body, validationResult } = require('express-validator');

function checkValidations(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const e = new Error('Validación fallida'); e.array = () => errors.array(); throw e; }
  next();
}
const validateRegister = [
  body('name').isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  checkValidations
];
const validateLogin = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  checkValidations
];
const validateStudent = [
  body('nombre').isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  checkValidations
];
module.exports = { validateRegister, validateLogin, validateStudent };
