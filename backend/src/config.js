require('dotenv').config();
module.exports = {
  port: Number(process.env.PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-educa-secret',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};
