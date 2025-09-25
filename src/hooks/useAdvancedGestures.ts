/**
 * Hook unificado para todos los gestos avanzados
 * Integra pinch-to-zoom, long press menus, edge swipe navigation y 3D touch simulation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import usePinchToZoom from './usePinchToZoom';
import useLongPressMenu, { ContextMenuItem } from './useLongPressMenu';
import useEdgeSwipeNavigation, { EdgeSwipeAction, EdgePosition } from './useEdgeSwipeNavigation';
import use3DTouchSimulation, { PressureLevel } from './use3DTouchSimulation';
import useGestureNavigation from './useGestureNavigation';

// Interfaces locales para opciones
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

interface LongPressOptions {
  enabled?: boolean;
  duration?: number;
  enableHaptics?: boolean;
  preventContextMenu?: boolean;
  tolerance?: number;
}

interface EdgeSwipeOptions {
  enabled?: boolean;
  edgeThreshold?: number;
  activationThreshold?: number;
  enableHaptics?: boolean;
  edges?: EdgePosition[];
}

interface Force3DOptions {
  enabled?: boolean;
  enableHaptics?: boolean;
  showVisualFeedback?: boolean;
  tolerance?: number;
}

interface GestureOptions {
  enabled?: boolean;
  swipeThreshold?: number;
  pullRefreshThreshold?: number;
  enableHaptics?: boolean;
}

interface AdvancedGesturesOptions {
  // Opciones generales
  enabled?: boolean;
  enableHaptics?: boolean;
  
  // Configuración específica de cada gesto
  pinchToZoom?: PinchToZoomOptions & { enabled?: boolean };
  longPress?: LongPressOptions & { enabled?: boolean };
  edgeSwipe?: EdgeSwipeOptions & { enabled?: boolean };
  force3D?: Force3DOptions & { enabled?: boolean };
  navigation?: GestureOptions & { enabled?: boolean };
  
  // Prioridades de gestos (cuando hay conflictos)
  gesturePriorities?: {
    pinchToZoom?: number;
    longPress?: number;
    edgeSwipe?: number;
    force3D?: number;
    navigation?: number;
  };
}

interface AdvancedGesturesReturn {
  // Estados combinados
  isAnyGestureActive: boolean;
  activeGesture: string | null;
  
  // Pinch to Zoom
  pinchToZoom: {
    scale: number;
    isZooming: boolean;
    transformStyle: React.CSSProperties;
    resetZoom: () => void;
    setZoom: (scale: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    bindPinchZoom: (elementRef: React.RefObject<HTMLElement>) => void;
  };
  
  // Long Press Menus
  longPress: {
    isLongPressing: boolean;
    menuVisible: boolean;
    menuPosition: { x: number; y: number } | null;
    menuItems: ContextMenuItem[];
    showMenu: (items: ContextMenuItem[], position: { x: number; y: number }) => void;
    hideMenu: () => void;
    bindLongPress: (items: ContextMenuItem[] | (() => ContextMenuItem[])) => any;
  };
  
  // Edge Swipe Navigation
  edgeSwipe: {
    isSwipingFromEdge: boolean;
    activeEdge: EdgePosition | null;
    swipeProgress: number;
    showEdgeIndicator: boolean;
    setEdgeActions: (edge: EdgePosition, actions: EdgeSwipeAction[]) => void;
    clearEdgeActions: (edge: EdgePosition) => void;
  };
  
  // 3D Touch Simulation
  force3D: {
    isPressed: boolean;
    currentLevel: number;
    visualIntensity: number;
    bind3DTouch: (pressureLevels: PressureLevel[]) => any;
  };
  
  // Navigation Gestures
  navigation: {
    isSwipeActive: boolean;
    swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
    pullProgress: number;
    enableGestures: () => void;
    disableGestures: () => void;
  };
  
  // Control general
  enableAllGestures: () => void;
  disableAllGestures: () => void;
  enableGesture: (gesture: string) => void;
  disableGesture: (gesture: string) => void;
}

export function useAdvancedGestures(
  options: AdvancedGesturesOptions = {}
): AdvancedGesturesReturn {
  const {
    enabled = true,
    enableHaptics = true,
    pinchToZoom: pinchOptions = { enabled: true },
    longPress: longPressOptions = { enabled: true },
    edgeSwipe: edgeSwipeOptions = { enabled: true },
    force3D: force3DOptions = { enabled: true },
    navigation: navigationOptions = { enabled: true },
    gesturePriorities = {
      pinchToZoom: 5,
      longPress: 4,
      edgeSwipe: 3,
      force3D: 2,
      navigation: 1
    }
  } = options;

  // Estados internos
  const [gestureStates, setGestureStates] = useState({
    pinchToZoom: pinchOptions.enabled ?? true,
    longPress: longPressOptions.enabled ?? true,
    edgeSwipe: edgeSwipeOptions.enabled ?? true,
    force3D: force3DOptions.enabled ?? true,
    navigation: navigationOptions.enabled ?? true
  });

  const pinchElementRef = useRef<HTMLElement | null>(null);

  // Inicializar hooks individuales
  const pinchToZoom = usePinchToZoom(
    { current: pinchElementRef.current },
    {
      ...pinchOptions,
      enabled: enabled && gestureStates.pinchToZoom,
      enableHaptics
    }
  );

  const longPress = useLongPressMenu({
    ...longPressOptions,
    enabled: enabled && gestureStates.longPress,
    enableHaptics
  });

  const edgeSwipe = useEdgeSwipeNavigation({
    ...edgeSwipeOptions,
    enabled: enabled && gestureStates.edgeSwipe,
    enableHaptics
  });

  const force3D = use3DTouchSimulation({
    ...force3DOptions,
    enabled: enabled && gestureStates.force3D,
    enableHaptics
  });

  const navigation = useGestureNavigation({
    ...navigationOptions,
    enabled: enabled && gestureStates.navigation,
    enableHaptics
  });

  // Determinar gesto activo
  const activeGesture = (() => {
    const activeGestures: Array<{ name: string; priority: number }> = [];

    if (pinchToZoom.isZooming) {
      activeGestures.push({ name: 'pinchToZoom', priority: gesturePriorities.pinchToZoom || 0 });
    }
    if (longPress.isLongPressing || longPress.menuVisible) {
      activeGestures.push({ name: 'longPress', priority: gesturePriorities.longPress || 0 });
    }
    if (edgeSwipe.isSwipingFromEdge) {
      activeGestures.push({ name: 'edgeSwipe', priority: gesturePriorities.edgeSwipe || 0 });
    }
    if (force3D.isPressed) {
      activeGestures.push({ name: 'force3D', priority: gesturePriorities.force3D || 0 });
    }
    if (navigation.isSwipeActive) {
      activeGestures.push({ name: 'navigation', priority: gesturePriorities.navigation || 0 });
    }

    // Retornar el gesto con mayor prioridad
    return activeGestures.length > 0
      ? activeGestures.sort((a, b) => b.priority - a.priority)[0].name
      : null;
  })();

  const isAnyGestureActive = activeGesture !== null;

  // Funciones de control
  const enableAllGestures = useCallback(() => {
    setGestureStates({
      pinchToZoom: true,
      longPress: true,
      edgeSwipe: true,
      force3D: true,
      navigation: true
    });
  }, []);

  const disableAllGestures = useCallback(() => {
    setGestureStates({
      pinchToZoom: false,
      longPress: false,
      edgeSwipe: false,
      force3D: false,
      navigation: false
    });
  }, []);

  const enableGesture = useCallback((gesture: string) => {
    setGestureStates(prev => ({
      ...prev,
      [gesture]: true
    }));
  }, []);

  const disableGesture = useCallback((gesture: string) => {
    setGestureStates(prev => ({
      ...prev,
      [gesture]: false
    }));
  }, []);

  // Función para bindear pinch to zoom a un elemento
  const bindPinchZoom = useCallback((elementRef: React.RefObject<HTMLElement>) => {
    pinchElementRef.current = elementRef.current;
  }, []);

  // Configurar conflictos entre gestos
  useEffect(() => {
    // Si hay un gesto de alta prioridad activo, temporalmente deshabilitar otros
    const highPriorityActive = activeGesture && (
      activeGesture === 'pinchToZoom' || 
      activeGesture === 'longPress' || 
      activeGesture === 'force3D'
    );

    if (highPriorityActive) {
      // Deshabilitar temporalmente gestos de navegación básica
      navigation.disableGestures();
    } else {
      // Reactivar gestos de navegación si no hay conflictos
      navigation.enableGestures();
    }
  }, [activeGesture, navigation]);

  return {
    // Estados combinados
    isAnyGestureActive,
    activeGesture,

    // Pinch to Zoom
    pinchToZoom: {
      ...pinchToZoom,
      bindPinchZoom
    },

    // Long Press Menus
    longPress,

    // Edge Swipe Navigation
    edgeSwipe,

    // 3D Touch Simulation
    force3D,

    // Navigation Gestures
    navigation,

    // Control general
    enableAllGestures,
    disableAllGestures,
    enableGesture,
    disableGesture
  };
}

// Configuraciones predefinidas para diferentes tipos de componentes
export const GesturePresets = {
  // Para mapas interactivos
  interactiveMap: (): AdvancedGesturesOptions => ({
    pinchToZoom: {
      enabled: true,
      minZoom: 0.5,
      maxZoom: 5,
      smoothZoom: true
    },
    longPress: {
      enabled: true,
      duration: 600
    },
    edgeSwipe: {
      enabled: false // Evitar conflictos con pan del mapa
    },
    force3D: {
      enabled: true,
      showVisualFeedback: false // El mapa ya tiene su propio feedback
    },
    navigation: {
      enabled: false // El mapa maneja su propia navegación
    }
  }),

  // Para listas y contenido scrolleable
  scrollableContent: (): AdvancedGesturesOptions => ({
    pinchToZoom: {
      enabled: false
    },
    longPress: {
      enabled: true,
      duration: 500
    },
    edgeSwipe: {
      enabled: true,
      edges: ['left', 'right']
    },
    force3D: {
      enabled: true
    },
    navigation: {
      enabled: true,
      pullRefreshThreshold: 80
    }
  }),

  // Para elementos multimedia
  mediaViewer: (): AdvancedGesturesOptions => ({
    pinchToZoom: {
      enabled: true,
      minZoom: 0.2,
      maxZoom: 8,
      resetOnDoubleTap: true
    },
    longPress: {
      enabled: true,
      duration: 400
    },
    edgeSwipe: {
      enabled: false
    },
    force3D: {
      enabled: false
    },
    navigation: {
      enabled: false
    }
  }),

  // Para navegación general
  generalNavigation: (): AdvancedGesturesOptions => ({
    pinchToZoom: {
      enabled: false
    },
    longPress: {
      enabled: true,
      duration: 500
    },
    edgeSwipe: {
      enabled: true,
      edges: ['left', 'right']
    },
    force3D: {
      enabled: true
    },
    navigation: {
      enabled: true
    }
  })
};

export default useAdvancedGestures;