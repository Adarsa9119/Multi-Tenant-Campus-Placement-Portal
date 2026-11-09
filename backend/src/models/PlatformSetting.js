const { Schema, model } = require('mongoose');

const schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
}, { timestamps: true });

module.exports = model('PlatformSetting', schema);
