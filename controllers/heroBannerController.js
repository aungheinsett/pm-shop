const HeroBanner = require('../models/HeroBanner');

// @desc    Get all hero banners (admin)
// @route   GET /api/hero-banners
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await HeroBanner.find().sort('sortOrder');
    res.json({ success: true, banners });
  } catch (err) { next(err); }
};

// @desc    Get active hero banners (public)
// @route   GET /api/hero-banners/public
exports.getActiveBanners = async (req, res, next) => {
  try {
    const banners = await HeroBanner.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, banners });
  } catch (err) { next(err); }
};

// @desc    Create hero banner
// @route   POST /api/hero-banners
exports.createBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (err) { next(err); }
};

// @desc    Update hero banner
// @route   PUT /api/hero-banners/:id
exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' });
    res.json({ success: true, banner });
  } catch (err) { next(err); }
};

// @desc    Delete hero banner
// @route   DELETE /api/hero-banners/:id
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await HeroBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
