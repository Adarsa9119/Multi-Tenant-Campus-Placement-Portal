const router = require('express').Router();
const c = require('../controllers/offerController');
const v = require('../validators/offerValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticate);
router.get('/', authorizeRole('STUDENT', 'TPO', 'RECRUITER'), c.list);
router.post('/', authorizeRole('TPO', 'RECRUITER'), v.create, validate, c.create);
router.post('/:id/respond', authorizeRole('STUDENT'), v.respond, validate, c.respond);
module.exports = router;
