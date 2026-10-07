/* Error centralizado — toda la API responde { success:false, error } */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err && err.isJoi === true) return res.status(400).json({ success: false, error: 'Validación fallida', details: err.details });
  if (err && err.array) { // express-validator
    return res.status(400).json({ success: false, error: 'Validación fallida', details: err.array() });
  }
  const status = err.statusCode || err.status || 500;
  if (status >= 500) require('./logger').error('Unexpected error', err, { path: req.path });
  res.status(status).json({ success: false, error: err.message || 'Error interno' });
}
module.exports = { ApiError, errorHandler };
