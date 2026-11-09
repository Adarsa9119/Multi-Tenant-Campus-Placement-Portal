const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') { status = 422; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.code === 11000) { status = 409; message = 'Duplicate value: record already exists'; }
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { status = 401; message = 'Invalid or expired token'; }
  else if (err.message === 'CORS blocked') status = 403;
  if (status >= 500) { console.error(err); if (env.NODE_ENV === 'production') message = 'Internal server error'; }
  res.status(status).json({ success: false, message, details: err.details });
};
