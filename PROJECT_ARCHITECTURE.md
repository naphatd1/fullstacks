# 🏗️ Project Architecture Overview

## 📁 โครงสร้างโปรเจค Full-Stack

```
nest-api/
├── 🔙 backend/          # NestJS API Backend
├── 🎨 frontend/         # Next.js Frontend  
├── 🐳 docker-compose.fullstack.yml
├── 📦 package.json      # Root package.json
└── 📚 Documentation Files
```

---

## 🔙 Backend Architecture (NestJS)

### 🗂️ โครงสร้างไฟล์หลัก

```
backend/
├── 📁 src/                    # Source code หลัก
│   ├── 🔐 auth/              # Authentication & Authorization
│   ├── 👥 users/             # User Management  
│   ├── 📝 posts/             # Content Management
│   ├── 📁 upload/            # File Upload System
│   ├── 📊 monitoring/        # System Monitoring
│   ├── 🏥 health/           # Health Checks
│   ├── 🔧 common/           # Shared Components
│   └── 🗃️ prisma/          # Database Service
├── 🗄️ database/             # Database & Migrations
│   └── prisma/
│       ├── schema.prisma    # Database Schema
│       ├── migrations/      # Database Migrations
│       └── seed.ts         # Database Seeding
├── 🐳 Docker Files           # Container Configurations
├── 📊 monitoring/           # System Monitoring
├── 🔧 config/              # Application Configuration
├── 📁 storage/             # File Storage
├── 📚 docs/                # API Documentation
└── 🧪 scripts/             # Deployment Scripts
```

### 🏛️ Architecture Patterns

#### 1. **Modular Architecture**
```typescript
// แต่ละ feature เป็น module แยก
AuthModule → UserModule → PostModule → UploadModule
```

#### 2. **Layered Architecture**
```
Controller Layer  → Service Layer → Repository Layer → Database
     ↓                   ↓              ↓              ↓
  HTTP Routes      Business Logic   Data Access    PostgreSQL
```

#### 3. **Security Architecture**
```
Request → Security Middleware → Guards → Route Handler
    ↓           ↓                 ↓           ↓
  Rate Limit   Helmet         JWT Auth    Business Logic
```

### 🔐 Authentication System

```typescript
// JWT-based Authentication
Login → Access Token (15min) + Refresh Token (7d)
      ↓
  Protected Routes → JWT Guard → Role Guard → Handler
```

**Features:**
- JWT Authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Rate limiting and security headers
- Session management

### 📁 File Upload System

```
Upload Request → Multer → Processing → Storage → Database Record
     ↓             ↓         ↓          ↓            ↓
  Validation   File Parse  Resize/    Supabase/   File Metadata
               Size Check  Compress   Local FS    in PostgreSQL
```

**Capabilities:**
- **Image Upload**: Auto-resize, thumbnail generation
- **Document Upload**: PDF, DOCX, TXT support
- **Chunk Upload**: Large file support (>10MB)
- **Hybrid Storage**: Supabase + Local fallback

### 📊 Monitoring System

```
API Request → Metrics Interceptor → Collectors → Endpoints
     ↓              ↓                   ↓          ↓
  Performance   Response Time      System Stats   /monitoring/*
  Database      Error Tracking     Storage Info   /health
```

---

## 🎨 Frontend Architecture (Next.js)

### 🗂️ โครงสร้างไฟล์หลัก

```
frontend/
├── 📁 src/
│   ├── 🎯 app/                    # App Router (Next.js 15)
│   │   ├── 🔐 auth/              # Authentication Pages
│   │   ├── 📊 dashboard/         # Dashboard Pages
│   │   ├── 📝 posts/             # Content Management
│   │   ├── 👤 profile/           # User Profile
│   │   ├── 📁 files/             # File Management
│   │   └── 📈 monitoring/        # System Monitoring
│   ├── 🧩 components/            # Reusable Components
│   │   ├── Layout/               # Layout Components
│   │   ├── dashboard/            # Dashboard Components
│   │   └── auth/                 # Authentication Components
│   ├── 🔗 contexts/              # React Contexts
│   ├── 🪝 hooks/                 # Custom Hooks
│   ├── 🏪 store/                 # Redux Store
│   ├── 📚 lib/                   # Utility Libraries
│   └── 🎨 styles/                # Global Styles
├── 🎨 free-nextjs-admin-dashboard-main/  # Admin Template
└── 🐳 Docker Files               # Container Configuration
```

### 🏗️ Architecture Patterns

#### 1. **Component Architecture**
```
App Router → Layout → Page → Components → UI Elements
     ↓          ↓       ↓        ↓            ↓
  Routing    Common    Route   Business     Reusable
  System     Layout    Logic   Logic        UI Parts
```

#### 2. **State Management**
```typescript
// Redux Toolkit + Context API
Redux Store → Auth Slice → Components
     ↓            ↓           ↓
Global State  User Data   Local State
```

#### 3. **Data Fetching**
```
Components → Custom Hooks → API Layer → Backend
     ↓           ↓            ↓          ↓
  UI Logic   Fetch Logic   HTTP Client  REST API
```

### 🔐 Authentication Flow

```typescript
// Client-side Authentication
Login Form → API Call → Store Tokens → Redirect
     ↓          ↓          ↓             ↓
  Validation  Backend   localStorage   Dashboard
             Auth       + Redux State
```

