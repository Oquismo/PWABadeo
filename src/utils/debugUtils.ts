// Utilidades para el sistema de debug extendido
export interface ExtendedMetrics {
  // Métricas de errores
  errorCount: number;
  lastError: string | null;
  consoleErrors: string[];
  
  // Métricas de performance
  fps: number;
  resourceLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  
  // Métricas de red
  apiCalls: number;
  failedRequests: number;
  averageResponseTime: number;
  
  // Métricas de usuario
  clickCount: number;
  scrollDistance: number;
  timeOnPage: number;
  
  // Métricas del sistema
  batteryLevel: number | null;
  deviceMemory: number | null;
  coreCount: number | null;
}

class DebugMonitor {
  private static instance: DebugMonitor;
  private metrics: ExtendedMetrics;
  private startTime: number;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      errorCount: 0,
      lastError: null,
      consoleErrors: [],
      fps: 0,
      resourceLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      apiCalls: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      clickCount: 0,
      scrollDistance: 0,
      timeOnPage: 0,
      batteryLevel: null,
      deviceMemory: null,
      coreCount: null
    };

    this.initializeMonitoring();
  }

  static getInstance(): DebugMonitor {
    if (!DebugMonitor.instance) {
      DebugMonitor.instance = new DebugMonitor();
    }
    return DebugMonitor.instance;
  }

  private initializeMonitoring() {
    // Monitoreo de errores
    this.setupErrorMonitoring();
    
    // Monitoreo de performance
    this.setupPerformanceMonitoring();
    
    // Monitoreo de interacciones del usuario
    this.setupUserInteractionMonitoring();
    
    // Información del dispositivo
    this.setupDeviceInfoMonitoring();
    
    // Monitoreo de FPS
    this.setupFPSMonitoring();
  }

  private setupErrorMonitoring() {
    // Capturar errores de JavaScript
    window.addEventListener('error', (event) => {
      this.metrics.errorCount++;
      this.metrics.lastError = event.message;
      this.metrics.consoleErrors.push(`${new Date().toLocaleTimeString()}: ${event.message}`);
      
      // Mantener solo los últimos 5 errores
      if (this.metrics.consoleErrors.length > 5) {
        this.metrics.consoleErrors.shift();
      }
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errorCount++;
      this.metrics.lastError = `Promise rejected: ${event.reason}`;
      this.metrics.consoleErrors.push(`${new Date().toLocaleTimeString()}: Promise rejected: ${event.reason}`);
      
      if (this.metrics.consoleErrors.length > 5) {
        this.metrics.consoleErrors.shift();
      }
    });
  }

  private setupPerformanceMonitoring() {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntriesByName('first-contentful-paint');
        if (entries.length > 0) {
          this.metrics.firstContentfulPaint = Math.round(entries[0].startTime);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          this.metrics.largestContentfulPaint = Math.round(entries[entries.length - 1].startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Resource loading
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
        this.metrics.resourceLoadTime = Math.round(totalTime / entries.length);
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }

    // Monitoreo de llamadas API (interceptar fetch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      this.metrics.apiCalls++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Calcular tiempo promedio de respuesta
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime + responseTime) / 2;
        
        if (!response.ok) {
          this.metrics.failedRequests++;
        }
        
        return response;
      } catch (error) {
        this.metrics.failedRequests++;
        throw error;
      }
    };
  }

  private setupUserInteractionMonitoring() {
    // Contador de clicks
    document.addEventListener('click', () => {
      this.metrics.clickCount++;
    });

    // Monitoreo de scroll
    let lastScrollY = window.scrollY;
    document.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      this.metrics.scrollDistance += Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;
    });

    // Tiempo en página
    setInterval(() => {
      this.metrics.timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  private setupDeviceInfoMonitoring() {
    // Información de batería
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.metrics.batteryLevel = Math.round(battery.level * 100);
        
        battery.addEventListener('levelchange', () => {
          this.metrics.batteryLevel = Math.round(battery.level * 100);
        });
      });
    }

    // Memoria del dispositivo
    if ('deviceMemory' in navigator) {
      this.metrics.deviceMemory = (navigator as any).deviceMemory;
    }

    // Número de cores
    if ('hardwareConcurrency' in navigator) {
      this.metrics.coreCount = navigator.hardwareConcurrency;
    }
  }

  private setupFPSMonitoring() {
    const measureFPS = (currentTime: number) => {
      this.frameCount++;
      
      if (currentTime - this.lastFrameTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFrameTime));
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  getMetrics(): ExtendedMetrics {
    return { ...this.metrics };
  }

  resetCounters() {
    this.metrics.errorCount = 0;
    this.metrics.consoleErrors = [];
    this.metrics.apiCalls = 0;
    this.metrics.failedRequests = 0;
    this.metrics.clickCount = 0;
    this.metrics.scrollDistance = 0;
    this.startTime = Date.now();
    this.metrics.timeOnPage = 0;
  }
}

export default DebugMonitor;
