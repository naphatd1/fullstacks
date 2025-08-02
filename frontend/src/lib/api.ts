import {
  sanitizeInput,
  validateInput,
  securityHeaders,
  csrfToken,
} from "./security";
import { authStorage, authUtils } from "./auth-storage";
import { envConfig } from "./env-config";

// Get API URL from environment configuration
const API_URL = envConfig.getApiUrl();
console.log("🌐 API_URL initialized:", API_URL);

// Custom fetch wrapper with security headers and interceptors
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.defaultHeaders = { ...securityHeaders };
    this.timeout = timeout;
  }

  private async request(
    endpoint: string,
    options: RequestInit & { _retry?: boolean } = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;

    // Add auth token and security headers
    const headers = new Headers(options.headers);

    // Add only essential headers
    if (!headers.has("Content-Type") && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token
    const token = authStorage.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Add CSRF token for state-changing requests
    const method = options.method?.toLowerCase() || "get";
    if (["post", "put", "patch", "delete"].includes(method)) {
      const csrf = csrfToken.get();
      if (csrf) {
        headers.set("X-CSRF-Token", csrf);
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: "cors",
        credentials: "omit", // Changed from 'include' to fix mobile issues
      });

      clearTimeout(timeoutId);

      // Handle 401 errors with token refresh
      if (response.status === 401 && !options._retry) {
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...this.defaultHeaders,
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshResponse.ok) {
              const { access_token, refresh_token } =
                await refreshResponse.json();

              authStorage.setTokens({ access_token, refresh_token });

              // Retry original request
              return this.request(endpoint, { ...options, _retry: true });
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // Refresh failed, logout user
        authUtils.logout();
      }

      // Handle non-ok responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        console.error("API Error:", {
          url,
          method: options.method || "GET",
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });

        // Create a custom error with response information
        const error = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      console.error("Network Error:", {
        url,
        method: options.method || "GET",
        message: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }

  async get(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await this.request(endpoint, {
        ...options,
        method: "GET",
      });
      const data = await response.json();
      return { data, status: response.status, statusText: response.statusText };
    } catch (error) {
      console.error("GET request failed:", error);
      throw error;
    }
  }

  async post(endpoint: string, data?: any, options: RequestInit = {}) {
    try {
      const body = data instanceof FormData ? data : JSON.stringify(data);
      const defaultHeaders: Record<string, string> =
        data instanceof FormData ? {} : { "Content-Type": "application/json" };

      const combinedHeaders = {
        ...defaultHeaders,
        ...((options.headers as Record<string, string>) || {}),
      };

      const response = await this.request(endpoint, {
        ...options,
        method: "POST",
        body,
        headers: combinedHeaders,
      });

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error("POST request failed:", error);
      throw error;
    }
  }

  async patch(endpoint: string, data?: any, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json", ...options.headers },
    });

    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
    };
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
    };
  }
}

// Create API instance
export const api = new ApiClient(API_URL);

