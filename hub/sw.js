const CACHE_NAME = 'atish-hub-v24';
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("fetch", event => {
    event.respondWith(fetch(event.request));
});
