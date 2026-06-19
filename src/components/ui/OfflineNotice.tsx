'use client';

import { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

export default function OfflineNotice() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <Chip
      icon={<WifiOffIcon />}
      label="Modo offline — mostrando datos en caché"
      size="small"
      color="warning"
      sx={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 1400, fontWeight: 600, boxShadow: 3 }}
    />
  );
}
