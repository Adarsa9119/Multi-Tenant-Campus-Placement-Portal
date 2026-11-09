const auth = require('../services/authService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  login: handle((req) => auth.login(req.body, ctx(req)), 'OTP request processed'),
  verifyOtp: handle((req) => auth.verifyLogin(req.body, ctx(req)), 'Login successful'),
  resendOtp: handle((req) => auth.resendOtp(req.body, ctx(req)), 'If the account exists, a new OTP was sent'),
  requestActivation: handle((req) => auth.requestActivation(req.body, ctx(req)), 'If an invitation exists, an OTP was sent'),
  activate: handle((req) => auth.activate(req.body, ctx(req)), 'Account activated'),
  forgotPassword: handle((req) => auth.forgotPassword(req.body, ctx(req)), 'If the account exists, an OTP was sent'),
  resetPassword: handle((req) => auth.resetPassword(req.body, ctx(req)), 'Password reset'),
  me: handle((req) => auth.me(req.user.id)),
};
