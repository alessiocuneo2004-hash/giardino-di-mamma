// Permette di giocare anche senza internet dopo la prima apertura.
var CACHE = 'giardino-mamma-v2';
var FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nomi) {
      return Promise.all(nomi.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Prima la rete (così arrivano gli aggiornamenti), poi la copia salvata se manca la connessione.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (risposta) {
      if (risposta && risposta.ok) {
        var copia = risposta.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return risposta;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
