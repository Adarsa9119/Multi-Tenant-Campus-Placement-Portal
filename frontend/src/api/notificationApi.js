import api, { unwrap } from './axiosClient.js';

export const notificationApi = {
  list: (q) => unwrap(api.get('/notifications', { params: q })),
  unread: () => unwrap(api.get('/notifications/unread-count')),
  read: (id) => unwrap(api.post(`/notifications/${id}/read`)),
  readAll: () => unwrap(api.post('/notifications/read-all')),
};
