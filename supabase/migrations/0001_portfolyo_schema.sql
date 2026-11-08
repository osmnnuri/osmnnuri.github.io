-- Portfolyo: admin paneli, blog ve haber ağı şeması
-- Supabase projesi: bwwdthjkhnjmxoifwoiz

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ===== Yönetici yetkisi =====
-- Yalnızca bu tablodaki, e-postası doğrulanmış hesaplar yönetici sayılır.
create table public.admins (
    email text primary key
);
alter table public.admins enable row level security; -- politika yok: yalnızca service_role erişir

insert into public.admins (email) values ('osmannuriyasar57@gmail.com');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admins a
        join auth.users u on lower(u.email) = lower(a.email)
        where u.id = auth.uid()
          and u.email_confirmed_at is not null
    );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

-- ===== Projeler =====
create table public.projects (
    id text primary key check (id ~ '^[A-Za-z0-9_-]+$'),
    title text not null,                       -- kart başlığı
    modal_title text,                          -- detay penceresi başlığı
    year text,
    type_label text,                           -- örn. "Mobil Uygulama · PWA"
    category text not null default 'app' check (category in ('app', 'game', 'web', 'other')),
    featured boolean not null default false,   -- "Öne çıkan çalışmalar" bölümünde mi?
    summary text,
    highlights text[] not null default '{}',   -- öne çıkan kartlardaki madde listesi
    tags text[] not null default '{}',
    cover_kind text not null default 'phone' check (cover_kind in ('phone', 'square', 'landscape')),
    cover_images jsonb not null default '[]',  -- [{src, alt, width, height}]
    content_html text not null default '',     -- detay penceresi içeriği
    repo_url text,
    live_url text,
    live_label text,
    sort_order integer not null default 100,
    published boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger projects_touch before update on public.projects
    for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;
create policy "Yayındaki projeler herkese açık" on public.projects
    for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Yönetici projeleri ekler" on public.projects
    for insert to authenticated with check ((select public.is_admin()));
create policy "Yönetici projeleri günceller" on public.projects
    for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici projeleri siler" on public.projects
    for delete to authenticated using ((select public.is_admin()));

-- ===== Blog yazıları ve raporlar =====
create table public.posts (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    title text not null,
    excerpt text,
    kind text not null default 'yazi' check (kind in ('yazi', 'rapor', 'not')),
    tags text[] not null default '{}',
    cover_url text,
    body text not null default '',
    body_format text not null default 'markdown' check (body_format in ('markdown', 'html')),
    file_url text,     -- ekli dosya (PDF, DOCX, ...)
    file_name text,
    file_type text,
    file_size bigint,
    reading_minutes integer,
    status text not null default 'draft' check (status in ('draft', 'published')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (published_at desc) where status = 'published';

create trigger posts_touch before update on public.posts
    for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;
create policy "Yayındaki yazılar herkese açık" on public.posts
    for select to anon, authenticated using (status = 'published' or (select public.is_admin()));
create policy "Yönetici yazı ekler" on public.posts
    for insert to authenticated with check ((select public.is_admin()));
create policy "Yönetici yazı günceller" on public.posts
    for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici yazı siler" on public.posts
    for delete to authenticated using ((select public.is_admin()));

-- ===== Haber ağı =====
create table public.interests (
    id bigint generated always as identity primary key,
    name text not null unique,
    keywords text[] not null default '{}',
    weight integer not null default 5 check (weight between 0 and 10),
    enabled boolean not null default true,
    created_at timestamptz not null default now()
);

create table public.news_sources (
    id bigint generated always as identity primary key,
    name text not null,
    url text not null unique,
    kind text not null default 'haber' check (kind in ('haber', 'ilan', 'firsat')),
    lang text not null default 'en',
    weight integer not null default 0 check (weight between -5 and 5),
    enabled boolean not null default true,
    last_fetched_at timestamptz,
    last_status text,
    last_count integer,
    created_at timestamptz not null default now()
);

create table public.news_items (
    id bigint generated always as identity primary key,
    source_id bigint references public.news_sources (id) on delete cascade,
    kind text not null default 'haber' check (kind in ('haber', 'ilan', 'firsat')),
    url text not null unique,
    title text not null,
    summary text,
    image_url text,
    published_at timestamptz,
    fetched_at timestamptz not null default now(),
    relevance numeric not null default 0,
    matched text[] not null default '{}',     -- eşleşen ilgi alanları
    status text not null default 'new' check (status in ('new', 'read', 'saved', 'dismissed')),
    notified_at timestamptz                   -- mobil bildirim gönderildiyse (ileride)
);

create index news_items_source_idx on public.news_items (source_id);
create index news_items_time_idx on public.news_items (coalesce(published_at, fetched_at) desc);
create index news_items_status_idx on public.news_items (status);

alter table public.interests enable row level security;
alter table public.news_sources enable row level security;
alter table public.news_items enable row level security;

create policy "Yönetici ilgi alanlarını yönetir" on public.interests
    for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici kaynakları yönetir" on public.news_sources
    for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici haberleri yönetir" on public.news_items
    for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Metni ilgi alanlarına göre puanlar: başlıktaki eşleşme 3, özetteki 1 puan;
-- her ilgi alanı en fazla 9 puan katkı verir ve ağırlığıyla çarpılır.
create or replace function public.score_text(p_title text, p_summary text, out relevance numeric, out matched text[])
language plpgsql
stable
set search_path = ''
as $$
declare
    r record;
    kw text;
    pat text;
    hits integer;
    t text := lower(coalesce(p_title, ''));
    s text := lower(coalesce(p_summary, ''));
begin
    relevance := 0;
    matched := '{}';
    for r in select i.name, i.keywords, i.weight from public.interests i where i.enabled and i.weight > 0 loop
        hits := 0;
        foreach kw in array r.keywords loop
            kw := lower(btrim(kw));
            continue when kw = '';
            pat := case when kw ~ '^\w' then '\m' else '' end
                || regexp_replace(kw, '([.^$*+?()\[\]{}|\\-])', '\\\1', 'g')
                || case when kw ~ '\w$' then '\M' else '' end;
            if t ~ pat then hits := hits + 3; end if;
            if s ~ pat then hits := hits + 1; end if;
        end loop;
        if hits > 0 then
            relevance := relevance + least(hits, 9) * r.weight;
            matched := matched || r.name;
        end if;
    end loop;
end;
$$;

create or replace function public.news_items_score()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    select sc.relevance, sc.matched into new.relevance, new.matched
    from public.score_text(new.title, new.summary) sc;
    return new;
end;
$$;

create trigger news_items_score before insert or update of title, summary on public.news_items
    for each row execute function public.news_items_score();

-- İlgi alanları değişince tüm haberleri yeniden puanlar (panel çağırır)
create or replace function public.rescore_news()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    n integer;
begin
    if not public.is_admin() then
        raise exception 'yetkisiz';
    end if;
    update public.news_items ni
    set (relevance, matched) = (select sc.relevance, sc.matched from public.score_text(ni.title, ni.summary) sc)
    where true;
    get diagnostics n = row_count;
    return n;
end;
$$;

revoke execute on function public.rescore_news() from public, anon;
grant execute on function public.rescore_news() to authenticated;

-- Sıralı akış: ilgi puanı + kaynak ağırlığı, zamanla azalır.
-- Haberler ~3 günde, ilan ve fırsatlar ~10 günde e-katına düşer.
create or replace view public.news_feed
with (security_invoker = true)
as
select
    n.*,
    s.name as source_name,
    round((
        (n.relevance + coalesce(s.weight, 0) * 2 + case when n.kind = 'haber' then 0 else 4 end)
        * exp(-extract(epoch from (now() - coalesce(n.published_at, n.fetched_at)))
              / (86400.0 * case when n.kind = 'haber' then 3 else 10 end))
    )::numeric, 2) as rank
from public.news_items n
left join public.news_sources s on s.id = n.source_id;

-- Zamanlanmış görevin kimliğini doğrulamak için gizli değer (Vault'ta saklanır)
create or replace function public.check_cron_secret(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from vault.decrypted_secrets
        where name = 'news_cron_secret' and decrypted_secret = p_secret
    );
$$;

revoke execute on function public.check_cron_secret(text) from public, anon, authenticated;
grant execute on function public.check_cron_secret(text) to service_role;

-- ===== Dosya depoları =====
insert into storage.buckets (id, name, public, file_size_limit)
values
    ('media', 'media', true, 10485760),        -- proje ve kapak görselleri (10 MB)
    ('blog-files', 'blog-files', true, 26214400) -- blog ekleri: PDF, DOCX... (25 MB)
on conflict (id) do nothing;

create policy "Yönetici dosyaları listeler" on storage.objects
    for select to authenticated using (bucket_id in ('media', 'blog-files') and (select public.is_admin()));
create policy "Yönetici dosya yükler" on storage.objects
    for insert to authenticated with check (bucket_id in ('media', 'blog-files') and (select public.is_admin()));
create policy "Yönetici dosya günceller" on storage.objects
    for update to authenticated using (bucket_id in ('media', 'blog-files') and (select public.is_admin()));
create policy "Yönetici dosya siler" on storage.objects
    for delete to authenticated using (bucket_id in ('media', 'blog-files') and (select public.is_admin()));
