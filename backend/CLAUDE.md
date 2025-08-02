# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Database Operations
```bash
# Generate Prisma client (required after schema changes)
npm run prisma:generate

# Run database migrations
npm run prisma:migrate    # Development with migration name
npm run prisma:deploy     # Production deployment

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Development Server
```bash
# Start development server with hot reload
npm run start:dev

# Start with debugging enabled
npm run start:debug

# Production build and start
npm run build
npm run start:prod
```

### Testing
```bash
# Run all tests
npm run test:full

# API-specific tests
npm run test:api
npm run test:api:auth      # Authentication tests only
npm run test:api:upload    # File upload tests only
npm run test:api:monitoring # Monitoring tests only

# Unit and E2E tests
npm run test               # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
```

### Docker Operations
```bash
# Development environment
npm run docker:dev:up      # Start development containers
npm run docker:dev:down    # Stop development containers

# Production environment  
npm run docker:prod:up     # Start production containers
npm run docker:prod:down   # Stop production containers
```

### Code Quality
```bash
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

## Architecture Overview

This is a **NestJS API** with authentication, file management, and monitoring capabilities:

### Core Modules
- **Auth Module** (`src/auth/`): JWT authentication with refresh tokens, role-based access control
- **Users Module** (`src/users/`): User management with USER/ADMIN roles
- **Upload Module** (`src/upload/`): Hybrid file storage (Supabase + local fallback) with image processing
- **Posts Module** (`src/posts/`): Content management with file associations
- **Monitoring Module** (`src/monitoring/`): System metrics, health checks, performance tracking
- **Prisma Module** (`src/prisma/`): Database service wrapper

### Database Schema (PostgreSQL + Prisma)
- **Users**: Authentication with roles, refresh tokens
- **Posts**: Content with author relationships  
- **Files**: Comprehensive metadata with type/status tracking
- **FileChunks**: Large file upload support
- Schema location: `database/prisma/schema.prisma`

### Authentication System
- **JWT Strategy**: 15-minute access tokens, 7-day refresh tokens
- **Guards**: `JwtAuthGuard` (route protection), `RolesGuard` (role enforcement)
- **Decorators**: `@CurrentUser()` (inject user), `@Roles()` (define required roles)
- **Password Hashing**: Argon2 for security

### File Upload System
- **Hybrid Storage**: Primary Supabase Storage, fallback to local filesystem
- **Processing**: Automatic thumbnail generation for images using Sharp
- **Support**: Chunked uploads for large files, comprehensive MIME validation
- **Types**: Images, documents, videos, audio with proper categorization

## Development Patterns

### Module Structure
Each feature follows NestJS module pattern:
```
feature/
├── controllers/     # HTTP endpoints
├── services/       # Business logic
├── dto/           # Data transfer objects with validation
├── guards/        # Route protection (if needed)
└── decorators/    # Custom decorators (if needed)
```

### Security Implementation
- **Rate Limiting**: Global (1000/15min) + endpoint-specific limits
- **Input Validation**: Class-validator with DTOs
- **Security Headers**: Helmet middleware with CSP
- **CORS**: Configured for specific origins
- **Error Handling**: Global exception filters with security logging

### Database Access
- **Prisma Service**: Central database service (`src/prisma/prisma.service.ts`)
- **Repository Pattern**: Business logic in services, not controllers
- **Relationships**: Properly configured cascades and nullable references

## Configuration

### Environment Variables
Key variables to configure in `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
```

### Application Entry Point
- **Bootstrap**: `src/main.ts` - Sets up middleware, security, CORS, rate limiting
- **Port**: Configurable via `PORT` environment variable (default: 4000)

## Key Development Notes

### File Upload Guidelines
- Images automatically get thumbnail generation
- Files are categorized by MIME type into FileType enum
- Status tracking: UPLOADING → PROCESSING → COMPLETED/FAILED
- Both single and multiple file uploads supported

### Authentication Flow
1. Register/Login → Receive access + refresh tokens
2. Use access token for API calls
3. Refresh token when access token expires
4. Role-based access enforced by guards

### Monitoring System
- Real-time metrics collection via interceptors
- System health checks at `/api/monitoring/health`
- Performance tracking for all API endpoints
- Storage and database statistics

### Testing Strategy
- Custom API testing tools in `testing/tools/`
- Modular test scripts for different features
- Integration with server startup checking
- Full test suite with `npm run test:full`

### Docker Development
- Multi-stage Dockerfiles for dev/prod
- PostgreSQL included in docker-compose
- Health checks and volume persistence
- Separate configurations for environments