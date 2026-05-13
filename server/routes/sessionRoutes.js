const router = require('express').Router();
const sessionController = require('../controllers/sessionController');

router.get('/login', sessionController.loginForm);
router.post('/login', sessionController.signIn);
router.post('/logout', sessionController.signOut);

module.exports = router;
    