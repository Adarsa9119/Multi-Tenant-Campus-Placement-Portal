import api, { unwrap } from './axiosClient.js';

export const authApi = {
  login: (b) => unwrap(api.post('/auth/login', b)),
  verifyOtp: (b) => unwrap(api.post('/auth/verify-otp', b)),
  resendOtp: (b) => unwrap(api.post('/auth/resend-otp', b)),
  requestActivation: (b) => unwrap(api.post('/auth/request-activation', b)),
  activate: (b) => unwrap(api.post('/auth/activate', b)),
  forgotPassword: (b) => unwrap(api.post('/auth/forgot-password', b)),
  resetPassword: (b) => unwrap(api.post('/auth/reset-password', b)),
  me: () => unwrap(api.get('/auth/me')),
  collegeSettings: () => unwrap(api.get('/college-registrations/settings')),
  collegeSendOtp: (email) => unwrap(api.post('/college-registrations/send-otp', { email })),
  collegeRegister: (b) => unwrap(api.post('/college-registrations', b)),
  companySendOtp: (email) => unwrap(api.post('/companies/register/send-otp', { email })),
  companyRegister: (b) => unwrap(api.post('/companies/register', b)),
};
