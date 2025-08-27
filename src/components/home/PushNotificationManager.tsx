'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationManager() {
  const {
    isSupported,
    permission,
    requestPermission,
    subscribeToPush
  } = usePushNotifications();

  const [showPrompt, setShowPrompt] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Mostrar prompt si es soportado pero no tiene permiso
    if (isSupported && permission === 'default') {
      // Pequeño delay para no ser demasiado intrusivo
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPush();
      setSnackbarMessage('¡Notificaciones push habilitadas! 🎉');
      setSnackbarOpen(true);
      setShowPrompt(false);
    } else {
      setSnackbarMessage('Permiso de notificaciones denegado');
      setSnackbarOpen(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Recordar que el usuario descartó el prompt
    localStorage.setItem('pushPromptDismissed', 'true');
  };

  // No mostrar si ya se descartó antes
  if (!showPrompt || localStorage.getItem('pushPromptDismissed')) {
    return null;
  }

  if (!isSupported) {
    return null; // No mostrar nada si no está soportado
  }

  return (
    <>
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 1400 }}
      >
        <Alert
          severity="info"
          variant="filled"
          icon={<NotificationsIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleEnableNotifications}
              >
                Habilitar
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleDismiss}
              >
                Después
              </Button>
            </Box>
          }
          sx={{
            minWidth: 350,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            ¿Quieres recibir notificaciones de anuncios?
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Te notificaremos cuando haya nuevos anuncios importantes
          </Typography>
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('🎉') ? 'success' : 'info'}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
