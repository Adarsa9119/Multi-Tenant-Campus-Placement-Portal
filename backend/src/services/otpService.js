const Otp = require('../models/Otp');
const env = require('../config/env');
const mail = require('./mailService');
const audit = require('./auditService');
const { generateOtp, hashOtp } = require('../utils/password');
const { AppError } = require('../utils/response');

const norm = (e) => String(e || '').trim().toLowerCase();

async function issue({ email, purpose, userId }, ctx = {}) {
  email = norm(email);
  const last = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (last) {
    const wait = env.OTP_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - last.createdAt.getTime());
    if (wait > 0) throw new AppError(429, `Please wait ${Math.ceil(wait / 1000)}s before requesting another OTP`, { retryAfter: Math.ceil(wait / 1000) });
  }
  await Otp.updateMany({ email, purpose, status: 'PENDING' }, { status: 'REPLACED' });
  const code = generateOtp();
  const record = await Otp.create({ email, purpose, userId, codeHash: hashOtp(code, email, purpose), expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000) });
  let result;
  try {
    result = await mail.sendOtp(email, code, purpose);
  } catch (error) {
    await Otp.deleteOne({ _id: record._id });
    throw error;
  }
  const delivery = result?.delivery || (env.NODE_ENV === 'test' ? 'test' : 'email');
  await audit.log({ ...ctx, actorId: userId || ctx.actorId }, 'OTP_SENT', 'Otp', record._id, { email, purpose, delivery });
  return { delivery, resendAfter: env.OTP_RESEND_COOLDOWN_SECONDS, expiresInMinutes: env.OTP_TTL_MINUTES };
}

async function verify({ email, purpose, code }, ctx = {}) {
  email = norm(email);
  const fail = async (rec, reason) => {
    await audit.log({ ...ctx, actorId: rec?.userId || ctx.actorId }, 'OTP_FAILED', 'Otp', rec?._id, { email, purpose, reason });
    throw new AppError(400, 'Invalid or expired OTP');
  };
  const codeHash = hashOtp(String(code || ''), email, purpose);
  const now = new Date();
  const rec = await Otp.findOneAndUpdate(
    { email, purpose, status: 'PENDING', expiresAt: { $gte: now }, attempts: { $lt: env.OTP_MAX_ATTEMPTS }, codeHash },
    { $set: { status: 'USED' } },
    { new: true },
  );
  if (rec) {
    await audit.log({ ...ctx, actorId: rec.userId || ctx.actorId }, 'OTP_VERIFIED', 'Otp', rec._id, { email, purpose });
    return rec;
  }

  const pending = await Otp.findOne({ email, purpose, status: 'PENDING' }).sort({ createdAt: -1 });
  if (!pending) return fail(null, 'no_pending_otp');
  if (pending.expiresAt < now) {
    await Otp.updateOne({ _id: pending._id, status: 'PENDING', expiresAt: { $lt: now } }, { $set: { status: 'EXPIRED' } });
    return fail(pending, 'expired');
  }
  if (pending.attempts >= env.OTP_MAX_ATTEMPTS) {
    await Otp.updateOne({ _id: pending._id, status: 'PENDING', attempts: { $gte: env.OTP_MAX_ATTEMPTS } }, { $set: { status: 'LOCKED' } });
    return fail(pending, 'locked');
  }
  if (pending.codeHash === codeHash) return fail(pending, 'already_used_or_locked');

  const attempted = await Otp.findOneAndUpdate(
    { _id: pending._id, status: 'PENDING', expiresAt: { $gte: now }, attempts: { $lt: env.OTP_MAX_ATTEMPTS }, codeHash: { $ne: codeHash } },
    { $inc: { attempts: 1 } },
    { new: true },
  );
  if (attempted?.attempts >= env.OTP_MAX_ATTEMPTS) {
    await Otp.updateOne({ _id: attempted._id, status: 'PENDING', attempts: { $gte: env.OTP_MAX_ATTEMPTS } }, { $set: { status: 'LOCKED' } });
  }
  return fail(attempted || pending, 'mismatch');
}

module.exports = { issue, verify };
