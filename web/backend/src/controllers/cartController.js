const Cart = require('../models/Cart');
const Product = require('../models/Product');

const formatCartResponse = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: [
      { path: 'category', select: 'name slug' },
      { path: 'brand', select: 'name slug' },
    ],
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Filter out any deleted or inactive products and calculate live totals only for priced products
  const validItems = [];
  let pricedTotal = 0;
  let totalQuantity = 0;
  let hasPricedItems = false;
  let hasUnpricedItems = false;

  for (const item of cart.items) {
    if (item.product && item.product.isActive) {
      const hasSellingPrice =
        item.product.sellingPrice !== null &&
        item.product.sellingPrice !== undefined &&
        Number(item.product.sellingPrice) > 0;
      const hasInvoicePrice =
        item.product.invoicePrice !== null &&
        item.product.invoicePrice !== undefined &&
        Number(item.product.invoicePrice) > 0;

      const unitPrice = hasSellingPrice ? Number(item.product.sellingPrice) : null;
      const invoicePrice = hasInvoicePrice ? Number(item.product.invoicePrice) : null;
      const subtotal =
        unitPrice !== null ? Number((unitPrice * item.quantity).toFixed(3)) : null;

      if (subtotal !== null) {
        pricedTotal += subtotal;
        hasPricedItems = true;
      } else {
        hasUnpricedItems = true;
      }

      totalQuantity += item.quantity;

      validItems.push({
        _id: item._id,
        product: item.product,
        productId: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku || null,
        image: item.product.images?.[0] || item.product.sourceImageUrl || '',
        size: item.size || item.product.sizes?.[0] || '',
        sellingPrice: unitPrice,
        price: unitPrice,
        invoicePrice,
        quantity: item.quantity,
        subtotal,
      });
    }
  }

  return {
    items: validItems,
    totalQuantity,
    hasPricedItems,
    hasUnpricedItems,
    total: hasPricedItems ? Number(pricedTotal.toFixed(3)) : null,
  };
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cartData = await formatCartResponse(req.user._id);
    return res.json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart
const addOrUpdateCartItem = async (req, res, next) => {
  try {
    const { productId, size = '', quantity = 1, mode = 'add' } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available.',
      });
    }

    const selectedSize =
      size !== undefined && size !== null && String(size).trim() !== ''
        ? String(size).trim()
        : product.sizes?.[0] || '';

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (i) => String(i.product) === String(productId) && (i.size || '') === selectedSize
    );

    const qtyNum = Number(quantity);

    if (existingIndex > -1) {
      if (mode === 'set') {
        if (qtyNum <= 0) {
          cart.items.splice(existingIndex, 1);
        } else {
          cart.items[existingIndex].quantity = qtyNum;
        }
      } else {
        cart.items[existingIndex].quantity += Math.max(1, qtyNum);
      }
    } else if (qtyNum > 0) {
      cart.items.push({
        product: productId,
        size: selectedSize,
        quantity: qtyNum,
      });
    }

    await cart.save();
    const cartData = await formatCartResponse(req.user._id);

    return res.json({
      success: true,
      message: 'Cart updated.',
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/sync
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    for (const incoming of items) {
      const prodId = incoming.productId || incoming.product?._id || incoming.product;
      if (!prodId) continue;

      const product = await Product.findById(prodId);
      if (!product || !product.isActive) continue;

      const selectedSize =
        incoming.size !== undefined && incoming.size !== null && String(incoming.size).trim() !== ''
          ? String(incoming.size).trim()
          : product.sizes?.[0] || '';
      const qty = Math.max(1, Number(incoming.quantity || 1));

      const idx = cart.items.findIndex(
        (i) => String(i.product) === String(prodId) && (i.size || '') === selectedSize
      );

      if (idx > -1) {
        cart.items[idx].quantity = Math.max(cart.items[idx].quantity, qty);
      } else {
        cart.items.push({
          product: prodId,
          size: selectedSize,
          quantity: qty,
        });
      }
    }

    await cart.save();
    const cartData = await formatCartResponse(req.user._id);

    return res.json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/item
const removeCartItem = async (req, res, next) => {
  try {
    const { productId, size } = req.query;
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            String(i.product) === String(productId) &&
            (size === undefined || (i.size || '') === String(size))
          )
      );
      await cart.save();
    }

    const cartData = await formatCartResponse(req.user._id);
    return res.json({
      success: true,
      message: 'Item removed from cart.',
      cart: cartData,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    return res.json({
      success: true,
      message: 'Cart cleared.',
      cart: {
        items: [],
        totalQuantity: 0,
        hasPricedItems: false,
        hasUnpricedItems: false,
        total: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addOrUpdateCartItem,
  syncCart,
  removeCartItem,
  clearCart,
};
