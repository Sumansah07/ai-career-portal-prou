const express = require('express');
const mongoose = require('mongoose');
const { logInfo } = require('../utils/logger');

const router = express.Router();

// @route   GET /api/monitoring/health
// @desc    Comprehensive health check
// @access  Public
router.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version,
    services: {}
  };

  try {
    // Database health
    const dbState = mongoose.connection.readyState;
    healthCheck.services.database = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      readyState: dbState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };

    // Memory usage
    const memUsage = process.memoryUsage();
    healthCheck.services.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      unit: 'MB'
    };

    // Process info
    healthCheck.services.process = {
      uptime: Math.round(process.uptime()),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    };

    // Check if critical environment variables are set
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      healthCheck.services.environment = {
        status: 'warning',
        missingVariables: missingEnvVars
      };
    } else {
      healthCheck.services.environment = {
        status: 'ok',
        configured: true
      };
    }

    // Overall status
    const isHealthy = dbState === 1 && missingEnvVars.length === 0;
    const statusCode = isHealthy ? 200 : 503;
    
    if (!isHealthy) {
      healthCheck.status = 'DEGRADED';
    }

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/monitoring/metrics
// @desc    Basic application metrics
// @access  Public (should be protected in production)
router.get('/metrics', async (req, res) => {
  try {
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');

    const metrics = {
      timestamp: new Date().toISOString(),
      application: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        collections: {
          users: await User.countDocuments(),
          jobs: await Job.countDocuments(),
          applications: await Application.countDocuments()
        }
      },
      business: {
        activeJobs: await Job.countDocuments({ status: 'active' }),
        totalApplications: await Application.countDocuments(),
        newUsersToday: await User.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        applicationsToday: await Application.countDocuments({
          appliedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        })
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message
    });
  }
});

// @route   GET /api/monitoring/ready
// @desc    Readiness probe for Kubernetes/Docker
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ready: false,
        reason: 'Database not connected'
      });
    }

    // Check if we can perform basic operations
    await mongoose.connection.db.admin().ping();

    res.json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/monitoring/live
// @desc    Liveness probe for Kubernetes/Docker
// @access  Public
router.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;