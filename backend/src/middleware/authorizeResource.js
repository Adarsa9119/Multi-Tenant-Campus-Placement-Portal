const Student = require('../models/Student');
const Application = require('../models/Application');
const audit = require('../services/auditService');
const ras = require('../services/recruiterAuthorizationService');
const auditContext = require('../utils/auditContext');
const { AppError, asyncHandler } = require('../utils/response');

// Student: loads the caller's own student profile (never trusts an id from the client).
const studentSelf = asyncHandler(async (req, res, next) => {
  const s = await Student.findOne({ userId: req.user.id, tenantId: req.user.tenantId });
  if (!s) throw new AppError(404, 'Student profile not found');
  req.student = s;
  next();
});

// Application access by role: STUDENT own, TPO same tenant, RECRUITER via full authorization chain.
const applicationAccess = (param = 'id') => asyncHandler(async (req, res, next) => {
  const ctx = auditContext(req);
  const id = req.params[param];
  if (req.user.role === 'RECRUITER') {
    const { application } = await ras.assertCandidateAccess(req.user, id, ctx);
    req.application = application;
    return next();
  }
  const app = await Application.findById(id);
  if (!app) throw new AppError(404, 'Application not found');
  let allowed = false;
  if (req.user.role === 'TPO') allowed = String(app.tenantId) === String(req.user.tenantId);
  if (req.user.role === 'STUDENT') {
    const s = await Student.findOne({ userId: req.user.id }).select('_id');
    allowed = !!s && String(app.studentId) === String(s._id);
  }
  if (!allowed) {
    await audit.log(ctx, String(app.tenantId) !== String(req.user.tenantId) ? 'CROSS_TENANT_ACCESS_ATTEMPT' : 'AUTHORIZATION_DENIED', 'Application', app._id, {});
    throw new AppError(403, 'Access denied');
  }
  req.application = app;
  return next();
});

module.exports = { studentSelf, applicationAccess };
