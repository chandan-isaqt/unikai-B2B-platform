const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Cart = require('../models/Cart');
const { slugify } = require('../utils/slugify');

const parseNullablePrice = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
};

const parseNullableStock = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.floor(num);
};

const parseStringArray = (input) => {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch (_) {
        // fallback to comma split
      }
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const parseNutritionArray = (input) => {
  if (!input) return [];
  let raw = input;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (_) {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (row) =>
          row &&
          row.name !== undefined &&
          row.value !== undefined &&
          String(row.name).trim() !== '' &&
          String(row.value).trim() !== ''
      )
      .map((row) => ({
        name: String(row.name).trim(),
        value: String(row.value).trim(),
      }));
  }
  if (typeof raw === 'object') {
    return Object.entries(raw)
      .filter(([k, v]) => k && v !== undefined && v !== null && String(v).trim() !== '')
      .map(([k, v]) => ({
        name: String(k).trim(),
        value: String(v).trim(),
      }));
  }
  return [];
};

const parseAdditionalInfoArray = (input) => {
  if (!input) return [];
  let raw = input;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (_) {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (row) =>
          row &&
          row.label !== undefined &&
          row.value !== undefined &&
          String(row.label).trim() !== '' &&
          String(row.value).trim() !== ''
      )
      .map((row) => ({
        label: String(row.label).trim(),
        value: String(row.value).trim(),
      }));
  }
  return [];
};

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      q,
      category,
      subCategory,
      line,
      brand,
      size,
      minPrice,
      maxPrice,
      hasPrice,
      isFeatured,
      isPopular,
      isActive,
      includeInactive,
      sort = 'newest',
      page = 1,
      limit = 24,
    } = req.query;

    const filter = {};

    // Public requests only see active products unless includeInactive=true or isActive is explicitly queried
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true' || isActive === true;
    } else if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const searchQuery = (search || q || '').trim();
    if (searchQuery) {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: regex },
        { subCategory: regex },
        { description: regex },
        { sizes: regex },
        { sku: regex },
      ];
    }

    let resolvedCategory = category;
    let autoSubCategories = null;

    const CATEGORY_ALIASES = {
      'yoghurt-laban': { categorySlug: 'dairy', subCategories: ['Laban', 'Lassi', 'Yoghurt'] },
      'dairy-milk': { categorySlug: 'dairy', subCategories: ['Fresh Milk', 'Flavoured Milk', 'Milk Shake', 'UHT Milk', 'Evaporated Milk', 'Milk Powder'] },
      'juices-beverages': { categorySlug: 'juice' },
      'ice-cream-frozen': { categorySlug: 'ice-cream' },
      'cheese-butter-ghee': { categorySlug: 'foods' },
    };

    if (category && CATEGORY_ALIASES[String(category).toLowerCase()]) {
      const alias = CATEGORY_ALIASES[String(category).toLowerCase()];
      resolvedCategory = alias.categorySlug;
      if (alias.subCategories) {
        autoSubCategories = alias.subCategories;
      }
    }

    if (line) {
      const lineKey = String(line).toLowerCase();
      if (lineKey === 'lassi-yoghurt') {
        resolvedCategory = 'dairy';
        autoSubCategories = ['Laban', 'Lassi', 'Yoghurt'];
      } else if (lineKey === 'milk') {
        resolvedCategory = 'dairy';
        autoSubCategories = ['Fresh Milk', 'Flavoured Milk', 'Milk Shake', 'UHT Milk', 'Evaporated Milk', 'Milk Powder'];
      } else if (lineKey === 'juices' || lineKey === 'juice') {
        resolvedCategory = 'juice';
      } else if (lineKey === 'ice-cream') {
        resolvedCategory = 'ice-cream';
      } else if (lineKey === 'foods') {
        resolvedCategory = 'foods';
      }
    }

    if (resolvedCategory) {
      if (mongoose.Types.ObjectId.isValid(resolvedCategory)) {
        filter.category = resolvedCategory;
      } else {
        const catDoc = await Category.findOne({ slug: String(resolvedCategory).toLowerCase() });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          return res.json({
            success: true,
            products: [],
            pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
          });
        }
      }
    }

    const effectiveSubCategories = subCategory
      ? String(subCategory).split(',').map((s) => s.trim()).filter(Boolean)
      : autoSubCategories;

    if (effectiveSubCategories && effectiveSubCategories.length > 0) {
      filter.$or = (filter.$or || []).concat(
        effectiveSubCategories.map((sub) => ({
          subCategory: new RegExp(sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
        }))
      );
    }

    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ slug: String(brand).toLowerCase() });
        if (brandDoc) {
          filter.brand = brandDoc._id;
        } else {
          return res.json({
            success: true,
            products: [],
            pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 },
          });
        }
      }
    }

    if (size) {
      filter.sizes = { $in: [size] };
    }

    if (hasPrice === 'true') {
      filter.sellingPrice = { $ne: null, $gt: 0 };
    } else if (hasPrice === 'false') {
      filter.sellingPrice = null;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCond = {};
      if (minPrice !== undefined && minPrice !== '') {
        priceCond.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        priceCond.$lte = Number(maxPrice);
      }
      if (Object.keys(priceCond).length > 0) {
        filter.sellingPrice = { ...(filter.sellingPrice || {}), $ne: null, ...priceCond };
      }
    }

    if (isFeatured !== undefined && isFeatured !== '') {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (isPopular !== undefined && isPopular !== '') {
      filter.isPopular = isPopular === 'true' || isPopular === true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { sellingPrice: 1, name: 1 };
    else if (sort === 'price_desc') sortOption = { sellingPrice: -1, name: 1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };
    else if (sort === 'popular') sortOption = { isPopular: -1, isFeatured: -1, name: 1 };
    else if (sort === 'featured') sortOption = { isFeatured: -1, name: 1 };
    else if (sort === 'updated') sortOption = { updatedAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('category', 'name slug image icon')
        .populate('brand', 'name slug logo tagline')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/sizes
const getAvailableSizes = async (req, res, next) => {
  try {
    const sizes = await Product.distinct('sizes', { isActive: true });
    return res.json({
      success: true,
      sizes: sizes.filter((s) => s && String(s).trim() !== ''),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:slugOrId
const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    let product = null;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      product = await Product.findById(slugOrId)
        .populate('category', 'name slug description image icon')
        .populate('brand', 'name slug description logo tagline origin');
    }

    if (!product) {
      product = await Product.findOne({ slug: String(slugOrId).toLowerCase() })
        .populate('category', 'name slug description image icon')
        .populate('brand', 'name slug description logo tagline origin');
    }

    if (!product || (!product.isActive && !includeInactive)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const relatedFilter = {
      _id: { $ne: product._id },
      isActive: true,
    };
    if (product.category?._id || product.category) {
      relatedFilter.category = product.category?._id || product.category;
    }

    const relatedProducts = await Product.find(relatedFilter)
      .populate('category', 'name slug image icon')
      .populate('brand', 'name slug logo')
      .limit(4);

    return res.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      sku,
      sourceUrl,
      sourceImageUrl,
      category,
      brand,
      subCategory,
      images,
      sizes,
      servingSize,
      description,
      nutrition,
      ingredients,
      additionalInformation,
      sellingPrice,
      price,
      invoicePrice,
      currency,
      stock,
      isFeatured,
      isPopular,
      isActive,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.',
      });
    }

    let baseSlug = slug && String(slug).trim() ? slugify(slug) : slugify(name);
    if (!baseSlug) baseSlug = `product-${Date.now()}`;

    let finalSlug = baseSlug;
    let counter = 2;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const parsedSizes = parseStringArray(sizes);
    const parsedImages = parseStringArray(images);
    const trimmedSourceImage =
      sourceImageUrl && String(sourceImageUrl).trim() ? String(sourceImageUrl).trim() : null;

    if (trimmedSourceImage && !parsedImages.includes(trimmedSourceImage)) {
      parsedImages.unshift(trimmedSourceImage);
    }

    const finalSourceImageUrl = trimmedSourceImage || parsedImages[0] || null;

    const finalSellingPrice = parseNullablePrice(
      sellingPrice !== undefined ? sellingPrice : price
    );
    const finalInvoicePrice = parseNullablePrice(invoicePrice);
    const finalStock = parseNullableStock(stock);

    const product = await Product.create({
      name: String(name).trim(),
      slug: finalSlug,
      sku: sku && String(sku).trim() ? String(sku).trim() : null,
      sourceUrl: sourceUrl && String(sourceUrl).trim() ? String(sourceUrl).trim() : null,
      sourceImageUrl: finalSourceImageUrl,
      category: category && mongoose.Types.ObjectId.isValid(category) ? category : null,
      brand: brand && mongoose.Types.ObjectId.isValid(brand) ? brand : null,
      subCategory: subCategory && String(subCategory).trim() ? String(subCategory).trim() : null,
      images: parsedImages,
      sizes: parsedSizes,
      servingSize: servingSize ? String(servingSize).trim() : '',
      description: description ? String(description).trim() : '',
      nutrition: parseNutritionArray(nutrition),
      ingredients: ingredients ? String(ingredients).trim() : '',
      additionalInformation: parseAdditionalInfoArray(additionalInformation),
      sellingPrice: finalSellingPrice,
      invoicePrice: finalInvoicePrice,
      currency: currency && String(currency).trim() ? String(currency).trim() : 'OMR',
      stock: finalStock,
      isFeatured: Boolean(isFeatured),
      isPopular: Boolean(isPopular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      importedFromOfficialSite: false,
    });

    const populated = await Product.findById(product._id)
      .populate('category', 'name slug image icon')
      .populate('brand', 'name slug logo');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const {
      name,
      slug,
      sku,
      sourceUrl,
      sourceImageUrl,
      category,
      brand,
      subCategory,
      images,
      sizes,
      servingSize,
      description,
      nutrition,
      ingredients,
      additionalInformation,
      sellingPrice,
      price,
      invoicePrice,
      currency,
      stock,
      isFeatured,
      isPopular,
      isActive,
    } = req.body;

    if (name !== undefined && String(name).trim()) {
      product.name = String(name).trim();
    }

    if (slug !== undefined && String(slug).trim()) {
      const candidateSlug = slugify(slug);
      const conflict = await Product.findOne({ slug: candidateSlug, _id: { $ne: product._id } });
      if (!conflict) {
        product.slug = candidateSlug;
      }
    }

    if (sku !== undefined) {
      product.sku = sku && String(sku).trim() ? String(sku).trim() : null;
    }

    if (sourceUrl !== undefined) {
      product.sourceUrl = sourceUrl && String(sourceUrl).trim() ? String(sourceUrl).trim() : null;
    }

    if (category !== undefined) {
      product.category =
        category && mongoose.Types.ObjectId.isValid(category) ? category : null;
    }

    if (brand !== undefined) {
      product.brand = brand && mongoose.Types.ObjectId.isValid(brand) ? brand : null;
    }

    if (subCategory !== undefined) {
      product.subCategory =
        subCategory && String(subCategory).trim() ? String(subCategory).trim() : null;
    }

    if (description !== undefined) {
      product.description = description ? String(description).trim() : '';
    }

    if (servingSize !== undefined) {
      product.servingSize = servingSize ? String(servingSize).trim() : '';
    }

    if (ingredients !== undefined) {
      product.ingredients = ingredients ? String(ingredients).trim() : '';
    }

    if (sellingPrice !== undefined || price !== undefined) {
      product.sellingPrice = parseNullablePrice(
        sellingPrice !== undefined ? sellingPrice : price
      );
    }

    if (invoicePrice !== undefined) {
      product.invoicePrice = parseNullablePrice(invoicePrice);
    }

    if (currency !== undefined && String(currency).trim()) {
      product.currency = String(currency).trim();
    }

    if (stock !== undefined) {
      product.stock = parseNullableStock(stock);
    }

    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isPopular !== undefined) product.isPopular = Boolean(isPopular);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    if (sizes !== undefined) {
      product.sizes = parseStringArray(sizes);
    }

    if (images !== undefined || sourceImageUrl !== undefined) {
      const nextImages =
        images !== undefined ? parseStringArray(images) : [...(product.images || [])];

      if (sourceImageUrl !== undefined) {
        const trimmedSource =
          sourceImageUrl && String(sourceImageUrl).trim()
            ? String(sourceImageUrl).trim()
            : null;
        product.sourceImageUrl = trimmedSource;
        if (trimmedSource && !nextImages.includes(trimmedSource)) {
          nextImages.unshift(trimmedSource);
        }
      } else if (nextImages.length === 0) {
        product.sourceImageUrl = null;
      } else if (!product.sourceImageUrl) {
        product.sourceImageUrl = nextImages[0];
      }

      product.images = nextImages;
    }

    if (nutrition !== undefined) {
      product.nutrition = parseNutritionArray(nutrition);
    }

    if (additionalInformation !== undefined) {
      product.additionalInformation = parseAdditionalInfoArray(additionalInformation);
    }

    await product.save();

    const populated = await Product.findById(product._id)
      .populate('category', 'name slug image icon')
      .populate('brand', 'name slug logo');

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/toggle-status (Admin)
const toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    const populated = await Product.findById(product._id)
      .populate('category', 'name slug image icon')
      .populate('brand', 'name slug logo');

    return res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully.`,
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Remove locally managed uploaded images if applicable
    const allImages = [...(product.images || []), product.sourceImageUrl].filter(Boolean);
    for (const imgPath of allImages) {
      if (typeof imgPath === 'string' && imgPath.startsWith('/uploads/')) {
        const filename = path.basename(imgPath);
        const fullLocalPath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(fullLocalPath)) {
          try {
            fs.unlinkSync(fullLocalPath);
          } catch (_) {
            // ignore file deletion errors
          }
        }
      }
    }

    // Remove product from any active carts so stale references do not remain
    await Cart.updateMany({}, { $pull: { items: { product: product._id } } });

    await product.deleteOne();

    return res.json({
      success: true,
      message: 'Product deleted successfully.',
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getAvailableSizes,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};
