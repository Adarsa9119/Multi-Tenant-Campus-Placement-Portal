const { body } = require('express-validator');
const req = (f, m) => body(f).trim().notEmpty().withMessage(m || `${f} is required`);
const phone = (f) => body(f).matches(/^\d{10}$/).withMessage('Enter a 10 digit mobile number');
const mail = (f) => body(f).trim().isEmail().withMessage('A valid email is required');
module.exports = {
  sendOtp: [mail('email')],
  register: [
    req('collegeName', 'College name is required'), req('affiliation'), req('collegeType'), mail('officialEmail'), req('address'), req('city'), req('state'),
    body('pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'), req('contactName'), mail('contactEmail'), phone('contactPhone'), req('contactDesignation'),
    req('tpoName'), mail('tpoEmail'), phone('tpoPhone'), body('otp').matches(/^\d{6}$/).withMessage('Enter the 6 digit OTP'),
    body('confirm').equals('true').withMessage('Please confirm the declaration').customSanitizer((v) => String(v)),
  ],
  decision: [body('notes').optional().isString().isLength({ max: 500 })],
  tpoInvite: [body('tenantId').isMongoId(), body('name').trim().notEmpty(), body('email').isEmail(), body('phone').optional().matches(/^\d{10}$/)],
  adminInvite: [body('name').trim().notEmpty(), body('email').isEmail()],
  status: [body('status').isIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])],
};
