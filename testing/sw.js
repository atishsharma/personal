const CACHE_NAME = 'ats-testing-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://pbs.twimg.com/profile_images/1530184439409815553/stAtZvyp_400x400.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
