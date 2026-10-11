const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandBySlugOrId,
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getBrands);
router.get('/:slugOrId', getBrandBySlugOrId);

router.post('/', protect, adminOnly, createBrand);
router.put('/:id', protect, adminOnly, updateBrand);
router.patch('/:id/toggle-status', protect, adminOnly, toggleBrandStatus);
router.delete('/:id', protect, adminOnly, deleteBrand);

module.exports = router;
