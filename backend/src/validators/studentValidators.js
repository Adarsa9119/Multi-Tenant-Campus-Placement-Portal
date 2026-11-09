const { body } = require('express-validator');
const student = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('rollNo').trim().notEmpty().withMessage('Roll number is required'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
  body('graduationYear').isInt({ min: 2000, max: 2100 }).withMessage('Valid graduation year required'),
  body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('backlogs').optional().isInt({ min: 0 }).withMessage('Backlogs must be 0 or more'),
];
module.exports = {
  create: student,
  update: [body('cgpa').optional().isFloat({ min: 0, max: 10 }), body('backlogs').optional().isInt({ min: 0 }), body('graduationYear').optional().isInt({ min: 2000, max: 2100 })],
  verify: [body('status').isIn(['VERIFIED', 'REJECTED', 'DOCUMENT_ISSUE', 'UNDER_REVIEW']), body('notes').optional().isString().isLength({ max: 500 })],
  profile: [
    body('skills').optional().isArray({ max: 50 }), body('projects').optional().isArray({ max: 20 }), body('certifications').optional().isArray({ max: 20 }), body('internships').optional().isArray({ max: 20 }),
    body('cgpa').optional().isFloat({ min: 0, max: 10 }), body('backlogs').optional().isInt({ min: 0 }),
    body('tenthPercent').optional().isFloat({ min: 0, max: 100 }), body('twelfthPercent').optional().isFloat({ min: 0, max: 100 }), body('phone').optional().matches(/^\d{10}$/).withMessage('Enter a 10 digit mobile number'),
  ],
  department: [body('name').trim().notEmpty(), body('code').trim().notEmpty().isLength({ max: 10 })],
};
