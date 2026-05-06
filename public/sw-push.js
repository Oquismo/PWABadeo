// Push notification logic for Workbox-generated SW
// Imported via workboxOptions.importScripts in next-pwa config

const NOTIFICATION_STORE = 'badeo-notifications';
const processedNotifications = new Set();

function getNotificationHash(data) {
  return btoa(`${data.title || ''}-${data.body || ''}`).replace(/=/g, '');
}

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

  if (processedNotifications.has(contentHash)) {
    console.log('Notificación duplicada bloqueada:', contentHash);
    return;
  }

  processedNotifications.add(contentHash);
  setTimeout(() => processedNotifications.delete(contentHash), 5 * 60 * 1000);

  const existingNotifications = await self.registration.getNotifications({ tag: 'announcement' });
  for (const notification of existingNotifications) {
    if (notification.title === (data.title || 'Nuevo Anuncio') &&
        notification.body === (data.body || 'Nuevo anuncio disponible')) {
      console.log('Notificación visible duplicada, cerrando anterior');
      notification.close();
    }
  }

  const options = {
    body: data.body || 'Nuevo anuncio disponible',
    icon: '/icons/icon_192x192.png',
    badge: '/icons/icon_192x192.png',
    image: data.image || null,
    tag: 'announcement',
    renotify: false,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'Ver anuncio', icon: '/icons/icon_192x192.png' },
      { action: 'dismiss', title: 'Descartar' }
    ],
    data: {
      url: data.url || '/',
      announcementId: data.announcementId,
      notificationId: notificationId,
      contentHash: contentHash
    }
  };

  console.log('Mostrando notificación única:', contentHash);
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nuevo Anuncio', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
