/**
 * Hook avanzado para optimización de performance en PWA
 * Implementa lazy loading inteligente, skeleton screens y precarga estratégica
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

interface UseLazyLoadReturn {
  ref: React.RefObject<HTMLElement>;
  isInView: boolean;
  hasBeenInView: boolean;
}

export function useLazyLoad(options: LazyLoadOptions = {}): UseLazyLoadReturn {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        if (inView && !hasBeenInView) {
          setHasBeenInView(true);
        }

        if (triggerOnce && hasBeenInView) {
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce, hasBeenInView]);

  return { ref, isInView, hasBeenInView };
}

interface SkeletonOptions {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function useSkeleton(options: SkeletonOptions = {}) {
  const {
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    animation = 'pulse',
    className = ''
  } = options;

  const skeletonStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: '#e0e0e0',
    animation: animation !== 'none' ? `${animation} 1.5s ease-in-out infinite` : 'none',
  };

  return { skeletonStyle, className };
}

interface PreloadOptions {
  priority?: 'low' | 'high';
  as?: 'image' | 'script' | 'style' | 'font' | 'document';
  crossorigin?: string;
}

export function usePreload(src: string, options: PreloadOptions = {}) {
  const { priority = 'low', as = 'image', crossorigin } = options;

  useEffect(() => {
    if (!src) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = as;

    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src, priority, as, crossorigin]);
}

interface UseProgressiveImageReturn {
  src: string;
  isLoading: boolean;
  error: string | null;
}

export function useProgressiveImage(
  src: string,
  placeholder?: string
): UseProgressiveImageReturn {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { src: currentSrc, isLoading, error };
}

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  items: any[];
  overscan?: number;
}

interface UseVirtualScrollReturn {
  visibleItems: any[];
  offsetY: number;
  totalHeight: number;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function useVirtualScroll(options: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const { itemHeight, containerHeight, items, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    totalHeight,
    handleScroll
  };
}

export default {
  useLazyLoad,
  useSkeleton,
  usePreload,
  useProgressiveImage,
  useVirtualScroll
};