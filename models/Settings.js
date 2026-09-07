const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'PM Online' },
  storeTagline: { type: String, default: 'Premium Handbags Store' },
  storeEmail: { type: String, default: 'support@pmonline.com' },
  storePhone: { type: String, default: '+95 9-XXX-XXX-XXX' },
  storeAddress: { type: String, default: 'Yangon, Myanmar' },
  currency: {
    primary: { type: String, default: 'MMK' },
    secondary: { type: String, default: 'THB' },
    exchangeRate: { type: Number, default: 0.016 }
  },
  shipping: {
    freeShippingMinMmk: { type: Number, default: 50000 },
    defaultShippingMmk: { type: Number, default: 3000 },
    internationalShippingMmk: { type: Number, default: 15000 }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    viber: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  seo: {
    title: { type: String, default: 'PM Online - Premium Handbags Store' },
    description: { type: String, default: 'Your premier destination for quality handbags, wallets, and accessories.' },
    keywords: { type: String, default: 'handbags, wallets, totebags, brand bags, keychains, PM Online' }
  },
  logo: { type: String, default: '' },
  bannerImages: [String],
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
