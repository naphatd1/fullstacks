'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number | null;
  renderTime: number | null;
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: null,
    renderTime: null,
    firstContentfulPaint: null,
    largestContentfulPaint: null,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Measure initial render
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Use RAF to measure after paint
    requestAnimationFrame(measureRender);

    // Measure Web Vitals
    if (typeof window !== 'undefined') {
      // Load time
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        setMetrics(prev => ({ ...prev, loadTime }));
      });

      // FCP and LCP using Performance Observer
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, firstContentfulPaint: entry.startTime }));
              }
            }
            if (entry.entryType === 'largest-contentful-paint') {
              setMetrics(prev => ({ ...prev, largestContentfulPaint: entry.startTime }));
            }
          }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

        return () => observer.disconnect();
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }, []);

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.loadTime) {
      console.group('🚀 Performance Metrics');
      console.log('Load Time:', `${metrics.loadTime?.toFixed(2)}ms`);
      console.log('Render Time:', `${metrics.renderTime?.toFixed(2)}ms`);
      console.log('First Contentful Paint:', `${metrics.firstContentfulPaint?.toFixed(2)}ms`);
      console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint?.toFixed(2)}ms`);
      console.groupEnd();
    }
  }, [metrics]);

  return metrics;
};