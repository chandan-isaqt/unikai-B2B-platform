const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { slugify } = require('../utils/slugify');

// GET /api/brands
const getBrands = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const brands = await Brand.find(filter).sort({ sortOrder: 1, name: 1 });

    const counts = await Product.aggregate([
      { $match: includeInactive === 'true' ? {} : { isActive: true } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[String(c._id)] = c.count;
    });

    const brandsWithCount = brands.map((b) => ({
      ...b.toObject(),
      productCount: countMap[String(b._id)] || 0,
    }));

    return res.json({
      success: true,
      brands: brandsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/brands/:slugOrId
const getBrandBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let brand = null;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      brand = await Brand.findById(slugOrId);
    }
    if (!brand) {
      brand = await Brand.findOne({ slug: String(slugOrId).toLowerCase() });
    }

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found.',
      });
    }

    return res.json({
      success: true,
      brand,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/brands (Admin)
const createBrand = async (req, res, next) => {
  try {
    const { name, slug, description, logo, tagline, origin, sortOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required.',
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      slug: slug ? slugify(slug) : slugify(name),
      description: description ? description.trim() : '',
      logo: logo || '',
      tagline: tagline ? tagline.trim() : '',
      origin: origin || 'UAE / Oman (GCC)',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully.',
      brand,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/brands/:id (Admin)
const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found.',
      });
    }

    const { name, slug, description, logo, tagline, origin, sortOrder, isActive } = req.body;

    if (name !== undefined) brand.name = name.trim();
    if (slug !== undefined && slug.trim()) brand.slug = slugify(slug);
    if (description !== undefined) brand.description = description.trim();
    if (logo !== undefined) brand.logo = logo;
    if (tagline !== undefined) brand.tagline = tagline.trim();
    if (origin !== undefined) brand.origin = origin.trim();
    if (sortOrder !== undefined) brand.sortOrder = Number(sortOrder);
    if (isActive !== undefined) brand.isActive = Boolean(isActive);

    await brand.save();

    return res.json({
      success: true,
      message: 'Brand updated successfully.',
      brand,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/brands/:id/toggle-status (Admin)
const toggleBrandStatus = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found.',
      });
    }

    brand.isActive = !brand.isActive;
    await brand.save();

    return res.json({
      success: true,
      message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully.`,
      brand,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/brands/:id (Admin)
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found.',
      });
    }

    const productCount = await Product.countDocuments({ brand: brand._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand because ${productCount} product(s) are assigned to it. Reassign or delete those products first.`,
      });
    }

    await brand.deleteOne();

    return res.json({
      success: true,
      message: 'Brand deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrands,
  getBrandBySlugOrId,
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
};
