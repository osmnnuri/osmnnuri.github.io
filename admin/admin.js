// ONY Yönetim Paneli: haber ağı, projeler, blog ve kaynak yönetimi
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const initialHash = location.hash; // davet / şifre sıfırlama bağlantıları istemci başlamadan okunur
const { url: SB_URL, key: SB_KEY } = window.SUPABASE_CONFIG;
const sb = createClient(SB_URL, SB_KEY);
const SITE_ROOT = new URL("../", location.href).href;

// ===== Yardımcılar =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = window.escapeHtml;

function toast(message, type = "ok") {
    const el = document.createElement("div");
    el.className = `toast${type === "err" ? " err" : ""}`;
    el.textContent = message;
    $("#toasts").append(el);
    setTimeout(() => el.remove(), type === "err" ? 7000 : 3500);
}

function fail(error, prefix = "İşlem başarısız") {
    console.error(error);
    toast(`${prefix}: ${error?.message || error}`, "err");
}

async function busy(button, fn) {
    if (button) button.disabled = true;
    try { return await fn(); } finally { if (button) button.disabled = false; }
}

function timeAgo(iso) {
    if (!iso) return "";
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "az önce";
    if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
    if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)} gün önce`;
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function slugify(text) {
    const map = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
    return String(text).toLocaleLowerCase("tr")
        .replace(/[çğıöşüâîû]/g, ch => map[ch])
        .normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "yazi";
}

const splitList = (value) => String(value || "").split(",").map(s => s.trim()).filter(Boolean);
const splitLines = (value) => String(value || "").split("\n").map(s => s.trim()).filter(Boolean);
const nullIfEmpty = (v) => (v && String(v).trim() ? String(v).trim() : null);

function safeFileName(name) {
    const dot = name.lastIndexOf(".");
    const base = slugify(dot > 0 ? name.slice(0, dot) : name);
    const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
    return ext ? `${base}.${ext}` : base;
}

async function uploadFile(bucket, folder, file) {
    const path = `${folder}/${Date.now()}-${safeFileName(file.name)}`;
    const { error } = await sb.storage.from(bucket).upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (error) throw error;
    return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function imageSize(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: null, height: null });
        img.src = src;
    });
}

function insertAtCursor(textarea, before, after = "", placeholder = "") {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e) || placeholder;
    textarea.value = value.slice(0, s) + before + selected + after + value.slice(e);
    textarea.focus();
    textarea.selectionStart = s + before.length;
    textarea.selectionEnd = s + before.length + selected.length;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// Site stilleriyle önizleme belgesi; görece görsel yolları site köküne göre çözülür
function previewDoc(body, extraCss = "") {
    return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><base href="${SITE_ROOT}" target="_blank">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@1,9..144,300..700,100&family=Figtree:ital,wght@0,400..700;1,400..700&display=swap">
        <link rel="stylesheet" href="style.css">
        <style>body::before{display:none}body{padding:20px}.reveal{opacity:1;transform:none}${extraCss}</style>
        </head><body>${body}</body></html>`;
}

// ===== Oturum =====
let currentView = null;
let dirty = false;

window.addEventListener("beforeunload", (event) => {
    if (dirty) { event.preventDefault(); event.returnValue = ""; }
});

function showLogin(message = "") {
    $("#appView").hidden = true;
    $("#loginView").hidden = false;
    $("#loginForm").hidden = false;
    $("#newPassForm").hidden = true;
    $("#loginMsg").textContent = message;
}

function showNewPassword() {
    $("#appView").hidden = true;
    $("#loginView").hidden = false;
    $("#loginForm").hidden = true;
    $("#newPassForm").hidden = false;
}

async function enterApp() {
    const { data: isAdmin, error } = await sb.rpc("is_admin");
    if (error || !isAdmin) {
        await sb.auth.signOut();
        showLogin("Bu hesabın yönetim yetkisi yok.");
        return;
    }
    const { data: { user } } = await sb.auth.getUser();
    $("#userEmail").textContent = user?.email || "";
    $("#loginView").hidden = true;
    $("#appView").hidden = false;
    route();
    refreshNewsBadge();
}

$("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    $("#loginMsg").textContent = "";
    await busy(button, async () => {
        const { error } = await sb.auth.signInWithPassword({ email: form.email.value.trim(), password: form.password.value });
        if (error) {
            $("#loginMsg").textContent = error.message === "Invalid login credentials" ? "E-posta ya da şifre hatalı." : error.message;
            return;
        }
        form.password.value = "";
        await enterApp();
    });
});

$("#forgotBtn").addEventListener("click", async () => {
    const email = $("#loginForm").email.value.trim();
    const msg = $("#loginMsg");
    if (!email) { msg.textContent = "Önce e-posta adresinizi yazın."; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0] });
    msg.className = error ? "form-msg" : "form-msg ok";
    msg.textContent = error ? error.message : "Şifre sıfırlama bağlantısı gönderildi (hesap varsa).";
});

$("#newPassForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    await busy(form.querySelector("button"), async () => {
        const { error } = await sb.auth.updateUser({ password: form.password.value });
        if (error) { $("#newPassMsg").textContent = error.message; return; }
        form.password.value = "";
        history.replaceState(null, "", location.pathname);
        toast("Şifre kaydedildi.");
        await enterApp();
    });
});

$("#logoutBtn").addEventListener("click", async () => {
    if (dirty && !confirm("Kaydedilmemiş değişiklikler var. Yine de çıkılsın mı?")) return;
    dirty = false;
    await sb.auth.signOut();
    showLogin();
});

sb.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") showNewPassword();
    if (event === "SIGNED_OUT") showLogin();
});

async function boot() {
    const { data: { session } } = await sb.auth.getSession();
    if (session && /type=(invite|recovery)/.test(initialHash)) return showNewPassword();
    if (session) return enterApp();
    showLogin();
}

// ===== Yönlendirme =====
const VIEWS = ["haberler", "projeler", "blog", "kaynaklar"];

function route() {
    if ($("#appView").hidden) return;
    const name = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "haberler";
    if (name === currentView) return;
    if (dirty && !confirm("Kaydedilmemiş değişiklikler var. Sayfadan ayrılınsın mı?")) {
        history.replaceState(null, "", `#${currentView}`);
        return;
    }
    dirty = false;
    currentView = name;
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== name; });
    $$(".side-nav a").forEach(a => a.classList.toggle("current", a.dataset.view === name));
    ({ haberler: openNews, projeler: openProjectList, blog: openPostList, kaynaklar: openSources })[name]();
    window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);

