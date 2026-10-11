const express = require('express');
const router = express.Router();
const {
  getCart,
  addOrUpdateCartItem,
  syncCart,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/', protect, addOrUpdateCartItem);
router.put('/sync', protect, syncCart);
router.delete('/item', protect, removeCartItem);
router.delete('/', protect, clearCart);

module.exports = router;
