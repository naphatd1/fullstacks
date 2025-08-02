'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Mail, Heart, Code, Shield, Zap, Star, Sparkles, Palette, Brush, Layers } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Monitoring', href: '/monitoring' },
      { name: 'API Docs', href: '/api/docs' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Status', href: '#' },
    ],
    company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
    ],
  };

  const technologies = [
    { name: 'Next.js 15', icon: Code, color: 'from-emerald-400 to-teal-500' },
    { name: 'NestJS', icon: Shield, color: 'from-teal-400 to-emerald-500' },
    { name: 'TypeScript', icon: Zap, color: 'from-sage-400 to-mint-500' },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-sage-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-slate-800">
      {/* Soft Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gentle floating shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 dark:from-emerald-800/20 dark:to-teal-800/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-br from-sage-200/30 to-mint-200/30 dark:from-sage-800/20 dark:to-mint-800/20 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 dark:from-teal-800/20 dark:to-emerald-800/20 rounded-full blur-md animate-pulse animation-delay-2000"></div>
        
        {/* Soft artistic lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5 dark:opacity-10" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradSoft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <path d="M0,200 Q300,100 600,200 T1200,200" stroke="url(#gradSoft)" strokeWidth="1.5" fill="none"/>
          <path d="M0,400 Q400,300 800,400 T1200,400" stroke="url(#gradSoft)" strokeWidth="1" fill="none"/>
          <path d="M0,600 Q200,500 400,600 T800,600" stroke="url(#gradSoft)" strokeWidth="0.8" fill="none"/>
        </svg>

        {/* Gentle constellation effect */}
        <div className="absolute top-16 right-20">
          <Star className="w-4 h-4 text-emerald-400/40 dark:text-emerald-400/60 animate-pulse" />
        </div>
        <div className="absolute top-32 right-40">
          <Star className="w-3 h-3 text-teal-400/40 dark:text-teal-400/60 animate-pulse animation-delay-500" />
        </div>
        <div className="absolute bottom-20 left-32">
          <Star className="w-5 h-5 text-sage-400/40 dark:text-sage-400/60 animate-pulse animation-delay-1000" />
        </div>
        <div className="absolute bottom-40 right-60">
          <Sparkles className="w-6 h-6 text-mint-400/40 dark:text-mint-400/60 animate-pulse animation-delay-1500" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gentle Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-300 to-teal-400 dark:from-emerald-700 dark:to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200/30 dark:shadow-emerald-900/30 transform rotate-12">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-sage-300 to-mint-400 dark:from-sage-600 dark:to-mint-500 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-sage-600 dark:from-emerald-400 dark:via-teal-400 dark:to-sage-400 bg-clip-text text-transparent">
                This House Is The Best
              </h2>
            </div>
          </div>
          <div className="max-w-xl mx-auto">
            <p className="text-sm text-sage-700 dark:text-white leading-relaxed">
              Where comfort meets technology. A peaceful system designed with serenity in mind.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Gentle Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="relative p-4 bg-white/60 dark:bg-sage-800/30 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-200/50 dark:border-sage-700/50">
              <div className="relative">
                <div className="flex items-center space-x-2 mb-3">
                  <Brush className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-sage-800 dark:text-white">Peaceful Space</span>
                </div>
                <p className="text-sage-600 dark:text-gray-300 text-xs leading-relaxed mb-4">
                  Comfort through simplicity. Experience harmony of gentle design.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="#"
                    className="group relative p-2 bg-emerald-100 dark:bg-emerald-800/40 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4 text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors duration-300" />
                  </a>
                  <a
                    href="#"
                    className="group relative p-2 bg-teal-100 dark:bg-teal-800/40 rounded-xl hover:bg-teal-200 dark:hover:bg-teal-700/50 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4 text-teal-700 dark:text-teal-300 group-hover:text-teal-800 dark:group-hover:text-teal-200 transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Gentle Link Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={category} className="relative">
              <h3 className="text-xs font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text uppercase tracking-wider mb-3 flex items-center">
                <Layers className="w-3 h-3 mr-1 text-emerald-500 dark:text-emerald-400" />
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group relative text-sage-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-white text-xs transition-all duration-300 flex items-center"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gentle Technologies Section */}
        <div className="relative mb-6 p-4 bg-white/40 dark:bg-sage-800/20 backdrop-blur-sm rounded-2xl border border-emerald-200/30 dark:border-sage-700/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-0">
              <div className="flex items-center space-x-1">
                <Code className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-sage-700 dark:text-white">Powered by:</span>
              </div>
              {technologies.map((tech, index) => (
                <div
                  key={tech.name}
                  className={`group relative flex items-center space-x-2 px-2 py-1 bg-gradient-to-r ${tech.color} rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105`}
                >
                  <tech.icon className="h-3 h-3 text-white drop-shadow-sm" />
                  <span className="text-xs font-medium text-white drop-shadow-sm">{tech.name}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-rose-100/60 to-pink-100/60 dark:from-rose-800/30 dark:to-pink-800/30 rounded-lg border border-rose-200/40 dark:border-rose-700/40">
              <span className="text-xs text-sage-700 dark:text-white">Crafted with</span>
              <Heart className="h-3 w-3 text-rose-500 dark:text-rose-400 animate-pulse" />
              <span className="text-xs font-medium text-sage-800 dark:text-white">& serenity</span>
            </div>
          </div>
        </div>

        {/* Gentle Copyright Section */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 dark:via-emerald-700/50 to-transparent"></div>
          <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-300 to-teal-400 dark:from-emerald-600 dark:to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">©</span>
              </div>
              <p className="text-xs text-sage-600 dark:text-gray-300">
                {currentYear} <span className="text-emerald-600 dark:text-emerald-400 font-medium">This House Is The Best</span>. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sage-600 dark:text-gray-300">Peaceful</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse animation-delay-500"></div>
                <span className="text-sage-600 dark:text-gray-300">Gentle</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-pulse animation-delay-1000"></div>
                <span className="text-sage-600 dark:text-gray-300">Comfortable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animation delays */}
      <style jsx>{`
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </footer>
  );
};

export default Footer;