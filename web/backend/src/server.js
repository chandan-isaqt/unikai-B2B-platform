const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB, closeDB } = require('./config/db');
const { requireDatabaseConnection } = require('./middleware/dbCheckMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const salesmanRoutes = require('./routes/salesmanRoutes');
const settingRoutes = require('./routes/settingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers (allow cross-origin resource loading for /uploads images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration (supports React Web, Admin Panel, and Flutter App)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Flutter mobile apps, curl, Postman) or localhost
      if (!origin) return callback(null, true);
      const allowedFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (
        origin === allowedFrontend ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://10.0.2.2:') ||
        origin.startsWith('http://192.168.')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // High enough for smooth local development & testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again shortly.',
  },
});

app.use('/api', apiLimiter);

// Body Parsers & Logger
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint (always accessible even if MongoDB is disconnected)
app.use('/api/health', healthRoutes);

// Database-Backed API Routes
app.use('/api/auth', requireDatabaseConnection, authRoutes);
app.use('/api/products', requireDatabaseConnection, productRoutes);
app.use('/api/categories', requireDatabaseConnection, categoryRoutes);
app.use('/api/brands', requireDatabaseConnection, brandRoutes);
app.use('/api/cart', requireDatabaseConnection, cartRoutes);
app.use('/api/orders', requireDatabaseConnection, orderRoutes);
app.use('/api/users', requireDatabaseConnection, userRoutes);
app.use('/api/salesman', requireDatabaseConnection, salesmanRoutes);
app.use('/api/settings', requireDatabaseConnection, settingRoutes);
app.use('/api/admin', requireDatabaseConnection, adminRoutes);

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Unikai B2B Product Catalogue & Ordering API',
    version: '1.0.0',
    status: 'running',
    healthEndpoint: '/api/health',
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Closing server and MongoDB connection...`);
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

if (require.main === module) {
  startServer();
}

module.exports = app;
