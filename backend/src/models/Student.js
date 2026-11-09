const { Schema, model } = require('mongoose');
const { VERIFICATION_STATUS } = require('../constants/verificationStatuses');

const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, lowercase: true, required: true },
  phone: String,
  rollNo: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  branch: { type: String, required: true, uppercase: true },
  graduationYear: { type: Number, required: true },
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  backlogs: { type: Number, min: 0, default: 0 },
  tenthPercent: Number,
  twelfthPercent: Number,
  skills: [String],
  projects: [{ title: String, description: String, link: String }],
  certifications: [{ name: String, issuer: String, year: Number }],
  internships: [{ company: String, role: String, duration: String }],
  verificationStatus: { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING, index: true },
  verificationNotes: String,
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  resumeFileId: { type: Schema.Types.ObjectId, ref: 'FileAsset' },
  placementStatus: { type: String, enum: ['NOT_PLACED', 'PLACED'], default: 'NOT_PLACED' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
schema.index({ tenantId: 1, rollNo: 1 }, { unique: true });

module.exports = model('Student', schema);
