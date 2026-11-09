const recruiters = require('../services/recruiterService');
const reports = require('../services/reportService');
const drives = require('../services/driveService');
const apps = require('../services/applicationService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  list: handle((req) => recruiters.list(req.user, req.query)),
  create: handle((req) => recruiters.create(req.user, req.body, ctx(req)), 'Recruiter invited', 201),
  authorize: handle((req) => recruiters.authorize(req.params.id, req.user, ctx(req)), 'Recruiter authorized'),
  suspend: handle((req) => recruiters.suspend(req.params.id, ctx(req), req.body.reason), 'Recruiter suspended'),
  reinstate: handle((req) => recruiters.reinstate(req.params.id, ctx(req)), 'Recruiter reinstated'),
  // Recruiter portal
  dashboard: handle((req) => reports.recruiterDashboard(req.user, ctx(req))),
  companyOverview: handle((req) => reports.companyOverview(req.user)),
  drives: handle((req) => drives.list(req.user, req.query, ctx(req))),
  drive: handle((req) => drives.get(req.user, req.params.driveId, ctx(req))),
  driveCandidates: handle((req) => apps.list(req.user, { ...req.query, driveId: req.params.driveId }, ctx(req))),
  candidates: handle((req) => apps.list(req.user, req.query, ctx(req))),
  candidate: handle((req) => apps.get(req.user, req.params.applicationId, ctx(req))),
};
