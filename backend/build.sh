#!/bin/bash
set -e

echo "🏗️ Starting Render build process..."

# Install production dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database initialization
echo "🗄️ Initializing database..."
node src/utils/db-init.js

# Run health checks
echo "🏥 Running health checks..."
node src/utils/render-health.js

echo "✅ Render build completed successfully!"