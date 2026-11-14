// ONY Panel sesli asistanı.
// Bilinen komutlar burada, tarayıcıda çözülür (INTENTS). Tanınmayan cümleler `assistant` edge function'ına gider;
// o da söylenecek metni ve aşağıdaki izinli eylem listesinden (ACTIONS) seçtiklerini döndürür.
// Asistan silme ve yayınlama yapamaz: bu eylemler listede yoktur.
(() => {
    const HUD = window.HUD;
    const S = HUD.settings;
    const $ = (sel) => document.querySelector(sel);
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const canSpeak = "speechSynthesis" in window;
    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);

    const ai = $("#ai"), panel = $("#aiPanel"), orb = $("#aiOrb"), logEl = $("#aiLog"), interimEl = $("#aiInterim"), micBtn = $("#aiMic");

    // ===== Durum =====
    let state = "idle"; // idle | listening | thinking | speaking
    const STATUS = { idle: "Hazır", listening: "Dinliyorum", thinking: "İşleniyor", speaking: "Konuşuyor" };

    function setState(next) {
        state = next;
        ai.dataset.state = next;
        $("#aiStatus").textContent = next === "idle" && wakeRec ? `"Hey ${S.name}" bekleniyor` : STATUS[next];
        micBtn.setAttribute("aria-pressed", String(next === "listening"));
        if (!S.motion) drawAll(performance.now());
    }

    // ===== Metin yardımcıları =====
    const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
    const fold = (text) => String(text).toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, ch => TR[ch])
        .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

    // Markdown'ı sesli okunabilir düz metne çevirir
    const plain = (md) => String(md || "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\[\d+\]/g, "")
        .replace(/^#{1,6}\s*(.+)$/gm, "$1.").replace(/^\s*[-*]\s+/gm, "").replace(/[*_`>#]/g, "")
        .replace(/\s+/g, " ").trim();

    function timeAgo(iso) {
        const s = (Date.now() - new Date(iso).getTime()) / 1000;
        if (s < 90) return "az önce";
        if (s < 3600) return `${Math.round(s / 60)} dakika önce`;
        if (s < 86400) return `${Math.round(s / 3600)} saat önce`;
        return `${Math.round(s / 86400)} gün önce`;
    }

    // ===== Ses efektleri =====
    let audio;
    function sfx(kind) {
        if (!S.sfx) return;
        try {
            audio ||= new AudioContext();
            const notes = { on: [660, 990], off: [520, 390], ok: [880], err: [220, 170] }[kind];
            notes.forEach((freq, i) => {
                const osc = audio.createOscillator(), gain = audio.createGain();
                const t = audio.currentTime + i * 0.09;
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.linearRampToValueAtTime(0.06, t + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
                osc.connect(gain).connect(audio.destination);
                osc.start(t);
                osc.stop(t + 0.17);
            });
        } catch { /* ses yoksa sessiz devam */ }
    }

    // ===== Sesli yanıt =====
    let speakToken = 0;
    let speakPulse = 0;

    function stopSpeaking() {
        speakToken++;
        if (canSpeak) speechSynthesis.cancel();
    }

    function speak(text) {
        if (!S.speak || !canSpeak || !text) return Promise.resolve();
        stopSpeaking();
        const token = speakToken;
        // Uzun metinler bazı tarayıcılarda yarıda kesildiği için cümle cümle okunur
        const chunks = [];
        for (const sentence of text.match(/[^.!?…\n]+[.!?…]*\s*/g) || [text]) {
            if (chunks.length && (chunks[chunks.length - 1] + sentence).length < 220) chunks[chunks.length - 1] += sentence;
            else chunks.push(sentence);
        }
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === S.voice) || voices.find(v => v.lang.toLowerCase().startsWith("tr"));
        setState("speaking");
        return new Promise((resolve) => {
            const next = () => {
                if (token !== speakToken || !chunks.length) return resolve();
                const u = new SpeechSynthesisUtterance(chunks.shift());
                u.lang = "tr-TR";
                if (voice) u.voice = voice;
                u.rate = S.rate;
                u.onboundary = () => { speakPulse = 1; };
                u.onend = next;
                u.onerror = () => resolve();
                speechSynthesis.speak(u);
            };
            next();
        });
    }

    // ===== Mikrofon seviyesi (hologram dalgası için; yalnızca masaüstünde, dinlerken) =====
    let meter = null;
    let micLevel = 0;

    async function startMeter() {
        if (isMobile || !navigator.mediaDevices?.getUserMedia || meter) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (state !== "listening") return stream.getTracks().forEach(t => t.stop());
            audio ||= new AudioContext();
            const analyser = audio.createAnalyser();
            analyser.fftSize = 256;
            audio.createMediaStreamSource(stream).connect(analyser);
            meter = { stream, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
        } catch { /* izin yoksa dalga benzetimle çizilir */ }
    }

    function stopMeter() {
        meter?.stream.getTracks().forEach(t => t.stop());
        meter = null;
        micLevel = 0;
    }

    // ===== Hologram çizimi =====
    const TAU = Math.PI * 2;
    let color = "#5cc8ff";
    let phase = 0, level = 0.1, lastFrame = 0;

    function readColor() { color = getComputedStyle(orb).color; }

    function draw(canvas, t) {
        const size = canvas.clientWidth;
        if (!size) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (canvas.width !== Math.round(size * dpr)) canvas.width = canvas.height = Math.round(size * dpr);
        const g = canvas.getContext("2d");
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, size, size);
        const c = size / 2, R = c - 3;
        g.strokeStyle = g.fillStyle = g.shadowColor = color;
        g.shadowBlur = size / 12;

        const arc = (r, from, len, alpha, width, dash = []) => {
            g.globalAlpha = alpha;
            g.lineWidth = width;
            g.setLineDash(dash);
            g.beginPath();
            g.arc(c, c, r, from, from + len);
            g.stroke();
        };
        arc(R, phase * 0.3, TAU, 0.4, 1, [2, 5]);
        for (let k = 0; k < 3; k++) arc(R * 0.86, phase + k * TAU / 3, 1.45, 0.95, Math.max(1.5, size / 50));
        for (let k = 0; k < 2; k++) arc(R * 0.72, -phase * 1.6 + k * Math.PI, 2.2, 0.6, 1);
        arc(R * 0.72, -phase * 1.6 + 2.5, 0.25, 1, Math.max(2, size / 36));

        // Ses dalgası: çekirdeğin çevresinde ışınsal çubuklar
        const bars = size < 100 ? 28 : 48;
        g.setLineDash([]);
        g.lineWidth = Math.max(1, size / 80);
        g.globalAlpha = 0.85;
        g.beginPath();
        for (let i = 0; i < bars; i++) {
            const a = (i / bars) * TAU + phase * 0.2;
            const wave = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + t * 0.006) * Math.cos(i * 0.6 - t * 0.004));
            const r0 = R * 0.4, r1 = r0 + R * (0.03 + 0.24 * level * wave);
            g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
            g.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
        }
        g.stroke();

        // Çekirdek
        const core = R * (0.17 + 0.09 * level);
        const glow = g.createRadialGradient(c, c, 0, c, c, core * 2);
        glow.addColorStop(0, color);
        glow.addColorStop(1, "transparent");
        g.globalAlpha = 0.35 + 0.5 * level;
        g.fillStyle = glow;
        g.beginPath();
        g.arc(c, c, core * 2, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
        g.fillStyle = color;
        g.beginPath();
        g.arc(c, c, core * 0.5, 0, TAU);
        g.fill();
    }

    function drawAll(t) {
        draw($("#aiOrbCanvas"), t);
        if (!panel.hidden) draw($("#aiHolo"), t);
    }

    function frame(t) {
        requestAnimationFrame(frame);
        if (!S.motion || document.hidden || ai.hidden) return;
        const dt = Math.min(0.05, (t - lastFrame) / 1000);
        lastFrame = t;
        phase += dt * { idle: 0.35, listening: 0.8, thinking: 3, speaking: 0.6 }[state];

        if (meter) {
            meter.analyser.getByteFrequencyData(meter.data);
            micLevel = Math.min(1, meter.data.reduce((a, b) => a + b, 0) / meter.data.length / 70);
        }
        speakPulse *= 0.92;
        const target = {
            idle: 0.14 + 0.06 * Math.sin(t * 0.002),
            listening: meter ? 0.2 + micLevel * 0.8 : 0.4 + 0.25 * Math.sin(t * 0.008),
            thinking: 0.3,
            speaking: 0.4 + 0.3 * speakPulse + 0.25 * Math.abs(Math.sin(t * 0.011)),
        }[state];
        level += (target - level) * 0.2;
        drawAll(t);
    }

    // ===== Panel ve kayıt =====
    const history = []; // edge function'a bağlam olarak giden son konuşmalar

    function openPanel() {
        if (!panel.hidden) return;
        panel.hidden = false;
        orb.setAttribute("aria-expanded", "true");
        if (!logEl.children.length) say(`Merhaba, ben ${S.name}. Mikrofona basıp konuşabilir ya da yazabilirsin. Neler yapabildiğimi görmek için "Ne yapabilirsin?" de.`, false);
        if (!S.motion) drawAll(performance.now());
    }

    function closePanel() {
        panel.hidden = true;
        orb.setAttribute("aria-expanded", "false");
    }

    function addLine(kind, text) {
        const p = document.createElement("p");
        p.className = kind;
        p.textContent = text;
        logEl.append(p);
        logEl.scrollTop = logEl.scrollHeight;
        history.push({ role: kind === "you" ? "user" : "assistant", text: text.slice(0, 400) });
        if (history.length > 8) history.shift();
    }

    // Yanıtı yazar; `aloud` verilirse onu, verilmezse metnin kendisini seslendirir
    function say(text, aloud = text) {
        addLine("bot", text);
        return aloud === false ? Promise.resolve() : speak(aloud);
    }

    // ===== Eylemler (asistanın yapabildiği her şey) =====
    const db = () => window.panel.sb;
    const VIEW_NAMES = { haberler: "Haber Ağı", projeler: "Projeler", blog: "Blog", kaynaklar: "Kaynaklar", bildirimler: "Bildirimler" };
    const KIND_NAMES = { all: "Tüm öğeler", haber: "Haberler", ilan: "İlanlar", firsat: "Fırsatlar", saved: "Kaydedilenler" };
    const currentView = () => $(".side-nav a.current")?.dataset.view || "haberler";

    async function goTo(view) {
        if (currentView() === view) return;
        location.hash = view;
        await sleep(80); // admin.js yönlendirmesi bölümü açsın
    }

    const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

    async function latestReport() {
        const { data, error } = await db().from("news_reports").select("report_date, title, summary, body_md")
            .order("report_date", { ascending: false }).limit(1);
        if (error) throw error;
        return data[0];
    }

    async function unreadCount() {
        const { count, error } = await db().from("news_items").select("id", { count: "exact", head: true }).eq("status", "new").gt("relevance", 0);
        if (error) throw error;
        return count || 0;
    }

    const ACTIONS = {
        async navigate(view) {
            if (!VIEW_NAMES[view]) return "";
            await goTo(view);
            return `${VIEW_NAMES[view]} açıldı.`;
        },
        async filter_kind(kind) {
            if (!KIND_NAMES[kind]) return "";
            await goTo("haberler");
            $(`#newsKinds [data-kind="${kind}"]`).click();
            return `${KIND_NAMES[kind]} gösteriliyor.`;
        },
        async search_news(query) {
            await goTo("haberler");
            const input = $("#newsSearch");
            input.value = String(query || "").slice(0, 80);
            fire(input, "input");
            return input.value ? `"${input.value}" için arama yapıldı.` : "Arama temizlendi.";
        },
        async sort_news(order) {
            await goTo("haberler");
            const select = $("#newsSort");
            select.value = order === "new" ? "new" : "rank";
            fire(select, "change");
            return select.value === "new" ? "En yeniler üstte." : "Önceliğe göre sıralandı.";
        },
        async refresh_news() {
            $("#refreshNews").click();
            return "Kaynakları tarıyorum; bittiğinde liste yenilenecek.";
        },
        async mark_all_read() {
            $("#markAllRead").click();
            return "Tüm haberler okundu sayıldı.";
        },
        async make_report() {
            $("#digestNow").click();
            return "Günlük rapor hazırlanıyor; bitince bildirim olarak gelecek.";
        },
        async read_report(mode) {
            const r = await latestReport();
            if (!r) return "Henüz yazılmış bir rapor yok.";
            const day = new Date(`${r.report_date}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
            const body = mode === "full" ? plain(r.body_md).slice(0, 4000) : r.summary;
            return `${day} raporu: ${r.title}. ${body}`;
        },
        async read_top_news(count) {
            const n = Math.min(10, Math.max(1, Number(count) || 3));
            const { data, error } = await db().from("news_feed").select("title, source_name")
                .eq("status", "new").gt("relevance", 0).order("rank", { ascending: false }).limit(n);
            if (error) throw error;
            if (!data.length) return "Okunmamış ilgili haber yok.";
            return `Öne çıkan ${data.length} başlık.\n` + data.map((x, i) => `${i + 1}. ${x.title}${x.source_name ? ` (${x.source_name})` : ""}.`).join("\n");
        },
        async unread_count() {
            const n = await unreadCount();
            return n ? `${n} okunmamış ilgili haber var.` : "Okunmamış ilgili haber yok.";
        },
        async briefing() {
            const hour = new Date().getHours();
            const hello = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
            const [n, report, sync] = await Promise.all([
                unreadCount(),
                latestReport().catch(() => null),
                db().from("news_sources").select("last_fetched_at").order("last_fetched_at", { ascending: false, nullsFirst: false }).limit(1),
            ]);
            const last = sync.data?.[0]?.last_fetched_at;
            const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
            return [
                `${hello}. Saat ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}.`,
                n ? `${n} okunmamış ilgili haber var.` : "Okunmamış ilgili haber yok.",
                last ? `Son tarama ${timeAgo(last)} yapıldı.` : "",
                report ? `${report.report_date === today ? "Bugünün raporu" : "Son rapor"}: ${report.title}. ${report.summary}` : "Henüz rapor yazılmadı.",
            ].filter(Boolean).join(" ");
        },
        async new_post(title) {
            $("#newPost").click(); // düzenleyici blog bölümünü kendisi açar
            const input = $('#postForm [name="title"]');
            if (title) { input.value = String(title).slice(0, 120); fire(input, "input"); }
            return title ? `"${input.value}" başlıklı taslak açıldı.` : "Yeni yazı taslağı açıldı.";
        },
        async new_project() {
            await goTo("projeler");
            $("#newProject").click();
            return "Yeni proje formu açıldı.";
        },
        async set_color(value) {
            const label = HUD.setColor(fold(value));
            return label ? `Arayüz rengi ${label} yapıldı.` : "Bu rengi tanımadım. Mavi, camgöbeği, yeşil, amber, kırmızı ya da mor diyebilirsin.";
        },
        async set_name(value) {
            const name = String(value || "").trim().replace(/^./, ch => ch.toLocaleUpperCase("tr"));
            if (!name) return "";
            HUD.set({ name });
            return `Tamam, bundan sonra adım ${S.name}.`;
        },
        async set_speech(on) {
            HUD.set({ speak: on === true || on === "on" });
            return S.speak ? "Sesli yanıt açık." : "Sesli yanıt kapatıldı; yazıyla yanıt vereceğim.";
        },
        async open_settings() {
            HUD.openSettings();
            return "Arayüz ayarları açıldı.";
        },
        async scroll(direction) {
            if (direction === "top") window.scrollTo({ top: 0, behavior: "smooth" });
            else window.scrollBy({ top: innerHeight * 0.8 * (direction === "up" ? -1 : 1), behavior: "smooth" });
            return "";
        },
    };

    const HELP = `Şunları yapabilirim:
• "Durum raporu ver": okunmamışlar, son tarama ve günün raporu
• "Raporu özetle" / "Raporun tamamını oku"
• "En önemli 5 haberi oku", "Kaç okunmamış haber var?"
• "Haberleri yenile", "Hepsini okundu say", "Raporu şimdi oluştur"
• "İlanları göster", "Yapay zeka ara", "En yeniye göre sırala"
• "Projelere git", "Yeni yazı aç", "Yeni proje aç"
• "Rengi kırmızı yap", "Arayüz ayarlarını aç"
• "Adın Atlas olsun", "Sesi kapat", "Sus"
Bunların dışındaki soruları yapay zekaya sorarım. Silme ve yayınlama işlemlerini yapmam.`;

    // ===== Komut eşleştirme =====
    // Her kural: [koşul(f, raw) → eşleşirse doğru bir değer, çalıştır(eşleşme, f, raw) → söylenecek metin]
    const COLOR_WORDS = HUD.presets.flatMap(p => p.words);
    const findColor = (f) => f.split(" ").map(w => COLOR_WORDS.find(c => w.startsWith(c))).find(Boolean);
    const VIEW_WORDS = [["bildirimler", /bildirim/], ["kaynaklar", /kaynak|ilgi alan/], ["projeler", /proje/], ["blog", /blog|yazilar/], ["haberler", /haber|ana sayfa|anasayfa/]];
    const NUMBERS = { iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10 };
    const NAV_VERB =/\b(git|gec|ac|goster|don|gidelim|gecelim)\b/;

    const INTENTS = [
        [f => /^(sus|dur|yeter|kes|iptal|tamam|sessiz ol)\b/.test(f) && f.split(" ").length <= 3, () => null],
        [(f, raw) => raw.match(/(?:ad[ıi]n|ismin)\s+(?:art[ıi]k\s+|bundan sonra\s+)?(.+?)\s+olsun/i) || raw.match(/sana\s+(?:art[ıi]k\s+|bundan sonra\s+)?(.+?)\s+di(?:yece[gğ]im|yelim|yeyim)/i),
            m => ACTIONS.set_name(m[1])],
        [f => /\b(adin|ismin) ne\b|kimsin/.test(f), () => `Adım ${S.name}. Ayarlardan ya da "adın ... olsun" diyerek değiştirebilirsin.`],
        [f => /ne yapabilirsin|neler yapabilirsin|yardim|komutlar/.test(f), () => ({ text: HELP, aloud: "Yapabildiklerimi listeledim. Rapor özetleyebilir, haberleri okuyup yenileyebilir, bölümler arasında gezebilir ve arayüz rengini değiştirebilirim." })],
        [f => /(sesi|sesli yaniti|konusmayi) (kapat|kis|kes)|sessiz mod/.test(f), () => ACTIONS.set_speech(false)],
        [f => /(sesi|sesli yaniti) ac|sesli (yanit|konus)/.test(f), () => ACTIONS.set_speech(true)],
        [f => /(arayuz|tema|asistan) ayar|^ayarlar(i ac)?$/.test(f), () => ACTIONS.open_settings()],
        [f => (/renk|tema|arayuz/.test(f) || /\b(yap|olsun|gec|cevir|degistir)\b/.test(f)) && findColor(f), c => ACTIONS.set_color(c)],
        [f => /\b(renk|rengi|tema|temayi)\b/.test(f), () => "Hangi renk? Mavi, camgöbeği, yeşil, amber, kırmızı ya da mor diyebilirsin."],
        [f => /yeni (bir )?(yazi|blog|not|taslak)/.test(f), () => ACTIONS.new_post()],
        [f => /yeni (bir )?proje/.test(f), () => ACTIONS.new_project()],
        [f => /rapor/.test(f) && /olustur|hazirla|gonder|yeniden yaz/.test(f), () => ACTIONS.make_report()],
        [f => /rapor|bulten/.test(f) && !/durum/.test(f), (m, f) => ACTIONS.read_report(/tamam|hepsi|butun|detay|uzun/.test(f) ? "full" : "summary")],
        [f => /durum|brifing|ozet gec|gunaydin|neler oluyor/.test(f), () => ACTIONS.briefing()],
        [f => /\bkac\b/.test(f) && /okunmamis|yeni|haber/.test(f), () => ACTIONS.unread_count()],
        [f => /one cikan|en onemli|basliklar|haberleri oku|neler var|gundem|ilk \d+ haber/.test(f), (m, f) => ACTIONS.read_top_news(f.match(/\d+/)?.[0] || f.split(" ").map(w => NUMBERS[w]).find(Boolean))],
        [f => /(hepsi|tumu|hepsini|tumunu).*okun|okundu (say|isaretle|yap)/.test(f), () => ACTIONS.mark_all_read()],
        [f => /yenile|guncelle|\btara\b|haberleri cek/.test(f), () => ACTIONS.refresh_news()],
        [f => /filtre(yi|leri)? (kaldir|temizle|sifirla)|tum haberler|hepsini goster/.test(f), async () => { await ACTIONS.search_news(""); return ACTIONS.filter_kind("all"); }],
        [f => /\bilan/.test(f), () => ACTIONS.filter_kind("ilan")],
        [f => /firsat/.test(f), () => ACTIONS.filter_kind("firsat")],
        [f => /kaydedi/.test(f), () => ACTIONS.filter_kind("saved")],
        [f => /en yeni|tarihe gore/.test(f), () => ACTIONS.sort_news("new")],
        [f => /oncelige gore|puana gore/.test(f), () => ACTIONS.sort_news("rank")],
        [(f, raw) => raw.match(/^(?:haberlerde\s+)?(.+?)\s+(?:ara|arat|bul)[.!]?$/i) || (/haber|goster|listele/.test(f) && raw.match(/^(.+?)\s+(?:ile ilgili|hakk[ıi]nda)\b/i)), m => ACTIONS.search_news(m[1])],
        [f => /asagi/.test(f) && "down" || /en uste|basa don/.test(f) && "top" || /yukari/.test(f) && "up", d => ACTIONS.scroll(d)],
        [f => (NAV_VERB.test(f) || f.split(" ").length <= 2) && VIEW_WORDS.find(([, re]) => re.test(f)), v => ACTIONS.navigate(v[0])],
        [f => /saat kac/.test(f), () => `Saat ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}.`],
        [f => /bugun (gunlerden|ayin)|tarih ne|hangi gun/.test(f), () => `Bugün ${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })}.`],
        [f => /tesekkur|sagol|eyvallah/.test(f), () => "Rica ederim."],
        [f => /^(kapat|kapan|gorusuruz)\b/.test(f), () => { closePanel(); return null; }],
        [f => /^(merhaba|selam|hey|iyi (gunler|aksamlar))\b/.test(f), () => "Merhaba. Dinliyorum."],
    ];

    // Toplu değişiklik ve bildirim gönderen eylemler yalnızca açık sabit komutla çalışır; yapay zeka tetikleyemez
    const LOCAL_ONLY = ["mark_all_read", "make_report", "scroll"];

    // Tanınmayan cümle: yapay zekaya sor, döndürdüğü izinli eylemleri uygula
    async function askAI(raw) {
        const { data, error } = await db().functions.invoke("assistant", {
            body: { text: raw.slice(0, 500), name: S.name, view: currentView(), history: history.slice(0, -1) },
        });
        if (error) {
            console.error(error);
            return error.context?.status === 404
                ? `Bunu anlamak için yapay zeka bağlantım henüz kurulmamış; şimdilik hazır komutları anlayabiliyorum. "Ne yapabilirsin?" diyerek listeyi görebilirsin.`
                : "Şu anda yapay zekaya ulaşamadım. Hazır komutları kullanmaya devam edebilirsin.";
        }
        const parts = [String(data.say || "").trim()];
        for (const a of (data.actions || []).slice(0, 4)) {
            if (Object.hasOwn(ACTIONS, a.type) && !LOCAL_ONLY.includes(a.type)) parts.push(await ACTIONS[a.type](a.value));
        }
        return parts.filter(Boolean).join(" ") || "Bunu anlayamadım.";
    }

    let awakeUntil = 0; // uyandırma kipinde, yanıttan sonra kısa süre "Hey ..." demeden komut alınır

    let handling = 0; // yeni komut, süren yanıtı keser; eski komut durumu ezmesin diye sayaç tutulur

    async function handle(raw) {
        raw = raw.trim();
        if (!raw) return;
        const turn = ++handling;
        stopWake();
        stopSpeaking();
        openPanel();
        interimEl.textContent = "";
        addLine("you", raw);
        setState("thinking");
        const f = fold(raw);
        try {
            let reply;
            let matched = false;
            for (const [test, run] of INTENTS) {
                const m = test(f, raw);
                if (!m) continue;
                matched = true;
                reply = await run(m, f, raw);
                break;
            }
            if (!matched) reply = await askAI(raw);
            if (reply) {
                sfx("ok");
                if (typeof reply === "string") await say(reply);
                else await say(reply.text, reply.aloud);
            }
        } catch (error) {
            console.error(error);
            sfx("err");
            await say(`Bunu yaparken bir hata oluştu: ${error.message || error}`);
        }
        if (turn !== handling) return;
        setState("idle");
        awakeUntil = Date.now() + 10000;
        startWake();
    }

    // ===== Sesle komut =====
    let rec = null;

    function listen() {
        if (state === "listening") { rec?.stop(); return; }
        openPanel();
        if (!SR) { say("Bu tarayıcı sesle komutu desteklemiyor. Chrome ya da Edge kullanabilir veya komutunu yazabilirsin.", false); $("#aiInput").focus(); return; }
        stopWake();
        stopSpeaking();
        let finalText = "", errorCode = "";
        rec = new SR();
        rec.lang = "tr-TR";
        rec.interimResults = true;
        rec.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            interimEl.textContent = finalText || interim;
        };
        rec.onerror = (event) => { errorCode = event.error; };
        rec.onend = () => {
            rec = null;
            stopMeter();
            if (finalText.trim()) return handle(finalText);
            setState("idle");
            interimEl.textContent = "";
            sfx("off");
            if (errorCode === "not-allowed" || errorCode === "service-not-allowed") say("Mikrofon izni verilmemiş. Tarayıcının adres çubuğundan mikrofona izin verebilir ya da komutunu yazabilirsin.", false);
            startWake();
        };
        try { rec.start(); } catch { rec = null; return; }
        setState("listening");
        sfx("on");
        startMeter();
    }

    // ===== "Hey <ad>" ile uyanma (ayarlardan açılır) =====
    let wakeRec = null;

    function startWake() {
        if (!SR || !S.wake || wakeRec || state !== "idle" || ai.hidden || document.hidden) return;
        const r = new SR();
        r.lang = "tr-TR";
        r.continuous = true;
        r.onresult = (event) => heard(event.results[event.results.length - 1][0].transcript);
        r.onerror = (event) => {
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                HUD.set({ wake: false });
                say("Mikrofon izni olmadığı için sesle uyanmayı kapattım.", false);
            }
        };
        r.onend = () => {
            if (wakeRec === r) wakeRec = null;
            setTimeout(startWake, 500); // tarayıcı sessizlikte oturumu kapatır; yeniden başlat
        };
        try { r.start(); wakeRec = r; setState("idle"); } catch { /* başka bir tanıma oturumu açık */ }
    }

    function stopWake() {
        const r = wakeRec;
        wakeRec = null;
        r?.abort();
    }

    function heard(raw) {
        const words = raw.trim().split(/\s+/);
        const name = fold(S.name).split(" ");
        const folded = words.map(fold);
        // Adın geçtiği yeri bul; komut adın ardından gelen sözcüklerdir
        let at = -1;
        for (let i = 0; i + name.length <= folded.length; i++) {
            if (name.every((n, k) => folded[i + k] === n)) at = i + name.length;
        }
        if (at < 0 && Date.now() > awakeUntil) return;
        const command = words.slice(Math.max(at, 0)).join(" ");
        if (command) return handle(command);
        stopWake();
        listen();
    }

    // ===== Olaylar =====
    orb.addEventListener("click", () => {
        if (panel.hidden) { openPanel(); sfx("on"); } else closePanel();
    });
    $("#aiClose").addEventListener("click", closePanel);
    micBtn.addEventListener("click", listen);
    $("#aiForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = $("#aiInput");
        const text = input.value;
        input.value = "";
        handle(text);
    });
    $("#aiHints").addEventListener("click", (event) => {
        const chip = event.target.closest("[data-say]");
        if (chip) handle(chip.dataset.say);
    });

    document.addEventListener("keydown", (event) => {
        if (ai.hidden) return;
        if (event.ctrlKey && event.code === "Space") { event.preventDefault(); listen(); }
        else if (event.key === "Escape" && !panel.hidden && !$("#hudSettings").open) {
            if (state === "speaking") stopSpeaking(); else closePanel();
        }
    });

    window.addEventListener("hud:change", (event) => {
        readColor();
        if ("wake" in event.detail || "name" in event.detail) { stopWake(); startWake(); }
        if ("speak" in event.detail && !S.speak) stopSpeaking();
        setState(state);
    });

    function onApp(visible) {
        ai.hidden = !visible;
        if (visible) { readColor(); startWake(); if (!S.motion) requestAnimationFrame(drawAll); }
        else { stopWake(); stopSpeaking(); rec?.abort(); closePanel(); }
    }
    window.addEventListener("hud:app", (event) => onApp(event.detail));
    document.addEventListener("visibilitychange", () => { if (document.hidden) stopWake(); else startWake(); });

    if (HUD.appVisible) onApp(true);
    requestAnimationFrame(frame);
})();
