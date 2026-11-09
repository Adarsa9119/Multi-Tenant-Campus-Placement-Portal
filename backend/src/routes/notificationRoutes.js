const router = require('express').Router();
const c = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/', c.list);
router.get('/unread-count', c.unread);
router.post('/read-all', c.readAll);
router.post('/:id/read', c.read);
module.exports = router;
