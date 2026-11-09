const { body } = require('express-validator');
module.exports = {
  create: [body('name').trim().notEmpty(), body('email').isEmail(), body('phone').optional({ checkFalsy: true }).matches(/^\d{10}$/), body('designation').optional().isString(), body('companyId').optional().isMongoId()],
  authorizeForTenant: [body('recruiterId').isMongoId()],
  reason: [body('reason').optional().isString().isLength({ max: 500 })],
};
