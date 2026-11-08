# Portfolyo arka ucu (Supabase)

Proje: `bwwdthjkhnjmxoifwoiz` ("osmnnuri's Project"). Site statik kalır (GitHub Pages); içerik Supabase'den okunur.

| Parça | Nerede |
|---|---|
| Yönetim paneli | `admin/` → `/admin/` adresinde, giriş gerekli |
| Blog | `blog/index.html` (liste), `blog/yazi.html?s=<slug>` (yazı) |
| Ana sayfa | `javascript/index.js` projeleri ve son 3 yazıyı veritabanından çizer; ulaşılamazsa statik kartlar kalır |
| Haber çekici | `supabase/functions/fetch-news` (Edge Function), her saatin 7. dakikasında `pg_cron` ile çalışır |
| Şema | `supabase/migrations/` (sırayla uygulandı) |

## Tablolar

- `projects`: portfolyo projeleri (kart + detay içeriği). Herkes yayındakileri okur, yalnız yönetici yazar.
- `posts`: blog yazıları/raporları. Markdown veya HTML gövde, isteğe bağlı ek dosya (`blog-files` deposu).
- `interests`: ilgi alanları, anahtar kelimeler ve ağırlıklar.
- `news_sources`: RSS/Atom kaynakları (tür: haber / ilan / fırsat).
- `news_items`: çekilen öğeler. `relevance` eklenirken tetikleyiciyle hesaplanır; `news_feed` görünümü zamanla azalan `rank` ekler.
- `admins`: yönetici e-postaları. `is_admin()` yalnız e-postası doğrulanmış bu hesaplar için `true` döner.

## Puanlama

Her ilgi alanı için: başlıkta geçen anahtar kelime 3, özette geçen 1 puan (ilgi alanı başına en fazla 9) × ağırlık.
Sıralama puanı: `(ilgi + kaynak ağırlığı × 2 + ilan/fırsat bonusu 4) × e^(−yaş / τ)`; τ haberlerde 3 gün, ilan ve fırsatlarda 10 gün.

## İlk kurulum (bir kez)

1. Supabase panelinde **Authentication → Users → Add user → Create new user**: e-posta `osmannuriyasar57@gmail.com`, güçlü bir şifre, **Auto Confirm User** işaretli.
2. **Authentication → Sign In / Providers**: "Allow new users to sign up" kapatılmalı (panelde kayıt yok; yetki zaten `admins` tablosuna bağlı).
3. **Authentication → URL Configuration**: Site URL `https://osmnnuri.github.io/admin/` (şifre sıfırlama bağlantıları buraya döner).

## Mobil bildirimler (sonraki adım)

`news_items.notified_at` alanı hazır. Plan: yüksek puanlı yeni öğeler için `fetch-news` sonunda bildirim gönderip `notified_at` işaretlemek; kanal (Web Push / ntfy / Telegram) seçilince bağlanacak.
