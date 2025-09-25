/**
 * Service Worker Avanzado para PWA Badeo
 * Cache estratégico, sincronización offline y optimización de performance
 */

const CACHE_NAME = 'pwa-badeo-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Recursos críticos que siempre deben estar en cache
const CRITICAL_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Recursos estáticos para cache agresivo
const STATIC_ASSETS = [
  '/static/js/',
  '/static/css/',
  '/_next/static/',
];

// APIs que pueden cachear por tiempo limitado
const CACHEABLE_APIS = [
  '/api/places',
  '/api/events',
  '/api/schools',
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Configuración de TTL para diferentes tipos de recursos
const CACHE_TTL = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 días
  DYNAMIC: 24 * 60 * 60 * 1000, // 1 día
  API: 10 * 60 * 1000, // 10 minutos
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 días
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache crítico
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Pre-cache estático
      caches.open(STATIC_CACHE).then((cache) => {
        return Promise.all(
          STATIC_ASSETS.map(pattern => {
            // Aquí normalmente usarías un build manifest
            return cache.add(pattern).catch(() => {
              console.log(`[SW] Failed to cache: ${pattern}`);
            });
          })
        );
      }),
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== IMAGE_CACHE &&
                     cacheName !== API_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Tomar control inmediato
      self.clients.claim(),
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Manejar diferentes tipos de requests
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Recursos críticos: Cache First
    if (CRITICAL_ASSETS.includes(pathname)) {
      return await cacheFirstStrategy(request, CACHE_NAME);
    }

    // Recursos estáticos: Cache First con TTL
    if (STATIC_ASSETS.some(pattern => pathname.startsWith(pattern))) {
      return await cacheFirstWithTTL(request, STATIC_CACHE, CACHE_TTL.STATIC);
    }

    // APIs: Stale While Revalidate
    if (CACHEABLE_APIS.some(pattern => pathname.startsWith(pattern))) {
      return await staleWhileRevalidateStrategy(request, API_CACHE, CACHE_TTL.API);
    }

    // Imágenes: Cache First con compresión
    if (pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
      return await imageStrategy(request, IMAGE_CACHE, CACHE_TTL.IMAGES);
    }

    // Páginas: Network First con fallback
    if (request.mode === 'navigate') {
      return await networkFirstStrategy(request, DYNAMIC_CACHE);
    }

    // Otros recursos: Network First
    return await networkFirstStrategy(request, DYNAMIC_CACHE);

  } catch (error) {
    console.error('[SW] Request handling error:', error);
    
    // Fallback para navegación
    if (request.mode === 'navigate') {
      return await caches.match('/offline');
    }
    
    throw error;
  }
}

// Estrategia Cache First
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Estrategia Cache First con TTL
async function cacheFirstWithTTL(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
    const now = new Date();
    
    if (now - cachedDate < ttl) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.append('sw-cached-date', new Date().toISOString());
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estrategia Network First
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidateStrategy(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch en background para actualizar cache
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.append('sw-cached-date', new Date().toISOString());
      cache.put(request, responseToCache);
    }
    return response;
  }).catch(() => {
    // Silently fail background updates
  });
  
  // Si tenemos cache, devolverlo inmediatamente
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
    const now = new Date();
    
    // Si está fresco, devolver cache y actualizar en background
    if (now - cachedDate < ttl) {
      fetchPromise; // No await, ejecutar en background
      return cachedResponse;
    }
  }
  
  // Si no hay cache o está stale, esperar network
  try {
    return await fetchPromise;
  } catch (error) {
    // Si falla network, devolver cache stale si existe
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estrategia especial para imágenes con optimización
async function imageStrategy(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const url = new URL(request.url);
  
  // Crear versión optimizada de la URL para cache key
  const optimizedUrl = optimizeImageUrl(url);
  const optimizedRequest = new Request(optimizedUrl);
  
  const cachedResponse = await cache.match(optimizedRequest);
  
  if (cachedResponse) {
    const cachedDate = new Date(cachedResponse.headers.get('sw-cached-date'));
    const now = new Date();
    
    if (now - cachedDate < ttl) {
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      responseToCache.headers.append('sw-cached-date', new Date().toISOString());
      cache.put(optimizedRequest, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Optimizar URL de imagen para cache
function optimizeImageUrl(url) {
  // Normalizar parámetros de calidad y formato
  const params = new URLSearchParams(url.search);
  
  // Remover parámetros que no afectan el contenido cacheado
  params.delete('t'); // timestamp
  params.delete('v'); // version
  
  // Normalizar formato
  if (!params.has('fm')) {
    params.set('fm', 'webp');
  }
  
  // Normalizar calidad
  if (!params.has('q')) {
    params.set('q', '75');
  }
  
  url.search = params.toString();
  return url.toString();
}

// Background Sync para acciones offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar lógica de sincronización
  console.log('[SW] Performing background sync...');
  
  try {
    // Obtener datos pendientes del IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      await syncAction(action);
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: 'Nueva actualización disponible',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PWA Badeo', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Utilidades para IndexedDB (simuladas)
async function getPendingActions() {
  // Implementar lectura de IndexedDB
  return [];
}

async function syncAction(action) {
  // Implementar sincronización de acción
  console.log('[SW] Syncing action:', action);
}

// Limpiar caches antiguos periódicamente
setInterval(async () => {
  try {
    await cleanupOldCaches();
  } catch (error) {
    console.error('[SW] Cache cleanup error:', error);
  }
}, 60 * 60 * 1000); // Cada hora

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cachedDate = response?.headers.get('sw-cached-date');
      
      if (cachedDate) {
        const age = now - new Date(cachedDate).getTime();
        
        // Eliminar entradas muy antigas
        if (age > CACHE_TTL.STATIC) {
          await cache.delete(request);
        }
      }
    }
  }
}

console.log('[SW] Service Worker loaded');