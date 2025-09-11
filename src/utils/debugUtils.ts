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
  // Referencias para limpieza
  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;
  private clickHandler: (() => void) | null = null;
  private scrollHandler: (() => void) | null = null;
  private timeOnPageIntervalId: number | null = null;
  private fpsRafId: number | null = null;
  private originalFetch: typeof window.fetch | null = null;
  private fcpObserver: PerformanceObserver | null = null;
  private lcpObserver: PerformanceObserver | null = null;
  private resourceObserver: PerformanceObserver | null = null;
  private batteryRef: any = null;
  private batteryLevelChangeHandler: (() => void) | null = null;

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
    this.errorHandler = (event: ErrorEvent) => {
      this.metrics.errorCount++;
      this.metrics.lastError = event.message;
      this.metrics.consoleErrors.push(`${new Date().toLocaleTimeString()}: ${event.message}`);
      // Mantener solo los últimos 5 errores
      if (this.metrics.consoleErrors.length > 5) this.metrics.consoleErrors.shift();
    };
    window.addEventListener('error', this.errorHandler);

    // Capturar promesas rechazadas
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      this.metrics.errorCount++;
      this.metrics.lastError = `Promise rejected: ${event.reason}`;
      this.metrics.consoleErrors.push(`${new Date().toLocaleTimeString()}: Promise rejected: ${event.reason}`);
      if (this.metrics.consoleErrors.length > 5) this.metrics.consoleErrors.shift();
    };
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  private setupPerformanceMonitoring() {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      this.fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntriesByName('first-contentful-paint');
        if (entries.length > 0) this.metrics.firstContentfulPaint = Math.round(entries[0].startTime);
      });
      this.fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      this.lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) this.metrics.largestContentfulPaint = Math.round(entries[entries.length - 1].startTime);
      });
      this.lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Resource loading
      this.resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const totalTime = entries.reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).duration, 0);
          this.metrics.resourceLoadTime = Math.round(totalTime / entries.length);
        }
      });
      this.resourceObserver.observe({ entryTypes: ['resource'] });
    }

    // Monitoreo de llamadas API (interceptar fetch)
    // Interceptar fetch y guardar el original para restaurar después
    this.originalFetch = window.fetch.bind(window);
    const originalFetch = this.originalFetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      this.metrics.apiCalls++;
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        this.metrics.averageResponseTime = (this.metrics.averageResponseTime + responseTime) / 2;
        if (!response.ok) this.metrics.failedRequests++;
        return response;
      } catch (error) {
        this.metrics.failedRequests++;
        throw error;
      }
    };
  }

  private setupUserInteractionMonitoring() {
    // Contador de clicks
    this.clickHandler = () => { this.metrics.clickCount++; };
    document.addEventListener('click', this.clickHandler);

    // Monitoreo de scroll
    this.scrollHandler = () => {
      const currentScrollY = window.scrollY;
      // lastScrollY se guarda en startTime como referencia temporal, usamos frameCount temporalmente
      // Mejor almacenar un property auxiliar
      if ((this as any)._lastScrollY === undefined) (this as any)._lastScrollY = window.scrollY;
      const last = (this as any)._lastScrollY as number;
      this.metrics.scrollDistance += Math.abs(currentScrollY - last);
      (this as any)._lastScrollY = currentScrollY;
    };
    document.addEventListener('scroll', this.scrollHandler);

    // Tiempo en página
    this.timeOnPageIntervalId = window.setInterval(() => {
      this.metrics.timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  private setupDeviceInfoMonitoring() {
    // Información de batería
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.batteryRef = battery;
        this.metrics.batteryLevel = Math.round(battery.level * 100);
        this.batteryLevelChangeHandler = () => { this.metrics.batteryLevel = Math.round(battery.level * 100); };
        battery.addEventListener('levelchange', this.batteryLevelChangeHandler);
      }).catch(() => {});
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
      this.fpsRafId = requestAnimationFrame(measureFPS);
    };
    this.fpsRafId = requestAnimationFrame(measureFPS);
  }

  // Limpiar todos los listeners, intervals y observers
  destroy() {
    try {
      if (this.errorHandler) window.removeEventListener('error', this.errorHandler);
      if (this.unhandledRejectionHandler) window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
      if (this.clickHandler) document.removeEventListener('click', this.clickHandler);
      if (this.scrollHandler) document.removeEventListener('scroll', this.scrollHandler);
      if (this.timeOnPageIntervalId) clearInterval(this.timeOnPageIntervalId);
      if (this.fpsRafId) cancelAnimationFrame(this.fpsRafId);
      if (this.fcpObserver) { try { this.fcpObserver.disconnect(); } catch {} }
      if (this.lcpObserver) { try { this.lcpObserver.disconnect(); } catch {} }
      if (this.resourceObserver) { try { this.resourceObserver.disconnect(); } catch {} }
      if (this.batteryRef && this.batteryLevelChangeHandler) {
        try { this.batteryRef.removeEventListener('levelchange', this.batteryLevelChangeHandler); } catch {}
        this.batteryRef = null;
      }
      // Restaurar fetch original si fue reemplazado
      if (this.originalFetch) {
        try { window.fetch = this.originalFetch; } catch {}
        this.originalFetch = null;
      }
    } catch (e) {
      // No bloquear la aplicación por errores en cleanup
      console.warn('Error cleaning DebugMonitor:', e);
    }
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
