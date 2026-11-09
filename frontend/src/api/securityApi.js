import api, { unwrap } from './axiosClient.js';

export const securityApi = {
  list: (q) => unwrap(api.get('/security-alerts', { params: q })),
  setStatus: (id, status) => unwrap(api.post(`/security-alerts/${id}/status`, { status })),
};
