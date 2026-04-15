const CACHE_NAME = "tripflow-free-v7";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles/app.css",
  "./js/app.js",
  "./js/i18n.js",
  "./js/store.js",
  "./js/ui.js",
  "./js/utils.js",
  "./js/pages/loginPage.js",
  "./js/pages/dashboardHomePage.js",
  "./js/pages/editorPage.js",
  "./js/pages/discoveryPage.js",
  "./js/pages/memoryPage.js",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/icon-192.svg",
  "./assets/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
