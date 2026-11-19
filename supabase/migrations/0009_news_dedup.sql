-- Haber Ağı tekilleştirme
-- Sorun: tek tekillik url üzerindeydi. Aynı içerik farklı URL ile tekrar geliyordu:
--   * Himalayas aynı ilanı her yeniden yayımlayışta URL sonundaki sayıyı değiştiriyor (başlık ve açıklama aynı).
--   * Google Haberler her yayıncı ve sorgu için ayrı yönlendirme linki veriyor; başlık "... - Yayıncı" biçiminde.
-- Her yeni URL yeni kayıt sayıldığı için bildirim de yeniden gidiyordu.
-- Çözüm: içerikten türetilen dedup_key sütunu + unique kısıt. Ekleme insert_news_items() ile
-- "on conflict do nothing" yapılır; çakışan kayıt hiç eklenmez, dolayısıyla bildirimi de gitmez.

-- Başlık/özet normalizasyonu: kesme işaretlerini sil (Komisyonu'na = Komisyonuna), küçük harfe çevir,
-- harf/rakam dışındaki her şeyi tek boşluğa indir.
create or replace function public.news_norm(p text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
    select btrim(regexp_replace(lower(regexp_replace(coalesce(p, ''), '[''’`´]', '', 'g')), '[^[:alnum:]]+', ' ', 'g'));
$$;

-- Farklı yayıncıların aynı olayı farklı başlıkla vermesi (ör. "AB Komisyonu'na ... - Milliyet" ile
-- "Avrupa'nın dijital güvenliği alarmda ... - EHA Medya") bilerek birleştirilmez: başlık benzerliği denendi,
-- gerçek verilerde farklı haberleri de birleştirdi. Haberler tek tek bildirilmediği için (0007) bildirim tekrarı oluşmaz.
--
-- Tekil anahtar:
--   Google Haberler: sondaki " - Yayıncı" atılmış başlık (aynı başlık farklı yayıncı/sorgu = aynı haber).
--   Diğerleri: başlık + özetin ilk 300 karakteri (aynı ilan/yazı farklı URL ile yeniden yayımlanmış).
--   Yalnızca başlık kullanılmaz; "Weekly update" gibi genel başlıklı farklı yazılar birleşmesin diye özet de eklenir.
create or replace function public.news_dedup_key(p_url text, p_title text, p_summary text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
    select case
        when p_url like 'https://news.google.com/%' then
            'g:' || md5(public.news_norm(regexp_replace(p_title, '\s+[-–—|]\s+[^-–—|]+$', '')))
        else
            'x:' || md5(public.news_norm(p_title) || '|' || public.news_norm(left(coalesce(p_summary, ''), 300)))
    end;
$$;

alter table public.news_items
    add column dedup_key text generated always as (public.news_dedup_key(url, title, summary)) stored;

-- Mevcut tekrarları temizle: her anahtar için kaydedilmiş olan (Nota çevir de "saved" yapar), yoksa en eski kalır.
-- Kalan kayıt, silinenlerden biri bildirildiyse bildirilmiş sayılır.
with ranked as (
    select id, first_value(id) over w as keep_id
    from public.news_items
    window w as (partition by dedup_key order by (status = 'saved') desc, fetched_at, id)
),
notified as (
    select r.keep_id, min(n.notified_at) as notified_at
    from ranked r join public.news_items n on n.id = r.id
    where n.notified_at is not null
    group by r.keep_id
)
update public.news_items n
set notified_at = x.notified_at
from notified x
where n.id = x.keep_id and n.notified_at is null;

delete from public.news_items n
using (
    select id, row_number() over (partition by dedup_key order by (status = 'saved') desc, fetched_at, id) as rn
    from public.news_items
) d
where n.id = d.id and d.rn > 1;

create unique index news_items_dedup_key_idx on public.news_items (dedup_key);

-- fetch-news buradan ekler: url veya dedup_key çakışan satırlar sessizce atlanır, yalnızca gerçekten eklenenler döner.
create or replace function public.insert_news_items(p_rows jsonb)
returns table (id bigint, source_id bigint)
language sql
set search_path = ''
as $$
    insert into public.news_items as n (source_id, kind, url, title, summary, image_url, published_at)
    select r.source_id, r.kind, r.url, r.title, r.summary, r.image_url, r.published_at
    from jsonb_to_recordset(p_rows) as r(
        source_id bigint, kind text, url text, title text, summary text, image_url text, published_at timestamptz
    )
    on conflict do nothing
    returning n.id, n.source_id;
$$;

revoke execute on function public.insert_news_items(jsonb) from public, anon, authenticated;
grant execute on function public.insert_news_items(jsonb) to service_role;
-- news_feed görünümüne dokunulmaz: sütun listesi oluşturulduğu anda sabitlendi, dedup_key panele gerekmiyor.
