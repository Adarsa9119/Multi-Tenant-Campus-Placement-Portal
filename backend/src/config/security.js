const env = require('./env');

module.exports = {
  helmet: { crossOriginResourcePolicy: { policy: 'cross-origin' } },
  cors: {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const cleanOrigin = origin.trim().replace(/\/+$/, '');
      const allowed = env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/+$/, ''));
      if (env.NODE_ENV === 'production') {
        if (allowed.includes(cleanOrigin)) return cb(null, true);
        return cb(new Error('CORS blocked'));
      }
      if (
        allowed.includes('*') ||
        allowed.includes(cleanOrigin) ||
        cleanOrigin.startsWith('http://localhost:') ||
        cleanOrigin.startsWith('http://127.0.0.1:')
      ) {
        return cb(null, true);
      }
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
