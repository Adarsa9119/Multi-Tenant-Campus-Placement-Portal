const router = require('express').Router();
const c = require('../controllers/collegeCompanyController');
const v = require('../validators/companyValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const tenantContext = require('../middleware/tenantContext');

router.use(authenticate);
router.get('/', authorizeRole('TPO', 'RECRUITER'), c.list);
router.post('/request', authorizeRole('RECRUITER'), v.college, validate, c.request);
router.post('/:companyId/approve', authorizeRole('TPO'), tenantContext, v.collegeDecision, validate, c.decide('APPROVED'));
router.post('/:companyId/reject', authorizeRole('TPO'), tenantContext, v.collegeDecision, validate, c.decide('REJECTED'));
router.post('/:companyId/revoke', authorizeRole('TPO'), tenantContext, v.collegeDecision, validate, c.decide('REVOKED'));
module.exports = router;
