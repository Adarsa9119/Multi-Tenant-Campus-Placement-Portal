export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');
export const isPhone = (v) => /^\d{10}$/.test(v || '');
export const isPincode = (v) => /^\d{6}$/.test(v || '');
export const isStrongPassword = (v = '') => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(v);
export const PASSWORD_HINT = '8-64 characters with upper, lower, digit and special character';
