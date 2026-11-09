const morgan = require('morgan');
const env = require('../config/env');

// Logs method, path (without query string, so no secrets) and status only. Bodies (passwords, OTPs) are never logged.
morgan.token('safe-url', (req) => req.originalUrl.split('?')[0]);
module.exports = env.NODE_ENV === 'test' ? (req, res, next) => next() : morgan(':method :safe-url :status :response-time ms');
