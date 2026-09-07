const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDelete
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

// Bulk delete must be registered before /:id
router.delete('/bulk-delete', protect, adminOnly, bulkDelete);

router.get('/slug/:slug', getProductBySlug);

router.route('/:id')
  .get(getProduct)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