$$("[data-back]").forEach(btn => btn.addEventListener("click", () => {
    if (dirty && !confirm("Kaydedilmemiş değişiklikler var. Listeye dönülsün mü?")) return;
    dirty = false;
    btn.dataset.back === "projeler" ? openProjectList() : openPostList();
}));

// ===== Haber ağı =====
const KIND_LABELS = { haber: "Haber", ilan: "İlan", firsat: "Fırsat" };
const PAGE = 40;
const news = { kind: "all", interest: null, q: "", sort: "rank", relevant: true, offset: 0, interests: [] };

async function refreshNewsBadge() {
    const { count } = await sb.from("news_items").select("id", { count: "exact", head: true })
        .eq("status", "new").gt("relevance", 0)
        .gte("fetched_at", new Date(Date.now() - 86400000).toISOString());
    const badge = $("#newsBadge");
    badge.hidden = !count;
    badge.textContent = count > 99 ? "99+" : String(count || "");
}

async function loadNewsStats() {
    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    const head = { count: "exact", head: true };
    const [today, unread, saved, sources] = await Promise.all([
        sb.from("news_items").select("id", head).gte("fetched_at", dayAgo),
        sb.from("news_items").select("id", head).eq("status", "new").gt("relevance", 0),
        sb.from("news_items").select("id", head).eq("status", "saved"),
        sb.from("news_sources").select("last_fetched_at").order("last_fetched_at", { ascending: false, nullsFirst: false }).limit(1),
    ]);
    const last = sources.data?.[0]?.last_fetched_at;
    $("#newsStats").innerHTML = `
        <li><strong>${today.count ?? 0}</strong><span>son 24 saatte gelen</span></li>
        <li><strong>${unread.count ?? 0}</strong><span>okunmamış, ilgili</span></li>
        <li><strong>${saved.count ?? 0}</strong><span>kaydedilen</span></li>
        <li><strong>${last ? timeAgo(last) : "—"}</strong><span>son güncelleme</span></li>`;
}

async function loadInterestChips() {
    const { data } = await sb.from("interests").select("name, enabled").eq("enabled", true).order("weight", { ascending: false });
    news.interests = (data || []).map(i => i.name);
    $("#interestChips").innerHTML = [`<button type="button" class="chip" data-interest="" aria-pressed="${!news.interest}">Tüm ilgi alanları</button>`]
        .concat(news.interests.map(n => `<button type="button" class="chip" data-interest="${esc(n)}" aria-pressed="${news.interest === n}">${esc(n)}</button>`))
        .join("");
}

function scoreClass(rank) {
    return rank >= 50 ? "hi" : rank >= 20 ? "mid" : "";
}

function newsItemHtml(n) {
    const when = n.published_at || n.fetched_at;
    const rank = Math.round(Number(n.rank) || 0);
    return `<article class="news-item${n.status === "new" ? "" : " is-read"}${n.status === "saved" ? " is-saved" : ""}" data-id="${n.id}">
        <div class="score ${scoreClass(rank)}" title="Öncelik puanı (ilgi ${Math.round(n.relevance)}, zamanla azalır)">${rank}<small>puan</small></div>
        <div>
            <div class="news-meta"><span class="kind ${n.kind}">${KIND_LABELS[n.kind]}</span><span>${esc(n.source_name || "")}</span><span>${timeAgo(when)}</span></div>
            <a class="news-title" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer" data-act="open">${esc(n.title)}</a>
            ${n.summary ? `<p class="news-summary">${esc(n.summary)}</p>` : ""}
            ${(n.matched || []).length ? `<div class="tag-row">${n.matched.map(m => `<span>${esc(m)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="news-actions">
            <button type="button" class="icon-btn${n.status === "saved" ? " on" : ""}" data-act="save">${n.status === "saved" ? "★ Kaydedildi" : "☆ Kaydet"}</button>
            <button type="button" class="icon-btn" data-act="draft">✎ Nota çevir</button>
            <button type="button" class="icon-btn" data-act="dismiss">✕ Gizle</button>
        </div>
    </article>`;
}

async function loadNews(append = false) {
    const list = $("#newsList");
    if (!append) { news.offset = 0; list.innerHTML = `<p class="empty">Yükleniyor...</p>`; }

    let q = sb.from("news_feed")
        .select("id, url, title, summary, kind, status, relevance, rank, matched, source_name, published_at, fetched_at");
    if (news.kind === "saved") q = q.eq("status", "saved");
    else {
        q = q.neq("status", "dismissed");
        if (news.kind !== "all") q = q.eq("kind", news.kind);
    }
    if (news.relevant && news.kind !== "saved") q = q.gt("relevance", 0);
    if (news.interest) q = q.contains("matched", [news.interest]);
    if (news.q) {
        const term = news.q.replace(/[%,()*]/g, " ").trim();
        if (term) q = q.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
    }
    q = news.sort === "new"
        ? q.order("published_at", { ascending: false, nullsFirst: false }).order("fetched_at", { ascending: false })
        : q.order("rank", { ascending: false }).order("id", { ascending: false });

    const { data, error } = await q.range(news.offset, news.offset + PAGE - 1);
    if (error) { list.innerHTML = ""; return fail(error, "Haberler yüklenemedi"); }

    const html = data.map(newsItemHtml).join("");
    if (append) list.insertAdjacentHTML("beforeend", html);
    else list.innerHTML = html || `<p class="empty">Bu filtreye uyan öğe yok. "Şimdi yenile" ile yeni haberleri çekebilir ya da filtreleri gevşetebilirsiniz.</p>`;
    news.offset += data.length;
    $("#newsMore").hidden = data.length < PAGE;
}

async function openNews() {
    await Promise.all([loadInterestChips(), loadNewsStats()]);
    loadNews();
}

$("#newsKinds").addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    news.kind = btn.dataset.kind;
    $$("#newsKinds button").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    loadNews();
});

$("#interestChips").addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    news.interest = chip.dataset.interest || null;
    $$("#interestChips .chip").forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
    loadNews();
});

$("#newsSearch").addEventListener("input", debounce(e => { news.q = e.target.value.trim(); loadNews(); }, 350));
$("#newsSort").addEventListener("change", e => { news.sort = e.target.value; loadNews(); });
$("#newsRelevant").addEventListener("change", e => { news.relevant = e.target.checked; loadNews(); });
$("#newsMore").addEventListener("click", () => loadNews(true));

