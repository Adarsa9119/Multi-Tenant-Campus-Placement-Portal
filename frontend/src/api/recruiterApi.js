import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const recruiterApi = {
  dashboard: () => unwrap(api.get('/recruiters/portal/dashboard')),
  companyOverview: () => unwrap(api.get('/recruiters/portal/company-overview')),
  drives: (q) => unwrap(api.get('/recruiters/portal/drives', p(q))),
  candidates: (q) => unwrap(api.get('/recruiters/portal/candidates', p(q))),
  candidate: (applicationId) => unwrap(api.get(`/recruiters/portal/candidates/${applicationId}`)),
  resumeBlob: (applicationId, download = false) => api.get(`/files/applications/${applicationId}/resume`, { params: { download: download ? 1 : 0 }, responseType: 'blob' }).then((r) => r.data),
  team: (q) => unwrap(api.get('/recruiters', p(q))),
  addRecruiter: (b) => unwrap(api.post('/recruiters', b)),
};
