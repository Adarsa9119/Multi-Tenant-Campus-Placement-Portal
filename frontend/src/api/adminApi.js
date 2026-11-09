import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const adminApi = {
  dashboard: () => unwrap(api.get('/admin/dashboard')),
  registrations: (q) => unwrap(api.get('/admin/college-registrations', p(q))),
  registration: (id) => unwrap(api.get(`/admin/college-registrations/${id}`)),
  decideRegistration: (id, action, notes) => unwrap(api.post(`/admin/college-registrations/${id}/${action}`, { notes })),
  tenants: (q) => unwrap(api.get('/admin/tenants', p(q))),
  setTenant: (id, action) => unwrap(api.post(`/admin/tenants/${id}/${action}`)),
  tpos: (q) => unwrap(api.get('/admin/tpos', p(q))),
  inviteTpo: (b) => unwrap(api.post('/admin/tpos', b)),
  setTpoStatus: (id, status) => unwrap(api.post(`/admin/tpos/${id}/status`, { status })),
  admins: (q) => unwrap(api.get('/admin/platform-admins', p(q))),
  inviteAdmin: (b) => unwrap(api.post('/admin/platform-admins', b)),
  setAdminStatus: (id, status) => unwrap(api.post(`/admin/platform-admins/${id}/status`, { status })),
  studentsOverview: (q) => unwrap(api.get('/admin/students-overview', p(q))),
  settings: () => unwrap(api.get('/admin/settings')),
  saveSettings: (b) => unwrap(api.put('/admin/settings', b)),
  // companies & recruiters (platform level)
  companies: (q) => unwrap(api.get('/companies', p(q))),
  companyAction: (id, action, body = {}) => unwrap(api.post(`/companies/${id}/${action}`, body)),
  recruiters: (q) => unwrap(api.get('/recruiters', p(q))),
  recruiterAction: (id, action, body = {}) => unwrap(api.post(`/recruiters/${id}/${action}`, body)),
};
