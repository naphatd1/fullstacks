# Environment Configuration Guide

## การแก้ไขปัญหา Hardcoded IP Addresses

### ปัญหาที่แก้ไข
- ลบ hardcoded IP addresses (192.168.x.x, 10.x.x.x, 172.x.x.x) ทั้งหมด
- เปลี่ยนให้ใช้ environment variables แทน
- สร้าง centralized configuration management

### ไฟล์ที่สร้างใหม่

#### 1. `frontend/src/lib/env-config.ts`
Central configuration manager สำหรับ environment variables:

```typescript
import { envConfig } from '@/lib/env-config';

// Get API URL
const apiUrl = envConfig.getApiUrl();

// Get health check URL  
const healthUrl = envConfig.getHealthUrl();

// Get all available API URLs (with fallbacks)
const apiUrls = envConfig.getApiUrls();
```

### Environment Variables

#### Backend (.env)
```env
# CORS Configuration - support multiple origins
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.39:3000

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Application
PORT=4000
NODE_ENV=development
```

#### Frontend (.env.local)
```env
# API Configuration - primary URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Security settings
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_SECURITY_HEADERS=true

# Rate limiting
NEXT_PUBLIC_LOGIN_RATE_LIMIT=5
NEXT_PUBLIC_REGISTER_RATE_LIMIT=3

# Session settings
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
```

### การใช้งาน

#### 1. Development (Local)
```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Backend  
CORS_ORIGIN=http://localhost:3000
```

#### 2. Development (Mobile Testing)
```env
# Frontend - ใช้ IP ของเครื่อง developer
NEXT_PUBLIC_API_URL=http://192.168.1.100:4000/api

# Backend - อนุญาต mobile access
CORS_ORIGIN=http://localhost:3000,http://192.168.1.100:3000
```

#### 3. Production
```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Backend
CORS_ORIGIN=https://yourdomain.com
```

### ไฟล์ที่แก้ไข

#### Backend Files
1. `src/main.ts` - ลบ hardcoded IPs ใน CORS config
   ```typescript
   // Before
   const allowedOrigins = [
     "http://localhost:3000",
     "http://192.168.1.39:3000", // ❌ Hardcoded
   ];

   // After  
   const allowedOrigins = [
     "http://localhost:3000",
     ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
   ];
   ```

#### Frontend Files
1. `frontend/src/lib/api.ts` - ใช้ envConfig
2. `frontend/src/lib/simple-api.ts` - ใช้ envConfig  
3. `frontend/src/lib/nextjs15-api.ts` - ใช้ envConfig
4. `frontend/src/lib/api-config.ts` - ลบ hardcoded gateway IPs
5. `frontend/src/components/ApiStatusIndicator.tsx` - ลบ hardcoded IPs
6. `frontend/src/store/slices/authSlice.ts` - ใช้ envConfig
7. `frontend/src/contexts/AuthContext.tsx` - ใช้ envConfig

### Benefits

#### 1. Flexibility
- เปลี่ยน API URL ได้ง่ายผ่าน environment variables
- รองรับ multiple environments (dev, staging, prod)
- ไม่ต้อง hardcode IP addresses

#### 2. Security  
- ไม่มี sensitive URLs ใน source code
- CORS configuration ที่ยืดหยุ่น
- Environment-specific settings

#### 3. Maintainability
- Central configuration management
- Consistent API URL handling
- Easy debugging และ monitoring

### Mobile Development

#### สำหรับ Mobile Testing
1. หา IP address ของเครื่อง developer:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   
   # Windows  
   ipconfig
   ```

2. อัปเดต environment variables:
   ```env
   # Frontend
   NEXT_PUBLIC_API_URL=http://192.168.1.100:4000/api
   
   # Backend
   CORS_ORIGIN=http://localhost:3000,http://192.168.1.100:3000
   ```

3. Restart servers:
   ```bash
   # Backend
   npm run start:dev
   
   # Frontend
   npm run dev
   ```

#### Auto-Detection สำหรับ Mobile
System จะ auto-detect mobile network และใช้ current host IP:

```typescript
// ถ้าเข้าผ่าน IP address (mobile)
if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
  return `http://${currentHost}:4000/api`;
}
```

### Troubleshooting

#### ปัญหา: API ไม่เชื่อมต่อได้
**แก้ไข:**
1. ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `.env.local`
2. ตรวจสอบ backend server ทำงานอยู่หรือไม่
3. ตรวจสอบ CORS configuration ใน backend

#### ปัญหา: Mobile ไม่เชื่อมต่อได้  
**แก้ไข:**
1. ตรวจสอบว่าอยู่ใน WiFi network เดียวกัน
2. อัปเดต `CORS_ORIGIN` ให้รวม mobile IP
3. ใช้ IP address แทน localhost ใน `NEXT_PUBLIC_API_URL`

#### ปัญหา: Environment variables ไม่ทำงาน
**แก้ไข:**
1. ตรวจสอบชื่อไฟล์ `.env.local` (ไม่ใช่ `.env`)
2. Restart development server
3. ตรวจสอบ syntax ใน env file (ไม่มี spaces รอบ =)

### Best Practices

#### 1. Environment Files
```bash
# Development
.env.local          # Local development settings
.env.development    # Development environment  
.env.staging        # Staging environment
.env.production     # Production environment
```

#### 2. Security
- ไม่ commit `.env.local` ใน git
- ใช้ `.env.example` สำหรับ template
- Validate environment variables ตอน startup

#### 3. Documentation
- Document ทุก environment variable
- ให้ example values
- อธิบาย purpose ของแต่ละ variable

---

## สรุป

การแก้ไขนี้จะทำให้:
1. ✅ ไม่มี hardcoded IP addresses
2. ✅ ใช้ environment variables แทน
3. ✅ Central configuration management
4. ✅ รองรับ multiple environments
5. ✅ ง่ายต่อการ maintain และ deploy
6. ✅ Better security practices

ตอนนี้ระบบจะยืดหยุ่นและปลอดภัยมากขึ้น!