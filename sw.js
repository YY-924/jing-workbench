const CACHE = 'jing-workbench-v2';
const ASSETS = [
  './', './index.html',
  './css/style.css',
  './js/data.js', './js/ui.js', './js/cet4.js', './js/tasks.js', './js/pomodoro.js',
  './js/shop.js', './js/achievements.js', './js/pet.js', './js/weekly.js', './js/app.js',
  './data/cet4-words.js', './data/cet4-words-3000.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => { });
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
