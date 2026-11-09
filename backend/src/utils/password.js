const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const env = require('../config/env');

const hashPassword = (pw) => bcrypt.hash(pw, env.BCRYPT_ROUNDS);
const comparePassword = (pw, hash) => bcrypt.compare(pw, hash);
const isStrongPassword = (pw = '') => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/.test(pw);
const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const hashOtp = (code, email, purpose) =>
  crypto.createHmac('sha256', env.OTP_PEPPER || 'pepper').update(`${email}|${purpose}|${code}`).digest('hex');
module.exports = { hashPassword, comparePassword, isStrongPassword, generateOtp, hashOtp };
