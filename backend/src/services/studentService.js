const User = require('../models/User');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const PlacementDrive = require('../models/PlacementDrive');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const mail = require('./mailService');
const notify = require('./notificationService');
const audit = require('./auditService');
const eligibility = require('./eligibilityService');
const { AppError } = require('../utils/response');
const { paginate, escapeRegex } = require('../utils/pagination');

const norm = (e) => String(e || '').trim().toLowerCase();

async function resolveDepartment(tenantId, value, branch) {
  const key = String(value || branch || '').trim();
  if (!key) return null;
  const found = await Department.findOne({ tenantId, $or: [{ code: key.toUpperCase() }, { name: new RegExp(`^${escapeRegex(key)}$`, 'i') }] });
  return found || Department.create({ tenantId, name: key.toUpperCase(), code: key.toUpperCase() });
}

async function createStudent(ctx, d) {
  const tenantId = ctx.tenantId; // always derived from the authenticated TPO
  const email = norm(d.email);
  if (await User.exists({ email })) throw new AppError(409, `Email already in use: ${email}`);
  if (await Student.exists({ tenantId, rollNo: String(d.rollNo).trim() })) throw new AppError(409, `Roll number already exists: ${d.rollNo}`);
  const dept = await resolveDepartment(tenantId, d.department, d.branch);
  const user = await User.create({ name: d.name, email, phone: d.phone, role: 'STUDENT', tenantId, status: 'INVITED' });
  let student;
  try {
    student = await Student.create({
      tenantId, userId: user._id, name: d.name, email, phone: d.phone, rollNo: String(d.rollNo).trim(), departmentId: dept?._id,
      branch: String(d.branch || d.department).toUpperCase(), graduationYear: Number(d.graduationYear), cgpa: Number(d.cgpa) || 0, backlogs: Number(d.backlogs) || 0,
      tenthPercent: d.tenthPercent ? Number(d.tenthPercent) : undefined, twelfthPercent: d.twelfthPercent ? Number(d.twelfthPercent) : undefined,
    });
  } catch (e) {
    await User.deleteOne({ _id: user._id });
    throw e;
  }
  await mail.sendInvitation(email, d.name, 'STUDENT');
  await audit.log(ctx, 'CREATE_STUDENT', 'Student', student._id, { rollNo: student.rollNo });
  return student;
}

async function bulkImport(ctx, rows) {
  if (!Array.isArray(rows) || !rows.length) throw new AppError(400, 'No rows to import');
  if (rows.length > 1000) throw new AppError(400, 'Maximum 1000 rows per import');
  const result = { created: 0, failed: [] };
  for (let i = 0; i < rows.length; i += 1) {
    try { await createStudent(ctx, rows[i]); result.created += 1; } catch (e) { result.failed.push({ row: i + 1, email: rows[i].email, error: e.message }); }
  }
  await audit.log(ctx, 'BULK_IMPORT_STUDENTS', 'Student', null, { created: result.created, failed: result.failed.length });
  return result;
}

