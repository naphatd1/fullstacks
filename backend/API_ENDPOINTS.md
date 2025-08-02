# API Endpoints Documentation

## Base URL

```
http://localhost:4000/api
```

## Swagger Documentation

```
http://localhost:4000/api/docs
```

---

## 🔐 Authentication Endpoints

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "สมชาย ใจดี",
  "role": "USER" // optional: USER | ADMIN
}
```

**Response (Success):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "สมชาย ใจดี",
    "role": "USER"
  }
}
```

**Rate Limit:** 5 requests/minute

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Rate Limit:** 10 requests/minute

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### Update Profile

```http
PATCH /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "email": "newemail@example.com"
}
```

### Change Password

```http
PATCH /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Upload Profile Image

```http
POST /api/auth/upload-profile-image
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- image: <file> (max 5MB, formats: jpg, jpeg, png, gif)
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limit:** 5 requests/minute

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Create Admin (Admin Only)

```http
POST /api/auth/create-admin
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "name": "ผู้ดูแลระบบ"
}
```

### Logout All Users (Admin Only)

```http
POST /api/auth/logout-all
Authorization: Bearer <admin_access_token>
```

### Clear All Sessions (Development)

```http
POST /api/auth/clear-sessions
```

---

## 👥 Users Endpoints

### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin_access_token>
```

### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <access_token>
```

### Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "ผู้ใช้ใหม่",
  "role": "USER"
}
```

### Update User

```http
PATCH /api/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "email": "newemail@example.com",
  "role": "ADMIN",
  "isActive": true
}
```

### Delete User (Admin Only)

```http
DELETE /api/users/:id
Authorization: Bearer <admin_access_token>
```

### Deactivate User (Admin Only)

```http
PATCH /api/users/:id/deactivate
Authorization: Bearer <admin_access_token>
```

### Activate User (Admin Only)

```http
PATCH /api/users/:id/activate
Authorization: Bearer <admin_access_token>
```

---

## 📝 Posts Endpoints

### Get All Posts

```http
GET /api/posts
Authorization: Bearer <access_token>
```

### Get My Posts

```http
GET /api/posts/my-posts
Authorization: Bearer <access_token>
```

### Get Post by ID

```http
GET /api/posts/:id
Authorization: Bearer <access_token>
```

### Create Post

```http
POST /api/posts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "หัวข้อโพสต์",
  "content": "เนื้อหาโพสต์...",
  "published": true
}
```

### Update Post

```http
PATCH /api/posts/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "หัวข้อใหม่",
  "content": "เนื้อหาใหม่...",
  "published": false
}
```

### Delete Post

```http
DELETE /api/posts/:id
Authorization: Bearer <access_token>
```

---

## 📁 Image Upload Endpoints

### Upload Single Image

```http
POST /api/upload/images/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- image: <file>
- postId: "uuid-string" (optional)
```

**Rate Limit:** 10 requests/minute

### Upload Multiple Images

```http
POST /api/upload/images/multiple
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- images: <file[]> (max 10 files)
- postId: "uuid-string" (optional)
```

**Rate Limit:** 5 requests/minute

### Get My Images

```http
GET /api/upload/images/my-images
Authorization: Bearer <access_token>
```

### Get Images by Post

```http
GET /api/upload/images/post/:postId
Authorization: Bearer <access_token>
```

### Delete Image

```http
DELETE /api/upload/images/:fileId
Authorization: Bearer <access_token>
```

---

## 📄 Document Upload Endpoints

### Upload Single Document

```http
POST /api/upload/documents/single
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- document: <file>
- postId: "uuid-string" (optional)
```

**Rate Limit:** 5 requests/minute

### Upload Multiple Documents

```http
POST /api/upload/documents/multiple
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- documents: <file[]> (max 5 files)
- postId: "uuid-string" (optional)
```

**Rate Limit:** 3 requests/minute

### Get My Documents

```http
GET /api/upload/documents/my-documents
Authorization: Bearer <access_token>
```

### Get Documents by Post

```http
GET /api/upload/documents/post/:postId
Authorization: Bearer <access_token>
```

### Delete Document

```http
DELETE /api/upload/documents/:fileId
Authorization: Bearer <access_token>
```

---

## 🔄 Chunked Upload Endpoints

### Initiate Chunked Upload

```http
POST /api/upload/chunk/initiate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fileName": "largefile.mp4",
  "fileSize": 104857600,
  "fileType": "video/mp4",
  "chunkSize": 1048576,
  "postId": "uuid-string" (optional)
}
```

**Rate Limit:** 10 requests/minute

### Upload Chunk

```http
POST /api/upload/chunk/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- fileId: "uuid-string"
- chunkIndex: 0
- chunk: <file>
```

**Rate Limit:** 100 requests/minute

### Complete Chunked Upload

```http
POST /api/upload/chunk/complete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fileId": "uuid-string"
}
```

### Get Upload Progress

```http
GET /api/upload/chunk/progress/:fileId
Authorization: Bearer <access_token>
```

### Cancel Upload

```http
DELETE /api/upload/chunk/cancel/:fileId
Authorization: Bearer <access_token>
```

---

## 📂 File Serving & Management Endpoints

### Serve Files

```http
GET /files/serve/images/:filename
GET /files/serve/documents/:filename
GET /files/serve/videos/:filename
GET /files/serve/audio/:filename
GET /files/serve/thumbnails/:filename
```

### Download File

```http
GET /files/download/:fileId
Authorization: Bearer <access_token>
```

### Get File Information

```http
GET /files/info/:fileId
Authorization: Bearer <access_token>
```

### List Files

```http
GET /files/list
Authorization: Bearer <access_token>
```

### Get My Files (with pagination)

```http
GET /files/my-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `type`: IMAGE | DOCUMENT | VIDEO | AUDIO | OTHER
- `status`: UPLOADING | PROCESSING | COMPLETED | FAILED
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Get All Files (with pagination)

