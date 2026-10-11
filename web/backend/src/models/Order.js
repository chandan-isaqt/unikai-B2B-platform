const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    address: {
      label: { type: String, default: 'Delivery Address' },
      companyName: { type: String, default: '' },
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, required: true },
      area: { type: String, default: '' },
      city: { type: String, default: 'Muscat' },
      country: { type: String, default: 'Oman' },
      postalCode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        productName: { type: String, required: true },
        sku: { type: String, default: null },
        image: { type: String, default: '' },
        size: { type: String, default: '' },
        sellingPrice: { type: Number, default: null },
        price: { type: Number, default: null },
        invoicePrice: { type: Number, default: null },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, default: null },
      },
    ],
    orderItemsRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    hasPricedItems: {
      type: Boolean,
      default: false,
    },
    hasUnpricedItems: {
      type: Boolean,
      default: false,
    },
    subtotal: {
      type: Number,
      default: null,
    },
    total: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'OMR',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    orderChannel: {
      type: String,
      enum: ['WEB', 'WHATSAPP', 'FLUTTER'],
      default: 'WEB',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

module.exports = mongoose.model('Order', orderSchema);
