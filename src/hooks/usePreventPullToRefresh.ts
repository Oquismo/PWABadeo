/**
 * Hook para deshabilitar pull-to-refresh en PWA
 * Previene el comportamiento de recarga al deslizar hacia abajo
 * Mejora la experiencia de app nativa
 */

import { useEffect } from 'react';

export const usePreventPullToRefresh = () => {
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;

    // Prevenir pull-to-refresh en el inicio del touch
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    // Detectar si el usuario está intentando hacer pull-to-refresh
    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        
        // Si estamos en el top de la página y el usuario desliza hacia abajo
        const isAtTop = window.scrollY === 0 || document.documentElement.scrollTop === 0;
        const isPullingDown = diffY > 0;
        
        if (isAtTop && isPullingDown) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        isScrolling = true;
      }
    };

    // Prevenir el comportamiento por defecto del navegador
    const handleTouchEnd = (e: TouchEvent) => {
      isScrolling = false;
    };

    // Opciones para addEventListener con passive: false para poder usar preventDefault
    const options = { passive: false };

    // Agregar event listeners
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
};

export default usePreventPullToRefresh;
