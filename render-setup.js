#!/usr/bin/env node
/**
 * Render Environment Setup Helper
 * Generates environment variables and provides setup guidance
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔧 AI Career Portal - Render Setup Helper\n');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Generate example MongoDB URI
const mongodbExample = 'mongodb+srv://username:password@cluster.mongodb.net/ai-career-portal?retryWrites=true&w=majority';

// Backend environment variables
const backendEnv = `# Backend Environment Variables for Render
# Copy these to your Render backend service dashboard

NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# Database (Replace with your MongoDB Atlas connection string)
MONGODB_URI=${mongodbExample}

# JWT Configuration (Generated secure secret)
JWT_SECRET=${jwtSecret}
JWT_EXPIRE=24h

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-frontend-app-name.onrender.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/tmp/uploads
ALLOWED_FILE_TYPES=pdf,doc,docx

# AI Services (Add your actual API keys)
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Email Service (Optional)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Security
BCRYPT_ROUNDS=12
TRUST_PROXY=true

# Logging
LOG_LEVEL=info

# Database Pool
DB_MIN_POOL_SIZE=2
DB_MAX_POOL_SIZE=10
DB_CONNECTION_TIMEOUT=30000`;

// Frontend environment variables
const frontendEnv = `# Frontend Environment Variables for Render
# Copy these to your Render frontend service dashboard

NODE_ENV=production

# API Configuration (Update with your actual backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-app-name.onrender.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-app-name.onrender.com

# Features
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_DEV_STATUS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_SUPPORTED_FORMATS=pdf,doc,docx

# Performance
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_CACHE_CONTROL=public, max-age=31536000

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-tracking-id`;

// Save environment files
fs.writeFileSync(path.join(__dirname, 'backend', '.env.render-generated'), backendEnv);
fs.writeFileSync(path.join(__dirname, 'frontend', '.env.render-generated'), frontendEnv);

console.log('✅ Environment files generated!');
console.log('📄 Backend: ./backend/.env.render-generated');
console.log('📄 Frontend: ./frontend/.env.render-generated\n');

console.log('🔑 Generated JWT Secret:');
console.log(`   ${jwtSecret}\n`);

console.log('📋 Next Steps:');
console.log('1. 🗄️  Set up MongoDB Atlas cluster');
console.log('2. 🔑 Get Gemini API key from Google AI Studio');
console.log('3. 🚀 Create Render services (backend first, then frontend)');
console.log('4. 📋 Copy environment variables to Render dashboard');
console.log('5. 🔄 Update URLs after both services are deployed\n');

console.log('📚 Full instructions: RENDER_DEPLOYMENT_GUIDE.md');
console.log('🎯 Your project description for resume:');
console.log('   "Full-stack AI-powered career portal with intelligent resume analysis,');
console.log('    job matching, and placement analytics using Node.js, Next.js, MongoDB,'); 
console.log('    and Google Gemini API deployed on Render."\n');

console.log('🎉 Ready for Render deployment!');