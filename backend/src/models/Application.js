const { Schema, model } = require('mongoose');
const { APPLICATION_STATUS } = require('../constants/applicationStatuses');

const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.APPLIED, index: true },
  appliedAt: { type: Date, default: Date.now },
  history: [{ from: String, to: String, by: Schema.Types.ObjectId, role: String, remarks: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
schema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = model('Application', schema);