function list(ctx, q) {
  const filter = { tenantId: ctx.tenantId };
  if (q.verificationStatus) filter.verificationStatus = q.verificationStatus;
  if (q.departmentId) filter.departmentId = q.departmentId;
  if (q.branch) filter.branch = String(q.branch).toUpperCase();
  if (q.search) { const r = new RegExp(escapeRegex(q.search), 'i'); filter.$or = [{ name: r }, { rollNo: r }, { email: r }]; }
  return paginate(Student, filter, q, { populate: { path: 'departmentId', select: 'name code' } });
}
async function get(ctx, id) {
  const s = await Student.findOne({ _id: id, tenantId: ctx.tenantId }).populate('departmentId', 'name code').lean();
  if (!s) throw new AppError(404, 'Student not found');
  await audit.log(ctx, 'VIEW_STUDENT', 'Student', s._id, {});
  return s;
}
async function update(ctx, id, d) {
  const s = await Student.findOne({ _id: id, tenantId: ctx.tenantId });
  if (!s) throw new AppError(404, 'Student not found');
  ['name', 'phone', 'branch', 'graduationYear', 'cgpa', 'backlogs', 'tenthPercent', 'twelfthPercent', 'status'].forEach((k) => { if (d[k] !== undefined) s[k] = d[k]; });
  if (d.department) s.departmentId = (await resolveDepartment(ctx.tenantId, d.department))._id;
  await s.save();
  await audit.log(ctx, 'UPDATE_STUDENT', 'Student', s._id, {});
  return s;
}
async function verify(ctx, id, { status, notes }) {
  if (!['VERIFIED', 'REJECTED', 'DOCUMENT_ISSUE', 'UNDER_REVIEW'].includes(status)) throw new AppError(400, 'Invalid verification status');
  const s = await Student.findOne({ _id: id, tenantId: ctx.tenantId });
  if (!s) throw new AppError(404, 'Student not found');
  Object.assign(s, { verificationStatus: status, verificationNotes: notes, verifiedBy: ctx.actorId, verifiedAt: new Date() });
  await s.save();
  await notify.notify(s.userId, { type: 'VERIFICATION', tenantId: s.tenantId, message: `Your academic verification is now ${status.replace('_', ' ').toLowerCase()}` });
  await audit.log(ctx, 'VERIFY_STUDENT', 'Student', s._id, { status });
  return s;
}

// ---------- Student self-service ----------
async function mine(user) {
  const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).populate('departmentId', 'name code');
  if (!s) throw new AppError(404, 'Student profile not found');
  return s;
}
async function getProfile(user) {
  const s = (await mine(user)).toObject();
  const fields = ['phone', 'tenthPercent', 'twelfthPercent', 'resumeFileId'];
  const filled = fields.filter((f) => s[f]).length + (s.skills.length ? 1 : 0) + (s.projects.length ? 1 : 0) + (s.certifications.length ? 1 : 0);
  s.profileCompletion = Math.min(100, Math.round(((filled + 3) / (fields.length + 6)) * 100));
  return s;
}
async function updateProfile(user, d) {
  const s = await mine(user);
  ['phone', 'tenthPercent', 'twelfthPercent', 'skills', 'projects', 'certifications', 'internships'].forEach((k) => { if (d[k] !== undefined) s[k] = d[k]; });
  // Academic changes are allowed but must be re-verified by the TPO.
  let reverify = false;
  ['cgpa', 'backlogs'].forEach((k) => { if (d[k] !== undefined && Number(d[k]) !== s[k]) { s[k] = Number(d[k]); reverify = true; } });
  if (reverify) s.verificationStatus = 'PENDING';
  await s.save();
  if (reverify) await notify.notifyTpos(user.tenantId, { type: 'VERIFICATION', message: `${s.name} updated academic details and needs re-verification`, link: '/tpo/verification' });
  return s;
}
async function placementStatus(user) {
  const s = await mine(user);
  const offer = await Offer.findOne({ studentId: s._id, status: 'ACCEPTED' }).populate('companyId', 'name').lean();
  const applications = await Application.countDocuments({ studentId: s._id });
  return { placementStatus: s.placementStatus, applications, offer };
}

