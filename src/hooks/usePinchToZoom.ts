/**
 * Hook para Pinch-to-Zoom avanzado en PWA
 * Soporta touch events para móviles y wheel events para desktop
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

interface PinchToZoomOptions {
  enabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  zoomSpeed?: number;
  enableHaptics?: boolean;
  smoothZoom?: boolean;
  resetOnDoubleTap?: boolean;
  onZoomStart?: () => void;
  onZoomEnd?: (scale: number) => void;
  onZoomChange?: (scale: number) => void;
}

interface PinchToZoomReturn {
  scale: number;
  isZooming: boolean;
  transformStyle: React.CSSProperties;
  resetZoom: () => void;
  setZoom: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  panX: number;
  panY: number;
  isPanning: boolean;
}

interface TouchInfo {
  x: number;
  y: number;
  distance: number;
  center: { x: number; y: number };
}

export function usePinchToZoom(
  elementRef: React.RefObject<HTMLElement>,
  options: PinchToZoomOptions = {}
): PinchToZoomReturn {
  const {
    enabled = true,
    minZoom = 0.5,
    maxZoom = 4,
    initialZoom = 1,
    zoomSpeed = 0.1,
    enableHaptics = true,
    smoothZoom = true,
    resetOnDoubleTap = true,
    onZoomStart,
    onZoomEnd,
    onZoomChange
  } = options;

  const { tap, success: hapticSuccess } = useHaptics();

  const [scale, setScale] = useState(initialZoom);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const lastTouchRef = useRef<TouchInfo | null>(null);
  const lastTapTimeRef = useRef(0);
  const initialPinchDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Calcular distancia entre dos toques
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calcular centro entre dos toques
  const getTouchCenter = useCallback((touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  // Limitar zoom dentro de los rangos permitidos
  const clampZoom = useCallback((zoom: number): number => {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }, [minZoom, maxZoom]);

  // Actualizar escala con validación
  const updateScale = useCallback((newScale: number, notify = true) => {
    const clampedScale = clampZoom(newScale);
    setScale(clampedScale);
    
    if (notify && onZoomChange) {
      onZoomChange(clampedScale);
    }

    // Ajustar pan si el zoom es menor (centrar contenido)
    if (clampedScale <= 1) {
      setPanX(0);
      setPanY(0);
    }

    return clampedScale;
  }, [clampZoom, onZoomChange]);

  // Resetear zoom y pan
  const resetZoom = useCallback(() => {
    if (enableHaptics) {
      hapticSuccess();
    }
    updateScale(initialZoom);
    setPanX(0);
    setPanY(0);
  }, [enableHaptics, hapticSuccess, updateScale, initialZoom]);

  // Funciones de zoom programático
  const setZoom = useCallback((newScale: number) => {
    updateScale(newScale);
  }, [updateScale]);

  const zoomIn = useCallback(() => {
    if (enableHaptics) {
      tap();
    }
    updateScale(scale + zoomSpeed);
  }, [enableHaptics, tap, updateScale, scale, zoomSpeed]);

  const zoomOut = useCallback(() => {
    if (enableHaptics) {
      tap();
    }
    updateScale(scale - zoomSpeed);
  }, [enableHaptics, tap, updateScale, scale, zoomSpeed]);

  // Touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !elementRef.current) return;

    const now = Date.now();
    
    if (e.touches.length === 1) {
      // Posible inicio de pan o doble tap
      const touch = e.touches[0];
      
      // Detectar doble tap
      if (resetOnDoubleTap && now - lastTapTimeRef.current < 300) {
        e.preventDefault();
        resetZoom();
        return;
      }
      
      lastTapTimeRef.current = now;
      
      // Iniciar pan
      panStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX,
        panY
      };
      
      setIsPanning(true);
    } else if (e.touches.length === 2) {
      // Iniciar pinch
      e.preventDefault();
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      initialPinchDistanceRef.current = distance;
      initialScaleRef.current = scale;
      
      lastTouchRef.current = {
        x: center.x,
        y: center.y,
        distance,
        center
      };
      
      setIsZooming(true);
      setIsPanning(false);
      
      if (onZoomStart) {
        onZoomStart();
      }
    }
  }, [enabled, elementRef, resetOnDoubleTap, resetZoom, panX, panY, getTouchDistance, getTouchCenter, scale, onZoomStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !elementRef.current) return;

    if (e.touches.length === 2 && lastTouchRef.current) {
      // Continuar pinch
      e.preventDefault();
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      
      if (initialPinchDistanceRef.current > 0) {
        const scaleChange = distance / initialPinchDistanceRef.current;
        const newScale = initialScaleRef.current * scaleChange;
        updateScale(newScale);
      }
    } else if (e.touches.length === 1 && panStartRef.current && scale > 1) {
      // Continuar pan (solo si hay zoom)
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - panStartRef.current.x;
      const deltaY = touch.clientY - panStartRef.current.y;
      
      // Limitar pan según el zoom actual
      const maxPan = 100 * (scale - 1);
      const newPanX = Math.max(-maxPan, Math.min(maxPan, panStartRef.current.panX + deltaX));
      const newPanY = Math.max(-maxPan, Math.min(maxPan, panStartRef.current.panY + deltaY));
      
      setPanX(newPanX);
      setPanY(newPanY);
    }
  }, [enabled, elementRef, getTouchDistance, updateScale, scale]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    if (e.touches.length === 0) {
      // Fin de todos los toques
      setIsZooming(false);
      setIsPanning(false);
      lastTouchRef.current = null;
      panStartRef.current = null;
      
      if (isZooming && onZoomEnd) {
        onZoomEnd(scale);
      }
    }
  }, [enabled, isZooming, onZoomEnd, scale]);

  // Wheel handler para desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!enabled || !elementRef.current) return;

    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = scale + delta;
    
    updateScale(newScale);
    
    if (enableHaptics) {
      tap();
    }
  }, [enabled, elementRef, zoomSpeed, scale, updateScale, enableHaptics, tap]);

  // Configurar event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!enabled || !element) return;

    const options = { passive: false };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('wheel', handleWheel, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  // Style para aplicar transformaciones
  const transformStyle: React.CSSProperties = {
    transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
    transformOrigin: 'center center',
    transition: smoothZoom && !isZooming && !isPanning ? 'transform 0.2s ease-out' : 'none',
    willChange: 'transform'
  };

  return {
    scale,
    isZooming,
    transformStyle,
    resetZoom,
    setZoom,
    zoomIn,
    zoomOut,
    panX,
    panY,
    isPanning
  };
}

export default usePinchToZoom;