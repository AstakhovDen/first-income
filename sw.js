/* First Income - офлайн-кэш.
   Стратегия: сначала сеть (свежая версия), кэш только когда сети нет.
   Так партнёр не застревает на старой версии, но страница открывается офлайн. */
var CACHE = 'fi-cache-v1';

self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // чужие домены (YouTube-превью) не трогаем
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.ok) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (m) {
        if (m) return m;
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
