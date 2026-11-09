const router = require('express').Router();
const c = require('../controllers/recruiterAuthorizationController');
const v = require('../validators/recruiterValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const tenantContext = require('../middleware/tenantContext');

router.use(authenticate, authorizeRole('TPO'), tenantContext);
router.get('/', c.list);
router.post('/', v.authorizeForTenant, validate, c.authorize);
router.post('/:id/revoke', c.revoke);
module.exports = router;
