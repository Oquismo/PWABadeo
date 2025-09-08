// Service Worker para notificaciones push
const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Sistema anti-duplicados más estricto
const NOTIFICATION_STORE = 'badeo-notifications';
let processedNotifications = new Set();

// Función para obtener hash del contenido
function getNotificationHash(data) {
  return btoa(`${data.title || ''}-${data.body || ''}`).replace(/=/g, '');
}

// Manejo de notificaciones push con protección absoluta
self.addEventListener('push', async (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push data:', e);
      return;
    }
  }

  const contentHash = getNotificationHash(data);
  const notificationId = `${contentHash}-${Date.now()}`;
  
  // Verificar si ya procesamos esta notificación exacta
  if (processedNotifications.has(contentHash)) {
    console.log('🚫 Notificación duplicada bloqueada:', contentHash);
    return;
  }

  // Añadir al set de procesadas
  processedNotifications.add(contentHash);
  
  // Limpiar el set cada 5 minutos
  setTimeout(() => {
    processedNotifications.delete(contentHash);
  }, 5 * 60 * 1000);

  // Verificar si ya existe una notificación visible con el mismo contenido
  const existingNotifications = await self.registration.getNotifications({
    tag: 'announcement'
  });
  
  for (const notification of existingNotifications) {
    if (notification.title === (data.title || 'Nuevo Anuncio') && 
        notification.body === (data.body || 'Nuevo anuncio disponible')) {
      console.log('🚫 Notificación visible duplicada, cerrando anterior');
      notification.close();
    }
  }

  const options = {
    body: data.body || 'Nuevo anuncio disponible',
    icon: '/icons/icon_192x192.png',
    badge: '/icons/icon_192x192.png',
    image: data.image || null,
    tag: 'announcement', // Tag fijo para reemplazar automáticamente
    renotify: false, // No re-notificar si ya existe
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'Ver anuncio',
        icon: '/icons/icon_192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ],
    data: {
      url: data.url || '/',
      announcementId: data.announcementId,
      notificationId: notificationId,
      contentHash: contentHash
    }
  };

  console.log('✅ Mostrando notificación única:', contentHash);
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nuevo Anuncio', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
