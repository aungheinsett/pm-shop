const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    maxlength: 300,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  priceMmk: {
    type: Number,
    required: [true, 'MMK price is required'],
    min: 0
  },
  priceBaht: {
    type: Number,
    default: 0
  },
  oldPriceMmk: {
    type: Number,
    default: 0
  },
  oldPriceBaht: {
    type: Number,
    default: 0
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  icon: {
    type: String,
    default: 'fas fa-shopping-bag'
  },
  badge: {
    type: String,
    enum: ['none', 'new', 'sale', 'hot'],
    default: 'none'
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    default: 0
  },
  tags: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.oldPriceMmk > 0 && this.priceMmk > 0) {
    this.discount = Math.round(((this.oldPriceMmk - this.priceMmk) / this.oldPriceMmk) * 100);
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ priceMmk: 1 });

module.exports = mongoose.model('Product', productSchema);
