// Service worker de Profe Horacio: la red manda, la copia guardada es el respaldo.
// Así, si hay internet siempre ves la versión más nueva del sitio; si no hay, abre lo ya visitado.
const VERSION = 'ph-v1';
const NUCLEO = ['./', 'index.html', 'mathverse-core.js', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(NUCLEO.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // Firebase, fuentes, etc.: no se tocan
  e.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){ const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
// La página pide guardar de antemano todos los recursos para usarlos sin internet.
self.addEventListener('message', e => {
  if(!e.data || e.data.type !== 'precache') return;
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(e.data.urls.map(u => c.add(u).catch(() => {})))));
});
