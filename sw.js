const CACHE_NAME = 'controle-financeiro-v2';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Só cuida do "casco" do app (mesma origem). Firebase e CDNs seguem direto pra rede.
  if(url.origin !== self.location.origin){
    return;
  }
  // Rede primeiro: sempre busca a versão mais nova quando há internet.
  // Só usa a cópia salva localmente se estiver offline.
  event.respondWith(
    fetch(event.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
