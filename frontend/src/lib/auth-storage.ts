// Authentication storage utilities with session-based storage
// Tokens will be cleared when browser is closed

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user?: any;
}

class AuthStorage {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  constructor() {
    // Session storage automatically clears when browser/tab is closed
    // No need for manual event listeners that interfere with navigation
  }

  // Store tokens in local storage (persists across browser sessions)
  setTokens(tokens: { access_token: string; refresh_token: string; user?: any }) {
    if (typeof window === 'undefined') return;

    // Store tokens with timestamp for validation
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      timestamp: Date.now(),
    };

    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    localStorage.setItem('auth_timestamp', tokenData.timestamp.toString());
    
    if (tokens.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(tokens.user));
    }
  }

  // Get access token
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Get user data
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Update access token (for refresh)
  updateAccessToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // Check if user is authenticated and session is valid
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const token = this.getAccessToken();
      const user = this.getUser();
      const timestamp = localStorage.getItem('auth_timestamp');
      
      if (!token || !user || !timestamp) {
        console.log('🔍 AuthStorage - Missing auth data:', { 
          hasToken: !!token, 
          hasUser: !!user, 
          hasTimestamp: !!timestamp 
        });
        return false;
      }
      
      // Check if session is from the same browser session
      const authTime = parseInt(timestamp);
      const now = Date.now();
      
      // If more than 24 hours old, consider it invalid (safety check)
      if (now - authTime > 24 * 60 * 60 * 1000) {
        console.log('🔍 AuthStorage - Session expired (24h limit)');
        this.clearAll();
        return false;
      }
      
      // Additional validation - check if token looks valid
      if (token.length < 10 || !token.includes('.')) {
        console.log('🔍 AuthStorage - Invalid token format');
        this.clearAll();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔍 AuthStorage - isAuthenticated error:', error);
      this.clearAll();
      return false;
    }
  }

  // Clear all auth data
  clearAll() {
    if (typeof window === 'undefined') return;
    
    console.log('🗑️ AuthStorage.clearAll() called');
    
    // Clear localStorage (primary storage)
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_timestamp');
    
    // Also clear from sessionStorage as backup
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('auth_timestamp');
    
    // Clear any potential legacy keys
    const legacyKeys = [
      'authUser', 'authToken', 'token', 'userToken', 'user', 
      'csrf_token', 'refreshToken', 'accessToken'
    ];
    
    legacyKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    
    console.log('✅ All auth storage cleared');
  }

  // Clear only tokens (keep user data)
  clearTokens() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// Create singleton instance
export const authStorage = new AuthStorage();

// Export utility functions
export const authUtils = {
  login: (tokens: AuthTokens) => {
    authStorage.setTokens(tokens);
  },

  logout: () => {
    authStorage.clearAll();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  isLoggedIn: () => {
    return authStorage.isAuthenticated();
  },

  getAuthHeader: () => {
    const token = authStorage.getAccessToken();
    return token ? `Bearer ${token}` : null;
  },

  getCurrentUser: () => {
    return authStorage.getUser();
  }
};