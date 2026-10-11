const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Order = require('../models/Order');
const Address = require('../models/Address');
const { getDbStatus } = require('../config/db');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      recentlyLoggedInCount,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      pendingOrders,
      todaysOrders,
      recentOrders,
      recentlyLoggedInUsers,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      User.countDocuments({ role: 'CUSTOMER', lastLoginAt: { $gte: sevenDaysAgo } }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Category.countDocuments(),
      Brand.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.find().sort({ createdAt: -1 }).limit(8),
      User.find({ role: 'CUSTOMER', lastLoginAt: { $ne: null } })
        .select('name companyName email phone lastLoginAt createdAt isActive')
        .sort({ lastLoginAt: -1 })
        .limit(6),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
    ]);

    const totalRevenue = Number((revenueAgg[0]?.totalRevenue || 0).toFixed(3));
    const dbStatus = getDbStatus();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        recentlyLoggedInCount,
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalCategories,
        totalBrands,
        totalOrders,
        pendingOrders,
        todaysOrders,
        totalRevenue,
      },
      recentOrders,
      recentlyLoggedInUsers,
      systemHealth: {
        backend: 'Connected',
        database: dbStatus === 'connected' ? 'Connected' : 'Disconnected',
        environment:
          process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/customers
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { role: 'CUSTOMER' };

    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { companyName: regex },
      ];
    }

    const customers = await User.find(filter)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .populate('addresses')
      .sort({ createdAt: -1 });

    // Attach order counts per customer
    const orderCounts = await Order.aggregate([
      { $match: { user: { $ne: null } } },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
        },
      },
    ]);

    const countMap = {};
    orderCounts.forEach((o) => {
      countMap[String(o._id)] = {
        orderCount: o.orderCount,
        totalSpent: Number((o.totalSpent || 0).toFixed(3)),
      };
    });

    const customersWithMeta = customers.map((c) => {
      const obj = c.toObject();
      const meta = countMap[String(c._id)] || { orderCount: 0, totalSpent: 0 };
      const primaryAddr =
        obj.addresses?.find((a) => a.isDefault) || obj.addresses?.[0] || null;
      return {
        ...obj,
        orderCount: meta.orderCount,
        totalSpent: meta.totalSpent,
        primaryAddress: primaryAddr
          ? `${primaryAddr.street}, ${primaryAddr.city}, ${primaryAddr.country}`
          : 'No saved address',
      };
    });

    return res.json({
      success: true,
      customers: customersWithMeta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select(
      '-passwordHash -resetPasswordToken -resetPasswordExpires'
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    const [addresses, orders] = await Promise.all([
      Address.find({ user: customer._id }).sort({ isDefault: -1, createdAt: -1 }),
      Order.find({ user: customer._id }).sort({ createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      customer: {
        ...customer.toObject(),
        addresses,
        orders,
        orderCount: orders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/customers/:id/toggle-status
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select(
      '-passwordHash -resetPasswordToken -resetPasswordExpires'
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    if (customer.role === 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate primary administrator account.',
      });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    return res.json({
      success: true,
      message: `Customer account ${customer.isActive ? 'activated' : 'deactivated'} successfully.`,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/upload
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    // If Cloudinary is configured, upload there; otherwise serve locally from /uploads
    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'unikai_b2b',
      });
      return res.json({
        success: true,
        imageUrl: result.secure_url,
        storage: 'cloudinary',
      });
    }

    const localUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      imageUrl: localUrl,
      storage: 'local',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/executive-report
const getExecutiveReport = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;
    let startDate = null;
    const now = new Date();
    if (range === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (range === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (range === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const dateMatch = startDate ? { createdAt: { $gte: startDate } } : {};

    const [
      ordersInPeriod,
      orderStatusCounts,
      productsGrouped,
      totalCustomers,
      newCustomersInPeriod,
      topOrderedProducts,
      categories,
      brands,
      recentOrders,
    ] = await Promise.all([
      Order.find(dateMatch),
      Order.aggregate([
        { $match: dateMatch },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: '$isActive',
            count: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments({ role: 'CUSTOMER' }),
      User.countDocuments({
        role: 'CUSTOMER',
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),
      Order.aggregate([
        { $match: dateMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQuantity: { $sum: '$items.quantity' },
            orderCount: { $sum: 1 },
            size: { $first: '$items.size' },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
      Category.find().select('name slug productCount'),
      Brand.find().select('name slug productCount'),
      Order.find(dateMatch).sort({ createdAt: -1 }).limit(10),
    ]);

    // Product breakdown
    let activeProducts = 0;
    let inactiveProducts = 0;
    productsGrouped.forEach((g) => {
      if (g._id === true) activeProducts = g.count;
      else inactiveProducts = g.count;
    });
    const totalProducts = activeProducts + inactiveProducts;

    // Status breakdown
    const statusMap = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    let verifiedRevenue = 0;
    let hasPricedOrders = false;
    let totalItemsOrdered = 0;

    ordersInPeriod.forEach((ord) => {
      totalItemsOrdered += ord.totalQuantity || 0;
      if (ord.total !== null && ord.total !== undefined && Number(ord.total) > 0) {
        verifiedRevenue += Number(ord.total);
        hasPricedOrders = true;
      }
    });

    orderStatusCounts.forEach((s) => {
      if (s._id in statusMap) statusMap[s._id] = s.count;
      else statusMap[s._id] = s.count;
    });

    return res.json({
      success: true,
      report: {
        range,
        generatedAt: new Date().toISOString(),
        executiveRole: req.user.role,
        executiveName: req.user.name,
        ordersSummary: {
          totalOrders: ordersInPeriod.length,
          totalUnitsOrdered: totalItemsOrdered,
          pending: statusMap.Pending,
          confirmed: statusMap.Confirmed,
          processing: statusMap.Processing,
          delivered: statusMap.Delivered,
          cancelled: statusMap.Cancelled,
          hasPricedOrders,
          verifiedRevenue: hasPricedOrders ? Number(verifiedRevenue.toFixed(3)) : null,
          currency: 'OMR',
        },
        customersSummary: {
          totalCustomers,
          newInPeriod: newCustomersInPeriod,
        },
        catalogueSummary: {
          totalProducts,
          activeProducts,
          inactiveProducts,
          totalCategories: categories.length,
          totalBrands: brands.length,
          categories: categories.map((c) => ({
            name: c.name,
            slug: c.slug,
            productCount: c.productCount,
          })),
          brands: brands.map((b) => ({
            name: b.name,
            slug: b.slug,
            productCount: b.productCount,
          })),
        },
        topOrderedProducts: topOrderedProducts.map((p) => ({
          name: p._id,
          totalQuantity: p.totalQuantity,
          orderCount: p.orderCount,
          size: p.size || '',
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o._id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          status: o.status,
          totalQuantity: o.totalQuantity,
          total: o.total,
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  getCustomerById,
  toggleCustomerStatus,
  uploadFile,
  getExecutiveReport,
};
