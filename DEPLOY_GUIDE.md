# 🚀 Deploy Script Guide

## 📋 Overview

`deploy.sh` เป็น unified deployment script ที่ให้คุณ build และ deploy ทั้ง frontend และ backend ทีเดียว พร้อมตัวเลือกต่างๆ สำหรับการใช้งานที่ยืดหยุ่น

## 🎯 Features

- ✅ **Build ทั้งคู่หรือแยกได้** - Frontend, Backend, หรือทั้งสอง
- ✅ **Multi-platform builds** - Linux AMD64 และ ARM64
- ✅ **Docker Registry Push** - ส่งไปยัง GitHub Container Registry
- ✅ **Server Deployment** - Deploy ไปยัง production server อัตโนมัติ
- ✅ **Environment Support** - Production และ Staging
- ✅ **Cache Optimization** - ใช้ Docker BuildKit cache
- ✅ **Health Checks** - ตรวจสอบหลัง deploy
- ✅ **Colorful Output** - สีสันสวยงาม และ verbose mode

## 🛠️ Usage

### Basic Commands

```bash
# Build ทั้ง frontend และ backend locally
./deploy.sh

# Build backend เฉพาะ
./deploy.sh --backend-only

# Build frontend เฉพาะ  
./deploy.sh --frontend-only

# Build และ push ไปยัง registry
./deploy.sh --push

# Build, push, และ deploy ไปยัง server
./deploy.sh --deploy

# Deploy backend เฉพาะ
./deploy.sh --backend-only --deploy

# Deploy ไปยัง staging environment
./deploy.sh --env staging --deploy

# แสดงผลแบบละเอียด
./deploy.sh --verbose
```

### NPM Scripts (สะดวกกว่า)

```bash
# Local builds
npm run build              # Build ทั้งคู่
npm run build:backend      # Build backend เฉพาะ
npm run build:frontend     # Build frontend เฉพาะ

# Push to registry
npm run deploy:push        # Build และ push ทั้งคู่

# Deploy to server
npm run deploy:server      # Deploy ทั้งคู่
npm run deploy:backend:server   # Deploy backend เฉพาะ
npm run deploy:frontend:server  # Deploy frontend เฉพาะ
npm run deploy:staging     # Deploy ไปยัง staging
```

## ⚙️ Configuration

### Environment Variables

#### Required for Push/Deploy:
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"    # GitHub Personal Access Token
```

#### Required for Server Deployment:
```bash
export SERVER_IP="YOUR_SERVER_IP"         # Production server IP
export SERVER_USERNAME="ubuntu"           # SSH username
export SERVER_SSH_KEY_PATH="~/.ssh/id_rsa" # Path to SSH private key

# หรือใช้ SSH Agent แทน
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_rsa
```

#### Required on Server (ตั้งใน secrets):
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
export JWT_SECRET="your-jwt-secret"
export JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
```

### GitHub Actions Integration

#### Manual Deployment (แนะนำ)
1. ไปที่ **GitHub Repository → Actions**
2. เลือก **"Deploy with Script"** workflow
3. คลิก **"Run workflow"**
4. เลือกตัวเลือก:
   - **Backend only**: build backend เฉพาะ
   - **Frontend only**: build frontend เฉพาะ  
   - **Deploy to server**: deploy หรือแค่ build
   - **Environment**: production หรือ staging

#### Automatic Deployment
```bash
# Push ไปยัง main branch = auto build และ push
git push origin main

# Pull Request = auto build (ไม่ push)
git checkout -b feature/new-feature
git push origin feature/new-feature  # สร้าง PR
```

## 🐳 Docker Images

### Image Names
```
Backend:  ghcr.io/YOUR_USERNAME/fullstack/backend:latest
Frontend: ghcr.io/YOUR_USERNAME/fullstack/frontend:latest
```

### Tags Generated
```
- latest                    # Latest stable
- production-abc123-202501  # Environment + commit + timestamp
- staging-def456-202501     # Staging builds
```

## 🔍 Troubleshooting

### 1. Permission Denied
```bash
# แก้ไข permissions
chmod +x ./deploy.sh

# หรือรันด้วย bash
bash deploy.sh --help
```

### 2. Docker Login Failed
```bash
# ตรวจสอบ GitHub Token
echo $GITHUB_TOKEN

# Test login manually
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 3. SSH Connection Failed
```bash
# ทดสอบ SSH connection
ssh -i ~/.ssh/id_rsa ubuntu@YOUR_SERVER_IP

# ตรวจสอบ SSH key permissions
chmod 600 ~/.ssh/id_rsa
```

### 4. Build Failed
```bash
# ดู verbose output
./deploy.sh --verbose

# ตรวจสอบ Docker
docker version
docker buildx version

# ลบ cache และ rebuild
rm -rf /tmp/.buildx-cache*
./deploy.sh --verbose
```

### 5. Deploy Failed
```bash
# ตรวจสอบ server status
ssh ubuntu@YOUR_SERVER_IP 'docker ps'

# ตรวจสอบ logs
ssh ubuntu@YOUR_SERVER_IP 'cd /opt/fullstack && docker-compose logs'

# Manual health check
curl http://YOUR_SERVER_IP:4000/api/health
curl http://YOUR_SERVER_IP:3000
```

## 📊 Performance Tips

### 1. Use Cache
```bash
# Cache จะถูกเก็บใน /tmp/.buildx-cache*
# แต่ละ project จะมี cache แยกกัน
ls -la /tmp/.buildx-cache*
```

### 2. Parallel Builds
```bash
# Script รัน frontend และ backend พร้อมกัน
# ใช้ Docker BuildKit สำหรับความเร็ว
export DOCKER_BUILDKIT=1
```

### 3. Skip Unchanged
```bash
# ในอนาคตจะเพิ่ม change detection
# ตอนนี้ต้องเลือกเองว่าจะ build อะไร
./deploy.sh --backend-only    # ถ้าแก้ backend เฉพาะ
./deploy.sh --frontend-only   # ถ้าแก้ frontend เฉพาะ
```

## 🎯 Examples

### Development Workflow
```bash
# 1. Local development
npm run dev

# 2. Test build locally
npm run build

# 3. Push to registry for testing
npm run deploy:push

# 4. Deploy to staging
npm run deploy:staging

# 5. Deploy to production
npm run deploy:server
```

### CI/CD Workflow
```bash
# GitHub Actions จะรัน:
# - PR: build only
# - Push to main: build + push
# - Manual: build + push + deploy (ตามที่เลือก)
```

### Hotfix Workflow
```bash
# แก้ backend เฉพาะ
./deploy.sh --backend-only --deploy

# แก้ frontend เฉพาะ
./deploy.sh --frontend-only --deploy
```

## 🎉 Success Indicators

### Build Success
```
✅ Backend built successfully!
✅ Frontend built successfully!
```

### Deploy Success
```
✅ Backend health check passed!
✅ Frontend health check passed!
🎉 All operations completed successfully!
```

### Application URLs
```
Frontend: http://YOUR_SERVER_IP:3000
Backend API: http://YOUR_SERVER_IP:4000/api
API Docs: http://YOUR_SERVER_IP:4000/api/docs
Health Check: http://YOUR_SERVER_IP:4000/api/health
```

---

## 📚 Help

```bash
# แสดง help
./deploy.sh --help

# ดู options ทั้งหมด
./deploy.sh -h
```

**Happy Deploying!** 🚀