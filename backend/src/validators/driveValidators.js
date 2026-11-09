const { body } = require('express-validator');
const criteria = [
  body('criteria.minCgpa').isFloat({ min: 0, max: 10 }).withMessage('Minimum CGPA must be 0-10'),
  body('criteria.branches').isArray({ min: 1 }).withMessage('Select at least one branch'),
  body('criteria.maxBacklogs').optional().isInt({ min: 0 }), body('criteria.graduationYear').optional({ checkFalsy: true }).isInt({ min: 2000, max: 2100 }),
];
module.exports = {
  create: [body('companyId').isMongoId(), body('title').trim().notEmpty().withMessage('Role/title is required'), body('package').isFloat({ min: 0 }).withMessage('Package must be a number'),
    body('deadline').isISO8601().withMessage('Valid deadline required').custom((v) => new Date(v) > new Date()).withMessage('Deadline must be in the future'),
    body('recruiterIds').isArray({ min: 1 }).withMessage('Assign at least one recruiter'), body('recruiterIds.*').isMongoId(), ...criteria],
  update: [
    body('package').optional().isFloat({ min: 0 }),
    body('deadline').optional().isISO8601(),
    body('recruiterIds').optional().isArray({ min: 1 }),
    body('criteria.minCgpa').optional().isFloat({ min: 0, max: 10 }),
    body('criteria.branches').optional().isArray({ min: 1 }),
    body('criteria.maxBacklogs').optional().isInt({ min: 0 }),
    body('criteria.graduationYear').optional({ checkFalsy: true }).isInt({ min: 2000, max: 2100 }),
  ],
};
