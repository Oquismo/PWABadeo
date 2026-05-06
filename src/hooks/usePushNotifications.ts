import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import loggerClient from '@/lib/loggerClient';

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
  needsLogin: boolean;
  serviceWorkerReady: boolean;
  requestPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  sendNotification: (title: string, body: string, icon?: string) => Promise<void>;
  registerServiceWorker: () => Promise<void>;
  checkPermissions: () => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    loggerClient.debug('🔧 usePushNotifications: Inicializando hook de notificaciones');
    
    // Check if push notifications are supported
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;
    const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
    
    loggerClient.debug('🔍 usePushNotifications: Verificación de APIs:', {
      serviceWorker: hasServiceWorker,
      pushManager: hasPushManager,
      notification: hasNotification,
      secureContext: isSecureContext,
      protocol: location.protocol,
      hostname: location.hostname
    });
    
    if (hasServiceWorker && hasPushManager && hasNotification) {
      if (isSecureContext) {
        setIsSupported(true);
        setPermission(Notification.permission);
        loggerClient.debug('✅ usePushNotifications: Push notifications soportadas, permiso actual:', Notification.permission);
        
        // Check if service worker is ready
        navigator.serviceWorker.ready.then(() => {
          setServiceWorkerReady(true);
          loggerClient.debug('✅ usePushNotifications: Service worker listo');
          checkSubscriptionStatus();
        }).catch((err) => {
          loggerClient.error('❌ usePushNotifications: Service worker no listo:', err);
          setServiceWorkerReady(false);
          setError('Service Worker no está disponible. Inténtalo recargando la página.');
        });
      } else {
        setIsSupported(false);
        setError(`Estás accediendo desde ${location.hostname} usando HTTP. Las notificaciones push requieren HTTPS o localhost. Opciones: 1) Usa http://localhost:3000, 2) Configura HTTPS local (ver scripts/setup-https.bat)`);
        loggerClient.warn('❌ usePushNotifications: Contexto no seguro');
      }
    } else {
      setIsSupported(false);
      const missingAPIs = [];
      if (!hasServiceWorker) missingAPIs.push('Service Worker');
      if (!hasPushManager) missingAPIs.push('Push Manager');
      if (!hasNotification) missingAPIs.push('Notification API');
      
      setError(`Tu navegador no soporta las siguientes APIs necesarias: ${missingAPIs.join(', ')}. Tu navegador: ${navigator.userAgent.substring(0, 50)}...`);
      loggerClient.error('❌ usePushNotifications: APIs faltantes:', missingAPIs, {
        userAgent: navigator.userAgent,
        hasServiceWorker,
        hasPushManager,
        hasNotification,
        isSecureContext
      });
    }
    
    // Check if user is logged in
    if (!user) {
      setNeedsLogin(true);
      loggerClient.debug('⚠️ usePushNotifications: Usuario no logueado');
    } else {
      setNeedsLogin(false);
      loggerClient.debug('✅ usePushNotifications: Usuario logueado:', user.email);
    }
  }, [user]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      loggerClient.error('Error checking subscription status:', err);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      loggerClient.error('❌ usePushNotifications: Intentando solicitar permisos sin soporte');
      // El error ya se establece en el useEffect, no lo sobrescribimos
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult === 'granted') {
        setError(null);
        loggerClient.debug('✅ usePushNotifications: Permisos concedidos');
        return true;
      } else if (permissionResult === 'denied') {
        setError('Los permisos de notificación fueron denegados. Para activar las notificaciones, ve a la configuración de tu navegador y permite las notificaciones para este sitio.');
        loggerClient.warn('❌ usePushNotifications: Permisos denegados');
        return false;
      } else {
        setError('Los permisos de notificación están en estado predeterminado. Inténtalo de nuevo.');
        loggerClient.debug('⚠️ usePushNotifications: Permisos en estado predeterminado');
        return false;
      }
    } catch (err) {
      setError('Error al solicitar permisos de notificación. Revisa la configuración de tu navegador.');
        loggerClient.error('❌ usePushNotifications: Error solicitando permisos:', err);
      return false;
    }
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    loggerClient.debug('🚀 usePushNotifications: Iniciando suscripción a push');
    if (!isSupported) {
      loggerClient.error('❌ usePushNotifications: Push notifications no soportadas, cancelando suscripción');
      // El error ya se establece en el useEffect
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      loggerClient.debug('🔐 usePushNotifications: Solicitando permisos...');
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        loggerClient.warn('❌ usePushNotifications: Permisos denegados');
        return;
      }
      loggerClient.debug('✅ usePushNotifications: Permisos concedidos');

      loggerClient.debug('🔧 usePushNotifications: Usando service worker existente...');
      // Usar el service worker de next-pwa (sw.js) ya registrado
      const registration = await navigator.serviceWorker.ready;
      loggerClient.debug('✅ usePushNotifications: Service worker listo');

      loggerClient.debug('📡 usePushNotifications: Creando suscripción push...');
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as any
      });
      loggerClient.debug('✅ usePushNotifications: Suscripción push creada');

      // Send subscription to server
      const userIdRaw = localStorage.getItem('userId');
          loggerClient.debug('🔍 usePushNotifications: userIdRaw:', userIdRaw);
          loggerClient.debug('🔍 usePushNotifications: user from context:', user);
      let userId = userIdRaw ? Number(userIdRaw) : null;
      
      // Fallback: intentar obtener el userId del contexto de autenticación
      if (!userId && user?.id) {
        userId = user.id;
            loggerClient.debug('🔍 usePushNotifications: usando userId del contexto:', userId);
        localStorage.setItem('userId', userId.toString());
      }
      
          loggerClient.debug('🔍 usePushNotifications: userId final:', userId);
          if (!userId || isNaN(userId)) {
            loggerClient.error('❌ usePushNotifications: userId no válido:', { userIdRaw, userId, userFromContext: user });
        setError('No se encontró el ID del usuario. Asegúrate de estar conectado a tu cuenta.');
        setIsLoading(false);
        return;
      }

      loggerClient.debug('📤 usePushNotifications: Enviando suscripción al servidor...');
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
      loggerClient.debug('✅ usePushNotifications: Suscripción guardada en servidor');

      setIsSubscribed(true);
      loggerClient.info('🎉 usePushNotifications: Suscripción completada exitosamente');
    } catch (err) {
      loggerClient.error('❌ usePushNotifications: Error en suscripción:', err);
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
          setError('No se encontró el ID del usuario. Asegúrate de estar conectado a tu cuenta.');
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
      loggerClient.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const sendNotification = useCallback(async (title: string, body: string, icon?: string) => {
    if (!isSupported || !isSubscribed) {
      loggerClient.warn('Push notifications not supported or not subscribed');
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
      loggerClient.error('Error sending notification:', err);
    }
  }, [isSupported, isSubscribed]);

  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      setError('Service workers are not supported');
      return;
    }

    try {
      // Registrar el service worker de next-pwa si aún no está registrado
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hasBadeoSW = registrations.some(r => r.scope.includes(location.origin));
      if (!hasBadeoSW) {
        await navigator.serviceWorker.register('/sw.js');
      }
      await navigator.serviceWorker.ready;
      loggerClient.info('Service worker registrado correctamente');
    } catch (err) {
      loggerClient.error('Error registering service worker:', err);
      setError('Error registering service worker');
    }
  }, [isSupported]);

  const checkPermissions = useCallback(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      setError(null);
      loggerClient.debug('🔄 usePushNotifications: Permisos verificados:', Notification.permission);
    }
  }, [isSupported]);

  // Función de diagnóstico para consola del navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).diagnoseNotifications = () => {
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;
        const hasNotification = 'Notification' in window;
        const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';

        console.log('🔍 Diagnóstico Completo de Notificaciones Push:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 APIs Disponibles:');
        console.log('  ✅ Service Worker:', hasServiceWorker);
        console.log('  ✅ Push Manager:', hasPushManager);
        console.log('  ✅ Notification API:', hasNotification);
        console.log('  ✅ Secure Context:', isSecureContext);
        console.log('');
        console.log('🌐 Información del Contexto:');
        console.log('  📡 Protocol:', location.protocol);
        console.log('  🏠 Hostname:', location.hostname);
        console.log('  🔒 isSecureContext:', window.isSecureContext);
        console.log('');
        console.log('📱 Información del Navegador:');
        console.log('  🤖 User Agent:', navigator.userAgent);
        console.log('  🌐 Online:', navigator.onLine);

        if (hasNotification) {
          console.log('  🔔 Notification Permission:', Notification.permission);
          console.log('  🔄 Notification Max Actions:', 'Notification' in window ? (Notification as any).maxActions || 'N/A' : 'N/A');
        }

        if (hasServiceWorker) {
          console.log('  🔧 Service Worker Ready:', navigator.serviceWorker.controller ? 'Yes' : 'No');
        }

        console.log('');
        console.log('🎯 Estado del Hook:');
        console.log('  🔌 isSupported:', isSupported);
        console.log('  📡 isSubscribed:', isSubscribed);
        console.log('  ⚙️ isLoading:', isLoading);
        console.log('  🔑 needsLogin:', needsLogin);
        console.log('  ⚡ serviceWorkerReady:', serviceWorkerReady);
        console.log('  🚫 permission:', permission);

        if (error) {
          console.log('  ❌ error:', error);
        }

        console.log('');
        console.log('💡 Recomendaciones:');
        if (!hasServiceWorker) {
          console.log('  ❌ Service Worker no disponible - Actualiza Chrome');
        }
        if (!hasPushManager) {
          console.log('  ❌ Push Manager no disponible - Actualiza Chrome');
        }
        if (!hasNotification) {
          console.log('  ❌ Notification API no disponible - Actualiza Chrome');
        }
        if (!isSecureContext) {
          console.log('  ❌ Contexto no seguro - Usa HTTPS o localhost');
        }
        if (hasNotification && Notification.permission === 'denied') {
          console.log('  ❌ Permisos denegados - Revisa configuración del sitio');
        }

        return {
          hasServiceWorker,
          hasPushManager,
          hasNotification,
          isSecureContext,
          protocol: location.protocol,
          hostname: location.hostname,
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          notificationPermission: hasNotification ? Notification.permission : 'N/A',
          hookState: {
            isSupported,
            isSubscribed,
            isLoading,
            needsLogin,
            serviceWorkerReady,
            permission,
            error
          }
        };
      };

      // Agregar función de diagnóstico rápido
      (window as any).checkNotifications = () => {
        console.log('🔍 Verificación Rápida de Notificaciones:');
        const result = (window as any).diagnoseNotifications();
        const allGood = result.hasServiceWorker && result.hasPushManager && result.hasNotification && result.isSecureContext;
        console.log(allGood ? '✅ Todo parece estar bien' : '❌ Hay problemas que revisar');
        return allGood;
      };
    }
  }, [isSupported, isSubscribed, isLoading, needsLogin, serviceWorkerReady, permission, error]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    needsLogin,
    serviceWorkerReady,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification,
    registerServiceWorker,
    checkPermissions
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
