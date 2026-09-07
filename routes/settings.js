const express = require('express');
const router = express.Router();
const { getPublicSettings, getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', getPublicSettings);

router.route('/')
  .get(protect, adminOnly, getSettings)
  .put(protect, adminOnly, updateSettings);

module.exports = router;
