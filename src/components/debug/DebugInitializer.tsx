'use client';

import { useEffect } from 'react';
import DebugMonitor from '../../utils/debugUtils';

export default function DebugInitializer() {
  useEffect(() => {
    // Inicializar el monitor de debug al cargar la aplicación
    const instance = DebugMonitor.getInstance();
    return () => {
      try {
        // Intentar limpiar listeners/intervals cuando el componente se desmonte
        if (instance && typeof (instance as any).destroy === 'function') {
          (instance as any).destroy();
        }
      } catch {}
    };
  }, []);

  return null; // Este componente no renderiza nada
}
