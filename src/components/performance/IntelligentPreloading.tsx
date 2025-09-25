/**
 * Sistema de Preloading Inteligente
 * Predice y precarga recursos basándose en patrones de navegación del usuario
 */

import { useEffect, useRef, useState } from 'react';

// Tipos para el sistema de preloading
interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastVisit: number;
}

interface PreloadResource {
  type: 'route' | 'image' | 'data' | 'component';
  url: string;
  priority: 'high' | 'medium' | 'low';
  preloaded: boolean;
  timestamp: number;
}

interface PreloadOptions {
  enabled?: boolean;
  maxPatterns?: number;
  confidence?: number; // 0-1, qué tan probable debe ser una ruta para precargarla
  maxPreloads?: number;
  ttl?: number; // Time to live para patrones en milisegundos
}

class PreloadingManager {
  private patterns: NavigationPattern[] = [];
  private preloadedResources: PreloadResource[] = [];
  private options: Required<PreloadOptions>;
  private router: any;

  constructor(options: PreloadOptions = {}) {
    this.options = {
      enabled: true,
      maxPatterns: 50,
      confidence: 0.3,
      maxPreloads: 5,
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 días
      ...options,
    };
    
    this.loadPatternsFromStorage();
  }

  // Cargar patrones desde localStorage (solo del lado del cliente)
  private loadPatternsFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      
      const stored = localStorage.getItem('navigation-patterns');
      if (stored) {
        const patterns = JSON.parse(stored);
        this.patterns = patterns.filter(
          (p: NavigationPattern) => Date.now() - p.lastVisit < this.options.ttl
        );
      }
    } catch (error) {
      console.warn('Error loading navigation patterns:', error);
    }
  }

  // Guardar patrones en localStorage (solo del lado del cliente)
  private savePatternsToStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      
      localStorage.setItem('navigation-patterns', JSON.stringify(this.patterns));
    } catch (error) {
      console.warn('Error saving navigation patterns:', error);
    }
  }

  // Registrar una navegación
  recordNavigation(from: string, to: string) {
    if (!this.options.enabled || from === to) return;

    const existing = this.patterns.find(p => p.from === from && p.to === to);
    
    if (existing) {
      existing.count++;
      existing.lastVisit = Date.now();
    } else {
      this.patterns.push({
        from,
        to,
        count: 1,
        lastVisit: Date.now(),
      });
    }

    // Limpiar patrones antiguos
    this.patterns = this.patterns
      .filter(p => Date.now() - p.lastVisit < this.options.ttl)
      .sort((a, b) => b.count - a.count)
      .slice(0, this.options.maxPatterns);

    this.savePatternsToStorage();
  }

  // Obtener rutas recomendadas para precargar
  getRecommendedRoutes(currentRoute: string): string[] {
    const relevantPatterns = this.patterns.filter(p => p.from === currentRoute);
    const totalNavigations = relevantPatterns.reduce((sum, p) => sum + p.count, 0);

    return relevantPatterns
      .map(p => ({
        route: p.to,
        probability: p.count / totalNavigations,
      }))
      .filter(r => r.probability >= this.options.confidence)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, this.options.maxPreloads)
      .map(r => r.route);
  }

  // Precargar una ruta
  async preloadRoute(route: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.options.enabled) return;

    const existing = this.preloadedResources.find(
      r => r.url === route && r.type === 'route'
    );

    if (existing?.preloaded) return;

    try {
      // Usar el router de Next.js para precargar
      if (this.router?.prefetch) {
        await this.router.prefetch(route);
        
        this.preloadedResources.push({
          type: 'route',
          url: route,
          priority,
          preloaded: true,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.warn(`Error preloading route ${route}:`, error);
    }
  }

  // Precargar imagen
  preloadImage(src: string, priority: 'high' | 'medium' | 'low' = 'low') {
    if (!this.options.enabled) return;

    const existing = this.preloadedResources.find(
      r => r.url === src && r.type === 'image'
    );

    if (existing?.preloaded) return;

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedResources.push({
          type: 'image',
          url: src,
          priority,
          preloaded: true,
          timestamp: Date.now(),
        });
        resolve();
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }

  // Precargar datos
  async preloadData(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (!this.options.enabled) return;

    const existing = this.preloadedResources.find(
      r => r.url === url && r.type === 'data'
    );

    if (existing?.preloaded) return;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Preload': 'true',
        },
      });

      if (response.ok) {
        this.preloadedResources.push({
          type: 'data',
          url,
          priority,
          preloaded: true,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.warn(`Error preloading data ${url}:`, error);
    }
  }

  // Obtener estadísticas
  getStats() {
    return {
      patterns: this.patterns.length,
      preloadedResources: this.preloadedResources.length,
      topRoutes: this.patterns
        .slice(0, 5)
        .map(p => ({ from: p.from, to: p.to, count: p.count })),
    };
  }

  // Configurar router
  setRouter(router: any) {
    this.router = router;
  }

  // Limpiar cache
  clearCache() {
    this.patterns = [];
    this.preloadedResources = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('navigation-patterns');
    }
  }
}

