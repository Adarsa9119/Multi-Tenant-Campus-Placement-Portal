const { Schema, model } = require('mongoose');
const { ALERT_SEVERITY, ALERT_STATUS } = require('../constants/alertTypes');

const schema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  eventType: { type: String, required: true, index: true },
  severity: { type: String, enum: Object.values(ALERT_SEVERITY), default: ALERT_SEVERITY.MEDIUM },
  status: { type: String, enum: Object.values(ALERT_STATUS), default: ALERT_STATUS.OPEN, index: true },
  details: Schema.Types.Mixed,
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
}, { timestamps: true });

module.exports = model('SecurityAlert', schema);
