import api, { unwrap } from './axiosClient.js';

export const supportApi = {
  list: (q) => unwrap(api.get('/support', { params: q })),
  create: (b) => unwrap(api.post('/support', b)),
  update: (id, b) => unwrap(api.put(`/support/${id}`, b)),
};
