const Tenant = require('../models/Tenant');
const CollegeRegistration = require('../models/CollegeRegistration');
const User = require('../models/User');
const Student = require('../models/Student');
const PlatformSetting = require('../models/PlatformSetting');
const otp = require('./otpService');
const mail = require('./mailService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { AppError } = require('../utils/response');
const { paginate, escapeRegex } = require('../utils/pagination');

const DEFAULT_SETTINGS = { allowCollegeRegistration: true, supportEmail: 'support@placementportal.example', announcement: '' };
const norm = (e) => String(e || '').trim().toLowerCase();

async function getSettings() {
  const s = await PlatformSetting.findOne({ key: 'platform' }).lean();
  return { ...DEFAULT_SETTINGS, ...(s ? s.value : {}) };
}
async function updateSettings(admin, body, ctx) {
  const next = { ...(await getSettings()) };
  ['allowCollegeRegistration', 'supportEmail', 'announcement'].forEach((k) => { if (body[k] !== undefined) next[k] = body[k]; });
  await PlatformSetting.findOneAndUpdate({ key: 'platform' }, { value: next }, { upsert: true });
  await audit.log(ctx, 'UPDATE_SETTINGS', 'PlatformSetting', 'platform', next);
  return next;
}

const sendRegistrationOtp = (email, ctx) => otp.issue({ email, purpose: 'COLLEGE_REGISTRATION' }, ctx);

async function submitRegistration(b, ctx) {
  if (!(await getSettings()).allowCollegeRegistration) throw new AppError(403, 'College registration is currently closed');
  await otp.verify({ email: b.officialEmail, purpose: 'COLLEGE_REGISTRATION', code: b.otp }, ctx);
  const email = norm(b.officialEmail);
  if (await CollegeRegistration.exists({ officialEmail: email, status: { $in: ['PENDING', 'UNDER_REVIEW'] } })) throw new AppError(409, 'A registration for this email is already pending');
  if (await Tenant.exists({ officialEmail: email })) throw new AppError(409, 'This college is already registered');
  const reg = await CollegeRegistration.create({
    collegeName: b.collegeName, collegeCode: b.collegeCode, affiliation: b.affiliation, collegeType: b.collegeType, officialEmail: email,
    website: b.website, address: b.address, city: b.city, state: b.state, pincode: b.pincode,
    contact: { name: b.contactName, email: norm(b.contactEmail), phone: b.contactPhone, designation: b.contactDesignation },
    proposedTpo: { name: b.tpoName, email: norm(b.tpoEmail), phone: b.tpoPhone, designation: b.tpoDesignation || 'Training & Placement Officer' },
    emailVerified: true,
  });
  await audit.log(ctx, 'SUBMIT_COLLEGE_REGISTRATION', 'CollegeRegistration', reg._id, { college: reg.collegeName });
  await notify.notifyAdmins({ type: 'COLLEGE_REGISTRATION', message: `New college registration submitted: ${reg.collegeName}`, link: '/admin/college-requests' });
  await mail.sendNotice(email, 'College registration received', `Your registration for ${reg.collegeName} is pending Super Admin review.`);
  return { id: reg._id, status: reg.status };
}

function listRegistrations(q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.search) filter.collegeName = new RegExp(escapeRegex(q.search), 'i');
  return paginate(CollegeRegistration, filter, q);
}
async function getRegistration(id) {
  const r = await CollegeRegistration.findById(id).lean();
  if (!r) throw new AppError(404, 'Registration not found');
  return r;
}

async function review(id, admin, ctx, notes) {
  const reg = await CollegeRegistration.findById(id);
  if (!reg) throw new AppError(404, 'Registration not found');
  if (reg.status !== 'PENDING') throw new AppError(409, 'Only pending registrations can be moved to review');
  Object.assign(reg, { status: 'UNDER_REVIEW', reviewedBy: admin.id, reviewNotes: notes });
  await reg.save();
  await audit.log(ctx, 'REVIEW_COLLEGE', 'CollegeRegistration', reg._id, {});
  return reg;
}

