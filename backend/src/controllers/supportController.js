const support = require('../services/supportService');
const { handle } = require('../utils/response');

module.exports = {
  create: handle((req) => support.create(req.user, req.body), 'Ticket raised', 201),
  list: handle((req) => support.list(req.user, req.query)),
  update: handle((req) => support.update(req.user, req.params.id, req.body), 'Ticket updated'),
};
