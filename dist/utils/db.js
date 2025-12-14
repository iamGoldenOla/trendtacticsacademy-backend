"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
    return new Promise((resolve) => {
        try {
            const mongoURI = process.env.MONGO_URI;
            if (!mongoURI) {
                logger_1.default.error('MongoDB connection string is not defined in environment variables');
                resolve();
                return;
            }
            // Set up connection event handlers before connecting
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.default.error(`❌ MongoDB connection error: ${error.message}`);
                resolve(); // Always resolve to prevent crashes
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.default.warn('⚠️  MongoDB disconnected');
            });
            mongoose_1.default.connection.on('connected', () => {
                logger_1.default.info(`✅ MongoDB Connected: ${mongoose_1.default.connection.host}`);
                resolve();
            });
            // Attempt connection with more lenient timeouts and retries
            mongoose_1.default.connect(mongoURI, {
                serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
                retryWrites: true,
                w: 'majority',
                retryReads: true
            }).catch((error) => {
                logger_1.default.error(`❌ Error connecting to MongoDB: ${error.message}`);
                logger_1.default.warn('⚠️  Server will continue running without database connection');
                logger_1.default.info('Please ensure your IP address is whitelisted in MongoDB Atlas');
                resolve(); // Always resolve to prevent crashes
            });
            // Fallback timeout to ensure we always resolve
            setTimeout(() => {
                if (mongoose_1.default.connection.readyState === 0) {
                    logger_1.default.warn('⚠️  MongoDB connection timeout, server continuing without database');
                    resolve();
                }
            }, 6000);
        }
        catch (error) {
            logger_1.default.error(`❌ Error connecting to MongoDB: ${error.message}`);
            logger_1.default.warn('⚠️  Server will continue running without database connection');
            resolve(); // Always resolve to prevent crashes
        }
    });
};
exports.default = connectDB;
