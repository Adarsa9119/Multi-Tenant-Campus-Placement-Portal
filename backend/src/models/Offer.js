const { Schema, model } = require('mongoose');
const { OFFER_STATUS } = require('../constants/applicationStatuses');

const schema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  role: { type: String, required: true },
  package: { type: Number, required: true },
  joiningDate: Date,
  status: { type: String, enum: Object.values(OFFER_STATUS), default: OFFER_STATUS.OFFERED },
  respondedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = model('Offer', schema);
