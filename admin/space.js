// ONY Panel kokpiti: beş bölüm sıralı bir halkada durur. Ortadaki ekran odaktaki bölümdür; sol ve sağ kanat halkadaki
// önceki ve sonraki bölümü içe dönük perspektifle gösterir, kalan ikisi kanatların arkasında bekler.
// Hangi bölümün ortada olduğuna yine admin.js karar verir (location.hash → route()); burada `.view` öğelerinin `hidden`
// durumu izlenir. Böylece veri yükleme ve "kaydedilmemiş değişiklik" uyarısı her geçişte tek yerde kalır.
// Her sayfa, kutusunu ekrandaki bir dörtgene eşleyen bir matrix3d ile yerleştirilir: hareket yalnızca transform ve opacity'dir.
(() => {
    const KEY = "hud.cockpit";
    const VIEWS = ["haberler", "projeler", "blog", "kaynaklar", "bildirimler"];
    const NAMES = { haberler: "Haber Ağı", projeler: "Projeler", blog: "Blog", kaynaklar: "Kaynaklar", bildirimler: "Bildirimler" };
    const ICONS = { haberler: "◉", projeler: "▣", blog: "✎", kaynaklar: "⚙", bildirimler: "⚑" };
    const N = VIEWS.length;
    const mobileMq = matchMedia("(max-width: 760px)");
    const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const mod = (n, m) => ((n % m) + m) % m;
    const wrapRel = (d) => mod(d + N / 2, N) - N / 2; // halkada en kısa yoldan uzaklık: [-2.5, 2.5)

    const root = document.documentElement;
    const app = $("#appView");
    const space = $("#main");
    const hint = $("#spaceHint");
    const dock = $("#ai");
    const probe = $("#ckProbe");
    const wins = new Map(VIEWS.map(v => [v, space.querySelector(`.win[data-win="${v}"]`)]));
    const viewEl = (v) => wins.get(v).querySelector(".view");

    // ===== Kayıt =====
    try { localStorage.removeItem("hud.space"); } catch { /* eski serbest yerleşim kaydı */ }

    function parse(d) {
        d = d && typeof d === "object" ? d : {};
        const order = Array.isArray(d.order) && d.order.length === N && VIEWS.every(v => d.order.includes(v)) ? [...d.order] : [...VIEWS];
        return { order, slim: d.slim === true };
    }

    function load() {
        try { return parse(JSON.parse(localStorage.getItem(KEY))); } catch { return parse(null); }
    }

    // Düzen merkezde tutulur (sync.js); localStorage bu cihazdaki önbellektir
    let store = load();
    const saveLocal = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* depolama kapalı: düzen bu oturumda geçerli */ } };
    const save = () => { saveLocal(); window.PREFS?.push("cockpit", { order: [...store.order], slim: store.slim }); };
    const idx = (v) => store.order.indexOf(v);

    // ===== Ölçüler =====
    // Ortadaki ekran, vizör ve konsol aynı dikey eksende ve aynı genişliktedir; kanatlar ayna simetriğidir.
    let G = null;

    function measure() {
        const W = space.clientWidth, H = space.clientHeight;
        if (!W || !H) return null;
        const cs = getComputedStyle(probe);
        const safeTop = parseFloat(cs.paddingTop) || 0;
        const safeBottom = parseFloat(cs.paddingBottom) || 0;
        const mobile = mobileMq.matches;
        const g = mobile ? 6 : Math.round(clamp(W * 0.009, 10, 18));
        const visor = mobile ? 52 : 62;
        const dockH = mobile ? 64 : store.slim ? 58 : 178;
        const side = mobile ? 0 : Math.round(clamp((W - 760) * 0.3, 56, 280)); // kanadın iç kenarının x'i
        const cx = mobile ? 6 : side + g;
        const top = visor + safeTop + g;
        const ch = Math.max(140, H - dockH - safeBottom - g - top);
        return {
            W, H, g, mobile, side, cx, top, ch, visor, dock: dockH,
            cw: W - 2 * cx,
            ww: mobile ? W - 2 * cx : Math.round(clamp(side * 2.2, 300, 520)), // kanattaki sayfanın yerleşim genişliği
        };
    }

    function applyVars() {
        const set = (k, v) => root.style.setProperty(`--ck-${k}`, `${v}px`);
        for (const k of ["g", "side", "cx", "cw", "top", "ch", "ww", "visor", "dock"]) set(k, G[k]);
    }

    // ===== Dörtgenler: [x0,y0, x1,y1, x2,y2, x3,y3] = sol üst, sağ üst, sağ alt, sol alt =====
    const rect = (x, y, w, h) => [x, y, x + w, y, x + w, y + h, x, y + h];
    const shift = (q, dx, dy = 0) => q.map((n, i) => n + (i % 2 ? dy : dx));
    const lerpQ = (a, b, t) => a.map((n, i) => n + (b[i] - n) * t);

    // k: -2…2 → halkadaki yuva. ±1 kanatlar: dış kenar ekranın tam boyu, iç kenar ana ekranın üst ve alt çizgisinde.
    function slotQuad(k) {
        const { W, H, mobile, side, cx, cw, top, ch } = G;
        const center = rect(cx, top, cw, ch);
        if (!k) return center;
        if (mobile) return shift(center, k * (W + 24));
        const s = Math.sign(k);
        const wing = s < 0
            ? [0, 0, side, top, side, top + ch, 0, H]
            : [W - side, top, W, 0, W, H, W - side, top + ch];
        return Math.abs(k) === 1 ? wing : shift(wing, s * (side + 40));
    }

    // Genel görünümde i. kartın dörtgeni (kartlar ana ekranın en-boy oranında)
    function gridQuad(i) {
        const { W, mobile, top, ch, cw } = G;
        const cols = mobile ? 2 : 3;
        const rows = Math.ceil(N / cols);
        const padX = mobile ? 12 : 36;
        const gap = mobile ? 12 : 26;
        const areaTop = top + (mobile ? 52 : 8);
        const areaH = ch - (mobile ? 60 : 64);
        const cellW = (W - 2 * padX - gap * (cols - 1)) / cols;
        const cellH = (areaH - gap * (rows - 1)) / rows;
        const s = Math.max(0.05, Math.min(cellW / cw, cellH / ch));
        const w = cw * s, h = ch * s;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, N - row * cols);
        const rowW = inRow * cellW + (inRow - 1) * gap;
        const x = (W - rowW) / 2 + (i % cols) * (cellW + gap) + (cellW - w) / 2;
        const y = areaTop + row * (cellH + gap) + (cellH - h) / 2;
        return { q: rect(x, y, w, h), s };
    }

    // Kutudan (w×h, sol üstü ox,oy) dörtgene izdüşüm (Heckbert'in kare→dörtgen eşlemesi), transform-origin: 0 0
    function homography(w, h, q, ox, oy) {
        const [x0, y0, x1, y1, x2, y2, x3, y3] = q.map((n, i) => n - (i % 2 ? oy : ox));
        const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
        const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
        let g = 0, k = 0;
        if (Math.abs(dx3) > 1e-6 || Math.abs(dy3) > 1e-6) {
            const den = dx1 * dy2 - dx2 * dy1;
            g = (dx3 * dy2 - dx2 * dy3) / den;
            k = (dx1 * dy3 - dx3 * dy1) / den;
        }
        const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3;
        const d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
        const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1];
        return `matrix3d(${m.map(n => +n.toPrecision(8)).join(",")})`;
    }

    // ===== Durum =====
    let front = null;    // ortadaki bölüm (admin.js'nin gösterdiği)
    let ringPos = 0;     // halkanın sürekli konumu: ortadaki yuvaya denk gelen sıra indeksi
    let overview = false;
    let pending = null;  // ortayı değiştiren yer değişimi: uyarı geçişi iptal ederse geri alınır
    const shown = new Map(); // sayfa → ekrandaki son poz { q, op, dim }

    function pose(v, pos) {
        if (overview) {
            const { q, s } = gridQuad(idx(v));
            return { q, op: 1, dim: 0, rel: 0, k: clamp(0.9 / s, 1, 3.5) };
        }
        const rel = wrapRel(idx(v) - pos);
        const a = Math.abs(rel), s = rel < 0 ? -1 : 1;
        const lo = Math.floor(a);
        const q = lo >= 2 ? slotQuad(2 * s) : lerpQ(slotQuad(lo * s), slotQuad((lo + 1) * s), a - lo);
        const op = G.mobile ? (a < 0.999 ? 1 : 0) : a <= 1 ? 1 : clamp(1 - (a - 1) / 0.7, 0, 1);
        const dim = G.mobile ? 0 : Math.min(a, 1) * 0.42 + Math.max(0, a - 1) * 0.3;
        return { q, op, dim, rel, k: 1 };
    }

    // Kanattaki sayfa dar bir kutuya yerleşir (içerik ona göre akar); ortadaki ve genel görünümdekiler geniş kutudadır
    function setBoxes(target) {
        for (const v of VIEWS) {
            const narrow = !overview && !G.mobile && Math.round(wrapRel(idx(v) - target)) !== 0;
            wins.get(v).classList.toggle("is-narrow", narrow);
        }
    }

    function place(v, p, z) {
        const win = wins.get(v);
        const bw = win.classList.contains("is-narrow") ? G.ww : G.cw;
        const home = rect(G.cx, G.top, bw, G.ch);
        const still = p.q.every((n, i) => Math.abs(n - home[i]) < 0.01);
        win.style.transform = still ? "none" : homography(bw, G.ch, p.q, G.cx, G.top); // ortadaki ekranda dönüşüm yok: yazı net kalır
        win.style.opacity = p.op < 1 ? p.op.toFixed(3) : "";
        win.style.visibility = p.op < 0.01 ? "hidden" : "";
        win.style.zIndex = z ?? 30 - Math.round(Math.min(2, Math.abs(p.rel)) * 10);
        win.style.setProperty("--dim", p.dim.toFixed(3));
        win.style.setProperty("--k", p.k.toFixed(2));
        win.classList.toggle("is-right", p.rel > 0.001);
        shown.set(v, { q: p.q, op: p.op, dim: p.dim, k: p.k });
    }

    function draw() {
        if (!G) return;
        for (const v of VIEWS) place(v, pose(v, ringPos));
    }

    // ===== Canlandırma: halka konumu hedefe kayar; başlangıçtaki fark (sürükleme, düzen değişimi) sönümlenir =====
    let anim = null;
    let raf = 0;
    const motionOn = () => !root.classList.contains("no-motion") && !reduceMq.matches;

    function animateTo(target) {
        if (!G) return;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        setBoxes(target);
        const a = ringPos;
        const corr = new Map();
        let still = a === target;
        for (const v of VIEWS) {
            const s = shown.get(v), p = pose(v, a);
            const c = s ? { q: s.q.map((n, i) => n - p.q[i]), op: s.op - p.op, dim: s.dim - p.dim, k: s.k - p.k } : null;
            if (c && (c.q.some(n => Math.abs(n) > 0.5) || Math.abs(c.op) > 0.01)) still = false;
            corr.set(v, c);
        }
        if (still || !motionOn()) {
            anim = null;
            ringPos = mod(target, N);
            space.classList.remove("is-moving");
            draw();
            markState();
            return;
        }
        anim = { a, b: target, corr, t0: performance.now(), dur: 520 + 140 * Math.min(2, Math.abs(target - a)) };
        space.classList.add("is-moving");
        step(anim.t0); // ilk kare hemen: kutu boyu değiştiyse bir kare bile sıçramasın
    }

    function step(now) {
        raf = 0;
        if (!anim) return;
        const t = clamp((now - anim.t0) / anim.dur, 0, 1);
        const e = 1 - (1 - t) ** 3;
        ringPos = anim.a + (anim.b - anim.a) * e;
        for (const v of VIEWS) {
            const p = pose(v, ringPos);
            const c = anim.corr.get(v);
            if (c) {
                const r = 1 - e;
                p.q = p.q.map((n, i) => n + c.q[i] * r);
                p.op = clamp(p.op + c.op * r, 0, 1);
                p.dim = Math.max(0, p.dim + c.dim * r);
                p.k = Math.max(1, p.k + c.k * r);
            }
            place(v, p);
        }
        if (t < 1) { raf = requestAnimationFrame(step); return; }
        anim = null;
        ringPos = mod(Math.round(ringPos), N);
        space.classList.remove("is-moving");
        draw();
        markState();
    }

    function stopAnim() {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (anim) { anim = null; space.classList.remove("is-moving"); }
    }

    // Ortadaki bölüme dön (en kısa yoldan)
    function toFront() {
        if (!G || !front) return;
        const target = Math.round(ringPos + wrapRel(idx(front) - ringPos));
        animateTo(target);
    }

    // ===== Görünür durum: odak, erişilebilirlik, vizördeki halka göstergesi, konsoldaki sayfa seçici =====
    const ticks = $("#ringTicks");
    const chips = $("#pageChips");
    const sliverPrev = $("#sliverPrev");
    const sliverNext = $("#sliverNext");

    ticks.innerHTML = VIEWS.map(v => `<button type="button" class="tick" data-page="${v}" aria-label="${NAMES[v]}" title="${NAMES[v]}"><i></i></button>`).join("");
    chips.innerHTML = VIEWS.map(v =>
        `<button type="button" class="page-chip" data-page="${v}" title="${NAMES[v]}"><span class="pc-ico" aria-hidden="true">${ICONS[v]}</span><span class="pc-name">${NAMES[v]}</span>${v === "haberler" ? `<b class="badge" hidden></b>` : ""}<i class="pc-slot"></i></button>`).join("");

    // Okunmamış rozeti: Haber Ağı penceresindeki rozeti yansıtır
    const newsBadge = $("#newsBadge");
    const chipBadge = chips.querySelector(".badge");
    const mirrorBadge = () => { chipBadge.hidden = newsBadge.hidden; chipBadge.textContent = newsBadge.textContent; };
    new MutationObserver(mirrorBadge).observe(newsBadge, { childList: true, characterData: true, subtree: true, attributes: true });
    mirrorBadge();

    const SLOT_NAMES = { "-1": "Sol", 0: "Merkez", 1: "Sağ" };

    function markState() {
        const c = front ? idx(front) : 0;
        VIEWS.forEach(v => {
            const win = wins.get(v);
            const isFront = v === front && !overview;
            win.classList.toggle("is-front", isFront);
            win.classList.toggle("is-current", v === front);
            win.querySelector(".win-body").inert = !isFront;
            const title = win.querySelector(".win-title");
            if (v === front) title.setAttribute("aria-current", "page"); else title.removeAttribute("aria-current");
        });
        $$(".side-nav a").forEach(a => {
            if (a.dataset.view === front) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        });
        // Halka göstergesi halka sırasıyla dizilir
        for (const v of store.order) {
            const t = ticks.querySelector(`[data-page="${v}"]`);
            ticks.append(t);
            const rel = wrapRel(idx(v) - c);
            t.classList.toggle("is-c", rel === 0);
            t.classList.toggle("is-w", Math.abs(rel) === 1);
            if (rel === 0) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
        }
        for (const chip of chips.children) {
            const rel = wrapRel(idx(chip.dataset.page) - c);
            const name = SLOT_NAMES[rel] || "";
            chip.dataset.slot = name ? rel : "";
            chip.querySelector(".pc-slot").textContent = name;
            if (rel === 0) chip.setAttribute("aria-current", "page"); else chip.removeAttribute("aria-current");
        }
        const prev = store.order[mod(c - 1, N)], next = store.order[mod(c + 1, N)];
        sliverPrev.dataset.page = prev;
        sliverNext.dataset.page = next;
        sliverPrev.setAttribute("aria-label", `Önceki sayfa: ${NAMES[prev]}`);
        sliverNext.setAttribute("aria-label", `Sonraki sayfa: ${NAMES[next]}`);
    }

    // ===== Ortadaki bölüm: admin.js'nin gösterdiği bölüm =====
    const current = () => VIEWS.find(v => !viewEl(v).hidden) || null;

    function sync() {
        const v = current();
        if (v === front) return;
        front = v;
        if (overview) setOverview(false); else toFront();
    }

    const viewWatch = new MutationObserver(sync);
    VIEWS.forEach(v => viewWatch.observe(viewEl(v), { attributes: true, attributeFilter: ["hidden"] }));

    // route() hashchange'te çalışır; ardından sonucu oku: uyarı geçişi iptal ettiyse sayfalar yerine döner
    function settle() {
        const v = current();
        if (pending && v !== pending.want) { store.order = pending.prev; save(); }
        pending = null;
        if (v !== front) { front = v; if (overview) { setOverview(false); return; } }
        toFront();
    }
    window.addEventListener("hashchange", () => setTimeout(settle, 0));

    // Bir bölümü ortaya getir: karar admin.js'de (uyarı iptal edebilir)
    function go(v) {
        if (!wins.has(v)) return;
        if (v === front) { if (overview) setOverview(false); else toFront(); return; }
        if (location.hash.slice(1) === v) { toFront(); return; } // hash zaten bu: route() yine de çalışmaz
        location.hash = v;
    }

    function stepRing(n) {
        if (!front) return;
        go(store.order[mod(idx(front) + n, N)]);
    }

    // Halkada iki yerin değişimi. Ortadaki yuva değişirse geçiş location.hash üzerinden gider.
    function swap(i, j) {
        if (i === j) { toFront(); return; }
        const c = idx(front);
        const prev = [...store.order];
        [store.order[i], store.order[j]] = [store.order[j], store.order[i]];
        save();
        if (overview) { ringPos = idx(front); animateTo(ringPos); return; } // genel görünümde yalnızca sıra değişir
        const want = store.order[c];
        if (want === front) { animateTo(c); return; }
        pending = { prev, want };
        if (location.hash.slice(1) === want) { settle(); return; }
        location.hash = want;
    }

    // Bir sayfayı bir yuvaya koy (-1 sol, 0 orta, 1 sağ): o yuvadaki sayfayla yer değiştirir
    function assign(v, slot) {
        swap(idx(v), mod(idx(front) + slot, N));
    }

    // ===== Panel açılınca =====
    function onApp() {
        const visible = !app.hidden;
        root.classList.toggle("in-space", visible);
        if (!visible) {
            if (overview) setOverview(false);
            try { $("#userMenu").hidePopover?.(); } catch { /* zaten kapalı */ }
            $("#userMenu").classList.remove("is-open");
            return;
        }
        dock.classList.toggle("is-slim", store.slim);
        layout();
        front = current();
        if (front) ringPos = idx(front);
        stopAnim();
        setBoxes(Math.round(ringPos));
        draw();
        markState();
        if (motionOn()) { // açılışta ekranlar sırayla belirir
            space.classList.remove("is-entering");
            void space.offsetWidth;
            space.classList.add("is-entering");
            clearTimeout(enterTimer);
            enterTimer = setTimeout(() => space.classList.remove("is-entering"), 1200);
        }
    }
    let enterTimer = 0;

    function layout() {
        G = measure();
        if (G) applyVars();
    }

    // ===== Genel görünüm =====
    function setOverview(on) {
        on = !!on;
        if (on === overview) return;
        overview = on;
        window.SFX?.play(on ? "open" : "close");
        space.classList.toggle("is-overview", on);
        hint.hidden = !on;
        $$("[data-overview]").forEach(b => b.setAttribute("aria-pressed", String(on)));
        if (on) dock.removeAttribute("data-sheet");
        if (front) ringPos = Math.round(ringPos + wrapRel(idx(front) - ringPos));
        animateTo(Math.round(ringPos));
        if (on) wins.get(front || VIEWS[0]).querySelector(".win-title").focus({ preventScroll: true });
    }

    $$("[data-overview]").forEach(b => b.addEventListener("click", () => setOverview(!overview)));
    $$("[data-settings]").forEach(b => b.addEventListener("click", () => window.HUD?.openSettings?.()));

    function reset() {
        store.order = [...VIEWS];
        save();
        if (front) ringPos = idx(front); // sayfalar ekrandaki son pozlarından yeni yerlerine uçar
        animateTo(Math.round(ringPos));
    }

    $$("[data-space-reset]").forEach(b => b.addEventListener("click", reset));

    // ===== Konsolu daralt / aç =====
    const toggle = $("#consoleToggle");

    function setSlim(on) {
        store.slim = !!on;
        save();
        dock.classList.toggle("is-slim", store.slim);
        toggle.setAttribute("aria-expanded", String(!store.slim));
        toggle.title = store.slim ? "Konsolu aç" : "Konsolu daralt";
        window.SFX?.play(store.slim ? "close" : "open");
        if (store.slim) dock.dispatchEvent(new CustomEvent("console:slim")); // açık konuşma kaydı da kapansın
        if (!G) return;
        layout();
        animateTo(Math.round(ringPos));
    }
    toggle.addEventListener("click", () => setSlim(!store.slim));
    toggle.setAttribute("aria-expanded", String(!store.slim));
    toggle.title = store.slim ? "Konsolu aç" : "Konsolu daralt";

    // Başka cihazda değişen düzen (merkezden): uygulanır ama geri gönderilmez
    window.PREFS?.register("cockpit", {
        get: () => ({ order: [...store.order], slim: store.slim }),
        apply(remote) {
            const next = parse(remote);
            const slimChanged = next.slim !== store.slim;
            store = next;
            saveLocal();
            dock.classList.toggle("is-slim", store.slim);
            toggle.setAttribute("aria-expanded", String(!store.slim));
            toggle.title = store.slim ? "Konsolu aç" : "Konsolu daralt";
            if (slimChanged && store.slim) dock.dispatchEvent(new CustomEvent("console:slim"));
            if (!G || app.hidden) return;
            layout();
            if (front) ringPos = idx(front);
            markState();
            animateTo(Math.round(ringPos));
        },
    });

    // ===== Tıklama: kanattaki sayfa ya da kart ortaya gelir =====
    let dragEndAt = 0;

    space.addEventListener("click", (event) => {
        if (performance.now() - dragEndAt < 350) return; // sürükleme bitişi tıklama sayılmaz
        const sliver = event.target.closest(".sliver");
        if (sliver) { go(sliver.dataset.page); return; }
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

    ticks.addEventListener("click", (event) => {
        const t = event.target.closest(".tick");
        if (t) go(t.dataset.page);
    });

    // ===== Sürükleme =====
    // Başlık çubuğundan ya da kanattan yana sürüklemek halkayı döndürür; basılı tutup sürüklemek sayfayı kaldırır ve
    // bırakıldığı yuvadaki sayfayla yer değiştirir. Genel görünümde kart doğrudan taşınır.
    const NO_DRAG = "input, textarea, select, a[href], [contenteditable], button:not(.win-title), label, iframe, summary";
    const HOLD_MS = 380;
    let drag = null;
    let frame = 0;

    const stepPx = () => (G.mobile ? G.W : G.cw / 2 + G.side / 2);

    // Ekrandaki noktanın yuvası: genel görünümde kart indeksi, kokpitte -1 / 0 / 1
    function slotAt(x, y) {
        if (overview) {
            let best = 0, bestDist = Infinity;
            for (let i = 0; i < N; i++) {
                const q = gridQuad(i).q;
                const d = Math.hypot((q[0] + q[2]) / 2 - x, (q[1] + q[5]) / 2 - y);
                if (d < bestDist) { bestDist = d; best = i; }
            }
            return best;
        }
        if (G.mobile) return 0;
        if (x < G.cx - G.g / 2) return -1;
        if (x > G.W - G.cx + G.g / 2) return 1;
        return 0;
    }

    const slotIndex = (slot) => (overview ? slot : mod(idx(front) + slot, N));

    function markDrop(index) {
        VIEWS.forEach(v => wins.get(v).classList.toggle("is-drop", index != null && idx(v) === index && (!drag || v !== drag.v)));
    }

    space.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || drag || !G || !front) return;
        const win = event.target.closest(".win");
        if (!win) return;
        const v = win.dataset.win;
        const isFront = v === front && !overview;
        if (isFront && !event.target.closest(".win-bar")) return; // ortadaki sayfanın içeriği normal çalışır
        if (event.target.closest(NO_DRAG)) return;
        if (anim) stopAnim();
        drag = {
            v, win, id: event.pointerId, x0: event.clientX, y0: event.clientY, dx: 0, dy: 0, x: event.clientX, y: event.clientY,
            mode: null, base: Math.round(ringPos), touch: event.pointerType !== "mouse", hist: [],
        };
        if (!overview) drag.timer = setTimeout(lift, HOLD_MS);
    });

    function capture() {
        try { drag.win.setPointerCapture(drag.id); } catch { /* işaretçi gitti */ }
    }

    function lift() {
        if (!drag || drag.mode) return;
        drag.mode = "lift";
        capture();
        drag.q0 = shown.get(drag.v).q;
        drag.win.classList.add("is-lifted");
        space.classList.add("is-arranging");
        if (drag.touch) navigator.vibrate?.(12);
        if (!frame) frame = requestAnimationFrame(dragFrame);
    }

    space.addEventListener("pointermove", (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.x0;
        const dy = event.clientY - drag.y0;
        if (!drag.mode) {
            if (Math.hypot(dx, dy) < (drag.touch ? 10 : 5)) return;
            clearTimeout(drag.timer);
            if (overview) {
                drag.mode = "lift";
                drag.q0 = shown.get(drag.v).q;
                drag.win.classList.add("is-lifted");
            } else if (Math.abs(dx) > Math.abs(dy)) {
                drag.mode = "slide";
                space.classList.add("is-sliding");
            } else {
                drag.mode = "none"; // dikey hareket: bir şey yapma, tıklama da sayılmasın
                return;
            }
            capture();
        }
        if (drag.mode === "none") return;
        drag.dx = dx;
        drag.dy = dy;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.hist.push({ x: event.clientX, t: event.timeStamp });
        if (drag.hist.length > 6) drag.hist.shift();
        if (!frame) frame = requestAnimationFrame(dragFrame);
    });

    function dragFrame() {
        frame = 0;
        if (!drag) return;
        if (drag.mode === "slide") {
            ringPos = drag.base + clamp(-drag.dx / stepPx(), -1.35, 1.35);
            draw();
        } else if (drag.mode === "lift") {
            for (const v of VIEWS) if (v !== drag.v) place(v, pose(v, ringPos));
            const p = pose(drag.v, ringPos);
            place(drag.v, { ...p, q: shift(drag.q0, drag.dx, drag.dy), op: 1, dim: overview ? 0 : Math.min(p.dim, 0.15) }, 60);
            markDrop(slotIndex(slotAt(drag.x, drag.y)));
        }
    }

    // Bırakınca: yarım yuvadan fazla kaydırıldıysa ya da aynı yöne hızlı bir fiske varsa bir yuva ilerle
    function releaseSlide(base, hist, delta) {
        let v = 0;
        if (hist.length > 1) {
            const a = hist[0], b = hist[hist.length - 1];
            if (b.t - a.t > 0) v = (b.x - a.x) / (b.t - a.t);
            if (performance.now() - b.t > 120) v = 0; // durup bırakıldıysa fiske yok
        }
        const flick = -(v * 180) / stepPx();
        let steps = Math.round(delta); // sürükleme en fazla 1.35 yuva: bir hamlede tek adım
        if (!steps && (Math.abs(delta) > 0.22 || (Math.abs(flick) > 0.3 && Math.sign(flick) === Math.sign(delta)))) steps = Math.sign(delta);
        if (steps) go(store.order[mod(base + steps, N)]);
        else toFront();
    }

    function endDrag(event) {
        if (!drag || event.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        clearTimeout(d.timer);
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        try { d.win.releasePointerCapture(d.id); } catch { /* bırakılmış */ }
        if (!d.mode) return; // tıklama: click olayı halleder
        dragEndAt = performance.now();
        d.win.classList.remove("is-lifted");
        space.classList.remove("is-sliding", "is-arranging");
        markDrop(null);
        if (d.mode === "none") return;
        if (event.type !== "pointerup") { toFront(); return; }
        if (d.mode === "slide") {
            releaseSlide(d.base, d.hist, ringPos - d.base);
        } else {
            swap(idx(d.v), slotIndex(slotAt(event.clientX, event.clientY)));
        }
    }

    space.addEventListener("pointerup", endDrag);
    space.addEventListener("pointercancel", endDrag);
    space.addEventListener("lostpointercapture", (event) => { if (drag && drag.mode && event.pointerId === drag.id) endDrag(event); });

    // ===== Dokunarak kaydırma: ortadaki sayfanın içinde yatay fiske =====
    // Yatay kayan tablolar, alanlar ve önizlemeler kendi hareketini korur; dikey kaydırma tarayıcıda kalır.
    const NO_SWIPE = "input, textarea, select, [contenteditable], iframe, .preview-pane, .win-bar, input[type=range]";

    function inHScroll(el, stop) {
        for (; el && el !== stop; el = el.parentElement) {
            if (el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX)) return true;
        }
        return false;
    }

    let swipe = null;

    space.addEventListener("touchstart", (event) => {
        swipe = null;
        if (event.touches.length !== 1 || overview || drag || !G || !front) return;
        const t = event.target;
        const win = t.closest?.(".win");
        if (!win || win.dataset.win !== front || t.closest(NO_SWIPE)) return;
        if (inHScroll(t, win) || String(getSelection?.() || "")) return;
        const p = event.touches[0];
        swipe = { x0: p.clientX, y0: p.clientY, mode: null, base: Math.round(ringPos), hist: [] };
    }, { passive: true });

    space.addEventListener("touchmove", (event) => {
        if (!swipe) return;
        const p = event.touches[0];
        const dx = p.clientX - swipe.x0;
        const dy = p.clientY - swipe.y0;
        if (!swipe.mode) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
            if (Math.abs(dx) < Math.abs(dy) * 1.3) { swipe = null; return; } // dikey: sayfa kayar
            swipe.mode = "h";
            stopAnim();
            space.classList.add("is-sliding");
        }
        event.preventDefault();
        swipe.hist.push({ x: p.clientX, t: event.timeStamp });
        if (swipe.hist.length > 6) swipe.hist.shift();
        ringPos = swipe.base + clamp(-dx / stepPx(), -1.2, 1.2);
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); });
    }, { passive: false });

    function endSwipe() {
        const s = swipe;
        swipe = null;
        if (!s?.mode) return;
        space.classList.remove("is-sliding");
        dragEndAt = performance.now();
        releaseSlide(s.base, s.hist, ringPos - s.base);
    }
    space.addEventListener("touchend", endSwipe);
    space.addEventListener("touchcancel", endSwipe);

    // ===== Yatay tekerlek / dokunmatik yüzey =====
    let wheel = null;
    let wheelLock = 0;

    space.addEventListener("wheel", (event) => {
        if (!G || !front || overview || drag || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        const t = event.target;
        if (t.closest?.("input, textarea, select, [contenteditable]")) return;
        const win = t.closest?.(".win");
        if (win && win.dataset.win === front && inHScroll(t, win)) return; // tablo kendi kayar
        event.preventDefault();
        const now = performance.now();
        if (now < wheelLock) { wheelLock = now + 220; return; } // fiskenin süren ataleti yeni bir geçiş başlatmasın
        if (!wheel) { stopAnim(); wheel = { base: Math.round(ringPos), acc: 0, timer: 0 }; space.classList.add("is-sliding"); }
        wheel.acc += event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;
        ringPos = wheel.base + clamp(wheel.acc / (stepPx() * 0.9), -1.2, 1.2);
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); });
        clearTimeout(wheel.timer);
        const w = wheel;
        const finish = () => {
            if (wheel !== w) return;
            wheel = null;
            space.classList.remove("is-sliding");
            wheelLock = performance.now() + 220;
            releaseSlide(w.base, [], ringPos - w.base);
        };
        w.timer = setTimeout(finish, 140);
        if (Math.abs(ringPos - w.base) >= 0.6) { clearTimeout(w.timer); finish(); } // yeterince ilerledi: hemen yerleş
    }, { passive: false });

    // Odaklanan öğeyi göstermek için tarayıcı alanı kaydırmasın
    space.addEventListener("scroll", () => { space.scrollTop = 0; space.scrollLeft = 0; });

    // ===== Konsoldaki sayfa çipleri: tıklayınca ortaya gelir, sürükleyip bir ekrana bırakılır =====
    let chipDrag = null;

    chips.addEventListener("pointerdown", (event) => {
        const chip = event.target.closest(".page-chip");
        if (!chip || event.button !== 0) return;
        chipDrag = { chip, v: chip.dataset.page, id: event.pointerId, x0: event.clientX, y0: event.clientY, ghost: null };
    });

    chips.addEventListener("pointermove", (event) => {
        const d = chipDrag;
        if (!d || event.pointerId !== d.id || !G || !front) return;
        if (!d.ghost) {
            if (Math.hypot(event.clientX - d.x0, event.clientY - d.y0) < 6) return;
            try { d.chip.setPointerCapture(d.id); } catch { /* işaretçi gitti */ }
            d.ghost = d.chip.cloneNode(true);
            d.ghost.classList.add("chip-ghost");
            d.ghost.removeAttribute("aria-current");
            document.body.append(d.ghost);
            space.classList.add("is-arranging");
        }
        d.ghost.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
        const over = !dock.contains(document.elementFromPoint(event.clientX, event.clientY));
        d.over = over;
        markDrop(over ? slotIndex(slotAt(event.clientX, event.clientY)) : null);
    });

    function endChip(event) {
        const d = chipDrag;
        if (!d || event.pointerId !== d.id) return;
        chipDrag = null;
        if (!d.ghost) return;
        d.ghost.remove();
        space.classList.remove("is-arranging");
        markDrop(null);
        d.chip.dataset.dragged = "1";
        setTimeout(() => delete d.chip.dataset.dragged, 0);
        if (event.type === "pointerup" && d.over) {
            const slot = slotAt(event.clientX, event.clientY);
            if (overview) swap(idx(d.v), slot); else assign(d.v, slot);
        }
    }
    chips.addEventListener("pointerup", endChip);
    chips.addEventListener("pointercancel", endChip);

    chips.addEventListener("click", (event) => {
        const chip = event.target.closest(".page-chip");
        if (!chip || chip.dataset.dragged) return;
        dock.removeAttribute("data-sheet");
        go(chip.dataset.page);
    });

    // ===== Klavye =====
    const isField = (el) => el && (el.matches?.("input, textarea, select, iframe, [contenteditable], [contenteditable] *") || el.isContentEditable);

    document.addEventListener("keydown", (event) => {
        if (app.hidden || event.ctrlKey || event.metaKey) return;
        if (event.altKey && event.code === "KeyG") {
            event.preventDefault();
            setOverview(!overview);
        } else if (event.altKey && /^Digit[1-5]$/.test(event.code)) {
            event.preventDefault();
            go(VIEWS[Number(event.code.slice(5)) - 1]);
        } else if (event.key === "Escape" && overview && !$("dialog[open]") && !dock.classList.contains("is-log") && !dock.dataset.sheet) {
            setOverview(false);
            wins.get(front)?.querySelector(".win-title").focus({ preventScroll: true });
        } else if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !event.altKey && !event.shiftKey
            && !isField(document.activeElement) && !$("dialog[open]") && !event.defaultPrevented) {
            event.preventDefault();
            stepRing(event.key === "ArrowLeft" ? -1 : 1);
        }
    });

    // ===== Boyut değişimi =====
    function onResize() {
        if (app.hidden) return;
        layout();
        if (!G) return;
        if (!anim) { setBoxes(Math.round(ringPos)); draw(); }
    }
    window.addEventListener("resize", onResize);
    mobileMq.addEventListener("change", () => { dock.removeAttribute("data-sheet"); onResize(); });

    new MutationObserver(onApp).observe(app, { attributes: true, attributeFilter: ["hidden"] });
    onApp();

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
        step: stepRing,
        // Asistanın "aşağı kaydır" komutu ortadaki sayfanın içini kaydırır
        scroller: () => (front ? wins.get(front).querySelector(".win-body") : null),
    };
})();
