// Mobil bildirimler (Web Push)
// mode "auto": saatlik görev. Eşiği aşan yeni öğeler için anlık bildirim + ayarlanan saatte günlük özet.
// mode "test": paneldeki "Test bildirimi gönder" düğmesi.
// VAPID anahtar çifti ilk çalıştırmada burada üretilir ve yalnızca Vault'ta saklanır.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CONTACT = "mailto:osmannuriyasar57@gmail.com";
const PANEL_URL = "https://osmnnuri.github.io/admin/#haberler";
const KIND_LABELS: Record<string, string> = { haber: "Haber", ilan: "İlan", firsat: "Fırsat" };

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function authorized(req: Request): Promise<boolean> {
    const secret = req.headers.get("x-cron-secret");
    if (secret) {
        const { data } = await db.rpc("check_cron_secret", { p_secret: secret });
        return data === true;
    }
    const auth = req.headers.get("Authorization");
    if (!auth) return false;
    const user = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    const { data } = await user.rpc("is_admin");
    return data === true;
}

const b64url = (bytes: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function vapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
    const read = async () => (await db.rpc("get_vapid_keys").single()).data as { public_key: string | null; private_key: string | null } | null;
    let keys = await read();
    if (!keys?.private_key) {
        const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
        const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
        const raw = await crypto.subtle.exportKey("raw", pair.publicKey); // 65 bayt, sıkıştırılmamış
        const { error } = await db.rpc("store_vapid_keys", { p_public: b64url(raw), p_private: jwk.d! });
        if (error) throw new Error(`VAPID anahtarı kaydedilemedi: ${error.message}`);
        keys = await read();
    }
    return { publicKey: keys!.public_key!, privateKey: keys!.private_key! };
}

type Payload = { title: string; body: string; url: string; tag: string };
type Sub = { id: number; endpoint: string; p256dh: string; auth: string; failure_count: number };

async function sendToAll(payload: Payload, onlyEndpoint?: string) {
    let q = db.from("push_subscriptions").select("id, endpoint, p256dh, auth, failure_count");
    if (onlyEndpoint) q = q.eq("endpoint", onlyEndpoint);
    const { data: subs } = await q;
    let sent = 0, failed = 0;
    const errors: string[] = [];
    for (const s of (subs ?? []) as Sub[]) {
        try {
            await webpush.sendNotification(
                { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                JSON.stringify(payload),
                { TTL: 6 * 3600, urgency: "normal", topic: payload.tag.slice(0, 32).replace(/[^A-Za-z0-9_-]/g, "") || undefined },
            );
            sent++;
            await db.from("push_subscriptions").update({ last_success_at: new Date().toISOString(), failure_count: 0 }).eq("id", s.id);
        } catch (e) {
            failed++;
            const status = (e as { statusCode?: number }).statusCode;
            errors.push(`${status ?? ""} ${(e as Error).message}`.trim().slice(0, 160));
            // 404/410: abonelik artık geçersiz (uygulama kaldırıldı ya da izin geri alındı)
            if (status === 404 || status === 410 || s.failure_count >= 9) await db.from("push_subscriptions").delete().eq("id", s.id);
            else await db.from("push_subscriptions").update({ failure_count: s.failure_count + 1 }).eq("id", s.id);
        }
    }
    return { sent, failed, devices: subs?.length ?? 0, errors };
}

async function log(kind: string, p: Payload, itemIds: number[], r: { sent: number; failed: number }) {
    await db.from("notification_log").insert({ kind, title: p.title, body: p.body, url: p.url, item_ids: itemIds, sent: r.sent, failed: r.failed });
}

type Item = { id: number; title: string; url: string; kind: string; rank: number; source_name: string | null; matched: string[] };

function itemPayload(n: Item): Payload {
    const meta = [KIND_LABELS[n.kind], n.source_name, ...(n.matched ?? []).slice(0, 2)].filter(Boolean).join(" · ");
    return { title: n.title.slice(0, 120), body: `${meta}\nÖncelik puanı: ${Math.round(n.rank)}`, url: n.url, tag: `item-${n.id}` };
}

async function runInstant(s: Record<string, unknown>) {
    const hourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { data: recent } = await db.from("notification_log").select("item_ids").eq("kind", "instant").gte("created_at", hourAgo);
    const remaining = (s.max_per_hour as number) - (recent?.length ?? 0);
    if (remaining <= 0) return { skipped: "saatlik sınır doldu" };

    const { data: items } = await db.from("news_feed")
        .select("id, title, url, kind, rank, source_name, matched")
        .is("notified_at", null)
        .eq("status", "new")
        .in("kind", s.instant_kinds as string[])
        .gte("rank", s.instant_threshold as number)
        .gte("fetched_at", new Date(Date.now() - 3 * 3600_000).toISOString())
        .order("rank", { ascending: false })
        .limit(20);
    const list = (items ?? []) as Item[];
    if (!list.length) return { candidates: 0 };

    const singles = list.length <= remaining ? list : list.slice(0, remaining - 1);
    const grouped = list.slice(singles.length);
    let sent = 0;
    for (const n of singles) {
        const p = itemPayload(n);
        const r = await sendToAll(p);
        await log("instant", p, [n.id], r);
        sent += r.sent;
    }
    if (grouped.length) {
        const p: Payload = {
            title: `${grouped.length} yüksek öncelikli öğe daha`,
            body: grouped.slice(0, 3).map((n) => `• ${n.title.slice(0, 70)}`).join("\n"),
            url: PANEL_URL,
            tag: "instant-group",
        };
        const r = await sendToAll(p);
        await log("instant", p, grouped.map((n) => n.id), r);
        sent += r.sent;
    }
    await db.from("news_items").update({ notified_at: new Date().toISOString() }).in("id", list.map((n) => n.id));
    return { candidates: list.length, notifications: singles.length + (grouped.length ? 1 : 0), sent };
}

function istanbulNow() {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
        .formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)!.value;
    return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) % 24 };
}

