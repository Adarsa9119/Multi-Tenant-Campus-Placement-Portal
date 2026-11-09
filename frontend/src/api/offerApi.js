import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const offerApi = {
  list: (q) => unwrap(api.get('/offers', p(q))),
  create: (b) => unwrap(api.post('/offers', b)),
  respond: (id, accept) => unwrap(api.post(`/offers/${id}/respond`, { accept })),
};
