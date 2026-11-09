const router = require('express').Router();
const c = require('../controllers/companyController');
const v = require('../validators/companyValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register/send-otp', otpLimiter, v.sendOtp, validate, c.sendOtp);
router.post('/register', authLimiter, v.register, validate, c.register);

router.use(authenticate);
router.get('/me', authorizeRole('RECRUITER'), c.me);
router.put('/me', authorizeRole('RECRUITER'), v.update, validate, c.updateMe);
router.get('/', authorizeRole('SUPER_ADMIN', 'TPO'), c.list);
router.post('/:id/verify', authorizeRole('SUPER_ADMIN'), v.decision, validate, c.verify);
router.post('/:id/reject', authorizeRole('SUPER_ADMIN'), v.decision, validate, c.reject);
router.post('/:id/review', authorizeRole('SUPER_ADMIN'), v.decision, validate, c.review);
router.post('/:id/suspend', authorizeRole('SUPER_ADMIN'), v.decision, validate, c.suspend);
router.post('/:id/reinstate', authorizeRole('SUPER_ADMIN'), c.reinstate);
module.exports = router;