async function approve(id, admin, ctx, notes) {
  const reg = await CollegeRegistration.findById(id);
  if (!reg) throw new AppError(404, 'Registration not found');
  if (!['PENDING', 'UNDER_REVIEW'].includes(reg.status)) throw new AppError(409, 'Registration already decided');
  if (await User.exists({ email: reg.proposedTpo.email })) throw new AppError(409, 'Proposed TPO email is already used by another account');
  const tenant = await Tenant.create({
    tenantCode: await Tenant.nextCode(), collegeName: reg.collegeName, code: reg.collegeCode, affiliation: reg.affiliation, collegeType: reg.collegeType,
    officialEmail: reg.officialEmail, website: reg.website, address: reg.address, city: reg.city, state: reg.state, pincode: reg.pincode,
    contact: reg.contact, status: 'ACTIVE', registrationId: reg._id, approvedBy: admin.id,
  });
  let tpo;
  try {
    tpo = await User.create({ name: reg.proposedTpo.name, email: reg.proposedTpo.email, phone: reg.proposedTpo.phone, role: 'TPO', tenantId: tenant._id, status: 'INVITED' });
  } catch (e) {
    await Tenant.deleteOne({ _id: tenant._id });
    throw e;
  }
  Object.assign(reg, { status: 'APPROVED', reviewedBy: admin.id, reviewedAt: new Date(), reviewNotes: notes, tenantId: tenant._id });
  await reg.save();
  await mail.sendInvitation(tpo.email, tpo.name, 'TPO');
  await mail.sendNotice(reg.officialEmail, 'College approved', `${reg.collegeName} is approved (tenant ${tenant.tenantCode}). The TPO has been invited.`);
  await audit.log(ctx, 'APPROVE_COLLEGE', 'Tenant', tenant._id, { tenantCode: tenant.tenantCode, college: tenant.collegeName });
  return { tenant, tpo: { id: tpo._id, email: tpo.email } };
}

async function reject(id, admin, ctx, notes) {
  const reg = await CollegeRegistration.findById(id);
  if (!reg) throw new AppError(404, 'Registration not found');
  if (!['PENDING', 'UNDER_REVIEW'].includes(reg.status)) throw new AppError(409, 'Registration already decided');
  Object.assign(reg, { status: 'REJECTED', reviewedBy: admin.id, reviewedAt: new Date(), reviewNotes: notes });
  await reg.save();
  await mail.sendNotice(reg.officialEmail, 'College registration rejected', `Your registration was not approved. ${notes || ''}`);
  await audit.log(ctx, 'REJECT_COLLEGE', 'CollegeRegistration', reg._id, { notes });
  return reg;
}

async function listTenants(q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.search) filter.collegeName = new RegExp(escapeRegex(q.search), 'i');
  const { items, meta } = await paginate(Tenant, filter, q);
  const ids = items.map((t) => t._id);
  const [counts, tpos] = await Promise.all([
    Student.aggregate([{ $match: { tenantId: { $in: ids } } }, { $group: { _id: '$tenantId', n: { $sum: 1 } } }]),
    User.find({ tenantId: { $in: ids }, role: 'TPO' }).select('name email status tenantId').lean(),
  ]);
  const cMap = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return {
    items: items.map((t) => ({ ...t, studentCount: cMap[String(t._id)] || 0, tpo: tpos.find((u) => String(u.tenantId) === String(t._id) && u.status !== 'INACTIVE') || null })),
    meta,
  };
}
async function setTenantStatus(id, status, ctx) {
  const t = await Tenant.findById(id);
  if (!t) throw new AppError(404, 'Tenant not found');
  t.status = status;
  await t.save();
  await audit.log(ctx, status === 'ACTIVE' ? 'ACTIVATE_TENANT' : 'DEACTIVATE_TENANT', 'Tenant', t._id, { tenantCode: t.tenantCode });
  return t;
}

