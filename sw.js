/* AB-Werkstatt: Offline-Zwischenspeicher für die installierte Web-App.
   Die Seite selbst kommt zuerst aus dem Netz (damit Updates sofort da sind) und sonst aus dem Speicher.
   Bibliotheken und Schriften von den CDNs werden nach dem ersten Laden aus dem Speicher genommen.
   Nach dem Start schickt die Seite die Liste der Bibliotheken (PowerPoint, PDF, ZIP, Bilder, Online-Ablage);
   sie werden dann gleich vorgeladen, damit auch noch nie benutzte Funktionen offline gehen.
   Die Online-Ablage (Supabase) selbst wird nie zwischengespeichert; die Kopie der Stunden liegt in der Seite (IndexedDB). */
const SHELL = 'abw-shell-v2', LIBS = 'abw-libs-v1';
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== LIBS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/supabase\.(co|in)$/.test(url.hostname)) return;
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) {
    e.respondWith(caches.open(LIBS).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
self.addEventListener('message', e => {
  const L = e.data && Array.isArray(e.data.warm) ? e.data.warm.filter(u => /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//.test(u)) : null; if (!L) return;
  e.waitUntil(caches.open(LIBS).then(c => Promise.all(L.map(u => c.match(u).then(hit => hit || fetch(u, { mode: 'cors', credentials: 'omit' }).then(res => { if (res.ok) return c.put(u, res); }).catch(() => {}))))));
});
