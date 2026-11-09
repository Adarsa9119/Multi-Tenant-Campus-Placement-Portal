const SupportTicket = require('../models/SupportTicket');
const notify = require('./notificationService');
const { AppError } = require('../utils/response');
const { paginate } = require('../utils/pagination');

async function create(user, b) {
  // Students raise college-level tickets (handled by the TPO); everyone else raises platform tickets (Super Admin).
  const scope = user.role === 'STUDENT' ? 'TENANT' : 'PLATFORM';
  const ticketNo = `STK-${100 + (await SupportTicket.countDocuments())}`;
  const t = await SupportTicket.create({ ticketNo, tenantId: user.tenantId, createdBy: user.id, createdByRole: user.role, scope, subject: b.subject, issue: b.issue });
  if (scope === 'TENANT') await notify.notifyTpos(user.tenantId, { type: 'SUPPORT', message: `New support ticket ${ticketNo}: ${b.subject}`, link: '/tpo/support' });
  else await notify.notifyAdmins({ type: 'SUPPORT', message: `New support ticket ${ticketNo}: ${b.subject}`, link: '/admin/support' });
  return t;
}
function list(user, q) {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (user.role === 'SUPER_ADMIN') filter.scope = 'PLATFORM';
  else if (user.role === 'TPO') { filter.$or = [{ tenantId: user.tenantId, scope: 'TENANT' }, { createdBy: user.id }]; }
  else filter.createdBy = user.id;
  return paginate(SupportTicket, filter, q, { populate: { path: 'createdBy', select: 'name role' } });
}
async function update(user, id, b) {
  const filter = { _id: id };
  if (user.role === 'SUPER_ADMIN') filter.scope = 'PLATFORM';
  else if (user.role === 'TPO') { filter.tenantId = user.tenantId; filter.scope = 'TENANT'; }
  else throw new AppError(403, 'Not allowed');
  const t = await SupportTicket.findOne(filter);
  if (!t) throw new AppError(404, 'Ticket not found');
  if (b.status) t.status = b.status;
  if (b.response !== undefined) t.response = b.response;
  if (b.escalate && user.role === 'TPO') t.scope = 'PLATFORM'; // TPO escalates to the Super Admin
  t.assignedTo = user.id;
  await t.save();
  await notify.notify(t.createdBy, { type: 'SUPPORT', message: `Your ticket ${t.ticketNo} is now ${t.status.replace('_', ' ').toLowerCase()}`, link: '/support' });
  return t;
}
module.exports = { create, list, update };
