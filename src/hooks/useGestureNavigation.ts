/**
 * Hook avanzado para navegación por gestos en PWA
 * Implementa swipe navigation, pull-to-refresh inteligente y gestos nativos
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHaptics } from './useHaptics';

interface GestureOptions {
  enabled?: boolean;
  swipeThreshold?: number;
  pullRefreshThreshold?: number;
  enableHaptics?: boolean;
}

interface UseGestureNavigationReturn {
  isSwipeActive: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  pullProgress: number;
  enableGestures: () => void;
  disableGestures: () => void;
}

export function useGestureNavigation(
  options: GestureOptions = {}
): UseGestureNavigationReturn {
  const {
    enabled = true,
    swipeThreshold = 100,
    pullRefreshThreshold = 80,
    enableHaptics = true
  } = options;

  const router = useRouter();
  const { swipe: hapticSwipe, success: hapticSuccess } = useHaptics();

  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [pullProgress, setPullProgress] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isGesturesEnabled = useRef(enabled);

  // Definir rutas principales para navegación por swipe
  const mainRoutes = [
    '/',
    '/mapa',
    '/proyectos',
    '/perfil',
    '/calendario'
  ];

  const getCurrentRouteIndex = useCallback(() => {
    const currentPath = window.location.pathname;
    return mainRoutes.findIndex(route => currentPath.startsWith(route));
  }, []);

  const navigateToRoute = useCallback((direction: 'left' | 'right') => {
    const currentIndex = getCurrentRouteIndex();
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (direction === 'left') {
      // Swipe izquierda -> siguiente ruta
      nextIndex = Math.min(currentIndex + 1, mainRoutes.length - 1);
    } else {
      // Swipe derecha -> ruta anterior
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (nextIndex !== currentIndex) {
      router.push(mainRoutes[nextIndex]);
      if (enableHaptics) {
        hapticSwipe();
      }
    }
  }, [getCurrentRouteIndex, router, enableHaptics, hapticSwipe]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isGesturesEnabled.current) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    setIsSwipeActive(false);
    setSwipeDirection(null);
    setPullProgress(0);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isGesturesEnabled.current || !touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determinar dirección predominante
    if (absDeltaX > absDeltaY && absDeltaX > 50) {
      // Swipe horizontal
      setIsSwipeActive(true);
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else if (absDeltaY > absDeltaX && absDeltaY > 50) {
      // Swipe vertical
      if (deltaY > 0 && window.scrollY <= 0) {
        // Pull down desde el top
        const progress = Math.min((deltaY / pullRefreshThreshold) * 100, 100);
        setPullProgress(progress);
        setSwipeDirection('down');
      } else {
        setSwipeDirection('up');
      }
    }
  }, [pullRefreshThreshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isGesturesEnabled.current || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Solo procesar si fue un gesto rápido y significativo
    if (deltaTime < 500 && (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold)) {
      if (absDeltaX > absDeltaY) {
        // Swipe horizontal - navegación entre rutas
        if (absDeltaX > swipeThreshold) {
          navigateToRoute(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Swipe vertical
        if (deltaY > 0 && window.scrollY <= 0 && absDeltaY > pullRefreshThreshold) {
          // Pull to refresh
          if (enableHaptics) {
            hapticSuccess();
          }
          window.location.reload();
        }
      }
    }

    // Reset state
    touchStartRef.current = null;
    setIsSwipeActive(false);
    setSwipeDirection(null);
    setPullProgress(0);
  }, [swipeThreshold, pullRefreshThreshold, navigateToRoute, enableHaptics, hapticSuccess]);

  const enableGestures = useCallback(() => {
    isGesturesEnabled.current = true;
  }, []);

  const disableGestures = useCallback(() => {
    isGesturesEnabled.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const options = { passive: false };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isSwipeActive,
    swipeDirection,
    pullProgress,
    enableGestures,
    disableGestures
  };
}

export default useGestureNavigation;