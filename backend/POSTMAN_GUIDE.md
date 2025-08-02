# 📮 Postman Collection Guide

## 📋 Overview

This guide helps you set up and use the complete Postman collection for the Fullstack NestJS API. The collection includes **69 endpoints** across **13 modules** with automated token management and environment switching.

## 📁 Files Included

1. **`postman-collection.json`** - Complete API collection with all endpoints
2. **`postman-environments.json`** - Environment configurations for different servers
3. **`POSTMAN_GUIDE.md`** - This usage guide

## 🚀 Quick Setup

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button
3. Select **`postman-collection.json`**
4. Collection "Fullstack NestJS API Collection" will be imported

### Step 2: Import Environments

1. Click **Import** button again
2. Select **`postman-environments.json`**
3. Three environments will be imported:
   - 🏠 **Local Development** (localhost:4000)
   - 🚀 **Production Server** (YOUR_SERVER_IP:4000)
   - 🧪 **Staging Server** (YOUR_STAGING_IP:4000)

### Step 3: Select Environment

1. Click environment dropdown (top-right)
2. Select "🏠 Local Development" for local testing
3. Update `YOUR_SERVER_IP` in Production environment with your actual server IP

## 🔐 Authentication Workflow

### 1. Register New User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "Test User",
  "role": "USER"
}
```

### 2. Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**✨ Auto-Magic:** Login automatically saves `access_token`, `refresh_token`, `user_id`, and `user_role` to environment variables!

### 3. Use Protected Endpoints

All protected endpoints automatically use `{{access_token}}` from environment variables. No manual token copying needed!

## 📚 Collection Structure

### 🔐 Authentication (11 endpoints)
- Register, Login, Profile management
- Token refresh, Logout
- Admin operations

### 👥 Users Management (7 endpoints)
- CRUD operations for users
- Admin-only endpoints for user management

### 📝 Posts Management (6 endpoints)
- Create, read, update, delete posts
- Get user's own posts

### 📁 Image Upload (5 endpoints)
- Single and multiple image uploads
- Get and delete images
- Automatic thumbnail generation

### 📄 Document Upload (5 endpoints)
- Single and multiple document uploads
- Support for various file formats

### 🔄 Chunked Upload (5 endpoints)
- Large file upload support
- Progress tracking and cancellation

### 📂 File Management (11 endpoints)
- File serving and download
- Pagination and filtering
- File statistics and details

### 🏥 Health Checks (4 endpoints)
- Basic and detailed health status
- Error statistics
- System monitoring

### 📊 Monitoring (8 endpoints)
- System, database, storage metrics
- API usage analytics
- Performance monitoring

### 📋 Error Messages (4 endpoints)
- Thai language error messages
- Validation and UI errors

### 🎨 Frontend Helpers (3 endpoints)
- Form configurations
- UI text and translations

## 🎯 Testing Workflows

### Complete User Journey

1. **Register** → Auto-saves tokens
2. **Create Post** → Auto-saves `post_id`
3. **Upload Image** → Auto-saves `file_id`
4. **Associate Image with Post** → Uses saved IDs
5. **Get My Posts** → See created content
6. **Get My Images** → See uploaded files

### Admin Testing

1. **Login as Admin** → Set `user_role` to "ADMIN"
2. **Create Admin User** → Test admin creation
3. **Get All Users** → Admin-only endpoint
4. **Manage Users** → Activate/deactivate

### File Upload Testing

1. **Single Image Upload** → Basic file upload
2. **Multiple Image Upload** → Batch operations
3. **Document Upload** → Different file types
4. **Chunked Upload** → Large files
5. **File Management** → List, download, delete

## 🔧 Environment Variables

### Automatic Variables (Set by Scripts)
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token
- `user_id` - Current user ID
- `user_role` - User role (USER/ADMIN)
- `post_id` - Last created post ID
- `file_id` - Last uploaded file ID
- `chunk_file_id` - Chunked upload file ID
- `last_created_id` - Last created resource ID

### Manual Variables (Update as needed)
- `baseUrl` - API base URL
- `webUrl` - Frontend URL
- `filename` - Sample filename for file serving

## 🚨 Rate Limiting

The collection respects API rate limits:

| Endpoint | Rate Limit |
|----------|------------|
| Register | 5/minute |
| Login | 10/minute |
| Token Refresh | 5/minute |
| Image Upload Single | 10/minute |
| Image Upload Multiple | 5/minute |
| Document Upload Single | 5/minute |
| Document Upload Multiple | 3/minute |
| Chunk Initiate | 10/minute |
| Chunk Upload | 100/minute |

## 🎨 Environment Switching

### Local Development (Default)
```
baseUrl: http://localhost:4000/api
webUrl: http://localhost:3000
```

### Production Server
```
baseUrl: http://YOUR_SERVER_IP:4000/api
webUrl: http://YOUR_SERVER_IP:3000
```

**📝 Note:** Replace `YOUR_SERVER_IP` with your actual server IP address.

### Staging Server
```
baseUrl: http://YOUR_STAGING_IP:4000/api
webUrl: http://YOUR_STAGING_IP:3000
```

## 🔍 Testing Features

### Global Scripts

**Pre-request Script:**
- Auto-refresh token logic (can be enhanced)
- Environment validation

**Test Script:**
- Automatic error detection (401, 429)
- Performance monitoring (response time logging)
- Common response data extraction

### Request-Specific Scripts

**Login/Register:**
- Auto-save authentication tokens
- Extract user information

**Create Operations:**
- Auto-save created resource IDs
- Enable easy testing of related endpoints

## 📊 Monitoring & Debugging

### Response Time Tracking
All requests automatically log response times to console for performance monitoring.

### Error Handling
- **401 Unauthorized:** Token expired notification
- **429 Rate Limited:** Rate limit exceeded warning
- **General Errors:** Helpful error messages

### Success Indicators
- **Green Status:** Successful requests
- **Auto-saved Variables:** Check environment tab for updated values

## 🎯 Pro Tips

### 1. **Environment Organization**
- Use Local for development
- Use Production for live testing
- Use Staging for pre-production validation

### 2. **Token Management**
- Login once per session - tokens auto-save
- Use refresh token endpoint when access token expires
- Clear tokens when switching users

### 3. **File Upload Testing**
- Start with small files for initial testing
- Use chunked upload for files > 50MB
- Check file statistics endpoint for upload verification

### 4. **Workflow Testing**
- Follow the user journey workflows
- Test both user and admin permissions
- Verify rate limiting behavior

### 5. **Error Testing**
- Test with invalid tokens
- Try admin endpoints as regular user
- Test file uploads with invalid formats

## 🐛 Troubleshooting

### Common Issues

**❌ 401 Unauthorized**
- Solution: Login again or refresh token
- Check: Token not expired, correct permissions

**❌ 429 Rate Limited**
- Solution: Wait before retrying
- Check: Review rate limits table above

**❌ File Upload Fails**
- Solution: Check file size and format
- Check: Use correct form-data format

**❌ Environment Variables Not Working**
- Solution: Check environment selection
- Check: Variables are properly set after login

## 📚 Additional Resources

- **Swagger Documentation:** `http://localhost:4000/api/docs`
- **API Endpoints Guide:** `API_ENDPOINTS.md`
- **Health Check:** `http://localhost:4000/api/health`

## 🎉 Success Checklist

- [ ] Collection imported successfully
- [ ] Environments imported and configured
- [ ] Successful login with token auto-save
- [ ] Protected endpoints working with saved tokens
- [ ] File uploads working correctly
- [ ] Rate limiting respected
- [ ] Environment switching functional

---

**Happy Testing!** 🚀

*Total: 69 endpoints across 13 modules with full automation*