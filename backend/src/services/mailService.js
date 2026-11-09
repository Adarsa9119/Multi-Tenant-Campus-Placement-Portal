const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;
function getTransport() {
  if (transporter) return transporter;
  if (!env.SMTP_HOST) throw new Error('SMTP_HOST must be configured to send email');
  if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) {
    throw new Error('SMTP_USER and SMTP_PASS must both be configured');
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
  return transporter;
}
async function send({ to, subject, text }) {
  if (env.NODE_ENV === 'test') return { skipped: true };
  try {
    return await getTransport().sendMail({ from: env.SMTP_FROM, to, subject, text });
  } catch (e) {
    console.error('Mail delivery failed:', e.message);
    throw e;
  }
}
async function sendOtp(to, code, purpose) {
  const label = { LOGIN: 'sign-in', ACTIVATE: 'account activation', RESET: 'password reset', COLLEGE_REGISTRATION: 'college registration', COMPANY_REGISTRATION: 'company registration' }[purpose] || 'verification';
  if (env.NODE_ENV === 'test') return { delivery: 'test' };
  await send({ to, subject: `Your verification code (${label})`, text: `Your one-time code is ${code}. It expires in ${env.OTP_TTL_MINUTES} minutes. Do not share it with anyone.` });
  return { delivery: 'email' };
}
const sendInvitation = (to, name, role) =>
  send({ to, subject: 'You have been invited to the Campus Placement Portal', text: `Hello ${name},\n\nAn account (${role}) has been created for you. Open ${env.CLIENT_URL}/activate, enter this email address and follow the OTP steps to set your password.\n` }).catch(() => null);
const sendNotice = (to, subject, text) => send({ to, subject, text }).catch(() => null);

module.exports = { send, sendOtp, sendInvitation, sendNotice };
