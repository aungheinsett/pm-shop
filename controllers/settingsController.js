const Settings = require('../models/Settings');

// @desc    Get public settings
// @route   GET /api/settings/public
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      success: true,
      settings: {
        storeName: settings.storeName,
        storeTagline: settings.storeTagline,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        currency: settings.currency,
        shipping: settings.shipping,
        social: settings.social,
        logo: settings.logo,
        bannerImages: settings.bannerImages,
        maintenanceMode: settings.maintenanceMode
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all settings (admin)
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Deep merge for nested objects
    if (req.body.currency) settings.currency = { ...settings.currency, ...req.body.currency };
    if (req.body.shipping) settings.shipping = { ...settings.shipping, ...req.body.shipping };
    if (req.body.social) settings.social = { ...settings.social, ...req.body.social };
    if (req.body.seo) settings.seo = { ...settings.seo, ...req.body.seo };

    const updateFields = ['storeName', 'storeTagline', 'storeEmail', 'storePhone', 'storeAddress', 'logo', 'bannerImages', 'maintenanceMode'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) settings[field] = req.body[field];
    });

    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};
