const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// Upload single image
router.post('/image', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const url = req.file.path;
  res.status(201).json({
    success: true,
    image: { url, name: req.file.originalname, size: req.file.size }
  });
});

// Upload multiple images
router.post('/images', protect, adminOnly, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }
  const images = req.files.map(f => ({ url: f.path, name: f.originalname, size: f.size }));
  res.status(201).json({ success: true, images });
});

// Upload banner
router.post('/banner', protect, adminOnly, upload.single('banner'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const url = req.file.path;
  res.json({ success: true, image: { url, name: req.file.originalname } });
});

module.exports = router;
