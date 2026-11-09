const { Schema, model } = require('mongoose');

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  type: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('Notification', schema);
