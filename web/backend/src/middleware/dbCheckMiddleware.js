const { getDbStatus, connectDB } = require('../config/db');

const requireDatabaseConnection = async (req, res, next) => {
  if (getDbStatus() !== 'connected') {
    // Attempt a quick reconnect once
    const connected = await connectDB();
    if (!connected) {
      return res.status(503).json({
        success: false,
        code: 'DB_UNAVAILABLE',
        database: 'disconnected',
        message: 'Database connection unavailable. Please start MongoDB and try again.',
      });
    }
  }
  next();
};

module.exports = {
  requireDatabaseConnection,
};
