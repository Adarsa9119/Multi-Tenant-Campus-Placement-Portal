const { Schema, model } = require('mongoose');

// Metadata for a protected file. The storage key is random and never exposed as a public URL.
const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  kind: { type: String, default: 'RESUME' },
  storageKey: { type: String, required: true },
  originalName: String,
  mimeType: String,
  size: Number,
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = model('FileAsset', schema);
