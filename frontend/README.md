# NestJS Auth Frontend

A modern Next.js frontend application that connects to the NestJS Authentication API.

## Features

- 🔐 **Authentication System**: Login, Register, Logout with JWT tokens
- 👥 **Role-based Access**: USER and ADMIN roles with different permissions
- 📊 **Dashboard**: User dashboard and Admin dashboard
- 📝 **Post Management**: Create, edit, delete posts with rich editor
- 📁 **File Upload**: Image and document upload with progress tracking
- 🎨 **Modern UI**: Built with Tailwind CSS and Lucide icons
- 📱 **Responsive**: Mobile-first responsive design
- ⚡ **Performance**: Optimized with React Query for data fetching

## Tech Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5.8.3
- **UI Framework**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.14
- **State Management**: TanStack React Query 5.83.0
- **Forms**: React Hook Form 7.61.1 with Yup 1.6.1 validation
- **HTTP Client**: Native Fetch API with custom wrapper and interceptors
- **Authentication**: Session-based storage (auto-logout when browser closes)
- **Icons**: Lucide React 0.526.0
- **Notifications**: React Hot Toast 2.5.2

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- NestJS API running on http://localhost:4000

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

3. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # Admin pages
│   │   ├── posts/             # Post management
│   │   └── files/             # File management
│   ├── components/            # Reusable components
│   │   ├── Layout/            # Layout components
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utilities and API
│   │   └── api.ts             # API client and endpoints
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── tailwind.config.js         # Tailwind configuration
```

## API Integration

The frontend connects to the NestJS API with the following features:

### Authentication

- JWT token management with automatic refresh
- Secure cookie storage
- Automatic token refresh on API calls
- Role-based route protection

### API Endpoints

- **Auth**: `/auth/*` - Authentication endpoints
- **Users**: `/users/*` - User management (Admin)
- **Posts**: `/posts/*` - Post CRUD operations
- **Files**: `/upload/*` - File upload endpoints
- **Health**: `/health/*` - System health monitoring

## Features Overview

### 🔐 Authentication

- **Login/Register**: Secure authentication with validation
- **JWT Tokens**: Access and refresh token management
- **Auto Refresh**: Automatic token refresh on expiration
- **Role Detection**: Automatic role-based UI rendering

### 👤 User Dashboard

- **Overview**: Personal statistics and recent activity
- **Profile**: View and edit user profile
- **Posts**: Quick access to user's posts
- **Files**: File management interface

### 👨‍💼 Admin Dashboard

- **System Overview**: User count, post count, system health
- **User Management**: View, create, edit, delete users
- **System Health**: Real-time system monitoring
- **Analytics**: Usage statistics and trends

### 📝 Post Management

- **Create Posts**: Rich text editor with preview
- **Edit Posts**: Update existing posts
- **Draft/Publish**: Control post visibility
- **File Attachments**: Attach images and documents

### 📁 File Upload

- **Multiple Types**: Images, documents, videos, audio
- **Progress Tracking**: Real-time upload progress
- **Chunk Upload**: Large file support with resumable uploads
- **File Management**: View, download, delete files

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Optional: Analytics, monitoring, etc.
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Demo Accounts

The app includes demo accounts for testing:

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Run TypeScript compiler
```

### Code Style

- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting (if configured)
- **TypeScript**: Strict type checking enabled
- **Tailwind**: Utility-first CSS framework

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

1. Set production API URL in environment variables
2. Configure any additional environment variables
3. Ensure CORS is properly configured on the backend

### Deployment Platforms

- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative deployment platform
- **Docker**: Container deployment option

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
