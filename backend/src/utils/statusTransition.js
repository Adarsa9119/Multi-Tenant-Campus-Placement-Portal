const { TRANSITIONS } = require('../constants/applicationStatuses');
const { AppError } = require('./response');

const canTransition = (from, to) => (TRANSITIONS[from] || []).includes(to);
const assertTransition = (from, to) => {
  if (!canTransition(from, to)) throw new AppError(409, `Invalid status transition: ${from} -> ${to}`);
};
module.exports = { canTransition, assertTransition };
