const { body } = require('express-validator');
module.exports = {
  create: [body('subject').trim().isLength({ min: 3, max: 150 }).withMessage('Subject is required (3-150 chars)'), body('issue').trim().isLength({ min: 5, max: 2000 }).withMessage('Describe the issue (5-2000 chars)')],
  update: [body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']), body('response').optional().isString().isLength({ max: 2000 }), body('escalate').optional().isBoolean()],
};
