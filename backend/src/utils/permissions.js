const { ROLE_PERMISSIONS } = require('../constants/permissions');
const hasPermission = (role, permission) => (ROLE_PERMISSIONS[role] || []).includes(permission);
module.exports = { hasPermission };