$("#refreshNews").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    toast("Kaynaklar taranıyor, bu biraz sürebilir...");
    const { data, error } = await sb.functions.invoke("fetch-news", { body: {} });
    if (error) return fail(error, "Yenileme başarısız");
    const failed = (data.results || []).filter(r => r.error).length;
    toast(`${data.inserted} yeni öğe eklendi${failed ? ` · ${failed} kaynakta hata` : ""}.`);
    await Promise.all([loadNewsStats(), refreshNewsBadge()]);
    loadNews();
}));

$("#markAllRead").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    const { error } = await sb.from("news_items").update({ status: "read" }).eq("status", "new");
    if (error) return fail(error);
    toast("Tüm öğeler okundu olarak işaretlendi.");
    refreshNewsBadge();
    loadNewsStats();
    loadNews();
}));

async function setNewsStatus(id, status) {
    const { error } = await sb.from("news_items").update({ status }).eq("id", id);
    if (error) throw error;
}

$("#newsList").addEventListener("click", async (event) => {
    const actionEl = event.target.closest("[data-act]");
    if (!actionEl) return;
    const item = actionEl.closest(".news-item");
    const id = Number(item.dataset.id);
    const act = actionEl.dataset.act;
    try {
        if (act === "open") {
            if (!item.classList.contains("is-read")) {
                item.classList.add("is-read");
                if (!item.classList.contains("is-saved")) await setNewsStatus(id, "read");
                refreshNewsBadge();
            }
        } else if (act === "save") {
            const saved = item.classList.toggle("is-saved");
            item.classList.add("is-read");
            actionEl.classList.toggle("on", saved);
            actionEl.textContent = saved ? "★ Kaydedildi" : "☆ Kaydet";
            await setNewsStatus(id, saved ? "saved" : "read");
            if (!saved && news.kind === "saved") item.remove();
            loadNewsStats();
        } else if (act === "dismiss") {
            item.classList.add("leaving");
            await setNewsStatus(id, "dismissed");
            setTimeout(() => item.remove(), 200);
            refreshNewsBadge();
        } else if (act === "draft") {
            await newsToDraft(id);
        }
    } catch (error) {
        fail(error);
    }
});

async function newsToDraft(id) {
    const { data: n, error } = await sb.from("news_feed").select("title, url, summary, source_name, kind").eq("id", id).single();
    if (error) throw error;
    const body = `> **Kaynak:** [${n.title}](${n.url}) · ${n.source_name || ""}\n\n${n.summary || ""}\n\n## Notlarım\n\n`;
    await setNewsStatus(id, "saved");
    location.hash = "#blog";
    await openPostEditor(null, { title: n.title, kind: "not", body, excerpt: (n.summary || "").slice(0, 200) });
}

// ===== Projeler =====
let projects = [];
let editingProject = null; // null: yeni
let covers = [];
let previewMode = "card";

