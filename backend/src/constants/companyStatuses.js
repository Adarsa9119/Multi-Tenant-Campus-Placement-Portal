const COMPANY_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', SUSPENDED: 'SUSPENDED', INACTIVE: 'INACTIVE' });
// College/TPO recruitment authorization of a company (distinct from platform verification)
const COLLEGE_COMPANY_STATUS = Object.freeze({ REQUESTED: 'REQUESTED', APPROVED: 'APPROVED', REJECTED: 'REJECTED', REVOKED: 'REVOKED' });
module.exports = { COMPANY_STATUS, COLLEGE_COMPANY_STATUS };
