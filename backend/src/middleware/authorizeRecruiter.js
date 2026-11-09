const ras = require('../services/recruiterAuthorizationService');
const auditContext = require('../utils/auditContext');
const { asyncHandler } = require('../utils/response');

// Ensures recruiter is active/authorized and the company is verified/active. Attaches req.recruiter / req.company.
const recruiterContext = asyncHandler(async (req, res, next) => {
  const { recruiter, company } = await ras.assertRecruiterContext(req.user, auditContext(req));
  req.recruiter = recruiter;
  req.company = company;
  next();
});
// Additionally ensures the :driveId (or :id) is a drive this recruiter is authorized for.
const recruiterDrive = (param = 'driveId') => asyncHandler(async (req, res, next) => {
  const r = await ras.assertDriveAccess(req.user, req.params[param], auditContext(req));
  req.recruiter = r.recruiter;
  req.company = r.company;
  req.drive = r.drive;
  next();
});
module.exports = { recruiterContext, recruiterDrive };
