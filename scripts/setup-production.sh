#!/bin/bash
set -e

echo "🔧 Setting up production environment..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p nginx/ssl
mkdir -p data/mongodb
mkdir -p data/redis

# Set proper permissions
echo "🔒 Setting permissions..."
chmod +x scripts/*.sh
chmod 755 backend/uploads
chmod 755 backend/logs

# Copy environment files
echo "📋 Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.production backend/.env
    echo "⚠️  Please update backend/.env with your production values"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.production frontend/.env.local
    echo "⚠️  Please update frontend/.env.local with your production values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd backend && npm ci --only=production
cd ../frontend && npm ci --only=production
cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend && npm run build
cd ..

# Generate SSL certificates (self-signed for development)
if [ ! -f nginx/ssl/cert.pem ]; then
    echo "🔐 Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "⚠️  Self-signed certificates generated. Replace with real certificates for production."
fi

echo "✅ Production setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment files with your production values"
echo "2. Replace self-signed SSL certificates with real ones"
echo "3. Configure your production database"
echo "4. Set up monitoring and alerting"
echo "5. Run: ./scripts/validate-production.sh"
echo "6. Deploy: ./scripts/deploy-production.sh"