const { Schema, model } = require('mongoose');
const { TENANT_AUTH_STATUS } = require('../constants/recruiterStatuses');

const schema = new Schema({
  recruiterId: { type: Schema.Types.ObjectId, ref: 'Recruiter', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  status: { type: String, enum: Object.values(TENANT_AUTH_STATUS), default: TENANT_AUTH_STATUS.ACTIVE },
  authorizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  authorizedAt: { type: Date, default: Date.now },
}, { timestamps: true });
schema.index({ recruiterId: 1, tenantId: 1 }, { unique: true });

module.exports = model('RecruiterAuthorization', schema);
