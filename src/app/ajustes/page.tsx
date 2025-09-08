'use client';

import { Container, Typography, Box, Paper, Stack, Switch, CircularProgress, IconButton } from '@mui/material';
import { useState } from 'react';
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
import { useThemeContext } from '@/context/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function AjustesPage() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    subscribeToPush,
    unsubscribeFromPush
  } = usePushNotifications();
  // Usamos una variable temporal para el contexto para poder verificarlo
  const themeContext = useThemeContext();
  const { user, isLoading: authLoading } = useAuth();

  // --- SOLUCIÓN: Verificación de seguridad ---
  // Si el contexto aún no está disponible, mostramos un indicador de carga.
  // Esto previene el error de renderizado.
  if (!themeContext || authLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }


  // Solo modo oscuro, extraemos solo mode si se usa, pero no setTheme
  const { mode } = themeContext;

  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  return (
    <Container>
      <Box sx={{ py: 4, position: 'relative' }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2} sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Ajustes
          </Typography>
        </Stack>

        <Paper sx={{ p: 2, mb: 2 }}>
          {isAdmin && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="medium">
                Modo Oscuro (Solo para Administradores)
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                  {/* Eliminado selector de tema: solo modo oscuro disponible */}
              </Stack>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
            <Typography fontWeight="medium">
              Notificaciones push
            </Typography>
            <Switch
              checked={isSubscribed}
              onChange={async (e) => {
                if (e.target.checked) {
                  await subscribeToPush();
                } else {
                  await unsubscribeFromPush();
                }
              }}
              color={isSubscribed ? 'success' : permission === 'denied' ? 'error' : 'primary'}
              disabled={!isSupported || isLoading}
              inputProps={{ 'aria-label': 'Permitir notificaciones push' }}
            />
          </Stack>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: isSubscribed
                ? 'success.main'
                : permission === 'denied'
                  ? 'error.main'
                  : 'text.secondary'
            }}
          >
            {isSubscribed
              ? 'Notificaciones activadas'
              : permission === 'denied'
                ? 'Permiso denegado'
                : 'Pulsa el switch para activar las notificaciones push'}
            {error && (
              <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>
            )}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
