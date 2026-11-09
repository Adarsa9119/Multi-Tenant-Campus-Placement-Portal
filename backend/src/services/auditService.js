const AuditLog = require('../models/AuditLog');
const alerts = require('./securityAlertService');
const { paginate, escapeRegex } = require('../utils/pagination');

// Never throws: auditing must not break the business operation.
async function log(ctx = {}, action, resourceType, resourceId, metadata = {}) {
  try {
    await AuditLog.create({
      actorId: ctx.actorId || undefined, role: ctx.role, tenantId: ctx.tenantId || undefined, action, resourceType,
      resourceId: resourceId ? String(resourceId) : undefined, ip: ctx.ip, userAgent: ctx.userAgent, metadata,
    });
    await alerts.evaluate(action, ctx, metadata);
  } catch (e) {
    console.error('audit failed:', e.message);
  }
}

async function list(user, q = {}) {
  const filter = {};
  if (user.role === 'TPO') filter.tenantId = user.tenantId; // TPO sees only own tenant
  if (q.action) filter.action = q.action;
  if (q.role) filter.role = q.role;
  if (q.search) filter.$or = [{ action: new RegExp(escapeRegex(q.search), 'i') }, { resourceType: new RegExp(escapeRegex(q.search), 'i') }];
  return paginate(AuditLog, filter, q, { sort: { timestamp: -1 }, populate: { path: 'actorId', select: 'name email' } });
}

module.exports = { log, list };
