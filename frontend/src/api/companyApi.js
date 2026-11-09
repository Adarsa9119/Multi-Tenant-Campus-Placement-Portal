import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const companyApi = {
  list: (q) => unwrap(api.get('/companies', p(q))), // TPO: verified companies with college approval state
  me: () => unwrap(api.get('/companies/me')),
  updateMe: (b) => unwrap(api.put('/companies/me', b)),
  approvals: (q) => unwrap(api.get('/college-companies', p(q))),
  requestCollege: (tenantId) => unwrap(api.post('/college-companies/request', { tenantId })),
  decide: (companyId, action, notes) => unwrap(api.post(`/college-companies/${companyId}/${action}`, { notes })),
  directory: () => unwrap(api.get('/tenants/directory')),
  recruiterAuths: (q) => unwrap(api.get('/recruiter-authorizations', p(q))),
  authorizeRecruiter: (recruiterId) => unwrap(api.post('/recruiter-authorizations', { recruiterId })),
  revokeRecruiter: (id) => unwrap(api.post(`/recruiter-authorizations/${id}/revoke`)),
};
