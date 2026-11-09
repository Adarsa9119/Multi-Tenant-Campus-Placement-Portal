const tenants = require('../services/tenantService');
const { handle } = require('../utils/response');

module.exports = {
  directory: handle(() => tenants.directory()),
  mine: handle((req) => tenants.myTenant(req.user)),
};