```http
GET /files/all-files?type=IMAGE&status=COMPLETED&page=1&limit=10
Authorization: Bearer <access_token>
```

### Get File Statistics

```http
GET /files/stats
Authorization: Bearer <access_token>
```

### Get File Details

```http
GET /files/:fileId/details
Authorization: Bearer <access_token>
```

---

## 🏥 Health Check Endpoints

### Basic Health Check

```http
GET /health
```

### Detailed Health Check

```http
GET /health/detailed
```

### Error Statistics

```http
GET /health/errors
```

---

## 📊 Monitoring Endpoints

### Monitoring Dashboard

```http
GET /api/monitoring/dashboard
Authorization: Bearer <access_token>
```

### System Metrics

```http
GET /api/monitoring/system
Authorization: Bearer <access_token>
```

### Database Metrics

```http
GET /api/monitoring/database
Authorization: Bearer <access_token>
```

### Storage Metrics

```http
GET /api/monitoring/storage
Authorization: Bearer <access_token>
```

### API Metrics

```http
GET /api/monitoring/api?hours=24
Authorization: Bearer <access_token>
```

### Health Check (Monitoring)

```http
GET /api/monitoring/health
Authorization: Bearer <access_token>
```

### Active Alerts

```http
GET /api/monitoring/alerts
Authorization: Bearer <access_token>
```

### Performance Metrics

```http
GET /api/monitoring/performance?period=1h
Authorization: Bearer <access_token>
```

---

## 📋 Error Messages Endpoints

### Get Authentication Error Messages

```http
GET /api/error-messages/auth
```

### Get Validation Error Messages

```http
GET /api/error-messages/validation
```

### Get UI Error Messages

```http
GET /api/error-messages/ui
```

### Get All Error Messages

```http
GET /api/error-messages/all
```

---

## 🎨 Frontend Helper Endpoints

### Get Specific Error Message

```http
GET /api/frontend/error-message?type=login&field=email&code=invalid
```

**Query Parameters:**
- `type`: login | register | validation
- `field`: email | password | name | general
- `code`: invalid | notFound | wrong | empty | etc.

### Get Form Configuration

```http
GET /api/frontend/form-config
```

### Get UI Text

```http
GET /api/frontend/ui-text
```

---

## 🔒 Authentication & Authorization

### JWT Authentication
For protected endpoints, include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control
- **USER**: Basic user permissions
- **ADMIN**: Full administrative permissions

### Permission Matrix

| Endpoint Category | USER | ADMIN |
|------------------|------|-------|
| Authentication | ✅ | ✅ |
| Own Profile/Posts | ✅ | ✅ |
| File Upload/Management | ✅ | ✅ |
| User Management | ❌ | ✅ |
| Create Admin | ❌ | ✅ |
| Monitoring | ✅ | ✅ |
| System Operations | ❌ | ✅ |

