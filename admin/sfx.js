// ONY Panel ses efektleri: tüm sesler Web Audio ile anında sentezlenir (dosya indirilmez).
// Tek yerden çalınır: window.SFX.play("tap"). Ayarlardaki "Ses efektleri" kapalıysa sessiz kalır.
// Tarayıcılar ilk dokunuştan önce ses çalmaya izin vermez; o ana kadarki sesler kuyruğa alınmadan atlanır.
(() => {
    let ctx = null, master = null, noiseBuf = null;
    const enabled = () => window.HUD?.settings?.sfx !== false;

    function audio() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        const comp = ctx.createDynamicsCompressor();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(comp).connect(ctx.destination);
        return ctx;
    }

    // Ses ilk kullanıcı etkileşiminde açılır
    const unlock = () => { const a = audio(); if (a?.state === "suspended") a.resume(); };
    for (const type of ["pointerdown", "keydown", "touchstart"]) addEventListener(type, unlock, { capture: true, passive: true });

    // ===== Yapı taşları =====
    // Tek osilatör: f → f2 kayabilir, isteğe bağlı alçak geçiren süzgeç
    function tone({ f, f2, t = 0, d = 0.08, type = "triangle", g = 0.05, attack = 0.004, lp }) {
        const at = ctx.currentTime + t;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(f, at);
        if (f2) osc.frequency.exponentialRampToValueAtTime(f2, at + d);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(g, at + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + d);
        let out = osc;
        if (lp) {
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = lp;
            out = out.connect(filter);
        }
        out.connect(gain).connect(master);
        osc.start(at);
        osc.stop(at + d + 0.03);
    }

    // Süzgeçten geçen gürültü: geçişlerdeki "vuuş"
    function whoosh({ t = 0, d = 0.3, g = 0.06, from = 300, to = 3000, q = 1.4 }) {
        if (!noiseBuf) {
            noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const data = noiseBuf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        const at = ctx.currentTime + t;
        const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        src.buffer = noiseBuf;
        filter.type = "bandpass";
        filter.Q.value = q;
        filter.frequency.setValueAtTime(from, at);
        filter.frequency.exponentialRampToValueAtTime(to, at + d);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(g, at + d * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + d);
        src.connect(filter).connect(gain).connect(master);
        src.start(at, Math.random() * 0.5);
        src.stop(at + d + 0.02);
    }

    // Dijital "veri" cıvıltısı: rastgele perdelerden kısa bip dizisi (Nova'nın sesi)
    const SCALE = [784, 880, 988, 1175, 1319, 1568, 1760];
    const pick = () => SCALE[Math.floor(Math.random() * SCALE.length)];
    function trill(n, { t = 0, step = 0.045, g = 0.022 } = {}) {
        for (let i = 0; i < n; i++) tone({ f: pick(), t: t + i * step, d: 0.035, type: "square", g, lp: 3200 });
    }

    // ===== Ses kütüphanesi =====
    const SOUNDS = {
        // Arayüz
        tap: () => tone({ f: 1800, f2: 1250, d: 0.045, type: "square", g: 0.022, lp: 4000 }),
        select: () => { tone({ f: 1100, d: 0.05, g: 0.05 }); tone({ f: 1650, t: 0.045, d: 0.07, g: 0.04 }); },
        toggleOn: () => { tone({ f: 700, d: 0.06, g: 0.05 }); tone({ f: 1050, t: 0.055, d: 0.09, g: 0.05 }); },
        toggleOff: () => { tone({ f: 1050, d: 0.06, g: 0.05 }); tone({ f: 700, t: 0.055, d: 0.09, g: 0.045 }); },
        tick: () => tone({ f: 2200, d: 0.02, type: "square", g: 0.012, lp: 5000 }),
        send: () => { tone({ f: 900, f2: 1900, d: 0.09, type: "sine", g: 0.05 }); tone({ f: 2400, t: 0.08, d: 0.04, type: "square", g: 0.012, lp: 5000 }); },
        open: () => { tone({ f: 320, f2: 1250, d: 0.18, type: "sine", g: 0.05 }); whoosh({ d: 0.18, g: 0.025, from: 600, to: 4000 }); tone({ f: 2400, t: 0.16, d: 0.035, type: "square", g: 0.014, lp: 5000 }); },
        close: () => { tone({ f: 1150, f2: 300, d: 0.16, type: "sine", g: 0.045 }); whoosh({ d: 0.15, g: 0.02, from: 3500, to: 500 }); },
        // Sayfa geçişi: süzgeçli gürültü süpürmesi, yükselen alt ton ve sonda kilitlenme bibi
        nav: () => {
            whoosh({ d: 0.34, g: 0.07, from: 260, to: 3400 });
            tone({ f: 170, f2: 520, d: 0.3, g: 0.04 });
            tone({ f: 1600, t: 0.27, d: 0.035, type: "square", g: 0.02, lp: 4500 });
            tone({ f: 2400, t: 0.31, d: 0.05, type: "square", g: 0.016, lp: 5000 });
        },
        boot: () => {
            whoosh({ d: 0.6, g: 0.045, from: 150, to: 2400, q: 0.9 });
            tone({ f: 220, f2: 440, d: 0.55, g: 0.04 });
            tone({ f: 330, f2: 660, t: 0.08, d: 0.5, g: 0.03 });
            trill(4, { t: 0.45, step: 0.05, g: 0.016 });
            tone({ f: 1760, t: 0.68, d: 0.18, type: "sine", g: 0.035 });
        },
        notify: () => { tone({ f: 1320, d: 0.22, type: "sine", g: 0.05 }); tone({ f: 1760, t: 0.09, d: 0.3, type: "sine", g: 0.04 }); },
        // Nova
        on: () => { tone({ f: 660, d: 0.12, g: 0.06 }); tone({ f: 990, t: 0.09, d: 0.15, g: 0.06 }); whoosh({ d: 0.2, g: 0.02, from: 800, to: 3500 }); },
        off: () => { tone({ f: 520, d: 0.12, g: 0.055 }); tone({ f: 390, t: 0.09, d: 0.15, g: 0.05 }); },
        think: () => [600, 900, 1200, 900].forEach((f, i) => tone({ f, t: i * 0.06, d: 0.05, type: "sine", g: 0.025 })),
        ok: () => { tone({ f: 880, d: 0.1, g: 0.05 }); tone({ f: 1320, t: 0.07, d: 0.14, g: 0.045 }); },
        err: () => { tone({ f: 240, d: 0.14, type: "square", g: 0.035, lp: 1200 }); tone({ f: 170, t: 0.12, d: 0.2, type: "square", g: 0.035, lp: 1000 }); },
        reply: () => trill(6),
        chatter: () => tone({ f: pick() * (Math.random() < 0.5 ? 0.5 : 1), d: 0.03, type: "square", g: 0.012, lp: 2800 }),
    };

    // Aynı ses art arda çok sık çalınmasın (ör. sözcük sınırları, kaydırıcı)
    const GAP = { chatter: 0.06, tick: 0.04 };
    const last = {};

    function play(kind, force = false) {
        if (!SOUNDS[kind] || (!force && !enabled())) return;
        const a = audio();
        if (!a) return;
        if (a.state !== "running") { a.resume?.(); return; } // etkileşimden önce: atla, biriktirme
        const now = a.currentTime;
        if (now - (last[kind] ?? -1) < (GAP[kind] ?? 0.025)) return;
        last[kind] = now;
        try { SOUNDS[kind](); } catch { /* ses çalınamadıysa arayüz sessiz devam eder */ }
    }

    window.SFX = { play };

    // ===== Arayüzdeki tıklamalar (tek dinleyici) =====
    // data-sfx="ad" bir öğeye kendi sesini verir, data-sfx="none" susturur.
    // Kendi sesini kendisi çalan öğeler (sayfa geçişi, Nova, konsol) burada atlanır.
    const CLICKABLE = 'button, a[href], [role="button"], [role="tab"], input[type="checkbox"], input[type="radio"], .chip';
    const OWN_SOUND = '[data-overview], #consoleToggle, #aiHexBtn, #aiMic, #aiForm, #aiHints, .page-chip, .sliver';

    document.addEventListener("click", (event) => {
        const el = event.target.closest?.(CLICKABLE);
        if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
        const own = el.closest("[data-sfx]")?.dataset.sfx;
        if (own) return own === "none" ? undefined : play(own);
        if (el.closest(OWN_SOUND)) return;
        if (el.matches('input[type="checkbox"], input[type="radio"]')) {
            return play(el.checked ? "toggleOn" : "toggleOff", el.name === "sfx" && el.checked); // sesi açarken onay sesi duyulsun
        }
        if (el.matches("a[href]")) {
            const href = el.getAttribute("href");
            if (href.startsWith("#") && href !== location.hash) return; // geçişin sesi hashchange'te
            return play("tap");
        }
        if (el.type === "submit") return play("send");
        if (el.matches('[role="tab"], [aria-pressed], [aria-selected], .chip')) return play("select");
        play("tap");
    }, true);

    document.addEventListener("change", (event) => {
        if (event.target.matches?.("select")) play("select");
    }, true);

    document.addEventListener("input", (event) => {
        if (event.target.matches?.('input[type="range"]')) play("tick");
    }, true);

    // Sayfa geçişleri (menü, kaydırma, sürükleme, Nova komutları hepsi hash üzerinden gider)
    addEventListener("hashchange", () => play("nav"));

    // Pencere ve açılır bölümler
    new MutationObserver((records) => {
        for (const r of records) {
            const el = r.target;
            const wasOpen = r.oldValue !== null;
            if (el.open === wasOpen) continue;
            if (el.tagName === "DIALOG") play(el.open ? "open" : "close");
            else if (el.tagName === "DETAILS") play(el.open ? "toggleOn" : "toggleOff");
        }
    }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["open"], attributeOldValue: true });

    // Giriş yapıldı: panel açılış sesi
    addEventListener("hud:app", (event) => play(event.detail ? "boot" : "close"));
})();
