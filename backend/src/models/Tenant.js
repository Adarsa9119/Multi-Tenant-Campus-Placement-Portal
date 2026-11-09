const { Schema, model } = require('mongoose');
const { TENANT_STATUS } = require('../constants/tenantStatuses');

const tenantSchema = new Schema({
  tenantCode: { type: String, required: true, unique: true },
  collegeName: { type: String, required: true, trim: true },
  code: String,
  affiliation: String,
  collegeType: String,
  officialEmail: { type: String, lowercase: true },
  website: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  contact: { name: String, email: String, phone: String, designation: String },
  status: { type: String, enum: Object.values(TENANT_STATUS), default: TENANT_STATUS.ACTIVE },
  registrationId: { type: Schema.Types.ObjectId, ref: 'CollegeRegistration' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// TEN001, TEN002, ...
tenantSchema.statics.nextCode = async function nextCode() {
  let n = (await this.countDocuments()) + 1;
  for (;;) {
    const code = `TEN${String(n).padStart(3, '0')}`;
    if (!(await this.exists({ tenantCode: code }))) return code;
    n += 1;
  }
};

module.exports = model('Tenant', tenantSchema);
