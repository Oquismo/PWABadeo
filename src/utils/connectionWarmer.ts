import loggerClient from '@/lib/loggerClient';
/**
 * Utilidades para precalentar conexiones y reducir cold starts
 */

interface WarmupOptions {
  endpoints?: string[];
  interval?: number;
  maxRetries?: number;
}

class ConnectionWarmer {
  private isWarming = false;
  private lastWarmup = 0;
  private warmupInterval: NodeJS.Timeout | null = null;

  constructor(private options: WarmupOptions = {}) {
    this.options = {
      endpoints: ['/api/announcement'],
      interval: 4 * 60 * 1000, // 4 minutos
      maxRetries: 2,
      ...options
    };
  }

  async warmup(): Promise<void> {
    if (this.isWarming || Date.now() - this.lastWarmup < 60000) {
      return; // No calentar más de una vez por minuto
    }

    this.isWarming = true;
    this.lastWarmup = Date.now();

      loggerClient.info('🔥 Warming up connections...');

    const promises = this.options.endpoints!.map(endpoint => 
      this.warmupEndpoint(endpoint)
    );

    try {
      await Promise.allSettled(promises);
        loggerClient.info('✅ Warmup completed');
    } catch (error) {
        loggerClient.warn('⚠️ Some warmup requests failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  private async warmupEndpoint(endpoint: string): Promise<void> {
    for (let attempt = 0; attempt < this.options.maxRetries!; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'HEAD', // Usar HEAD para requests más ligeros
          headers: {
            'x-warmup': 'true',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
            loggerClient.info(`✅ Warmed up: ${endpoint}`);
          return;
        }
      } catch (error) {
        if (attempt === this.options.maxRetries! - 1) {
            loggerClient.warn(`❌ Failed to warmup ${endpoint}:`, error);
        }
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  startPeriodicWarmup(): void {
    if (this.warmupInterval) {
      this.stopPeriodicWarmup();
    }

    // Warmup inicial después de 10 segundos
    setTimeout(() => this.warmup(), 10000);

    // Warmup periódico
    this.warmupInterval = setInterval(() => {
      this.warmup();
    }, this.options.interval);

      loggerClient.info(`🔥 Periodic warmup started (every ${this.options.interval! / 1000}s)`);
  }

  stopPeriodicWarmup(): void {
    if (this.warmupInterval) {
      clearInterval(this.warmupInterval);
      this.warmupInterval = null;
        loggerClient.info('🛑 Periodic warmup stopped');
    }
  }
}

// Instancia global del warmer
export const connectionWarmer = new ConnectionWarmer();

// Hook para usar en componentes React
export function useConnectionWarmer() {
  const startWarmup = () => connectionWarmer.startPeriodicWarmup();
  const stopWarmup = () => connectionWarmer.stopPeriodicWarmup();
  const manualWarmup = () => connectionWarmer.warmup();

  return {
    startWarmup,
    stopWarmup,
    manualWarmup
  };
}

// Función para inicializar warmup automático
export function initializeWarmup() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    connectionWarmer.startPeriodicWarmup();

    // Cleanup al cerrar la página
    window.addEventListener('beforeunload', () => {
      connectionWarmer.stopPeriodicWarmup();
    });
  }
}
