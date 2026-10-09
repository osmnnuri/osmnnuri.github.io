// Tarayıcı önbelleğindeki eski kopyalar yerine her zaman sunucudaki güncel dosyaları kullanır.
// Her istek sunucuyla doğrulanır: dosya değişmediyse sunucu 304 döner ve yeniden indirilmez.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request, { cache: "no-cache" }).catch(() => fetch(request))
    );
});
