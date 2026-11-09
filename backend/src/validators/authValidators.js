const { body } = require('express-validator');
const email = (f = 'email') => body(f).isEmail().withMessage('A valid email is required').normalizeEmail({ gmail_remove_dots: false });
const otp = body('otp').isString().matches(/^\d{6}$/).withMessage('OTP must be 6 digits');
const password = body('password').isString().isLength({ min: 8, max: 64 }).withMessage('Password must be 8-64 characters');
module.exports = {
  login: [email(), body('password').isString().notEmpty().withMessage('Password is required'), body('role').optional().isIn(['SUPER_ADMIN', 'TPO', 'RECRUITER', 'STUDENT'])],
  verifyOtp: [email(), otp],
  resendOtp: [email(), body('purpose').optional().isIn(['LOGIN', 'ACTIVATE', 'RESET'])],
  email: [email()],
  activate: [email(), otp, password],
  reset: [email(), otp, password],
};