function featureCardHtml(p) {
    const imgs = (p.cover_images || []).slice(0, p.cover_kind === "landscape" ? 1 : 3)
        .map(i => `<img src="${esc(i.src)}" alt="${esc(i.alt || "")}">`).join("");
    const highlights = (p.highlights || []).length ? `<ul>${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : "";
    return `<article class="feature project-card">
        <div class="feature-media${p.cover_kind === "landscape" ? " web" : ""}">${imgs}</div>
        <div class="feature-body">
            <div class="meta"><span class="year">${esc(p.year)}</span><span class="type">${esc(p.type_label)}</span></div>
            <h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${highlights}
            <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
            <span class="more">Detayları gör &rarr;</span>
        </div></article>`;
}

function gridCardHtml(p) {
    const img = (p.cover_images || [])[0];
    return `<div class="project-grid" style="max-width:300px"><article class="p-card project-card">
        <div class="p-cover${p.cover_kind === "landscape" ? "" : ` ${p.cover_kind}`}">${img ? `<img src="${esc(img.src)}" alt="">` : ""}</div>
        <div class="p-body">
            <div class="meta"><span class="year">${esc(p.year)}</span><span class="type">${esc(p.type_label)}</span></div>
            <h4>${esc(p.title)}</h4><p>${esc(p.summary)}</p>
            <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
        </div></article></div>`;
}

async function openProjectList() {
    $("#projectListPane").hidden = false;
    $("#projectEditorPane").hidden = true;
    const table = $("#projectTable");
    table.innerHTML = `<tbody><tr><td class="muted">Yükleniyor...</td></tr></tbody>`;
    const { data, error } = await sb.from("projects").select("*").order("sort_order").order("created_at");
    if (error) return fail(error, "Projeler yüklenemedi");
    projects = data;
    const cat = { app: "Mobil Uygulama", game: "Mobil Oyun", web: "Web", other: "Diğer" };
    table.innerHTML = `<thead><tr><th>Sıra</th><th></th><th>Proje</th><th>Kategori</th><th>Durum</th><th></th></tr></thead><tbody>
        ${projects.map((p, i) => `<tr data-id="${esc(p.id)}">
            <td><div class="order">
                <button type="button" class="icon-btn" data-move="-1" ${i === 0 ? "disabled" : ""} aria-label="Yukarı taşı">↑</button>
                <button type="button" class="icon-btn" data-move="1" ${i === projects.length - 1 ? "disabled" : ""} aria-label="Aşağı taşı">↓</button>
            </div></td>
            <td>${p.cover_images?.[0] ? `<img class="thumb" src="${esc(new URL(p.cover_images[0].src, SITE_ROOT).href)}" alt="">` : `<div class="thumb"></div>`}</td>
            <td class="title-cell"><strong>${esc(p.title)}</strong><span>${esc(p.id)} · ${esc(p.year || "")}</span></td>
            <td>${esc(cat[p.category] || p.category)}</td>
            <td>${p.featured ? `<span class="status-pill featured">Öne çıkan</span> ` : ""}<span class="status-pill ${p.published ? "published" : "draft"}">${p.published ? "Yayında" : "Gizli"}</span></td>
            <td><div class="actions"><button type="button" class="btn small" data-edit>Düzenle</button></div></td>
        </tr>`).join("")}</tbody>`;
}

$("#projectTable").addEventListener("click", async (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const p = projects.find(x => x.id === row.dataset.id);
    if (event.target.closest("[data-edit]")) return openProjectEditor(p);
    const move = event.target.closest("[data-move]");
    if (move) {
        const i = projects.indexOf(p);
        const j = i + Number(move.dataset.move);
        const other = projects[j];
        if (!other) return;
        // Sıra numaralarını yeniden dağıt ve iki projeyi yer değiştir
        [projects[i], projects[j]] = [projects[j], projects[i]];
        const updates = projects.map((x, k) => ({ id: x.id, sort_order: (k + 1) * 10 })).filter((u, k) => projects[k].sort_order !== u.sort_order);
        try {
            for (const u of updates) {
                const { data, error } = await sb.from("projects").update({ sort_order: u.sort_order }).eq("id", u.id).select("id");
                if (error) throw error;
                if (!data.length) throw new Error("Yetki yok. Oturumunuzu yenileyin.");
            }
            openProjectList();
        } catch (error) { fail(error, "Sıralama kaydedilemedi"); }
    }
});

$("#newProject").addEventListener("click", () => openProjectEditor(null));

function openProjectEditor(p) {
    editingProject = p;
    const form = $("#projectForm");
    form.reset();
    const v = p || { published: true, cover_kind: "phone", category: "app", year: String(new Date().getFullYear()), content_html: "<p></p>\n\n<h3>Kullanılan Teknolojiler</h3>\n<ul class=\"tech-list\">\n    <li></li>\n</ul>" };
    ["title", "id", "modal_title", "year", "type_label", "category", "summary", "cover_kind", "content_html", "repo_url", "live_url", "live_label"]
        .forEach(k => { form[k].value = v[k] ?? ""; });
    form.highlights.value = (v.highlights || []).join("\n");
    form.tags.value = (v.tags || []).join(", ");
    form.featured.checked = !!v.featured;
    form.published.checked = v.published !== false;
    form.id.readOnly = !!p;
    covers = (v.cover_images || []).map(c => ({ ...c }));
    renderCovers();
    $("#projectEditorTitle").textContent = p ? p.title : "Yeni proje";
    $("#deleteProject").hidden = !p;
    $("#projectListPane").hidden = true;
    $("#projectEditorPane").hidden = false;
    dirty = false;
    updateProjectPreview();
    window.scrollTo(0, 0);
}

function readProjectForm() {
    const f = $("#projectForm");
    return {
        id: f.id.value.trim(),
        title: f.title.value.trim(),
        modal_title: nullIfEmpty(f.modal_title.value),
        year: nullIfEmpty(f.year.value),
        type_label: nullIfEmpty(f.type_label.value),
        category: f.category.value,
        featured: f.featured.checked,
        published: f.published.checked,
        summary: nullIfEmpty(f.summary.value),
        highlights: splitLines(f.highlights.value),
        tags: splitList(f.tags.value),
        cover_kind: f.cover_kind.value,
        cover_images: covers.filter(c => c.src),
        content_html: f.content_html.value,
        repo_url: nullIfEmpty(f.repo_url.value),
        live_url: nullIfEmpty(f.live_url.value),
        live_label: nullIfEmpty(f.live_label.value),
    };
}

function renderCovers() {
    $("#coverList").innerHTML = covers.length ? covers.map((c, i) => `
        <div class="cover-row" data-i="${i}">
            <img src="${esc(c.src ? new URL(c.src, SITE_ROOT).href : "")}" alt="">
            <input class="input" data-field="src" value="${esc(c.src)}" placeholder="Görsel adresi" aria-label="Görsel adresi">
            <input class="input alt-input" data-field="alt" value="${esc(c.alt || "")}" placeholder="Açıklama (alt metin)" aria-label="Alt metin">
            <div class="btn-row">
                <button type="button" class="icon-btn" data-cover="up" aria-label="Yukarı" ${i === 0 ? "disabled" : ""}>↑</button>
                <button type="button" class="icon-btn" data-cover="down" aria-label="Aşağı" ${i === covers.length - 1 ? "disabled" : ""}>↓</button>
                <button type="button" class="icon-btn" data-cover="remove" aria-label="Kaldır">✕</button>
            </div>
        </div>`).join("") : `<p class="muted small">Henüz kapak görseli yok.</p>`;
}

$("#coverList").addEventListener("input", (event) => {
    const row = event.target.closest(".cover-row");
    if (!row) return;
    covers[Number(row.dataset.i)][event.target.dataset.field] = event.target.value;
    if (event.target.dataset.field === "src") row.querySelector("img").src = new URL(event.target.value || ".", SITE_ROOT).href;
    dirty = true;
    updateProjectPreviewSoon();
});

$("#coverList").addEventListener("change", async (event) => {
    if (event.target.dataset.field !== "src") return;
    const i = Number(event.target.closest(".cover-row").dataset.i);
    Object.assign(covers[i], await imageSize(new URL(covers[i].src, SITE_ROOT).href));
});

$("#coverList").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-cover]");
    if (!btn) return;
    const i = Number(btn.closest(".cover-row").dataset.i);
    if (btn.dataset.cover === "remove") covers.splice(i, 1);
    else {
        const j = i + (btn.dataset.cover === "up" ? -1 : 1);
        [covers[i], covers[j]] = [covers[j], covers[i]];
    }
    dirty = true;
    renderCovers();
    updateProjectPreview();
});

$("#coverAddUrl").addEventListener("click", () => {
    covers.push({ src: "", alt: "" });
    renderCovers();
    $(`#coverList .cover-row:last-child [data-field="src"]`).focus();
});

function projectFolder() {
    return `projects/${slugify($("#projectForm").id.value || "yeni")}`;
}

$("#coverUpload").addEventListener("change", async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    try {
        for (const file of files) {
            const src = await uploadFile("media", projectFolder(), file);
            covers.push({ src, alt: "", ...(await imageSize(src)) });
        }
        toast(`${files.length} görsel yüklendi.`);
        dirty = true;
        renderCovers();
        updateProjectPreview();
    } catch (error) { fail(error, "Yükleme başarısız"); }
});

const SNIPPETS = {
    p: ["<p>", "</p>\n", "Paragraf metni"],
    h3: ["<h3>", "</h3>\n", "Başlık"],
    ul: ["<ul class=\"feature-list\">\n    <li><strong>", ":</strong> Açıklama</li>\n</ul>\n", "Özellik"],
    row: ["<div class=\"image-row\">\n    ", "\n</div>\n", "<img src=\"\" alt=\"\">"],
    tech: ["<h3>Kullanılan Teknolojiler</h3>\n<ul class=\"tech-list\">\n    <li>", "</li>\n</ul>\n", "Teknoloji"],
};

$("#htmlSnippets").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-snippet]");
    if (!btn) return;
    const [before, after, ph] = SNIPPETS[btn.dataset.snippet];
    insertAtCursor($("#projectForm").content_html, before, after, ph);
});

