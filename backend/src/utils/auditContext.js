// Builds the audit/security context from an Express request. Never trusts client-supplied identity.
module.exports = (req) => ({
  actorId: req.user ? req.user.id : null,
  role: req.user ? req.user.role : null,
  tenantId: req.user ? req.user.tenantId || null : null,
  ip: req.ip,
  userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
});