async function runDigest(s: Record<string, unknown>, force = false) {
    const now = istanbulNow();
    if (!force && now.hour !== s.digest_hour) return { skipped: "özet saati değil" };
    // Türkiye UTC+3 sabit: günün başlangıcı UTC'de bir önceki gün 21:00
    const dayStart = new Date(`${now.date}T00:00:00+03:00`).toISOString();
    if (!force) {
        const { count } = await db.from("notification_log").select("id", { count: "exact", head: true }).eq("kind", "digest").gte("created_at", dayStart);
        if (count) return { skipped: "bugünün özeti gönderildi" };
    }
    const { data: items } = await db.from("news_feed")
        .select("id, title, url, kind, rank, source_name, matched")
        .neq("status", "dismissed")
        .gt("relevance", 0)
        .gte("fetched_at", new Date(Date.now() - 24 * 3600_000).toISOString())
        .order("rank", { ascending: false })
        .limit(s.digest_count as number);
    const list = (items ?? []) as Item[];
    if (!list.length) return { skipped: "son 24 saatte öğe yok" };
    const counts = list.reduce((acc: Record<string, number>, n) => ({ ...acc, [n.kind]: (acc[n.kind] ?? 0) + 1 }), {});
    const summary = Object.entries(counts).map(([k, c]) => `${c} ${KIND_LABELS[k].toLocaleLowerCase("tr")}`).join(", ");
    const p: Payload = {
        title: `Günün özeti: ${summary}`,
        body: list.slice(0, 4).map((n) => `• ${n.title.slice(0, 70)}`).join("\n"),
        url: PANEL_URL,
        tag: `digest-${now.date}`,
    };
    const r = await sendToAll(p);
    await log("digest", p, list.map((n) => n.id), r);
    return { items: list.length, ...r };
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST") return json({ error: "Yalnızca POST" }, 405);
    if (!(await authorized(req))) return json({ error: "Yetkisiz" }, 401);

    let body: { mode?: string; endpoint?: string } = {};
    try { body = await req.json(); } catch { /* gövde yok */ }

    try {
        const keys = await vapidKeys();
        webpush.setVapidDetails(CONTACT, keys.publicKey, keys.privateKey);

        if (body.mode === "test") {
            const p: Payload = {
                title: "Bildirimler çalışıyor",
                body: "Yüksek öncelikli haber, ilan ve fırsatlar bu cihaza gelecek.",
                url: PANEL_URL,
                tag: "test",
            };
            const r = await sendToAll(p, body.endpoint);
            if (r.devices) await log("test", p, [], r);
            return json({ mode: "test", ...r });
        }

        const { data: s } = await db.from("notification_settings").select("*").eq("id", 1).single();
        if (body.mode === "digest") return json({ mode: "digest", digest: await runDigest(s, true) });
        if (!s?.enabled) return json({ mode: "auto", skipped: "bildirimler kapalı" });
        const instant = s.instant_enabled ? await runInstant(s) : { skipped: "anlık bildirimler kapalı" };
        const digest = s.digest_enabled ? await runDigest(s) : { skipped: "günlük özet kapalı" };
        return json({ mode: "auto", instant, digest });
    } catch (e) {
        console.error(e);
        return json({ error: (e as Error).message }, 500);
    }
});
