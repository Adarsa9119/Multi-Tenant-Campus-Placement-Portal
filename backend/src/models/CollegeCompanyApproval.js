const { Schema, model } = require('mongoose');
const { COLLEGE_COMPANY_STATUS } = require('../constants/companyStatuses');

const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: Object.values(COLLEGE_COMPANY_STATUS), default: COLLEGE_COMPANY_STATUS.REQUESTED },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedAt: Date,
  notes: String,
}, { timestamps: true });
schema.index({ tenantId: 1, companyId: 1 }, { unique: true });

module.exports = model('CollegeCompanyApproval', schema);