---

## 📊 HTTP Status Codes

### Success Codes
- `200`: OK - Request successful
- `201`: Created - Resource created successfully

### Error Codes
- `400`: Bad Request - ข้อมูลไม่ถูกต้อง
- `401`: Unauthorized - การยืนยันตัวตนไม่สำเร็จ
- `403`: Forbidden - ไม่มีสิทธิ์เข้าถึง
- `404`: Not Found - ไม่พบข้อมูลที่ต้องการ
- `409`: Conflict - ข้อมูลซ้ำซ้อน
- `429`: Too Many Requests - คำขอมากเกินไป
- `500`: Internal Server Error - เกิดข้อผิดพลาดของระบบ

---

## 🔧 Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| **Global** | 1000 requests per 15 minutes per IP |
| **Auth Register** | 5 requests per minute |
| **Auth Login** | 10 requests per minute |
| **Auth Refresh** | 5 requests per minute |
| **Image Upload Single** | 10 requests per minute |
| **Image Upload Multiple** | 5 requests per minute |
| **Document Upload Single** | 5 requests per minute |
| **Document Upload Multiple** | 3 requests per minute |
| **Chunk Upload Initiate** | 10 requests per minute |
| **Chunk Upload** | 100 requests per minute |

---

## 📁 File Upload Specifications

### Supported File Types

#### Images
- **Formats**: jpg, jpeg, png, gif
- **Max Size**: 5MB (profile images), 10MB (general images)
- **Processing**: Automatic thumbnail generation

#### Documents
- **Formats**: pdf, doc, docx, txt, csv, xlsx
- **Max Size**: 50MB
- **Processing**: Metadata extraction

#### Videos & Audio
- **Formats**: mp4, avi, mov, mp3, wav
- **Max Size**: 500MB
- **Processing**: Via chunked upload for large files

### Storage Locations
- **Images**: `/storage/uploads/images/`
- **Documents**: `/storage/uploads/documents/`
- **Videos**: `/storage/uploads/videos/`
- **Audio**: `/storage/uploads/audio/`
- **Thumbnails**: `/storage/uploads/thumbnails/`
- **Profiles**: `/uploads/profiles/`

---

## 📝 Password Requirements

รหัสผ่านต้องมีคุณสมบัติดังนี้:
- ความยาวอย่างน้อย 8 ตัวอักษร
- มีตัวอักษรพิมพ์เล็ก (a-z)
- มีตัวอักษรพิมพ์ใหญ่ (A-Z)
- มีตัวเลข (0-9)
- มีอักขระพิเศษ (@$!%*?&)

**ตัวอย่างรหัสผ่านที่ถูกต้อง:** `Password123!`

---

## 🌐 CORS Configuration

The API accepts requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173` (Vite default)
- Configuration via `CORS_ORIGIN` environment variable

---

## 🚀 Quick Start Examples

### 1. Login Flow

```javascript
// Login
const response = await fetch("http://localhost:4000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "Password123!",
  }),
});

const data = await response.json();

if (response.ok) {
  // Store tokens
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  localStorage.setItem("user", JSON.stringify(data.user));
} else {
  // Show error message
  console.error(data.message);
}
```

### 2. Protected API Call

```javascript
const token = localStorage.getItem("access_token");

const response = await fetch("http://localhost:4000/api/posts", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

### 3. File Upload

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('postId', 'optional-post-id');

const response = await fetch("http://localhost:4000/api/upload/images/single", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### 4. Error Handling

```javascript
if (!response.ok) {
  const errorData = await response.json();
  
  // Display Thai error message
  if (errorData.message) {
    showErrorMessage(errorData.message);
  }
  
  // Handle specific status codes
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

---

## 📞 Development Notes

### Environment Variables Required:
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_TOKEN_SECRET="your-refresh-secret"
SUPABASE_URL="https://xxx.supabase.co" (optional)
SUPABASE_SERVICE_ROLE_KEY="your-service-key" (optional)
```

### API Versioning:
- Current version: v1 (implicit)
- Base path: `/api`
- Future versions will use `/api/v2`, etc.

### Security Headers:
- CORS enabled with specific origins
- Helmet.js for security headers
- Rate limiting per endpoint
- JWT token validation
- Role-based access control

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา

---

**Total Endpoints: 69 routes across 13 controllers**

Last Updated: August 2025