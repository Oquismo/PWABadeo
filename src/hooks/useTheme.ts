/**
 * Hook para gestión de temas - Modo Oscuro Constante
 * Siempre retorna modo oscuro para experiencia consistente
 */

import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@mui/material';

export type ThemeMode = 'dark';

interface UseThemeReturn {
  mode: ThemeMode;
  isDark: boolean;
  systemPreference: 'light' | 'dark';
}

export function useTheme(): UseThemeReturn {
  const [mode] = useState<ThemeMode>('dark');
  const systemPreference = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';

  // Siempre retorna modo oscuro
  const isDark = true;

  return {
    mode,
    isDark,
    systemPreference
  };
}

interface UseThemeTransitionReturn {
  isTransitioning: boolean;
  transitionTo: (newMode: ThemeMode) => Promise<void>;
}

export function useThemeTransition(): UseThemeTransitionReturn {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback(async (newMode: ThemeMode) => {
    // Como siempre usamos modo oscuro, no hay transición necesaria
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    transitionTo
  };
}

interface UseReducedMotionReturn {
  prefersReducedMotion: boolean;
}

export function useReducedMotion(): UseReducedMotionReturn {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return { prefersReducedMotion };
}

interface UseHighContrastReturn {
  prefersHighContrast: boolean;
  forcedColors: boolean;
}

export function useHighContrast(): UseHighContrastReturn {
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  const forcedColors = useMediaQuery('(forced-colors: active)');

  return { prefersHighContrast, forcedColors };
}

export default {
  useTheme,
  useThemeTransition,
  useReducedMotion,
  useHighContrast
};