const Recruiter = require('../models/Recruiter');
const RecruiterAuthorization = require('../models/RecruiterAuthorization');
const Company = require('../models/Company');
const CollegeCompanyApproval = require('../models/CollegeCompanyApproval');
const User = require('../models/User');
const mail = require('./mailService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

const norm = (e) => String(e || '').trim().toLowerCase();

async function list(user, q) {
  const filter = {};
  if (q.authorizationStatus) filter.authorizationStatus = q.authorizationStatus;
  if (q.status) filter.status = q.status;
  const populate = [{ path: 'userId', select: 'name email phone status createdAt' }, { path: 'companyId', select: 'name companyCode verificationStatus status' }];
  if (user.role === 'RECRUITER') {
    const me = await Recruiter.findOne({ userId: user.id });
    if (!me || !me.isCompanyAdmin) throw new AppError(403, 'Only the company admin can view the team');
    filter.companyId = me.companyId;
  }
  if (user.role === 'TPO') {
    const approved = await CollegeCompanyApproval.find({ tenantId: user.tenantId, status: 'APPROVED' }).select('companyId').lean();
    filter.companyId = { $in: approved.map((a) => a.companyId) };
    filter.authorizationStatus = 'AUTHORIZED';
    filter.status = 'ACTIVE';
    const out = await paginate(Recruiter, filter, q, { populate });
    const auths = await RecruiterAuthorization.find({ tenantId: user.tenantId, recruiterId: { $in: out.items.map((r) => r._id) } }).lean();
    out.items = out.items.map((r) => { const a = auths.find((x) => String(x.recruiterId) === String(r._id)); return { ...r, collegeAuthorization: a?.status || 'NONE', collegeAuthorizationId: a?._id }; });
    return out;
  }
  if (q.companyId && user.role === 'SUPER_ADMIN') filter.companyId = q.companyId;
  return paginate(Recruiter, filter, q, { populate });
}

async function create(user, b, ctx) {
  let companyId;
  if (user.role === 'SUPER_ADMIN') companyId = b.companyId;
  else {
    const me = await Recruiter.findOne({ userId: user.id });
    if (!me || !me.isCompanyAdmin) throw new AppError(403, 'Only the company admin can add recruiters');
    companyId = me.companyId; // never taken from the client
  }
  const company = await Company.findById(companyId);
  if (!company) throw new AppError(404, 'Company not found');
  if (company.status !== 'ACTIVE') throw new AppError(403, 'Company is not active');
  const email = norm(b.email);
  if (await User.exists({ email })) throw new AppError(409, 'Email already in use');
  const u = await User.create({ name: b.name, email, phone: b.phone, role: 'RECRUITER', status: 'INVITED' });
  const r = await Recruiter.create({ companyId, userId: u._id, designation: b.designation, authorizationStatus: 'PENDING' });
  await mail.sendInvitation(email, u.name, 'RECRUITER');
  await notify.notifyAdmins({ type: 'RECRUITER_REQUEST', message: `New recruiter registration: ${u.name} (${company.name})`, link: '/admin/recruiters' });
  await audit.log(ctx, 'CREATE_RECRUITER', 'Recruiter', r._id, { company: company.name });
  return r;
}

async function authorize(id, admin, ctx) {
  const r = await Recruiter.findById(id);
  if (!r) throw new AppError(404, 'Recruiter not found');
  const c = await Company.findById(r.companyId);
  if (!c || c.verificationStatus !== 'VERIFIED') throw new AppError(409, 'Company must be verified before authorizing recruiters');
  if (r.status !== 'ACTIVE') throw new AppError(409, 'Recruiter is not active');
  Object.assign(r, { authorizationStatus: 'AUTHORIZED', authorizedBy: admin.id, authorizedAt: new Date() });
  await r.save();
  await notify.notify(r.userId, { type: 'RECRUITER_AUTHORIZED', message: 'You have been authorized as a recruiter', link: '/recruiter/dashboard' });
  await audit.log(ctx, 'AUTHORIZE_RECRUITER', 'Recruiter', r._id, {});
  return r;
}
async function suspend(id, ctx, reason) {
  const r = await Recruiter.findById(id);
  if (!r) throw new AppError(404, 'Recruiter not found');
  r.status = 'SUSPENDED';
  r.suspendedReason = reason;
  await r.save();
  await User.updateOne({ _id: r.userId }, { status: 'SUSPENDED' });
  await audit.log(ctx, 'SUSPEND_RECRUITER', 'Recruiter', r._id, { reason });
  return r;
}
async function reinstate(id, ctx) {
  const r = await Recruiter.findById(id);
  if (!r) throw new AppError(404, 'Recruiter not found');
  r.status = 'ACTIVE';
  r.suspendedReason = undefined;
  await r.save();
  await User.updateOne({ _id: r.userId, status: 'SUSPENDED' }, { status: 'ACTIVE' });
  await audit.log(ctx, 'REINSTATE_RECRUITER', 'Recruiter', r._id, {});
  return r;
}

module.exports = { list, create, authorize, suspend, reinstate };
