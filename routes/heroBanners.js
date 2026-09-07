const express = require('express');
const router = express.Router();
const { getBanners, getActiveBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/heroBannerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', getActiveBanners);
router.get('/', protect, adminOnly, getBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
