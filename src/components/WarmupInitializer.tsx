'use client';

import { useEffect } from 'react';
import { initializeWarmup } from '@/utils/connectionWarmer';

export default function WarmupInitializer() {
  useEffect(() => {
    // Inicializar warmup solo en producción
    if (process.env.NODE_ENV === 'production') {
      initializeWarmup();
    }
  }, []);

  // Este componente no renderiza nada
  return null;
}
