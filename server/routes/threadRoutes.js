const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const threadController = require('../controllers/threadController');
const messageController = require('../controllers/messageController');

router.post('/', auth, threadController.create);
router.get('/:threadId', auth, threadController.show);
router.get('/:threadId/edit', auth, threadController.editForm);
router.post('/:threadId', auth, threadController.update);
router.post('/:threadId/delete', auth, threadController.destroy);

router.post('/:threadId/messages', auth, messageController.create);
router.post('/:threadId/messages/:messageId', auth, messageController.update);
router.post('/:threadId/messages/:messageId/delete', auth, messageController.destroy);

module.exports = router;