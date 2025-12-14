"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logDebug = exports.logHttp = exports.logInfo = exports.logWarn = exports.logError = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston that you want to link the colors
winston_1.default.addColors(colors);
// Define which level to log based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
// Define format for logs
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console(),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false,
});
// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
exports.default = logger;
// Export specific log methods for convenience
const logError = (message, error) => {
    if (error) {
        logger.error(`${message}: ${error.message}`, { stack: error.stack });
    }
    else {
        logger.error(message);
    }
};
exports.logError = logError;
const logWarn = (message) => {
    logger.warn(message);
};
exports.logWarn = logWarn;
const logInfo = (message) => {
    logger.info(message);
};
exports.logInfo = logInfo;
const logHttp = (message) => {
    logger.http(message);
};
exports.logHttp = logHttp;
const logDebug = (message) => {
    logger.debug(message);
};
exports.logDebug = logDebug;
// HTTP request logging middleware
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 400) {
            logger.error(message);
        }
        else {
            logger.http(message);
        }
    });
    next();
};
exports.httpLogger = httpLogger;