$("#contentUpload").addEventListener("change", async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    try {
        const tags = [];
        for (const file of files) tags.push(`<img src="${await uploadFile("media", projectFolder(), file)}" alt="">`);
        const html = tags.length > 1 ? `<div class="image-row">\n    ${tags.join("\n    ")}\n</div>\n` : `${tags[0]}\n`;
        insertAtCursor($("#projectForm").content_html, html);
        toast(`${files.length} görsel yüklendi ve eklendi.`);
    } catch (error) { fail(error, "Yükleme başarısız"); }
});

function updateProjectPreview() {
    const p = readProjectForm();
    const body = previewMode === "card"
        ? (p.featured ? featureCardHtml(p) : gridCardHtml(p))
        : `<div class="modal-content" style="transform:none;max-height:none;margin:0"><div id="modal-body">
                <h2>${esc(p.modal_title || p.title)}</h2>${p.content_html}
                ${p.live_url || p.repo_url ? `<div class="modal-links">${p.live_url ? `<a class="btn primary" href="${esc(p.live_url)}">${esc(p.live_label || "Canlı siteyi aç")} &nearr;</a>` : ""}${p.repo_url ? `<a class="btn" href="${esc(p.repo_url)}"><img src="görseller/icons/icons8-github-50.png" alt="">GitHub'da incele</a>` : ""}</div>` : ""}
            </div></div>`;
    $("#projectPreview").srcdoc = previewDoc(body, ".feature{max-width:none}");
}

const updateProjectPreviewSoon = debounce(updateProjectPreview, 300);

$("#projectForm").addEventListener("input", () => { dirty = true; updateProjectPreviewSoon(); });
$("#projectForm").addEventListener("change", () => updateProjectPreviewSoon());

$("#projectPreviewMode").addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;
    previewMode = btn.dataset.mode;
    $$("#projectPreviewMode button").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    updateProjectPreview();
});

$("#saveProject").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    const form = $("#projectForm");
    if (!form.reportValidity()) return;
    const p = readProjectForm();
    let error, data;
    if (editingProject) {
        const { id, ...changes } = p;
        ({ data, error } = await sb.from("projects").update(changes).eq("id", editingProject.id).select());
    } else {
        const maxOrder = Math.max(0, ...projects.map(x => x.sort_order || 0));
        ({ data, error } = await sb.from("projects").insert({ ...p, sort_order: maxOrder + 10 }).select());
        if (error?.code === "23505") error = new Error("Bu kimlikle bir proje zaten var.");
    }
    if (!error && !data?.length) error = new Error("Yetki yok ya da kayıt bulunamadı. Oturumunuzu yenileyin.");
    if (error) return fail(error, "Kaydedilemedi");
    dirty = false;
    toast(p.published ? "Proje kaydedildi ve sitede yayında." : "Proje kaydedildi (gizli).");
    data = data[0];
    if (!editingProject) projects.push(data);
    editingProject = data;
    form.id.readOnly = true;
    $("#projectEditorTitle").textContent = data.title;
    $("#deleteProject").hidden = false;
}));

$("#deleteProject").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    if (!editingProject || !confirm(`"${editingProject.title}" projesi kalıcı olarak silinsin mi? Bu işlem geri alınamaz.\n\nSadece gizlemek için "Sitede yayında" kutusunu kaldırabilirsiniz.`)) return;
    const { data, error } = await sb.from("projects").delete().eq("id", editingProject.id).select("id");
    if (error || !data?.length) return fail(error || new Error("Yetki yok ya da kayıt bulunamadı."), "Silinemedi");
    dirty = false;
    toast("Proje silindi.");
    openProjectList();
}));

// ===== Blog =====
let posts = [];
let editingPost = null;
let attachment = null; // { file_url, file_name, file_type, file_size }
let bodyFormat = "markdown";
let slugTouched = false;
const POST_KIND_LABELS = { yazi: "Yazı", rapor: "Rapor", not: "Not" };

async function openPostList() {
    $("#postListPane").hidden = false;
    $("#postEditorPane").hidden = true;
    const table = $("#postTable");
    table.innerHTML = `<tbody><tr><td class="muted">Yükleniyor...</td></tr></tbody>`;
    const { data, error } = await sb.from("posts").select("id, slug, title, kind, status, published_at, updated_at, file_name").order("updated_at", { ascending: false });
    if (error) return fail(error, "Yazılar yüklenemedi");
    posts = data;
    table.innerHTML = posts.length ? `<thead><tr><th>Başlık</th><th>Tür</th><th>Durum</th><th>Tarih</th><th></th></tr></thead><tbody>
        ${posts.map(p => `<tr data-id="${p.id}">
            <td class="title-cell"><strong>${esc(p.title)}</strong><span>/${esc(p.slug)}${p.file_name ? ` · Ek: ${esc(p.file_name)}` : ""}</span></td>
            <td>${POST_KIND_LABELS[p.kind]}</td>
            <td><span class="status-pill ${p.status}">${p.status === "published" ? "Yayında" : "Taslak"}</span></td>
            <td class="muted">${timeAgo(p.status === "published" ? p.published_at : p.updated_at)}</td>
            <td><div class="actions">
                ${p.status === "published" ? `<a class="btn small" href="../blog/yazi.html?s=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">Görüntüle</a>` : ""}
                <button type="button" class="btn small" data-edit>Düzenle</button>
            </div></td>
        </tr>`).join("")}</tbody>`
        : `<tbody><tr><td class="empty">Henüz yazı yok. "+ Yeni yazı" ile ilk yazınızı ya da raporunuzu ekleyin.</td></tr></tbody>`;
}

$("#postTable").addEventListener("click", async (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row || !event.target.closest("[data-edit]")) return;
    const { data, error } = await sb.from("posts").select("*").eq("id", row.dataset.id).single();
    if (error) return fail(error);
    openPostEditor(data);
});

$("#newPost").addEventListener("click", () => openPostEditor(null));

