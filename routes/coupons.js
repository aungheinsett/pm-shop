const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/validate', validateCoupon);

router.route('/')
  .get(protect, adminOnly, getCoupons)
  .post(protect, adminOnly, createCoupon);

router.route('/:id')
  .get(protect, adminOnly, getCoupon)
  .put(protect, adminOnly, updateCoupon)
  .delete(protect, adminOnly, deleteCoupon);

module.exports = router;
