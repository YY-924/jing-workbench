const CACHE = 'jing-workbench-v4';
const ASSETS = [
  './', './index.html',
  './css/style.css',
  './js/data.js', './js/ui.js', './js/cet4.js', './js/tasks.js', './js/pomodoro.js',
  './js/ledger.js', './js/countdown.js', './js/notes.js',
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
  const req = e.request;
  if (req.method !== 'GET') return;
  // 页面导航:网络优先,确保每次打开都拿到最新版本
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => { });
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // 静态资源:缓存优先,离线可用
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => { });
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
