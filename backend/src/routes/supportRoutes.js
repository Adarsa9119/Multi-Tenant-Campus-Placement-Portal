const router = require('express').Router();
const c = require('../controllers/supportController');
const v = require('../validators/supportValidators');
const validate = require('../middleware/validateRequest');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticate);
router.post('/', v.create, validate, c.create);
router.get('/', c.list);
router.put('/:id', authorizeRole('SUPER_ADMIN', 'TPO'), v.update, validate, c.update);
module.exports = router;
