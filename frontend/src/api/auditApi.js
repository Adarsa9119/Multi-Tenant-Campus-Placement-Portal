import api, { unwrap } from './axiosClient.js';

export const auditApi = { list: (q) => unwrap(api.get('/audit-logs', { params: q })) };
