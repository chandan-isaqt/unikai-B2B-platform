const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { slugify } = require('../utils/slugify');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });

    // Attach active product counts
    const counts = await Product.aggregate([
      { $match: includeInactive === 'true' ? {} : { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[String(c._id)] = c.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[String(cat._id)] || 0,
    }));

    return res.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:slugOrId
const getCategoryBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      category = await Category.findById(slugOrId);
    }
    if (!category) {
      category = await Category.findOne({ slug: String(slugOrId).toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    return res.json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, icon, sortOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug ? slugify(slug) : slugify(name),
      description: description ? description.trim() : '',
      image: image || '',
      icon: icon || 'Package',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const { name, slug, description, image, icon, sortOrder, isActive } = req.body;

    if (name !== undefined) category.name = name.trim();
    if (slug !== undefined && slug.trim()) category.slug = slugify(slug);
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (sortOrder !== undefined) category.sortOrder = Number(sortOrder);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/categories/:id/toggle-status (Admin)
const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully.`,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because ${productCount} product(s) are assigned to it. Reassign or delete those products first.`,
      });
    }

    await category.deleteOne();

    return res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};
