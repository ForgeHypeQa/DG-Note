// DG-Note service worker: makes the app installable and lets it open without signal.
// Pages and scripts: network first (always the newest version), saved copy if offline.
// The API is never cached.
const CACHE = 'dg-note-v2';
const SHELL = ['/', '/index.html', '/styles.css', '/listen.css', '/app.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match('/index.html'))));
});
