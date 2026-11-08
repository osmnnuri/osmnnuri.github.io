// ONY Panel service worker: Web Push bildirimleri ve uygulama olarak kurulabilme
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Her istek ağdan gelir; panel her zaman güncel kalır
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(fetch(event.request, { cache: "no-cache" }).catch(() => fetch(event.request)));
});

self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; } catch { data = { title: "ONY Panel", body: event.data && event.data.text() }; }
    const title = data.title || "ONY Panel";
    event.waitUntil(self.registration.showNotification(title, {
        body: data.body || "",
        icon: "icons/icon-192.png",
        badge: "icons/badge-96.png",
        tag: data.tag,
        renotify: false,
        data: { url: data.url || "./#haberler" },
        lang: "tr",
    }));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = new URL(event.notification.data?.url || "./#haberler", self.registration.scope).href;
    event.waitUntil((async () => {
        // Panel bildirimiyse açık panel penceresini öne getir
        if (url.startsWith(self.registration.scope)) {
            const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
            const panel = windows.find(w => w.url.startsWith(self.registration.scope));
            if (panel) {
                await panel.focus();
                return panel.navigate(url).catch(() => {});
            }
        }
        return self.clients.openWindow(url);
    })());
});

// Tarayıcı aboneliği yenilerse panelin bir sonraki açılışında yeniden kaydedilir
self.addEventListener("pushsubscriptionchange", () => {});