// Instancia global del manager
const preloadingManager = new PreloadingManager();

// Hook principal para usar el sistema de preloading
export const useIntelligentPreloading = (options: PreloadOptions = {}) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const previousRoute = useRef<string>('');

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
    
    // Configurar router mock para el manager
    const currentPath = getPathname();
    preloadingManager.setRouter({ push: () => {}, asPath: currentPath });
  }, []);

  // Registrar navegaciones (solo del lado del cliente)
  useEffect(() => {
    if (!isClient) return;

    const currentPath = getPathname();
    
    const handleRouteChange = () => {
      const newPath = getPathname();
      if (previousRoute.current && previousRoute.current !== newPath) {
        preloadingManager.recordNavigation(previousRoute.current, newPath);
      }
      previousRoute.current = newPath;
    };

    // Registrar la ruta inicial
    previousRoute.current = currentPath;

    // Escuchar cambios de navegación usando popstate
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isClient]);

  // Precargar rutas recomendadas
  useEffect(() => {
    if (!isEnabled || !isClient) return;

    const currentPath = getPathname();
    
    const preloadRecommended = async () => {
      const recommended = preloadingManager.getRecommendedRoutes(currentPath);
      
      for (const route of recommended) {
        await preloadingManager.preloadRoute(route);
      }
    };

    // Usar requestIdleCallback para no bloquear la UI
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadRecommended, { timeout: 2000 });
    } else {
      setTimeout(preloadRecommended, 100);
    }
  }, [isEnabled, isClient]);

  return {
    preloadRoute: (route: string, priority?: 'high' | 'medium' | 'low') =>
      preloadingManager.preloadRoute(route, priority),
    preloadImage: (src: string, priority?: 'high' | 'medium' | 'low') =>
      preloadingManager.preloadImage(src, priority),
    preloadData: (url: string, priority?: 'high' | 'medium' | 'low') =>
      preloadingManager.preloadData(url, priority),
    getRecommendedRoutes: () =>
      preloadingManager.getRecommendedRoutes(getPathname()),
    getStats: () => preloadingManager.getStats(),
    clearCache: () => preloadingManager.clearCache(),
    enabled: isEnabled,
    setEnabled: setIsEnabled,
  };
};

// Hook para preloading específico de componentes
export const useComponentPreloading = (
  dependencies: string[],
  priority: 'high' | 'medium' | 'low' = 'low'
) => {
  const { preloadImage, preloadData } = useIntelligentPreloading();

  useEffect(() => {
    const preloadDependencies = async () => {
      for (const dep of dependencies) {
        if (dep.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)) {
          await preloadImage(dep, priority);
        } else if (dep.startsWith('/api/') || dep.startsWith('http')) {
          await preloadData(dep, priority);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadDependencies, { timeout: 3000 });
    } else {
      setTimeout(preloadDependencies, 200);
    }
  }, [dependencies, priority, preloadImage, preloadData]);
};

// Hook para preloading basado en hover/focus
export const useHoverPreloading = () => {
  const { preloadRoute } = useIntelligentPreloading();

  const handleHover = (href: string) => {
    preloadRoute(href, 'high');
  };

  const handleFocus = (href: string) => {
    preloadRoute(href, 'high');
  };

  return { handleHover, handleFocus };
};

// Componente para preloading automático de enlaces
export const PreloadLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  preloadOnHover?: boolean;
  preloadOnFocus?: boolean;
}> = ({ 
  href, 
  children, 
  className, 
  preloadOnHover = true, 
  preloadOnFocus = true 
}) => {
  const { handleHover, handleFocus } = useHoverPreloading();

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={preloadOnHover ? () => handleHover(href) : undefined}
      onFocus={preloadOnFocus ? () => handleFocus(href) : undefined}
    >
      {children}
    </a>
  );
};

export default preloadingManager;