### 🎨 UI Architecture

**Base Template:** Free Next.js Admin Dashboard
- **Styling**: Tailwind CSS
- **Components**: Custom + Template components  
- **Responsive**: Mobile-first design
- **Theming**: Dark/Light mode support

---

## 🗄️ Database Architecture

### 📊 Database Schema (PostgreSQL + Prisma)

```sql
-- Core Tables
Users (id, email, name, role, profile_image) 
  ↓ 1:N
Posts (id, title, content, authorId)
  ↓ 1:N  
Files (id, filename, type, size, path, postId, uploaderId)
  ↓ 1:N
FileChunks (id, fileId, chunkIndex, path)

-- Auth Tables  
RefreshTokens (id, token, userId, expiresAt)
```

### 🔄 Database Relationships

```
User --1:N--> Posts
User --1:N--> Files  
User --1:N--> RefreshTokens
Post --1:N--> Files
File --1:N--> FileChunks
```

---

## 🐳 Containerization Strategy

### 📦 Docker Architecture

```yaml
# Full-Stack Deployment
Frontend Container  (Next.js + Nginx)
Backend Container   (NestJS + Node.js)
Database Container  (PostgreSQL)
Redis Container     (Caching - Optional)
```

### 🔄 Container Communication

```
Nginx → Frontend Container → Backend Container → Database
  ↓          ↓                    ↓               ↓
Reverse    Next.js App         NestJS API     PostgreSQL
Proxy      (Port 3000)         (Port 4000)    (Port 5450)
```

---

## 🚀 Deployment Architecture

### 🌐 Production Setup

```
Internet → Nginx Reverse Proxy → Container Network
             ↓                        ↓
        SSL Termination           Docker Compose
        Load Balancing            Frontend + Backend + DB
```

### 📍 Network Configuration

```yaml
# Port Mapping
Frontend:  localhost:3000 → Production
Backend:   localhost:4000 → Production  
Database:  localhost:5450 → Internal Only
```

---

## 🔧 Development Workflow

### 🛠️ Local Development

```bash
# Backend Development
npm run start:dev     # NestJS with hot reload
npm run prisma:studio # Database GUI

# Frontend Development  
npm run dev          # Next.js with hot reload
npm run build        # Production build

# Full-Stack
docker-compose up    # All services together
```

### 🧪 Testing Strategy

```
Unit Tests → Integration Tests → E2E Tests
     ↓              ↓               ↓
  Jest          API Testing     Playwright
Components     Postman/       Full User
Functions      Newman         Workflows
```

---

## 📊 Performance & Monitoring

### 📈 Monitoring Stack

```
Application → Metrics Collection → Monitoring Endpoints
     ↓              ↓                      ↓
  Interceptors   System Stats         /api/monitoring/
  Error Logs     Database Metrics     /api/health/
  Performance    Storage Analytics    Dashboard UI
```

### 🔍 Observability

- **Health Checks**: System status monitoring
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Centralized error logging
- **Resource Monitoring**: CPU, Memory, Storage usage

---

## 🔐 Security Architecture

### 🛡️ Security Layers

```
Network → Application → Authentication → Authorization → Data
   ↓           ↓             ↓              ↓            ↓
  HTTPS     Rate Limit    JWT Tokens     RBAC        Encryption
  CORS      Helmet        Refresh        Guards      Validation
  Firewall  Validation    Sessions       Roles       Sanitization
```

### 🔒 Security Features

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control
- **Input Validation**: Class-validator + sanitization
- **Rate Limiting**: Request throttling
- **Security Headers**: Helmet.js implementation
- **CORS**: Configured for specific origins

---

## 📚 Documentation Structure

```
📁 docs/
├── 01-installation-guide.md      # Setup Instructions
├── 02-authentication-guide.md    # Auth Implementation  
├── 03-file-upload-guide.md       # Upload System
├── 04-monitoring-guide.md        # System Monitoring
├── 05-deployment-guide.md        # Production Deployment
├── 06-api-testing-guide.md       # API Testing
├── 07-health-check-guide.md      # Health Monitoring
├── 08-database-guide.md          # Database Management
├── 09-security-guide.md          # Security Implementation
└── 10-troubleshooting-guide.md   # Common Issues
```

---

## 🎯 Key Features Summary

### Backend Capabilities
- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (USER/ADMIN)
- ✅ File upload with multiple storage backends
- ✅ Real-time system monitoring
- ✅ RESTful API with Swagger documentation
- ✅ Database migrations and seeding
- ✅ Error handling and logging
- ✅ Rate limiting and security headers

### Frontend Capabilities  
- ✅ Modern Next.js 15 with App Router
- ✅ Redux Toolkit for state management
- ✅ Responsive admin dashboard
- ✅ Dark/Light theme support
- ✅ Authentication with auto-refresh
- ✅ File upload interface
- ✅ System monitoring dashboard
- ✅ Error boundaries and loading states

### DevOps Features
- ✅ Docker containerization
- ✅ Multi-stage builds for optimization
- ✅ Production-ready deployment
- ✅ Health checks and monitoring
- ✅ Environment-based configuration
- ✅ Automated testing setup

---

**Last Updated**: $(date)  
**Architecture Version**: 2.0  
**Total Components**: 50+ modules and services