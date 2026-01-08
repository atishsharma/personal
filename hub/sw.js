const VERSION = "hub-v1";

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== VERSION)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    // Only handle requests inside /hub
    if (!event.request.url.includes("/hub/")) return;

    event.respondWith(
        fetch(event.request).catch(() =>
            caches.match(event.request)
        )
    );
});
