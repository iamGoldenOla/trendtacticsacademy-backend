import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound, asyncHandler } from './middleware/errorHandler';
import logger, { httpLogger } from './utils/logger';
import { setupSwagger } from './config/swagger';

// Import routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import progressRoutes from './routes/progressRoutes';
import badgeRoutes from './routes/badgeRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy for Vercel / reverse proxies to resolve express-rate-limit validation errors
app.set('trust proxy', 1);

// Setup Swagger documentation
setupSwagger(app);

// Security middleware
app.use(helmet({
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
const limiter = rateLimit({
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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.trendtacticsdigital.com') ||
      process.env.FRONTEND_URL === origin ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };
    
    res.json(healthCheck);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// API info route
app.get('/api', (req: Request, res: Response) => {
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
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Trendtactics Academy LMS Backend!',
    api: '/api',
    documentation: '/api-docs'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Dashboard route
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    // Simulate dashboard logic here (replace with real logic as needed)
    res.json({
      success: true,
      message: "Route /api/dashboard found"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while processing your request."
    });
  }
});

// 404 handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as any;
  error.statusCode = 404;
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware (must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health check available at http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`, err);
    if (process.env.NODE_ENV === 'production') {
      server.close(() => {
        process.exit(1);
      });
    } else {
      logger.warn('Development mode: Server continuing despite unhandled rejection');
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`, err);
    process.exit(1);
  });
}

export default app;