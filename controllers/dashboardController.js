const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');

// @desc    Dashboard statistics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalCategories,
      todayOrders,
      monthOrders,
      weekOrders,
      totalRevenueAgg,
      monthRevenueAgg,
      weeklyRevenueAgg,
      pendingOrders,
      lowStock
    ] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.distinct('customer.email'),
      Category.countDocuments({}),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.betweenCount ? 0 : Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalMmk' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$totalMmk' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$totalMmk' } } }]),
      Order.countDocuments({ orderStatus: 'pending' }),
      Product.countDocuments({ stock: { $lte: 5 } })
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers: totalCustomers.length,
        totalCategories,
        todayOrders,
        monthOrders,
        weekOrders,
        totalRevenueMmk: totalRevenueAgg[0]?.total || 0,
        monthRevenueMmk: monthRevenueAgg[0]?.total || 0,
        weeklyRevenueMmk: weeklyRevenueAgg[0]?.total || 0,
        pendingOrders,
        lowStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue chart data (last 12 months)
// @route   GET /api/dashboard/revenue-chart
exports.getRevenueChart = async (req, res, next) => {
  try {
    const months = 12;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const orders = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalMmk' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build 12-month array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getMonth() + 1;
      const year = d.getFullYear();
      const entry = orders.find(o => o._id.year === year && o._id.month === key);
      chartData.push({
        label: monthNames[d.getMonth()],
        revenue: entry?.revenue || 0,
        orders: entry?.count || 0
      });
    }

    res.json({ success: true, chartData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category sales breakdown
// @route   GET /api/dashboard/category-sales
exports.getCategorySales = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          name: { $first: '$category.name' },
          total: { $sum: { $multiply: ['$items.priceMmk', '$items.quantity'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
exports.getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort('-createdAt')
      .limit(10);
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
exports.getTopProducts = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.priceMmk', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
