const express = require('express');
const router = express.Router();
const {
  createOrder,
  generateWhatsAppPreview,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createOrder);
router.post('/whatsapp-preview', optionalAuth, generateWhatsAppPreview);
router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
