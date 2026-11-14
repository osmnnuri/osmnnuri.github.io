// ONY Panel uzay pencereleri: bölümler boşlukta süzülen pencerelerdir; seçilen öne gelir, hepsi sürüklenebilir.
// Hangi pencerenin önde olduğuna admin.js karar verir (location.hash → route()); burada yalnızca `.view` öğelerinin
// `hidden` durumu izlenir. Böylece veri yükleme ve "kaydedilmemiş değişiklik" uyarısı tek yerde kalır.
(() => {
    const KEY = "hud.space";
    const VIEWS = ["haberler", "projeler", "blog", "kaynaklar", "bildirimler"];
    const P = 1400; // space.css'teki perspective ile aynı olmalı
    const mobile = matchMedia("(max-width: 760px)");

    // Varsayılan yerler: [x, y, s]. x ve y alanın yarı genişliğine/yüksekliğine oranla merkezden uzaklık, s görünen ölçek.
    const HOME = {
        haberler: [-0.72, -0.5, 0.34],
        projeler: [0.73, -0.48, 0.32],
        blog: [-0.74, 0.52, 0.3],
        kaynaklar: [0.72, 0.52, 0.33],
        bildirimler: [-0.8, 0.02, 0.24],
    };

    const $ = (sel) => document.querySelector(sel);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const app = $("#appView");
    const space = $("#main");
    const hint = $("#spaceHint");
    const btn = $("#spaceBtn");
    const wins = new Map(VIEWS.map(v => [v, space.querySelector(`.win[data-win="${v}"]`)]));
    const viewEl = (v) => wins.get(v).querySelector(".view");

    // ===== Kayıt =====
    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(KEY)) || {};
            const order = Array.isArray(d.order) && d.order.length === VIEWS.length && VIEWS.every(v => d.order.includes(v)) ? d.order : [...VIEWS];
            const pos = {};
            for (const v of VIEWS) {
                const p = d.pos?.[v];
                if (Array.isArray(p) && p.length === 3 && p.every(Number.isFinite)) pos[v] = p;
            }
            return { pos, order };
        } catch {
            return { pos: {}, order: [...VIEWS] };
        }
    }

    let store = load();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* depolama kapalı: düzen bu oturumda geçerli */ } };
    const posOf = (v) => store.pos[v] || HOME[v];

    // ===== Yerleşim =====
    let front = null;
    let overview = false;

    // Görünen ölçek s ve merkezden ekran uzaklığı (dx, dy) için 3B dönüşüm: perspektif s oranında küçültür
    function transformFor(dx, dy, s, ry = 0, rx = 0) {
        const z = P - P / s;
        return `translate3d(${(dx / s).toFixed(1)}px, ${(dy / s).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    }

    function measure() {
        const any = wins.get(VIEWS[0]);
        return { W: space.clientWidth, H: space.clientHeight, w: any.offsetWidth, h: any.offsetHeight };
    }

    // Genel görünümde i. kartın merkezi ve ölçeği
    function slot(i, m) {
        const small = mobile.matches;
        const cols = small ? 2 : 3;
        const rows = Math.ceil(VIEWS.length / cols);
        const padX = small ? 14 : 48;
        const padTop = small ? 64 : 36;
        const padBottom = small ? 24 : 84;
        const gap = small ? 14 : 36;
        const cellW = (m.W - 2 * padX - gap * (cols - 1)) / cols;
        const cellH = (m.H - padTop - padBottom - gap * (rows - 1)) / rows;
        const s = Math.max(0.05, Math.min(cellW / m.w, cellH / m.h));
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, VIEWS.length - row * cols);
        const rowW = inRow * cellW + (inRow - 1) * gap;
        const cx = (m.W - rowW) / 2 + (i % cols) * (cellW + gap) + cellW / 2;
        const cy = padTop + row * (cellH + gap) + cellH / 2;
        return { dx: cx - m.W / 2, dy: cy - m.H / 2, s };
    }

    // Arka pencerenin ekrandaki yeri ve eğimi: kenardakiler izleyiciye dönük durur
    function bgPose(v, m) {
        const [x, y, s] = posOf(v);
        return { dx: x * m.W / 2, dy: y * m.H / 2, s, ry: x < 0 ? 16 : -16, rx: y * 8 };
    }

    function paint(win, { transform, z, k = 1, dim = 0, cls }) {
        win.style.transform = transform;
        win.style.zIndex = z;
        win.style.setProperty("--k", k.toFixed(2));
        win.style.setProperty("--dim", dim.toFixed(2));
        for (const c of ["is-front", "is-bg", "is-away", "is-right"]) win.classList.toggle(c, cls.includes(c));
    }

    function render() {
        const m = measure();
        if (!m.W || !m.w) return; // panel gizli
        VIEWS.forEach((v, i) => {
            const win = wins.get(v);
            const isFront = v === front;
            const body = win.querySelector(".win-body");
            body.inert = overview || !isFront;
            const title = win.querySelector(".win-title");
            if (isFront) title.setAttribute("aria-current", "page"); else title.removeAttribute("aria-current");

            if (overview) {
                const p = slot(store.order.indexOf(v), m);
                paint(win, { transform: transformFor(p.dx, p.dy, p.s, 0, 3), z: 10 + i, k: clamp((mobile.matches ? 0.55 : 1) / p.s, 1, 4), cls: isFront ? ["is-front", "is-bg"] : ["is-bg"] });
            } else if (isFront) {
                paint(win, { transform: "none", z: 100, cls: ["is-front"] });
            } else if (mobile.matches && front) {
                paint(win, { transform: transformFor(0, 0, 0.8), z: 1, cls: ["is-away"] });
            } else {
                const p = bgPose(v, m);
                paint(win, {
                    transform: transformFor(p.dx, p.dy, p.s, p.ry, p.rx),
                    z: Math.round(p.s * 100),
                    k: clamp(0.95 / p.s, 1, 3.5),
                    dim: clamp(0.62 - p.s * 0.6, 0.3, 0.55),
                    cls: p.dx > 0 ? ["is-bg", "is-right"] : ["is-bg"],
                });
            }
        });
        document.querySelectorAll(".side-nav a").forEach(a => {
            if (a.dataset.view === front) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        });
    }

    // Süzülme ritmi her pencerede farklı olsun
    VIEWS.forEach((v, i) => {
        const win = wins.get(v);
        win.style.setProperty("--dur", `${8 + i * 1.3}s`);
        win.style.setProperty("--delay", `${-i * 2.1}s`);
    });

    // ===== Öndeki pencere: admin.js'nin gösterdiği bölüm =====
    const current = () => VIEWS.find(v => !viewEl(v).hidden) || null;

    function sync() {
        const v = current();
        if (v === front) return;
        front = v;
        if (overview) setOverview(false); else render();
    }

    const viewWatch = new MutationObserver(sync);
    VIEWS.forEach(v => viewWatch.observe(viewEl(v), { attributes: true, attributeFilter: ["hidden"] }));

    // Panel açılınca pencereler önce derinlikte belirir, ardından seçili olan öne uçar
    function onApp() {
        const visible = !app.hidden;
        document.documentElement.classList.toggle("in-space", visible);
        if (!visible) {
            if (overview) setOverview(false);
            try { $("#userMenu").hidePopover?.(); } catch { /* zaten kapalı */ }
            $("#userMenu").classList.remove("is-open");
            return;
        }
        space.classList.add("is-instant");
        front = null;
        render();
        void space.offsetWidth; // geçişsiz durumu uygula
        space.classList.remove("is-instant");
        front = current();
        render();
    }
    new MutationObserver(onApp).observe(app, { attributes: true, attributeFilter: ["hidden"] });
    onApp();

    // Bir pencereyi öne getir: karar admin.js'de (uyarı iptal edebilir)
    function go(v) {
        if (!wins.has(v)) return;
        if (v === front) { if (overview) setOverview(false); return; }
        location.hash = v;
    }

    // ===== Genel görünüm =====
    function setOverview(on) {
        on = !!on;
        if (on === overview) return;
        overview = on;
        space.classList.toggle("is-overview", on);
        hint.hidden = !on;
        btn.setAttribute("aria-pressed", String(on));
        render();
        if (on) wins.get(front || VIEWS[0]).querySelector(".win-title").focus({ preventScroll: true });
    }

    btn.addEventListener("click", () => setOverview(!overview));

    function reset() {
        store = { pos: {}, order: [...VIEWS] };
        try { localStorage.removeItem(KEY); } catch { /* yok say */ }
        render();
    }

    document.querySelectorAll("[data-space-reset]").forEach(b => b.addEventListener("click", reset));

    // ===== Tıklama: arkadaki pencere ya da kart öne gelir =====
    let dragEndAt = 0;

    space.addEventListener("click", (event) => {
        if (performance.now() - dragEndAt < 350) return; // sürükleme bitişi tıklama sayılmaz
        const win = event.target.closest(".win");
        if (!win) {
            if (overview && !event.target.closest(".space-hint")) setOverview(false);
            return;
        }
        if (overview || win.dataset.win !== front) {
            event.preventDefault();
            go(win.dataset.win);
        }
    });

    // ===== Sürükle bırak =====
    let drag = null;
    let frame = 0;

    space.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || drag) return;
        const win = event.target.closest(".win");
        if (!win) return;
        const v = win.dataset.win;
        const isFront = v === front && !overview;
        if (isFront && !event.target.closest(".win-bar")) return; // öndeki pencerenin içeriği normal çalışır
        if (event.target.closest("input, textarea, select, a[href], [contenteditable], button:not(.win-title)")) return;
        const m = measure();
        const start = overview ? slot(store.order.indexOf(v), m) : isFront ? { dx: 0, dy: 0, s: 1 } : bgPose(v, m);
        drag = { win, v, m, start, isFront, id: event.pointerId, x0: event.clientX, y0: event.clientY, ddx: 0, ddy: 0, moved: false };
    });

    function poseWhileDragging() {
        frame = 0;
        if (!drag) return;
        const { win, start, ddx, ddy } = drag;
        if (drag.isFront) { // öndeki pencere esner, bırakınca yerine döner
            win.style.transform = `translate3d(${(ddx * 0.25).toFixed(1)}px, ${(ddy * 0.25).toFixed(1)}px, 0)`;
            return;
        }
        const dx = start.dx + ddx;
        const dy = start.dy + ddy;
        const x = dx / (drag.m.W / 2);
        const y = dy / (drag.m.H / 2);
        win.style.transform = overview ? transformFor(dx, dy, start.s * 1.04) : transformFor(dx, dy, start.s, x < 0 ? 16 : -16, clamp(y, -1, 1) * 8);
        if (!overview) win.classList.toggle("is-right", dx > 0);
    }

    space.addEventListener("pointermove", (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const ddx = event.clientX - drag.x0;
        const ddy = event.clientY - drag.y0;
        if (!drag.moved) {
            if (Math.hypot(ddx, ddy) < (event.pointerType === "touch" ? 10 : 5)) return;
            drag.moved = true;
            try { drag.win.setPointerCapture(event.pointerId); } catch { /* işaretçi gitti */ }
            drag.win.classList.add("is-dragging");
            drag.win.style.zIndex = 200;
            drag.win.style.willChange = "transform";
        }
        drag.ddx = ddx;
        drag.ddy = ddy;
        if (!frame) frame = requestAnimationFrame(poseWhileDragging);
    });

    function endDrag(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.moved) return;
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        dragEndAt = performance.now();
        d.win.classList.remove("is-dragging");
        d.win.style.willChange = "";
        const cancelled = event.type === "pointercancel";

        if (!cancelled && overview) {
            // En yakın kart yuvasıyla yer değiştir
            const cx = d.start.dx + d.ddx;
            const cy = d.start.dy + d.ddy;
            let best = 0;
            let bestDist = Infinity;
            VIEWS.forEach((_, i) => {
                const p = slot(i, d.m);
                const dist = Math.hypot(p.dx - cx, p.dy - cy);
                if (dist < bestDist) { bestDist = dist; best = i; }
            });
            const from = store.order.indexOf(d.v);
            [store.order[from], store.order[best]] = [store.order[best], store.order[from]];
            save();
        } else if (!cancelled && !d.isFront) {
            let dx = d.start.dx + d.ddx;
            const dy = d.start.dy + d.ddy;
            // Öndeki pencerenin tamamen arkasında kalmasın: kenardan en az 110 px görünsün
            const frontHalf = d.m.w / 2;
            const ownHalf = d.m.w * d.start.s / 2;
            if (front && !mobile.matches && Math.abs(dx) + ownHalf - frontHalf < 110) {
                dx = (dx < 0 || (dx === 0 && Math.random() < 0.5) ? -1 : 1) * (frontHalf - ownHalf + 110);
            }
            store.pos[d.v] = [clamp(dx / (d.m.W / 2), -0.98, 0.98), clamp(dy / (d.m.H / 2), -0.95, 0.95), d.start.s];
            save();
        }
        render();
    }

    space.addEventListener("pointerup", endDrag);
    space.addEventListener("pointercancel", endDrag);

    // Odaklanan öğeyi göstermek için tarayıcı alanı kaydırmasın
    space.addEventListener("scroll", () => { space.scrollTop = 0; space.scrollLeft = 0; });

    // ===== Klavye =====
    document.addEventListener("keydown", (event) => {
        if (app.hidden || event.ctrlKey || event.metaKey) return;
        if (event.altKey && event.code === "KeyG") {
            event.preventDefault();
            setOverview(!overview);
        } else if (event.altKey && /^Digit[1-5]$/.test(event.code)) {
            event.preventDefault();
            go(VIEWS[Number(event.code.slice(5)) - 1]);
        } else if (event.key === "Escape" && overview && !$("dialog[open]") && $("#aiPanel").hidden) {
            setOverview(false);
            wins.get(front)?.querySelector(".win-title").focus({ preventScroll: true });
        }
    });

    // ===== Boyut değişimi =====
    let resizeTimer = 0;
    function onResize() {
        space.classList.add("is-instant");
        render();
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => space.classList.remove("is-instant"), 150);
    }
    window.addEventListener("resize", onResize);
    mobile.addEventListener("change", onResize);

    // ===== Hesap menüsü: Popover API olmayan tarayıcılar için yedek =====
    const menu = $("#userMenu");
    if (!("popover" in HTMLElement.prototype)) {
        $("#userMenuBtn").addEventListener("click", () => menu.classList.toggle("is-open"));
        document.addEventListener("click", (event) => {
            if (!event.target.closest("#userMenu, #userMenuBtn")) menu.classList.remove("is-open");
        });
    }

    window.SPACE = {
        overview: setOverview,
        get isOverview() { return overview; },
        reset,
        go,
        // Asistanın "aşağı kaydır" komutu öndeki pencerenin içini kaydırır
        scroller: () => (front ? wins.get(front).querySelector(".win-body") : null),
    };
})();
