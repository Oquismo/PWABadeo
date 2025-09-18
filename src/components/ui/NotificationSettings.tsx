'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNotifications, ScheduledNotification } from '@/hooks/useNotifications';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptics } from '@/hooks/useHaptics';

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ open, onClose }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    requestPermission,
    refreshPermission,
    getScheduledNotifications,
    cancelScheduledNotification,
    clearAllScheduled
  } = useNotifications();

  const { t } = useTranslation();
  const { buttonClick } = useHaptics();

  const [scheduled, setScheduled] = useState<ScheduledNotification[]>([]);
  const [settings, setSettings] = useState({
    announcements: true,
    reminders: true,
    updates: true,
    social: true,
    system: true,
    sound: true,
    vibration: true
  });

  useEffect(() => {
    if (open) {
      console.log('🔧 NotificationSettings: Abriendo diálogo');
      setScheduled(getScheduledNotifications());
      // Cargar configuraciones guardadas
      const saved = localStorage.getItem('notification-settings');
      if (saved) {
        try {
          const parsedSettings = JSON.parse(saved);
          console.log('🔧 NotificationSettings: Configuraciones cargadas:', parsedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('❌ NotificationSettings: Error loading settings:', error);
        }
      } else {
        console.log('🔧 NotificationSettings: Usando configuraciones por defecto');
      }
    }
  }, [open, getScheduledNotifications]);

  const handleSettingChange = (key: string, value: boolean) => {
    console.log(`🔧 NotificationSettings: Cambiando ${key} de ${settings[key as keyof typeof settings]} a ${value}`);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    buttonClick();
  };

  const handleRequestPermission = async () => {
    try {
      console.log('🔧 NotificationSettings: Solicitando permisos...');
      const result = await requestPermission();
      console.log('🔧 NotificationSettings: Resultado de permisos:', result);

      if (result === 'granted') {
        buttonClick();
        console.log('✅ NotificationSettings: Permisos concedidos');
      } else if (result === 'denied') {
        console.log('❌ NotificationSettings: Permisos denegados');
        // En móviles, mostrar instrucciones para habilitar manualmente
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          console.log('📱 Dispositivo móvil detectado - permisos denegados');
        }
      } else {
        console.log('⚠️ NotificationSettings: Permisos por defecto');
      }
    } catch (error) {
      console.error('❌ NotificationSettings: Error solicitando permisos:', error);
    }
  };

  const handleRefreshPermission = () => {
    console.log('🔧 NotificationSettings: Refrescando permisos manualmente');
    refreshPermission();
    buttonClick();
  };

  const handleCancelScheduled = (id: string) => {
    cancelScheduledNotification(id);
    setScheduled(prev => prev.filter(n => n.id !== id));
    buttonClick();
  };

  const formatScheduledTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = timestamp - now.getTime();

    if (diff < 0) return t('notifications.expired');

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return t('notifications.inDays', { days });
    if (hours > 0) return t('notifications.inHours', { hours });
    if (minutes > 0) return t('notifications.inMinutes', { minutes });

    return t('notifications.soon');
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'announcement': return 'primary';
      case 'reminder': return 'secondary';
      case 'update': return 'info';
      case 'social': return 'success';
      case 'system': return 'warning';
      default: return 'default';
    }
  };

  if (!isSupported) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('notifications.settings')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            {t('notifications.notSupported')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationsIcon />
        {t('notifications.settings')}
      </DialogTitle>

      <DialogContent>
        {/* Estado de permisos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('notifications.permissions')}
          </Typography>

          {permission === 'default' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('notifications.permissionRequired')}
            </Alert>
          )}

          {permission === 'denied' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t('notifications.permissionDenied')}
              <Typography variant="body2" sx={{ mt: 1 }}>
                💡 En móviles: Ve a configuración del navegador → Permisos del sitio → Notificaciones
              </Typography>
            </Alert>
          )}

          {permission === 'granted' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('notifications.permissionGranted')}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            {permission !== 'granted' && (
              <Button
                variant="contained"
                onClick={handleRequestPermission}
                startIcon={<NotificationsIcon />}
                fullWidth
              >
                {t('notifications.enableNotifications')}
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={handleRefreshPermission}
              color="secondary"
              fullWidth
              sx={{ minWidth: { sm: '140px' } }}
            >
              🔄 Refrescar Estado
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Configuraciones por categoría */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('notifications.categories')}
          </Typography>

          <List>
            <ListItem>
              <ListItemText primary={t('notifications.announcements')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.announcements}
                  onChange={(e) => handleSettingChange('announcements', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText primary={t('notifications.reminders')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.reminders}
                  onChange={(e) => handleSettingChange('reminders', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText primary={t('notifications.updates')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.updates}
                  onChange={(e) => handleSettingChange('updates', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText primary={t('notifications.social')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.social}
                  onChange={(e) => handleSettingChange('social', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText primary={t('notifications.system')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.system}
                  onChange={(e) => handleSettingChange('system', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Configuraciones generales */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('notifications.general')}
          </Typography>

          <List>
            <ListItem>
              <ListItemText primary={t('notifications.sound')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText primary={t('notifications.vibration')} />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.vibration}
                  onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Box>

        {/* Notificaciones programadas */}
        {scheduled.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('notifications.scheduled')}
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    clearAllScheduled();
                    setScheduled([]);
                    buttonClick();
                  }}
                  startIcon={<DeleteIcon />}
                >
                  {t('notifications.clearAll')}
                </Button>
              </Box>

              <List>
                {scheduled.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <ScheduleIcon fontSize="small" />
                          <Typography variant="caption">
                            {formatScheduledTime(notification.scheduledTime)}
                          </Typography>
                          {notification.category && (
                            <Chip
                              label={t(`notifications.categories.${notification.category}`)}
                              size="small"
                              color={getCategoryColor(notification.category)}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleCancelScheduled(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}