const Order = require('../models/Order');

// @desc    Get all orders with filters
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.orderStatus) query.orderStatus = req.query.orderStatus;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'customer.name': { $regex: req.query.search, $options: 'i' } },
        { 'customer.email': { $regex: req.query.search, $options: 'i' } },
        { 'customer.phone': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.fromDate) query.createdAt = { ...(query.createdAt || {}), $gte: new Date(req.query.fromDate) };
    if (req.query.toDate) query.createdAt = { ...(query.createdAt || {}), $lte: new Date(req.query.toDate) };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images');

    res.json({ success: true, count: orders.length, total, totalPages: Math.ceil(total / limit), page, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images priceMmk');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order (public - from checkout)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, shippingMmk = 0, couponCode = '', paymentMethod = 'cod', notes = '' } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Customer info and items are required' });
    }

    // Calculate totals
    let subtotalMmk = 0;
    const orderItems = items.map(item => ({
      product: item.productId,
      name: item.name,
      priceMmk: item.priceMmk,
      priceBaht: Math.round(item.priceMmk * (parseFloat(process.env.MMK_TO_BAHT) || 0.016)),
      quantity: item.quantity,
      image: item.image || ''
    }));

    orderItems.forEach(i => { subtotalMmk += i.priceMmk * i.quantity; });

    let discountMmk = 0;
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(400).json({ success: false, error: 'Invalid coupon code' });
      }
      if (coupon.minOrderMmk > subtotalMmk) {
        return res.status(400).json({ success: false, error: `Minimum order for this coupon is ${coupon.minOrderMmk} MMK` });
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return res.status(400).json({ success: false, error: 'Coupon has expired' });
      }
      discountMmk = coupon.discountType === 'percentage'
        ? Math.round(subtotalMmk * (coupon.discountValue / 100))
        : coupon.discountValue;
      if (coupon.maxDiscountMmk > 0) discountMmk = Math.min(discountMmk, coupon.maxDiscountMmk);
      coupon.usedCount += 1;
      await coupon.save();
    }

    const totalMmk = subtotalMmk + shippingMmk - discountMmk;

    const order = await Order.create({
      customer,
      items: orderItems,
      subtotalMmk,
      subtotalBaht: Math.round(subtotalMmk * (parseFloat(process.env.MMK_TO_BAHT) || 0.016)),
      shippingMmk,
      shippingBaht: Math.round(shippingMmk * (parseFloat(process.env.MMK_TO_BAHT) || 0.016)),
      discountMmk,
      discountBaht: Math.round(discountMmk * (parseFloat(process.env.MMK_TO_BAHT) || 0.016)),
      totalMmk,
      totalBaht: Math.round(totalMmk * (parseFloat(process.env.MMK_TO_BAHT) || 0.016)),
      couponCode: couponCode.toUpperCase(),
      paymentMethod,
      notes
    });

    // Reduce stock
    for (const item of orderItems) {
      const Product = require('../models/Product');
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({ success: true, order: { ...order.toObject(), totalMmk, totalBaht: order.totalBaht } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const update = {};
    if (orderStatus) {
      update.orderStatus = orderStatus;
      if (orderStatus === 'shipped') update.shippedAt = new Date();
      if (orderStatus === 'delivered') update.deliveredAt = new Date();
    }
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (trackingNumber) update.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};
