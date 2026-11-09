import api, { unwrap } from './axiosClient.js';

export const reportApi = {
  get: (name) => unwrap(api.get(`/reports/${name}`)),
};
