const express = require('express');
const router = express.Router();
const {
  getProducts,
  getAvailableSizes,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/sizes', getAvailableSizes);
router.get('/:slugOrId', getProductBySlugOrId);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.patch('/:id/toggle-status', protect, adminOnly, toggleProductStatus);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
