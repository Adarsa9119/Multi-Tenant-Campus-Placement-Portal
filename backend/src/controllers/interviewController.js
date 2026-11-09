const iv = require('../services/interviewService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  schedule: handle((req) => iv.schedule(req.user, req.body, ctx(req)), 'Scheduled', 201),
  list: handle((req) => iv.list(req.user, req.query, ctx(req))),
  update: handle((req) => iv.update(req.user, req.params.id, req.body, ctx(req)), 'Updated'),
  result: handle((req) => iv.setResult(req.user, req.params.id, req.body, ctx(req)), 'Result recorded'),
};
