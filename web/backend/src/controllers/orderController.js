const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Salesman = require('../models/Salesman');
const Cart = require('../models/Cart');
const { buildWhatsAppOrderPayload } = require('../services/whatsappService');

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(count + 1001).padStart(4, '0');
  return `UNK-${datePart}-${seq}`;
};

// POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const {
      items = [],
      customerName,
      customerEmail,
      customerPhone,
      address = {},
      orderChannel = 'WEB',
      notes = '',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product item.',
      });
    }

    const finalCustomerName = (customerName || req.user?.name || '').trim();
    const finalCustomerPhone = (customerPhone || address.phone || req.user?.phone || '').trim();
    const finalCustomerEmail = (customerEmail || req.user?.email || '').trim();

    if (!finalCustomerName || !finalCustomerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required to place an order.',
      });
    }

    const resolvedItems = [];
    let pricedSubtotal = 0;
    let totalQuantity = 0;
    let hasPricedItems = false;
    let hasUnpricedItems = false;

    for (const rawItem of items) {
      const prodId = rawItem.productId || rawItem.product?._id || rawItem.product;
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for item: ${rawItem.name || prodId}`,
        });
      }

      const quantity = Math.max(1, Number(rawItem.quantity || 1));
      const hasSellingPrice =
        product.sellingPrice !== null &&
        product.sellingPrice !== undefined &&
        Number(product.sellingPrice) > 0;
      const hasInvoicePrice =
        product.invoicePrice !== null &&
        product.invoicePrice !== undefined &&
        Number(product.invoicePrice) > 0;

      // IMPORTANT: Never use invoicePrice as sellingPrice and never treat missing sellingPrice as 0
      const unitPrice = hasSellingPrice ? Number(product.sellingPrice) : null;
      const invoicePrice = hasInvoicePrice ? Number(product.invoicePrice) : null;
      const itemSubtotal =
        unitPrice !== null ? Number((unitPrice * quantity).toFixed(3)) : null;

      if (itemSubtotal !== null) {
        pricedSubtotal += itemSubtotal;
        hasPricedItems = true;
      } else {
        hasUnpricedItems = true;
      }

      totalQuantity += quantity;

      const selectedSize =
        rawItem.size !== undefined && rawItem.size !== null && String(rawItem.size).trim() !== ''
          ? String(rawItem.size).trim()
          : product.sizes?.[0] || '';

      resolvedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku || null,
        image: product.images?.[0] || product.sourceImageUrl || '',
        size: selectedSize,
        sellingPrice: unitPrice,
        price: unitPrice,
        invoicePrice,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    const orderNumber = await generateOrderNumber();
    const total = hasPricedItems ? Number(pricedSubtotal.toFixed(3)) : null;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customerName: finalCustomerName,
      customerEmail: finalCustomerEmail,
      customerPhone: finalCustomerPhone,
      address: {
        label: address.label || 'Delivery Location',
        companyName: address.companyName || req.user?.companyName || '',
        fullName: address.fullName || finalCustomerName,
        phone: address.phone || finalCustomerPhone,
        street: address.street || 'Muscat Commercial District',
        area: address.area || '',
        city: address.city || 'Muscat',
        country: address.country || 'Oman',
        postalCode: address.postalCode || '',
        notes: address.notes || '',
      },
      items: resolvedItems,
      totalQuantity,
      hasPricedItems,
      hasUnpricedItems,
      subtotal: total,
      total,
      currency: 'OMR',
      status: 'Pending',
      orderChannel: ['WEB', 'WHATSAPP', 'FLUTTER'].includes(orderChannel) ? orderChannel : 'WEB',
      notes,
    });

    // Also store in orderItems collection as required by Section 4
    const orderItemDocs = await OrderItem.insertMany(
      resolvedItems.map((item) => ({
        ...item,
        order: order._id,
      }))
    );

    order.orderItemsRefs = orderItemDocs.map((doc) => doc._id);
    await order.save();

    // Clear user's database cart if logged in and ordered from cart
    if (req.user && req.body.clearCart !== false) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    const salesman =
      (await Salesman.findOne({ isActive: true })) ||
      (await Salesman.findOne()) || {
        name: process.env.SALESMAN_NAME || 'Sachin',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '+96891234567',
      };

    const formattedAddress = [
      order.address.street,
      order.address.area,
      order.address.city,
      order.address.country,
    ]
      .filter(Boolean)
      .join(', ');

    const whatsappPayload = buildWhatsAppOrderPayload({
      salesmanName: salesman.name,
      whatsappNumber: salesman.whatsappNumber,
      items: resolvedItems,
      customer: {
        name: finalCustomerName,
        companyName: order.address.companyName,
        phone: finalCustomerPhone,
        address: formattedAddress,
      },
      total,
      orderNumber,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
      whatsapp: whatsappPayload,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/whatsapp-preview
const generateWhatsAppPreview = async (req, res, next) => {
  try {
    const { items = [], customer = {} } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required to generate a WhatsApp order.',
      });
    }

    const salesman =
      (await Salesman.findOne({ isActive: true })) ||
      (await Salesman.findOne()) || {
        name: process.env.SALESMAN_NAME || 'Sachin',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '+96891234567',
      };

    const resolvedItems = [];
    for (const rawItem of items) {
      const prodId = rawItem.productId || rawItem.product?._id || rawItem.product;
      let product = null;
      if (prodId) {
        product = await Product.findById(prodId);
      }

      const rawSelling = product ? product.sellingPrice : null;
      const rawInvoice = product ? product.invoicePrice : null;

      const sellingPrice =
        rawSelling !== null && rawSelling !== undefined && Number(rawSelling) > 0
          ? Number(rawSelling)
          : null;
      const invoicePrice =
        rawInvoice !== null && rawInvoice !== undefined && Number(rawInvoice) > 0
          ? Number(rawInvoice)
          : null;

      const selectedSize =
        rawItem.size !== undefined && rawItem.size !== null && String(rawItem.size).trim() !== ''
          ? String(rawItem.size).trim()
          : product?.sizes?.[0] || '';

      resolvedItems.push({
        productName: product ? product.name : rawItem.name || rawItem.productName || 'Unikai Product',
        size: selectedSize,
        quantity: Math.max(1, Number(rawItem.quantity || 1)),
        sellingPrice,
        price: sellingPrice,
        invoicePrice,
      });
    }

    const customerInfo = {
      name: customer.name || req.user?.name || 'B2B Customer',
      companyName: customer.companyName || req.user?.companyName || '',
      phone: customer.phone || req.user?.phone || '+968 XXXXXXXX',
      address: customer.address || 'Muscat, Oman',
    };

    const payload = buildWhatsAppOrderPayload({
      salesmanName: salesman.name,
      whatsappNumber: salesman.whatsappNumber,
      items: resolvedItems,
      customer: customerInfo,
    });

    return res.json({
      success: true,
      whatsapp: payload,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images sourceImageUrl sellingPrice invoicePrice')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone companyName')
      .populate('items.product', 'name slug sku images sourceImageUrl sellingPrice invoicePrice');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (
      req.user.role !== 'ADMIN' &&
      order.user &&
      String(order.user._id || order.user) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order.',
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { orderNumber: regex },
        { customerName: regex },
        { customerPhone: regex },
        { customerEmail: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('user', 'name email phone companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.json({
      success: true,
      orders,
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

// PATCH /api/orders/:id/status (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.status = status;
    await order.save();

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  generateWhatsAppPreview,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
