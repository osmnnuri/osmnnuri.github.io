// Haber ağı: kayıtlı RSS/Atom kaynaklarını çeker, yeni öğeleri news_items tablosuna ekler.
// Puanlama veritabanındaki tetikleyicide (score_text) yapılır.
// Çağıranlar: saatlik pg_cron görevi (x-cron-secret) veya paneldeki yönetici (JWT).
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { XMLParser } from "npm:fast-xml-parser@4.5.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Haberler 14 günden, ilan ve fırsatlar 30 günden eskiyse alınmaz
const maxAgeDays = (kind: string) => (kind === "haber" ? 14 : 30);
const MAX_PER_SOURCE = 30;
const CONCURRENCY = 6;

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function authorized(req: Request): Promise<boolean> {
    const secret = req.headers.get("x-cron-secret");
    if (secret) {
        const { data } = await admin.rpc("check_cron_secret", { p_secret: secret });
        return data === true;
    }
    const auth = req.headers.get("Authorization");
    if (!auth) return false;
    const user = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: auth } },
        auth: { persistSession: false },
    });
    const { data } = await user.rpc("is_admin");
    return data === true;
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    textNodeName: "#text",
    processEntities: true,
    htmlEntities: true,
});

const asArray = <T>(v: T | T[] | undefined): T[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);

function text(v: unknown): string {
    if (v === undefined || v === null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (Array.isArray(v)) return text(v[0]);
    if (typeof v === "object") {
        const o = v as Record<string, unknown>;
        return text(o["#text"] ?? o["@href"] ?? "");
    }
    return "";
}

function stripHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function atomLink(v: unknown): string {
    const links = asArray(v as Record<string, string> | Record<string, string>[]);
    const alt = links.find((l) => typeof l === "object" && (!l["@rel"] || l["@rel"] === "alternate"));
    if (alt && typeof alt === "object") return alt["@href"] ?? "";
    return text(links[0]);
}

function firstImage(item: Record<string, unknown>, html: string): string | null {
    const media = asArray(item["media:content"] as Record<string, string>[]).concat(
        asArray(item["media:thumbnail"] as Record<string, string>[]),
    );
    for (const m of media) if (m && m["@url"]) return m["@url"];
    const enc = asArray(item["enclosure"] as Record<string, string>[]).find((e) => e && String(e["@type"] ?? "").startsWith("image"));
    if (enc) return enc["@url"];
    const img = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return img ? img[1] : null;
}

type Parsed = { url: string; title: string; summary: string; image_url: string | null; published_at: string | null };

function parseFeed(xml: string): Parsed[] {
    const doc = parser.parse(xml);
    const rssItems = asArray(doc?.rss?.channel?.item ?? doc?.["rdf:RDF"]?.item);
    const atomItems = asArray(doc?.feed?.entry);
    const out: Parsed[] = [];

    for (const it of rssItems as Record<string, unknown>[]) {
        const html = text(it["content:encoded"]) || text(it.description);
        out.push({
            url: text(it.link) || text(it.guid),
            title: stripHtml(text(it.title)),
            summary: stripHtml(html).slice(0, 500),
            image_url: firstImage(it, html),
            published_at: text(it.pubDate) || text(it["dc:date"]) || null,
        });
    }
    for (const it of atomItems as Record<string, unknown>[]) {
        const html = text(it.content) || text(it.summary);
        out.push({
            url: atomLink(it.link),
            title: stripHtml(text(it.title)),
            summary: stripHtml(html).slice(0, 500),
            image_url: firstImage(it, html),
            published_at: text(it.published) || text(it.updated) || null,
        });
    }
    return out;
}

function toIso(d: string | null): string | null {
    if (!d) return null;
    const t = new Date(d);
    return isNaN(t.getTime()) ? null : t.toISOString();
}

type Source = { id: number; name: string; url: string; kind: string };

async function fetchSource(src: Source) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch(src.url, {
            signal: ctrl.signal,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; OnyPortfolyoHaberAgi/1.0)",
                Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items = parseFeed(await res.text());
        const cutoff = Date.now() - maxAgeDays(src.kind) * 86400000;
        const rows = items
            .map((i) => ({ ...i, published_at: toIso(i.published_at) }))
            .filter((i) => i.url.startsWith("http") && i.title)
            .filter((i) => !i.published_at || new Date(i.published_at).getTime() >= cutoff)
            .slice(0, MAX_PER_SOURCE)
            .map((i) => ({ ...i, url: i.url.trim(), title: i.title.slice(0, 300), source_id: src.id, kind: src.kind }));

        let inserted = 0;
        if (rows.length) {
            const { data, error } = await admin
                .from("news_items")
                .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
                .select("id");
            if (error) throw new Error(error.message);
            inserted = data?.length ?? 0;
        }
        await admin.from("news_sources").update({
            last_fetched_at: new Date().toISOString(),
            last_status: items.length ? "ok" : "boş akış",
            last_count: inserted,
        }).eq("id", src.id);
        return { source: src.name, found: items.length, inserted };
    } catch (e) {
        const msg = e instanceof Error ? (e.name === "AbortError" ? "zaman aşımı" : e.message) : String(e);
        await admin.from("news_sources").update({
            last_fetched_at: new Date().toISOString(),
            last_status: `hata: ${msg}`.slice(0, 200),
            last_count: 0,
        }).eq("id", src.id);
        return { source: src.name, error: msg };
    } finally {
        clearTimeout(timer);
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST") return json({ error: "Yalnızca POST" }, 405);
    if (!(await authorized(req))) return json({ error: "Yetkisiz" }, 401);

    let only: number | undefined;
    try {
        const body = await req.json();
        if (typeof body?.source_id === "number") only = body.source_id;
    } catch { /* gövde yok */ }

    let q = admin.from("news_sources").select("id, name, url, kind").eq("enabled", true);
    if (only) q = q.eq("id", only);
    const { data: sources, error } = await q;
    if (error) return json({ error: error.message }, 500);

    const results: unknown[] = [];
    const queue = [...(sources as Source[])];
    await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
            while (queue.length) results.push(await fetchSource(queue.shift()!));
        }),
    );

    // Eski ve ilgisiz öğeleri temizle (kaydedilenler kalır)
    await admin.from("news_items").delete()
        .neq("status", "saved")
        .lt("fetched_at", new Date(Date.now() - 45 * 86400000).toISOString());

    const inserted = results.reduce((n: number, r) => n + ((r as { inserted?: number }).inserted ?? 0), 0);
    return json({ sources: results.length, inserted, results });
});
