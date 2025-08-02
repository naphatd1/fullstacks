#!/bin/bash

# Backend Server Setup Script for Ubuntu
# Run this script on your Ubuntu server to prepare for backend deployment

set -e

echo "🛠️  Setting up Ubuntu server for backend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    print_status "Docker is already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Install Git if not already installed
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    sudo apt install -y git curl
else
    print_status "Git is already installed"
fi

# Install PostgreSQL client (for admin tasks)
print_status "Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p /opt/fullstack
sudo chown $USER:$USER /opt/fullstack

# Clone repository (if not already cloned)
if [ ! -d "/opt/fullstack/.git" ]; then
    print_status "Cloning repository..."
    cd /opt/fullstack
    git clone https://github.com/naphatd1/fullstack.git .
else
    print_status "Repository already exists"
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 4000/tcp  # Backend API
sudo ufw allow 5432/tcp  # PostgreSQL (optional, for admin access)
sudo ufw --force enable

# Create backend data directories
print_status "Creating backend data directories..."
sudo mkdir -p /opt/fullstack/backend/storage/{uploads,logs}
sudo mkdir -p /var/lib/postgresql/data
sudo chown -R $USER:$USER /opt/fullstack/backend/storage

# Generate secure secrets for backend
print_status "Generating secure JWT secrets..."
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)

# Create environment file template
print_status "Creating environment configuration..."
cd /opt/fullstack/backend
cat > .env.production << EOF
NODE_ENV=production
PORT=4000

# Database Configuration
DATABASE_URL=postgresql://admin:${POSTGRES_PASSWORD}@localhost:5432/nestapi
POSTGRES_DB=nestapi
POSTGRES_USER=admin
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_TOKEN_SECRET=${JWT_REFRESH_SECRET}

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_LIMIT=1000

# CORS Origins (update with your frontend URLs)
CORS_ORIGINS=http://\$SERVER_IP,https://\$SERVER_IP
EOF

print_status "✅ Backend server setup completed!"
print_status "🔄 Please log out and log back in for Docker group changes to take effect"

echo ""
print_status "📋 Generated configuration:"
print_status "   Database: PostgreSQL with user 'admin'"
print_status "   API Port: 4000"
print_status "   Environment file: /opt/fullstack/backend/.env.production"

echo ""
print_warning "Next steps:"
print_warning "1. Update CORS_ORIGINS in .env.production with your actual server IP"
print_warning "2. Configure GitHub Secrets for CI/CD:"
print_warning "   - SERVER_IP: your server IP address"
print_warning "   - SERVER_USERNAME: your Ubuntu username"  
print_warning "   - SERVER_SSH_KEY: your private SSH key"
print_warning "   - DATABASE_URL: the generated database URL"
print_warning "   - JWT_SECRET: the generated JWT secret"
print_warning "   - JWT_REFRESH_TOKEN_SECRET: the generated refresh secret"
print_warning "3. Push your code to trigger deployment"

echo ""
print_status "🌐 Your backend API will be accessible at:"
print_status "   HTTP:  http://\$SERVER_IP:4000/api"
print_status "   Docs:  http://\$SERVER_IP:4000/api (Swagger documentation)"
print_status "   Health: http://\$SERVER_IP:4000/api/health"