// Environment Configuration Helper
export class EnvConfig {
  private static instance: EnvConfig;
  
  static getInstance(): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig();
    }
    return EnvConfig.instance;
  }

  // Get API URL from environment or fallback to localhost
  getApiUrl(): string {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (envUrl) {
      console.log('🔧 Using API URL from environment:', envUrl);
      return envUrl;
    }
    
    const fallbackUrl = 'http://localhost:4000/api';
    console.log('🔧 Using fallback API URL:', fallbackUrl);
    return fallbackUrl;
  }

  // Get API base URL without /api suffix
  getApiBaseUrl(): string {
    return this.getApiUrl().replace('/api', '');
  }

  // Get health check URL
  getHealthUrl(): string {
    return `${this.getApiUrl()}/health`;
  }

  // Get current host for mobile detection
  getCurrentHost(): string {
    if (typeof window === 'undefined') return 'localhost';
    return window.location.hostname;
  }

  // Check if running on mobile network (IP address)
  isMobileNetwork(): boolean {
    const host = this.getCurrentHost();
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
  }

  // Get URLs to try for API calls (prioritized)
  getApiUrls(): string[] {
    const urls: string[] = [];
    
    // Primary URL from environment
    const envUrl = this.getApiUrl();
    urls.push(envUrl);
    
    // If on mobile network, try current host
    if (this.isMobileNetwork()) {
      const currentHost = this.getCurrentHost();
      const mobileUrl = `http://${currentHost}:4000/api`;
      if (!urls.includes(mobileUrl)) {
        urls.push(mobileUrl);
      }
    }
    
    // Always include localhost as fallback
    const localhostUrls = [
      'http://localhost:4000/api',
      'http://127.0.0.1:4000/api'
    ];
    
    localhostUrls.forEach(url => {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    });
    
    return urls;
  }

  // Get development mode flag
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  // Get production mode flag
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // Log current configuration
  logConfig(): void {
    if (this.isDevelopment()) {
      console.log('🔧 Environment Configuration:', {
        apiUrl: this.getApiUrl(),
        currentHost: this.getCurrentHost(),
        isMobileNetwork: this.isMobileNetwork(),
        availableUrls: this.getApiUrls(),
        environment: process.env.NODE_ENV,
      });
    }
  }
}

// Export singleton instance
export const envConfig = EnvConfig.getInstance();

// Export utility functions
export const getApiUrl = () => envConfig.getApiUrl();
export const getHealthUrl = () => envConfig.getHealthUrl();
export const getApiUrls = () => envConfig.getApiUrls();