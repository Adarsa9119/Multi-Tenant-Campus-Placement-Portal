require('dotenv').config();
const num = (v, d) => (v === undefined || v === '' || isNaN(+v) ? d : +v);
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: num(process.env.PORT, 5000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  OTP_TTL_MINUTES: num(process.env.OTP_TTL_MINUTES, 5),
  OTP_MAX_ATTEMPTS: num(process.env.OTP_MAX_ATTEMPTS, 5),
  OTP_RESEND_COOLDOWN_SECONDS: num(process.env.OTP_RESEND_COOLDOWN_SECONDS, 45),
  OTP_PEPPER: process.env.OTP_PEPPER || process.env.JWT_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: num(process.env.SMTP_PORT, 587),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || process.env.SMTP_USERNAME || '',
  SMTP_PASS: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Campus Placement Portal <no-reply@example.com>',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_RESUME_MB: num(process.env.MAX_RESUME_MB, 5),
  BCRYPT_ROUNDS: process.env.NODE_ENV === 'test' ? 4 : 12,
  SEED_SUPER_ADMIN_NAME: process.env.SEED_SUPER_ADMIN_NAME || 'Platform Admin',
  SEED_SUPER_ADMIN_EMAIL: process.env.SEED_SUPER_ADMIN_EMAIL || 'padhuncmrwf@gmail.com',
  SEED_DEMO_PASSWORD: process.env.SEED_DEMO_PASSWORD || 'Demo@12345',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'Campus Placement Portal',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
};
if (env.NODE_ENV !== 'test') {
  for (const k of ['MONGO_URI', 'JWT_SECRET']) {
    if (!env[k]) throw new Error(`Missing required environment variable: ${k}`);
  }
  if (env.NODE_ENV === 'production' && !env.BREVO_API_KEY && !env.SMTP_HOST) {
    throw new Error('Missing required email configuration: A real email provider (BREVO_API_KEY or SMTP_HOST) must be configured in production');
  }
  if (env.NODE_ENV === 'production' && !process.env.OTP_PEPPER) {
    throw new Error('Missing required environment variable: OTP_PEPPER (use a separate random secret in production)');
  }
}
module.exports = env;