// Secure Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }) => {
    // Validate and sanitize inputs
    const emailValidation = validateInput.email(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    const passwordValidation = validateInput.password(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    const sanitizedData = {
      email: sanitizeInput.email(data.email),
      password: data.password, // Don't sanitize password, just validate
      name: data.name ? sanitizeInput.text(data.name) : undefined,
      role: data.role ? sanitizeInput.text(data.role) : undefined,
    };

    // Add retry logic for rate limiting
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Register attempt ${attempt}/3`);
        return await api.post("/auth/register", sanitizedData);
      } catch (error: any) {
        lastError = error;

        // If rate limited, wait and retry
        if (
          error.message?.includes("429") ||
          error.message?.includes("Too Many Requests")
        ) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // For other errors, don't retry
        throw error;
      }
    }

    throw lastError;
  },

  login: (data: { email: string; password: string }) => {
    // Validate and sanitize inputs
    const emailValidation = validateInput.email(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    const passwordValidation = validateInput.password(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    const sanitizedData = {
      email: sanitizeInput.email(data.email),
      password: data.password, // Don't sanitize password, just validate
    };

    return api.post("/auth/login", sanitizedData);
  },

  logout: async () => {
    try {
      const token = authStorage.getAccessToken();
      console.log("🔄 API logout called with token:", !!token);

      if (token) {
        const response = await api.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("✅ API logout successful");
        return response;
      } else {
        console.log("⚠️ No token found for logout, skipping API call");
        return { data: { message: "No token to logout" } };
      }
    } catch (error) {
      console.error("❌ API logout failed:", error);
      // Don't throw error, just log it since local logout is more important
      return {
        data: { message: "API logout failed but local logout will proceed" },
      };
    }
  },

  getProfile: () => api.get("/auth/profile"),
  
  updateProfile: (data: { name?: string; email?: string }) => 
    api.patch("/auth/profile", data),
  
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post("/auth/upload-profile-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.patch("/auth/change-password", data),

  refreshToken: (refreshToken: string) => {
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new Error("Invalid refresh token");
    }
    return api.post("/auth/refresh", { refresh_token: refreshToken });
  },
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
};

// Posts API with fallback
export const postsAPI = {
  getAll: async () => {
    try {
      return await api.get("/posts");
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.getAll();
    }
  },
  getMyPosts: async () => {
    try {
      return await api.get("/posts/my-posts");
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.getMyPosts();
    }
  },
  getById: async (id: string) => {
    try {
      return await api.get(`/posts/${id}`);
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.getById(id);
    }
  },
  create: async (data: {
    title: string;
    content?: string;
    published?: boolean;
  }) => {
    try {
      return await api.post("/posts", data);
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.create(data);
    }
  },
  update: async (id: string, data: any) => {
    try {
      return await api.patch(`/posts/${id}`, data);
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.update(id, data);
    }
  },
  delete: async (id: string) => {
    try {
      return await api.delete(`/posts/${id}`);
    } catch (error) {
      console.warn("Posts API failed, using fallback");
      const { fallbackPosts } = await import("./api-fallback");
      return await fallbackPosts.delete(id);
    }
  },
};

// Files API with fallback
export const filesAPI = {
  uploadImage: async (formData: FormData) => {
    try {
      return await api.post("/upload/images/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.uploadImage(formData);
    }
  },

  uploadDocument: async (formData: FormData) => {
    try {
      return await api.post("/upload/documents/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.uploadDocument(formData);
    }
  },

  getMyImages: async () => {
    try {
      return await api.get("/upload/images/my-images");
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.getMyImages();
    }
  },

  getMyDocuments: async () => {
    try {
      return await api.get("/upload/documents/my-documents");
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.getMyDocuments();
    }
  },

  deleteFile: async (fileId: string, type: "images" | "documents") => {
    try {
      return await api.delete(`/upload/${type}/${fileId}`);
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.deleteFile(fileId);
    }
  },

  getFileInfo: async (fileId: string) => {
    try {
      return await api.get(`/files/info/${fileId}`);
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return {
        data: {
          id: fileId,
          message: "File info not available in fallback mode",
        },
      };
    }
  },

  listFiles: async () => {
    try {
      return await api.get("/files/list");
    } catch (error) {
      console.warn("Files API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.listFiles();
    }
  },
};

// Health API with fallback
export const healthAPI = {
  basic: async () => {
    try {
      return await api.get("/health");
    } catch (error) {
      console.warn("Health API failed, using fallback");
      const { fallbackHealth } = await import("./api-fallback");
      return await fallbackHealth.basic();
    }
  },
  detailed: async () => {
    try {
      return await api.get("/health/detailed");
    } catch (error) {
      console.warn("Health API failed, using fallback");
      const { fallbackHealth } = await import("./api-fallback");
      return await fallbackHealth.detailed();
    }
  },
  errors: async () => {
    try {
      return await api.get("/health/errors");
    } catch (error) {
      console.warn("Health API failed, using fallback");
      return {
        data: {
          errors: [],
          message: "Error logs not available in fallback mode",
        },
      };
    }
  },
};

// Public API (no authentication required)
export const publicAPI = {
  getPublicImages: async () => {
    try {
      // Try to get public images from backend (if available)
      const response = await fetch(`${API_URL}/public/images`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { data };
      }

      throw new Error("Public API not available");
    } catch (error) {
      console.warn("Public API failed, using fallback");
      const { fallbackFiles } = await import("./api-fallback");
      return await fallbackFiles.getPublicImages();
    }
  },
};
