import api, { unwrap } from './axiosClient.js';

const p = (params) => ({ params });
export const interviewApi = {
  list: (q) => unwrap(api.get('/interviews', p(q))),
  schedule: (b) => unwrap(api.post('/interviews', b)),
  update: (id, b) => unwrap(api.put(`/interviews/${id}`, b)),
  result: (id, result, notes) => unwrap(api.post(`/interviews/${id}/result`, { result, notes })),
};
