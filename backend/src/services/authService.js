const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Recruiter = require('../models/Recruiter');
const Company = require('../models/Company');
const Student = require('../models/Student');
const otp = require('./otpService');
const audit = require('./auditService');
const { signToken } = require('../utils/jwt');
const { hashPassword, comparePassword, isStrongPassword } = require('../utils/password');
const { AppError } = require('../utils/response');

const norm = (e) => String(e || '').trim().toLowerCase();
const mask = (email) => { const [u, d] = email.split('@'); return `${u[0]}${'*'.repeat(Math.min(Math.max(u.length - 1, 3), 8))}@${d}`; };
const WEAK = 'Password must be 8-64 characters with upper, lower, digit and special character';

async function assertLoginAllowed(user) {
  if (user.status === 'INVITED') throw new AppError(403, 'Account not activated yet. Use "Activate account" with your invitation email.');
  if (user.status !== 'ACTIVE') throw new AppError(403, 'This account is suspended or inactive');
  if (user.role === 'TPO' || user.role === 'STUDENT') {
    const t = await Tenant.findById(user.tenantId).select('status');
    if (!t || t.status !== 'ACTIVE') throw new AppError(403, 'Your college is not active on the platform');
  }
  if (user.role === 'RECRUITER') {
    const r = await Recruiter.findOne({ userId: user._id });
    if (!r || r.status !== 'ACTIVE') throw new AppError(403, 'Recruiter account is suspended or inactive');
    const c = await Company.findById(r.companyId).select('status');
    if (!c || c.status !== 'ACTIVE') throw new AppError(403, 'Company account is suspended or inactive');
  }
}

async function login({ email, password, role }, ctx) {
  email = norm(email);
  const user = await User.findOne({ email }).select('+passwordHash');
  const fail = async (reason) => {
    await audit.log({ ...ctx, actorId: user?._id, role: user?.role, tenantId: user?.tenantId }, 'LOGIN_FAILED', 'User', user?._id, { email, reason });
    throw new AppError(401, 'Invalid email, password or role');
  };
  if (!user || !user.passwordHash) return fail('unknown_or_inactive');
  if (role && user.role !== role) return fail('role_mismatch');
  if (!(await comparePassword(password, user.passwordHash))) return fail('bad_password');
  await assertLoginAllowed(user);
  const r = await otp.issue({ email, purpose: 'LOGIN', userId: user._id }, { ...ctx, role: user.role, tenantId: user.tenantId });
  return { otpRequired: true, maskedEmail: mask(email), ...r };
}

async function buildSession(user) {
  const session = { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId || null, status: user.status };
  if (user.tenantId) {
    const t = await Tenant.findById(user.tenantId).select('tenantCode collegeName').lean();
    if (t) session.tenant = { id: t._id, tenantCode: t.tenantCode, collegeName: t.collegeName };
  }
  if (user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: user._id }).select('branch graduationYear rollNo verificationStatus').lean();
    if (s) session.student = s;
  }
  if (user.role === 'RECRUITER') {
    const r = await Recruiter.findOne({ userId: user._id }).lean();
    if (r) {
      const c = await Company.findById(r.companyId).select('name companyCode verificationStatus status').lean();
      session.recruiter = { id: r._id, isCompanyAdmin: r.isCompanyAdmin, authorizationStatus: r.authorizationStatus, designation: r.designation };
      if (c) session.company = { id: c._id, name: c.name, companyCode: c.companyCode, verificationStatus: c.verificationStatus, status: c.status };
    }
  }
  return session;
}

async function verifyLogin({ email, otp: code }, ctx) {
  email = norm(email);
  const rec = await otp.verify({ email, purpose: 'LOGIN', code }, ctx);
  const user = await User.findById(rec.userId);
  if (!user) throw new AppError(401, 'Account not found');
  await assertLoginAllowed(user);
  user.lastLoginAt = new Date();
  await user.save();
  await audit.log({ ...ctx, actorId: user._id, role: user.role, tenantId: user.tenantId }, 'LOGIN', 'User', user._id, { email });
  return { token: signToken(user), user: await buildSession(user) };
}

async function resendOtp({ email, purpose = 'LOGIN' }, ctx) {
  email = norm(email);
  if (!['LOGIN', 'ACTIVATE', 'RESET'].includes(purpose)) throw new AppError(400, 'Invalid purpose');
  const user = await User.findOne({ email });
  if (user && ((purpose === 'LOGIN' && user.status === 'ACTIVE') || (purpose === 'ACTIVATE' && user.status === 'INVITED') || (purpose === 'RESET' && user.status === 'ACTIVE'))) {
    await otp.issue({ email, purpose, userId: user._id }, ctx);
  }
  return { sent: true }; // generic response: no account enumeration
}

async function requestActivation({ email }, ctx) {
  email = norm(email);
  const user = await User.findOne({ email });
  if (user && user.status === 'INVITED') await otp.issue({ email, purpose: 'ACTIVATE', userId: user._id }, ctx);
  return { sent: true };
}

async function activate({ email, otp: code, password }, ctx) {
  if (!isStrongPassword(password)) throw new AppError(422, WEAK);
  email = norm(email);
  const rec = await otp.verify({ email, purpose: 'ACTIVATE', code }, ctx);
  const user = await User.findById(rec.userId);
  if (!user || user.status !== 'INVITED') throw new AppError(400, 'Account cannot be activated');
  user.passwordHash = await hashPassword(password);
  user.status = 'ACTIVE';
  await user.save();
  await audit.log({ ...ctx, actorId: user._id, role: user.role, tenantId: user.tenantId }, 'ACCOUNT_ACTIVATED', 'User', user._id, { email });
  return { activated: true };
}

async function forgotPassword({ email }, ctx) {
  email = norm(email);
  const user = await User.findOne({ email });
  if (user && user.status === 'ACTIVE') await otp.issue({ email, purpose: 'RESET', userId: user._id }, ctx);
  return { sent: true };
}

async function resetPassword({ email, otp: code, password }, ctx) {
  if (!isStrongPassword(password)) throw new AppError(422, WEAK);
  email = norm(email);
  const rec = await otp.verify({ email, purpose: 'RESET', code }, ctx);
  const user = await User.findById(rec.userId);
  if (!user || user.status !== 'ACTIVE') throw new AppError(400, 'Password cannot be reset');
  user.passwordHash = await hashPassword(password);
  await user.save();
  await audit.log({ ...ctx, actorId: user._id, role: user.role, tenantId: user.tenantId }, 'PASSWORD_RESET', 'User', user._id, { email });
  return { reset: true };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(401, 'Account not found');
  return buildSession(user);
}

module.exports = { login, verifyLogin, resendOtp, requestActivation, activate, forgotPassword, resetPassword, me, buildSession };
