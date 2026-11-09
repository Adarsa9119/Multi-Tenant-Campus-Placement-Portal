const { Schema, model } = require('mongoose');

const schema = new Schema({
  ticketNo: String,
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdByRole: String,
  scope: { type: String, enum: ['TENANT', 'PLATFORM'], default: 'TENANT' },
  subject: { type: String, required: true },
  issue: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  response: String,
}, { timestamps: true });

module.exports = model('SupportTicket', schema);
