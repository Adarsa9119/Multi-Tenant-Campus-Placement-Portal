const apps = require('../services/applicationService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  apply: handle((req) => apps.apply(req.user, req.body.driveId, ctx(req)), 'Application submitted', 201),
  list: handle((req) => apps.list(req.user, req.query, ctx(req))),
  get: handle((req) => apps.get(req.user, req.params.id, ctx(req))),
  changeStatus: handle((req) => apps.changeStatus(req.user, req.params.id, req.body, ctx(req)), 'Status updated'),
};
