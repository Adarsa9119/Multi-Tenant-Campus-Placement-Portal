const n = require('../services/notificationService');
const { handle } = require('../utils/response');

module.exports = {
  list: handle((req) => n.list(req.user, req.query)),
  unread: handle((req) => n.unreadCount(req.user)),
  read: handle((req) => n.markRead(req.user, req.params.id)),
  readAll: handle((req) => n.markAllRead(req.user)),
};
