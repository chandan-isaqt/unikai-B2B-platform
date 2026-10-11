const mongoose = require('mongoose');

const nutritionItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const additionalInfoItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      default: null,
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: null,
      trim: true,
    },
    sourceImageUrl: {
      type: String,
      default: null,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    subCategory: {
      type: String,
      default: null,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    nutrition: {
      type: [nutritionItemSchema],
      default: [],
    },
    ingredients: {
      type: String,
      default: '',
      trim: true,
    },
    servingSize: {
      type: String,
      default: '',
      trim: true,
    },
    additionalInformation: {
      type: [additionalInfoItemSchema],
      default: [],
    },
    sellingPrice: {
      type: Number,
      default: null,
    },
    invoicePrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'OMR',
      trim: true,
    },
    stock: {
      type: Number,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    importedFromOfficialSite: {
      type: Boolean,
      default: false,
    },
    sourceImportedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

productSchema.index({ name: 'text', description: 'text', subCategory: 'text' });

module.exports = mongoose.model('Product', productSchema);
