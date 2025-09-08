import { useState, useEffect, useCallback } from 'react';

interface HapticsOptions {
  enabled?: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
}

interface UseHapticsReturn {
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  vibrate: (pattern?: number | number[]) => Promise<void>;
  success: () => Promise<void>;
  error: () => Promise<void>;
  warning: () => Promise<void>;
  notification: () => Promise<void>;
  tap: () => Promise<void>;
  longPress: () => Promise<void>;
  buttonClick: () => Promise<void>;
  swipe: () => Promise<void>;
}

export function useHaptics(options: HapticsOptions = {}): UseHapticsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Verificar si el dispositivo soporta vibración
    if ('vibrate' in navigator) {
      setIsSupported(true);
    }

    // Cargar preferencia del usuario desde localStorage
    const savedPreference = localStorage.getItem('hapticsEnabled');
    if (savedPreference !== null) {
      setIsEnabled(JSON.parse(savedPreference));
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('hapticsEnabled', JSON.stringify(enabled));
  }, []);

  const vibrate = useCallback(async (pattern: number | number[] = 100) => {
    if (!isSupported || !isEnabled) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Error al ejecutar vibración:', error);
    }
  }, [isSupported, isEnabled]);

  // Patrones predefinidos para diferentes acciones
  const success = useCallback(async () => {
    await vibrate([100, 50, 100]); // Doble vibración corta
  }, [vibrate]);

  const error = useCallback(async () => {
    await vibrate([200, 100, 200, 100, 200]); // Triple vibración larga
  }, [vibrate]);

  const warning = useCallback(async () => {
    await vibrate([150, 100, 150]); // Doble vibración media
  }, [vibrate]);

  const notification = useCallback(async () => {
    await vibrate([50, 50, 50, 50, 100]); // Patrón de notificación
  }, [vibrate]);

  const tap = useCallback(async () => {
    await vibrate(30); // Vibración muy corta para taps
  }, [vibrate]);

  const longPress = useCallback(async () => {
    await vibrate(80); // Vibración media para long press
  }, [vibrate]);

  const buttonClick = useCallback(async () => {
    await vibrate(40); // Vibración corta para botones
  }, [vibrate]);

  const swipe = useCallback(async () => {
    await vibrate(25); // Vibración muy ligera para swipes
  }, [vibrate]);

  return {
    isSupported,
    isEnabled,
    setEnabled,
    vibrate,
    success,
    error,
    warning,
    notification,
    tap,
    longPress,
    buttonClick,
    swipe,
  };
}
