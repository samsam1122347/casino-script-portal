/**
 * Minimal CrashX service worker — satisfies installability (fetch handler).
 * Safe passthrough; extend later with caching if needed.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through. The .catch is essential: without it a transient network
  // failure (server restart, brief offline) rejects the promise and surfaces
  // as an uncaught "Failed to fetch" error in the console on every request.
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response("", {
          status: 503,
          statusText: "Service Unavailable",
        }),
    ),
  );
});
