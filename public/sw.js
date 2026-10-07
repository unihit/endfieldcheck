const BASE = new URL('./',self.location.href).pathname;
const CACHE = 'endfieldcheck-shell-v4';
const SHELL = ['','manifest.webmanifest','icon-192.png','icon-512.png','api.js','connection.js','qrcode.js'].map(path=>BASE+path);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('endfieldcheck-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE) || event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    // API traffic goes to another origin and is never intercepted or cached.
    event.respondWith(fetch(event.request).then(async response => {
      if (response.ok && !response.redirected && response.headers.get('Content-Type')?.includes('text/html')) {
        const cache = await caches.open(CACHE); await cache.put(BASE, response.clone());
      }
      return response;
    }).catch(() => caches.match(BASE)));
  } else if (SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
