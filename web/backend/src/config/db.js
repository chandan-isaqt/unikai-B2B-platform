const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables (.env).');
    isConnected = false;
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`MongoDB connected: ${mongoUri}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection failed:', error.message);
    console.error('Please ensure Local MongoDB Community Server is running on your machine.');
    return false;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('MongoDB runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('MongoDB disconnected');
});

const getDbStatus = () => {
  return mongoose.connection.readyState === 1 && isConnected ? 'connected' : 'disconnected';
};

const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('MongoDB connection closed safely.');
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
};

module.exports = {
  connectDB,
  getDbStatus,
  closeDB,
};
