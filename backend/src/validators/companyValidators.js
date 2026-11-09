const { body } = require('express-validator');
module.exports = {
  sendOtp: [body('email').trim().isEmail()],
  register: [
    body('name').trim().notEmpty().withMessage('Company name is required'), body('industry').trim().notEmpty(), body('officialEmail').trim().isEmail().withMessage('Official email is required'),
    body('website').optional({ checkFalsy: true }).isURL().withMessage('Enter a valid website URL'), body('adminName').trim().notEmpty(), body('adminEmail').trim().isEmail(),
    body('password').isString().isLength({ min: 8, max: 64 }), body('otp').matches(/^\d{6}$/).withMessage('Enter the 6 digit OTP'),
  ],
  update: [body('website').optional({ checkFalsy: true }).isURL(), body('officialEmail').optional().trim().isEmail()],
  decision: [body('notes').optional().isString().isLength({ max: 500 }), body('reason').optional().isString().isLength({ max: 500 })],
  college: [body('tenantId').isMongoId()],
  collegeDecision: [body('notes').optional().isString().isLength({ max: 500 })],
};
