const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  toggleCustomerStatus,
  uploadFile,
  getExecutiveReport,
} = require('../controllers/adminController');
const { protect, adminOnly, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get(
  '/executive-report',
  protect,
  authorizeRoles('ADMIN', 'CEO', 'GM', 'COUNTRY_MANAGER'),
  getExecutiveReport
);
router.get('/customers', protect, adminOnly, getAllCustomers);
router.get('/customers/:id', protect, adminOnly, getCustomerById);
router.patch('/customers/:id/toggle-status', protect, adminOnly, toggleCustomerStatus);
router.post('/upload', protect, adminOnly, upload.single('image'), uploadFile);

module.exports = router;
