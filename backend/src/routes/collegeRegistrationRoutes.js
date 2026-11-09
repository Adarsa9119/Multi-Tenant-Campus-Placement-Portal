const router = require('express').Router();
const c = require('../controllers/collegeRegistrationController');
const v = require('../validators/collegeValidators');
const validate = require('../middleware/validateRequest');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.get('/settings', c.publicSettings);
router.post('/send-otp', otpLimiter, v.sendOtp, validate, c.sendOtp);
router.post('/', authLimiter, v.register, validate, c.submit);
module.exports = router;
