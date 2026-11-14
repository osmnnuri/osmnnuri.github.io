// ONY Panel HUD: tema rengi, arayüz ayarları, durum şeridi ve açılış ekranı.
// <head> içinde yüklenir; renk ilk boyamadan önce uygulanır. Ayarlar bu cihazda (localStorage) saklanır.
(() => {
    const KEY = "hud.settings";
    const root = document.documentElement;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ton, açıklık ve doygunluk (oklch). `words` asistanın sesli renk komutlarında tanıdığı adlardır.
    const PRESETS = [
        { id: "mavi", label: "Mavi", h: 245, l: 0.8, c: 0.14, words: ["mavi", "lacivert"] },
        { id: "camgobegi", label: "Camgöbeği", h: 200, l: 0.85, c: 0.14, words: ["camgobegi", "turkuaz", "cyan"] },
        { id: "yesil", label: "Yeşil", h: 150, l: 0.85, c: 0.19, words: ["yesil"] },
        { id: "amber", label: "Amber", h: 80, l: 0.84, c: 0.16, words: ["amber", "sari", "turuncu", "altin"] },
        { id: "kirmizi", label: "Kırmızı", h: 25, l: 0.7, c: 0.21, words: ["kirmizi", "kizil"] },
        { id: "mor", label: "Mor", h: 305, l: 0.76, c: 0.18, words: ["mor", "eflatun", "pembe"] },
    ];

    const DEFAULTS = { h: 245, l: 0.8, c: 0.14, name: "Nova", voice: "", rate: 1, speak: true, sfx: true, wake: false, motion: !reducedMotion };

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
    }

    const S = { ...DEFAULTS, ...load() };

    function applyTheme() {
        root.style.setProperty("--h", S.h);
        root.style.setProperty("--al", S.l);
        root.style.setProperty("--ac", S.c);
        root.classList.toggle("no-motion", !S.motion);
    }

    function set(patch) {
        if ("name" in patch) patch.name = String(patch.name || "").trim().slice(0, 24) || S.name;
        Object.assign(S, patch);
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* depolama kapalı: ayar bu oturumda geçerli */ }
        applyTheme();
        syncUi();
        window.dispatchEvent(new CustomEvent("hud:change", { detail: patch }));
    }

    // Hazır renk adı ("kirmizi") ya da 0-360 arası ton. Tanınmazsa null döner.
    function setColor(value) {
        const preset = PRESETS.find(p => p.id === value || p.words.includes(value));
        if (preset) { set({ h: preset.h, l: preset.l, c: preset.c }); return preset.label; }
        const hue = Number(value);
        if (value === "" || !Number.isFinite(hue)) return null;
        set({ h: ((Math.round(hue) % 360) + 360) % 360, l: DEFAULTS.l, c: 0.15 });
        return `${S.h} derece`;
    }

    window.HUD = { settings: S, presets: PRESETS, set, setColor, appVisible: false };
    applyTheme();

    // ===== Arayüz (DOM hazır olunca) =====
    const $ = (sel) => document.querySelector(sel);
    let syncUi = () => {};

    function timeAgo(iso) {
        const s = (Date.now() - new Date(iso).getTime()) / 1000;
        if (s < 60) return "az önce";
        if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
        if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
        return `${Math.floor(s / 86400)} gün önce`;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const app = $("#appView");
        const login = $("#loginView");

        // --- Açılış ekranı: oturum durumu belli olunca (en geç 4 sn sonra) kalkar
        const boot = $("#boot");
        const bootStart = performance.now();
        const minBoot = S.motion && !sessionStorage.getItem("hud.booted") ? 1100 : 0;
        let bootDone = false;
        function endBoot() {
            if (bootDone || (app.hidden && login.hidden)) return;
            bootDone = true;
            try { sessionStorage.setItem("hud.booted", "1"); } catch { /* yok say */ }
            setTimeout(() => boot.classList.add("done"), Math.max(0, minBoot - (performance.now() - bootStart)));
        }
        setTimeout(() => { bootDone = true; boot.classList.add("done"); }, 4000);

        // --- Saat
        const clock = $("#hudClock");
        const tick = () => { clock.textContent = new Date().toLocaleTimeString("tr-TR"); };
        tick();
        setInterval(tick, 1000);

        // --- Bölüm adı
        function showView() {
            const links = [...document.querySelectorAll(".side-nav a")];
            const i = Math.max(0, links.findIndex(a => a.classList.contains("current")));
            $("#hudSector").textContent = `Sektör ${String(i + 1).padStart(2, "0")}`;
            $("#hudView").textContent = links[i]?.children[1]?.textContent || "";
        }
        window.addEventListener("hashchange", () => setTimeout(showView)); // admin.js yönlendirmesinden sonra

        // --- Okunmamış sayısı: kenar çubuğundaki rozeti yansıtır
        const badge = $("#newsBadge");
        const showUnread = () => { $("#hudUnread").textContent = badge.hidden ? "0" : badge.textContent; };
        new MutationObserver(showUnread).observe(badge, { childList: true, attributes: true });

        // --- Son tarama
        async function showSync() {
            if (!window.HUD.appVisible || !window.panel) return;
            const { data } = await window.panel.sb.from("news_sources").select("last_fetched_at")
                .order("last_fetched_at", { ascending: false, nullsFirst: false }).limit(1);
            const last = data?.[0]?.last_fetched_at;
            $("#hudSync").textContent = last ? timeAgo(last) : "—";
        }
        setInterval(showSync, 5 * 60 * 1000);

        // --- Bağlantı
        function showLink() {
            $("#hudLink").textContent = navigator.onLine ? "Çevrimiçi" : "Çevrimdışı";
            $("#hudDot").classList.toggle("off", !navigator.onLine);
        }
        window.addEventListener("online", showLink);
        window.addEventListener("offline", showLink);
        showLink();

        // --- Panel açıldı / kapandı (giriş, çıkış)
        function onAppToggle() {
            const visible = !app.hidden;
            endBoot();
            if (visible === window.HUD.appVisible) return;
            window.HUD.appVisible = visible;
            if (visible) { showView(); showUnread(); showSync(); }
            window.dispatchEvent(new CustomEvent("hud:app", { detail: visible }));
        }
        const watcher = new MutationObserver(onAppToggle);
        watcher.observe(app, { attributes: true, attributeFilter: ["hidden"] });
        watcher.observe(login, { attributes: true, attributeFilter: ["hidden"] });
        onAppToggle();

        // --- Sayaçlar: haber istatistikleri sıfırdan sayarak dolar
        const stats = $("#newsStats");
        new MutationObserver(() => {
            if (!S.motion) return;
            stats.querySelectorAll("strong").forEach((el) => {
                const target = Number(el.textContent);
                if (!Number.isInteger(target) || target < 2) return;
                const start = performance.now();
                const step = (now) => {
                    const t = Math.min(1, (now - start) / 700);
                    el.textContent = Math.round(target * (1 - (1 - t) ** 3));
                    if (t < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });
        }).observe(stats, { childList: true });

        // --- Ayarlar penceresi
        const dialog = $("#hudSettings");
        const form = $("#hudSettingsForm");
        const swatches = $("#hudSwatches");
        swatches.innerHTML = PRESETS.map(p =>
            `<button type="button" class="swatch" data-color="${p.id}" style="--sh:${p.h};--sl:${p.l};--sc:${p.c}"><i></i>${p.label}</button>`).join("");

        function fillVoices() {
            const voices = "speechSynthesis" in window ? speechSynthesis.getVoices() : [];
            const tr = voices.filter(v => v.lang.toLowerCase().startsWith("tr"));
            form.voice.innerHTML = `<option value="">Otomatik</option>` + (tr.length ? tr : voices)
                .map(v => `<option value="${v.name.replace(/"/g, "&quot;")}">${v.name.replace(/</g, "&lt;")}</option>`).join("");
            form.voice.value = S.voice;
            const notes = [];
            if (!("speechSynthesis" in window)) notes.push("Bu tarayıcı sesli yanıtı desteklemiyor.");
            else if (voices.length && !tr.length) notes.push("Bu cihazda Türkçe ses yüklü değil; yanıtlar aksanlı okunabilir.");
            if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) notes.push("Bu tarayıcı sesle komutu desteklemiyor (Chrome ya da Edge gerekir); asistan yazıyla çalışır.");
            $("#hudVoiceNote").textContent = notes.join(" ");
        }
        if ("speechSynthesis" in window) speechSynthesis.addEventListener("voiceschanged", fillVoices);

        syncUi = () => {
            const preset = PRESETS.find(p => p.h === S.h && p.l === S.l && p.c === S.c);
            swatches.querySelectorAll(".swatch").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.color === preset?.id)));
            form.hue.value = S.h;
            if (document.activeElement !== form.name) form.name.value = S.name;
            form.voice.value = S.voice;
            form.rate.value = S.rate;
            for (const key of ["speak", "sfx", "wake", "motion"]) form[key].checked = S[key];
            document.querySelectorAll("[data-ai-name]").forEach(el => { el.textContent = S.name; });
        };

        swatches.addEventListener("click", (event) => {
            const btn = event.target.closest(".swatch");
            if (btn) setColor(btn.dataset.color);
        });
        form.hue.addEventListener("input", () => setColor(form.hue.value));
        form.name.addEventListener("change", () => set({ name: form.name.value }));
        form.voice.addEventListener("change", () => set({ voice: form.voice.value }));
        form.rate.addEventListener("change", () => set({ rate: Number(form.rate.value) }));
        for (const key of ["speak", "sfx", "wake", "motion"]) form[key].addEventListener("change", () => set({ [key]: form[key].checked }));

        function openSettings() {
            fillVoices();
            syncUi();
            if (!dialog.open) dialog.showModal();
        }
        $("#hudSettingsBtn").addEventListener("click", openSettings);
        dialog.addEventListener("click", (event) => { // dışına tıklayınca kapan
            const box = dialog.getBoundingClientRect();
            const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
            if (event.target === dialog && !inside) dialog.close();
        });
        window.HUD.openSettings = openSettings;

        syncUi();
    });
})();
