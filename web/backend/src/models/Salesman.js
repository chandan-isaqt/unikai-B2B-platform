const mongoose = require('mongoose');

const salesmanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Salesman name is required'],
      default: 'Sachin',
      trim: true,
    },
    title: {
      type: String,
      default: 'Senior B2B Sales Executive - Oman & GCC',
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Salesman phone is required'],
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    email: {
      type: String,
      default: 'sachin.sales@unikai.local',
      trim: true,
    },
    region: {
      type: String,
      default: 'Muscat, Oman & GCC Wholesale Distribution',
      trim: true,
    },
    workingHours: {
      type: String,
      default: 'Sun - Thu: 7:30 AM - 6:30 PM (GST/Oman Time)',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'salesmen',
  }
);

module.exports = mongoose.model('Salesman', salesmanSchema);
