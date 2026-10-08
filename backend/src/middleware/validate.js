const { body, validationResult } = require('express-validator');

function checkValidations(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { const e = new Error('Validación fallida'); e.array = () => errors.array(); throw e; }
  next();
}
// Cuentas: email libre (cualquiera vale) pero normalizado; la UNICIDAD la
// garantiza el service (409) en API y storage.js en localStorage.
const accountEmail = (field) => body(field).trim().customSanitizer((v) => String(v || '').trim().toLowerCase())
  .custom((v) => typeof v === 'string' && v.includes('@')).withMessage('Email inválido: debe contener @');
const validateRegister = [
  body('name').isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  accountEmail('email'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  checkValidations
];
const validateLogin = [
  accountEmail('email'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  checkValidations
];
const validateStudent = [
  body('nombre').isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  checkValidations
];
// PATCH: mismos formatos pero todo opcional (F2: antes no se validaba nada).
const validateStudentPatch = [
  body('nombre').optional().isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('nota').optional({ nullable: true }).isFloat({ min: 0, max: 5 }).withMessage('Nota entre 0 y 5'),
  checkValidations
];
module.exports = { validateRegister, validateLogin, validateStudent, validateStudentPatch };
