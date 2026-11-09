const tenants = require('../services/tenantService');
const reports = require('../services/reportService');
const ctx = require('../utils/auditContext');
const { handle } = require('../utils/response');

module.exports = {
  dashboard: handle((req) => reports.adminDashboard(req.user)),
  listRegistrations: handle((req) => tenants.listRegistrations(req.query)),
  getRegistration: handle((req) => tenants.getRegistration(req.params.id)),
  review: handle((req) => tenants.review(req.params.id, req.user, ctx(req), req.body.notes), 'Moved to review'),
  approve: handle((req) => tenants.approve(req.params.id, req.user, ctx(req), req.body.notes), 'College approved and tenant created'),
  reject: handle((req) => tenants.reject(req.params.id, req.user, ctx(req), req.body.notes), 'College rejected'),
  listTenants: handle((req) => tenants.listTenants(req.query)),
  setTenantStatus: (status) => handle((req) => tenants.setTenantStatus(req.params.id, status, ctx(req)), `Tenant ${status.toLowerCase()}d`),
  listTpos: handle((req) => tenants.listTpos(req.query)),
  inviteTpo: handle((req) => tenants.inviteTpo(req.body, ctx(req)), 'TPO invited', 201),
  setTpoStatus: handle((req) => tenants.setUserStatus(req.params.id, req.body.status, 'TPO', ctx(req)), 'TPO status updated'),
  listAdmins: handle((req) => tenants.listAdmins(req.query)),
  inviteAdmin: handle((req) => tenants.inviteAdmin(req.body, ctx(req)), 'Platform admin invited', 201),
  setAdminStatus: handle((req) => tenants.setUserStatus(req.params.id, req.body.status, 'SUPER_ADMIN', ctx(req)), 'Admin status updated'),
  studentsOverview: handle((req) => tenants.studentsOverview(req.query)),
  getSettings: handle(() => tenants.getSettings()),
  updateSettings: handle((req) => tenants.updateSettings(req.user, req.body, ctx(req)), 'Settings saved'),
};
