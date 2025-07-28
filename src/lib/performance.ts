// Performance monitoring utilities
interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private marks: Map<string, number> = new Map();

  // Start timing an operation
  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  // End timing and record the metric
  measure(name: string) {
    const startTime = this.marks.get(name);
    if (startTime === undefined) {
      console.warn(`No mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetrics = {
      name,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    if (import.meta.env.DEV) {
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    }

    return metric;
  }

  // Get all recorded metrics
  getMetrics() {
    return this.metrics;
  }

  // Get Web Vitals (if available)
  getWebVitals() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        // First Contentful Paint
        fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        // Largest Contentful Paint (requires LCP observer)
        lcp: null, // Would need PerformanceObserver
        // Time to Interactive
        tti: navigation.domInteractive - navigation.fetchStart,
        // First Input Delay (requires FID observer)
        fid: null, // Would need PerformanceObserver
        // Cumulative Layout Shift (requires CLS observer)
        cls: null, // Would need PerformanceObserver
      };
    }
    return null;
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    this.marks.clear();
  }
}

export const performance_monitor = new PerformanceMonitor();

// React hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  return {
    trackRender: () => {
      const renderTime = performance.now() - startTime;
      if (import.meta.env.DEV) {
        console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    },
  };
};