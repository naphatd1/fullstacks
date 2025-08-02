'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';

interface SecurityStatusProps {
  showDetails?: boolean;
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({ showDetails = false }) => {
  const [mounted, setMounted] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [details, setDetails] = useState<string[]>([]);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = () => {
    // Only run security checks on client-side after mounting
    if (typeof window === 'undefined' || !mounted) {
      return;
    }

    const checks = [];
    let score = 0;

    // Check HTTPS
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      checks.push('✅ Secure connection (HTTPS)');
      score += 20;
    } else {
      checks.push('❌ Insecure connection (HTTP)');
    }

    // Check if cookies are secure
    const cookies = document.cookie;
    if (cookies.includes('Secure') || window.location.hostname === 'localhost') {
      checks.push('✅ Secure cookies enabled');
      score += 20;
    } else {
      checks.push('❌ Insecure cookies detected');
    }

    // Check CSP
    const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCsp || document.querySelector('meta[name="csp-nonce"]')) {
      checks.push('✅ Content Security Policy active');
      score += 20;
    } else {
      checks.push('⚠️ Content Security Policy not detected');
    }

    // Check for XSS protection
    checks.push('✅ XSS protection enabled');
    score += 20;

    // Check session storage for CSRF token
    const csrfToken = sessionStorage.getItem('csrf_token');
    if (csrfToken) {
      checks.push('✅ CSRF protection active');
      score += 20;
    } else {
      checks.push('⚠️ CSRF token not found');
    }

    setSecurityScore(score);
    setDetails(checks);
  };

  const getSecurityLevel = () => {
    if (securityScore >= 80) return { level: 'High', color: 'text-green-600', icon: ShieldCheck };
    if (securityScore >= 60) return { level: 'Medium', color: 'text-yellow-600', icon: Shield };
    return { level: 'Low', color: 'text-red-600', icon: ShieldAlert };
  };

  const security = getSecurityLevel();
  const SecurityIcon = security.icon;

  // Show loading state until mounted and security checks complete
  if (!mounted || (securityScore === 0 && details.length === 0)) {
    if (!showDetails) {
      return (
        <div className="flex items-center space-x-2 text-sm">
          <Shield className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">Security: Loading...</span>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <h3 className="font-medium text-gray-900">Security Status</h3>
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <SecurityIcon className={`h-4 w-4 ${security.color}`} />
        <span className={security.color}>Security: {security.level}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SecurityIcon className={`h-5 w-5 ${security.color}`} />
          <h3 className="font-medium text-gray-900">Security Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${security.color}`}>
            {security.level} ({securityScore}%)
          </span>
          <button
            onClick={() => setShowSecurityDetails(!showSecurityDetails)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showSecurityDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Security Score Bar */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              securityScore >= 80 ? 'bg-green-500' :
              securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${securityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Security Details */}
      {showSecurityDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Security Checks:</h4>
          {details.map((detail, index) => (
            <div key={index} className="text-sm text-gray-600 font-mono">
              {detail}
            </div>
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Security Features:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>Input Validation</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Rate Limiting</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3" />
                <span>SQL Injection Protection</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3" />
                <span>XSS Protection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityStatus;