/* ============================================
   StudentHub — Service Worker
   ============================================ */

const CACHE_NAME = 'studenthub-v1.0.3';
// الملفات التي ستُخزَّن في Cache
const PRECACHE_URLS = [
  // HTML Pages
  './',
  './index.html',
  './courses.html',
  './exams.html',
  './gpa.html',
  './notes.html',
  './settings.html',
  './timer.html',
  './ai.html',

  // Manifest & Icons
  './manifest.json',
  './assets/icons/icon-48.png',
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-144.png',
  './assets/icons/icon-152.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-384.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',

  // Main CSS
  './css/main.css',

  // Base CSS
  './css/base/reset.css',
  './css/base/variables.css',
  './css/base/typography.css',
  './css/base/i18n.css',
  './css/base/animations.css',

  // Layout CSS
  './css/layout/grid.css',
  './css/layout/sidebar.css',
  './css/layout/header.css',

  // Components CSS
  './css/components/buttons.css',
  './css/components/cards.css',
  './css/components/forms.css',
  './css/components/dialog.css',
  './css/components/save-bar.css',
  './css/components/search.css',
  './css/components/notifications.css',

  // Pages CSS
  './css/pages/dashboard.css',
  './css/pages/settings.css',
  './css/pages/courses.css',
  './css/pages/exams.css',
  './css/pages/gpa.css',
  './css/pages/notes.css',
  './css/pages/timer.css',
  './css/pages/ai.css',

  // Main JS
  './js/main.js',

  // Core JS
  './js/core/notifications.js',

  // i18n
  './js/i18n/i18n.js',
  './js/i18n/ar.js',
  './js/i18n/en.js',

  // ✅ Utils (جديد)
  './js/utils/storage.js',
  './js/utils/html.js',
  './js/utils/date.js',
  './js/utils/toast.js',

  // Modules
  './js/modules/courses.js',
  './js/modules/exams.js',
  './js/modules/gpa.js',
  './js/modules/notes.js',
  './js/modules/timer.js',
  './js/modules/settings.js',
  './js/modules/ai.js',
];

/* ============================================
   INSTALL — Precache Files
   ============================================ */

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching files...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('✅ Precache complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Precache failed:', error);
      })
  );
});

/* ============================================
   ACTIVATE — Clean Old Caches
   ============================================ */

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

/* ============================================
   FETCH — Serve from Cache, Fallback to Network
   ============================================ */

self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;

  // تجاهل الطلبات من خارج الموقع
  if (!event.request.url.startsWith(self.location.origin)) return;

  // تجاهل طلبات Live Server WebSocket
  if (event.request.url.includes('ws://') ||
      event.request.url.includes('sockjs') ||
      event.request.url.includes('__vite') ||
      event.request.url.includes('browser-sync')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 1. لو موجودة في Cache → رجّعها
        if (cachedResponse) {
          // حدّث في الخلفية (Stale-While-Revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // صامت — الملف موجود في Cache
            });

          return cachedResponse;
        }

        // 2. لو مو موجودة → جيبها من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // تحقق من الاستجابة
            if (!networkResponse ||
                networkResponse.status !== 200 ||
                networkResponse.type === 'opaque') {
              return networkResponse;
            }

            // احفظها في Cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((error) => {
            console.log('🌐 Network failed for:', event.request.url);

            // 3. لو فشل الاتصال
            // لو الطلب HTML document → رجّع index.html
            if (event.request.destination === 'document' ||
                event.request.mode === 'navigate') {
              return caches.match('./index.html')
                .then((response) => {
                  return response || new Response(
                    'Offline - Page not available',
                    {
                      status: 503,
                      statusText: 'Offline',
                      headers: new Headers({ 'Content-Type': 'text/plain' })
                    }
                  );
                });
            }

            // للطلبات الأخرى → رجّع استجابة فارغة
            return new Response('', {
              status: 408,
              statusText: 'Request timeout',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
      })
  );
});

/* ============================================
   MESSAGE — Handle Messages from Main Thread
   ============================================ */

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ============================================
   PUSH — Handle Push Notifications
   ============================================ */

self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');

  let data = {
    title: 'StudentHub',
    body: 'لديك إشعار جديد',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: data.tag || 'studenthub-notification',
    requireInteraction: false,
    data: {
      url: data.url || './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ============================================
   NOTIFICATION CLICK
   ============================================ */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // لو فيه نافذة مفتوحة → ركّز عليها
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        // لو ما فيه → افتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/* ============================================
   BACKGROUND SYNC
   ============================================ */

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('🔄 Syncing data...');
}

/* ============================================
   PERIODIC BACKGROUND SYNC
   ============================================ */

self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync:', event.tag);

  if (event.tag === 'check-exams') {
    event.waitUntil(checkUpcomingExamsFromSW());
  }
});

async function checkUpcomingExamsFromSW() {
  console.log('🔔 Checking upcoming exams from SW...');
}

/* ============================================
   SERVICE WORKER VERSION
   ============================================ */

console.log('🚀 StudentHub Service Worker loaded');
console.log('📦 Cache:', CACHE_NAME);