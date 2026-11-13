-- Günlük rapor Gemini'den 30-100 sn'de dönüyor; 60 sn'lik istek zaman aşımı raporun yazılmasını yarıda kesebiliyordu.
-- send-push çağrısının süresi fonksiyonun kendi sınırına (150 sn) yaklaştırıldı.
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
        timeout_milliseconds := 140000
    );
$$;

revoke execute on function public.trigger_send_push() from public, anon, authenticated;
