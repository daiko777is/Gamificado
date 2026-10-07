/* Logger estructurado (JSON por línea) — patrón backend-patterns */
function base(level, msg, ctx) {
  console.log(JSON.stringify(Object.assign({
    timestamp: new Date().toISOString(), level, msg
  }, ctx || {})));
}
module.exports = {
  info: (msg, ctx) => base('info', msg, ctx),
  warn: (msg, ctx) => base('warn', msg, ctx),
  error: (msg, err, ctx) => base('error', msg, Object.assign({}, ctx, {
    error: err && err.message, stack: err && err.stack
  }))
};
