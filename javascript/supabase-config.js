// Supabase bağlantısı. Bu anahtar herkese açık (publishable) anahtardır;
// veriye erişim veritabanındaki satır düzeyi güvenlik (RLS) kurallarıyla sınırlanır.
window.SUPABASE_CONFIG = {
    url: "https://bwwdthjkhnjmxoifwoiz.supabase.co",
    key: "sb_publishable_BHmlqLuNe2dXAMoUcyNj5g_eDLI_RlV"
};

// Herkese açık veriyi REST API'den okur (kütüphane gerektirmez)
window.sbGet = async function (path, { timeout = 8000 } = {}) {
    const { url, key } = window.SUPABASE_CONFIG;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key }, signal: ctrl.signal });
        if (!res.ok) throw new Error(`Supabase ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
};

window.escapeHtml = function (value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
};

window.formatDateTr = function (iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
};
