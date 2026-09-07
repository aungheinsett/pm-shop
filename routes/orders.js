const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getOrders)
  .post(createOrder);

router.put('/:id/status', protect, adminOnly, updateOrderStatus);

router.route('/:id')
  .get(protect, adminOnly, getOrder)
  .delete(protect, adminOnly, deleteOrder);

module.exports = router;
