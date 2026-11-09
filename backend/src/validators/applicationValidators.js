const { body } = require('express-validator');
module.exports = {
  apply: [body('driveId').isMongoId().withMessage('Valid driveId required')],
  status: [body('status').isIn(['UNDER_REVIEW', 'SHORTLISTED', 'TEST', 'INTERVIEW', 'SELECTED', 'REJECTED']).withMessage('Invalid status'), body('remarks').optional().isString().isLength({ max: 300 })],
};
