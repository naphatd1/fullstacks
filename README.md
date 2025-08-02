# 🚀 Full-Stack NestJS + Next.js Application

## 📋 Overview

Full-stack web application ที่สร้างด้วย **NestJS** (Backend) และ **Next.js** (Frontend) พร้อมระบบ Authentication, File Upload, และ System Monitoring ครบครัน

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 4000    │    │   Port: 5450    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Key Features

### 🔙 Backend (NestJS)
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Role-based Access Control** (USER/ADMIN)
- ✅ **File Upload System** (Images, Documents, Chunked uploads)
- ✅ **Real-time Monitoring** (System metrics, Performance tracking)
- ✅ **RESTful API** with Swagger documentation
- ✅ **Database Management** (Prisma ORM, Migrations)
- ✅ **Security Features** (Rate limiting, CORS, Helmet)

### 🎨 Frontend (Next.js)
- ✅ **Modern Next.js 15** with App Router
- ✅ **Admin Dashboard** with dark/light themes
- ✅ **Redux State Management** 
- ✅ **Responsive Design** (Mobile-first)
- ✅ **Authentication Flow** with auto-refresh
- ✅ **File Management Interface**
- ✅ **System Monitoring Dashboard**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (หรือใช้ Docker)

### 1. Clone Repository
```bash
git clone <repository-url>
cd nest-api
```

### 2. Environment Setup
```bash
# Backend Environment
cp backend/.env.example backend/.env
# แก้ไข database connection และ JWT secrets

# Frontend Environment  
cp frontend/.env.example frontend/.env.local
# แก้ไข API base URL
```

### 3. Database Setup
```bash
cd backend
npm install
npm run prisma:migrate  # Run migrations
npm run prisma:seed     # Seed initial data
```

### 4. Development Mode

#### Option A: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### Option B: Docker Development
```bash
# Start all services
docker-compose -f docker-compose.fullstack.yml up -d
```

### 5. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Documentation**: http://localhost:4000/api/docs
- **Database GUI**: `npm run prisma:studio` (in backend directory)

## 📁 Project Structure

```
nest-api/
├── 🔙 backend/                    # NestJS Backend API
│   ├── src/                      # Source code
│   │   ├── auth/                 # Authentication module
│   │   ├── users/                # User management
│   │   ├── posts/                # Content management
│   │   ├── upload/               # File upload system
│   │   ├── monitoring/           # System monitoring
│   │   └── health/               # Health checks
│   ├── database/                 # Database & migrations
│   ├── docs/                     # API documentation
│   └── storage/                  # File storage
├── 🎨 frontend/                   # Next.js Frontend
│   ├── src/                      # Source code
│   │   ├── app/                  # App Router pages
│   │   ├── components/           # React components
│   │   ├── store/                # Redux store
│   │   └── lib/                  # Utility functions
│   └── free-nextjs-admin-dashboard-main/  # Admin template
├── 🐳 docker-compose.fullstack.yml  # Full-stack Docker setup
└── 📚 Documentation files         # Project documentation
```

## 🔐 Authentication

### User Roles
- **USER**: Basic user with limited access
- **ADMIN**: Full system access and user management

### Default Accounts
```bash
# Admin Account
Email: admin@example.com
Password: admin123

# User Account  
Email: user@example.com
Password: user123
```

## 🛠️ Development

### Backend Commands
```bash
cd backend

# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugging

# Database
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Database GUI
npm run prisma:generate  # Generate Prisma client

# Testing
npm run test            # Unit tests
npm run test:e2e        # E2E tests

# Docker
npm run docker:dev:up   # Development containers
npm run docker:prod:up  # Production containers
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev             # Development server
npm run build           # Production build
npm run start           # Production server

# Testing  
npm run lint           # ESLint check
npm run type-check     # TypeScript check
```

## 🐳 Docker Deployment

### Development
```bash
# Start development environment
docker-compose -f docker-compose.fullstack.yml up -d

# View logs
docker-compose logs -f
```

### Production
```bash
# Backend only
cd backend
npm run docker:prod:up

# Frontend only  
cd frontend
npm run docker:prod:up

# Full-stack (configure networks first)
docker-compose -f docker-compose.production.yml up -d
```

## 📊 Monitoring & Health

### Health Check Endpoints
- **Backend Health**: http://localhost:4000/api/health
- **System Monitoring**: http://localhost:4000/api/monitoring/dashboard
- **Frontend Health**: Built into Next.js

### Monitoring Features
- System performance metrics
- Database connection status
- File storage analytics
- API response times
- Error tracking and logging

## 🔧 Configuration

### Backend Configuration
```bash
# Environment Variables (.env)
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Frontend Configuration
```bash
# Environment Variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Your App Name
```

## 📚 Documentation

### API Documentation
- **Swagger UI**: http://localhost:4000/api/docs
- **Postman Collection**: `backend/postman-collection.json`
- **API Guide**: [API_ENDPOINTS.md](backend/API_ENDPOINTS.md)

### Detailed Guides
- [📖 Project Architecture](PROJECT_ARCHITECTURE.md)
- [🔧 Installation Guide](backend/docs/01-installation-guide.md)
- [🔐 Authentication Guide](backend/docs/02-authentication-guide.md)
- [📁 File Upload Guide](backend/docs/03-file-upload-guide.md)
- [📊 Monitoring Guide](backend/docs/04-monitoring-guide.md)
- [🚀 Deployment Guide](backend/docs/05-deployment-guide.md)

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm run test:full

# Specific test suites
npm run test:api:auth      # Authentication tests
npm run test:api:upload    # File upload tests
npm run test:api:monitoring # Monitoring tests
```

### API Testing with Postman
```bash
# Import collection
backend/postman-collection.json
backend/postman-environments.json

# Or use Newman CLI
newman run backend/postman-collection.json \
  -e backend/postman-environments.json
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:4000 | xargs kill  # Backend
lsof -ti:5450 | xargs kill  # Database
```

#### Database Connection Issues
```bash
# Check database status
docker ps | grep postgres

# Reset database
npm run prisma:reset

# Check connection
npm run prisma:studio
```

#### Docker Issues
```bash
# Clean Docker
docker system prune -af
docker volume prune -f

# Rebuild containers
docker-compose build --no-cache
```

### Getting Help
1. Check the [troubleshooting guide](backend/docs/10-troubleshooting-guide.md)
2. Review logs: `docker-compose logs -f`
3. Check health endpoints
4. Verify environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Create issue in repository
- **Health Check**: Visit http://localhost:4000/api/health

---

**Built with ❤️ using NestJS, Next.js, PostgreSQL, and Docker**

**Last Updated**: $(date)  
**Version**: 2.0.0