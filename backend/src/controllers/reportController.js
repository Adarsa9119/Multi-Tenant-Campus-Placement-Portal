const r = require('../services/reportService');
const { handle } = require('../utils/response');

module.exports = {
  placementSummary: handle((req) => r.placementSummary(req.user)),
  driveWise: handle((req) => r.driveWise(req.user)),
  companyParticipation: handle((req) => r.companyParticipation(req.user)),
  departmentSummary: handle((req) => r.departmentSummary(req.user)),
  securitySummary: handle((req) => r.securitySummary(req.user)),
};
