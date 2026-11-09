const { param, query } = require('express-validator');
module.exports = {
  applicationParam: [param('applicationId').isMongoId().withMessage('Invalid application id'), query('download').optional().isIn(['0', '1', 'true', 'false'])],
};
