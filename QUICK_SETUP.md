# ⚡ Quick Setup Guide

## 🚀 เริ่มต้นใช้งานใน 5 นาที

### 📋 Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### 1️⃣ Clone & Install
```bash
# Clone repository
git clone <your-repo-url>
cd nest-api

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Environment Setup
```bash
# Backend Environment
cd backend
cp .env.example .env

# แก้ไขใน .env:
DATABASE_URL="postgresql://naphat:123456@YOUR_DB_HOST:5450/nested?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret-here"
```

```bash
# Frontend Environment  
cd frontend
cp .env.example .env.local

# แก้ไขใน .env.local:
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3️⃣ Database Setup
```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

### 4️⃣ Start Development

#### 🔄 Option A: Manual (Recommended for development)
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

#### 🐳 Option B: Docker (Easier setup)
```bash
# Start all services
docker-compose -f docker-compose.fullstack.yml up -d

# View logs
docker-compose logs -f
```

### 5️⃣ Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api  
- **API Docs**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/api/health

### 6️⃣ Test Login
```
Admin Account:
Email: admin@example.com
Password: admin123

User Account:
Email: user@example.com  
Password: user123
```

## 🚨 Quick Troubleshooting

### Port Already in Use?
```bash
# Kill processes
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:4000 | xargs kill  # Backend
```

### Database Issues?
```bash
cd backend
npm run prisma:reset  # Reset database
npm run prisma:studio # Open database GUI
```

### Docker Issues?
```bash
docker system prune -af  # Clean everything
docker-compose build --no-cache  # Rebuild
```

## ✅ Success Checklist

- [ ] Backend started at :4000
- [ ] Frontend started at :3000  
- [ ] Database connected
- [ ] Can login to dashboard
- [ ] API docs accessible
- [ ] Health check returns OK

## 📚 Next Steps

1. **Read Documentation**: [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)
2. **API Testing**: Import [Postman Collection](backend/postman-collection.json)
3. **Customize**: Start building your features!

---

**Need Help?** Check [README.md](README.md) or [troubleshooting guide](backend/docs/10-troubleshooting-guide.md)