const router = require('express').Router();
const c = require('../controllers/authController');
const v = require('../validators/authValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, v.login, validate, c.login);
router.post('/verify-otp', authLimiter, v.verifyOtp, validate, c.verifyOtp);
router.post('/resend-otp', otpLimiter, v.resendOtp, validate, c.resendOtp);
router.post('/request-activation', otpLimiter, v.email, validate, c.requestActivation);
router.post('/activate', authLimiter, v.activate, validate, c.activate);
router.post('/forgot-password', otpLimiter, v.email, validate, c.forgotPassword);
router.post('/reset-password', authLimiter, v.reset, validate, c.resetPassword);
router.get('/me', authenticate, c.me);
module.exports = router;
