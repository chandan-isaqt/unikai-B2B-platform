const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { connectDB, closeDB } = require('../config/db');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { slugify } = require('../utils/slugify');
const {
  OFFICIAL_CATEGORIES,
  OFFICIAL_BRANDS,
  RAW_OFFICIAL_PRODUCTS,
} = require('./officialCatalogueData');

/**
 * Removes obsolete generated demo SVG files from web/backend/uploads/
 */
const removeObsoleteDemoSvgFiles = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) return 0;

  let removedFiles = 0;
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    if (file.endsWith('.svg')) {
      try {
        fs.unlinkSync(path.join(uploadsDir, file));
        removedFiles += 1;
      } catch (_) {
        // ignore
      }
    }
  }
  return removedFiles;
};

/**
 * Resets categories, brands, and products to the official Unikai catalogue dataset.
 */
const resetAndImportOfficialCatalogue = async () => {
  removeObsoleteDemoSvgFiles();

  // Drop old indexes (such as legacy unique sku index) so nullable sku works cleanly
  try {
    await Product.collection.dropIndexes();
  } catch (_) {
    // Collection may not exist yet
  }

  const oldProductsRemoved = await Product.countDocuments();
  await Product.deleteMany({});
  await Cart.updateMany({}, { $set: { items: [] } });

  // Replace Categories with Official Unikai Categories
  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(OFFICIAL_CATEGORIES);
  const categoryMap = {};
  createdCategories.forEach((cat) => {
    categoryMap[cat.slug] = cat._id;
  });

  // Replace Brands with Official Unikai Brands
  await Brand.deleteMany({});
  const createdBrands = await Brand.insertMany(OFFICIAL_BRANDS);
  const brandMap = {};
  createdBrands.forEach((brand) => {
    brandMap[brand.slug] = brand._id;
  });

  // Normalize and deduplicate official products intelligently
  const deduplicatedMap = new Map();
  const usedSlugs = new Set();
  let duplicatesSkipped = 0;

  for (const raw of RAW_OFFICIAL_PRODUCTS) {
    const normalizedSizes = Array.isArray(raw.sizes)
      ? raw.sizes.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const normalizedDesc = (raw.description || '').trim();
    const dedupKey = [
      raw.name.trim().toLowerCase(),
      (raw.categorySlug || '').toLowerCase(),
      (raw.brandSlug || '').toLowerCase(),
      normalizedSizes.join('|').toLowerCase(),
      normalizedDesc.toLowerCase(),
    ].join('::');

    if (deduplicatedMap.has(dedupKey)) {
      duplicatesSkipped += 1;
      const existing = deduplicatedMap.get(dedupKey);
      if (raw.sourceImageUrl && !existing.images.includes(raw.sourceImageUrl)) {
        existing.images.push(raw.sourceImageUrl);
      }
      continue;
    }

    let candidateSlug = raw.slug ? slugify(raw.slug) : slugify(raw.name);
    if (usedSlugs.has(candidateSlug)) {
      const suffix = raw.subCategory ? slugify(raw.subCategory) : String(usedSlugs.size + 1);
      candidateSlug = `${candidateSlug}-${suffix}`;
    }
    usedSlugs.add(candidateSlug);

    const images = raw.sourceImageUrl ? [raw.sourceImageUrl.trim()] : [];
    const nutrition = Array.isArray(raw.nutrition)
      ? raw.nutrition
          .filter((n) => n && n.name && n.value !== undefined && String(n.value).trim() !== '')
          .map((n) => ({
            name: String(n.name).trim(),
            value: String(n.value).trim(),
          }))
      : [];

    const additionalInformation = Array.isArray(raw.additionalInformation)
      ? raw.additionalInformation
          .filter((info) => info && info.label && info.value)
          .map((info) => ({
            label: String(info.label).trim(),
            value: String(info.value).trim(),
          }))
      : [];

    deduplicatedMap.set(dedupKey, {
      name: raw.name.trim(),
      slug: candidateSlug,
      sku: raw.sku || null,
      sourceUrl: raw.sourceUrl || null,
      sourceImageUrl: raw.sourceImageUrl ? raw.sourceImageUrl.trim() : null,
      brand: brandMap[raw.brandSlug] || null,
      category: categoryMap[raw.categorySlug] || null,
      subCategory: raw.subCategory || null,
      images,
      sizes: normalizedSizes,
      description: normalizedDesc,
      nutrition,
      ingredients: raw.ingredients ? String(raw.ingredients).trim() : '',
      servingSize: raw.servingSize ? String(raw.servingSize).trim() : '',
      additionalInformation,
      sellingPrice:
        raw.sellingPrice !== undefined && raw.sellingPrice !== null
          ? Number(raw.sellingPrice)
          : null,
      invoicePrice:
        raw.invoicePrice !== undefined && raw.invoicePrice !== null
          ? Number(raw.invoicePrice)
          : null,
      currency: 'OMR',
      stock: raw.stock !== undefined && raw.stock !== null ? Number(raw.stock) : null,
      isFeatured: Boolean(raw.isFeatured),
      isPopular: Boolean(raw.isPopular),
      isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
      importedFromOfficialSite: true,
      sourceImportedAt: new Date(),
    });
  }

  const productsToInsert = Array.from(deduplicatedMap.values());
  const insertedProducts = await Product.insertMany(productsToInsert);

  const productsWithoutPrice = insertedProducts.filter(
    (p) => p.sellingPrice === null && p.invoicePrice === null
  ).length;
  const productsWithPrice = insertedProducts.filter(
    (p) => p.sellingPrice !== null || p.invoicePrice !== null
  ).length;
  const productsWithoutNutrition = insertedProducts.filter(
    (p) => !Array.isArray(p.nutrition) || p.nutrition.length === 0
  ).length;
  const productsWithoutImage = insertedProducts.filter(
    (p) => (!Array.isArray(p.images) || p.images.length === 0) && !p.sourceImageUrl
  ).length;
  const productsWithoutSizes = insertedProducts.filter(
    (p) => !Array.isArray(p.sizes) || p.sizes.length === 0
  ).length;

  const summary = {
    oldProductsRemoved,
    newProductsImported: insertedProducts.length,
    duplicatesSkipped,
    productsWithoutPrice,
    productsWithPrice,
    productsWithoutNutrition,
    productsWithoutImage,
    productsWithoutSizes,
  };

  console.log('');
  console.log('PRODUCT CATALOGUE RESET');
  console.log('-----------------------');
  console.log(`Old products removed: ${summary.oldProductsRemoved}`);
  console.log(`New products imported: ${summary.newProductsImported}`);
  console.log(`Duplicates skipped: ${summary.duplicatesSkipped}`);
  console.log(`Products without price: ${summary.productsWithoutPrice}`);
  console.log(`Products with price: ${summary.productsWithPrice}`);
  console.log(`Products without nutrition: ${summary.productsWithoutNutrition}`);
  console.log(`Products without image: ${summary.productsWithoutImage}`);
  console.log(`Products without sizes: ${summary.productsWithoutSizes}`);
  console.log('');

  return {
    summary,
    categories: createdCategories,
    brands: createdBrands,
    products: insertedProducts,
  };
};

if (require.main === module) {
  (async () => {
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to local MongoDB. Aborting product catalogue reset.');
      process.exit(1);
    }
    try {
      await resetAndImportOfficialCatalogue();
      await closeDB();
      process.exit(0);
    } catch (error) {
      console.error('Product catalogue reset failed:', error);
      await closeDB();
      process.exit(1);
    }
  })();
}

module.exports = {
  resetAndImportOfficialCatalogue,
  removeObsoleteDemoSvgFiles,
};
