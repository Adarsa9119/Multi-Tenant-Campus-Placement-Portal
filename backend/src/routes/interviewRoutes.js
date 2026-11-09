const router = require('express').Router();
const c = require('../controllers/interviewController');
const v = require('../validators/interviewValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticate);
router.get('/', authorizeRole('STUDENT', 'TPO', 'RECRUITER'), c.list);
router.post('/', authorizeRole('TPO', 'RECRUITER'), v.schedule, validate, c.schedule);
router.put('/:id', authorizeRole('TPO', 'RECRUITER'), v.update, validate, c.update);
router.post('/:id/result', authorizeRole('TPO', 'RECRUITER'), v.result, validate, c.result);
module.exports = router;
