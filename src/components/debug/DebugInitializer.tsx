'use client';

import { useEffect } from 'react';
import DebugMonitor from '../../utils/debugUtils';

export default function DebugInitializer() {
  useEffect(() => {
    // Inicializar el monitor de debug al cargar la aplicación
    DebugMonitor.getInstance();
  }, []);

  return null; // Este componente no renderiza nada
}
