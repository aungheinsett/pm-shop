const express = require('express');
const router = express.Router();
const {
  getStats,
  getRevenueChart,
  getCategorySales,
  getRecentOrders,
  getTopProducts
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/category-sales', getCategorySales);
router.get('/recent-orders', getRecentOrders);
router.get('/top-products', getTopProducts);

module.exports = router;
