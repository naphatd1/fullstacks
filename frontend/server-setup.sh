#!/bin/bash

# Server Setup Script for Ubuntu
# Run this script on your Ubuntu server (YOUR_SERVER_IP) to prepare for deployment

set -e

echo "🛠️  Setting up Ubuntu server for frontend deployment..."

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
    sudo apt install -y git
else
    print_status "Git is already installed"
fi

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p /opt/fullstack
sudo chown $USER:$USER /opt/fullstack

# Clone repository (if not already cloned)
if [ ! -d "/opt/fullstack/.git" ]; then
    print_status "Cloning repository..."
    sudo mkdir -p /opt/fullstack
    sudo chown $USER:$USER /opt/fullstack
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
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 4000/tcp  # Backend API
sudo ufw --force enable

# Create SSL directory
print_status "Creating SSL directory..."
sudo mkdir -p /opt/fullstack/frontend/ssl
sudo chown $USER:$USER /opt/fullstack/frontend/ssl

# Generate self-signed SSL certificate (for testing)
print_status "Generating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /opt/fullstack/frontend/ssl/key.pem \
    -out /opt/fullstack/frontend/ssl/cert.pem \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=Organization/OU=OrgUnit/CN=$SERVER_IP"

print_status "✅ Server setup completed!"
print_status "🔄 Please log out and log back in for Docker group changes to take effect"

echo ""
print_warning "Next steps:"
print_warning "1. Configure your GitHub repository URL in this script"
print_warning "2. Set up GitHub Secrets for CI/CD:"
print_warning "   - SERVER_USERNAME: your Ubuntu username"
print_warning "   - SERVER_SSH_KEY: your private SSH key"
print_warning "3. Push your code to trigger deployment"

echo ""
print_status "🌐 Your server will be accessible at:"
print_status "   HTTP:  http://\$SERVER_IP:3000"
print_status "   HTTPS: https://\$SERVER_IP (with SSL)"