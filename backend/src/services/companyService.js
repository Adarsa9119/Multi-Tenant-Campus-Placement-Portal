const Company = require('../models/Company');
const User = require('../models/User');
const Recruiter = require('../models/Recruiter');
const Tenant = require('../models/Tenant');
const PlacementDrive = require('../models/PlacementDrive');
const CollegeCompanyApproval = require('../models/CollegeCompanyApproval');
const otp = require('./otpService');
const notify = require('./notificationService');
const audit = require('./auditService');
const mail = require('./mailService');
const { hashPassword, isStrongPassword } = require('../utils/password');
const { AppError } = require('../utils/response');
const { paginate, escapeRegex } = require('../utils/pagination');

const norm = (e) => String(e || '').trim().toLowerCase();
const sendRegistrationOtp = (email, ctx) => otp.issue({ email, purpose: 'COMPANY_REGISTRATION' }, ctx);

async function pauseCompanyDrives(companyId) {
  const drives = await PlacementDrive.find({ companyId, status: { $in: ['APPROVED', 'PUBLISHED'] } });
  for (const drive of drives) {
    drive.statusBeforeSuspension = drive.status;
    drive.status = 'SUSPENDED';
    await drive.save();
  }
  return drives;
}

async function restoreCompanyDrives(companyId) {
  const drives = await PlacementDrive.find({ companyId, status: 'SUSPENDED', statusBeforeSuspension: { $in: ['APPROVED', 'PUBLISHED'] } });
  for (const drive of drives) {
    const expiredPublishedDrive = drive.statusBeforeSuspension === 'PUBLISHED' && drive.deadline <= new Date();
    drive.status = expiredPublishedDrive ? 'CLOSED' : drive.statusBeforeSuspension;
    drive.statusBeforeSuspension = undefined;
    await drive.save();
  }
  return drives;
}

async function syncCompanyDrives(company) {
  if (company.status === 'ACTIVE' && company.verificationStatus === 'VERIFIED') return restoreCompanyDrives(company._id);
  return pauseCompanyDrives(company._id);
}

// Public company registration: creates the company (PENDING) and its first (company admin) recruiter account.
async function register(b, ctx) {
  if (!isStrongPassword(b.password)) throw new AppError(422, 'Password must be 8-64 characters with upper, lower, digit and special character');
  await otp.verify({ email: b.adminEmail, purpose: 'COMPANY_REGISTRATION', code: b.otp }, ctx);
  const email = norm(b.adminEmail);
  if (await User.exists({ email })) throw new AppError(409, 'Email already in use');
  const company = await Company.create({
    companyCode: await Company.nextCode(), name: b.name, registrationType: b.registrationType, registrationNo: b.registrationNo, industry: b.industry,
    description: b.description, website: b.website, officialEmail: norm(b.officialEmail), phone: b.phone,
    address: { line: b.addressLine, city: b.city, state: b.state, country: b.country || 'India' },
  });
  const user = await User.create({ name: b.adminName, email, phone: b.adminPhone, role: 'RECRUITER', status: 'ACTIVE', passwordHash: await hashPassword(b.password) });
  await Recruiter.create({ companyId: company._id, userId: user._id, designation: b.designation || 'Company Admin', isCompanyAdmin: true });
  await audit.log({ ...ctx, actorId: user._id, role: 'RECRUITER' }, 'REGISTER_COMPANY', 'Company', company._id, { name: company.name });
  await notify.notifyAdmins({ type: 'COMPANY_VERIFICATION', message: `Company verification request: ${company.name}`, link: '/admin/companies' });
  return { companyId: company._id, status: company.verificationStatus };
}

