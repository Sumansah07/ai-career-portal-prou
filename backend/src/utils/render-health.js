#!/usr/bin/env node
/**
 * Render-specific health check and startup script
 * This ensures the service is ready before Render marks it as healthy
 */

const mongoose = require('mongoose');
require('dotenv').config();

const { logInfo, logError } = require('./logger');

class RenderHealthChecker {
  constructor() {
    this.checks = [];
    this.timeout = 30000; // 30 seconds timeout
  }

  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }

  async runChecks() {
    logInfo('🏥 Starting Render health checks...');
    
    for (const check of this.checks) {
      try {
        logInfo(`🔍 Running check: ${check.name}`);
        await Promise.race([
          check.checkFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), this.timeout)
          )
        ]);
        logInfo(`✅ ${check.name} passed`);
      } catch (error) {
        logError(error, { context: `Health check failed: ${check.name}` });
        throw new Error(`Health check failed: ${check.name} - ${error.message}`);
      }
    }
    
    logInfo('🎉 All health checks passed');
  }
}

// Database connectivity check
async function checkDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  // Test basic operations
  await mongoose.connection.db.admin().ping();
  await mongoose.connection.close();
}

// Environment variables check
async function checkEnvironmentVariables() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const missing = required.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}

// Port availability check
async function checkPortAvailability() {
  const port = process.env.PORT || 10000;
  
  // In Render, we don't need to check port availability as it's managed
  // Just validate the port number is valid
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
}

// AI services connectivity check (optional)
async function checkAIServices() {
  if (!process.env.GEMINI_API_KEY) {
    logInfo('⚠️  GEMINI_API_KEY not set - AI features will be limited');
    return;
  }

  // Basic validation - we don't want to make actual API calls during health check
  if (process.env.GEMINI_API_KEY.length < 10) {
    throw new Error('GEMINI_API_KEY appears to be invalid');
  }
}

async function runRenderHealthCheck() {
  const healthChecker = new RenderHealthChecker();
  
  // Add all health checks
  healthChecker.addCheck('Environment Variables', checkEnvironmentVariables);
  healthChecker.addCheck('Database Connectivity', checkDatabase);
  healthChecker.addCheck('Port Configuration', checkPortAvailability);
  healthChecker.addCheck('AI Services Configuration', checkAIServices);

  try {
    await healthChecker.runChecks();
    logInfo('🚀 Service is ready for Render deployment');
    return true;
  } catch (error) {
    logError(error, { context: 'Render health check failed' });
    return false;
  }
}

// Export for use in other modules
module.exports = { runRenderHealthCheck };

// Run health check if this script is executed directly
if (require.main === module) {
  runRenderHealthCheck()
    .then((success) => {
      if (success) {
        console.log('✅ Render health check passed');
        process.exit(0);
      } else {
        console.error('❌ Render health check failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Health check error:', error.message);
      process.exit(1);
    });
}