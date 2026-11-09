import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const applicationApi = {
  apply: (driveId) => unwrap(api.post('/applications', { driveId })),
  list: (q) => unwrap(api.get('/applications', p(q))),
  get: (id) => unwrap(api.get(`/applications/${id}`)),
  setStatus: (id, status, remarks) => unwrap(api.post(`/applications/${id}/status`, { status, remarks })),
};
