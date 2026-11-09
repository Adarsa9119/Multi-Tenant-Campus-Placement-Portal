const audit = require('../services/auditService');
const { handle } = require('../utils/response');

module.exports = { list: handle((req) => audit.list(req.user, req.query)) };
