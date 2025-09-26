"use client";

import { Container, Typography, Box, Stack, CircularProgress, Grid, Divider } from '@mui/material';
import M3Button from '@/components/ui/M3Button';
import MaterialSwitch from '@/components/MaterialSwitch';
import { useState } from 'react';
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeContext } from '@/context/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuth } from '@/context/AuthContext';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import VibrationIcon from '@mui/icons-material/Vibration';
import GTranslateRoundedIcon from '@mui/icons-material/GTranslateRounded';

export default function AjustesPage() {
  const { t } = useTranslation();

  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    needsLogin,
    serviceWorkerReady,
    subscribeToPush,
    unsubscribeFromPush,
    checkPermissions
  } = usePushNotifications();
  
  const {
    isSupported: hapticsSupported,
    isEnabled: hapticsEnabled,
    setEnabled: setHapticsEnabled,
    success: hapticSuccess,
    buttonClick: hapticButtonClick
  } = useHaptics();

  const themeContext = useThemeContext();
  const { user, isLoading: authLoading } = useAuth();

  if (!themeContext || authLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 4, position: 'relative' }}>
          {/* Título principal oculto visualmente, accesible para screen readers */}
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
              whiteSpace: 'nowrap'
            }}
          >
            {t('pages.profile.settings')}
          </Typography>
          <Typography variant="body2" color="text.secondary">{t('settings.languageDescription')}</Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Notificaciones */}
          <Grid item xs={12} md={6}>
            <Material3ElevatedCard interactive sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <NotificationsActiveRoundedIcon sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{t('pages.profile.notifications')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {needsLogin
                      ? t('settings.loginRequired') || 'Debes iniciar sesión para activar las notificaciones'
                      : !isSupported
                        ? t('settings.pushNotSupported') || 'Tu navegador no soporta notificaciones push.'
                        : t('settings.pushExplainer') || 'Activa las notificaciones para recibir avisos importantes.'}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MaterialSwitch
                    checked={isSubscribed}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        await subscribeToPush();
                        if (isSubscribed) await hapticSuccess();
                      } else {
                        await unsubscribeFromPush();
                        await hapticButtonClick();
                      }
                    }}
                    disabled={!isSupported || isLoading || needsLogin || !serviceWorkerReady}
                    inputProps={{ 'aria-label': t('pages.profile.notifications') }}
                  />
                </Stack>
              </Stack>
            </Material3ElevatedCard>
          </Grid>

          {/* Haptics */}
          {hapticsSupported && (
            <Grid item xs={12} md={6}>
              <Material3ElevatedCard interactive sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <VibrationIcon sx={{ fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{t('notifications.vibration') || 'Vibraciones hápticas'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {hapticsEnabled
                        ? t('notifications.vibrationEnabled')
                        : t('notifications.vibrationDisabled')}
                    </Typography>
                  </Box>
                  <MaterialSwitch
                    checked={hapticsEnabled}
                    onChange={async (e) => {
                      setHapticsEnabled(e.target.checked);
                      if (e.target.checked) await hapticSuccess();
                    }}
                    inputProps={{ 'aria-label': t('notifications.vibration') }}
                  />
                </Stack>
              </Material3ElevatedCard>
            </Grid>
          )}

          {/* Idioma */}
          <Grid item xs={12} md={6}>
            <Material3ElevatedCard interactive sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <GTranslateRoundedIcon sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{t('settings.language') || 'Idioma'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t('settings.languageDescription')}</Typography>
                </Box>
                <GlobalLanguageSwitch />
              </Stack>
            </Material3ElevatedCard>
          </Grid>

          {/* Account / Privacy */}
          <Grid item xs={12} md={6}>
            <Material3ElevatedCard interactive sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonRoundedIcon sx={{ fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700}>{t('pages.profile.personalInfo') || 'Cuenta y privacidad'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t('settings.accountExplainer') || 'Gestiona tu cuenta, privacidad y datos guardados.'}</Typography>
                </Box>
                <M3Button m3variant="outlined" size="small" href="/perfil">{t('pages.profile.editProfile') || 'Editar perfil'}</M3Button>
              </Stack>
            </Material3ElevatedCard>
          </Grid>

        </Grid>

        <Box sx={{ mt: 4 }}>
          <Divider />
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <M3Button m3variant="text">{t('common.close') || 'Cerrar'}</M3Button>
            <M3Button m3variant="filled">{t('common.save') || 'Guardar'}</M3Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
