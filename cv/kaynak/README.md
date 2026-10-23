# Özgeçmiş kaynakları

`cv/` klasöründeki PDF'ler bu klasördeki HTML dosyalarından üretilir.

- `Osman-Nuri-Yasar-Ozgecmis-TR.html` → `../Osman-Nuri-Yasar-Ozgecmis-TR.pdf`
- `Osman-Nuri-Yasar-CV-EN.html` → `../Osman-Nuri-Yasar-CV-EN.pdf`
- `cv.css` → ortak stil (A4, IBM Plex Sans + Source Serif 4)
- `pdf.mjs` → iki PDF'i başsız Chrome ile üretir

## PDF'i yeniden üretmek

İçeriği HTML'de düzenle, sonra depo kökünde:

```
node cv/kaynak/pdf.mjs
```

Bu, sitedeki **telefonsuz** PDF'leri `cv/` klasörüne yazar (üstte küçük başlık, sağ altta
sayfa numarası). Telefon numarası depoda hiçbir dosyada tutulmaz; HTML'deki
`<span data-telefon>` boş kalır.

## Başvuru sürümü (telefonlu)

Başvurularda kullanılacak telefonlu PDF'leri depo **dışındaki** bir klasöre üret:

```
node cv/kaynak/pdf.mjs "C:/Users/LENOVO/Documents/CV" "+90 5xx xxx xx xx"
```

Betik telefonlu çıktıyı `cv/` klasörüne yazmayı reddeder. Bu dosyaları depoya ekleme.
