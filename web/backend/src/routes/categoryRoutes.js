const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.get('/:slugOrId', getCategoryBySlugOrId);

router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.patch('/:id/toggle-status', protect, adminOnly, toggleCategoryStatus);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
