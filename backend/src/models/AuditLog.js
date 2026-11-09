const { Schema, model } = require('mongoose');

const schema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  role: String,
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  action: { type: String, required: true, index: true },
  resourceType: String,
  resourceId: String,
  ip: String,
  userAgent: String,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = model('AuditLog', schema);
