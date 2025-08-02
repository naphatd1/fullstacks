#!/bin/bash

# Frontend Deployment Script for Ubuntu Server
# Usage: ./deploy.sh

set -e

echo "🚀 Starting frontend deployment..."

# Load environment variables (ignore comments and empty lines)
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | grep -v '^$' | xargs)
fi

# Configuration
PROJECT_DIR=$(pwd)
COMPOSE_FILE="docker-compose.prod.yml"

# Check if SERVER_IP is set
if [ -z "$SERVER_IP" ]; then
    echo "❌ SERVER_IP environment variable is not set!"
    echo "Please create .env.production file with SERVER_IP=your_server_ip"
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
docker build -t fullstack-frontend:latest .

print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

print_status "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

print_status "Cleaning up old Docker images..."
docker image prune -f

print_status "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

print_status "✅ Frontend deployment completed successfully!"
print_status "🌐 Frontend is now running at: http://$SERVER_IP:3000"
print_status "🔒 HTTPS access: https://$SERVER_IP (if SSL is configured)"

echo ""
print_warning "Don't forget to:"
print_warning "1. Configure your firewall to allow ports 80, 443, and 3000"
print_warning "2. Set up SSL certificates for HTTPS"
print_warning "3. Configure your domain DNS if needed"