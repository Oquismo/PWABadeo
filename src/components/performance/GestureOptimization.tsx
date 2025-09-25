/**
 * Optimizaciones de Performance para Gestos
 * Mantiene 60fps durante todas las interacciones
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { usePerformanceMonitoring } from './PerformanceMonitor';

// Optimizador de animaciones usando RAF (RequestAnimationFrame)
class AnimationOptimizer {
  private rafId: number | null = null;
  private callbacks: Set<() => void> = new Set();
  private isRunning = false;

  // Agregar callback para el próximo frame
  addCallback(callback: () => void) {
    this.callbacks.add(callback);
    this.startLoop();
  }

  // Remover callback
  removeCallback(callback: () => void) {
    this.callbacks.delete(callback);
    if (this.callbacks.size === 0) {
      this.stopLoop();
    }
  }

  // Iniciar el loop de animación
  private startLoop() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tick();
  }

  // Detener el loop
  private stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
  }

  // Frame tick
  private tick = () => {
    if (this.callbacks.size === 0) {
      this.stopLoop();
      return;
    }

    // Ejecutar todos los callbacks en un solo frame
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Animation callback error:', error);
      }
    });

    this.rafId = requestAnimationFrame(this.tick);
  };

  // Cleanup
  destroy() {
    this.stopLoop();
    this.callbacks.clear();
  }
}

// Instancia global del optimizador
const animationOptimizer = new AnimationOptimizer();

// Hook para optimización de transformaciones CSS
export const useOptimizedTransform = () => {
  const elementRef = useRef<HTMLElement>(null);
  const transformRef = useRef({
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
  });
  const needsUpdate = useRef(false);

  // Aplicar transformaciones optimizadas
  const applyTransform = useCallback(() => {
    if (!elementRef.current || !needsUpdate.current) return;

    const { translateX, translateY, scale, rotate } = transformRef.current;
    const transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    
    // Usar transform3d y will-change para activar aceleración por hardware
    elementRef.current.style.transform = transform;
    elementRef.current.style.willChange = 'transform';
    
    needsUpdate.current = false;
  }, []);

  // Configurar elemento para optimización
  const bindElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    (elementRef as any).current = element;
    
    // Optimizaciones CSS para performance
    element.style.transformOrigin = 'center center';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
    
    // Registrar para animaciones
    animationOptimizer.addCallback(applyTransform);
    
    return () => {
      animationOptimizer.removeCallback(applyTransform);
      if (element) {
        element.style.willChange = 'auto';
      }
    };
  }, [applyTransform]);

  // Actualizar transformación
  const updateTransform = useCallback((updates: Partial<typeof transformRef.current>) => {
    Object.assign(transformRef.current, updates);
    needsUpdate.current = true;
  }, []);

  return {
    bindElement,
    updateTransform,
    getCurrentTransform: () => ({ ...transformRef.current }),
  };
};

// Hook para throttling de eventos táctiles
export const useTouchThrottling = (callback: (event: any) => void, delay: number = 16) => {
  const lastCall = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback((event: any) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(event);
    } else {
      // Programar para el próximo frame disponible
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const timeout = setTimeout(() => {
        lastCall.current = Date.now();
        callback(event);
      }, delay - (now - lastCall.current));
      
      timeoutRef.current = timeout;
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Hook para optimización de eventos de scroll/pan
export const useOptimizedPanning = () => {
  const { measureFPS, recordMetric } = usePerformanceMonitoring();
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0, timestamp: 0 });
  const momentumRef = useRef<NodeJS.Timeout>();

  // Calcular velocidad de movimiento
  const updateVelocity = useCallback((x: number, y: number) => {
    const now = performance.now();
    const dt = now - lastPosition.current.timestamp;
    
    if (dt > 0) {
      velocityRef.current = {
        x: (x - lastPosition.current.x) / dt,
        y: (y - lastPosition.current.y) / dt,
      };
    }
    
    lastPosition.current = { x, y, timestamp: now };
  }, []);

  // Aplicar momentum physics
  const applyMomentum = useCallback((
    onUpdate: (x: number, y: number) => void,
    friction: number = 0.95,
    threshold: number = 0.1
  ) => {
    if (momentumRef.current) {
      clearInterval(momentumRef.current);
    }

    const animate = () => {
      const { x, y } = velocityRef.current;
      
      if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
        if (momentumRef.current) {
          clearInterval(momentumRef.current);
          momentumRef.current = undefined;
        }
        return;
      }

      velocityRef.current.x *= friction;
      velocityRef.current.y *= friction;
      
      onUpdate(x, y);
    };

    momentumRef.current = setInterval(animate, 16) as any; // 60fps
  }, []);

  useEffect(() => {
    return () => {
      if (momentumRef.current) {
        clearInterval(momentumRef.current);
      }
    };
  }, []);

  return {
    updateVelocity,
    applyMomentum,
    getCurrentVelocity: () => ({ ...velocityRef.current }),
  };
};

// Hook para batch de actualizaciones DOM
export const useBatchedUpdates = () => {
  const updates = useRef<(() => void)[]>([]);
  const scheduled = useRef(false);

  const batchUpdate = useCallback((updateFn: () => void) => {
    updates.current.push(updateFn);
    
    if (!scheduled.current) {
      scheduled.current = true;
      
      requestAnimationFrame(() => {
        // Ejecutar todas las actualizaciones en un solo frame
        const currentUpdates = [...updates.current];
        updates.current = [];
        scheduled.current = false;
        
        currentUpdates.forEach(update => {
          try {
            update();
          } catch (error) {
            console.warn('Batched update error:', error);
          }
        });
      });
    }
  }, []);

  return { batchUpdate };
};

// Hook para optimización de gestos específicos
export const useOptimizedGestures = () => {
  const { recordGesture, measureFPS } = usePerformanceMonitoring();
  const { updateTransform, bindElement } = useOptimizedTransform();
  const { updateVelocity, applyMomentum } = useOptimizedPanning();
  const { batchUpdate } = useBatchedUpdates();

  // Optimizar pinch-to-zoom
  const optimizedPinch = useCallback((scale: number, centerX: number, centerY: number) => {
    batchUpdate(() => {
      updateTransform({
        scale: Math.max(0.5, Math.min(4, scale)),
        translateX: centerX,
        translateY: centerY,
      });
    });
  }, [updateTransform, batchUpdate]);

  // Optimizar panning
  const optimizedPan = useCallback((deltaX: number, deltaY: number) => {
    updateVelocity(deltaX, deltaY);
    
    batchUpdate(() => {
      updateTransform({
        translateX: deltaX,
        translateY: deltaY,
      });
    });
  }, [updateTransform, updateVelocity, batchUpdate]);

  // Optimizar rotación
  const optimizedRotate = useCallback((angle: number) => {
    batchUpdate(() => {
      updateTransform({
        rotate: angle % 360,
      });
    });
  }, [updateTransform, batchUpdate]);

  // Medir performance de gestos
  const measureGesturePerformance = useCallback(async (gestureType: string, gestureFunction: () => void) => {
    const startTime = performance.now();
    const fpsPromise = measureFPS(500);
    
    try {
      gestureFunction();
      const duration = performance.now() - startTime;
      const fps = await fpsPromise;
      
      recordGesture(gestureType as any, duration, fps >= 55); // Consideramos exitoso si mantiene >55fps
      
      return { duration, fps, success: fps >= 55 };
    } catch (error) {
      const duration = performance.now() - startTime;
      recordGesture(gestureType as any, duration, false);
      throw error;
    }
  }, [measureFPS, recordGesture]);

  return {
    bindElement,
    optimizedPinch,
    optimizedPan,
    optimizedRotate,
    applyMomentum,
    measureGesturePerformance,
  };
};

// Utilidades para optimización de CSS
export const optimizeElementForGestures = (element: HTMLElement) => {
  // Activar aceleración por hardware
  element.style.transform = 'translate3d(0, 0, 0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.perspective = '1000px';
  element.style.willChange = 'transform';
  
  // Optimizar touch events
  element.style.touchAction = 'none';
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  
  // Optimizar rendering
  element.style.contain = 'layout style paint';
  
  return () => {
    // Cleanup
    element.style.willChange = 'auto';
    element.style.contain = 'none';
  };
};

// Hook para detectar capacidades del dispositivo
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    supportsTouch: false,
    supportsPointer: false,
    deviceMemory: 0,
    hardwareConcurrency: 0,
    effectiveType: 'unknown',
  });

  useEffect(() => {
    const nav = navigator as any;
    
    setCapabilities({
      supportsTouch: 'ontouchstart' in window,
      supportsPointer: 'onpointerdown' in window,
      deviceMemory: nav.deviceMemory || 0,
      hardwareConcurrency: nav.hardwareConcurrency || 0,
      effectiveType: nav.connection?.effectiveType || 'unknown',
    });
  }, []);

  return capabilities;
};

export default animationOptimizer;