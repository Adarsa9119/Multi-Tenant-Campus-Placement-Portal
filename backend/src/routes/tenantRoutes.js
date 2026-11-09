const router = require('express').Router();
const c = require('../controllers/tenantController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticate);
router.get('/directory', authorizeRole('RECRUITER', 'SUPER_ADMIN'), c.directory);
router.get('/me', authorizeRole('TPO', 'STUDENT'), c.mine);
module.exports = router;
