const { Schema, model } = require('mongoose');
const { INTERVIEW_STAGE } = require('../constants/applicationStatuses');

const schema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
  stage: { type: String, enum: Object.values(INTERVIEW_STAGE), required: true },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ['ONLINE', 'ON_CAMPUS', 'VIRTUAL'], default: 'ONLINE' },
  location: String,
  result: { type: String, enum: ['PENDING', 'PASSED', 'FAILED'], default: 'PENDING' },
  notes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = model('Interview', schema);
