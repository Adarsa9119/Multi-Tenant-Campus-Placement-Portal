const router = require('express').Router();
const c = require('../controllers/reportController');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticate, authorizeRole('TPO', 'SUPER_ADMIN'));
router.get('/placement-summary', c.placementSummary);
router.get('/drive-wise', c.driveWise);
router.get('/company-participation', c.companyParticipation);
router.get('/department-summary', c.departmentSummary);
router.get('/security-summary', c.securitySummary);
module.exports = router;
