const multer = require('multer');
const env = require('../config/env');
const { AppError } = require('../utils/response');

const memory = multer.memoryStorage();
const wrap = (mw) => (req, res, next) => mw(req, res, (err) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) return next(new AppError(400, err.code === 'LIMIT_FILE_SIZE' ? `File exceeds ${env.MAX_RESUME_MB} MB` : err.message));
  return next(err);
});
const resumeUpload = wrap(multer({ storage: memory, limits: { fileSize: env.MAX_RESUME_MB * 1024 * 1024, files: 1 } }).single('resume'));
const csvUpload = wrap(multer({ storage: memory, limits: { fileSize: 2 * 1024 * 1024, files: 1 } }).single('file'));
module.exports = { resumeUpload, csvUpload };
