-- Günlük haber raporu
-- send-push fonksiyonu günde bir kez son 24 saatin haberlerini yapay zekayla (Gemini) özetler,
-- raporu burada saklar ve bildirim olarak gönderir. Panel raporu Haber Ağı'nın üstünde gösterir.

create table public.news_reports (
    id bigint generated always as identity primary key,
    report_date date not null unique,          -- Türkiye saatine göre gün
    title text not null,
    summary text not null,                     -- bildirimde görünen kısa özet
    body_md text not null,                     -- raporun tamamı (Markdown)
    item_ids bigint[] not null default '{}',   -- rapora giren haberler
    model text,
    created_at timestamptz not null default now()
);

alter table public.news_reports enable row level security;

create policy "Yönetici raporları okur" on public.news_reports
    for select to authenticated using ((select public.is_admin()));
create policy "Yönetici raporları siler" on public.news_reports
    for delete to authenticated using ((select public.is_admin()));

revoke all on public.news_reports from anon;

-- Haberler artık tek tek bildirilmez, günlük raporda toplanır.
-- İş, staj ve freelance ilanları ile fırsatlar anında bildirilmeye devam eder.
alter table public.notification_settings alter column instant_kinds set default '{ilan,firsat}';
update public.notification_settings set instant_kinds = array_remove(instant_kinds, 'haber') where id = 1;
