import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const studentApi = {
  // student self-service
  dashboard: () => unwrap(api.get('/student/dashboard')),
  profile: () => unwrap(api.get('/student/profile')),
  updateProfile: (b) => unwrap(api.put('/student/profile', b)),
  placementStatus: () => unwrap(api.get('/student/placement-status')),
  drives: () => unwrap(api.get('/student/drives')),
  drive: (id) => unwrap(api.get(`/student/drives/${id}`)),
  eligibility: () => unwrap(api.get('/student/eligibility')),
  resumeMeta: () => unwrap(api.get('/files/resume/meta')),
  uploadResume: (file) => { const f = new FormData(); f.append('resume', file); return unwrap(api.post('/files/resume', f)); },
  resumeBlob: () => api.get('/files/resume/me', { responseType: 'blob' }).then((r) => r.data),
  // TPO student management
  list: (q) => unwrap(api.get('/tpo/students', p(q))),
  get: (id) => unwrap(api.get(`/tpo/students/${id}`)),
  create: (b) => unwrap(api.post('/tpo/students', b)),
  bulk: (file) => { const f = new FormData(); f.append('file', file); return unwrap(api.post('/tpo/students/bulk', f)); },
  verify: (id, b) => unwrap(api.post(`/tpo/students/${id}/verify`, b)),
  update: (id, b) => unwrap(api.put(`/tpo/students/${id}`, b)),
  departments: (q) => unwrap(api.get('/tpo/departments', p(q))),
  createDepartment: (b) => unwrap(api.post('/tpo/departments', b)),
  tpoDashboard: () => unwrap(api.get('/tpo/dashboard')),
  tenantMe: () => unwrap(api.get('/tenants/me')),
};
