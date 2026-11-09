const { Schema, model } = require('mongoose');
const { DRIVE_STATUS } = require('../constants/driveStatuses');

const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  recruiterIds: [{ type: Schema.Types.ObjectId, ref: 'Recruiter' }],
  title: { type: String, required: true, trim: true },
  description: String,
  package: { type: Number, required: true },
  location: String,
  criteria: {
    minCgpa: { type: Number, default: 0 },
    branches: [{ type: String, uppercase: true }],
    maxBacklogs: { type: Number, default: 0 },
    graduationYear: Number,
  },
  deadline: { type: Date, required: true },
  status: { type: String, enum: Object.values(DRIVE_STATUS), default: DRIVE_STATUS.DRAFT, index: true },
  statusBeforeSuspension: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = model('PlacementDrive', schema);
