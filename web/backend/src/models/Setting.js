const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Unikai Foods PJSC - B2B Division',
    },
    currency: {
      type: String,
      default: 'OMR',
    },
    currencySymbol: {
      type: String,
      default: 'OMR',
    },
    currencyDecimals: {
      type: Number,
      default: 3,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    supportEmail: {
      type: String,
      default: 'b2b.oman@unikai.com',
    },
    supportPhone: {
      type: String,
      default: '+968 2450 1234',
    },
    headOfficeAddress: {
      type: String,
      default: 'Ghala Industrial Estate, Muscat, Sultanate of Oman',
    },
    whatsappOrderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'settings',
  }
);

module.exports = mongoose.model('Setting', settingSchema);
