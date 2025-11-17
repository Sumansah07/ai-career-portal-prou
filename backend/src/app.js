// AI Career Portal Backend API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { requestLogger, logger, logInfo, logError } = require('./utils/logger');
const { globalErrorHandler, notFound } = require('./utils/errors');
require('dotenv').config();

// Initialize Sentry for error tracking
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
  });
}

const app = express();

// Trust proxy for production deployment
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Request logging middleware
app.use(requestLogger);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting with production-ready configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health'
});
app.use(limiter);

// CORS configuration with production settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001' // For testing
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logError(new Error(`CORS policy violation: ${origin} not allowed`));
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
try {
  app.use('/api/auth', require('./routes/auth-simple'));
  logInfo('Auth routes loaded');
  app.use('/api/users', require('./routes/users'));
  logInfo('Users routes loaded');
  app.use('/api/resumes', require('./routes/resumes'));
  logInfo('Resumes routes loaded');
  app.use('/api/jobs', require('./routes/jobs'));
  logInfo('Jobs routes loaded');
  app.use('/api/applications', require('./routes/applications'));
  logInfo('Applications routes loaded');
  app.use('/api/analytics', require('./routes/analytics'));
  logInfo('Analytics routes loaded');
  app.use('/api/monitoring', require('./routes/monitoring'));
  logInfo('Monitoring routes loaded');
} catch (error) {
  logError(error, { context: 'Route loading failed' });
  process.exit(1);
}

// Health check endpoint with detailed information
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'AI Career Portal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  
  const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// 404 handler
app.use('*', notFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Database connection with production-ready configuration
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-career-portal',
      options
    );
    
    logInfo('MongoDB connected successfully', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    });
  } catch (error) {
    logError(error, { context: 'Database connection failed' });
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Render requires binding to 0.0.0.0

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, HOST, () => {
    logInfo('Server started successfully', {
      port: PORT,
      host: HOST,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logInfo(`Received ${signal}, starting graceful shutdown`);
    
    server.close(async () => {
      logInfo('HTTP server closed');
      
      try {
        await mongoose.connection.close();
        logInfo('MongoDB connection closed');
        process.exit(0);
      } catch (error) {
        logError(error, { context: 'Error closing MongoDB connection' });
        process.exit(1);
      }
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logError(new Error('Forced shutdown due to timeout'));
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logError(err, { context: 'Unhandled Promise Rejection' });
    gracefulShutdown('unhandledRejection');
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logError(err, { context: 'Uncaught Exception' });
    gracefulShutdown('uncaughtException');
  });
};

startServer();

module.exports = app;
