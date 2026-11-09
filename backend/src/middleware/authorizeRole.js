const audit = require('../services/auditService');
const auditContext = require('../utils/auditContext');
const { AppError, asyncHandler } = require('../utils/response');

module.exports = (...roles) => asyncHandler(async (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    await audit.log(auditContext(req), 'AUTHORIZATION_DENIED', 'Route', req.originalUrl.split('?')[0], { reason: 'role_not_permitted', method: req.method });
    throw new AppError(403, 'You do not have permission to perform this action');
  }
  next();
});
