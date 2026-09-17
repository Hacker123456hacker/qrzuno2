/* QRZuno — sw.js
   Caches the app shell so basic QR generation keeps working offline
   after the first visit. Bump CACHE_NAME when you change core files. */

const CACHE_NAME = "qrzuno-v1";
const CORE_ASSETS = [
  "./index.html",
  "./qr-tools.html",
  "./history.html",
  "./about.html",
  "./privacy.html",
  "./terms.html",
  "./faq.html",
  "./contact.html",
  "./manifest.json",
  "./css/main.css",
  "./css/responsive.css",
  "./css/animations.css",
  "./js/app.js",
  "./js/qr-engine.js",
  "./js/tools-data.js",
  "./js/utils.js",
  "./js/history.js",
  "./js/favorites.js",
  "./js/download.js",
  "./assets/icons/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
