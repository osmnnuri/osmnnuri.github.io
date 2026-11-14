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

## Panel asistanı

- Paneldeki sesli asistan bilinen komutları tarayıcıda çözer (`admin/assistant.js`); tanımadığı cümleleri `assistant` edge function'ına yollar.
- Fonksiyon yalnızca yönetici oturumuyla çalışır, `send-push` ile aynı `GEMINI_API_KEY` anahtarını ve model sırasını kullanır, veritabanına yazmaz. Yanıtı söylenecek metin ve panelin uygulayacağı izinli eylemlerdir; silme ve yayınlama eylemi yoktur.
- Yayına almak için: `supabase functions deploy assistant`. Deploy edilmeden önce asistan yalnızca sabit komutları anlar.
- Asistanın adı, sesi ve arayüz rengi panelin sağ üstündeki ayarlardan değişir ve cihazda (`localStorage`) saklanır.

## Mobil bildirimler (Web Push)

- Panelin **Bildirimler** sekmesinden her cihaz ayrı ayrı abone olur (`push_subscriptions`). iPhone'da önce Safari → Paylaş → Ana Ekrana Ekle gerekir (iOS 16.4+).
- `send-push` edge function'ı her saatin 12. dakikasında `pg_cron` ile çalışır:
  - **Anında:** son 3 saatte gelen, `status = 'new'`, puanı eşiği aşan ve henüz bildirilmemiş öğeler. Saatlik sınırı aşan kısım tek bir "N öğe daha" bildiriminde toplanır, öğeler `notified_at` ile işaretlenir.
  - **Günlük rapor:** ayarlanan saatte (Türkiye saati) son 24 saatin haberleri Gemini ile özetlenir, `news_reports` tablosuna yazılır ve bildirilir; günde bir kez. Asıl model (`GEMINI_MODEL`, varsayılan `gemini-3.8-flash`) yanıt vermezse (zaman aşımı, 503) sırayla `gemini-3.6-flash` ve `gemini-3.5-flash-lite` denenir; hiçbiri yazamazsa sonraki 3 saatlik çalıştırmada yeniden denenir, son denemede de olmazsa en yüksek puanlı öğelerin başlık listesi gönderilir.
- Ayarlar `notification_settings` tablosunda (tek satır); geçmiş `notification_log` tablosunda.
- VAPID anahtar çifti fonksiyon ilk çalıştığında üretilip yalnızca Vault'a yazıldı (`vapid_public_key`, `vapid_private_key`). Push servisi 404/410 döndüren abonelikler kendiliğinden silinir.
