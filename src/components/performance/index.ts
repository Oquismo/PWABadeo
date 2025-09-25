/**
 * Exportaciones principales del sistema de optimización de performance
 */

// Lazy Loading
export { default as LazyLoader, useLazyComponent, preloadComponent, withLazyLoading } from './LazyLoader';

// Optimización de imágenes
export { default as OptimizedImage, generateBlurDataURL, useImagePreloader } from './OptimizedImage';

// Preloading inteligente
export { 
  useIntelligentPreloading, 
  useComponentPreloading, 
  useHoverPreloading, 
  PreloadLink 
} from './IntelligentPreloading';

// Monitoreo de performance
export { 
  default as performanceMonitor,
  usePerformanceMonitoring, 
  useGesturePerformance, 
  usePerformanceDebug 
} from './PerformanceMonitor';

// Optimización de gestos
export {
  default as animationOptimizer,
  useOptimizedTransform,
  useTouchThrottling,
  useOptimizedPanning,
  useDeviceCapabilities
} from './GestureOptimization';

// Tipos útiles (comentados temporalmente hasta definir interfaces)
// export type { LazyComponentOptions } from './LazyLoader';
// export type { OptimizedImageProps } from './OptimizedImage';
// export type { PreloadOptions } from './IntelligentPreloading';