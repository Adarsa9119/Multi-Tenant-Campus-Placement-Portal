const drives = require('../services/driveService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  create: handle((req) => drives.create(req.user, req.body, ctx(req)), 'Drive created', 201),
  list: handle((req) => drives.list(req.user, req.query, ctx(req))),
  get: handle((req) => drives.get(req.user, req.params.id, ctx(req))),
  update: handle((req) => drives.update(req.user, req.params.id, req.body, ctx(req)), 'Drive updated'),
  approve: handle((req) => drives.approve(req.user, req.params.id, ctx(req)), 'Drive approved'),
  publish: handle((req) => drives.publish(req.user, req.params.id, ctx(req)), 'Drive published'),
  close: handle((req) => drives.close(req.user, req.params.id, ctx(req)), 'Drive closed'),
  suspend: handle((req) => drives.suspend(req.user, req.params.id, ctx(req)), 'Drive suspended'),
};
