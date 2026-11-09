const alerts = require('../services/securityAlertService');
const { handle } = require('../utils/response');

module.exports = {
  list: handle((req) => alerts.list(req.user, req.query)),
  update: handle((req) => alerts.updateStatus(req.user, req.params.id, req.body.status), 'Alert updated'),
};
