const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  priceMmk: Number,
  priceBaht: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Myanmar' }
    }
  },
  items: [orderItemSchema],
  subtotalMmk: { type: Number, required: true },
  subtotalBaht: { type: Number, default: 0 },
  shippingMmk: { type: Number, default: 0 },
  shippingBaht: { type: Number, default: 0 },
  discountMmk: { type: Number, default: 0 },
  discountBaht: { type: Number, default: 0 },
  totalMmk: { type: Number, required: true },
  totalBaht: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'mobile_pay', 'online'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  shippedAt: Date,
  deliveredAt: Date
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'PM-' + String(count + 1001).padStart(6, '0');
  }
  const rate = parseFloat(process.env.MMK_TO_BAHT) || 0.016;
  if (!this.totalBaht) this.totalBaht = Math.round(this.totalMmk * rate);
  if (!this.subtotalBaht) this.subtotalBaht = Math.round(this.subtotalMmk * rate);
  if (!this.shippingBaht) this.shippingBaht = Math.round(this.shippingMmk * rate);
  if (!this.discountBaht) this.discountBaht = Math.round(this.discountMmk * rate);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