async function dashboard(user) {
  const s = await mine(user);
  const drives = await listEligibleDrives(user, s);
  const apps = await Application.find({ studentId: s._id }).lean();
  const count = (st) => apps.filter((a) => a.status === st).length;
  const ids = apps.map((a) => a._id);
  const [interviews, offers, notes] = await Promise.all([
    Interview.find({ applicationId: { $in: ids }, scheduledAt: { $gte: new Date() } }).sort({ scheduledAt: 1 }).limit(5).populate({ path: 'driveId', select: 'title companyId', populate: { path: 'companyId', select: 'name' } }).lean(),
    Offer.find({ studentId: s._id }).populate('companyId', 'name').sort({ createdAt: -1 }).limit(3).lean(),
    Notification.find({ userId: user.id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const profile = await getProfile(user);
  return {
    profile: { name: s.name, branch: s.branch, rollNo: s.rollNo, graduationYear: s.graduationYear, department: s.departmentId?.name, completion: profile.profileCompletion },
    stats: [
      { label: 'Academic Verification', value: s.verificationStatus === 'VERIFIED' ? 'Verified' : s.verificationStatus.replace('_', ' '), hint: s.verificationStatus === 'VERIFIED' ? 'All documents verified by TPO' : 'Awaiting TPO verification', tone: s.verificationStatus === 'VERIFIED' ? 'green' : 'amber' },
      { label: 'Eligibility Status', value: drives.length ? 'Eligible' : 'No drives', hint: `For ${drives.length} placement drives`, tone: 'blue', to: '/student/eligibility' },
      { label: 'Resume Status', value: s.resumeFileId ? 'Protected' : 'Not uploaded', hint: 'Shared only with authorized recruiters', tone: 'purple', to: '/student/resume' },
      { label: 'Placement Status', value: s.placementStatus === 'PLACED' ? 'Placed' : 'Active', hint: 'Participate in eligible drives', tone: 'green' },
    ],
    applicationCounts: [
      { label: 'Applied', value: apps.length }, { label: 'Under Review', value: count('UNDER_REVIEW') }, { label: 'Shortlisted', value: count('SHORTLISTED') },
      { label: 'Test Scheduled', value: count('TEST') }, { label: 'Interview', value: count('INTERVIEW') }, { label: 'Selected', value: count('SELECTED') },
      { label: 'Offer', value: count('OFFER') }, { label: 'Placed', value: count('PLACED') },
    ],
    sections: [
      { title: 'Eligible Placement Drives', to: '/student/drives', subtitle: 'Showing only drives you are eligible for based on your profile, academics and criteria.',
        columns: [{ key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'package', label: 'Package (LPA)' }, { key: 'criteria', label: 'Eligibility Criteria' }, { key: 'deadline', label: 'Deadline', type: 'date' }, { key: 'id', label: 'Action', type: 'link', to: '/student/drives/' }],
        rows: drives.slice(0, 5).map((d) => ({ id: d._id, company: d.companyId?.name, role: d.title, package: d.package, criteria: `${d.criteriaText.cgpa} · ${d.criteriaText.backlogs} · ${d.criteriaText.branches}`, deadline: d.deadline })) },
      { title: 'Upcoming Tests & Interviews', to: '/student/interviews', columns: [{ key: 'company', label: 'Company' }, { key: 'stage', label: 'Stage', badge: true }, { key: 'scheduledAt', label: 'When', type: 'datetime' }, { key: 'mode', label: 'Mode' }],
        rows: interviews.map((i) => ({ id: i._id, company: i.driveId?.companyId?.name, stage: i.stage, scheduledAt: i.scheduledAt, mode: i.mode })) },
      { title: 'Latest Offers', to: '/student/offers', columns: [{ key: 'company', label: 'Company' }, { key: 'role', label: 'Role' }, { key: 'package', label: 'Package' }, { key: 'status', label: 'Status', badge: true }],
        rows: offers.map((o) => ({ id: o._id, company: o.companyId?.name, role: o.role, package: o.package, status: o.status })), empty: 'No offers yet. Keep participating in placement drives.' },
    ],
    notices: { title: 'Notifications', items: notes.map((n) => ({ text: n.message, at: n.createdAt })) },
    info: ['You can only see placement drives for which you are eligible.', 'Your resume is protected and shared only with authorized recruiters.', 'Keep your profile, academics and resume updated.', 'All communications will be through this portal. Check notifications regularly.'],
  };
}

async function listEligibleDrives(user, studentDoc) {
  const s = studentDoc || (await mine(user));
  const drives = await PlacementDrive.find({ tenantId: user.tenantId, status: 'PUBLISHED' }).populate('companyId', 'name industry status verificationStatus').sort({ deadline: 1 }).lean();
  return drives
    .filter((d) => d.companyId && d.companyId.status === 'ACTIVE' && d.companyId.verificationStatus === 'VERIFIED')
    .map((d) => ({ ...d, eligibility: eligibility.evaluate(s, d.criteria), criteriaText: eligibility.describe(d.criteria) }))
    .filter((d) => d.eligibility.eligible);
}

module.exports = { createStudent, bulkImport, list, get, update, verify, mine, getProfile, updateProfile, placementStatus, dashboard, listEligibleDrives };
