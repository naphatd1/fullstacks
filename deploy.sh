#!/bin/bash

# 🚀 Full-Stack Deployment Script
# Build และ deploy ทั้ง frontend และ backend ทีเดียว

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
GITHUB_USER="YOUR_USERNAME"
PROJECT_NAME="fullstack"
BACKEND_IMAGE="${REGISTRY}/${GITHUB_USER}/${PROJECT_NAME}/backend"
FRONTEND_IMAGE="${REGISTRY}/${GITHUB_USER}/${PROJECT_NAME}/frontend"

# Default values
BUILD_BACKEND=true
BUILD_FRONTEND=true
PUSH_IMAGES=false
DEPLOY_SERVER=false
ENVIRONMENT="production"
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to show help
show_help() {
    cat << EOF
🚀 Full-Stack Deployment Script

Usage: ./deploy.sh [OPTIONS]

OPTIONS:
    -b, --backend-only      Build backend only
    -f, --frontend-only     Build frontend only
    -p, --push             Push images to registry
    -d, --deploy           Deploy to server
    -e, --env ENV          Environment (production|staging) [default: production]
    -v, --verbose          Verbose output
    -h, --help             Show this help

EXAMPLES:
    ./deploy.sh                          # Build both frontend and backend locally
    ./deploy.sh --backend-only           # Build backend only
    ./deploy.sh --frontend-only          # Build frontend only
    ./deploy.sh --push                   # Build and push to registry
    ./deploy.sh --deploy                 # Build, push, and deploy to server
    ./deploy.sh --backend-only --deploy  # Deploy backend only

ENVIRONMENT VARIABLES:
    GITHUB_TOKEN            # Required for pushing to registry
    SERVER_IP              # Required for deployment
    SERVER_USERNAME        # Required for deployment
    SERVER_SSH_KEY_PATH    # Path to SSH private key file

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--backend-only)
                BUILD_BACKEND=true
                BUILD_FRONTEND=false
                shift
                ;;
            -f|--frontend-only)
                BUILD_BACKEND=false
                BUILD_FRONTEND=true
                shift
                ;;
            -p|--push)
                PUSH_IMAGES=true
                shift
                ;;
            -d|--deploy)
                PUSH_IMAGES=true
                DEPLOY_SERVER=true
                shift
                ;;
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Function to check requirements
check_requirements() {
    print_header "🔍 Checking Requirements"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    # Check Docker Buildx
    if ! docker buildx version &> /dev/null; then
        print_error "Docker Buildx is not available"
        exit 1
    fi
    print_success "Docker Buildx available"
    
    # Check if we need GitHub token for pushing
    if [ "$PUSH_IMAGES" = true ] && [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable is required for pushing images"
        exit 1
    fi
    
    # Check deployment requirements
    if [ "$DEPLOY_SERVER" = true ]; then
        if [ -z "$SERVER_IP" ] || [ -z "$SERVER_USERNAME" ]; then
            print_error "SERVER_IP and SERVER_USERNAME environment variables are required for deployment"
            exit 1
        fi
        
        if [ -z "$SERVER_SSH_KEY_PATH" ] && [ -z "$SSH_AUTH_SOCK" ]; then
            print_error "Either SERVER_SSH_KEY_PATH or SSH agent must be available for deployment"
            exit 1
        fi
    fi
    
    print_success "All requirements met!"
}

# Function to login to registry
docker_login() {
    if [ "$PUSH_IMAGES" = true ]; then
        print_status "Logging into Docker registry..."
        echo "$GITHUB_TOKEN" | docker login $REGISTRY -u $GITHUB_USER --password-stdin
        print_success "Logged into registry"
    fi
}

# Function to build backend
build_backend() {
    if [ "$BUILD_BACKEND" = true ]; then
        print_header "🔧 Building Backend"
        
        cd backend
        
        # Generate build tag
        GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        TIMESTAMP=$(date +%Y%m%d%H%M%S)
        TAG="${ENVIRONMENT}-${GIT_COMMIT}-${TIMESTAMP}"
        
        # Build arguments
        BUILD_ARGS="--build-arg NODE_ENV=${ENVIRONMENT}"
        BUILD_ARGS="$BUILD_ARGS --build-arg BUILDKIT_INLINE_CACHE=1"
        
        # Tags
        TAGS="-t ${BACKEND_IMAGE}:${TAG}"
        TAGS="$TAGS -t ${BACKEND_IMAGE}:${ENVIRONMENT}"
        TAGS="$TAGS -t ${BACKEND_IMAGE}:latest"
        
        # Build command
        BUILD_CMD="docker buildx build"
        BUILD_CMD="$BUILD_CMD -f Dockerfile.ultra-fast"
        BUILD_CMD="$BUILD_CMD --platform linux/amd64,linux/arm64"
        # BUILD_CMD="$BUILD_CMD --cache-from type=local,src=/tmp/.buildx-cache-backend"
        # BUILD_CMD="$BUILD_CMD --cache-to type=local,dest=/tmp/.buildx-cache-backend-new,mode=max"
        BUILD_CMD="$BUILD_CMD $BUILD_ARGS $TAGS"
        
        if [ "$PUSH_IMAGES" = true ]; then
            BUILD_CMD="$BUILD_CMD --push"
        else
            BUILD_CMD="$BUILD_CMD --load"
        fi
        
        BUILD_CMD="$BUILD_CMD ."
        
        print_status "Building backend with command:"
        if [ "$VERBOSE" = true ]; then
            echo "$BUILD_CMD"
        fi
        
        # Execute build
        eval $BUILD_CMD
        
        # Move cache (disabled for compatibility)
        # if [ -d "/tmp/.buildx-cache-backend-new" ]; then
        #     rm -rf /tmp/.buildx-cache-backend
        #     mv /tmp/.buildx-cache-backend-new /tmp/.buildx-cache-backend
        # fi
        
        print_success "Backend built successfully!"
        print_status "Backend tags: ${BACKEND_IMAGE}:${TAG}, ${BACKEND_IMAGE}:${ENVIRONMENT}, ${BACKEND_IMAGE}:latest"
        
        cd ..
    fi
}

# Function to build frontend
build_frontend() {
    if [ "$BUILD_FRONTEND" = true ]; then
        print_header "🎨 Building Frontend"
        
        cd frontend
        
        # Generate build tag
        GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        TIMESTAMP=$(date +%Y%m%d%H%M%S)
        TAG="${ENVIRONMENT}-${GIT_COMMIT}-${TIMESTAMP}"
        
        # Build arguments
        BUILD_ARGS="--build-arg NODE_ENV=${ENVIRONMENT}"
        
        # Tags
        TAGS="-t ${FRONTEND_IMAGE}:${TAG}"
        TAGS="$TAGS -t ${FRONTEND_IMAGE}:${ENVIRONMENT}"
        TAGS="$TAGS -t ${FRONTEND_IMAGE}:latest"
        
        # Build command
        BUILD_CMD="docker buildx build"
        BUILD_CMD="$BUILD_CMD --platform linux/amd64,linux/arm64"
        # BUILD_CMD="$BUILD_CMD --cache-from type=local,src=/tmp/.buildx-cache-frontend"
        # BUILD_CMD="$BUILD_CMD --cache-to type=local,dest=/tmp/.buildx-cache-frontend-new,mode=max"
        BUILD_CMD="$BUILD_CMD $BUILD_ARGS $TAGS"
        
        if [ "$PUSH_IMAGES" = true ]; then
            BUILD_CMD="$BUILD_CMD --push"
        else
            BUILD_CMD="$BUILD_CMD --load"
        fi
        
        BUILD_CMD="$BUILD_CMD ."
        
        print_status "Building frontend with command:"
        if [ "$VERBOSE" = true ]; then
            echo "$BUILD_CMD"
        fi
        
        # Execute build
        eval $BUILD_CMD
        
        # Move cache (disabled for compatibility)
        # if [ -d "/tmp/.buildx-cache-frontend-new" ]; then
        #     rm -rf /tmp/.buildx-cache-frontend
        #     mv /tmp/.buildx-cache-frontend-new /tmp/.buildx-cache-frontend
        # fi
        
        print_success "Frontend built successfully!"
        print_status "Frontend tags: ${FRONTEND_IMAGE}:${TAG}, ${FRONTEND_IMAGE}:${ENVIRONMENT}, ${FRONTEND_IMAGE}:latest"
        
        cd ..
    fi
}

# Function to deploy to server
deploy_to_server() {
    if [ "$DEPLOY_SERVER" = true ]; then
        print_header "🚀 Deploying to Server"
        
        # SSH command setup
        SSH_CMD="ssh"
        if [ -n "$SERVER_SSH_KEY_PATH" ]; then
            SSH_CMD="$SSH_CMD -i $SERVER_SSH_KEY_PATH"
        fi
        SSH_CMD="$SSH_CMD -o StrictHostKeyChecking=no"
        SSH_CMD="$SSH_CMD ${SERVER_USERNAME}@${SERVER_IP}"
        
        print_status "Deploying to ${SERVER_USERNAME}@${SERVER_IP}..."
        
        # Deploy script
        DEPLOY_SCRIPT="
set -e

echo '🚀 Starting deployment on server...'

# Navigate to project directory
cd /opt/fullstack || { echo 'Project directory not found'; exit 1; }

# Pull latest code
echo '📥 Pulling latest code...'
git pull origin main

# Login to container registry
echo '🔑 Logging into container registry...'
echo '$GITHUB_TOKEN' | docker login $REGISTRY -u $GITHUB_USER --password-stdin

# Pull latest images
echo '📦 Pulling latest Docker images...'
"

        if [ "$BUILD_BACKEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
docker pull ${BACKEND_IMAGE}:latest
"
        fi
        
        if [ "$BUILD_FRONTEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
docker pull ${FRONTEND_IMAGE}:latest
"
        fi
        
        DEPLOY_SCRIPT="$DEPLOY_SCRIPT
# Stop existing containers
echo '🛑 Stopping existing containers...'
"

        if [ "$BUILD_BACKEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
cd backend && docker-compose -f docker-compose.prod.yml down || true && cd ..
"
        fi
        
        if [ "$BUILD_FRONTEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
cd frontend && docker-compose -f docker-compose.prod.yml down || true && cd ..
"
        fi
        
        if [ "$BUILD_BACKEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
# Deploy backend
echo '🔧 Deploying backend...'
cd backend

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=4000
DATABASE_URL=\${DATABASE_URL}
JWT_SECRET=\${JWT_SECRET}
JWT_REFRESH_TOKEN_SECRET=\${JWT_REFRESH_TOKEN_SECRET}
SUPABASE_URL=\${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
CORS_ORIGINS=http://\${SERVER_IP},https://\${SERVER_IP}
EOF

# Run database migrations
echo '🗃️ Running database migrations...'
docker run --rm --env-file .env.production \\
  --network host \\
  ${BACKEND_IMAGE}:latest \\
  npm run prisma:deploy || echo 'Migration failed or not needed'

# Start backend containers
echo '▶️ Starting backend containers...'
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

cd ..
"
        fi
        
        if [ "$BUILD_FRONTEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
# Deploy frontend
echo '🎨 Deploying frontend...'
cd frontend

# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://\${SERVER_IP}:4000/api
SERVER_IP=\${SERVER_IP}
EOF

# Start frontend containers
echo '▶️ Starting frontend containers...'
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

cd ..
"
        fi
        
        DEPLOY_SCRIPT="$DEPLOY_SCRIPT
# Clean up old images
echo '🧹 Cleaning up old Docker images...'
docker image prune -f

# Health check
echo '🏥 Running health checks...'
sleep 10
"

        if [ "$BUILD_BACKEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
if curl -f http://localhost:4000/api/health; then
    echo '✅ Backend health check passed!'
else
    echo '⚠️ Backend health check failed'
fi
"
        fi
        
        if [ "$BUILD_FRONTEND" = true ]; then
            DEPLOY_SCRIPT="$DEPLOY_SCRIPT
if curl -f http://localhost:3000; then
    echo '✅ Frontend health check passed!'
else
    echo '⚠️ Frontend health check failed'
fi
"
        fi
        
        DEPLOY_SCRIPT="$DEPLOY_SCRIPT
echo '🎉 Deployment completed successfully!'
"
        
        # Execute deployment
        eval "$SSH_CMD '$DEPLOY_SCRIPT'"
        
        print_success "Deployment completed successfully!"
        print_status "Application URLs:"
        if [ "$BUILD_FRONTEND" = true ]; then
            print_status "  Frontend: http://${SERVER_IP}:3000"
        fi
        if [ "$BUILD_BACKEND" = true ]; then
            print_status "  Backend API: http://${SERVER_IP}:4000/api"
            print_status "  API Docs: http://${SERVER_IP}:4000/api/docs"
        fi
    fi
}

# Function to show summary
show_summary() {
    print_header "📋 Deployment Summary"
    
    echo "Configuration:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Backend: $([ "$BUILD_BACKEND" = true ] && echo "✅ Built" || echo "⏭️ Skipped")"
    echo "  Frontend: $([ "$BUILD_FRONTEND" = true ] && echo "✅ Built" || echo "⏭️ Skipped")"
    echo "  Push Images: $([ "$PUSH_IMAGES" = true ] && echo "✅ Yes" || echo "❌ No")"
    echo "  Deploy Server: $([ "$DEPLOY_SERVER" = true ] && echo "✅ Yes" || echo "❌ No")"
    
    if [ "$PUSH_IMAGES" = true ]; then
        echo ""
        echo "Docker Images:"
        if [ "$BUILD_BACKEND" = true ]; then
            echo "  Backend: ${BACKEND_IMAGE}:latest"
        fi
        if [ "$BUILD_FRONTEND" = true ]; then
            echo "  Frontend: ${FRONTEND_IMAGE}:latest"
        fi
    fi
    
    echo ""
    print_success "🎉 All operations completed successfully!"
}

# Main execution
main() {
    # Show header
    print_header "🚀 Full-Stack Deployment Script"
    
    # Parse arguments
    parse_args "$@"
    
    # Check requirements
    check_requirements
    
    # Login to Docker registry if needed
    docker_login
    
    # Build applications
    build_backend
    build_frontend
    
    # Deploy to server if requested
    deploy_to_server
    
    # Show summary
    show_summary
}

# Run main function with all arguments
main "$@"