const ras = require('../services/recruiterAuthorizationService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  list: handle((req) => ras.list(req.user, req.query)),
  authorize: handle((req) => ras.authorizeForTenant(req.user, req.body.recruiterId, ctx(req)), 'Recruiter authorized for your college', 201),
  revoke: handle((req) => ras.revoke(req.user, req.params.id, ctx(req)), 'Authorization revoked'),
};
