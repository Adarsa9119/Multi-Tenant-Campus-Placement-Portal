const offers = require('../services/offerService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  create: handle((req) => offers.create(req.user, req.body, ctx(req)), 'Offer created', 201),
  list: handle((req) => offers.list(req.user, req.query, ctx(req))),
  respond: handle((req) => offers.respond(req.user, req.params.id, { accept: req.body.accept === true || req.body.accept === 'true' }, ctx(req)), 'Response recorded'),
};
