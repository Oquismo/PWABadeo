/**
 * Hook para Long Press Menus con contexto inteligente
 * Genera menús contextuales adaptativos según el elemento y estado
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface LongPressOptions {
  enabled?: boolean;
  duration?: number; // ms para activar long press
  enableHaptics?: boolean;
  preventContextMenu?: boolean; // Prevenir menú nativo del navegador
  tolerance?: number; // Píxeles de tolerancia para movimiento
}

interface LongPressReturn {
  isLongPressing: boolean;
  menuVisible: boolean;
  menuPosition: ContextMenuPosition | null;
  menuItems: ContextMenuItem[];
  showMenu: (items: ContextMenuItem[], position: ContextMenuPosition) => void;
  hideMenu: () => void;
  bindLongPress: (items: ContextMenuItem[] | (() => ContextMenuItem[])) => {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
}

export function useLongPressMenu(options: LongPressOptions = {}): LongPressReturn {
  const {
    enabled = true,
    duration = 500,
    enableHaptics = true,
    preventContextMenu = true,
    tolerance = 10
  } = options;

  const { tap, buttonClick, success: hapticSuccess } = useHaptics();

  const [isLongPressing, setIsLongPressing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<ContextMenuPosition | null>(null);
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const currentItemsRef = useRef<ContextMenuItem[] | (() => ContextMenuItem[])>([]);

  // Limpiar timeout
  const clearLongPressTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Mostrar menú contextual
  const showMenu = useCallback((items: ContextMenuItem[], position: ContextMenuPosition) => {
    setMenuItems(items);
    setMenuPosition(position);
    setMenuVisible(true);
    
    if (enableHaptics) {
      hapticSuccess();
    }
  }, [enableHaptics, hapticSuccess]);

  // Ocultar menú contextual
  const hideMenu = useCallback(() => {
    setMenuVisible(false);
    setMenuPosition(null);
    setMenuItems([]);
    setIsLongPressing(false);
  }, []);

  // Calcular posición del menú evitando desbordamiento
  const calculateMenuPosition = useCallback((clientX: number, clientY: number): ContextMenuPosition => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 200; // Ancho estimado del menú
    const menuHeight = 300; // Alto máximo estimado del menú

    let x = clientX;
    let y = clientY;

    // Ajustar posición horizontal
    if (x + menuWidth > viewportWidth - 20) {
      x = viewportWidth - menuWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }

    // Ajustar posición vertical
    if (y + menuHeight > viewportHeight - 20) {
      y = clientY - menuHeight;
    }
    if (y < 20) {
      y = 20;
    }

    return { x, y };
  }, []);

  // Verificar si el movimiento está dentro de la tolerancia
  const isWithinTolerance = useCallback((clientX: number, clientY: number): boolean => {
    if (!startPositionRef.current) return false;
    
    const deltaX = Math.abs(clientX - startPositionRef.current.x);
    const deltaY = Math.abs(clientY - startPositionRef.current.y);
    
    return deltaX <= tolerance && deltaY <= tolerance;
  }, [tolerance]);

  // Iniciar long press
  const startLongPress = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;

    startPositionRef.current = { x: clientX, y: clientY };
    setIsLongPressing(true);

    if (enableHaptics) {
      tap();
    }

    timeoutRef.current = setTimeout(() => {
      const items = typeof currentItemsRef.current === 'function' 
        ? currentItemsRef.current() 
        : currentItemsRef.current;
      
      if (items.length > 0) {
        const position = calculateMenuPosition(clientX, clientY);
        showMenu(items, position);
      }
    }, duration);
  }, [enabled, enableHaptics, tap, duration, calculateMenuPosition, showMenu]);

  // Cancelar long press
  const cancelLongPress = useCallback(() => {
    clearLongPressTimeout();
    setIsLongPressing(false);
    startPositionRef.current = null;
  }, [clearLongPressTimeout]);

  // Finalizar long press
  const endLongPress = useCallback(() => {
    clearLongPressTimeout();
    setIsLongPressing(false);
    startPositionRef.current = null;
  }, [clearLongPressTimeout]);

  // Bind handlers para mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo botón principal (izquierdo)
    if (e.button !== 0) return;
    
    startLongPress(e.clientX, e.clientY);
  }, [startLongPress]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    endLongPress();
  }, [endLongPress]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    cancelLongPress();
  }, [cancelLongPress]);

  // Bind handlers para touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  }, [startLongPress]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    endLongPress();
  }, [endLongPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (!isWithinTolerance(touch.clientX, touch.clientY)) {
      cancelLongPress();
    }
  }, [isWithinTolerance, cancelLongPress]);

  // Prevenir menú contextual nativo
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (preventContextMenu) {
      e.preventDefault();
    }
  }, [preventContextMenu]);

  // Función para bindear a elementos
  const bindLongPress = useCallback((items: ContextMenuItem[] | (() => ContextMenuItem[])) => {
    currentItemsRef.current = items;
    
    return {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      onContextMenu: handleContextMenu
    };
  }, [handleMouseDown, handleMouseUp, handleMouseLeave, handleTouchStart, handleTouchEnd, handleTouchMove, handleContextMenu]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearLongPressTimeout();
    };
  }, [clearLongPressTimeout]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (!menuVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      hideMenu();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuVisible, hideMenu]);

  return {
    isLongPressing,
    menuVisible,
    menuPosition,
    menuItems,
    showMenu,
    hideMenu,
    bindLongPress
  };
}

// Presets de menús contextuales comunes
export const ContextMenuPresets = {
  // Menú para elementos de navegación
  navigation: (currentRoute: string) => [
    {
      id: 'refresh',
      label: 'Actualizar',
      icon: '🔄',
      action: () => window.location.reload()
    },
    {
      id: 'home',
      label: 'Ir al Inicio',
      icon: '🏠',
      action: () => window.location.href = '/',
      disabled: currentRoute === '/'
    },
    {
      id: 'back',
      label: 'Volver',
      icon: '⬅️',
      action: () => window.history.back()
    }
  ],

  // Menú para contenido compartible
  shareable: (title: string, url: string) => [
    {
      id: 'share',
      label: 'Compartir',
      icon: '📤',
      action: async () => {
        if (navigator.share) {
          await navigator.share({ title, url });
        } else {
          await navigator.clipboard.writeText(url);
        }
      }
    },
    {
      id: 'copy',
      label: 'Copiar enlace',
      icon: '📋',
      action: () => navigator.clipboard.writeText(url)
    },
    {
      id: 'bookmark',
      label: 'Guardar',
      icon: '⭐',
      action: () => console.log('Bookmark:', title)
    }
  ],

  // Menú para elementos editables
  editable: (onEdit?: () => void, onDelete?: () => void) => [
    ...(onEdit ? [{
      id: 'edit',
      label: 'Editar',
      icon: '✏️',
      action: onEdit
    }] : []),
    {
      id: 'duplicate',
      label: 'Duplicar',
      icon: '📄',
      action: () => console.log('Duplicate')
    },
    ...(onDelete ? [{
      id: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      action: onDelete,
      destructive: true
    }] : [])
  ]
};

export default useLongPressMenu;