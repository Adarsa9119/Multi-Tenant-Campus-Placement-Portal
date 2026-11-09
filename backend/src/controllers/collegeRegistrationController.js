const tenants = require('../services/tenantService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  sendOtp: handle((req) => tenants.sendRegistrationOtp(req.body.email, ctx(req)), 'OTP request processed'),
  submit: handle((req) => tenants.submitRegistration(req.body, ctx(req)), 'Registration submitted for review', 201),
  publicSettings: handle(async () => { const s = await tenants.getSettings(); return { allowCollegeRegistration: s.allowCollegeRegistration, announcement: s.announcement }; }),
};
