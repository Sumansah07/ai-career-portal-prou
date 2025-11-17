#!/usr/bin/env node
/**
 * Database initialization script for Render deployment
 * This script sets up the database with proper indexes and initial data
 */

const mongoose = require('mongoose');
require('dotenv').config();

const { logInfo, logError } = require('./logger');

async function initializeDatabase() {
  try {
    logInfo('🔧 Starting database initialization...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logInfo('📦 Connected to MongoDB successfully');

    // Get all models to ensure they are registered
    const User = require('../models/User');
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const Resume = require('../models/Resume');

    logInfo('📋 Models loaded successfully');

    // Wait for indexes to be created
    await Promise.all([
      User.init(),
      Job.init(),
      Application.init(),
      Resume.init(),
    ]);

    logInfo('🗃️ Database indexes created successfully');

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@aicareerportal.com' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123!', 12);
      
      await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@aicareerportal.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      });
      
      logInfo('👤 Default admin user created');
      logInfo('📧 Email: admin@aicareerportal.com');
      logInfo('🔑 Password: admin123! (CHANGE THIS IMMEDIATELY)');
    } else {
      logInfo('👤 Admin user already exists');
    }

    // Verify database health
    const stats = await mongoose.connection.db.stats();
    logInfo('📊 Database statistics:', {
      collections: stats.collections,
      dataSize: `${Math.round(stats.dataSize / 1024)} KB`,
      indexSize: `${Math.round(stats.indexSize / 1024)} KB`,
    });

    logInfo('✅ Database initialization completed successfully');

  } catch (error) {
    logError(error, { context: 'Database initialization failed' });
    throw error;
  } finally {
    await mongoose.connection.close();
    logInfo('🔌 Database connection closed');
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error.message);
      process.exit(1);
    });
}

module.exports = initializeDatabase;