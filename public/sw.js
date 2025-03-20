/* eslint-disable no-restricted-globals */

const STATIC_CACHE = 's-cache-v1'; // статические данные
const DYNAMIC_CACHE = 'd-cache-v1'; // динамические данные

const URLS = [
  "/pwa/",
  "/pwa/manifest.json",
  "/pwa/static/css/main.c0d88c89.css",
  "/pwa/static/js/main.4529fa53.js"
];

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});


self.addEventListener("install", async () => {
  self.skipWaiting();
  const cache = await caches.open("STATIC_CACHE");

  console.log("Attempting to cache:", URLS);

  try {
    await cache.addAll(URLS);
    console.log("Cache success:", URLS);

    const cacheNames = await caches.keys();
    console.log("Existing caches after install:", cacheNames);
  } catch (e) {
    console.error("Cache error:", e);
  }
});

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const getPendingRequests = async () => {
  const db = await openDatabase();
  if (!db) throw new Error('Database not initialized');

  return new Promise((resolve, reject) => {
    const tx = db.transaction('requests', 'readonly');
    const store = tx.objectStore('requests');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const removePendingRequest = async (id) => {
  const db = await openDatabase();
  if (!db) throw new Error('Database not initialized');

  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');

  await store.delete(id);
  await tx.done;
  }

const syncData = async() => {
  const requests = await getPendingRequests();
  if (requests?.length) {
    const updatedRequests = [];
    for (const req of requests) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          body: req.body,
          headers: req.headers,
        });
        const data = await response.json();
        updatedRequests.push(data);
        await removePendingRequest(req.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_COMPLETE', data: updatedRequests });
      });
    });
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// сервисворкер для уведомлений
self.addEventListener("message", async (e) => {
  if (e.data.type === "SHOW_NOTIFICATION") {
    try {
      await self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: e.data.icon,
        vibrate: [200, 100, 200],
      });
    } catch (error) {
      console.log('error')
    }
  } else {
    console.warn("Неизвестный тип сообщения:", e.data.type);
  }
});

// сервисворкер для кеширования
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  e.respondWith((async () => {
    if (url.origin === location.origin) {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        return await fetch(request);
      } catch (error) {
        console.warn('Нет интернета, а в кеше нет:', request.url);
        return caches.match('/index.html') || new Response('Нет интернета', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    try {
      const response = await fetch(request);
      if (!response || response.status !== 200) throw new Error('Плохой ответ');

      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());

      return response;
    } catch (error) {
      console.warn('Нет интернета, загружаем из кеша:', request.url);
      const cached = await caches.match(request);
      return cached || new Response(JSON.stringify({ error: 'Нет интернета' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  })());
});

// сервисворкеры для фоновой загрузки
self.addEventListener('backgroundfetchsuccess', async (event) => {
  const cache = await caches.open('background-fetch-cache');
  const records = await event.registration.matchAll();

  for (const record of records) {
      const response = await record.responseReady;
      await cache.put(record.request, response);
  }

  event.waitUntil(
      self.registration.showNotification('Загрузка завершена', {
          body: 'Ваши файлы загружены!',
          icon: '/icon.png'
      })
  );
});

self.addEventListener('backgroundfetchfail', (event) => {
  console.log('Фоновая загрузка не удалась:', event.registration.id);
});
