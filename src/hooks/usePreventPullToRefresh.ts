/**
 * Hook para deshabilitar pull-to-refresh en PWA
 * Previene el comportamiento de recarga al deslizar hacia abajo
 * SOLO cuando el usuario está en el top de la página
 */

import { useEffect } from 'react';

export const usePreventPullToRefresh = () => {
  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const diffY = currentY - startY;
      
      // Solo prevenir si estamos en el top Y el usuario desliza hacia abajo
      const isAtTop = window.scrollY <= 0;
      const isPullingDown = diffY > 10; // Umbral de 10px para evitar falsos positivos
      
      // Solo prevenir en el caso específico de pull-to-refresh
      if (isAtTop && isPullingDown) {
        e.preventDefault();
      }
    };

    // Agregar listeners con passive: false solo para touchmove
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
};

export default usePreventPullToRefresh;
