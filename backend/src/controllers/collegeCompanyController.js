const companies = require('../services/companyService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  list: handle((req) => companies.listApprovals(req.user, req.query)),
  request: handle((req) => companies.requestCollege(req.user, req.body, ctx(req)), 'Authorization requested', 201),
  decide: (status) => handle((req) => companies.decide(req.user, req.params.companyId, status, req.body.notes, ctx(req)), `Company ${status.toLowerCase()}`),
};
