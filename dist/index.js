"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importStar(require("./utils/logger"));
const swagger_1 = require("./config/swagger");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const badgeRoutes_1 = __importDefault(require("./routes/badgeRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Setup Swagger documentation
(0, swagger_1.setupSwagger)(app);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost:5173',
    'https://academy.trendtacticsdigital.com',
    'https://trendtacticsdigital.com'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.trendtacticsdigital.com') ||
            process.env.FRONTEND_URL === origin ||
            process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: false, limit: '10mb' }));
// HTTP request logging
app.use(logger_1.httpLogger);
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check route
app.get('/api/health', async (req, res) => {
    try {
        const healthCheck = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
        };
        res.json(healthCheck);
    }
    catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});
// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Trendtactics Academy LMS API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            auth: '/api/auth',
            courses: '/api/courses',
            progress: '/api/progress',
            badges: '/api/badges',
            upload: '/api/upload',
            ai: '/api/ai',
            notifications: '/api/notifications',
        },
    });
});
// Root route for friendly landing
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Trendtactics Academy LMS Backend!',
        api: '/api',
        documentation: '/api-docs'
    });
});
// Mount routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
app.use('/api/badges', badgeRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
// Dashboard route
app.get('/api/dashboard', async (req, res) => {
    try {
        // Simulate dashboard logic here (replace with real logic as needed)
        res.json({
            success: true,
            message: "Route /api/dashboard found"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "An error occurred while processing your request."
        });
    }
});
// 404 handler for undefined routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});
// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});
// Only start the server when NOT running on Vercel (Vercel handles HTTP via serverless functions)
if (!process.env.VERCEL) {
    const PORT = Number(process.env.PORT) || 5001;
    const server = app.listen(PORT, () => {
        logger_1.default.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        logger_1.default.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
        logger_1.default.info(`🏥 Health check available at http://localhost:${PORT}/api/health`);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger_1.default.info('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            logger_1.default.info('Process terminated');
            process.exit(0);
        });
    });
    process.on('SIGINT', () => {
        logger_1.default.info('SIGINT received. Shutting down gracefully...');
        server.close(() => {
            logger_1.default.info('Process terminated');
            process.exit(0);
        });
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        logger_1.default.error(`Unhandled Promise Rejection: ${err.message}`, err);
        if (process.env.NODE_ENV === 'production') {
            server.close(() => {
                process.exit(1);
            });
        }
        else {
            logger_1.default.warn('Development mode: Server continuing despite unhandled rejection');
        }
    });
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        logger_1.default.error(`Uncaught Exception: ${err.message}`, err);
        process.exit(1);
    });
}
exports.default = app;
