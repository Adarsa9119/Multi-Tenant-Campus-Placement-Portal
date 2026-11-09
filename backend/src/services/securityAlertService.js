const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const { paginate } = require('../utils/pagination');
const { AppError } = require('../utils/response');
const notifications = require('./notificationService');

// Rule-based (deterministic) detection. No AI/ML.
const RULES = {
  LOGIN_FAILED: { type: 'MULTIPLE_FAILED_LOGINS', threshold: 5, windowMin: 15, severity: 'HIGH', by: 'email' },
  OTP_FAILED: { type: 'SUSPICIOUS_OTP_ACTIVITY', threshold: 5, windowMin: 15, severity: 'MEDIUM', by: 'email' },
  DOWNLOAD_RESUME: { type: 'ABNORMAL_RESUME_DOWNLOADS', threshold: 20, windowMin: 10, severity: 'HIGH', by: 'actor' },
  VIEW_STUDENT: { type: 'BULK_STUDENT_ACCESS', threshold: 50, windowMin: 10, severity: 'MEDIUM', by: 'actor' },
  AUTHORIZATION_DENIED: { type: 'REPEATED_UNAUTHORIZED_REQUESTS', threshold: 5, windowMin: 10, severity: 'MEDIUM', by: 'actor' },
  CROSS_TENANT_ACCESS_ATTEMPT: { type: 'CROSS_TENANT_ACCESS', threshold: 1, windowMin: 10, severity: 'HIGH', by: 'actor' },
};

async function raise({ eventType, severity, actorId, tenantId, details = {} }) {
  const since = new Date(Date.now() - 30 * 60 * 1000);
  const key = actorId ? { actorId } : { 'details.email': details.email };
  const existing = await SecurityAlert.findOne({ eventType, status: { $in: ['OPEN', 'INVESTIGATING'] }, createdAt: { $gte: since }, ...key });
  if (existing) {
    existing.details = { ...existing.details, ...details, count: (existing.details?.count || 1) + 1 };
    existing.markModified('details');
    await existing.save();
    return existing;
  }
  const alert = await SecurityAlert.create({ eventType, severity, actorId, tenantId, details: { ...details, count: 1 } });
  await notifications.notifyAdmins({ type: 'SECURITY_ALERT', message: `Security alert: ${eventType.replace(/_/g, ' ').toLowerCase()}`, link: '/admin/security-alerts' });
  if (tenantId) await notifications.notifyTpos(tenantId, { type: 'SECURITY_ALERT', message: `Security alert: ${eventType.replace(/_/g, ' ').toLowerCase()}`, link: '/tpo/dashboard' });
  return alert;
}

async function evaluate(action, ctx = {}, metadata = {}) {
  const rule = RULES[action];
  if (!rule) return null;
  const since = new Date(Date.now() - rule.windowMin * 60 * 1000);
  const filter = { action, timestamp: { $gte: since } };
  if (rule.by === 'email') {
    if (!metadata.email) return null;
    filter['metadata.email'] = metadata.email;
  } else {
    if (!ctx.actorId) return null;
    filter.actorId = ctx.actorId;
  }
  const count = await AuditLog.countDocuments(filter);
  if (count < rule.threshold) return null;
  return raise({
    eventType: rule.type, severity: rule.severity, actorId: ctx.actorId || undefined, tenantId: ctx.tenantId || undefined,
    details: { email: metadata.email, window: `${rule.windowMin}m`, occurrences: count, ip: ctx.ip },
  });
}

async function list(user, q = {}) {
  const filter = {};
  if (user.role === 'TPO') filter.tenantId = user.tenantId;
  if (q.status) filter.status = q.status;
  if (q.severity) filter.severity = q.severity;
  return paginate(SecurityAlert, filter, q, { populate: { path: 'actorId', select: 'name email role' } });
}
async function updateStatus(user, id, status) {
  if (!['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) throw new AppError(400, 'Invalid status');
  const filter = { _id: id };
  if (user.role === 'TPO') filter.tenantId = user.tenantId;
  const alert = await SecurityAlert.findOne(filter);
  if (!alert) throw new AppError(404, 'Alert not found');
  alert.status = status;
  if (status === 'RESOLVED') { alert.resolvedBy = user.id; alert.resolvedAt = new Date(); }
  await alert.save();
  return alert;
}

module.exports = { raise, evaluate, list, updateStatus, RULES };
