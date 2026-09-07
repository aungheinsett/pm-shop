const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '#' },
  imageUrl: { type: String, default: '' },
  bgColor: { type: String, default: '#c0392b' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('HeroBanner', heroBannerSchema);
