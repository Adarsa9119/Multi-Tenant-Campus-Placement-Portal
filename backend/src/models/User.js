const { Schema, model } = require('mongoose');
const { ROLES } = require('../constants/roles');
const { USER_STATUS } = require('../constants/userStatuses');

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: Object.values(ROLES), required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.INVITED },
  lastLoginAt: Date,
}, { timestamps: true });

module.exports = model('User', userSchema);
