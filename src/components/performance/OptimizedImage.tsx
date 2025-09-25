/**
 * Componente de Imagen Optimizada
 * Maneja carga inteligente, formatos modernos y lazy loading
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  lazy?: boolean;
  fadeIn?: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Hook para detectar soporte de formatos modernos
const useFormatSupport = () => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const [supportsAVIF, setSupportsAVIF] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const checkAVIF = async () => {
      try {
        const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        const img = new (window as any).Image();
        return new Promise<boolean>((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = avifData;
        });
      } catch {
        return false;
      }
    };

    setSupportsWebP(checkWebP());
    checkAVIF().then(result => setSupportsAVIF(result as boolean));
  }, []);

  return { supportsWebP, supportsAVIF };
};

// Hook para lazy loading con Intersection Observer
const useLazyLoading = (ref: React.RefObject<HTMLElement>, enabled: boolean = true) => {
  const [shouldLoad, setShouldLoad] = useState(!enabled);

  useEffect(() => {
    if (!enabled || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, enabled, shouldLoad]);

  return shouldLoad;
};

// Función para optimizar la URL de la imagen
const optimizeImageUrl = (
  src: string,
  { supportsAVIF, supportsWebP }: { supportsAVIF: boolean | null; supportsWebP: boolean | null },
  quality: number = 75
): string => {
  // Si es una URL externa, intentar usar servicios de optimización
  if (src.startsWith('http') && !src.includes(window.location.hostname)) {
    // Para Unsplash
    if (src.includes('unsplash.com')) {
      const url = new URL(src);
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('auto', 'format');
      if (supportsAVIF) url.searchParams.set('fm', 'avif');
      else if (supportsWebP) url.searchParams.set('fm', 'webp');
      return url.toString();
    }
    
    // Para otras CDNs, mantener URL original
    return src;
  }

  // Para imágenes locales, Next.js se encargará de la optimización
  return src;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'skeleton',
  blurDataURL,
  sizes,
  className,
  style,
  objectFit = 'cover',
  lazy = true,
  fadeIn = true,
  fallback,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { supportsWebP, supportsAVIF } = useFormatSupport();
  const shouldLoad = useLazyLoading(containerRef, lazy && !priority);

  // Optimizar URL basada en soporte del navegador
  const optimizedSrc = React.useMemo(() => {
    if (supportsAVIF === null || supportsWebP === null) return src;
    return optimizeImageUrl(src, { supportsAVIF, supportsWebP }, quality);
  }, [src, supportsAVIF, supportsWebP, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Componente de placeholder/skeleton
  const renderPlaceholder = () => {
    if (placeholder === 'skeleton') {
      return (
        <Skeleton
          variant="rectangular"
          width={fill ? '100%' : width}
          height={fill ? '100%' : height}
          sx={{
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
      );
    }
    return null;
  };

  // Si hay error y existe fallback
  if (hasError && fallback) {
    return (
      <Box ref={containerRef} className={className} style={style}>
        <OptimizedImage
          {...{ 
            src: fallback, 
            alt, 
            width, 
            height, 
            fill, 
            priority, 
            quality, 
            placeholder, 
            sizes, 
            objectFit,
            lazy: false, // No lazy load para fallback
            fadeIn: false,
            fallback: undefined // Evitar loop infinito
          }}
        />
      </Box>
    );
  }

  // Si no debe cargar aún (lazy loading)
  if (!shouldLoad) {
    return (
      <Box 
        ref={containerRef} 
        className={className} 
        style={{ 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height,
          ...style 
        }}
      >
        {renderPlaceholder()}
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef}
      className={className}
      style={{ 
        position: fill ? 'relative' : undefined,
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style 
      }}
    >
      {/* Mostrar placeholder mientras carga */}
      {!isLoaded && !hasError && renderPlaceholder()}
      
      {/* Imagen optimizada */}
      <motion.div
        initial={{ opacity: fadeIn ? 0 : 1 }}
        animate={{ opacity: isLoaded ? 1 : (fadeIn ? 0 : 1) }}
        transition={{ duration: fadeIn ? 0.3 : 0 }}
        style={{ 
          position: fill && !isLoaded ? 'absolute' : undefined,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: isLoaded ? 'block' : (fill ? 'block' : 'none')
        }}
      >
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          sizes={sizes}
          style={{
            objectFit,
            width: fill ? '100%' : undefined,
            height: fill ? '100%' : undefined,
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      </motion.div>
    </Box>
  );
};

export default OptimizedImage;

// Utilidades para generar blur data URLs
export const generateBlurDataURL = (width: number = 10, height: number = 10, color: string = '#e5e5e5'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};

// Hook para precargar imágenes críticas
export const useImagePreloader = (urls: string[]) => {
  useEffect(() => {
    const preloadImages = () => {
      urls.forEach(url => {
        const img = new (window as any).Image();
        img.src = url;
      });
    };

    // Precargar después de que la página principal haya cargado
    if (document.readyState === 'complete') {
      requestIdleCallback(preloadImages, { timeout: 1000 });
    } else {
      window.addEventListener('load', () => {
        requestIdleCallback(preloadImages, { timeout: 1000 });
      });
    }
  }, [urls]);
};