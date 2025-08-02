# 🔧 API Troubleshooting Guide

## ❌ ปัญหา: Register ไม่ได้ผ่าน URL

### 🎯 สาเหตุและการแก้ไข

#### 1. **URL ผิด** ❌
```
ผิด: http://YOUR_SERVER_IP:4000/auth/register
ถูก: http://YOUR_SERVER_IP:4000/api/auth/register
```

**สาเหตุ**: ขาดเส้นทางฐาน `/api`

#### 2. **รหัสผ่านไม่ผ่าน Validation** ❌
```json
{
  "password": "password123"  // ❌ ไม่มีพิมพ์ใหญ่และอักขระพิเศษ
}
```

**ข้อกำหนดรหัสผ่าน:**
- ✅ ตัวพิมพ์เล็ก (a-z)
- ✅ ตัวพิมพ์ใหญ่ (A-Z)  
- ✅ ตัวเลข (0-9)
- ✅ อักขระพิเศษ (@$!%*?&)

**รหัสผ่านที่ถูกต้อง:**
```json
{
  "password": "Password123@"  // ✅ ผ่านทุกเงื่อนไข
}
```

#### 3. **JSON Format ผิด** ❌
```bash
# ❌ อักขระพิเศษใน JSON ทำให้ parsing ผิด
curl -d '{
  "password": "Password123!"  # ! อาจทำให้ bash interpret ผิด
}'

# ✅ ใช้อักขระที่ปลอดภัย
curl -d '{"password": "Password123@"}'
```

## ✅ วิธีใช้งานที่ถูกต้อง

### 📝 Registration API

#### URL Endpoint
```
POST http://YOUR_SERVER_IP:4000/api/auth/register
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "Password123@",
  "name": "Full Name"
}
```

#### cURL Example
```bash
curl -X POST http://YOUR_SERVER_IP:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123@", "name": "Full Name"}'
```

#### JavaScript/Fetch Example
```javascript
const response = await fetch('http://YOUR_SERVER_IP:4000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123@',
    name: 'Full Name'
  })
});

const data = await response.json();
console.log(data);
```

#### Postman Example
```
Method: POST
URL: http://YOUR_SERVER_IP:4000/api/auth/register
Headers: 
  Content-Type: application/json
Body (raw):
{
  "email": "user@example.com",
  "password": "Password123@", 
  "name": "Full Name"
}
```

### 🔐 Login API

#### URL Endpoint
```
POST http://YOUR_SERVER_IP:4000/api/auth/login
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "Password123@"
}
```

#### cURL Example
```bash
curl -X POST http://YOUR_SERVER_IP:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123@"}'
```

## 📊 API Base URLs

### 🌐 Production Server
```
Base URL: http://YOUR_SERVER_IP:4000/api
Health Check: http://YOUR_SERVER_IP:4000/api/health
API Docs: http://YOUR_SERVER_IP:4000/api/docs
```

### 🏠 Local Development
```
Base URL: http://localhost:4000/api
Health Check: http://localhost:4000/api/health
API Docs: http://localhost:4000/api/docs
```

## 🔍 Common API Testing

### 1. Health Check
```bash
curl http://YOUR_SERVER_IP:4000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-02T15:36:51.180Z",
  "uptime": 1043.139069679
}
```

### 2. API Documentation
เปิดใน browser:
```
http://YOUR_SERVER_IP:4000/api/docs
```

### 3. Test Registration
```bash
curl -X POST http://YOUR_SERVER_IP:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123@", "name": "Test User"}'
```

**Expected Success Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "id": "cmduf1wr00000l70ih5g13b4m",
    "email": "test@example.com",
    "name": "Test User",
    "role": "USER"
  }
}
```

### 4. Test Login
```bash
curl -X POST http://YOUR_SERVER_IP:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123@"}'
```

### 5. Test Protected Route
```bash
# Get access token from login/register response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://YOUR_SERVER_IP:4000/api/auth/profile
```

## 🚨 Error Responses

### 400 Bad Request - Invalid Data
```json
{
  "statusCode": 400,
  "timestamp": "2025-08-02T15:37:08.279Z",
  "path": "/api/auth/register",
  "error": "ข้อมูลไม่ถูกต้อง",
  "message": ["รหัสผ่านต้องประกอบด้วย..."],
  "success": false
}
```

### 409 Conflict - Email Already Exists
```json
{
  "statusCode": 409,
  "timestamp": "2025-08-02T15:37:08.279Z", 
  "path": "/api/auth/register",
  "error": "อีเมลนี้ถูกใช้งานแล้ว",
  "success": false
}
```

### 401 Unauthorized - Invalid Credentials
```json
{
  "statusCode": 401,
  "timestamp": "2025-08-02T15:37:08.279Z",
  "path": "/api/auth/login", 
  "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "success": false
}
```

## 🛠️ Debugging Tips

### 1. Check Server Status
```bash
curl -I http://YOUR_SERVER_IP:4000/api/health
```

### 2. Validate JSON
```bash
# ใช้ jq ตรวจสอบ JSON format
echo '{"email": "test@example.com"}' | jq .
```

### 3. Check Request Headers
```bash
curl -v http://YOUR_SERVER_IP:4000/api/health
```

### 4. Test with Different Tools
- **cURL**: Command line testing
- **Postman**: GUI testing with collections
- **Browser Dev Tools**: Network tab inspection
- **HTTPie**: `http POST :4000/api/auth/register email=test@example.com`

### 5. Check Logs
```bash
# On server
ssh ubuntu@YOUR_SERVER_IP
cd /opt/fullstack/backend
docker-compose logs -f
```

## 📱 Frontend Integration

### React/Next.js Example
```javascript
// lib/api.js
const API_BASE_URL = 'http://YOUR_SERVER_IP:4000/api';

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Usage
const handleRegister = async (formData) => {
  try {
    const result = await registerUser({
      email: formData.email,
      password: formData.password,
      name: formData.name
    });
    
    // Store tokens
    localStorage.setItem('accessToken', result.access_token);
    localStorage.setItem('refreshToken', result.refresh_token);
    
    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

## ✅ Quick Fix Summary

1. **URL**: ใช้ `/api/auth/register` ไม่ใช่ `/auth/register`
2. **Password**: ต้องมีพิมพ์ใหญ่, เล็ก, ตัวเลข, อักขระพิเศษ
3. **JSON**: ใช้ double quotes และ escape characters ถูกต้อง  
4. **Headers**: ใส่ `Content-Type: application/json`
5. **Method**: ใช้ POST method

ตอนนี้ API registration ทำงานได้แล้ว! 🎉