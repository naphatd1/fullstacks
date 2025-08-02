// Fallback API for when backend is not available
import toast from 'react-hot-toast';

const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'ADMIN' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'password123',
    name: 'Regular User',
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_POSTS = [
  {
    id: '1',
    title: 'Welcome to the Platform',
    content: 'This is your first post. You can edit or delete it anytime.',
    published: true,
    authorId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: MOCK_USERS[0],
  },
  {
    id: '2',
    title: 'Getting Started Guide',
    content: 'Here are some tips to get you started with the platform.',
    published: false,
    authorId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: MOCK_USERS[1],
  },
];

const MOCK_FILES = [
  {
    id: '1',
    filename: 'nature-landscape.jpg',
    originalName: 'Beautiful Mountain Landscape',
    mimetype: 'image/jpeg',
    size: 1024000,
    path: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    filename: 'city-skyline.jpg',
    originalName: 'Modern City Architecture',
    mimetype: 'image/jpeg',
    size: 1536000,
    path: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    filename: 'ocean-waves.jpg',
    originalName: 'Serene Ocean Waves',
    mimetype: 'image/jpeg',
    size: 1200000,
    path: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '2',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: '4',
    filename: 'urban-lights.jpg',
    originalName: 'Urban City Lights',
    mimetype: 'image/jpeg',
    size: 1800000,
    path: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    id: '5',
    filename: 'forest-path.jpg',
    originalName: 'Ancient Forest Path',
    mimetype: 'image/jpeg',
    size: 1400000,
    path: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '2',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
  {
    id: '6',
    filename: 'desert-sunset.jpg',
    originalName: 'Desert Sunset Glory',
    mimetype: 'image/jpeg',
    size: 1600000,
    path: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
  },
  {
    id: '7',
    filename: 'cosmic-night.jpg',
    originalName: 'Starry Night Sky',
    mimetype: 'image/jpeg',
    size: 1300000,
    path: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '2',
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
  },
  {
    id: '8',
    filename: 'tropical-beach.jpg',
    originalName: 'Tropical Paradise Beach',
    mimetype: 'image/jpeg',
    size: 1450000,
    path: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
  },
  {
    id: '9',
    filename: 'winter-wonderland.jpg',
    originalName: 'Winter Wonderland',
    mimetype: 'image/jpeg',
    size: 1700000,
    path: 'https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '2',
    createdAt: new Date(Date.now() - 777600000).toISOString(), // 9 days ago
  },
  {
    id: '10',
    filename: 'golden-fields.jpg',
    originalName: 'Golden Wheat Fields',
    mimetype: 'image/jpeg',
    size: 1250000,
    path: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&crop=entropy&auto=format',
    uploadedBy: '1',
    createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
  },
  {
    id: '11',
    filename: 'document.pdf',
    originalName: 'document.pdf',
    mimetype: 'application/pdf',
    size: 2048000,
    path: '/uploads/documents/document.pdf',
    uploadedBy: '2',
    createdAt: new Date().toISOString(),
  },
];

// Check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout for logout
    
    // Use multiple URLs to try for backend health check
    const urls = [
      process.env.NEXT_PUBLIC_API_URL && `${process.env.NEXT_PUBLIC_API_URL}/health`,
      'http://localhost:4000/api/health',
      'http://127.0.0.1:4000/api/health'
    ].filter(Boolean) as string[];
    
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        if (response.ok) {
          clearTimeout(timeoutId);
          return true;
        }
      } catch (urlError) {
        continue; // Try next URL
      }
    }
    
    clearTimeout(timeoutId);
    return false;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

