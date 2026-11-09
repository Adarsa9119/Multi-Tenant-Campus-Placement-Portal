const crypto = require('crypto');
const path = require('path');
const env = require('../config/env');

const ALLOWED = {
  '.pdf': { mimes: ['application/pdf'], magic: (b) => b.slice(0, 4).toString() === '%PDF' },
  '.doc': { mimes: ['application/msword'], magic: (b) => b.slice(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0])) },
  '.docx': {
    mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    magic: (b) => b.slice(0, 2).toString() === 'PK',
  },
};
const maxBytes = () => env.MAX_RESUME_MB * 1024 * 1024;

// Returns null when valid, else an error message
const validateResume = (file) => {
  if (!file) return 'No file uploaded';
  const ext = path.extname(file.originalname || '').toLowerCase();
  const rule = ALLOWED[ext];
  if (!rule) return 'Only PDF, DOC and DOCX files are allowed';
  if (!rule.mimes.includes(file.mimetype)) return 'File type does not match its extension';
  if (file.size > maxBytes()) return `File exceeds ${env.MAX_RESUME_MB} MB`;
  if (!rule.magic(file.buffer)) return 'File content does not match its declared type';
  return null;
};
const randomKey = (ext) => `${crypto.randomBytes(24).toString('hex')}${ext}`;
const safeResolve = (...parts) => {
  const base = path.resolve(env.UPLOAD_DIR);
  const full = path.resolve(base, ...parts);
  if (!full.startsWith(base + path.sep)) throw new Error('Invalid storage path');
  return full;
};
module.exports = { validateResume, randomKey, safeResolve, ALLOWED };
