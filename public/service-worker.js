/**
 * @file service-worker.js
 * @description PWA Service Worker for offline application shell, background sync & push notifications.
 */

const CACHE_NAME = 'roktosetu-shell-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/logo.svg',
  '/assets/logo.jpg',
  '/assets/logo-icon.svg',
  '/assets/logo-horizontal.svg',
  '/css/tokens.css',
  '/css/themes.css',
  '/css/base.css',
  '/css/components.css',
  '/css/layout.css',
  '/css/map.css',
  '/css/onboarding.css',
  '/i18n/en.json',
  '/i18n/bn.json',
  '/js/app.js',
  '/js/core/i18n.js',
  '/js/core/theme.js',
  '/js/core/store.js',
  '/js/core/router.js',
  '/js/core/toast.js',
  '/js/core/modal.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Network-first for dynamic API routes, with graceful offline fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        return caches.match(e.request);
      })
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then((cached) => {
        return cached || fetch(e.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
  }
});

// Web Push Notification Listener (FCM Cloud Messaging)
self.addEventListener('push', (e) => {
  let payload = { title: 'Emergency Blood Alert', body: 'A patient near you requires urgent blood matching.', icon: '/assets/logo-icon.svg' };
  try {
    if (e.data) {
      payload = e.data.json();
    }
  } catch {}

  const options = {
    body: payload.body,
    icon: payload.icon || '/assets/logo-icon.svg',
    badge: '/assets/logo-icon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/#/map'
    }
  };

  e.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || '/#/map';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync Listener for offline blood requests
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-blood-requests') {
    e.waitUntil(
      // Replay stored offline requests
      Promise.resolve()
    );
  }
});
