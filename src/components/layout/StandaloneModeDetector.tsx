'use client';

import { useEffect } from 'react';

/**
 * Hook para detectar y forzar el modo standalone de la PWA
 * Si la app se abre en el navegador, muestra un mensaje sugiriendo instalarla
 */
export default function StandaloneModeDetector() {
  useEffect(() => {
    // Detectar si la app está en modo standalone (instalada como PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://');

    // Guardar el estado en sessionStorage para uso posterior
    if (isStandalone) {
      sessionStorage.setItem('isStandalone', 'true');
      console.log('✅ PWA en modo standalone - Sin barra del navegador');
    } else {
      sessionStorage.setItem('isStandalone', 'false');
      console.log('⚠️ PWA abierta en navegador - Sugiere instalar');
    }

    // Aplicar clase CSS al body según el modo
    if (isStandalone) {
      document.body.classList.add('pwa-standalone');
    } else {
      document.body.classList.add('pwa-browser');
    }

    // Listener para cambios en display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.add('pwa-standalone');
        document.body.classList.remove('pwa-browser');
        sessionStorage.setItem('isStandalone', 'true');
      } else {
        document.body.classList.add('pwa-browser');
        document.body.classList.remove('pwa-standalone');
        sessionStorage.setItem('isStandalone', 'false');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return null; // Este componente no renderiza nada
}
