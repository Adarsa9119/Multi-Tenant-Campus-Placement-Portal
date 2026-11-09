const audit = require('../services/auditService');
const auditContext = require('../utils/auditContext');
const { AppError, asyncHandler } = require('../utils/response');

// Loads the addressed resource and verifies it belongs to the caller's tenant (object-ID manipulation guard).
module.exports = (Model, { param = 'id', name = 'Resource', tenantField = 'tenantId' } = {}) => asyncHandler(async (req, res, next) => {
  const doc = await Model.findById(req.params[param]);
  if (!doc) throw new AppError(404, `${name} not found`);
  if (!req.user.tenantId || String(doc[tenantField]) !== String(req.user.tenantId)) {
    await audit.log(auditContext(req), 'CROSS_TENANT_ACCESS_ATTEMPT', name, doc._id, { requestedTenant: String(doc[tenantField]) });
    throw new AppError(403, 'Access denied');
  }
  req.resource = doc;
  next();
});
