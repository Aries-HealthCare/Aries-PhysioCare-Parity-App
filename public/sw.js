/* AriesXpert provider PWA — app shell only. Never cache API or clinical payloads. */
const CACHE = 'ariesxpert-shell-v1';
const SHELL = ['/', '/login', '/app', '/manifest.json', '/images/Arieslogo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload = { title: 'AriesXpert', body: '' };
  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'AriesXpert', {
      body: payload.body || payload.message || '',
      icon: '/ariesxpert-logo.png',
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/app/visits') || url.pathname.startsWith('/app/patients')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.destination === 'document') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match('/login');
      })
  );
});
