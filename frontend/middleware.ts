import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get the origin from the request
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  
  // CORS headers for development - be permissive for mobile access
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Security headers (relaxed for development)
  if (process.env.NODE_ENV === 'development') {
    // More permissive CSP for development
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      "font-src 'self'",
      "connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 http://192.168.1.1:4000 http://192.168.0.1:4000 http://10.0.0.1:4000 ws://localhost:3000 ws://127.0.0.1:3000",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  } else {
    // Production security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' http://localhost:4000",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Rate limiting headers (informational)
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Window', '900'); // 15 minutes

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths including _next/* for CORS handling
     * but exclude some specific static assets
     */
    '/((?!favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};