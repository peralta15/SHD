// Se sube la versión a v2 para invalidar el archivo app.js viejo guardado en caché
const CACHE_NAME = 'reto-diario-v9';
const APP_FILES = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

// Activación: Elimina cachés antiguos (como el v1 que tenía el error)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {

        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {

        return caches.match(event.request);
      })
  );
});

// Recepción de Notificaciones Push
self.addEventListener('push', (event) => {
  let data = {
    title: 'RetoDiario',
    body: '¡Tu pequeño reto de hoy te está esperando!'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon.svg',
      badge: './icons/icon.svg',
      tag: `reto-diario-${Date.now()}`, // Cada notificación llega como un mensaje nuevo
      data: { url: data.url || './' }
    })
  );
});

// Clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })
  );
});