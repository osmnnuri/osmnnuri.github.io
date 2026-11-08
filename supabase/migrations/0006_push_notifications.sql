-- Mobil bildirimler (Web Push)
-- VAPID anahtar çifti send-push fonksiyonu ilk çalıştığında üretilip Vault'a yazılır
-- ('vapid_public_key', 'vapid_private_key'); özel anahtar hiçbir yerde düz metin olarak tutulmaz.

create table public.push_subscriptions (
    id bigint generated always as identity primary key,
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    device text,
    created_at timestamptz not null default now(),
    last_success_at timestamptz,
    failure_count integer not null default 0
);

create table public.notification_settings (
    id integer primary key default 1 check (id = 1),
    enabled boolean not null default true,
    instant_enabled boolean not null default true,
    instant_threshold integer not null default 60 check (instant_threshold between 0 and 500),
    instant_kinds text[] not null default '{haber,ilan,firsat}',
    max_per_hour integer not null default 3 check (max_per_hour between 1 and 20),
    digest_enabled boolean not null default true,
    digest_hour integer not null default 9 check (digest_hour between 0 and 23),  -- Türkiye saati
    digest_count integer not null default 5 check (digest_count between 1 and 10),
    updated_at timestamptz not null default now()
);

insert into public.notification_settings (id) values (1);

create trigger notification_settings_touch before update on public.notification_settings
    for each row execute function public.touch_updated_at();

create table public.notification_log (
    id bigint generated always as identity primary key,
    kind text not null check (kind in ('instant', 'digest', 'test')),
    title text not null,
    body text,
    url text,
    item_ids bigint[] not null default '{}',
    sent integer not null default 0,
    failed integer not null default 0,
    created_at timestamptz not null default now()
);

create index notification_log_kind_time_idx on public.notification_log (kind, created_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_log enable row level security;

create policy "Yönetici abonelikleri yönetir" on public.push_subscriptions
    for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici bildirim ayarlarını okur" on public.notification_settings
    for select to authenticated using ((select public.is_admin()));
create policy "Yönetici bildirim ayarlarını günceller" on public.notification_settings
    for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Yönetici bildirim kaydını okur" on public.notification_log
    for select to authenticated using ((select public.is_admin()));

revoke all on public.push_subscriptions, public.notification_settings, public.notification_log from anon;

-- Edge function VAPID anahtarlarını yalnızca service_role ile okur
create or replace function public.get_vapid_keys(out public_key text, out private_key text)
language sql
stable
security definer
set search_path = ''
as $$
    select
        (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_public_key'),
        (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_private_key');
$$;

revoke execute on function public.get_vapid_keys() from public, anon, authenticated;
grant execute on function public.get_vapid_keys() to service_role;

-- Anahtar çifti yoksa fonksiyonun ürettiği çifti kaydeder; varsa dokunmaz
create or replace function public.store_vapid_keys(p_public text, p_private text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    perform pg_advisory_xact_lock(hashtext('vapid_keys'));
    if not exists (select 1 from vault.secrets where name = 'vapid_private_key') then
        perform vault.create_secret(p_private, 'vapid_private_key', 'Web Push VAPID özel anahtarı');
        perform vault.create_secret(p_public, 'vapid_public_key', 'Web Push VAPID açık anahtarı');
    end if;
end;
$$;

revoke execute on function public.store_vapid_keys(text, text) from public, anon, authenticated;
grant execute on function public.store_vapid_keys(text, text) to service_role;

-- Panel abonelik oluştururken açık anahtarı buradan alır
create or replace function public.get_vapid_public_key()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select case when public.is_admin()
        then (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_public_key')
    end;
$$;

revoke execute on function public.get_vapid_public_key() from public, anon;
grant execute on function public.get_vapid_public_key() to authenticated;

-- Zamanlanmış bildirim kontrolü: haber çekiminden 5 dk sonra (anlık + günlük özet)
create or replace function public.trigger_send_push()
returns bigint
language sql
security definer
set search_path = ''
as $$
    select net.http_post(
        url := 'https://bwwdthjkhnjmxoifwoiz.supabase.co/functions/v1/send-push',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'news_cron_secret')
        ),
        body := '{"mode":"auto"}'::jsonb,
        timeout_milliseconds := 60000
    );
$$;

revoke execute on function public.trigger_send_push() from public, anon, authenticated;

select cron.schedule('send-push-hourly', '12 * * * *', 'select public.trigger_send_push()');