async function list(user, q) {
  const filter = {};
  if (q.verificationStatus) filter.verificationStatus = q.verificationStatus;
  if (q.status) filter.status = q.status;
  if (q.search) filter.name = new RegExp(escapeRegex(q.search), 'i');
  if (user.role === 'TPO') {
    filter.verificationStatus = 'VERIFIED';
    const out = await paginate(Company, filter, q, { sort: { name: 1 } });
    const approvals = await CollegeCompanyApproval.find({ tenantId: user.tenantId, companyId: { $in: out.items.map((c) => c._id) } }).lean();
    const recs = await Recruiter.aggregate([{ $match: { companyId: { $in: out.items.map((c) => c._id) } } }, { $group: { _id: '$companyId', n: { $sum: 1 } } }]);
    out.items = out.items.map((c) => ({
      ...c,
      collegeApproval: approvals.find((a) => String(a.companyId) === String(c._id))?.status || 'NONE',
      recruiterCount: recs.find((r) => String(r._id) === String(c._id))?.n || 0,
    }));
    return out;
  }
  if (user.role === 'RECRUITER') {
    const r = await Recruiter.findOne({ userId: user.id });
    filter._id = r?.companyId;
  }
  return paginate(Company, filter, q);
}

async function myCompany(user) {
  const r = await Recruiter.findOne({ userId: user.id }).lean();
  if (!r) throw new AppError(404, 'Recruiter profile not found');
  const company = await Company.findById(r.companyId).populate('verifiedBy', 'name').lean();
  return { ...company, isCompanyAdmin: r.isCompanyAdmin, recruiterAuthorization: r.authorizationStatus };
}
async function updateMyCompany(user, b, ctx) {
  const r = await Recruiter.findOne({ userId: user.id });
  if (!r || !r.isCompanyAdmin) throw new AppError(403, 'Only the company admin can edit the company profile');
  const c = await Company.findById(r.companyId);
  ['name', 'registrationType', 'registrationNo', 'industry', 'description', 'website', 'officialEmail', 'phone'].forEach((k) => { if (b[k] !== undefined) c[k] = b[k]; });
  if (b.address) c.address = { ...c.address.toObject?.(), ...b.address };
  // Material identity changes put the company back into review.
  if (b.name !== undefined || b.registrationNo !== undefined) c.verificationStatus = c.verificationStatus === 'VERIFIED' ? 'UNDER_REVIEW' : c.verificationStatus;
  await c.save();
  await audit.log(ctx, 'REGISTER_COMPANY', 'Company', c._id, { updated: true });
  return c;
}

