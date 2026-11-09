const { validationResult } = require('express-validator');
const { AppError } = require('../utils/response');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(new AppError(422, details[0].message, details));
};
