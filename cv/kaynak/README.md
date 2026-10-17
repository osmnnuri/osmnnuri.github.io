# Özgeçmiş kaynakları

`cv/` klasöründeki PDF'ler bu klasördeki HTML dosyalarından üretilir.

- `Osman-Nuri-Yasar-Ozgecmis-TR.html` → `../Osman-Nuri-Yasar-Ozgecmis-TR.pdf`
- `Osman-Nuri-Yasar-CV-EN.html` → `../Osman-Nuri-Yasar-CV-EN.pdf`
- `cv.css` → ortak stil (A4, IBM Plex Sans + Source Serif 4)

## PDF'i yeniden üretmek

İçeriği HTML'de düzenle, sonra Chrome ile A4 olarak yazdır:

1. HTML dosyasını Chrome'da aç.
2. `Ctrl + P` → Hedef: **PDF olarak kaydet**, Kağıt: **A4**, Kenar boşlukları: **Varsayılan**.
3. "Diğer ayarlar"da **Arka plan grafikleri** açık, **Üstbilgi ve altbilgi** kapalı olsun.
4. Aynı adla `cv/` klasörüne kaydet.

Yayındaki PDF'ler Chrome'un başsız (headless) yazdırmasıyla üretildi; sayfa üstündeki
küçük başlık ve sağ alttaki sayfa numarası bu sırada eklendi. Elle yazdırırken
Chrome'un kendi üstbilgi/altbilgisini kapalı tutman yeterli.
