'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client.utils';
import { UserBase } from '@/types/api.types';

export const DEMO_ROLE = 'demo';
export const isDemoUiEnabled = process.env.NEXT_PUBLIC_DEMO_MODE_ENABLED !== 'false';
/** Despliegue "solo demo": rama modo-demo en Vercel o NEXT_PUBLIC_DEMO_ONLY=true. */
export const isDemoOnlyUi =
  process.env.NEXT_PUBLIC_DEMO_ONLY === 'true' ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'modo-demo';
/** Adónde llevar a quien quiere más información desde el despliegue solo demo. */
export const demoMoreInfoUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://badeo.es';

/** Inicia sesión con la cuenta demo de solo lectura. */
export function useDemoLogin() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDemo = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ user: UserBase }>('/api/auth/demo');
      if (!res.success || !res.data?.user) {
        setError(res.error || 'No se pudo iniciar la demo');
        return false;
      }
      // remember = false: la sesión demo vive solo en esta pestaña
      await login(res.data.user, false);
      return true;
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  return { startDemo, loading, error };
}
