'use client';

import { useState } from 'react';
import { Button, TextField, Box, Typography, Alert, Paper } from '@mui/material';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationTest() {
  const [title, setTitle] = useState('Prueba de Notificación');
  const [body, setBody] = useState('Esta es una notificación de prueba');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { isSupported, isSubscribed, requestPermission, subscribeToPush } = usePushNotifications();

  const handleSendNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          icon: '/icons/icon_192x192.png'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPush();
    }
  };

  if (!isSupported) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Alert severity="warning">
          Las notificaciones push no están soportadas en este navegador.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Probador de Notificaciones Push
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Estado: {isSubscribed ? '✅ Suscrito' : '❌ No suscrito'}
        </Typography>

        {!isSubscribed && (
          <Button
            variant="contained"
            onClick={handleRequestPermission}
            sx={{ mb: 2 }}
          >
            Solicitar Permiso y Suscribirse
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="Mensaje"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleSendNotification}
        disabled={isLoading || !isSubscribed}
        fullWidth
      >
        {isLoading ? 'Enviando...' : 'Enviar Notificación Push'}
      </Button>

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultado:
          </Typography>
          <Alert severity={result.error ? 'error' : 'success'}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Alert>
        </Box>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Las notificaciones push solo funcionarán si:
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>El navegador soporta notificaciones push</li>
          <li>Has concedido permisos de notificación</li>
          <li>Estás suscrito a las notificaciones</li>
          <li>La aplicación está servida sobre HTTPS (en producción)</li>
        </ul>
      </Alert>
    </Paper>
  );
}
