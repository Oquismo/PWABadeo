/**
 * Hook para Edge Swipe Navigation
 * Implementa navegación desde los bordes de la pantalla para menús laterales y shortcuts
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

export interface EdgeSwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  color?: string;
}

export type EdgePosition = 'left' | 'right' | 'top' | 'bottom';

interface EdgeSwipeOptions {
  enabled?: boolean;
  edgeThreshold?: number; // Píxeles desde el borde para activar
  activationThreshold?: number; // Distancia para activar la acción
  enableHaptics?: boolean;
  edges?: EdgePosition[]; // Qué bordes están activos
}

interface EdgeSwipeReturn {
  isSwipingFromEdge: boolean;
  activeEdge: EdgePosition | null;
  swipeProgress: number; // 0-100
  showEdgeIndicator: boolean;
  edgeActions: Record<EdgePosition, EdgeSwipeAction[]>;
  setEdgeActions: (edge: EdgePosition, actions: EdgeSwipeAction[]) => void;
  clearEdgeActions: (edge: EdgePosition) => void;
}

export function useEdgeSwipeNavigation(options: EdgeSwipeOptions = {}): EdgeSwipeReturn {
  const {
    enabled = true,
    edgeThreshold = 20,
    activationThreshold = 100,
    enableHaptics = true,
    edges = ['left', 'right']
  } = options;

  const { tap, swipe, success: hapticSuccess } = useHaptics();

  const [isSwipingFromEdge, setIsSwipingFromEdge] = useState(false);
  const [activeEdge, setActiveEdge] = useState<EdgePosition | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [showEdgeIndicator, setShowEdgeIndicator] = useState(false);
  const [edgeActions, setEdgeActionsState] = useState<Record<EdgePosition, EdgeSwipeAction[]>>({
    left: [],
    right: [],
    top: [],
    bottom: []
  });

  const touchStartRef = useRef<{ x: number; y: number; edge: EdgePosition | null; time: number } | null>(null);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar desde qué borde se inicia el swipe
  const detectEdge = useCallback((x: number, y: number): EdgePosition | null => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Verificar bordes habilitados
    if (edges.includes('left') && x <= edgeThreshold) return 'left';
    if (edges.includes('right') && x >= viewportWidth - edgeThreshold) return 'right';
    if (edges.includes('top') && y <= edgeThreshold) return 'top';
    if (edges.includes('bottom') && y >= viewportHeight - edgeThreshold) return 'bottom';

    return null;
  }, [edges, edgeThreshold]);

  // Calcular progreso del swipe
  const calculateProgress = useCallback((startX: number, startY: number, currentX: number, currentY: number, edge: EdgePosition): number => {
    let distance = 0;

    switch (edge) {
      case 'left':
        distance = Math.max(0, currentX - startX);
        break;
      case 'right':
        distance = Math.max(0, startX - currentX);
        break;
      case 'top':
        distance = Math.max(0, currentY - startY);
        break;
      case 'bottom':
        distance = Math.max(0, startY - currentY);
        break;
    }

    return Math.min(100, (distance / activationThreshold) * 100);
  }, [activationThreshold]);

  // Mostrar indicador de borde temporalmente
  const showTemporaryIndicator = useCallback(() => {
    setShowEdgeIndicator(true);
    
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }
    
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowEdgeIndicator(false);
    }, 2000);
  }, []);

  // Configurar acciones para un borde
  const setEdgeActions = useCallback((edge: EdgePosition, actions: EdgeSwipeAction[]) => {
    setEdgeActionsState(prev => ({
      ...prev,
      [edge]: actions
    }));
  }, []);

  // Limpiar acciones de un borde
  const clearEdgeActions = useCallback((edge: EdgePosition) => {
    setEdgeActionsState(prev => ({
      ...prev,
      [edge]: []
    }));
  }, []);

  // Ejecutar acción del edge
  const executeEdgeAction = useCallback((edge: EdgePosition) => {
    const actions = edgeActions[edge];
    if (actions.length > 0) {
      // Por ahora ejecutamos la primera acción, pero podrías implementar
      // un selector si hay múltiples acciones
      actions[0].action();
      
      if (enableHaptics) {
        hapticSuccess();
      }
    }
  }, [edgeActions, enableHaptics, hapticSuccess]);

  // Touch handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const edge = detectEdge(touch.clientX, touch.clientY);

    if (edge && edgeActions[edge].length > 0) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        edge,
        time: Date.now()
      };

      setActiveEdge(edge);
      setIsSwipingFromEdge(true);
      setSwipeProgress(0);

      if (enableHaptics) {
        tap();
      }

      // Mostrar indicador visual
      showTemporaryIndicator();
    }
  }, [enabled, detectEdge, edgeActions, enableHaptics, tap, showTemporaryIndicator]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current || !isSwipingFromEdge) return;

    const touch = e.touches[0];
    const { x: startX, y: startY, edge } = touchStartRef.current;

    if (edge) {
      const progress = calculateProgress(startX, startY, touch.clientX, touch.clientY, edge);
      setSwipeProgress(progress);

      // Haptic feedback en puntos específicos
      if (enableHaptics && progress >= 50 && progress < 60) {
        swipe();
      }

      // Prevenir scroll si hay progreso significativo
      if (progress > 20) {
        e.preventDefault();
      }
    }
  }, [enabled, isSwipingFromEdge, calculateProgress, enableHaptics, swipe]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current || !isSwipingFromEdge) return;

    const { edge } = touchStartRef.current;

    // Si el progreso es suficiente, ejecutar la acción
    if (swipeProgress >= 70 && edge) {
      executeEdgeAction(edge);
    }

    // Reset state
    touchStartRef.current = null;
    setIsSwipingFromEdge(false);
    setActiveEdge(null);
    setSwipeProgress(0);
  }, [enabled, isSwipingFromEdge, swipeProgress, executeEdgeAction]);

  // Configurar event listeners
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

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSwipingFromEdge,
    activeEdge,
    swipeProgress,
    showEdgeIndicator,
    edgeActions,
    setEdgeActions,
    clearEdgeActions
  };
}

// Presets de acciones comunes para edge swipe
export const EdgeSwipePresets = {
  // Navegación principal (lado izquierdo)
  mainNavigation: (): EdgeSwipeAction[] => [
    {
      id: 'menu',
      label: 'Menú Principal',
      icon: '☰',
      action: () => console.log('Open main menu'),
      color: '#2196F3'
    }
  ],

  // Configuración rápida (lado derecho)
  quickSettings: (): EdgeSwipeAction[] => [
    {
      id: 'settings',
      label: 'Configuración',
      icon: '⚙️',
      action: () => console.log('Open settings'),
      color: '#FF9800'
    }
  ],

  // Notificaciones (desde arriba)
  notifications: (): EdgeSwipeAction[] => [
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: '🔔',
      action: () => console.log('Open notifications'),
      color: '#F44336'
    }
  ],

  // Control de reproducción (desde abajo)
  mediaControls: (): EdgeSwipeAction[] => [
    {
      id: 'media',
      label: 'Controles de Media',
      icon: '🎵',
      action: () => console.log('Open media controls'),
      color: '#9C27B0'
    }
  ],

  // Navegación específica para PWA de estudiantes
  studentNavigation: (): EdgeSwipeAction[] => [
    {
      id: 'map',
      label: 'Mapa del Campus',
      icon: '🗺️',
      action: () => window.location.href = '/mapa',
      color: '#4CAF50'
    }
  ],

  // Herramientas rápidas
  quickTools: (): EdgeSwipeAction[] => [
    {
      id: 'camera',
      label: 'Cámara',
      icon: '📷',
      action: () => console.log('Open camera'),
      color: '#607D8B'
    }
  ]
};

export default useEdgeSwipeNavigation;