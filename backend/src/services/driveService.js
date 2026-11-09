const PlacementDrive = require('../models/PlacementDrive');
const Company = require('../models/Company');
const Recruiter = require('../models/Recruiter');
const RecruiterAuthorization = require('../models/RecruiterAuthorization');
const CollegeCompanyApproval = require('../models/CollegeCompanyApproval');
const Student = require('../models/Student');
const Application = require('../models/Application');
const ras = require('./recruiterAuthorizationService');
const eligibility = require('./eligibilityService');
const studentService = require('./studentService');
const notify = require('./notificationService');
const audit = require('./auditService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

async function assertCompanyUsable(tenantId, companyId) {
  const company = await Company.findById(companyId);
  if (!company || company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE') throw new AppError(409, 'Company must be verified and active');
  const approval = await CollegeCompanyApproval.findOne({ tenantId, companyId, status: 'APPROVED' });
  if (!approval) throw new AppError(409, 'Company is not authorized by your college');
  return company;
}
async function assertRecruiters(tenantId, companyId, recruiterIds = []) {
  if (!recruiterIds.length) throw new AppError(422, 'Assign at least one authorized recruiter');
  for (const id of recruiterIds) {
    const r = await Recruiter.findById(id);
    if (!r || String(r.companyId) !== String(companyId) || r.status !== 'ACTIVE' || r.authorizationStatus !== 'AUTHORIZED') throw new AppError(409, 'Recruiter is not valid for this company');
    if (!(await RecruiterAuthorization.exists({ recruiterId: id, tenantId, status: 'ACTIVE' }))) throw new AppError(409, 'Recruiter is not authorized for your college');
  }
}
const pickCriteria = (c = {}) => ({
  minCgpa: Number(c.minCgpa) || 0, branches: (c.branches || []).map((b) => String(b).toUpperCase()), maxBacklogs: Number(c.maxBacklogs) || 0,
  graduationYear: c.graduationYear ? Number(c.graduationYear) : undefined,
});

async function create(user, b, ctx) {
  await assertCompanyUsable(user.tenantId, b.companyId);
  await assertRecruiters(user.tenantId, b.companyId, b.recruiterIds);
  const d = await PlacementDrive.create({
    tenantId: user.tenantId, companyId: b.companyId, recruiterIds: b.recruiterIds, title: b.title, description: b.description, package: b.package,
    location: b.location, criteria: pickCriteria(b.criteria), deadline: b.deadline, status: 'DRAFT', createdBy: user.id,
  });
  await audit.log(ctx, 'CREATE_DRIVE', 'PlacementDrive', d._id, { title: d.title });
  return d;
}

async function findOwn(user, id) {
  const d = await PlacementDrive.findOne({ _id: id, tenantId: user.tenantId });
  if (!d) throw new AppError(404, 'Drive not found');
  return d;
}
async function update(user, id, b, ctx) {
  const d = await findOwn(user, id);
  if (d.status === 'CLOSED') throw new AppError(409, 'Closed drives cannot be edited');
  if (b.recruiterIds) await assertRecruiters(user.tenantId, d.companyId, b.recruiterIds);
  ['title', 'description', 'package', 'location', 'deadline', 'recruiterIds'].forEach((k) => { if (b[k] !== undefined) d[k] = b[k]; });
  if (b.criteria) {
    const currentCriteria = d.criteria;
    d.criteria = pickCriteria({
      minCgpa: b.criteria.minCgpa !== undefined ? b.criteria.minCgpa : currentCriteria.minCgpa,
      branches: b.criteria.branches !== undefined ? b.criteria.branches : currentCriteria.branches,
      maxBacklogs: b.criteria.maxBacklogs !== undefined ? b.criteria.maxBacklogs : currentCriteria.maxBacklogs,
      graduationYear: b.criteria.graduationYear !== undefined ? b.criteria.graduationYear : currentCriteria.graduationYear,
    });
  }
  await d.save();
  await audit.log(ctx, 'UPDATE_DRIVE', 'PlacementDrive', d._id, {});
  return d;
}

async function approve(user, id, ctx) {
  const d = await findOwn(user, id);
  if (d.status !== 'DRAFT') throw new AppError(409, 'Only draft drives can be approved');
  await assertCompanyUsable(user.tenantId, d.companyId);
  d.status = 'APPROVED';
  await d.save();
  const recs = await Recruiter.find({ _id: { $in: d.recruiterIds } }).lean();
  await notify.notifyMany(recs.map((r) => r.userId), { type: 'DRIVE_APPROVED', message: `Drive approved: ${d.title}`, link: '/recruiter/drives', tenantId: d.tenantId });
  await audit.log(ctx, 'APPROVE_DRIVE', 'PlacementDrive', d._id, {});
  return d;
}
async function publish(user, id, ctx) {
  const d = await findOwn(user, id);
  if (!['APPROVED', 'SUSPENDED'].includes(d.status)) throw new AppError(409, 'Drive must be approved before publishing');
  if (new Date(d.deadline) < new Date()) throw new AppError(409, 'Deadline is already in the past');
  await assertCompanyUsable(user.tenantId, d.companyId);
  d.status = 'PUBLISHED';
  d.statusBeforeSuspension = undefined;
  await d.save();
  const students = await Student.find({ tenantId: user.tenantId, status: 'ACTIVE', verificationStatus: 'VERIFIED' }).lean();
  const eligible = students.filter((s) => eligibility.evaluate(s, d.criteria).eligible);
  await notify.notifyMany(eligible.map((s) => s.userId), { type: 'NEW_DRIVE', message: `New placement drive open: ${d.title}`, link: `/student/drives/${d._id}`, tenantId: d.tenantId });
  await audit.log(ctx, 'PUBLISH_DRIVE', 'PlacementDrive', d._id, { notified: eligible.length });
  return d;
}
async function close(user, id, ctx) {
  const d = await findOwn(user, id);
  if (d.status !== 'PUBLISHED') throw new AppError(409, 'Only published drives can be closed');
  d.status = 'CLOSED';
  await d.save();
  await audit.log(ctx, 'CLOSE_DRIVE', 'PlacementDrive', d._id, {});
  return d;
}
async function suspend(user, id, ctx) {
  const d = await findOwn(user, id);
  if (!['APPROVED', 'PUBLISHED'].includes(d.status)) throw new AppError(409, 'Drive cannot be suspended in its current state');
  d.status = 'SUSPENDED';
  await d.save();
  await audit.log(ctx, 'SUSPEND_DRIVE', 'PlacementDrive', d._id, {});
  return d;
}

async function list(user, q, ctx) {
  const filter = {};
  if (q.status) filter.status = q.status;
  const populate = [{ path: 'companyId', select: 'name companyCode' }, { path: 'recruiterIds', select: 'designation userId', populate: { path: 'userId', select: 'name' } }];
  if (user.role === 'TPO') {
    filter.tenantId = user.tenantId;
    const out = await paginate(PlacementDrive, filter, q, { populate, sort: { createdAt: -1 } });
    const counts = await Application.aggregate([{ $match: { driveId: { $in: out.items.map((d) => d._id) } } }, { $group: { _id: '$driveId', n: { $sum: 1 } } }]);
    out.items = out.items.map((d) => ({ ...d, applicationCount: counts.find((c) => String(c._id) === String(d._id))?.n || 0 }));
    return out;
  }
  if (user.role === 'RECRUITER') {
    const a = await ras.accessibleDriveIds(user, ctx);
    filter._id = { $in: a.driveIds };
    return paginate(PlacementDrive, filter, q, { populate: [...populate, { path: 'tenantId', select: 'tenantCode collegeName' }], sort: { deadline: 1 } });
  }
  throw new AppError(403, 'Not allowed');
}

async function get(user, id, ctx) {
  const populate = [{ path: 'companyId', select: 'name companyCode industry' }, { path: 'recruiterIds', select: 'designation userId', populate: { path: 'userId', select: 'name' } }];
  if (user.role === 'TPO') {
    const d = await PlacementDrive.findOne({ _id: id, tenantId: user.tenantId }).populate(populate).lean();
    if (!d) throw new AppError(404, 'Drive not found');
    return d;
  }
  if (user.role === 'RECRUITER') {
    const { drive } = await ras.assertDriveAccess(user, id, ctx);
    return PlacementDrive.findById(drive._id).populate([...populate, { path: 'tenantId', select: 'tenantCode collegeName' }]).lean();
  }
  throw new AppError(403, 'Not allowed');
}

async function getForStudent(user, id) {
  const student = await studentService.mine(user);
  const d = await PlacementDrive.findOne({ _id: id, tenantId: user.tenantId, status: { $in: ['PUBLISHED', 'CLOSED'] } }).populate('companyId', 'name industry website description status verificationStatus').lean();
  if (!d || !d.companyId || d.companyId.status !== 'ACTIVE' || d.companyId.verificationStatus !== 'VERIFIED') throw new AppError(404, 'Drive not found');
  const applied = await Application.findOne({ studentId: student._id, driveId: d._id }).select('status').lean();
  return { ...d, recruiterIds: undefined, eligibility: eligibility.evaluate(student, d.criteria), criteriaText: eligibility.describe(d.criteria), application: applied || null, verified: student.verificationStatus === 'VERIFIED' };
}

module.exports = { create, update, approve, publish, close, suspend, list, get, getForStudent };
