const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      default: 'Primary Warehouse / Store',
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street / Building address is required'],
      trim: true,
    },
    area: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      default: 'Muscat',
      trim: true,
    },
    country: {
      type: String,
      default: 'Oman',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'addresses',
  }
);

module.exports = mongoose.model('Address', addressSchema);
