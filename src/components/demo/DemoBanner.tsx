'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { useAuth } from '@/context/AuthContext';
import { DEMO_ROLE, isDemoOnlyUi, demoMoreInfoUrl } from './useDemoLogin';

/**
 * Aviso flotante visible solo para la cuenta demo.
 * También muestra un mensaje cuando el servidor bloquea un cambio (modo solo lectura).
 */
export default function DemoBanner() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const isDemo = user?.role === DEMO_ROLE;

  // Detecta las respuestas bloqueadas por el middleware (cabecera x-demo-readonly)
  useEffect(() => {
    if (!isDemo || typeof window === 'undefined') return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 403 && res.headers.get('x-demo-readonly')) setBlocked(true);
      return res;
    };
    return () => { window.fetch = originalFetch; };
  }, [isDemo]);

  if (!isDemo) return null;

  const exit = (to: string) => {
    logout();
    router.push(to);
  };

  return (
    <>
      <Box
        role="status"
        sx={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)', zIndex: 1200,
          display: 'flex', alignItems: 'center', gap: 1, pl: 1.5, pr: 0.5, py: 0.5,
          borderRadius: '9999px', bgcolor: 'text.primary', color: 'background.paper',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)', maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <VisibilityOutlined sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Modo demo
        </Typography>
        {isDemoOnlyUi ? (
          <Button
            size="small" component="a" href={demoMoreInfoUrl} target="_blank" rel="noopener"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '9999px', color: 'primary.main', minWidth: 0 }}
          >
            Conocer BADEO
          </Button>
        ) : (
          <>
            <Button
              size="small" onClick={() => exit('/registro')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '9999px', color: 'primary.main', minWidth: 0 }}
            >
              Crear cuenta
            </Button>
            <Button
              size="small" onClick={() => exit('/login')}
              sx={{ textTransform: 'none', borderRadius: '9999px', color: 'inherit', opacity: 0.75, minWidth: 0 }}
            >
              Salir
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={blocked} autoHideDuration={3500} onClose={() => setBlocked(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setBlocked(false)} sx={{ borderRadius: 3 }}>
          Estás en modo demo: los cambios no se guardan.
        </Alert>
      </Snackbar>
    </>
  );
}
