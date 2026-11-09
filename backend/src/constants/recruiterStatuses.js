const RECRUITER_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED', INACTIVE: 'INACTIVE' });
// Platform-level authorization of an individual recruiter
const RECRUITER_AUTH_STATUS = Object.freeze({ PENDING: 'PENDING', AUTHORIZED: 'AUTHORIZED', REVOKED: 'REVOKED' });
// College-level authorization of a recruiter
const TENANT_AUTH_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', REVOKED: 'REVOKED' });
module.exports = { RECRUITER_STATUS, RECRUITER_AUTH_STATUS, TENANT_AUTH_STATUS };
