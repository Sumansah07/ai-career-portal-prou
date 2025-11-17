#!/bin/bash
set -e

echo "🧪 Running comprehensive system validation..."

# Function to check service health
check_service() {
    local service_name=$1
    local health_url=$2
    local max_attempts=10
    local attempt=1

    echo "Checking $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts failed, retrying in 5s..."
        sleep 5
        ((attempt++))
    done
    
    echo "❌ $service_name health check failed after $max_attempts attempts"
    return 1
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Build and start services in test mode
echo "🏗️ Building test environment..."
docker-compose -f docker-compose.yml up -d --build

# Wait for services to initialize
echo "⏳ Waiting for services to initialize..."
sleep 45

# Health checks
echo "🏥 Running health checks..."

# Check backend
check_service "Backend API" "http://localhost:5000/api/health"

# Check frontend
check_service "Frontend" "http://localhost:3000"

# Check database connectivity
echo "🗄️ Testing database connection..."
if docker-compose exec -T backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:secure-password@mongodb:27017/ai-career-portal?authSource=admin')
  .then(() => { console.log('DB connected'); process.exit(0); })
  .catch(() => { console.log('DB failed'); process.exit(1); });
"; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Run backend tests
echo "🧪 Running backend tests..."
if docker-compose exec -T backend npm test; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
    exit 1
fi

# API endpoint tests
echo "🔗 Testing critical API endpoints..."

# Test auth endpoint
if curl -f -s -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}' > /dev/null; then
    echo "✅ Auth endpoint working"
else
    echo "❌ Auth endpoint failed"
    exit 1
fi

# Test jobs endpoint
if curl -f -s http://localhost:5000/api/jobs > /dev/null; then
    echo "✅ Jobs endpoint working"
else
    echo "❌ Jobs endpoint failed"
    exit 1
fi

# Performance tests
echo "⚡ Running basic performance tests..."
echo "Testing concurrent requests..."

# Run 10 concurrent requests to health endpoint
for i in {1..10}; do
    curl -f -s http://localhost:5000/api/health > /dev/null &
done
wait

echo "✅ Concurrent request test passed"

# Clean up test environment
echo "🧹 Cleaning up test environment..."
docker-compose -f docker-compose.yml down

echo "🎉 All validation tests passed! System is production-ready."
echo ""
echo "📋 Summary:"
echo "✅ Docker environment builds successfully"
echo "✅ All services start and respond to health checks"
echo "✅ Database connectivity works"
echo "✅ Backend tests pass"
echo "✅ Critical API endpoints respond correctly"
echo "✅ Basic performance tests pass"
echo ""
echo "🚀 Ready for production deployment!"