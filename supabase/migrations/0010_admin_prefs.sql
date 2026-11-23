-- Panel tercihleri: tek yönetici, tek merkez
-- Sorun: kokpit düzeni (sayfa sırası, konsol daraltma), Nova ayarları (ad, renk, konuşma, efektler), Nova konuşma kaydı
-- ve okunan raporlar yalnızca cihazdaki localStorage'daydı; telefon ve bilgisayar birbirinden habersizdi.
-- Çözüm: tek satırlık bir jsonb kaydı. Her bölüm ayrı bir anahtardır (hud, cockpit, novaLog, reportsRead);
-- set_admin_pref yalnızca verilen anahtarı değiştirir, böylece iki cihaz farklı bölümleri yazarken birbirini ezmez.
-- Cihaza özgü olanlar (seçilen ses, "Hey Nova" uyandırma kelimesi) bilerek cihazda kalır.

create table public.admin_prefs (
    id smallint primary key default 1 check (id = 1),
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

insert into public.admin_prefs (id) values (1);

alter table public.admin_prefs enable row level security;

create policy "Yönetici tercihlerini okur" on public.admin_prefs
    for select to authenticated using ((select public.is_admin()));

revoke all on public.admin_prefs from anon;
revoke insert, update, delete on public.admin_prefs from authenticated; -- yazma yalnızca set_admin_pref ile

create or replace function public.set_admin_pref(p_key text, p_value jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_at timestamptz;
begin
    if not public.is_admin() then
        raise exception 'yetki yok' using errcode = '42501';
    end if;
    if p_key !~ '^[a-zA-Z][a-zA-Z0-9]{0,31}$' then
        raise exception 'geçersiz anahtar';
    end if;
    if pg_column_size(p_value) > 65536 then
        raise exception 'değer çok büyük';
    end if;
    update public.admin_prefs
       set data = data || jsonb_build_object(p_key, p_value), updated_at = now()
     where id = 1
    returning updated_at into v_at;
    return v_at;
end;
$$;

revoke execute on function public.set_admin_pref(text, jsonb) from public, anon;
grant execute on function public.set_admin_pref(text, jsonb) to authenticated;
