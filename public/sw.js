// sw.js — permite instalar el juego y abrirlo sin conexión.
const APP = 'pueblo-app-v1';
const DATOS = 'pueblo-datos';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'juego.js', 'native.js', 'icon.svg', 'manifest.webmanifest',
  'fonts/anton.woff', 'fonts/sourcesans.woff', 'icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(APP).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== APP && k !== DATOS).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/datos/')) {
    // Datos: primero la red (por si hay pueblos nuevos); sin conexión, la última copia.
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const c = res.clone(); caches.open(DATOS).then((x) => x.put(req, c)); } return res; })
      .catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.open(APP).then(async (c) => {
    const cached = await c.match(req, { ignoreSearch: true });
    const red = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || red;
  }));
});
