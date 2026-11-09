const companies = require('../services/companyService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  sendOtp: handle((req) => companies.sendRegistrationOtp(req.body.email, ctx(req)), 'OTP request processed'),
  register: handle((req) => companies.register(req.body, ctx(req)), 'Company registered and pending verification', 201),
  list: handle((req) => companies.list(req.user, req.query)),
  me: handle((req) => companies.myCompany(req.user)),
  updateMe: handle((req) => companies.updateMyCompany(req.user, req.body, ctx(req)), 'Company profile updated'),
  verify: handle((req) => companies.setVerification(req.params.id, 'VERIFIED', req.user, ctx(req), { notes: req.body.notes, authorizeAdmin: req.body.authorizeAdmin === true }), 'Company verified'),
  reject: handle((req) => companies.setVerification(req.params.id, 'REJECTED', req.user, ctx(req), { notes: req.body.notes }), 'Company rejected'),
  review: handle((req) => companies.setVerification(req.params.id, 'UNDER_REVIEW', req.user, ctx(req), { notes: req.body.notes }), 'Company under review'),
  suspend: handle((req) => companies.suspend(req.params.id, ctx(req), req.body.reason), 'Company suspended'),
  reinstate: handle((req) => companies.reinstate(req.params.id, ctx(req)), 'Company reinstated'),
};
