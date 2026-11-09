const router = require('express').Router();
const c = require('../controllers/fileController');
const v = require('../validators/fileValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const tenantContext = require('../middleware/tenantContext');
const { resumeUpload } = require('../middleware/uploadMiddleware');

router.use(authenticate);
router.post('/resume', authorizeRole('STUDENT'), tenantContext, resumeUpload, c.upload);
router.get('/resume/meta', authorizeRole('STUDENT'), tenantContext, c.meta);
router.get('/resume/me', authorizeRole('STUDENT'), tenantContext, c.mine);
router.get('/applications/:applicationId/resume', authorizeRole('TPO', 'RECRUITER'), v.applicationParam, validate, c.forApplication);
module.exports = router;
