#!/bin/bash
set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Build and start services
echo "📦 Building Docker containers..."
docker-compose -f docker-compose.yml build --no-cache

echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.yml down

echo "🚀 Starting production services..."
docker-compose -f docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health checks
echo "🏥 Running health checks..."

# Check backend health
if curl -f http://localhost:5000/api/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check database connection
if docker-compose exec backend node -e "require('./src/utils/db-check.js')"; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo "🎉 Production deployment completed successfully!"
echo "📊 View logs: docker-compose logs -f"
echo "🔍 Monitor services: docker-compose ps"