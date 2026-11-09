const Recruiter = require('../models/Recruiter');
const RecruiterAuthorization = require('../models/RecruiterAuthorization');
const Company = require('../models/Company');
const CollegeCompanyApproval = require('../models/CollegeCompanyApproval');
const Tenant = require('../models/Tenant');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const audit = require('./auditService');
const notify = require('./notificationService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

async function deny(ctx, reason, resourceType, resourceId) {
  await audit.log(ctx, 'AUTHORIZATION_DENIED', resourceType || 'Recruiter', resourceId, { reason });
  throw new AppError(403, 'You are not authorized to access this resource');
}

// Steps 1-4: recruiter valid, active, platform-authorized; company verified and active.
async function assertRecruiterContext(user, ctx) {
  const recruiter = await Recruiter.findOne({ userId: user.id });
  if (!recruiter) return deny(ctx, 'no_recruiter_profile');
  if (recruiter.status !== 'ACTIVE') return deny(ctx, 'recruiter_not_active');
  if (recruiter.authorizationStatus !== 'AUTHORIZED') return deny(ctx, 'recruiter_not_authorized');
  const company = await Company.findById(recruiter.companyId);
  if (!company || company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE') return deny(ctx, 'company_not_verified_or_active');
  return { recruiter, company };
}

// Step 5: tenants where the college authorized both the company and this recruiter.
async function accessibleTenantIds(recruiter, company) {
  const auths = await RecruiterAuthorization.find({ recruiterId: recruiter._id, status: 'ACTIVE' }).lean();
  const approvals = await CollegeCompanyApproval.find({ companyId: company._id, status: 'APPROVED', tenantId: { $in: auths.map((a) => a.tenantId) } }).lean();
  const tenants = await Tenant.find({ _id: { $in: approvals.map((a) => a.tenantId) }, status: 'ACTIVE' }).select('_id').lean();
  return tenants.map((t) => t._id);
}

async function accessibleDriveIds(user, ctx) {
  const { recruiter, company } = await assertRecruiterContext(user, ctx);
  const tenantIds = await accessibleTenantIds(recruiter, company);
  const drives = await PlacementDrive.find({ tenantId: { $in: tenantIds }, companyId: company._id, recruiterIds: recruiter._id, status: { $in: ['PUBLISHED', 'CLOSED'] } }).select('_id').lean();
  return { recruiter, company, tenantIds, driveIds: drives.map((d) => d._id) };
}

// Step 6: drive authorization.
async function assertDriveAccess(user, driveId, ctx) {
  const base = await assertRecruiterContext(user, ctx);
  const drive = await PlacementDrive.findById(driveId);
  if (!drive) throw new AppError(404, 'Drive not found');
  const reasons = [];
  if (String(drive.companyId) !== String(base.company._id)) reasons.push('drive_belongs_to_other_company');
  if (!drive.recruiterIds.some((r) => String(r) === String(base.recruiter._id))) reasons.push('recruiter_not_assigned_to_drive');
  if (!['PUBLISHED', 'CLOSED'].includes(drive.status)) reasons.push('drive_not_active');
  const tenantIds = await accessibleTenantIds(base.recruiter, base.company);
  if (!tenantIds.some((t) => String(t) === String(drive.tenantId))) reasons.push('college_not_authorized');
  if (reasons.length) return deny(ctx, reasons.join(','), 'PlacementDrive', driveId);
  return { ...base, drive };
}

// Step 7: candidate/application relationship.
async function assertCandidateAccess(user, applicationId, ctx) {
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError(404, 'Application not found');
  const access = await assertDriveAccess(user, application.driveId, ctx);
  if (String(application.driveId) !== String(access.drive._id) || String(application.tenantId) !== String(access.drive.tenantId)) return deny(ctx, 'application_drive_mismatch', 'Application', applicationId);
  return { ...access, application };
}

// ---------- College (TPO) level recruiter authorization ----------
async function authorizeForTenant(user, recruiterId, ctx) {
  const recruiter = await Recruiter.findById(recruiterId);
  if (!recruiter) throw new AppError(404, 'Recruiter not found');
  if (recruiter.status !== 'ACTIVE' || recruiter.authorizationStatus !== 'AUTHORIZED') throw new AppError(409, 'Recruiter must be active and platform-authorized first');
  const company = await Company.findById(recruiter.companyId);
  if (!company || company.verificationStatus !== 'VERIFIED' || company.status !== 'ACTIVE') throw new AppError(409, 'Company must be verified and active');
  const approval = await CollegeCompanyApproval.findOne({ tenantId: user.tenantId, companyId: company._id, status: 'APPROVED' });
  if (!approval) throw new AppError(409, 'Approve the company for your college before authorizing its recruiters');
  const auth = await RecruiterAuthorization.findOneAndUpdate(
    { recruiterId, tenantId: user.tenantId },
    { companyId: company._id, status: 'ACTIVE', authorizedBy: user.id, authorizedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true });
  await notify.notify(recruiter.userId, { type: 'COLLEGE_AUTHORIZATION', message: 'A college authorized you to recruit', link: '/recruiter/colleges', tenantId: user.tenantId });
  await audit.log(ctx, 'AUTHORIZE_RECRUITER_FOR_COLLEGE', 'RecruiterAuthorization', auth._id, { recruiterId });
  return auth;
}
async function revoke(user, id, ctx) {
  const auth = await RecruiterAuthorization.findOne({ _id: id, tenantId: user.tenantId });
  if (!auth) throw new AppError(404, 'Authorization not found');
  auth.status = 'REVOKED';
  await auth.save();
  await audit.log(ctx, 'REVOKE_RECRUITER_FOR_COLLEGE', 'RecruiterAuthorization', auth._id, {});
  return auth;
}
const list = (user, q) => paginate(RecruiterAuthorization, { tenantId: user.tenantId }, q, {
  populate: [{ path: 'companyId', select: 'name' }, { path: 'recruiterId', select: 'designation userId', populate: { path: 'userId', select: 'name email' } }],
});

module.exports = { assertRecruiterContext, accessibleTenantIds, accessibleDriveIds, assertDriveAccess, assertCandidateAccess, authorizeForTenant, revoke, list };
