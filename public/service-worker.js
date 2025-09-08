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

// Cache para evitar notificaciones duplicadas
let notificationCache = new Set();
const NOTIFICATION_CACHE_SIZE = 50;

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  // Crear un ID único para la notificación
  const notificationId = `${data.title || 'Nuevo Anuncio'}-${data.body}-${Date.now()}`;
  const cacheKey = `${data.title || 'Nuevo Anuncio'}-${data.body}`;
  
  // Verificar si ya mostramos esta notificación recientemente
  if (notificationCache.has(cacheKey)) {
    console.log('Notificación duplicada detectada, ignorando:', cacheKey);
    return;
  }
  
  // Añadir al cache
  notificationCache.add(cacheKey);
  
  // Limpiar cache si está muy grande
  if (notificationCache.size > NOTIFICATION_CACHE_SIZE) {
    const firstItem = notificationCache.values().next().value;
    notificationCache.delete(firstItem);
  }

  const options = {
    body: data.body || 'Nuevo anuncio disponible',
    icon: '/icons/icon_192x192.png',
    badge: '/icons/icon_192x192.png',
    image: data.image || null,
    tag: 'announcement', // Esto ya previene duplicados por tag
    requireInteraction: true,
    vibrate: [200, 100, 200], // Patrón de vibración para notificaciones push
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
      notificationId: notificationId
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nuevo Anuncio', options)
  );
  
  // Limpiar cache después de 5 minutos
  setTimeout(() => {
    notificationCache.delete(cacheKey);
  }, 5 * 60 * 1000);
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
