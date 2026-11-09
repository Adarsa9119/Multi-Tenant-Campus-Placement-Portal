const Application = require('../models/Application');
const Student = require('../models/Student');
const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Recruiter = require('../models/Recruiter');
const ras = require('./recruiterAuthorizationService');
const eligibility = require('./eligibilityService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { assertTransition } = require('../utils/statusTransition');
const { MANUAL_STATUSES } = require('../constants/applicationStatuses');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

// Least privilege: recruiters never receive email, phone, roll number or marks.
const RECRUITER_FIELDS = 'name branch cgpa graduationYear skills projects certifications resumeFileId';
const TPO_FIELDS = 'name email phone rollNo branch cgpa backlogs graduationYear skills resumeFileId verificationStatus';

function shape(app, role) {
  const s = app.studentId || {};
  const base = { _id: app._id, status: app.status, appliedAt: app.appliedAt, driveId: app.driveId?._id || app.driveId, drive: app.driveId?.title, company: app.driveId?.companyId?.name || app.companyId?.name, history: app.history };
  if (role === 'STUDENT') return { ...base, driveTitle: app.driveId?.title, package: app.driveId?.package };
  const cand = { name: s.name, branch: s.branch, cgpa: s.cgpa, graduationYear: s.graduationYear, skills: s.skills, hasResume: !!s.resumeFileId };
  if (role === 'RECRUITER') return { ...base, ...cand, projects: (s.projects || []).map((p) => ({ title: p.title, description: p.description })), certifications: s.certifications };
  return { ...base, ...cand, email: s.email, phone: s.phone, rollNo: s.rollNo, backlogs: s.backlogs, studentId: s._id };
}

async function apply(user, driveId, ctx) {
  const student = await Student.findOne({ userId: user.id, tenantId: user.tenantId });
  if (!student) throw new AppError(404, 'Student profile not found');
  if (student.status !== 'ACTIVE') throw new AppError(403, 'Your student account is not active');
  if (student.verificationStatus !== 'VERIFIED') throw new AppError(403, 'Academic verification is pending');
  const drive = await PlacementDrive.findOne({ _id: driveId, tenantId: user.tenantId });
  if (!drive) throw new AppError(404, 'Drive not found'); // other tenants' drives are indistinguishable from missing
  if (drive.status !== 'PUBLISHED') throw new AppError(409, 'This drive is not open for applications');
  if (new Date() > new Date(drive.deadline)) throw new AppError(409, 'The application deadline has passed');
  const company = await Company.findById(drive.companyId);
  if (!company || company.status !== 'ACTIVE' || company.verificationStatus !== 'VERIFIED') throw new AppError(409, 'Company is not accepting applications');
  const ev = eligibility.evaluate(student, drive.criteria);
  if (!ev.eligible) throw new AppError(403, 'You are not eligible for this drive', ev.failures);
  let app;
  try {
    app = await Application.create({ tenantId: user.tenantId, studentId: student._id, driveId: drive._id, companyId: drive.companyId, status: 'APPLIED', history: [{ from: null, to: 'APPLIED', by: user.id, role: 'STUDENT' }] });
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'You have already applied to this drive');
    throw e;
  }
  const recs = await Recruiter.find({ _id: { $in: drive.recruiterIds } }).lean();
  await notify.notifyMany(recs.map((r) => r.userId), { type: 'NEW_APPLICATION', message: `New application for ${drive.title}`, link: '/recruiter/applications', tenantId: user.tenantId });
  await audit.log(ctx, 'APPLY_DRIVE', 'Application', app._id, { driveId: drive._id });
  return app;
}

