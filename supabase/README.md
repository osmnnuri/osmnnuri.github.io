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

## Mobil bildirimler (Web Push)

- Panelin **Bildirimler** sekmesinden her cihaz ayrı ayrı abone olur (`push_subscriptions`). iPhone'da önce Safari → Paylaş → Ana Ekrana Ekle gerekir (iOS 16.4+).
- `send-push` edge function'ı her saatin 12. dakikasında `pg_cron` ile çalışır:
  - **Anında:** son 3 saatte gelen, `status = 'new'`, puanı eşiği aşan ve henüz bildirilmemiş öğeler. Saatlik sınırı aşan kısım tek bir "N öğe daha" bildiriminde toplanır, öğeler `notified_at` ile işaretlenir.
  - **Günlük özet:** ayarlanan saatte (Türkiye saati) son 24 saatin en yüksek puanlı öğeleri, günde bir kez.
- Ayarlar `notification_settings` tablosunda (tek satır); geçmiş `notification_log` tablosunda.
- VAPID anahtar çifti fonksiyon ilk çalıştığında üretilip yalnızca Vault'a yazıldı (`vapid_public_key`, `vapid_private_key`). Push servisi 404/410 döndüren abonelikler kendiliğinden silinir.
