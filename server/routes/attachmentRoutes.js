const router = require('express').Router({ mergeParams: true });
const multer = require('multer');
const path = require('path');
const attachmentController = require('../controllers/attachmentController');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

router.post('/', auth, upload.single('attachment'), attachmentController.create);
router.post('/:attachmentId/delete', auth, attachmentController.destroy);

module.exports = router;
