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

// Cache para evitar notificaciones duplicadas más estricto
let notificationCache = new Map();
let lastNotificationTime = 0;
const MIN_NOTIFICATION_INTERVAL = 10000; // 10 segundos mínimo entre notificaciones

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const now = Date.now();
  const notificationKey = `${data.title || 'Nuevo Anuncio'}-${data.body || ''}`;
  
  // Verificar tiempo mínimo entre notificaciones
  if (now - lastNotificationTime < MIN_NOTIFICATION_INTERVAL) {
    console.log('Notificación bloqueada por throttling temporal');
    return;
  }
  
  // Verificar si ya existe en cache
  if (notificationCache.has(notificationKey)) {
    const cachedTime = notificationCache.get(notificationKey);
    if (now - cachedTime < 60000) { // 1 minuto de cache
      console.log('Notificación duplicada detectada, ignorando:', notificationKey);
      return;
    }
  }
  
  // Actualizar cache y tiempo
  notificationCache.set(notificationKey, now);
  lastNotificationTime = now;
  
  // Limpiar cache viejo (más de 5 minutos)
  for (const [key, time] of notificationCache.entries()) {
    if (now - time > 300000) { // 5 minutos
      notificationCache.delete(key);
    }
  }

  const options = {
    body: data.body || 'Nuevo anuncio disponible',
    icon: '/icons/icon_192x192.png',
    badge: '/icons/icon_192x192.png',
    image: data.image || null,
    tag: `announcement-${now}`, // Tag único para cada notificación
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
      notificationId: data.notificationId || `notif-${now}`,
      timestamp: now
    }
  };

  console.log('Mostrando notificación:', notificationKey);
  
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
