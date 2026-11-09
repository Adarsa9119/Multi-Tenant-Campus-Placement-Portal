const { Schema, model } = require('mongoose');
const { RECRUITER_STATUS, RECRUITER_AUTH_STATUS } = require('../constants/recruiterStatuses');

const schema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  designation: String,
  isCompanyAdmin: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(RECRUITER_STATUS), default: RECRUITER_STATUS.ACTIVE },
  authorizationStatus: { type: String, enum: Object.values(RECRUITER_AUTH_STATUS), default: RECRUITER_AUTH_STATUS.PENDING },
  authorizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  authorizedAt: Date,
  suspendedReason: String,
}, { timestamps: true });

module.exports = model('Recruiter', schema);