async function setVerification(id, status, admin, ctx, { notes, authorizeAdmin } = {}) {
  const c = await Company.findById(id);
  if (!c) throw new AppError(404, 'Company not found');
  if (!['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) throw new AppError(400, 'Invalid status');
  Object.assign(c, { verificationStatus: status, reviewNotes: notes, verifiedBy: admin.id, verifiedAt: new Date() });
  await c.save();
  const affectedDrives = await syncCompanyDrives(c);
  if (status === 'VERIFIED' && authorizeAdmin) {
    await Recruiter.updateMany({ companyId: c._id, isCompanyAdmin: true, status: 'ACTIVE' }, { authorizationStatus: 'AUTHORIZED', authorizedBy: admin.id, authorizedAt: new Date() });
  }
  const recs = await Recruiter.find({ companyId: c._id, isCompanyAdmin: true }).lean();
  await notify.notifyMany(recs.map((r) => r.userId), { type: 'COMPANY_VERIFICATION', message: `Your company verification is now ${status.replace('_', ' ').toLowerCase()}`, link: '/recruiter/company' });
  await audit.log(ctx, status === 'REJECTED' ? 'REJECT_COMPANY' : 'VERIFY_COMPANY', 'Company', c._id, { status, notes, drivesAffected: affectedDrives.length });
  return c;
}

async function suspend(id, ctx, reason) {
  const c = await Company.findById(id);
  if (!c) throw new AppError(404, 'Company not found');
  c.status = 'SUSPENDED';
  c.suspendedReason = reason;
  await c.save();
  const drives = await syncCompanyDrives(c);
  for (const tenantId of [...new Set(drives.map((d) => String(d.tenantId)))]) {
    await notify.notifyTpos(tenantId, { type: 'COMPANY_SUSPENDED', message: `${c.name} has been suspended; its drives are paused`, link: '/tpo/drives' });
  }
  await audit.log(ctx, 'SUSPEND_COMPANY', 'Company', c._id, { reason, drivesSuspended: drives.length });
  return c;
}
async function reinstate(id, ctx) {
  const c = await Company.findById(id);
  if (!c) throw new AppError(404, 'Company not found');
  c.status = 'ACTIVE';
  c.suspendedReason = undefined;
  await c.save();
  const drives = await syncCompanyDrives(c);
  await audit.log(ctx, 'REINSTATE_COMPANY', 'Company', c._id, {});
  return c;
}

// ---------- College <-> company recruitment authorization ----------
async function requestCollege(user, { tenantId }, ctx) {
  const r = await Recruiter.findOne({ userId: user.id });
  if (!r || !r.isCompanyAdmin) throw new AppError(403, 'Only the company admin can request college authorization');
  const [company, tenant] = await Promise.all([Company.findById(r.companyId), Tenant.findById(tenantId)]);
  if (!company || company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE') throw new AppError(403, 'Company must be verified and active');
  if (!tenant || tenant.status !== 'ACTIVE') throw new AppError(404, 'College not found');
  let a = await CollegeCompanyApproval.findOne({ tenantId, companyId: company._id });
  if (a && ['APPROVED', 'REQUESTED'].includes(a.status)) throw new AppError(409, `Request already ${a.status.toLowerCase()}`);
  if (!a) a = new CollegeCompanyApproval({ tenantId, companyId: company._id });
  Object.assign(a, { status: 'REQUESTED', requestedBy: user.id, decidedBy: undefined, decidedAt: undefined });
  await a.save();
  await notify.notifyTpos(tenantId, { type: 'COMPANY_REQUEST', message: `${company.name} requested recruitment authorization`, link: '/tpo/company-approvals' });
  return a;
}

async function listApprovals(user, q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (user.role === 'TPO') {
    filter.tenantId = user.tenantId;
    return paginate(CollegeCompanyApproval, filter, q, { populate: { path: 'companyId', select: 'name industry companyCode verificationStatus status' } });
  }
  const r = await Recruiter.findOne({ userId: user.id });
  if (!r) throw new AppError(403, 'Recruiter profile not found');
  filter.companyId = r.companyId;
  return paginate(CollegeCompanyApproval, filter, q, { populate: [{ path: 'tenantId', select: 'tenantCode collegeName city' }, { path: 'decidedBy', select: 'name' }] });
}

async function decide(user, companyId, status, notes, ctx) {
  if (!['APPROVED', 'REJECTED', 'REVOKED'].includes(status)) throw new AppError(400, 'Invalid decision');
  const company = await Company.findById(companyId);
  if (!company) throw new AppError(404, 'Company not found');
  if (status === 'APPROVED' && (company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE')) throw new AppError(409, 'Only verified, active companies can be approved');
  let a = await CollegeCompanyApproval.findOne({ tenantId: user.tenantId, companyId });
  if (!a) a = new CollegeCompanyApproval({ tenantId: user.tenantId, companyId }); // TPO may also invite a verified company directly
  Object.assign(a, { status, notes, decidedBy: user.id, decidedAt: new Date() });
  await a.save();
  if (status === 'REVOKED' || status === 'REJECTED') {
    const drives = await PlacementDrive.find({ tenantId: user.tenantId, companyId, status: { $in: ['APPROVED', 'PUBLISHED'] } });
    for (const d of drives) { d.status = 'SUSPENDED'; await d.save(); }
  }
  const recs = await Recruiter.find({ companyId, isCompanyAdmin: true }).lean();
  await notify.notifyMany(recs.map((r) => r.userId), { type: 'COLLEGE_AUTHORIZATION', message: `A college ${status.toLowerCase()} your recruitment authorization`, link: '/recruiter/colleges' });
  await audit.log(ctx, 'COLLEGE_COMPANY_DECISION', 'CollegeCompanyApproval', a._id, { status, companyId });
  return a;
}

module.exports = { sendRegistrationOtp, register, list, myCompany, updateMyCompany, setVerification, suspend, reinstate, requestCollege, listApprovals, decide };