// Fallback authentication
export const fallbackAuth = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    
    return {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      expires_in: 3600, // 1 hour in seconds
      user: userWithoutPassword,
    };
  },

  register: async (email: string, password: string, name?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: String(MOCK_USERS.length + 1),
      email,
      password,
      name: name || 'New User',
      role: 'USER' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
      access_token: 'mock-access-token-' + Date.now(),
      refresh_token: 'mock-refresh-token-' + Date.now(),
      expires_in: 3600, // 1 hour in seconds
      user: userWithoutPassword,
    };
  },

  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const { password: _, ...userWithoutPassword } = MOCK_USERS[0];
    return { data: userWithoutPassword };
  },
};

// Fallback posts API
export const fallbackPosts = {
  getMyPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: MOCK_POSTS };
  },

  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: MOCK_POSTS.filter(p => p.published) };
  },

  getById: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const post = MOCK_POSTS.find(p => p.id === id);
    if (!post) {
      throw new Error('Post not found');
    }
    return { data: post };
  },

  create: async (data: { title: string; content?: string; published?: boolean }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newPost = {
      id: String(MOCK_POSTS.length + 1),
      ...data,
      content: data.content || '',
      published: data.published || false,
      authorId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: MOCK_USERS[0],
    };
    MOCK_POSTS.push(newPost);
    return { data: newPost };
  },

  update: async (id: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const postIndex = MOCK_POSTS.findIndex(p => p.id === id);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    MOCK_POSTS[postIndex] = {
      ...MOCK_POSTS[postIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { data: MOCK_POSTS[postIndex] };
  },

  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const postIndex = MOCK_POSTS.findIndex(p => p.id === id);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }
    MOCK_POSTS.splice(postIndex, 1);
    return { data: { message: 'Post deleted successfully' } };
  },
};

// Fallback files API
export const fallbackFiles = {
  listFiles: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: MOCK_FILES };
  },

  getMyImages: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: MOCK_FILES.filter(f => f.mimetype.startsWith('image/')) };
  },

  getPublicImages: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return all images for public carousel
    return { data: MOCK_FILES.filter(f => f.mimetype.startsWith('image/')) };
  },

  getMyDocuments: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: MOCK_FILES.filter(f => !f.mimetype.startsWith('image/')) };
  },

  uploadImage: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const newFile = {
      id: String(MOCK_FILES.length + 1),
      filename: `uploaded-${Date.now()}-${file.name}`,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      path: `/uploads/images/uploaded-${Date.now()}-${file.name}`,
      uploadedBy: '1',
      createdAt: new Date().toISOString(),
    };

    MOCK_FILES.push(newFile);
    return { data: newFile };
  },

  uploadDocument: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const newFile = {
      id: String(MOCK_FILES.length + 1),
      filename: `uploaded-${Date.now()}-${file.name}`,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      path: `/uploads/documents/uploaded-${Date.now()}-${file.name}`,
      uploadedBy: '1',
      createdAt: new Date().toISOString(),
    };

    MOCK_FILES.push(newFile);
    return { data: newFile };
  },

  deleteFile: async (fileId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const fileIndex = MOCK_FILES.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    MOCK_FILES.splice(fileIndex, 1);
    return { data: { message: 'File deleted successfully' } };
  },
};

// Fallback health API
export const fallbackHealth = {
  basic: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: {
        status: 'ok',
        message: 'Fallback mode - Backend not available',
        timestamp: new Date().toISOString(),
        uptime: '0s (fallback)',
        version: '1.0.0-fallback',
      }
    };
  },

  detailed: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        status: 'ok',
        message: 'Fallback mode - Backend not available',
        timestamp: new Date().toISOString(),
        uptime: '0s (fallback)',
        version: '1.0.0-fallback',
        database: { status: 'disconnected', message: 'Backend not available' },
        memory: { used: 0, total: 0, percentage: 0 },
        disk: { used: 0, total: 0, percentage: 0 },
      }
    };
  },
};

// Show fallback mode notification (only once per session)
let fallbackNotificationShown = false;

export const showFallbackNotification = () => {
  if (!fallbackNotificationShown) {
    fallbackNotificationShown = true;
    toast.error(
      'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กำลังใช้โหมดทดสอบ',
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  }
};