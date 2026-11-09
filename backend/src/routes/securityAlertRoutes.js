const router = require('express').Router();
const c = require('../controllers/securityAlertController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const { body } = require('express-validator');
const validate = require('../middleware/validateRequest');

router.use(authenticate, authorizeRole('SUPER_ADMIN', 'TPO'));
router.get('/', c.list);
router.post('/:id/status', body('status').isIn(['OPEN', 'INVESTIGATING', 'RESOLVED']), validate, c.update);
module.exports = router;
