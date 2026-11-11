// Blog listesi (blog/index.html) ve yazı sayfası (blog/yazi.html)
const esc = window.escapeHtml;
const KINDS = { yazi: "Yazı", rapor: "Rapor", not: "Not" };

// --- Mobil menü ---
(() => {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    const overlay = document.getElementById("navOverlay");
    if (!hamburger || !navLinks || !overlay) return;
    const toggle = (open) => {
        [hamburger, navLinks, overlay].forEach(el => el.classList.toggle("active", open));
        hamburger.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    };
    hamburger.addEventListener("click", () => toggle(!navLinks.classList.contains("active")));
    overlay.addEventListener("click", () => toggle(false));
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => toggle(false)));
})();

function metaLine(post) {
    return `<div class="meta"><span class="year">${KINDS[post.kind] || "Yazı"}</span><span>${window.formatDateTr(post.published_at)}</span>${post.reading_minutes ? `<span>${post.reading_minutes} dk okuma</span>` : ""}</div>`;
}

function formatSize(bytes) {
    if (!bytes) return "";
    return bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// --- Liste sayfası ---
async function initList() {
    const list = document.getElementById("postList");
    const empty = document.getElementById("postEmpty");
    const search = document.getElementById("blogSearch");
    const buttons = document.querySelectorAll("#kindFilters button");
    let posts = [];
    let kind = "all";

    const render = () => {
        const q = search.value.trim().toLocaleLowerCase("tr");
        const shown = posts.filter(p =>
            (kind === "all" || p.kind === kind) &&
            (!q || [p.title, p.excerpt, ...(p.tags || [])].join(" ").toLocaleLowerCase("tr").includes(q))
        );
        list.innerHTML = shown.map(post => `
            <a class="post-card" href="yazi.html?s=${encodeURIComponent(post.slug)}">
                ${post.cover_url ? `<img src="${esc(post.cover_url)}" alt="" loading="lazy">` : ""}
                <div class="post-card-body">
                    ${metaLine(post)}
                    <h3>${esc(post.title)}</h3>
                    ${post.excerpt ? `<p>${esc(post.excerpt)}</p>` : ""}
                    ${post.file_name ? `<span class="post-file">Ek: ${esc(post.file_name)}</span>` : ""}
                </div>
            </a>`).join("");
        empty.hidden = shown.length > 0;
        empty.textContent = posts.length ? "Bu filtreye uyan yazı yok." : "Henüz yayınlanmış bir yazı yok. Yakında burada olacak.";
    };

    buttons.forEach(b => b.addEventListener("click", () => {
        kind = b.dataset.kind;
        buttons.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        render();
    }));
    search.addEventListener("input", render);

    empty.hidden = false;
    try {
        posts = await window.sbGet("posts?select=slug,title,excerpt,kind,tags,cover_url,published_at,reading_minutes,file_name&status=eq.published&order=published_at.desc");
        render();
    } catch {
        empty.textContent = "Yazılar şu anda yüklenemedi. Lütfen biraz sonra tekrar deneyin.";
    }
}

// --- Yazı sayfası ---
function renderBody(post) {
    if (!post.body || !post.body.trim()) return "";
    // Kütüphaneler CDN'den gelemediyse (ağ engeli, kesinti) yazı yine de düz metin olarak okunabilsin
    const plain = () => `<p style="white-space:pre-wrap">${esc(post.body_format === "html" ? post.body.replace(/<[^>]+>/g, " ") : post.body)}</p>`;
    if (!window.DOMPurify || (post.body_format !== "html" && !window.marked)) return plain();
    try {
        const html = post.body_format === "html" ? post.body : window.marked.parse(post.body, { gfm: true, breaks: false });
        return window.DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
    } catch {
        return plain();
    }
}

async function initPost() {
    const article = document.getElementById("postArticle");
    const slug = new URLSearchParams(location.search).get("s");
    const fail = (msg) => { article.innerHTML = `<p class="blog-empty">${msg}</p>`; };
    if (!slug) return fail("Yazı bulunamadı.");

    let post;
    try {
        const rows = await window.sbGet(`posts?select=*&status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1`);
        post = rows[0];
    } catch {
        return fail("Yazı şu anda yüklenemedi. Lütfen biraz sonra tekrar deneyin.");
    }
    if (!post) return fail("Bu yazı yayından kaldırılmış ya da hiç var olmamış olabilir.");

    document.title = `${post.title} | Osman Nuri Yaşar`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && post.excerpt) desc.setAttribute("content", post.excerpt);

    const isPdf = post.file_url && (post.file_type === "application/pdf" || /\.pdf$/i.test(post.file_name || ""));
    const attachment = post.file_url ? `
        <div class="post-attachment">
            <div><strong>${esc(post.file_name || "Ekli dosya")}</strong><span>${esc(formatSize(post.file_size))}</span></div>
            <div class="hero-actions">
                ${isPdf ? `<a class="btn" href="${esc(post.file_url)}" target="_blank" rel="noopener">Yeni sekmede aç</a>` : ""}
                <a class="btn primary" href="${esc(post.file_url)}" download="${esc(post.file_name || "")}" target="_blank" rel="noopener">İndir</a>
            </div>
        </div>
        ${isPdf ? `<iframe class="post-pdf" src="${esc(post.file_url)}#view=FitH" title="${esc(post.file_name || post.title)}"></iframe>` : ""}` : "";

    article.innerHTML = `
        <header class="post-header">
            ${metaLine(post)}
            <h1>${esc(post.title)}</h1>
            ${post.excerpt ? `<p class="lead">${esc(post.excerpt)}</p>` : ""}
        </header>
        ${post.cover_url ? `<img class="post-cover" src="${esc(post.cover_url)}" alt="">` : ""}
        <div class="prose">${renderBody(post)}</div>
        ${attachment}
        ${(post.tags || []).length ? `<div class="tags post-tags">${post.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}`;

    article.querySelectorAll(".prose a[href^='http']").forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
}

if (document.getElementById("postList")) initList();
if (document.getElementById("postArticle")) initPost();
