const { body } = require('express-validator');
module.exports = {
  schedule: [body('applicationId').isMongoId(), body('stage').isIn(['TEST', 'INTERVIEW']), body('scheduledAt').isISO8601().withMessage('Valid date/time required'), body('mode').optional().isIn(['ONLINE', 'ON_CAMPUS', 'VIRTUAL']), body('location').optional().isString().isLength({ max: 200 })],
  update: [body('scheduledAt').optional().isISO8601(), body('mode').optional().isIn(['ONLINE', 'ON_CAMPUS', 'VIRTUAL'])],
  result: [body('result').isIn(['PASSED', 'FAILED']), body('notes').optional().isString().isLength({ max: 500 })],
};
