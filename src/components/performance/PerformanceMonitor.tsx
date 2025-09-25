/**
 * Sistema de Métricas de Performance en Tiempo Real
 * Monitorea Web Vitals, gestos, y performance general de la PWA
 */

import { useEffect, useState, useRef } from 'react';

// Tipos para métricas
interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface GestureMetric {
  type: 'pinch' | 'longpress' | 'swipe' | '3dtouch';
  duration: number;
  success: boolean;
  timestamp: number;
  device: string;
}

interface PerformanceMetric {
  type: 'navigation' | 'resource' | 'memory' | 'gesture' | 'interaction';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'fps' | 'score';
  timestamp: number;
  route: string;
}

interface PerformanceReport {
  webVitals: WebVital[];
  gestures: GestureMetric[];
  metrics: PerformanceMetric[];
  deviceInfo: {
    userAgent: string;
    connection: string;
    memory: number;
    cores: number;
  };
  sessionId: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVital[] = [];
  private gestureMetrics: GestureMetric[] = [];
  private sessionId: string;
  private observer?: PerformanceObserver;
  private router?: any;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitals();
    this.initializePerformanceObserver();
  }

  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Inicializar Web Vitals
  private initializeWebVitals() {
    // Importar dinámicamente web-vitals
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS((metric: any) => this.recordWebVital('CLS', metric.value, metric.rating));
      onINP((metric: any) => this.recordWebVital('INP', metric.value, metric.rating));
      onFCP((metric: any) => this.recordWebVital('FCP', metric.value, metric.rating));
      onLCP((metric: any) => this.recordWebVital('LCP', metric.value, metric.rating));
      onTTFB((metric: any) => this.recordWebVital('TTFB', metric.value, metric.rating));
    }).catch(() => {
      // Fallback si web-vitals no está disponible
      console.warn('Web Vitals library not available');
    });
  }

  // Inicializar Performance Observer
  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observar diferentes tipos de entradas
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'mark'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  // Procesar entradas de performance
  private processPerformanceEntry(entry: PerformanceEntry) {
    const currentRoute = this.router?.asPath || window.location.pathname;

    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordMetric('navigation', 'domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms', currentRoute);
        this.recordMetric('navigation', 'loadComplete', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms', currentRoute);
        break;

      case 'resource':
        const resEntry = entry as PerformanceResourceTiming;
        if (resEntry.duration > 100) { // Solo recursos lentos
          this.recordMetric('resource', resEntry.name, resEntry.duration, 'ms', currentRoute);
        }
        break;

      case 'measure':
        this.recordMetric('interaction', entry.name, entry.duration, 'ms', currentRoute);
        break;
    }
  }

  // Registrar Web Vital
  private recordWebVital(name: WebVital['name'], value: number, rating: WebVital['rating']) {
    this.webVitals.push({
      name,
      value,
      rating,
      timestamp: Date.now(),
    });
  }

  // Registrar métrica general
  recordMetric(
    type: PerformanceMetric['type'],
    name: string,
    value: number,
    unit: PerformanceMetric['unit'],
    route?: string
  ) {
    this.metrics.push({
      type,
      name,
      value,
      unit,
      timestamp: Date.now(),
      route: route || this.router?.asPath || window.location.pathname,
    });

    // Mantener solo las últimas 100 métricas para evitar memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Registrar métrica de gesto
  recordGesture(type: GestureMetric['type'], duration: number, success: boolean) {
    this.gestureMetrics.push({
      type,
      duration,
      success,
      timestamp: Date.now(),
      device: this.getDeviceType(),
    });

    // Mantener solo las últimas 50 métricas de gestos
    if (this.gestureMetrics.length > 50) {
      this.gestureMetrics = this.gestureMetrics.slice(-50);
    }
  }

  // Obtener tipo de dispositivo
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  // Obtener información del dispositivo
  private getDeviceInfo() {
    const nav = navigator as any;
    return {
      userAgent: navigator.userAgent,
      connection: nav.connection?.effectiveType || 'unknown',
      memory: nav.deviceMemory || 0,
      cores: navigator.hardwareConcurrency || 0,
    };
  }

  // Medir FPS
  measureFPS(duration: number = 1000): Promise<number> {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const measureFrame = (currentTime: number) => {
        frames++;
        
        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const fps = Math.round((frames * 1000) / (currentTime - startTime));
          this.recordMetric('interaction', 'fps', fps, 'fps');
          resolve(fps);
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  }

  // Medir memoria utilizada
  measureMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('memory', 'usedJSHeapSize', memory.usedJSHeapSize, 'bytes');
      this.recordMetric('memory', 'totalJSHeapSize', memory.totalJSHeapSize, 'bytes');
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Marcar inicio de una operación
  markStart(name: string) {
    if (typeof window !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  // Marcar fin de una operación y medir duración
  markEnd(name: string) {
    if (typeof window !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }

  // Generar reporte de performance
  generateReport(): PerformanceReport {
    return {
      webVitals: [...this.webVitals],
      gestures: [...this.gestureMetrics],
      metrics: [...this.metrics],
      deviceInfo: this.getDeviceInfo(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };
  }

  // Obtener métricas agregadas
  getAggregatedMetrics() {
    const goodVitals = this.webVitals.filter(v => v.rating === 'good').length;
    const totalVitals = this.webVitals.length;
    
    const successfulGestures = this.gestureMetrics.filter(g => g.success).length;
    const totalGestures = this.gestureMetrics.length;

    const avgNavigationTime = this.metrics
      .filter(m => m.type === 'navigation' && m.name === 'loadComplete')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

    return {
      vitalsScore: totalVitals > 0 ? (goodVitals / totalVitals) * 100 : 0,
      gestureSuccessRate: totalGestures > 0 ? (successfulGestures / totalGestures) * 100 : 0,
      avgLoadTime: avgNavigationTime,
      totalMetrics: this.metrics.length,
    };
  }

  // Configurar router para tracking de navegación
  setRouter(router: any) {
    this.router = router;
  }

  // Limpiar métricas
  clearMetrics() {
    this.metrics = [];
    this.webVitals = [];
    this.gestureMetrics = [];
  }

  // Destructor
  destroy() {
    this.observer?.disconnect();
  }
}

// Instancia global del monitor
const performanceMonitor = new PerformanceMonitor();

// Hook principal para monitoreo de performance
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState(performanceMonitor.getAggregatedMetrics());
  const [isClient, setIsClient] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Hook seguro para obtener pathname
  const getPathname = () => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  };

  useEffect(() => {
    // Marcar como cliente una vez montado
    setIsClient(true);
    
    // Configurar router mock para el monitor
    const currentPath = getPathname();
    performanceMonitor.setRouter({ asPath: currentPath });
  }, []);

  // Actualizar métricas cada 5 segundos
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMetrics(performanceMonitor.getAggregatedMetrics());
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    recordGesture: performanceMonitor.recordGesture.bind(performanceMonitor),
    measureFPS: performanceMonitor.measureFPS.bind(performanceMonitor),
    measureMemory: performanceMonitor.measureMemory.bind(performanceMonitor),
    markStart: performanceMonitor.markStart.bind(performanceMonitor),
    markEnd: performanceMonitor.markEnd.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  };
};

// Hook para monitoreo específico de gestos
export const useGesturePerformance = () => {
  const { recordGesture, measureFPS } = usePerformanceMonitoring();

  const measureGesture = async (
    type: GestureMetric['type'],
    gestureFunction: () => Promise<boolean> | boolean
  ) => {
    const startTime = performance.now();
    const fpsPromise = measureFPS(1000);
    
    try {
      const success = await gestureFunction();
      const duration = performance.now() - startTime;
      
      recordGesture(type, duration, success);
      
      const fps = await fpsPromise;
      return { success, duration, fps };
    } catch (error) {
      const duration = performance.now() - startTime;
      recordGesture(type, duration, false);
      throw error;
    }
  };

  return { measureGesture };
};

// Hook para debug de performance en desarrollo
export const usePerformanceDebug = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const { metrics, generateReport } = usePerformanceMonitoring();

  useEffect(() => {
    // Activar debug mode con Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsDebugMode(!isDebugMode);
        console.log('Performance Debug Mode:', !isDebugMode);
        if (!isDebugMode) {
          console.table(generateReport());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugMode, generateReport]);

  return {
    isDebugMode,
    metrics,
    toggleDebug: () => setIsDebugMode(!isDebugMode),
  };
};

export default performanceMonitor;