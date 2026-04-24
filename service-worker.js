self.addEventListener("install", (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Take control of all clients immediately
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});
