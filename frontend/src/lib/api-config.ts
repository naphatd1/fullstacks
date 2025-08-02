// API Configuration for Mobile and Desktop
export class ApiConfig {
  private static instance: ApiConfig;
  private baseUrl: string;
  private isInitialized = false;

  private constructor() {
    this.baseUrl = this.determineBaseUrl();
  }

  static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  private determineBaseUrl(): string {
    // Server-side rendering
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    }

    const currentHost = window.location.hostname;
    console.log('🔍 ApiConfig - Current host:', currentHost);

    // Use environment variable if available
    if (process.env.NEXT_PUBLIC_API_URL) {
      console.log('🔍 ApiConfig - Using env URL:', process.env.NEXT_PUBLIC_API_URL);
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // For mobile devices (IP address access), use current host
    if (this.isIPAddress(currentHost)) {
      return `http://${currentHost}:4000/api`;
    }

    // Default to localhost
    return 'http://localhost:4000/api';
  }

  private isIPAddress(host: string): boolean {
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    return ipRegex.test(host);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Get multiple URLs to try for mobile compatibility
  getApiUrls(): string[] {
    const urls: string[] = [this.baseUrl];

    if (typeof window !== 'undefined') {
      const currentHost = window.location.hostname;

      // Add localhost variants if not already included
      if (!this.baseUrl.includes('localhost')) {
        urls.push('http://localhost:4000/api');
        urls.push('http://127.0.0.1:4000/api');
      }

      // For mobile devices, try current host IP
      if (this.isIPAddress(currentHost)) {
        // Only use the current host IP for mobile
        urls.push(`http://${currentHost}:4000/api`);
      }
    }

    return Array.from(new Set(urls)); // Remove duplicates
  }

  // Test API connectivity
  async testConnectivity(): Promise<{ url: string; success: boolean; latency: number }[]> {
    const urls = this.getApiUrls();
    const results: { url: string; success: boolean; latency: number }[] = [];

    for (const url of urls) {
      const startTime = Date.now();
      try {
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        const latency = Date.now() - startTime;
        const success = response.ok;

        results.push({ url, success, latency });
        console.log(`🔍 ApiConfig - Test ${url}: ${success ? '✅' : '❌'} (${latency}ms)`);
      } catch (error) {
        const latency = Date.now() - startTime;
        results.push({ url, success: false, latency });
        console.log(`🔍 ApiConfig - Test ${url}: ❌ (${latency}ms) - ${error}`);
      }
    }

    return results;
  }

  // Update base URL based on connectivity test
  async optimizeConnection(): Promise<string> {
    if (this.isInitialized) {
      return this.baseUrl;
    }

    console.log('🔍 ApiConfig - Optimizing connection...');
    const results = await this.testConnectivity();
    
    // Find the fastest successful connection
    const successful = results
      .filter(r => r.success)
      .sort((a, b) => a.latency - b.latency);

    if (successful.length > 0) {
      this.baseUrl = successful[0].url;
      console.log(`🔍 ApiConfig - Optimized URL: ${this.baseUrl} (${successful[0].latency}ms)`);
    }

    this.isInitialized = true;
    return this.baseUrl;
  }

  // Reset configuration
  reset(): void {
    this.isInitialized = false;
    this.baseUrl = this.determineBaseUrl();
  }
}

// Export singleton instance
export const apiConfig = ApiConfig.getInstance();

// Utility functions
export const apiUtils = {
  // Get optimized API URL
  getApiUrl: async (): Promise<string> => {
    return await apiConfig.optimizeConnection();
  },

  // Get base URL without optimization
  getBaseUrl: (): string => {
    return apiConfig.getBaseUrl();
  },

  // Test if API is reachable
  isApiReachable: async (url?: string): Promise<boolean> => {
    const testUrl = url || apiConfig.getBaseUrl();
    try {
      const response = await fetch(`${testUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Get device type
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  },

  // Check if on mobile network
  isMobileNetwork: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const currentHost = window.location.hostname;
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    return ipRegex.test(currentHost);
  }
};