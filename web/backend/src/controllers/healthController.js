const { getDbStatus } = require('../config/db');

const getHealth = (req, res) => {
  const dbStatus = getDbStatus();
  const isConnected = dbStatus === 'connected';

  return res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    server: 'running',
    database: isConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
