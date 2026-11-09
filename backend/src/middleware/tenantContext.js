const { AppError } = require('../utils/response');

// Tenant identity comes ONLY from the authenticated user. Client-supplied identity fields are stripped.
module.exports = (req, res, next) => {
  if (!req.user || !req.user.tenantId) return next(new AppError(403, 'Tenant context required'));
  req.tenantId = req.user.tenantId;
  ['tenantId', 'role', 'userId', 'companyId'].forEach((k) => {
    if (req.body && typeof req.body === 'object') delete req.body[k];
    if (req.query) delete req.query[k];
  });
  return next();
};