function setPostMode(mode) {
    $$("#postModes button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    $("#postWrite").hidden = mode !== "write";
    $("#postFile").hidden = mode !== "file";
}

function setBodyFormat(format) {
    bodyFormat = format;
    $("#htmlNote").hidden = format !== "html";
    $("#mdToolbar").hidden = format === "html";
}

function renderAttachment() {
    $("#attachmentBox").hidden = !attachment;
    if (!attachment) return;
    $("#attachmentName").textContent = attachment.file_name;
    $("#attachmentInfo").textContent = ` · ${attachment.file_size > 1048576 ? `${(attachment.file_size / 1048576).toFixed(1)} MB` : `${Math.ceil(attachment.file_size / 1024)} KB`}`;
}

function setCover(src) {
    const img = $("#postCoverImg");
    img.hidden = !src;
    img.src = src || "";
    $("#postCoverRemove").hidden = !src;
}

async function openPostEditor(p, preset = {}) {
    if (currentView !== "blog") { location.hash = "#blog"; currentView = "blog"; $$(".view").forEach(v => { v.hidden = v.dataset.view !== "blog"; }); $$(".side-nav a").forEach(a => a.classList.toggle("current", a.dataset.view === "blog")); }
    editingPost = p;
    const v = p || { kind: "yazi", status: "draft", body: "", body_format: "markdown", ...preset };
    const form = $("#postForm");
    form.reset();
    form.title.value = v.title || "";
    form.slug.value = v.slug || (v.title ? slugify(v.title) : "");
    form.kind.value = v.kind;
    form.tags.value = (v.tags || []).join(", ");
    form.excerpt.value = v.excerpt || "";
    form.body.value = v.body || "";
    slugTouched = !!p;
    attachment = v.file_url ? { file_url: v.file_url, file_name: v.file_name, file_type: v.file_type, file_size: v.file_size } : null;
    form.dataset.cover = v.cover_url || "";
    setCover(v.cover_url);
    setBodyFormat(v.body_format || "markdown");
    setPostMode("write");
    renderAttachment();
    updatePostStatus(v.status);
    $("#postEditorTitle").textContent = p ? "Yazıyı düzenle" : "Yeni yazı";
    $("#deletePost").hidden = !p;
    $("#postListPane").hidden = true;
    $("#postEditorPane").hidden = false;
    dirty = !!preset.title;
    updatePostPreview();
    window.scrollTo(0, 0);
}

function updatePostStatus(status) {
    const pill = $("#postStatus");
    pill.className = `status-pill ${status}`;
    pill.textContent = status === "published" ? "Yayında" : "Taslak";
    $("#unpublishPost").hidden = status !== "published";
    $("#publishPost").textContent = status === "published" ? "Güncelle" : "Yayınla";
}

function renderBodyHtml(body, format) {
    if (!body.trim()) return "";
    const html = format === "html" ? body : window.marked.parse(body, { gfm: true });
    return window.DOMPurify.sanitize(html);
}

function readingMinutes(body, format) {
    const text = format === "html" ? body.replace(/<[^>]+>/g, " ") : body;
    const words = text.split(/\s+/).filter(Boolean).length;
    return words ? Math.max(1, Math.round(words / 200)) : null;
}

function updatePostPreview() {
    const f = $("#postForm");
    const cover = f.dataset.cover;
    const tags = splitList(f.tags.value);
    const isPdf = attachment && /pdf/.test(attachment.file_type || attachment.file_name);
    const minutes = readingMinutes(f.body.value, bodyFormat);
    const body = `<main class="post-page" style="padding-top:12px"><article>
        <header class="post-header">
            <div class="meta"><span class="year">${POST_KIND_LABELS[f.kind.value]}</span><span>${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>${minutes ? `<span>${minutes} dk okuma</span>` : ""}</div>
            <h1>${esc(f.title.value || "Başlıksız yazı")}</h1>
            ${f.excerpt.value ? `<p class="lead">${esc(f.excerpt.value)}</p>` : ""}
        </header>
        ${cover ? `<img class="post-cover" src="${esc(cover)}" alt="">` : ""}
        <div class="prose">${renderBodyHtml(f.body.value, bodyFormat)}</div>
        ${attachment ? `<div class="post-attachment"><div><strong>${esc(attachment.file_name)}</strong></div><div class="hero-actions"><a class="btn primary" href="${esc(attachment.file_url)}">İndir</a></div></div>
            ${isPdf ? `<iframe class="post-pdf" src="${esc(attachment.file_url)}"></iframe>` : ""}` : ""}
        ${tags.length ? `<div class="tags post-tags">${tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
    </article></main>`;
    $("#postPreview").srcdoc = previewDoc(body);
}

const updatePostPreviewSoon = debounce(updatePostPreview, 300);

$("#postForm").addEventListener("input", (event) => {
    dirty = true;
    const f = $("#postForm");
    if (event.target === f.slug) slugTouched = true;
    if (event.target === f.title && !slugTouched) f.slug.value = slugify(f.title.value);
    updatePostPreviewSoon();
});

$("#postModes").addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (btn) setPostMode(btn.dataset.mode);
});

const MD = {
    bold: ["**", "**", "kalın metin"],
    italic: ["_", "_", "italik metin"],
    h2: ["\n## ", "\n", "Başlık"],
    h3: ["\n### ", "\n", "Alt başlık"],
    link: ["[", "](https://)", "bağlantı metni"],
    ul: ["\n- ", "\n- \n", "madde"],
    quote: ["\n> ", "\n", "alıntı"],
    code: ["\n```\n", "\n```\n", "kod"],
};

$("#mdToolbar").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-md]");
    if (!btn) return;
    const [before, after, ph] = MD[btn.dataset.md];
    insertAtCursor($("#postForm").body, before, after, ph);
});

function postFolder() {
    return slugify($("#postForm").slug.value || "taslak");
}

$("#mdImageUpload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
        const src = await uploadFile("media", `blog/${postFolder()}`, file);
        insertAtCursor($("#postForm").body, `\n![`, `](${src})\n`, "görsel açıklaması");
        toast("Görsel yüklendi ve eklendi.");
    } catch (error) { fail(error, "Yükleme başarısız"); }
});

$("#postCoverUpload").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
        const src = await uploadFile("media", `blog/${postFolder()}`, file);
        $("#postForm").dataset.cover = src;
        setCover(src);
        dirty = true;
        updatePostPreview();
    } catch (error) { fail(error, "Yükleme başarısız"); }
});

$("#postCoverRemove").addEventListener("click", () => {
    $("#postForm").dataset.cover = "";
    setCover(null);
    dirty = true;
    updatePostPreview();
});

$("#toMarkdown").addEventListener("click", () => {
    if (!confirm("HTML içerik silinip boş bir Markdown düzenleyicisine dönülsün mü?")) return;
    $("#postForm").body.value = "";
    setBodyFormat("markdown");
    dirty = true;
    updatePostPreview();
});

$("#attachmentRemove").addEventListener("click", () => {
    attachment = null;
    renderAttachment();
    dirty = true;
    updatePostPreview();
});

async function attachFile(file) {
    const url = await uploadFile("blog-files", postFolder(), file);
    attachment = { file_url: url, file_name: file.name, file_type: file.type || null, file_size: file.size };
    renderAttachment();
}

async function handlePostFile(file) {
    const form = $("#postForm");
    const name = file.name.toLowerCase();
    const ext = name.slice(name.lastIndexOf(".") + 1);
    const titleFromName = () => {
        if (!form.title.value.trim()) {
            form.title.value = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
            if (!slugTouched) form.slug.value = slugify(form.title.value);
        }
    };
    toast(`"${file.name}" işleniyor...`);
    if (["md", "markdown", "txt"].includes(ext)) {
        const text = await file.text();
        const heading = text.match(/^#\s+(.+)$/m);
        if (heading && !form.title.value.trim()) {
            form.title.value = heading[1].trim();
            if (!slugTouched) form.slug.value = slugify(form.title.value);
        } else titleFromName();
        form.body.value = heading && heading[1].trim() === form.title.value.trim() ? text.replace(heading[0], "").trimStart() : text;
        setBodyFormat("markdown");
        setPostMode("write");
        toast("Metin içeri aktarıldı.");
    } else if (["html", "htm"].includes(ext)) {
        const doc = new DOMParser().parseFromString(await file.text(), "text/html");
        form.body.value = doc.body.innerHTML.trim();
        if (!form.title.value.trim() && doc.title) form.title.value = doc.title;
        titleFromName();
        setBodyFormat("html");
        setPostMode("write");
        toast("HTML içeri aktarıldı.");
    } else if (ext === "docx") {
        if (!window.mammoth) throw new Error("Word dönüştürücü yüklenemedi, sayfayı yenileyip tekrar deneyin.");
        const result = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        form.body.value = result.value;
        titleFromName();
        setBodyFormat("html");
        if ($("#keepOriginal").checked) await attachFile(file);
        setPostMode("write");
        toast("Word belgesi yazıya dönüştürüldü.");
    } else {
        await attachFile(file);
        titleFromName();
        if (ext === "pdf" && form.kind.value === "yazi") form.kind.value = "rapor";
        toast("Dosya yazıya ek olarak eklendi.");
    }
    dirty = true;
    updatePostPreview();
}

$("#postFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (file) await handlePostFile(file).catch(error => fail(error, "Dosya işlenemedi"));
});

const dropzone = $("#dropzone");
dropzone.addEventListener("dragover", (event) => { event.preventDefault(); dropzone.classList.add("over"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("over"));
dropzone.addEventListener("drop", async (event) => {
    event.preventDefault();
    dropzone.classList.remove("over");
    const file = event.dataTransfer.files[0];
    if (file) await handlePostFile(file).catch(error => fail(error, "Dosya işlenemedi"));
});

async function savePost(status, button) {
    const form = $("#postForm");
    if (!form.reportValidity()) return;
    await busy(button, async () => {
        const row = {
            title: form.title.value.trim(),
            slug: form.slug.value.trim(),
            kind: form.kind.value,
            tags: splitList(form.tags.value),
            excerpt: nullIfEmpty(form.excerpt.value),
            cover_url: form.dataset.cover || null,
            body: form.body.value,
            body_format: bodyFormat,
            reading_minutes: readingMinutes(form.body.value, bodyFormat),
            file_url: attachment?.file_url ?? null,
            file_name: attachment?.file_name ?? null,
            file_type: attachment?.file_type ?? null,
            file_size: attachment?.file_size ?? null,
            status,
        };
        if (status === "published" && !(editingPost && editingPost.published_at)) row.published_at = new Date().toISOString();
        if (!row.body.trim() && !row.file_url && status === "published") {
            toast("Yayınlamadan önce içerik yazın ya da bir dosya ekleyin.", "err");
            return;
        }
        const query = editingPost
            ? sb.from("posts").update(row).eq("id", editingPost.id).select().single()
            : sb.from("posts").insert(row).select().single();
        const { data, error } = await query;
        if (error) return fail(error.code === "23505" ? new Error("Bu adres (slug) başka bir yazıda kullanılıyor.") : error, "Kaydedilemedi");
        editingPost = data;
        dirty = false;
        slugTouched = true;
        updatePostStatus(data.status);
        $("#deletePost").hidden = false;
        $("#postEditorTitle").textContent = "Yazıyı düzenle";
        toast(status === "published" ? "Yazı yayında. Blog sayfasında görünüyor." : "Taslak kaydedildi.");
    });
}

$("#saveDraft").addEventListener("click", (e) => savePost(editingPost?.status === "published" ? "published" : "draft", e.currentTarget));
$("#publishPost").addEventListener("click", (e) => savePost("published", e.currentTarget));
$("#unpublishPost").addEventListener("click", (e) => savePost("draft", e.currentTarget));

$("#deletePost").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    if (!editingPost || !confirm(`"${editingPost.title}" kalıcı olarak silinsin mi? Bu işlem geri alınamaz.\n\nSadece gizlemek için "Yayından kaldır" kullanabilirsiniz.`)) return;
    const { data, error } = await sb.from("posts").delete().eq("id", editingPost.id).select("id");
    if (error || !data?.length) return fail(error || new Error("Yetki yok ya da kayıt bulunamadı."), "Silinemedi");
    dirty = false;
    toast("Yazı silindi.");
    openPostList();
}));

// ===== Kaynaklar ve ilgi alanları =====
let interests = [];
let sources = [];

async function openSources() {
    await Promise.all([loadInterests(), loadSources()]);
}

async function loadInterests() {
    const { data, error } = await sb.from("interests").select("*").order("weight", { ascending: false }).order("id");
    if (error) return fail(error, "İlgi alanları yüklenemedi");
    interests = data;
    renderInterests();
}

function renderInterests() {
    $("#interestList").innerHTML = interests.map((it, i) => `
        <div class="interest-row${it.enabled ? "" : " off"}" data-i="${i}">
            <label>Ad<input class="input" data-f="name" value="${esc(it.name)}"></label>
            <label class="weight">Ağırlık <output>${it.weight}</output><input type="range" min="0" max="10" data-f="weight" value="${it.weight}"></label>
            <label>Anahtar kelimeler <small>(virgülle)</small><textarea class="input" data-f="keywords" rows="2">${esc((it.keywords || []).join(", "))}</textarea></label>
            <div class="side">
                <label class="check"><input type="checkbox" data-f="enabled" ${it.enabled ? "checked" : ""}> Etkin</label>
                <button type="button" class="icon-btn" data-del-interest>Sil</button>
            </div>
        </div>`).join("");
}

$("#interestList").addEventListener("input", (event) => {
    const row = event.target.closest(".interest-row");
    const f = event.target.dataset.f;
    if (!row || !f) return;
    const it = interests[Number(row.dataset.i)];
    if (f === "weight") { it.weight = Number(event.target.value); row.querySelector("output").textContent = it.weight; }
    else if (f === "enabled") { it.enabled = event.target.checked; row.classList.toggle("off", !it.enabled); }
    else if (f === "keywords") it.keywords = splitList(event.target.value);
    else it.name = event.target.value;
    it._dirty = true;
});

$("#interestList").addEventListener("click", async (event) => {
    if (!event.target.closest("[data-del-interest]")) return;
    const i = Number(event.target.closest(".interest-row").dataset.i);
    const it = interests[i];
    if (it.id && !confirm(`"${it.name}" ilgi alanı silinsin mi?`)) return;
    if (it.id) {
        const { error } = await sb.from("interests").delete().eq("id", it.id);
        if (error) return fail(error);
    }
    interests.splice(i, 1);
    renderInterests();
});

$("#addInterest").addEventListener("click", () => {
    interests.push({ name: "", weight: 5, keywords: [], enabled: true, _dirty: true });
    renderInterests();
    $("#interestList .interest-row:last-child input").focus();
});

$("#saveInterests").addEventListener("click", (event) => busy(event.currentTarget, async () => {
    try {
        for (const it of interests.filter(x => x._dirty)) {
            if (!it.name.trim()) continue;
            const row = { name: it.name.trim(), weight: it.weight, keywords: it.keywords, enabled: it.enabled };
            const { error } = it.id
                ? await sb.from("interests").update(row).eq("id", it.id)
                : await sb.from("interests").insert(row);
            if (error) throw error;
        }
        const { data: count, error } = await sb.rpc("rescore_news");
        if (error) throw error;
        toast(`Kaydedildi. ${count} öğe yeniden puanlandı.`);
        loadInterests();
    } catch (error) { fail(error, "Kaydedilemedi"); }
}));

async function loadSources() {
    const { data, error } = await sb.from("news_sources").select("*").order("kind").order("name");
    if (error) return fail(error, "Kaynaklar yüklenemedi");
    sources = data;
    $("#sourceTable").innerHTML = `<thead><tr><th>Etkin</th><th>Kaynak</th><th>Tür</th><th>Ağırlık</th><th>Durum</th><th></th></tr></thead><tbody>
        ${sources.map(s => {
            const ok = s.last_status === "ok";
            const status = s.last_status ? `<span class="status-pill ${ok ? "ok" : s.last_status.startsWith("hata") ? "err" : ""}" title="${esc(s.last_status)}">${ok ? `${s.last_count ?? 0} yeni` : esc(s.last_status)}</span> <span class="muted small">${timeAgo(s.last_fetched_at)}</span>` : `<span class="muted small">henüz çekilmedi</span>`;
            return `<tr data-id="${s.id}">
                <td><input type="checkbox" class="check" data-s="enabled" ${s.enabled ? "checked" : ""} aria-label="Etkin"></td>
                <td class="title-cell"><strong>${esc(s.name)}</strong><div class="url-cell" title="${esc(s.url)}">${esc(s.url)}</div></td>
                <td><select class="input" data-s="kind">${Object.entries(KIND_LABELS).map(([k, l]) => `<option value="${k}" ${s.kind === k ? "selected" : ""}>${l}</option>`).join("")}</select></td>
                <td><input type="number" class="input" data-s="weight" min="-5" max="5" value="${s.weight}" style="width:64px"></td>
                <td>${status}</td>
                <td><div class="actions">
                    <button type="button" class="btn small" data-test>Test et</button>
                    <button type="button" class="btn small danger" data-del>Sil</button>
                </div></td>
            </tr>`;
        }).join("")}</tbody>`;
}

$("#sourceTable").addEventListener("change", async (event) => {
    const field = event.target.dataset.s;
    const row = event.target.closest("tr[data-id]");
    if (!field || !row) return;
    let value = field === "enabled" ? event.target.checked : event.target.value;
    if (field === "weight") value = Math.max(-5, Math.min(5, Number(value) || 0));
    const { data, error } = await sb.from("news_sources").update({ [field]: value }).eq("id", row.dataset.id).select("id");
    if (error || !data.length) return fail(error || new Error("Yetki yok. Oturumunuzu yenileyin."));
    if (field === "kind") await sb.from("news_items").update({ kind: value }).eq("source_id", row.dataset.id);
    toast("Kaynak güncellendi.");
});

async function testSource(id, button) {
    return busy(button, async () => {
        const { data, error } = await sb.functions.invoke("fetch-news", { body: { source_id: Number(id) } });
        if (error) return fail(error, "Test başarısız");
        const r = data.results?.[0];
        if (r?.error) toast(`Kaynak okunamadı: ${r.error}`, "err");
        else toast(`Akış okundu: ${r?.found ?? 0} öğe bulundu, ${r?.inserted ?? 0} yeni eklendi.`);
        loadSources();
    });
}

$("#sourceTable").addEventListener("click", async (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const s = sources.find(x => String(x.id) === row.dataset.id);
    if (event.target.closest("[data-test]")) return testSource(s.id, event.target.closest("button"));
    if (event.target.closest("[data-del]")) {
        if (!confirm(`"${s.name}" kaynağı ve bu kaynaktan gelen tüm öğeler silinsin mi?`)) return;
        const { error } = await sb.from("news_sources").delete().eq("id", s.id);
        if (error) return fail(error);
        toast("Kaynak silindi.");
        loadSources();
    }
});

$("#addSourceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const f = event.currentTarget;
    const button = f.querySelector("button");
    const lang = /hl=tr|\.com\.tr|webtekno|shiftdelete/i.test(f.url.value) ? "tr" : "en";
    const { data, error } = await sb.from("news_sources").insert({ name: f.name.value.trim(), url: f.url.value.trim(), kind: f.kind.value, lang }).select().single();
    if (error) return fail(error.code === "23505" ? new Error("Bu adres zaten ekli.") : error, "Eklenemedi");
    f.reset();
    await loadSources();
    testSource(data.id, button);
});

boot();
