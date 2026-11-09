const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { rateLimits } = require('../config/security');

const make = (cfg, message) => rateLimit({
  ...cfg, standardHeaders: true, legacyHeaders: false, skip: () => env.NODE_ENV === 'test',
  message: { success: false, message },
});
module.exports = {
  generalLimiter: make(rateLimits.general, 'Too many requests, please slow down'),
  authLimiter: make(rateLimits.auth, 'Too many authentication attempts, try again later'),
  otpLimiter: make(rateLimits.otp, 'Too many OTP requests, try again later'),
};
