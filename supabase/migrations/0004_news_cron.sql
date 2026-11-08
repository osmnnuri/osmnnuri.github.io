-- Saatlik haber çekme görevi: Vault'taki anahtarla fetch-news fonksiyonunu çağırır
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'news_cron_secret', 'fetch-news edge function için zamanlanmış görev anahtarı');

create or replace function public.trigger_fetch_news()
returns bigint
language sql
security definer
set search_path = ''
as $$
    select net.http_post(
        url := 'https://bwwdthjkhnjmxoifwoiz.supabase.co/functions/v1/fetch-news',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'news_cron_secret')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 120000
    );
$$;

revoke execute on function public.trigger_fetch_news() from public, anon, authenticated;

select cron.schedule('fetch-news-hourly', '7 * * * *', 'select public.trigger_fetch_news()');
