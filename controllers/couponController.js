const Coupon = require('../models/Coupon');

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(400).json({ success: false, error: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
    }
    if (amount && coupon.minOrderMmk > amount) {
      return res.status(400).json({ success: false, error: `Minimum order for this coupon is ${coupon.minOrderMmk} MMK` });
    }

    let discount = coupon.discountType === 'percentage'
      ? Math.round((amount || 0) * (coupon.discountValue / 100))
      : coupon.discountValue;
    if (coupon.maxDiscountMmk > 0) discount = Math.min(discount, coupon.maxDiscountMmk);

    res.json({ success: true, coupon, discount });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, ...rest } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Coupon code is required' });
    const coupon = await Coupon.create({ code: code.toUpperCase(), ...rest });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    next(error);
  }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
