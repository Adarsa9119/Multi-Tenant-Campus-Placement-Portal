const { body } = require('express-validator');
module.exports = {
  create: [body('applicationId').isMongoId(), body('role').optional().isString(), body('package').optional().isFloat({ min: 0 }), body('joiningDate').optional({ checkFalsy: true }).isISO8601()],
  respond: [body('accept').isBoolean().withMessage('accept must be true or false')],
};
