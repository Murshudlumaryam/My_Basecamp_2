const router = require('express').Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/new', userController.newUser);
router.post('/', userController.create);

router.get('/', auth, userController.index);
router.get('/:id', auth, userController.show);
router.post('/:id/delete', auth, userController.destroy);

router.post('/:id/admin', auth, userController.setAdmin);
router.post('/:id/remove-admin', auth, userController.removeAdmin);

module.exports = router;