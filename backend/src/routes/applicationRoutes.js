const router = require('express').Router();
const c = require('../controllers/applicationController');
const v = require('../validators/applicationValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const tenantContext = require('../middleware/tenantContext');
const { applicationAccess } = require('../middleware/authorizeResource');

router.use(authenticate);
router.post('/', authorizeRole('STUDENT'), tenantContext, v.apply, validate, c.apply);
router.get('/', authorizeRole('STUDENT', 'TPO', 'RECRUITER'), c.list);
router.get('/:id', authorizeRole('STUDENT', 'TPO', 'RECRUITER'), applicationAccess('id'), c.get);
router.post('/:id/status', authorizeRole('TPO', 'RECRUITER'), applicationAccess('id'), v.status, validate, c.changeStatus);
module.exports = router;
