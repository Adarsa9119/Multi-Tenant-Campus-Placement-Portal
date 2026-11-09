const { Schema, model } = require('mongoose');
const { REGISTRATION_STATUS } = require('../constants/tenantStatuses');

const person = { name: String, email: { type: String, lowercase: true }, phone: String, designation: String };
const schema = new Schema({
  collegeName: { type: String, required: true, trim: true },
  collegeCode: String,
  affiliation: { type: String, required: true },
  collegeType: { type: String, required: true },
  officialEmail: { type: String, required: true, lowercase: true, index: true },
  website: String,
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  contact: person,
  proposedTpo: person,
  emailVerified: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(REGISTRATION_STATUS), default: REGISTRATION_STATUS.PENDING, index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  reviewNotes: String,
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
}, { timestamps: true });

module.exports = model('CollegeRegistration', schema);
