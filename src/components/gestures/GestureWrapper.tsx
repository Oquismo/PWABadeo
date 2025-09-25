/**
 * Componente Wrapper que integra todos los gestos avanzados
 * Proporciona una API unificada para añadir gestos a cualquier componente
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import useAdvancedGestures, { GesturePresets } from '@/hooks/useAdvancedGestures';
import ContextMenu from './ContextMenu';
import EdgeSwipeIndicator from './EdgeSwipeIndicator';
import Force3DIndicator from './Force3DIndicator';
import { ContextMenuItem } from '@/hooks/useLongPressMenu';
import { EdgeSwipeAction, EdgePosition } from '@/hooks/useEdgeSwipeNavigation';
import { PressureLevel } from '@/hooks/use3DTouchSimulation';

export interface GestureWrapperProps {
  children: React.ReactNode;
  
  // Configuración de gestos
  gesturePreset?: 'interactiveMap' | 'scrollableContent' | 'mediaViewer' | 'generalNavigation';
  
  // Long Press
  longPressEnabled?: boolean;
  longPressItems?: ContextMenuItem[] | (() => ContextMenuItem[]);
  
  // Edge Swipe
  edgeSwipeEnabled?: boolean;
  edgeActions?: Partial<Record<EdgePosition, EdgeSwipeAction[]>>;
  
  // 3D Touch
  force3DEnabled?: boolean;
  pressureLevels?: PressureLevel[];
  
  // Pinch to Zoom
  pinchZoomEnabled?: boolean;
  showZoomControls?: boolean;
  
  // Haptic feedback
  enableHaptics?: boolean;
  
  // Props del contenedor
  className?: string;
  style?: React.CSSProperties;
  
  // Callbacks
  onGestureStart?: (gestureType: string) => void;
  onGestureEnd?: (gestureType: string) => void;
}

export interface GestureWrapperRef {
  enableGesture: (gesture: string) => void;
  disableGesture: (gesture: string) => void;
  enableAllGestures: () => void;
  disableAllGestures: () => void;
  getCurrentGesture: () => string | null;
}

const GestureWrapper = forwardRef<GestureWrapperRef, GestureWrapperProps>(({
  children,
  gesturePreset,
  longPressEnabled = true,
  longPressItems = [],
  edgeSwipeEnabled = true,
  edgeActions = {},
  force3DEnabled = true,
  pressureLevels = [],
  pinchZoomEnabled = false,
  showZoomControls = false,
  enableHaptics = true,
  className,
  style,
  onGestureStart,
  onGestureEnd,
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentEdgeActions, setCurrentEdgeActions] = React.useState<Partial<Record<EdgePosition, EdgeSwipeAction[]>>>(edgeActions);
  
  // Configurar opciones basadas en preset
  const gestureOptions = gesturePreset 
    ? GesturePresets[gesturePreset]()
    : {
        pinchToZoom: { enabled: pinchZoomEnabled, enableHaptics },
        longPress: { enabled: longPressEnabled, enableHaptics },
        edgeSwipe: { enabled: edgeSwipeEnabled, enableHaptics },
        force3D: { enabled: force3DEnabled, enableHaptics }
      };

  const {
    isAnyGestureActive,
    activeGesture,
    pinchToZoom,
    longPress,
    edgeSwipe,
    force3D,
    enableAllGestures,
    disableAllGestures,
    enableGesture,
    disableGesture
  } = useAdvancedGestures(gestureOptions);

  // Configurar acciones de edge swipe
  React.useEffect(() => {
    Object.entries(edgeActions).forEach(([edge, actions]) => {
      if (actions && actions.length > 0) {
        edgeSwipe.setEdgeActions(edge as EdgePosition, actions);
        setCurrentEdgeActions(prev => ({
          ...prev,
          [edge]: actions
        }));
      }
    });
  }, [edgeActions, edgeSwipe]);

  // Bind pinch to zoom al contenedor
  React.useEffect(() => {
    if (pinchZoomEnabled && containerRef.current) {
      pinchToZoom.bindPinchZoom(containerRef);
    }
  }, [pinchZoomEnabled, pinchToZoom]);

  // Callbacks de gestos
  React.useEffect(() => {
    if (activeGesture && onGestureStart) {
      onGestureStart(activeGesture);
    }
    
    return () => {
      if (activeGesture && onGestureEnd) {
        onGestureEnd(activeGesture);
      }
    };
  }, [activeGesture, onGestureStart, onGestureEnd]);

  // Expose API through ref
  useImperativeHandle(ref, () => ({
    enableGesture,
    disableGesture,
    enableAllGestures,
    disableAllGestures,
    getCurrentGesture: () => activeGesture
  }));

  // Preparar props para long press
  const longPressProps = longPressEnabled && Array.isArray(longPressItems) 
    ? longPress.bindLongPress(longPressItems)
    : longPressEnabled && typeof longPressItems === 'function'
    ? longPress.bindLongPress(longPressItems)
    : {};

  // Preparar props para 3D touch
  const force3DProps = force3DEnabled && pressureLevels.length > 0
    ? force3D.bind3DTouch(pressureLevels)
    : {};

  return (
    <>
      <Box
        ref={containerRef}
        className={className}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          touchAction: pinchZoomEnabled ? 'none' : 'auto',
          ...style,
          // Aplicar estilos de transformación si hay pinch zoom
          ...(pinchZoomEnabled ? pinchToZoom.transformStyle : {}),
          // Aplicar estilos de 3D touch
          ...force3DProps.style
        }}
        {...longPressProps}
        {...(force3DProps.onTouchStart && {
          onTouchStart: (e: React.TouchEvent) => {
            longPressProps.onTouchStart?.(e);
            force3DProps.onTouchStart?.(e);
          }
        })}
        {...(force3DProps.onTouchEnd && {
          onTouchEnd: (e: React.TouchEvent) => {
            longPressProps.onTouchEnd?.(e);
            force3DProps.onTouchEnd?.(e);
          }
        })}
        {...(force3DProps.onTouchMove && {
          onTouchMove: (e: React.TouchEvent) => {
            longPressProps.onTouchMove?.(e);
            force3DProps.onTouchMove?.(e);
          }
        })}
        {...props}
      >
        {children}
      </Box>

      {/* Context Menu para Long Press */}
      <ContextMenu
        visible={longPress.menuVisible}
        position={longPress.menuPosition}
        items={longPress.menuItems}
        onClose={longPress.hideMenu}
        onItemClick={() => {}} // Ya se maneja en el item.action
      />

      {/* Indicador de Edge Swipe */}
      <EdgeSwipeIndicator
        visible={edgeSwipe.showEdgeIndicator || edgeSwipe.isSwipingFromEdge}
        edge={edgeSwipe.activeEdge}
        progress={edgeSwipe.swipeProgress}
        actions={edgeSwipe.activeEdge ? currentEdgeActions[edgeSwipe.activeEdge] || [] : []}
        isActive={edgeSwipe.isSwipingFromEdge}
      />

      {/* Indicador de 3D Touch */}
      <Force3DIndicator
        visible={force3D.isPressed}
        level={force3D.currentLevel}
        intensity={force3D.visualIntensity}
      />
    </>
  );
});

GestureWrapper.displayName = 'GestureWrapper';

export default GestureWrapper;