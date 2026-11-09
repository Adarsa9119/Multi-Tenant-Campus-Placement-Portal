const router = require('express').Router();
const c = require('../controllers/recruiterController');
const v = require('../validators/recruiterValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const { recruiterDrive } = require('../middleware/authorizeRecruiter');
const { applicationAccess } = require('../middleware/authorizeResource');

router.use(authenticate);
// Recruiter portal (drive-scoped; every candidate route re-checks the full authorization chain)
router.get('/portal/company-overview', authorizeRole('RECRUITER'), c.companyOverview);
router.get('/portal/dashboard', authorizeRole('RECRUITER'), c.dashboard);
router.get('/portal/drives', authorizeRole('RECRUITER'), c.drives);
router.get('/portal/drives/:driveId', authorizeRole('RECRUITER'), recruiterDrive('driveId'), c.drive);
router.get('/portal/drives/:driveId/candidates', authorizeRole('RECRUITER'), recruiterDrive('driveId'), c.driveCandidates);
router.get('/portal/candidates', authorizeRole('RECRUITER'), c.candidates);
router.get('/portal/candidates/:applicationId', authorizeRole('RECRUITER'), applicationAccess('applicationId'), c.candidate);
// Management
router.get('/', authorizeRole('SUPER_ADMIN', 'TPO', 'RECRUITER'), c.list);
router.post('/', authorizeRole('SUPER_ADMIN', 'RECRUITER'), v.create, validate, c.create);
router.post('/:id/authorize', authorizeRole('SUPER_ADMIN'), c.authorize);
router.post('/:id/suspend', authorizeRole('SUPER_ADMIN'), v.reason, validate, c.suspend);
router.post('/:id/reinstate', authorizeRole('SUPER_ADMIN'), c.reinstate);
module.exports = router;
