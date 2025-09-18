/**
 * Sistema avanzado de notificaciones push para PWA
 * Soporta acciones, categorización, scheduling y gestión de permisos
 */

import { useState, useEffect, useCallback } from 'react';

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
  data?: any;
  timestamp?: number;
  category?: 'announcement' | 'reminder' | 'update' | 'social' | 'system';
  priority?: 'low' | 'default' | 'high';
}

export interface ScheduledNotification extends NotificationOptions {
  id: string;
  scheduledTime: number;
  recurring?: {
    interval: number; // en minutos
    maxOccurrences?: number;
  };
}

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (options: NotificationOptions) => Promise<void>;
  scheduleNotification: (notification: ScheduledNotification) => void;
  cancelScheduledNotification: (id: string) => void;
  getScheduledNotifications: () => ScheduledNotification[];
  clearAllScheduled: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  // Verificar soporte y permisos
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

  // Cargar notificaciones programadas desde localStorage
    const saved = localStorage.getItem('scheduled-notifications');
    console.log('🔧 useNotifications: Notificaciones programadas guardadas:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔧 useNotifications: Notificaciones programadas parseadas:', parsed);
        setScheduledNotifications(parsed);
      } catch (error) {
        console.error('❌ useNotifications: Error loading scheduled notifications:', error);
      }
    }
  }, []);

  // Solicitar permisos
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  // Enviar notificación inmediata
  const sendNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not supported or permission denied');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || '/icons/icon_192x192.png',
        badge: options.badge || '/icons/icon_192x192.png',
        tag: options.tag || `notification-${Date.now()}`,
        requireInteraction: options.requireInteraction ?? true,
        silent: options.silent ?? false,
        actions: options.actions,
        data: {
          ...options.data,
          image: options.image,
          category: options.category,
          priority: options.priority,
          timestamp: options.timestamp || Date.now()
        },
        vibrate: [200, 100, 200],
      };

      await registration.showNotification(options.title, notificationOptions);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported, permission]);

  // Programar notificación
  const scheduleNotification = useCallback((notification: ScheduledNotification) => {
    const updated = [...scheduledNotifications, notification];
    setScheduledNotifications(updated);
    localStorage.setItem('scheduled-notifications', JSON.stringify(updated));

    // Configurar timeout
    const delay = notification.scheduledTime - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        sendNotification(notification);
        // Manejar recurrencia
        if (notification.recurring) {
          const nextTime = notification.scheduledTime + (notification.recurring.interval * 60 * 1000);
          const updatedNotification = {
            ...notification,
            scheduledTime: nextTime
          };

          if (!notification.recurring.maxOccurrences ||
              notification.recurring.maxOccurrences > 1) {
            scheduleNotification({
              ...updatedNotification,
              recurring: notification.recurring.maxOccurrences
                ? { ...notification.recurring, maxOccurrences: notification.recurring.maxOccurrences - 1 }
                : notification.recurring
            });
          }
        }

        // Remover de la lista programada
        cancelScheduledNotification(notification.id);
      }, delay);
    }
  }, [scheduledNotifications, sendNotification]);

  // Cancelar notificación programada
  const cancelScheduledNotification = useCallback((id: string) => {
    const updated = scheduledNotifications.filter(n => n.id !== id);
    setScheduledNotifications(updated);
    localStorage.setItem('scheduled-notifications', JSON.stringify(updated));
  }, [scheduledNotifications]);

  // Obtener notificaciones programadas
  const getScheduledNotifications = useCallback(() => {
    return scheduledNotifications;
  }, [scheduledNotifications]);

  // Limpiar todas las programadas
  const clearAllScheduled = useCallback(() => {
    setScheduledNotifications([]);
    localStorage.removeItem('scheduled-notifications');
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleNotification,
    cancelScheduledNotification,
    getScheduledNotifications,
    clearAllScheduled
  };
}

// Funciones de utilidad para tipos específicos de notificaciones
export const NotificationPresets = {
  // Notificación de bienvenida
  welcome: (userName: string): NotificationOptions => ({
    title: `¡Bienvenido, ${userName}!`,
    body: 'Tu cuenta ha sido configurada correctamente. Explora la app y descubre todas las funcionalidades.',
    icon: '/icons/icon_192x192.png',
    category: 'system',
    priority: 'high',
    actions: [
      { action: 'explore', title: 'Explorar' },
      { action: 'profile', title: 'Ver perfil' }
    ]
  }),

  // Recordatorio de evento
  eventReminder: (eventTitle: string, timeUntil: string): NotificationOptions => ({
    title: 'Recordatorio de evento',
    body: `${eventTitle} comienza en ${timeUntil}`,
    icon: '/icons/icon_192x192.png',
    category: 'reminder',
    priority: 'high',
    actions: [
      { action: 'view', title: 'Ver evento' },
      { action: 'dismiss', title: 'Descartar' }
    ]
  }),

  // Nuevo anuncio
  newAnnouncement: (title: string, preview: string): NotificationOptions => ({
    title: 'Nuevo anuncio',
    body: preview,
    icon: '/icons/icon_192x192.png',
    category: 'announcement',
    priority: 'default',
    actions: [
      { action: 'view', title: 'Ver anuncio' },
      { action: 'mark_read', title: 'Marcar como leído' }
    ]
  }),

  // Actualización de la app
  appUpdate: (version: string): NotificationOptions => ({
    title: 'App actualizada',
    body: `Nueva versión ${version} disponible. Descubre las nuevas funcionalidades.`,
    icon: '/icons/icon_192x192.png',
    category: 'update',
    priority: 'default',
    actions: [
      { action: 'update', title: 'Actualizar ahora' },
      { action: 'later', title: 'Más tarde' }
    ]
  }),

  // Mensaje social
  socialMessage: (from: string, message: string): NotificationOptions => ({
    title: `Mensaje de ${from}`,
    body: message,
    icon: '/icons/icon_192x192.png',
    category: 'social',
    priority: 'high',
    actions: [
      { action: 'reply', title: 'Responder' },
      { action: 'view', title: 'Ver conversación' }
    ]
  })
};

export default useNotifications;