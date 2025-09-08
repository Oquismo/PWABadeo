import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  sendNotification: (title: string, body: string, icon?: string) => Promise<void>;
  registerServiceWorker: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult === 'granted') {
        setError(null);
        return true;
      } else {
        setError('Push notification permission denied');
        return false;
      }
    } catch (err) {
      setError('Error requesting notification permission');
      console.error('Error requesting permission:', err);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as any
      });

      // Send subscription to server
      const userIdRaw = localStorage.getItem('userId');
      console.log('🔍 usePushNotifications: userIdRaw:', userIdRaw);
      console.log('🔍 usePushNotifications: user from context:', user);
      let userId = userIdRaw ? Number(userIdRaw) : null;
      
      // Fallback: intentar obtener el userId del contexto de autenticación
      if (!userId && user?.id) {
        userId = user.id;
        console.log('🔍 usePushNotifications: usando userId del contexto:', userId);
        localStorage.setItem('userId', userId.toString());
      }
      
      console.log('🔍 usePushNotifications: userId final:', userId);
      if (!userId || isNaN(userId)) {
        console.error('❌ usePushNotifications: userId no válido:', { userIdRaw, userId, userFromContext: user });
        setError('No se encontró el userId del usuario. Debes iniciar sesión.');
        setIsLoading(false);
        return;
      }
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        const userIdRaw = localStorage.getItem('userId');
        const userId = userIdRaw ? Number(userIdRaw) : null;
        if (!userId || isNaN(userId)) {
          setError('No se encontró el userId del usuario. Debes iniciar sesión.');
          setIsLoading(false);
          return;
        }
        await fetch('/api/push-subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId
          })
        });
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (title: string, body: string, icon?: string) => {
    if (!isSupported || !isSubscribed) {
      console.warn('Push notifications not supported or not subscribed');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, {
        body,
        icon: icon || '/icons/icon_192x192.png',
        badge: '/icons/icon_192x192.png',
        tag: 'announcement',
        requireInteraction: true
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }, [isSupported, isSubscribed]);

  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      setError('Service workers are not supported');
      return;
    }

    try {
      // Limpiar todos los service workers existentes primero
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        existingRegistrations.map(registration => {
          console.log('Unregistering existing service worker:', registration.scope);
          return registration.unregister();
        })
      );

      // Pequeña pausa para asegurar limpieza completa
      await new Promise(resolve => setTimeout(resolve, 100));

      // Registrar el nuevo service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;
      console.log('Service worker registered successfully after cleanup');
    } catch (err) {
      console.error('Error registering service worker:', err);
      setError('Error registering service worker');
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
    registerServiceWorker
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
