const { Schema, model } = require('mongoose');
const { VERIFICATION_STATUS } = require('../constants/verificationStatuses');
const { COMPANY_STATUS } = require('../constants/companyStatuses');

const schema = new Schema({
  companyCode: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  registrationType: String,
  registrationNo: String,
  industry: String,
  description: String,
  website: String,
  officialEmail: { type: String, lowercase: true },
  phone: String,
  address: { line: String, city: String, state: String, country: { type: String, default: 'India' } },
  verificationStatus: { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING, index: true },
  status: { type: String, enum: Object.values(COMPANY_STATUS), default: COMPANY_STATUS.ACTIVE },
  reviewNotes: String,
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  suspendedReason: String,
}, { timestamps: true });

schema.statics.nextCode = async function nextCode() {
  let n = (await this.countDocuments()) + 1;
  for (;;) {
    const code = `COMP${String(n).padStart(3, '0')}`;
    if (!(await this.exists({ companyCode: code }))) return code;
    n += 1;
  }
};

module.exports = model('Company', schema);
