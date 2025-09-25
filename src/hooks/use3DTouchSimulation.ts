/**
 * Hook para 3D Touch Simulation
 * Simula la funcionalidad de 3D Touch usando long press con diferentes niveles de presión
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHaptics } from './useHaptics';

export interface PressureLevel {
  level: number; // 1-3
  label: string;
  action: () => void;
  hapticType?: 'light' | 'medium' | 'heavy';
}

export interface Force3DOptions {
  enabled?: boolean;
  enableHaptics?: boolean;
  showVisualFeedback?: boolean;
  tolerance?: number; // Tolerancia para movimiento
}

interface Force3DReturn {
  isPressed: boolean;
  currentLevel: number; // 0-3
  visualIntensity: number; // 0-100 para efectos visuales
  bind3DTouch: (pressureLevels: PressureLevel[]) => {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    style?: React.CSSProperties;
  };
}

export function use3DTouchSimulation(options: Force3DOptions = {}): Force3DReturn {
  const {
    enabled = true,
    enableHaptics = true,
    showVisualFeedback = true,
    tolerance = 10
  } = options;

  const { tap, buttonClick, success: hapticSuccess } = useHaptics();

  const [isPressed, setIsPressed] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [visualIntensity, setVisualIntensity] = useState(0);

  const pressStartTimeRef = useRef<number>(0);
  const pressureLevelsRef = useRef<PressureLevel[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const levelTriggeredRef = useRef<boolean[]>([false, false, false]);

  // Duraciones para cada nivel de presión (ms)
  const PRESSURE_TIMINGS = {
    level1: 200,  // Peek
    level2: 500,  // Pop (light press)
    level3: 1000  // Force press (deep press)
  };

  // Limpiar todos los timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  // Verificar si el movimiento está dentro de la tolerancia
  const isWithinTolerance = useCallback((clientX: number, clientY: number): boolean => {
    if (!startPositionRef.current) return false;
    
    const deltaX = Math.abs(clientX - startPositionRef.current.x);
    const deltaY = Math.abs(clientY - startPositionRef.current.y);
    
    return deltaX <= tolerance && deltaY <= tolerance;
  }, [tolerance]);

  // Ejecutar haptic feedback según el nivel
  const triggerHaptic = useCallback((level: number) => {
    if (!enableHaptics) return;

    switch (level) {
      case 1:
        tap(); // Ligero
        break;
      case 2:
        buttonClick(); // Medio
        break;
      case 3:
        hapticSuccess(); // Fuerte
        break;
    }
  }, [enableHaptics, tap, buttonClick, hapticSuccess]);

  // Programar niveles de presión
  const schedulePressureLevels = useCallback(() => {
    clearAllTimeouts();
    levelTriggeredRef.current = [false, false, false];

    // Nivel 1 - Peek (vista previa)
    timeoutsRef.current.push(
      setTimeout(() => {
        if (isPressed && !levelTriggeredRef.current[0]) {
          setCurrentLevel(1);
          setVisualIntensity(33);
          levelTriggeredRef.current[0] = true;
          triggerHaptic(1);
        }
      }, PRESSURE_TIMINGS.level1)
    );

    // Nivel 2 - Pop (acción ligera)
    timeoutsRef.current.push(
      setTimeout(() => {
        if (isPressed && !levelTriggeredRef.current[1]) {
          setCurrentLevel(2);
          setVisualIntensity(66);
          levelTriggeredRef.current[1] = true;
          triggerHaptic(2);
        }
      }, PRESSURE_TIMINGS.level2)
    );

    // Nivel 3 - Force Press (acción completa)
    timeoutsRef.current.push(
      setTimeout(() => {
        if (isPressed && !levelTriggeredRef.current[2]) {
          setCurrentLevel(3);
          setVisualIntensity(100);
          levelTriggeredRef.current[2] = true;
          triggerHaptic(3);
        }
      }, PRESSURE_TIMINGS.level3)
    );
  }, [isPressed, triggerHaptic]);

  // Iniciar presión
  const startPress = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;

    startPositionRef.current = { x: clientX, y: clientY };
    pressStartTimeRef.current = Date.now();
    setIsPressed(true);
    setCurrentLevel(0);
    setVisualIntensity(0);
    
    schedulePressureLevels();
  }, [enabled, schedulePressureLevels]);

  // Finalizar presión
  const endPress = useCallback(() => {
    const pressDuration = Date.now() - pressStartTimeRef.current;
    const finalLevel = currentLevel;

    // Ejecutar acción según el nivel alcanzado
    const pressureLevels = pressureLevelsRef.current;
    const targetLevel = pressureLevels.find(level => level.level === finalLevel);
    
    if (targetLevel && finalLevel > 0) {
      targetLevel.action();
    }

    // Reset
    clearAllTimeouts();
    setIsPressed(false);
    setCurrentLevel(0);
    setVisualIntensity(0);
    startPositionRef.current = null;
    levelTriggeredRef.current = [false, false, false];
  }, [currentLevel, clearAllTimeouts]);

  // Cancelar presión
  const cancelPress = useCallback(() => {
    clearAllTimeouts();
    setIsPressed(false);
    setCurrentLevel(0);
    setVisualIntensity(0);
    startPositionRef.current = null;
    levelTriggeredRef.current = [false, false, false];
  }, [clearAllTimeouts]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    startPress(e.clientX, e.clientY);
  }, [startPress]);

  const handleMouseUp = useCallback(() => {
    endPress();
  }, [endPress]);

  const handleMouseLeave = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPress(touch.clientX, touch.clientY);
  }, [startPress]);

  const handleTouchEnd = useCallback(() => {
    endPress();
  }, [endPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    if (!isWithinTolerance(touch.clientX, touch.clientY)) {
      cancelPress();
    }
  }, [isWithinTolerance, cancelPress]);

  // Función para bindear a elementos
  const bind3DTouch = useCallback((pressureLevels: PressureLevel[]) => {
    pressureLevelsRef.current = pressureLevels;

    const baseStyle: React.CSSProperties = showVisualFeedback ? {
      transform: `scale(${1 + (visualIntensity * 0.001)})`,
      filter: `brightness(${100 + (visualIntensity * 0.2)}%)`,
      boxShadow: `0 ${visualIntensity * 0.1}px ${visualIntensity * 0.2}px rgba(0,0,0,${visualIntensity * 0.003})`,
      transition: isPressed ? 'none' : 'transform 0.2s ease-out, filter 0.2s ease-out, box-shadow 0.2s ease-out'
    } : {};

    return {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchMove: handleTouchMove,
      style: baseStyle
    };
  }, [
    showVisualFeedback,
    visualIntensity,
    isPressed,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove
  ]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    isPressed,
    currentLevel,
    visualIntensity,
    bind3DTouch
  };
}

// Presets de niveles de presión comunes
export const PressureLevelPresets = {
  // Preview y acción rápida
  quickPreview: (onPreview: () => void, onAction: () => void): PressureLevel[] => [
    {
      level: 1,
      label: 'Vista previa',
      action: onPreview,
      hapticType: 'light'
    },
    {
      level: 2,
      label: 'Acción rápida',
      action: onAction,
      hapticType: 'medium'
    }
  ],

  // Navegación contextual
  contextualNav: (onPeek: () => void, onPop: () => void, onForce: () => void): PressureLevel[] => [
    {
      level: 1,
      label: 'Peek',
      action: onPeek,
      hapticType: 'light'
    },
    {
      level: 2,
      label: 'Pop',
      action: onPop,
      hapticType: 'medium'
    },
    {
      level: 3,
      label: 'Force',
      action: onForce,
      hapticType: 'heavy'
    }
  ],

  // Menú contextual progresivo
  progressiveMenu: (onLight: () => void, onMedium: () => void, onHeavy: () => void): PressureLevel[] => [
    {
      level: 1,
      label: 'Opción ligera',
      action: onLight,
      hapticType: 'light'
    },
    {
      level: 2,
      label: 'Opción media',
      action: onMedium,
      hapticType: 'medium'
    },
    {
      level: 3,
      label: 'Opción avanzada',
      action: onHeavy,
      hapticType: 'heavy'
    }
  ],

  // Para elementos del mapa
  mapInteraction: (onInfo: () => void, onNavigate: () => void, onBookmark: () => void): PressureLevel[] => [
    {
      level: 1,
      label: 'Ver información',
      action: onInfo,
      hapticType: 'light'
    },
    {
      level: 2,
      label: 'Navegar aquí',
      action: onNavigate,
      hapticType: 'medium'
    },
    {
      level: 3,
      label: 'Guardar lugar',
      action: onBookmark,
      hapticType: 'heavy'
    }
  ]
};

export default use3DTouchSimulation;