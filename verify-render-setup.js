#!/usr/bin/env node
/**
 * Verify Render setup and configuration
 * Run this script to check if everything is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Render setup...\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'render.yaml',
  'backend/.env.render',
  'frontend/.env.render',
  'backend/src/utils/db-init.js',
  'backend/src/utils/render-health.js',
  'RENDER_DEPLOYMENT_GUIDE.md'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    checks.push({ name: `✅ ${file}`, status: 'PASS' });
  } else {
    checks.push({ name: `❌ ${file}`, status: 'FAIL' });
  }
});

// Check package.json scripts
const backendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'package.json')));
const frontendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json')));

if (backendPackage.scripts.start) {
  checks.push({ name: '✅ Backend start script', status: 'PASS' });
} else {
  checks.push({ name: '❌ Backend start script', status: 'FAIL' });
}

if (frontendPackage.scripts.build && frontendPackage.scripts.start) {
  checks.push({ name: '✅ Frontend build & start scripts', status: 'PASS' });
} else {
  checks.push({ name: '❌ Frontend build & start scripts', status: 'FAIL' });
}

// Display results
checks.forEach(check => {
  console.log(check.name);
});

const failedChecks = checks.filter(c => c.status === 'FAIL');
const passedChecks = checks.filter(c => c.status === 'PASS');

console.log(`\n📊 Results: ${passedChecks.length} passed, ${failedChecks.length} failed\n`);

if (failedChecks.length === 0) {
  console.log('🎉 All checks passed! Your project is ready for Render deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Run: node render-setup.js (to generate environment variables)');
  console.log('2. Set up MongoDB Atlas cluster');
  console.log('3. Get Gemini API key');
  console.log('4. Follow RENDER_DEPLOYMENT_GUIDE.md');
  console.log('\n🚀 Happy deploying!');
} else {
  console.log('⚠️  Some files are missing. Please ensure all required files are present.');
  failedChecks.forEach(check => {
    console.log(`   ${check.name}`);
  });
}