async function list(user, q, ctx) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.statuses) filter.status = { $in: String(q.statuses).split(',') };
  const populate = [{ path: 'driveId', select: 'title package companyId', populate: { path: 'companyId', select: 'name' } }];
  if (user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).select('_id');
    filter.tenantId = user.tenantId;
    filter.studentId = s?._id;
    const out = await paginate(Application, filter, q, { populate });
    out.items = out.items.map((a) => shape(a, 'STUDENT'));
    return out;
  }
  if (user.role === 'TPO') {
    filter.tenantId = user.tenantId;
    if (q.driveId) filter.driveId = q.driveId;
    const out = await paginate(Application, filter, q, { populate: [...populate, { path: 'studentId', select: TPO_FIELDS }] });
    out.items = out.items.map((a) => shape(a, 'TPO'));
    return out;
  }
  if (user.role === 'RECRUITER') {
    const { driveIds } = await ras.accessibleDriveIds(user, ctx);
    const allowed = driveIds.map(String);
    if (q.driveId) filter.driveId = allowed.includes(String(q.driveId)) ? q.driveId : { $in: [] };
    else filter.driveId = { $in: driveIds };
    const out = await paginate(Application, filter, q, { populate: [...populate, { path: 'studentId', select: RECRUITER_FIELDS }] });
    out.items = out.items.map((a) => shape(a, 'RECRUITER'));
    return out;
  }
  throw new AppError(403, 'Not allowed');
}

async function loadForUser(user, id, ctx) {
  if (user.role === 'RECRUITER') return (await ras.assertCandidateAccess(user, id, ctx)).application;
  if (user.role === 'TPO') {
    const a = await Application.findOne({ _id: id, tenantId: user.tenantId });
    if (!a) throw new AppError(404, 'Application not found');
    return a;
  }
  if (user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: user.id, tenantId: user.tenantId }).select('_id');
    const a = await Application.findOne({ _id: id, studentId: s?._id });
    if (!a) throw new AppError(404, 'Application not found');
    return a;
  }
  throw new AppError(403, 'Not allowed');
}

async function get(user, id, ctx) {
  const a = await loadForUser(user, id, ctx);
  const fields = user.role === 'RECRUITER' ? RECRUITER_FIELDS : user.role === 'TPO' ? TPO_FIELDS : 'name';
  const full = await Application.findById(a._id)
    .populate({ path: 'driveId', select: 'title package location criteria deadline companyId', populate: { path: 'companyId', select: 'name' } })
    .populate({ path: 'studentId', select: fields }).lean();
  if (user.role !== 'STUDENT') await audit.log(ctx, 'VIEW_STUDENT', 'Student', full.studentId._id, { applicationId: a._id });
  const out = shape(full, user.role);
  if (user.role === 'STUDENT') return { ...out, drive: full.driveId };
  return { ...out, projects: full.studentId.projects?.map((p) => ({ title: p.title, description: p.description })), certifications: full.studentId.certifications, criteria: full.driveId.criteria };
}

// Used by the generic status endpoint and by interview/offer workflows.
async function transition(app, to, actor, remarks, ctx) {
  assertTransition(app.status, to);
  const from = app.status;
  app.history.push({ from, to, by: actor?.id, role: actor?.role, remarks });
  app.status = to;
  await app.save();
  const s = await Student.findById(app.studentId).select('userId').lean();
  if (s) await notify.notify(s.userId, { type: 'APPLICATION_STATUS', message: `Your application status changed to ${to.replace('_', ' ').toLowerCase()}`, link: `/student/applications/${app._id}`, tenantId: app.tenantId });
  await audit.log(ctx || {}, to === 'SHORTLISTED' ? 'SHORTLIST_CANDIDATE' : 'UPDATE_APPLICATION_STATUS', 'Application', app._id, { from, to });
  return app;
}

async function changeStatus(user, id, { status, remarks }, ctx) {
  if (!MANUAL_STATUSES.includes(status)) throw new AppError(400, 'This status can only be set through the interview or offer workflow');
  if (!['TPO', 'RECRUITER'].includes(user.role)) throw new AppError(403, 'Not allowed');
  const app = await loadForUser(user, id, ctx);
  return transition(app, status, user, remarks, ctx);
}

module.exports = { apply, list, get, transition, changeStatus, loadForUser, shape, RECRUITER_FIELDS, TPO_FIELDS };
