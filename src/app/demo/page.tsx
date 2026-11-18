'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useDemoLogin, isDemoUiEnabled } from '@/components/demo/useDemoLogin';

/** Enlace directo para compartir: /demo entra automáticamente en la cuenta demo. */
export default function DemoPage() {
  const router = useRouter();
  const { startDemo, error } = useDemoLogin();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !isDemoUiEnabled) return;
    started.current = true;
    startDemo().then((ok) => { if (ok) router.replace('/'); });
  }, [startDemo, router]);

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3, textAlign: 'center' }}>
      <Box component="img" src="/img/Erasmus+_Logo.svg" alt="Mi Erasmus App" sx={{ width: 160, mb: 1 }} />
      {!isDemoUiEnabled ? (
        <Typography>La demo no está disponible en este momento.</Typography>
      ) : error ? (
        <>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={() => router.push('/login')} sx={{ borderRadius: '9999px', textTransform: 'none' }}>
            Ir al inicio de sesión
          </Button>
        </>
      ) : (
        <>
          <CircularProgress />
          <Typography sx={{ fontWeight: 600 }}>Preparando la demo…</Typography>
          <Typography variant="body2" color="text.secondary">
            Vas a ver la app como un estudiante Erasmus+ de ejemplo. Nada de lo que hagas se guarda.
          </Typography>
        </>
      )}
    </Box>
  );
}
