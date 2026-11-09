const { Schema, model } = require('mongoose');

const schema = new Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  purpose: { type: String, enum: ['LOGIN', 'ACTIVATE', 'RESET', 'COLLEGE_REGISTRATION', 'COMPANY_REGISTRATION'], required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  status: { type: String, enum: ['PENDING', 'USED', 'EXPIRED', 'LOCKED', 'REPLACED'], default: 'PENDING' },
}, { timestamps: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = model('Otp', schema);
