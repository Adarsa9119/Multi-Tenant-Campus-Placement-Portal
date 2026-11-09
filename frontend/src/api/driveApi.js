import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const driveApi = {
  list: (q) => unwrap(api.get('/drives', p(q))),
  get: (id) => unwrap(api.get(`/drives/${id}`)),
  create: (b) => unwrap(api.post('/drives', b)),
  update: (id, b) => unwrap(api.put(`/drives/${id}`, b)),
  action: (id, action) => unwrap(api.post(`/drives/${id}/${action}`)),
  eligibility: (id) => unwrap(api.get(`/drives/${id}/eligibility`)),
};
