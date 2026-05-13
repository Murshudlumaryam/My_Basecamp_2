const router = require('express').Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.get('/new', auth, projectController.newProject);
router.post('/', auth, projectController.create);

router.get('/:id/edit', auth, projectController.edit);
router.post('/:id', auth, projectController.update);
router.post('/:id/members', auth, projectController.addMember);
router.post('/:id/members/:userId/delete', auth, projectController.removeMember);

router.get('/:id', auth, projectController.show);
router.get('/', auth, projectController.index);

router.post('/:id/delete', auth, projectController.destroy);

router.use('/:projectId/attachments', require('./attachmentRoutes'));
router.use('/:projectId/threads', require('./threadRoutes'));

module.exports = router;