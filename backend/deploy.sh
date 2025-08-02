#!/bin/bash

# Backend Deployment Script for Ubuntu Server
# Usage: ./deploy.sh

set -e

echo "🚀 Starting backend deployment..."

# Load environment variables (ignore comments and empty lines)
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | grep -v '^$' | xargs)
fi

# Configuration
PROJECT_DIR=$(pwd)
COMPOSE_FILE="docker-compose.prod.yml"

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set!"
    echo "Please create .env.production file with required database configuration"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is not set!"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

print_status "Using current directory: $PROJECT_DIR"
print_status "Checking docker-compose file..."
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker compose file $COMPOSE_FILE not found!"
    exit 1
fi

print_status "Checking if this is a git repository..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    print_status "Pulling latest code from repository..."
    git pull origin main
else
    print_warning "Not in a git repository, skipping git pull"
fi

print_status "Building Docker image..."
# ลองใช้ Dockerfile.working ก่อน ถ้าไม่ได้จะใช้ในโฟลเดอร์ docker
if [ -f "Dockerfile.working" ]; then
    print_status "Using Dockerfile.working..."
    docker build -f Dockerfile.working -t fullstack-backend:latest .
elif [ -f "docker/Dockerfile" ]; then
    print_status "Using docker/Dockerfile..."
    docker build -f docker/Dockerfile -t fullstack-backend:latest .
else
    print_status "Using default Dockerfile..."
    docker build -t fullstack-backend:latest .
fi

print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

print_status "Running database migrations..."
docker run --rm --env-file .env.production \
    -v $(pwd)/database:/app/database \
    fullstack-backend:latest \
    npm run prisma:deploy

print_status "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to be ready..."
sleep 10

print_status "Cleaning up old Docker images..."
docker image prune -f

print_status "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

print_status "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        print_status "✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend health check failed after 30 attempts"
        print_status "Checking logs..."
        docker-compose -f docker-compose.prod.yml logs backend
    fi
    sleep 2
done

print_status "✅ Backend deployment completed successfully!"
print_status "🌐 Backend API is now running at: http://localhost:4000"
print_status "📋 API Documentation: http://localhost:4000/api"
print_status "🏥 Health Check: http://localhost:4000/api/health"

echo ""
print_warning "Don't forget to:"
print_warning "1. Configure your firewall to allow port 4000"
print_warning "2. Update frontend NEXT_PUBLIC_API_URL to point to this backend"
print_warning "3. Set up SSL certificates for HTTPS if needed"