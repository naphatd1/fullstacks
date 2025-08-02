export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string;
    email: string;
  };
  files?: FileUpload[];
}

export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  type: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  url?: string;
  thumbnail?: string;
  createdAt: string;
  post?: {
    id: string;
    title: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  responseTime?: string;
  environment: string;
  version?: string;
}