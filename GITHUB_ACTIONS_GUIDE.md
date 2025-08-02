# 🚀 GitHub Actions CI/CD Guide

## 📋 Overview

โปรเจคมี GitHub Actions workflows ทั้งหมด 3 ไฟล์:

1. **`backend-ci-cd.yml`** - Backend เฉพาะ
2. **`frontend-ci-cd.yml`** - Frontend เฉพาะ  
3. **`fullstack-ci-cd.yml`** - Full-stack แบบอัตโนมัติ (แนะนำ)

## 🔧 Setup Required

### 1. Repository Secrets
ตั้งค่า secrets ใน GitHub repository settings:

```
SERVER_IP                    # IP ของ production server
SERVER_USERNAME              # SSH username 
SERVER_SSH_KEY              # SSH private key
DATABASE_URL                # Production database URL
JWT_SECRET                  # JWT secret key
JWT_REFRESH_TOKEN_SECRET    # JWT refresh secret
SUPABASE_URL               # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY  # Supabase service key
```

### 2. Server Setup
เซิร์ฟเวอร์ต้องมี:
- Docker & Docker Compose
- Git
- Project cloned ที่ `/opt/fullstack`
- SSH access สำหรับ deploy

## ⚡ Workflows Explained

### 🎯 Full-Stack CI/CD (แนะนำ)

**File**: `.github/workflows/fullstack-ci-cd.yml`

**Features:**
- ✅ **Smart Detection**: รัน tests เฉพาะส่วนที่เปลี่ยน
- ✅ **Parallel Jobs**: รัน backend/frontend พร้อมกัน
- ✅ **Conditional Deploy**: deploy เฉพาะที่มีการเปลี่ยนแปลง
- ✅ **Health Checks**: ตรวจสอบหลัง deploy
- ✅ **Error Handling**: มี fallback และ cleanup

**Triggers:**
```yaml
# Auto trigger
- Push to main/develop
- Pull Request to main

# Manual trigger
- workflow_dispatch (manual run)
```

**Jobs Flow:**
```
1. changes     → ตรวจสอบไฟล์ที่เปลี่ยน
2. backend-test → รัน tests (ถ้า backend เปลี่ยน)
3. frontend-test → รัน tests (ถ้า frontend เปลี่ยน)  
4. backend-build → build Docker image (ถ้า tests ผ่าน)
5. frontend-build → build Docker image (ถ้า tests ผ่าน)
6. deploy → deploy ไปยัง production server
```

### 🔧 Backend CI/CD

**File**: `.github/workflows/backend-ci-cd.yml`

**Jobs:**
- `lint-and-test` - ESLint, tests, build
- `build-and-push` - Docker build & push
- `deploy-server` - Deploy to production

**Features:**
- PostgreSQL service สำหรับ testing
- Prisma migrations
- Ultra-fast Docker build

### 🎨 Frontend CI/CD

**File**: `.github/workflows/frontend-ci-cd.yml`

**Jobs:**
- `lint-and-test` - ESLint, build
- `build-and-push` - Docker build & push  
- `deploy-server` - Deploy to production

## 🚨 Common Issues & Solutions

### 1. GitHub Actions ไม่ทำงาน

#### ตรวจสอบ Triggers
```yaml
# ตรวจสอบว่า workflow trigger ถูกต้อง
on:
  push:
    branches: [ main, develop ]  # ต้องตรงกับ branch ที่ push
```

#### ตรวจสอบ Path Filters
```yaml
# ถ้ามี path filters ตรวจสอบให้ดี
paths:
  - 'backend/**'  # ต้องตรงกับไฟล์ที่เปลี่ยน
```

#### ตรวจสอบ Permissions
```bash
# Repository Settings → Actions → General
# ✅ Allow GitHub Actions
# ✅ Allow actions created by GitHub
```

### 2. Docker Build ล้มเหลว

#### OutOfMemory Error
```yaml
# เพิ่ม build args ใน workflow
build-args: |
  NODE_ENV=production
  BUILDKIT_INLINE_CACHE=1
```

#### Slow Build
```yaml
# ใช้ Dockerfile.ultra-fast
file: ./backend/Dockerfile.ultra-fast
```

### 3. Deploy ล้มเหลว

#### SSH Connection Failed
```bash
# ตรวจสอบ secrets
SERVER_IP=xxx.xxx.xxx.xxx
SERVER_USERNAME=ubuntu
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
```

#### Docker Login Failed
```bash
# ตรวจสอบ GITHUB_TOKEN permissions
# Repository Settings → Actions → General → Workflow permissions
# ✅ Read and write permissions
```

#### Container Registry Push Failed
```bash
# ตรวจสอบ package permissions
# Repository Settings → Packages
# ✅ Write access for Actions
```

### 4. Database Migration Failed

#### Connection Error
```bash
# ตรวจสอบ DATABASE_URL secret
DATABASE_URL=postgresql://user:pass@host:port/db
```

#### Permission Error
```bash
# เพิ่ม --network host ใน migration
docker run --rm --env-file .env.production \
  --network host \
  image:latest npm run prisma:deploy
```

## 🛠️ Manual Troubleshooting

### 1. Test Locally
```bash
# ทดสอบ Docker build locally
cd backend
docker build -f Dockerfile.ultra-fast -t test .

# ทดสอบ deployment script
ssh user@server 'cd /opt/fullstack && git pull'
```

### 2. Check Actions Logs
```
GitHub Repository → Actions → Click on failed workflow
```

### 3. Debug on Server
```bash
# SSH เข้าเซิร์ฟเวอร์
ssh user@server

# ตรวจสอบ containers
docker ps
docker logs container-name

# ตรวจสอบ images
docker images

# ตรวจสอบ health
curl http://localhost:4000/api/health
curl http://localhost:3000
```

## ⚙️ Optimization Tips

### 1. Cache Optimization
```yaml
# ใช้ GitHub Actions cache
cache-from: type=gha
cache-to: type=gha,mode=max
```

### 2. Parallel Jobs
```yaml
# รัน jobs พร้อมกัน
needs: [test1, test2]  # รอทั้งสอง
# แทน
needs: test1
needs: test2  # รอทีละอัน
```

### 3. Conditional Deployment
```yaml
# Deploy เฉพาะเมื่อ tests ผ่าน
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## 📊 Monitoring

### GitHub Actions Analytics
```
Repository → Insights → Actions
```

### Deployment Status
```bash
# ตรวจสอบ deployment history
Repository → Deployments
```

### Performance Metrics
```bash
# ดู workflow run time
Repository → Actions → Workflows → Click workflow
```

## 🎯 Best Practices

### 1. Workflow Organization
- ใช้ `fullstack-ci-cd.yml` สำหรับการ deploy หลัก
- เก็บ individual workflows ไว้สำหรับ debugging
- ใช้ conditional jobs เพื่อประหยัดเวลา

### 2. Secret Management
- ใช้ environment-specific secrets
- แยก production/staging secrets
- ไม่ hard-code sensitive data

### 3. Error Handling
- ใช้ `set -e` ใน shell scripts
- มี cleanup steps
- ใช้ health checks หลัง deploy

### 4. Performance
- ใช้ Docker cache layers
- Parallel builds เมื่อเป็นไปได้
- Skip unnecessary steps

---

## 🚀 Quick Start

1. **Setup Secrets** - เพิ่ม required secrets
2. **Push to Main** - Workflow จะรันอัตโนมัติ
3. **Monitor Progress** - ดู GitHub Actions tab
4. **Check Deployment** - เข้า server URL

**Recommended Workflow**: `fullstack-ci-cd.yml` 🎯