async function listTpos(q) {
  const filter = { role: 'TPO' };
  if (q.status) filter.status = q.status;
  return paginate(User, filter, q, { populate: { path: 'tenantId', select: 'tenantCode collegeName' }, select: 'name email phone status tenantId lastLoginAt' });
}
async function inviteTpo(b, ctx) {
  const tenant = await Tenant.findById(b.tenantId);
  if (!tenant || tenant.status !== 'ACTIVE') throw new AppError(400, 'Tenant must exist and be active');
  const email = norm(b.email);
  if (await User.exists({ email })) throw new AppError(409, 'Email already in use');
  const tpo = await User.create({ name: b.name, email, phone: b.phone, role: 'TPO', tenantId: tenant._id, status: 'INVITED' });
  if (b.replaceUserId) {
    const old = await User.findOne({ _id: b.replaceUserId, role: 'TPO', tenantId: tenant._id });
    if (old) { old.status = 'INACTIVE'; await old.save(); } // college data is preserved
  }
  await mail.sendInvitation(email, tpo.name, 'TPO');
  await audit.log(ctx, 'ASSIGN_TPO', 'User', tpo._id, { tenantCode: tenant.tenantCode, replaced: b.replaceUserId });
  return { id: tpo._id, email };
}
async function setUserStatus(id, status, role, ctx) {
  if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) throw new AppError(400, 'Invalid status');
  const user = await User.findOne({ _id: id, role });
  if (!user) throw new AppError(404, 'User not found');
  if (String(user._id) === String(ctx.actorId)) throw new AppError(400, 'You cannot change your own status');
  if (user.status === 'INVITED') throw new AppError(409, 'User has not activated the account yet');
  user.status = status;
  await user.save();
  await audit.log(ctx, 'UPDATE_USER_STATUS', 'User', user._id, { status, role });
  return { id: user._id, status };
}

const listAdmins = (q) => paginate(User, { role: 'SUPER_ADMIN' }, q, { select: 'name email status lastLoginAt createdAt' });
async function inviteAdmin(b, ctx) {
  const email = norm(b.email);
  if (await User.exists({ email })) throw new AppError(409, 'Email already in use');
  const u = await User.create({ name: b.name, email, phone: b.phone, role: 'SUPER_ADMIN', status: 'INVITED' });
  await mail.sendInvitation(email, u.name, 'SUPER_ADMIN');
  await audit.log(ctx, 'ASSIGN_TPO', 'User', u._id, { role: 'SUPER_ADMIN', note: 'platform admin invited' });
  return { id: u._id, email };
}

async function studentsOverview(q) {
  const tenants = await Tenant.find().select('tenantCode collegeName status').lean();
  const agg = await Student.aggregate([{ $group: { _id: '$tenantId', total: { $sum: 1 }, verified: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'VERIFIED'] }, 1, 0] } }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'PLACED'] }, 1, 0] } } } }]);
  const m = Object.fromEntries(agg.map((a) => [String(a._id), a]));
  const items = tenants.map((t) => ({ tenantCode: t.tenantCode, collegeName: t.collegeName, status: t.status, total: m[String(t._id)]?.total || 0, verified: m[String(t._id)]?.verified || 0, placed: m[String(t._id)]?.placed || 0 }));
  return { items, meta: { page: 1, limit: items.length, total: items.length, pages: 1 } };
}

async function directory() {
  return Tenant.find({ status: 'ACTIVE' }).select('tenantCode collegeName city state').sort({ collegeName: 1 }).lean();
}
async function myTenant(user) {
  return Tenant.findById(user.tenantId).select('tenantCode collegeName city state website status').lean();
}

module.exports = { getSettings, updateSettings, sendRegistrationOtp, submitRegistration, listRegistrations, getRegistration, review, approve, reject, listTenants, setTenantStatus, listTpos, inviteTpo, setUserStatus, listAdmins, inviteAdmin, studentsOverview, directory, myTenant };
