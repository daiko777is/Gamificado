const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',') }));
app.use(express.json({ limit: '256kb' }));
app.use(morgan('tiny'));

// Rate limit: en producción usar Redis/gateway (este es solo dev de un reto escolar).
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ success: true, service: 'educa-api', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/students.routes'));
app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Ruta no encontrada' }));
app.use(errorHandler);

app.listen(config.port, () => logger.info('Educa API escuchando', { port: config.port }));
module.exports = app;
