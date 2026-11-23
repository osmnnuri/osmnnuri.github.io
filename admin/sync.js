// ONY Panel tercih senkronu: telefon, bilgisayar, hangi cihazdan girilirse aynı panel.
// Her bölüm (Nova ayarları, kokpit düzeni, konuşma kaydı, okunan raporlar) kendini bir anahtarla kaydeder:
//   PREFS.register(key, { get: () => değer, apply: (değer) => uygula })
// localStorage önbellektir: ilk boyama ondan yapılır. Giriş yapılınca ve panele her dönüşte merkezden
// (Supabase admin_prefs) çekilir; değişiklikler kısa bir gecikmeyle yalnızca kendi anahtarıyla merkeze yazılır.
// Merkezde henüz olmayan bir bölüm, bu cihazdaki değeriyle tohumlanır.
(() => {
    const parts = new Map();   // key -> { get, apply }
    const pending = new Map(); // merkeze yazılmayı bekleyenler
    let sb = null;
    let timer = 0;
    let pulling = null;
    let lastPull = 0;

    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r({ error: new Error("zaman aşımı") }), ms))]);

    function register(key, part) {
        parts.set(key, part);
        if (sb) pull(); // merkez çoktan çekildiyse geç yüklenen bölüm de güncellensin
    }

    function push(key, value) {
        pending.set(key, value);
        clearTimeout(timer);
        timer = setTimeout(flush, 700);
    }

    async function flush() {
        clearTimeout(timer);
        if (!sb || !pending.size) return;
        const items = [...pending];
        pending.clear();
        for (const [key, value] of items) {
            const { error } = await withTimeout(sb.rpc("set_admin_pref", { p_key: key, p_value: value }), 8000);
            if (error) {
                if (!pending.has(key)) pending.set(key, value); // bağlantı gelince yeniden denenir
                console.warn("Tercih merkeze yazılamadı:", key, error.message || error);
            }
        }
    }

    async function doPull() {
        await flush(); // bu cihazdaki son değişiklik önce gitsin
        const { data, error } = await withTimeout(sb.from("admin_prefs").select("data").eq("id", 1).maybeSingle(), 4000);
        if (error || !data) return;
        const remote = data.data || {};
        for (const [key, part] of parts) {
            if (pending.has(key)) continue; // yazılamamış yerel değişiklik önceliklidir
            if (key in remote) {
                if (!same(remote[key], part.get())) {
                    try { part.apply(remote[key]); } catch (e) { console.warn("Tercih uygulanamadı:", key, e); }
                }
            } else {
                push(key, part.get());
            }
        }
        lastPull = Date.now();
    }

    let again = false;
    function pull() {
        if (!sb) return Promise.resolve();
        if (pulling) { again = true; return pulling; }
        pulling = doPull().catch(e => console.warn("Tercihler çekilemedi:", e)).finally(() => {
            pulling = null;
            if (again) { again = false; pull(); }
        });
        return pulling;
    }

    function attach(client) { sb = client; }
    function detach() { sb = null; pending.clear(); clearTimeout(timer); }

    // Panele dönünce (başka cihazda değişmiş olabilir) yeniden çek; ayrılırken bekleyeni gönder
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) flush();
        else if (Date.now() - lastPull > 3000) pull();
    });
    window.addEventListener("online", () => { flush(); pull(); });

    window.PREFS = { register, push, pull, flush, attach, detach };
})();
