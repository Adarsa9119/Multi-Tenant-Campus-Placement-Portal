const env = require('./env');

module.exports = {
  helmet: { crossOriginResourcePolicy: { policy: 'cross-origin' } },
  cors: {
    origin(origin, cb) {
      const allowed = env.CLIENT_URL.split(',').map((s) => s.trim());
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
    exposedHeaders: ['Retry-After'],
  },
  rateLimits: {
    general: { windowMs: 15 * 60 * 1000, max: 1000 },
    auth: { windowMs: 15 * 60 * 1000, max: 40 },
    otp: { windowMs: 10 * 60 * 1000, max: 15 },
  },
};
