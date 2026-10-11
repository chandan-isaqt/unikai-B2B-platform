const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    sellingPrice: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    invoicePrice: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'orderItems',
  }
);

module.exports = mongoose.model('OrderItem', orderItemSchema);
