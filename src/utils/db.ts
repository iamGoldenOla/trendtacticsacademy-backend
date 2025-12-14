import mongoose from 'mongoose';
import logger from './logger';

/**
 * Connect to MongoDB database
 */
const connectDB = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    try {
      const mongoURI = process.env.MONGO_URI;
      
      if (!mongoURI) {
        logger.error('MongoDB connection string is not defined in environment variables');
        resolve();
        return;
      }
      
      // Set up connection event handlers before connecting
      mongoose.connection.on('error', (error) => {
        logger.error(`❌ MongoDB connection error: ${error.message}`);
        resolve(); // Always resolve to prevent crashes
      });
      
      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB disconnected');
      });
      
      mongoose.connection.on('connected', () => {
        logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        resolve();
      });
      
      // Attempt connection with more lenient timeouts and retries
      mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        retryWrites: true,
        w: 'majority',
        retryReads: true
      }).catch((error) => {
        logger.error(`❌ Error connecting to MongoDB: ${error.message}`);
        logger.warn('⚠️  Server will continue running without database connection');
        logger.info('Please ensure your IP address is whitelisted in MongoDB Atlas');
        resolve(); // Always resolve to prevent crashes
      });
      
      // Fallback timeout to ensure we always resolve
      setTimeout(() => {
        if (mongoose.connection.readyState === 0) {
          logger.warn('⚠️  MongoDB connection timeout, server continuing without database');
          resolve();
        }
      }, 6000);
      
    } catch (error: any) {
      logger.error(`❌ Error connecting to MongoDB: ${error.message}`);
      logger.warn('⚠️  Server will continue running without database connection');
      resolve(); // Always resolve to prevent crashes
    }
  });
};

export default connectDB;