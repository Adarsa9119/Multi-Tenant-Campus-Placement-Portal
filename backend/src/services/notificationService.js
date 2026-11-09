const Notification = require('../models/Notification');
const User = require('../models/User');

async function notify(userId, { type, message, tenantId, link }) {
  if (!userId) return null;
  try { return await Notification.create({ userId, tenantId, type, message, link }); } catch (e) { return null; }
}
async function notifyMany(userIds, payload) {
  const unique = [...new Set((userIds || []).map(String))];
  await Promise.all(unique.map((id) => notify(id, payload)));
}
async function notifyAdmins(payload) {
  const admins = await User.find({ role: 'SUPER_ADMIN', status: 'ACTIVE' }).select('_id').lean();
  await notifyMany(admins.map((a) => a._id), payload);
}
async function notifyTpos(tenantId, payload) {
  const tpos = await User.find({ role: 'TPO', tenantId, status: 'ACTIVE' }).select('_id').lean();
  await notifyMany(tpos.map((a) => a._id), { ...payload, tenantId });
}
async function list(user, q = {}) {
  const { paginate } = require('../utils/pagination');
  const filter = { userId: user.id };
  if (q.unread === 'true') filter.read = false;
  const out = await paginate(Notification, filter, q);
  out.meta.unread = await Notification.countDocuments({ userId: user.id, read: false });
  return out;
}
const markRead = (user, id) => Notification.updateOne({ _id: id, userId: user.id }, { read: true }).then(() => ({ read: true }));
const markAllRead = (user) => Notification.updateMany({ userId: user.id, read: false }, { read: true }).then(() => ({ read: true }));
const unreadCount = (user) => Notification.countDocuments({ userId: user.id, read: false }).then((count) => ({ count }));

module.exports = { notify, notifyMany, notifyAdmins, notifyTpos, list, markRead, markAllRead, unreadCount };
