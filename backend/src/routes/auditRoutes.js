const router = require('express').Router();
const c = require('../controllers/auditController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.get('/', authenticate, authorizeRole('SUPER_ADMIN', 'TPO'), c.list);
module.exports = router;
