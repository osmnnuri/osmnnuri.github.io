insert into public.projects (id, title, modal_title, year, type_label, category, featured, summary, highlights, tags, cover_kind, cover_images, content_html, repo_url, live_url, live_label, sort_order) values
('FinansDefteri', 'Finans Defteri', 'Finans Defteri Mobil Uygulaması', '2026', 'Mobil Uygulama', 'app', true, 'Kayıt tutmayı zahmetsiz hale getiren kişisel finans uygulaması.', array['Sesle, ekran görüntüsüyle veya elle işlem ekleme', 'Aylık rapor, PDF çıktısı, bütçe ve hatırlatıcılar', 'Çevrimdışı çalışma ve PIN kilidi']::text[], array['Flutter', 'Dart', 'Firebase', 'Firestore', 'PWA']::text[], 'phone', '[{"src":"görseller/finansDefteri/04-ana-ekran.webp","alt":"Finans Defteri ana ekran","width":1080,"height":2400},{"src":"görseller/finansDefteri/13-koyu-ana-ekran.webp","alt":"Finans Defteri koyu tema","width":1080,"height":2400}]'::jsonb, '<p>
    <strong>Finans Defteri</strong>; kişisel gelir-gider takibini, sesle, ekran görüntüsüyle ya da elle kaydı,
    bütçe, rapor ve dövizi tek arayüzde bir araya getiren bir mobil uygulama çalışmasıdır.
</p>

<div class="image-row">
    <img src="görseller/finansDefteri/04-ana-ekran.webp" alt="Finans Defteri Ana Sayfa">
    <img src="görseller/finansDefteri/13-koyu-ana-ekran.webp" alt="Finans Defteri Ana Sayfa (Karanlık Tema)">
</div>

<h3>Problem</h3>
<p>
    Harcama takip uygulamalarının çoğu her işlemi elle girmeyi gerektiriyor; sonuç olarak kullanıcı kayıt tutmayı bırakıyor.
    Bu projede amacım kayıt girmeyi olabildiğince zahmetsiz hale getirmek ve ay sonunda paranın nereye gittiğini
    tek bakışta görebilmeyi sağlamaktı.
</p>

<h3>Ürettiğim Çözüm: Finans Defteri Ne Yapıyor?</h3>
<p>Finans Defteri''nde bir işlem üç yoldan eklenebiliyor:</p>
<ul class="feature-list">
    <li><strong>Sesle:</strong> "Markete 150 lira harcadım" demek yeterli; tutar, kategori ve tarih cümleden çıkarılıyor ve kullanıcı onayıyla kaydediliyor.</li>
    <li><strong>Ekran görüntüsüyle:</strong> Banka uygulamasındaki "İşlem Geçmişi / Hesap Hareketleri" ekran görüntüsü uygulamaya yükleniyor; işlemler cihaz üzerinde okunup gelir/gider olarak listeleniyor ve kullanıcı onayıyla kaydediliyor.</li>
    <li><strong>Elle:</strong> Tutar, kategori ve tarih bilgilerini kullanıcı kendisi girer ve kayıt manuel olarak eklenir.</li>
</ul>

<div class="image-row">
    <img src="görseller/finansDefteri/10-islemler.webp" alt="Finans Defteri İşlemler">
    <img src="görseller/finansDefteri/11-gider-ekle.webp" alt="Finans Defteri Gider Ekle">
    <img src="görseller/finansDefteri/03-tanitim.webp" alt="Finans Defteri Tanıtım">
</div>

<h3>Öne Çıkan Özellikler</h3>

<p><strong>Aylık rapor ve PDF:</strong> Gelir, gider, net birikim, tasarruf oranı ve kategori bazlı gider dağılımı. Rapor tek dokunuşla PDF olarak kaydediliyor.</p>
<div class="image-row">
    <img src="görseller/finansDefteri/05-rapor.webp" alt="Finans Defteri Rapor Ekranı">
    <img src="görseller/finansDefteri/06-rapor-kategoriler.webp" alt="Finans Defteri Kategori Ekranı">
</div>

<p><strong>Bütçe ve hatırlatıcılar:</strong> Kategori bazlı aylık limitler, limite yaklaşınca uyarı; kira, fatura gibi tekrarlayan ödemeler için takvimli hatırlatıcılar.</p>
<div class="image-row">
    <img src="görseller/finansDefteri/07-butce.webp" alt="Finans Defteri Bütçe Ekranı">
    <img src="görseller/finansDefteri/08-hatirlaticilar.webp" alt="Finans Defteri Hatırlatıcı Ekranı">
</div>

<p><strong>Döviz ve altın:</strong> Türkiye Cumhuriyet Merkez Bankası (TCMB) kurları, gram altın ve gümüş fiyatları, kur çeviricisi.</p>
<img src="görseller/finansDefteri/09-doviz.webp" alt="Finans Defteri Döviz Ekranı">

<p><strong>Çevrimdışı çalışma:</strong> İnternet yokken girilen kayıtlar cihazda bekliyor, bağlantı gelince kendiliğinden eşitleniyor.</p>

<p><strong>Güvenlik:</strong> E-posta doğrulamalı hesap, cihazda PIN kilidi, her kullanıcının yalnızca kendi verisine erişebildiği sunucu kuralları.</p>
<div class="image-row">
    <img src="görseller/finansDefteri/01-giris.webp" alt="Finans Defteri Giriş Ekranı">
    <img src="görseller/finansDefteri/02-pin.webp" alt="Finans Defteri PIN Ekranı">
</div>

<p><strong>Kişiselleştirme:</strong> Açık/koyu tema, Türkçe/İngilizce ve ayarlanabilir yazı boyutu.</p>
<div class="image-row">
    <img src="görseller/finansDefteri/12-ayarlar.webp" alt="Finans Defteri Ayarlar Ekranı">
    <img src="görseller/finansDefteri/14-koyu-rapor.webp" alt="Finans Defteri Koyu Rapor Ekranı">
</div>

<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Flutter Dart</li>
    <li>Visual Studio Code</li>
    <li>Firebase</li>
    <li>AI</li>
    <li>Firestore</li>
    <li>PWA</li>
    <li>REST API</li>
</ul>', 'https://github.com/osmnnuri/FinansDefteri-Showcase', 'https://financeapp-997b3.web.app/?demo=1', 'Canlı demoyu dene', 10),
('DersAsistanim', 'DersAsistanım', 'DersAsistanım: Maskotlu Ders Çalışma Asistanı', '2026', 'Mobil Uygulama · PWA', 'app', true, 'İlkokul, ortaokul (LGS) ve lise (YKS) öğrencileri için maskotlu ders çalışma asistanı; öğretmeni ve veliyi aynı uygulamada buluşturur.', array['Okul ve koçluk programına göre akıllı haftalık plan', 'Lisede YKS sayacı, puan hesaplayıcı, deneme ve konu takibi', 'Öğretmen ve veli hesapları, bulut eşitleme, KVKK uyumu']::text[], array['Flutter', 'Dart', 'PWA', 'Supabase', 'PostgreSQL']::text[], 'phone', '[{"src":"görseller/dersAsistanim/01-ana-sayfa.webp","alt":"DersAsistanım ana sayfa ve maskot asistan","width":1080,"height":2400},{"src":"görseller/dersAsistanim/12-yks-puan.webp","alt":"DersAsistanım YKS puan hesaplayıcı","width":1080,"height":2400},{"src":"görseller/dersAsistanim/15-ogretmen-paneli.webp","alt":"DersAsistanım öğretmen paneli","width":1080,"height":2400}]'::jsonb, '<p>
    <strong>DersAsistanım</strong>; ilkokul, ortaokul (LGS) ve lise (YKS) öğrencilerinin ders çalışmayı planlamasına,
    takip etmesine ve sürdürmesine yardım eden, maskotlu bir asistanı olan web uygulamasıdır (PWA). Telefonda
    "Ana ekrana ekle" ile uygulama gibi kurulur ve internetsiz çalışır. Öğrenci hesabının yanında öğretmen ve veli
    hesapları da var; veri önce cihazda tutulur, hesapla buluta eşitlenir.
</p>

<div class="image-row">
    <img src="görseller/dersAsistanim/01-ana-sayfa.webp" alt="DersAsistanım ana sayfa ve maskot asistan">
    <img src="görseller/dersAsistanim/02-ogretmenden.webp" alt="DersAsistanım öğretmenden duyuru, ödev ve günün özeti">
</div>

<h3>Problem</h3>
<p>
    Öğrenciler için ders çalışmanın en zor kısmı çoğu zaman başlamak ve devam ettirmek. Planlama uygulamaları
    öğrenciden her şeyi kendisinin kurmasını bekliyor; bir süre sonra uygulama bırakılıyor. Öğretmen ve veli ise
    öğrencinin evde ne kadar çalıştığını göremiyor. Amacım baskı kurmadan küçük adımlarla çalışmaya yönlendiren,
    planı öğrencinin yerine hazırlayan ve öğretmenle veliyi aynı tabloya baktıran bir asistan yapmaktı.
</p>

<h3>Ürettiğim Çözüm</h3>
<ul class="feature-list">
    <li><strong>Maskot asistan:</strong> Günün durumuna (süren oturum, saat, ruh hali, bekleyen yanlışlar, plan) bakıp ne yapılacağını öneren kural tabanlı bir asistan. Hızlı mesajlar ve Türkçe serbest yazıyla konuşulabiliyor; 8 maskot arasından seçiliyor.</li>
    <li><strong>Akıllı program:</strong> Öğrenci okul ve koçluk ders programını tablo olarak girer; uygulama o gün işlenen derslerin tekrarını, ertesi günün derslerine hazırlığı ve hafta sonu soru çözümünü haftaya kendisi yerleştirir.</li>
    <li><strong>Üç hesap türü:</strong> Öğrenci kendisi kaydolur; öğretmen hesabını okul yöneticisi yönetim panelinden açar; veli kendisi kaydolup çocuğunun 6 haneli koduyla bağlanır.</li>
    <li><strong>Önce çevrimdışı, sonra bulut:</strong> Uygulama internetsiz çalışır; bağlantı gelince veri Supabase''e (PostgreSQL, satır düzeyi güvenlik) eşitlenir.</li>
</ul>

<div class="image-row">
    <img src="görseller/dersAsistanim/04-akilli-program.webp" alt="DersAsistanım akıllı program ve derslerim">
    <img src="görseller/dersAsistanim/05-ders-programi.webp" alt="DersAsistanım okul ders programı tablosu">
    <img src="görseller/dersAsistanim/03-haftalik-plan.webp" alt="DersAsistanım haftalık plan">
</div>

<h3>Öne Çıkan Özellikler</h3>

<p><strong>Kronometre, yanlış defteri ve gelişim:</strong> Hedef süreli çalışma oturumları; fotoğraflı yanlış sorular için 2 → 3 → 7 → 14 günlük aralıklı tekrar; haftalık süre, ders bazında dağılım ve 6 haftalık doğruluk grafikleri.</p>
<div class="image-row">
    <img src="görseller/dersAsistanim/06-kronometre.webp" alt="DersAsistanım kronometre">
    <img src="görseller/dersAsistanim/07-yanlis-defteri.webp" alt="DersAsistanım yanlış defteri">
    <img src="görseller/dersAsistanim/08-gelisim.webp" alt="DersAsistanım gelişim grafikleri">
</div>

<p><strong>Lise ve YKS:</strong> Lise öğrencisinde arayüz değişir: YKS geri sayımı, TYT/AYT puan hesaplayıcı (alan seçimi ve OBP katkısıyla), deneme sınavı kaydı ve net gelişimi grafiği, ders ders TYT/AYT konu takibi.</p>
<div class="image-row">
    <img src="görseller/dersAsistanim/11-yks-sayaci.webp" alt="DersAsistanım YKS geri sayımı">
    <img src="görseller/dersAsistanim/12-yks-puan.webp" alt="DersAsistanım YKS puan hesaplayıcı">
</div>
<div class="image-row">
    <img src="görseller/dersAsistanim/13-denemeler.webp" alt="DersAsistanım denemelerim ve net gelişimi">
    <img src="görseller/dersAsistanim/14-konu-takibi.webp" alt="DersAsistanım konu takibi">
</div>

<p><strong>Öğretmen ve veli:</strong> Öğretmen, koduyla bağlanan öğrencilerinin çalışmasını görür, ödev verir ve duyuru yapar. Veli, çocuğunun çalışmalarını, planını, yanlış defterini, ders programlarını ve ödevlerini salt okunur raporda izler. Bir öğrencinin aynı anda bir öğretmeni ve birden çok velisi olabilir.</p>
<div class="image-row">
    <img src="görseller/dersAsistanim/15-ogretmen-paneli.webp" alt="DersAsistanım öğretmen paneli">
    <img src="görseller/dersAsistanim/16-veli-raporu.webp" alt="DersAsistanım öğrenci raporu">
</div>

<p><strong>Kişiselleştirme:</strong> 8 maskot ve ikisi koyu olmak üzere 10 renk teması; maskotun kendi sesiyle gönderdiği, uzun süre girilmeyince "Neredesin?" diye soran nazik hatırlatmalar.</p>
<div class="image-row">
    <img src="görseller/dersAsistanim/09-maskot-tema.webp" alt="DersAsistanım maskot ve tema seçimi">
    <img src="görseller/dersAsistanim/10-koyu-tema.webp" alt="DersAsistanım koyu tema">
</div>

<p><strong>Gizlilik ve güvenlik:</strong> Çocuk verisi işlendiği için KVKK aydınlatma metni, kayıtta zorunlu onay ve "Hesabımı ve verilerimi sil" akışı var. Kendine zarar verme ifadelerini algılayıp ders önerisini durduran bir güvenlik kuralı ve arka planda inip "Güncelle" denince devreye giren güvenli güncelleme de bulunuyor.</p>

<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Flutter Dart</li>
    <li>PWA</li>
    <li>Service Worker</li>
    <li>Supabase (PostgreSQL, RLS)</li>
    <li>IndexedDB (Sembast)</li>
    <li>fl_chart</li>
    <li>Vercel</li>
    <li>454 otomatik test</li>
</ul>', 'https://github.com/osmnnuri/dersasistanim-showcase', 'https://dersasistanim.vercel.app', 'Uygulamayı aç', 20),
('AetherWorld', 'Aether World Card Wars', 'Aether World Card Wars (v2.0)', '2026', 'Mobil Oyun', 'game', true, 'Desteni kurup ekipmanını kuşandığın, yapay zekâya ya da arkadaşına karşı oynanan, Türkçe, İngilizce ve Çince strateji kart oyunu.', array['100 bölümlük hikâye modu, dallanan yan hikâyeler ve hamleleri puanlayan yapay zekâ rakip', 'Ekipman, efsun, rütbeye göre kart tasarımları ve 3D sandıklar', 'Günlük giriş, şans çarkı, antrenman mini oyunları ve arkadaş sistemi', 'Oda koduyla çevrimiçi maç ve ayrı yönetim paneli']::text[], array['Flutter', 'Dart', 'Node.js', 'Firebase', 'Vercel', 'Netlify']::text[], 'phone', '[{"src":"görseller/aetherWorld/02-ana-menu.webp","alt":"Aether World ana menü","width":540,"height":1199},{"src":"görseller/aetherWorld/04-savas.webp","alt":"Aether World savaş ekranı","width":540,"height":1199},{"src":"görseller/aetherWorld/07-deste.webp","alt":"Aether World deste ve envanter","width":540,"height":1199}]'::jsonb, '<p>
    <strong>Aether World Card Wars</strong>; desteni kurup ekipmanını kuşandığın, yapay zekâya ya da arkadaşına karşı oynanan,
    sıra tabanlı ve taktik ağırlıklı bir kart savaşı oyunudur. İlk hâli Kotlin ile yazdığım üç kartlık
    <a href="#projects" data-project="cardwars">Kart Savaşları (v1.0)</a> demosuydu; v2.0''da oyunu Flutter ile
    sıfırdan yeniden yazdım ve kapsamını büyük ölçüde genişlettim.
</p>

<div class="image-row">
    <img src="görseller/aetherWorld/01-giris.webp" alt="Aether World giriş ekranı">
    <img src="görseller/aetherWorld/02-ana-menu.webp" alt="Aether World ana menü">
</div>

<h3>Oyun Konsepti</h3>
<p>
    Oyuncu kartlarından 8 kartlık bir deste kurar. Savaşta elde her zaman 4 kart bulunur; oynanan kartın yerine desteden yenisi gelir
    ve 8 kart dönüşümlü kullanılır. Her turda hem eldeki hem sıradaki kartları düşünüp MP''yi hangi karta harcayacağına karar vermek gerekir.
</p>
<div class="image-row">
    <img src="görseller/aetherWorld/04-savas.webp" alt="Aether World savaş ekranı">
    <img src="görseller/aetherWorld/05-gunluk-giris.webp" alt="Aether World günlük giriş ödülleri">
</div>

<h3>Öne Çıkan Özellikler</h3>
<ul class="feature-list">
    <li><strong>Kart sistemi:</strong> Beceri, büyü ve pasif kartlar; MP maliyeti, şarj süresi, geri tepme ve savunma mekanikleri; D''den EX/LG''ye uzanan rank sistemi.</li>
    <li><strong>Ekipman ve efsun:</strong> Kask, göğüslük, pantolon, bot, el ve kolye slotları; eşyalar can, savunma ve güç verir, set etkileri taşır ve yeni kartların kilidini açar. Eşyalar Mana Taşı ile efsunlanır; başarı şansı sunucuda, güce ve Demircilik seviyesine göre hesaplanır.</li>
    <li><strong>Yapay zekâ rakip:</strong> Her turda olası hamleleri puanlayıp en iyisini seçer; gerektiğinde güçlü bir kart için MP biriktirir.</li>
    <li><strong>Hikâye modu:</strong> Baştan sona bir senaryoyu izleyen 100 bölüm; 56''sı savaş, kalanı okunan anlatı. İlerledikçe yeni kart ve eşyalar açılır, her bölümün ne kazandırdığı Kazanımlar listesinde görünür.</li>
    <li><strong>Yan hikâyeler:</strong> Ana hikâyeden ayrı ilerleyen, seçimlere göre dallanan ve her biri üç farklı sonla biten görevler.</li>
    <li><strong>Günlük oyun döngüsü:</strong> Seri ödüllü günlük giriş, şans çarkı, her gün değişen Günün Fırsatı ve günlük puan sınırı olan antrenman mini oyunları.</li>
    <li><strong>Sosyal:</strong> Arkadaş arama ve ekleme, oda koduyla çevrimiçi savaş ve savaş içi emojiler.</li>
    <li><strong>Görsel ve ses:</strong> Mor, kırmızı ve siyah tonlarında katmanlı arayüz; rütbeye göre değişen kart tasarımları, her seviyeye özel 3D sandık animasyonları, gerçek kayıtlı savaş sesleri ve retro müzik.</li>
    <li><strong>Çoklu dil:</strong> Türkçe, İngilizce ve Çince arayüz.</li>
    <li><strong>Yönetim paneli:</strong> Etki kurucusuyla kart düzenleme, denge ölçümü, oyuncu yönetimi, bildirimler, etkinlikler, raporlar, güncelleme notları ve geri alma; içerik uygulamayı güncellemeden sunucudan değiştirilebiliyor.</li>
</ul>
<div class="image-row">
    <img src="görseller/aetherWorld/03-hikaye-modu.webp" alt="Aether World hikâye modu bölümleri">
    <img src="görseller/aetherWorld/06-envanter.webp" alt="Aether World envanter ve ekipman">
    <img src="görseller/aetherWorld/07-deste.webp" alt="Aether World deste yuvaları ve kartlar">
</div>

<h3>Neden Kotlin''den Flutter''a?</h3>
<p>
    Tek kod tabanıyla Android, iOS, web (PWA) ve masaüstü için derleme yapabilmek; oyunu herhangi bir mağazaya bağlı kalmadan
    tarayıcıdan açılabilir ve ana ekrana eklenebilir hâle getirmek için.
</p>

<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Flutter Dart</li>
    <li>Node.js (sunucusuz API)</li>
    <li>Zod</li>
    <li>Firebase</li>
    <li>Vercel</li>
    <li>Netlify (API vekil sunucusu)</li>
    <li>PWA</li>
    <li>Çoklu dil (i18n)</li>
    <li>AI ile Görsel Oluşturma</li>
</ul>', 'https://github.com/osmnnuri/SM-CardWars-v2-AetherWorldCardWars-Showcase', null, null, 30),
('DevTrack', 'DevTrack', 'DevTrack Android Mobil Uygulaması', '2026', 'Mobil Uygulama', 'app', true, 'Çalışmaları düzenli ve sistematik ilerletmek için tasarlanmış planlayıcı uygulaması.', array['Projeleri görevlere bölme ve ilerleme takibi', 'Tamamlanan projeleri arşivleme ve yeniden geliştirme']::text[], array['Kotlin', 'Compose', 'Room', 'Firebase']::text[], 'phone', '[{"src":"görseller/devTrack/devTrack_mainScreen.webp","alt":"DevTrack ana ekran","width":361,"height":757},{"src":"görseller/devTrack/devTrack_projectdetail.webp","alt":"DevTrack proje detayı","width":365,"height":763},{"src":"görseller/devTrack/devTrack_archive.webp","alt":"DevTrack arşiv","width":362,"height":761}]'::jsonb, '<div class="image-row">
    <img src="görseller/devTrack/devTrack_mainScreen.webp" alt="devtrack1">
    <img src="görseller/devTrack/devTrack_addPorject.webp" alt="devtrack2">
    <img src="görseller/devTrack/devTrack_projectdetail.webp" alt="devtrack3">
</div>
<p><strong>DevTrack</strong>, geliştiriciler için tasarlanmış olmakla birlikte genel kullanıcı kitlesine de hitap eden bir planlayıcı uygulamasıdır.
Bu uygulamada amaç; çalışmaları düzenli ve sistematik olarak ilerletmek, ilerlemeleri arşiv halinde kaydedip bir kayıt tutmak ve kullanıcıların çalışmaları üzerinde 
daha kontrol sahibi olmalarını sağlamaktır. Bu projeyle birlikte modern "Compose" teknolojisi hakkında daha fazla pratik yaparak yapay zekayı da projelerimde daha etkili kullanma yollarını öğrenmiş oldum.</p>

<img src="görseller/devTrack/devTrack_archive.webp" alt="devtrack4">

<p>Görsellerde görüldüğü üzere uygulama içerisinde eklenen projeler belirlenen görevlerin tamamlanmasına bağlı olarak ilerleme kaydeder ve ilerleme %100''e ulaştığında 
kullanıcı projeyi "Tamamlandı" olarak işaretleyerek arşive gönderebilir. Arşivlenen projelerde tekrar ekleme yapılarak projelerin sürekli olarak geliştirilebilmesine olanak tanır.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Android Studio</li>
    <li>Compose</li>
    <li>AI</li>
    <li>Room, Local DB</li>
    <li>Firebase</li>
</ul>', 'https://github.com/osmnnuri/DevTrack-Showcase', null, null, 40),
('Yasarlar24', 'Yaşarlar 24 Manitou Kiralama', 'Yaşarlar 24 Manitou Kiralama Web Sitesi', '2026', 'Web', 'web', true, 'Gerçek bir işletme için geliştirilen, mobil uyumlu kurumsal web sitesi.', array['Hizmet tanıtımı, bölge bazlı fiyatlar, galeri ve yorumlar', 'SEO, Search Console ve domain yönetimi']::text[], array['HTML', 'CSS', 'JavaScript', 'Firebase Hosting', 'SEO']::text[], 'landscape', '[{"src":"görseller/yasarlar24/yasarlar24anasayfa.webp","alt":"Yaşarlar 24 ana sayfa","width":1400,"height":697}]'::jsonb, '<img src="görseller/yasarlar24/yasarlar24anasayfa.webp" alt="Yaşarlar 24 Ana Sayfa">

<p>
<strong>YAŞARLAR 24 Manitou Kiralama</strong>, İstanbul Anadolu Yakası''nda
operatörlü Manitou hizmeti sunan gerçek bir işletme için geliştirilmiş
<strong>modern ve mobil uyumlu bir kurumsal web sitesidir.</strong>
</p>

<p>
Projede işletmenin hizmetlerini, çalışma bölgelerini ve fiyatlandırma
bilgilerini ziyaretçilere <strong>sade, anlaşılır ve profesyonel</strong>
bir şekilde sunmak amaçlanmıştır. Web sitesinde
<strong>hizmet tanıtımı, bölge bazlı fiyat bilgileri, çalışma galerisi,
müşteri yorumları ve hızlı iletişim</strong> gibi özellikler bulunmaktadır.
</p>

<div class="image-row wide">
<img src="görseller/yasarlar24/yasarlar24yorumlar.webp" alt="Yaşarlar 24 Yorumlar">
<img src="görseller/yasarlar24/yasarlar24iletisim.webp" alt="Yaşarlar 24 İletişim">
</div>

<p>
Bu proje sayesinde gerçek bir işletmenin dijital ortamda
<strong>daha profesyonel şekilde temsil edilmesini</strong> sağlarken;
<strong>responsive web tasarımı, SEO optimizasyonu, Firebase Hosting,
domain yönetimi ve Google Search Console</strong> gibi konularda
pratik deneyim kazandım.
</p>

<h3>Kullanılan Teknolojiler</h3>

<ul class="tech-list">
<li>HTML ve CSS</li>
<li>Visual Studio Code</li>
<li>SSL</li>
<li>AI</li>
<li>Firebase Hosting</li>
<li>Firebase</li>
<li>Responsive</li>
<li>JavaScript</li>
</ul>', 'https://github.com/osmnnuri/Yasarlar24ManitouKiralama-Showcase', 'https://yasarlar24manitoukiralama.com', null, 50),
('MangaApp', 'TrendManga', 'TrendManga Android Mobil Uygulaması', '2026', 'Mobil Uygulama', 'app', false, 'Mangaları isim ve puanlarıyla listeleyen, API destekli Compose uygulaması.', array[]::text[], array['Kotlin', 'Compose', 'API']::text[], 'phone', '[{"src":"görseller/mangaApp/mangaapp1.webp","alt":"","width":357,"height":753}]'::jsonb, '<div class="image-row">
    <img src="görseller/mangaApp/mangaapp1.webp" alt="MangaApp1">
    <img src="görseller/mangaApp/mangaapp2.webp" alt="MangaApp2">
    <img src="görseller/mangaApp/mangaapp3.webp" alt="MangaApp3">
</div>
<p><strong>TrendManga</strong>, dünya genelinde yayınlanan mangaları isim ve puanlarıyla listeleyen bir Android uygulamasıdır.
Bu projeyle birlikte modern "Compose" yapısı hakkında genel bir çalışma yapmış bulunmaktayım. Bu gibi projelerle güncel gelişmeleri ve teknolojileri kullanarak kendimi geliştirmeye devam edeceğim.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Android Studio</li>
    <li>Compose</li>
    <li>API</li>
    <li>Room, Local DB</li>
</ul>', 'https://github.com/osmnnuri/MangaAppCompose-Showcase', null, null, 60),
('cardwars', 'Kart Savaşları (v1.0)', 'Kart Savaşları Mobil Oyunu', '2026', 'Mobil Oyun', 'game', false, 'Aether World''ün ilk hâli: üç kartla yapay zekâya karşı oynanan sıra tabanlı demo.', array[]::text[], array['Kotlin', 'ViewBinding', 'Navigation']::text[], 'phone', '[{"src":"görseller/cardwars/cardwars_menu.webp","alt":"","width":358,"height":760}]'::jsonb, '<p><strong>Kart Savaşları</strong>, yapay zekâ rakibe karşı çevrimdışı oynanan, strateji üzerine kurulu sıra tabanlı bir mobil oyun çalışmasıdır.
Oyunun Flutter ile baştan yazılan yeni sürümü için <a href="#projects" data-project="AetherWorld">Aether World Card Wars (v2.0)</a> projesine göz atın.</p>
<div class="image-row">
    <img src="görseller/cardwars/cardwars_menu.webp" alt="Kart Savaşları Menü">
    <img src="görseller/cardwars/cardwars_game.webp" alt="Kart Savaşları Oyun Ekranı">
</div>
<p>
    <strong>Kart Savaşları</strong>''nda arenaya çıktığınızda size 3 kart verilir ve bu kartları kullanarak çeşitli stratejilerle rakibinizi alt etmeye çalışırsınız.
    Kartlar kullanıldıkça değişir; temel kartların (saldırı, savunma) yanı sıra özel etkilere sahip kartlar da bulunur.
    Oyuncu ve yapay zekâ 30 canla başlar; saldırı 6 hasar verir, savunma 5 kalkan ekler, sersemletme rakibi bir tur durdurur.
    Rakip, canı azaldıkça savunmaya ağırlık veren olasılıklı bir yapay zekâdır. Bu demo (v1.0), oyunun v2.0 sürümünün temelini oluşturdu.
</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Local Database & Room Yapısı</li>
    <li>ViewBinding</li>
    <li>AI ile Görsel Oluşturma</li>
    <li>AI ile Hata Ayıklama</li>
    <li>Katman Mimarisi</li>
    <li>Fragment</li>
    <li>Navigation</li>
</ul>', 'https://github.com/osmnnuri/SM-CardWars-Demo---Showcase', null, null, 70),
('notehub', 'NoteHub', 'NoteHub Android Mobil Uygulaması', '2025', 'Mobil Uygulama', 'app', false, 'Plan ve görevleri kaydeden, kaydırarak silme destekli not uygulaması.', array[]::text[], array['Kotlin', 'Room', 'RecyclerView']::text[], 'phone', '[{"src":"görseller/noteHub/notehubmain.webp","alt":"","width":377,"height":792}]'::jsonb, '<p><strong>NoteHub</strong>; aktivitelerinizi, planlarınızı ve programlarınızı başlık-detay (title - content) olarak kaydetmenizi sağlayan bir Kotlin çalışmasıdır.</p>
<div class="image-row">
    <img src="görseller/noteHub/notehubmain.webp" alt="NoteHub Ana Ekran">
    <img src="görseller/noteHub/notehubdelete.webp" alt="NoteHub Görev Silme">
</div>
<p>Ayrıca <strong>NoteHub</strong>''da eklenmiş görevleri sola kaydırarak silebilirsiniz.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Local Database & Room Yapısı</li>
    <li>RecyclerView</li>
    <li>AI ile Görsel Oluşturma</li>
</ul>', 'https://github.com/osmnnuri/NoteHub-Showcase', null, null, 80),
('BlackJack', 'BlackJack', 'BlackJack Android Mobil Uygulaması', '2025', 'Mobil Oyun', 'game', false, 'Klasik blackjack mantığını mobil cihaza taşıyan kart oyunu.', array[]::text[], array['Kotlin', 'XML']::text[], 'phone', '[{"src":"görseller/blackjack/blackjackmain.webp","alt":"","width":376,"height":822}]'::jsonb, '<div class="image-row">
    <img src="görseller/blackjack/blackjackmain.webp" alt="BlackJack Giriş Ekranı">
    <img src="görseller/blackjack/blackjackmasa.webp" alt="BlackJack Oyun Masası">
</div>
<p><strong>BlackJack</strong>, klasik blackjack mantığını mobil cihazlara taşıyan temel bir Android uygulamasıdır.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Android Studio</li>
</ul>', 'https://github.com/osmnnuri/Blackjack-Showcase', null, null, 90),
('wordgame', 'Kelime Oyunu', 'Kelime Oyunu Mobil Uygulaması', '2025', 'Mobil Oyun', 'game', false, 'Farklı kategorilerdeki kelimeleri tahmin etmeye dayalı kelime oyunu.', array[]::text[], array['Kotlin', 'Room']::text[], 'phone', '[{"src":"görseller/kelimeoyunu/kelimeoyunu.webp","alt":"","width":391,"height":813}]'::jsonb, '<img src="görseller/kelimeoyunu/kelimeoyunu.webp" alt="Kelime Oyunu">
<p><strong>Kelime Oyunu</strong>, çeşitli kategorilerdeki kelimeleri tahmin etmeye çalıştığınız temel bir Kotlin çalışmasıdır.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Local Database & Room Yapısı</li>
</ul>', null, null, null, 100),
('YemekKitabi', 'Yemek Kitabı', 'Yemek Kitabı Android Mobil Uygulaması', '2025', 'Mobil Uygulama', 'app', false, 'Yemekleri tarif ve görselleriyle cihaza kaydeden tarif defteri.', array[]::text[], array['Kotlin', 'Room']::text[], 'phone', '[{"src":"görseller/yemekkitabi/yemekkitabi.webp","alt":"","width":395,"height":836}]'::jsonb, '<img src="görseller/yemekkitabi/yemekkitabi.webp" alt="Yemek Kitabı">
<p><strong>Yemek Kitabı</strong>, istediğiniz yemekleri isim, tarif/malzeme ve görsel olarak cihazınıza kaydedebildiğiniz temel bir Kotlin çalışmasıdır.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin</li>
    <li>Oyun Motoru (OOP)</li>
</ul>', 'https://github.com/osmnnuri/YemekKitabi-Showcase', null, null, 110),
('izeka', 'IZeka', 'IZeka Mobil Eğitim Uygulaması', '2024', 'Mobil Uygulama', 'app', false, 'INUFEST''te sunulan, ekipçe geliştirilen oyunlaştırılmış eğitim platformu.', array[]::text[], array['Kotlin', 'XML', 'Local DB']::text[], 'square', '[{"src":"görseller/IZeka/proje_kapak.webp","alt":"","width":499,"height":499}]'::jsonb, '<img src="görseller/IZeka/proje_kapak.webp" alt="IZeka Görsel">
<p><strong>IZeka</strong>, ekibimle birlikte geliştirdiğimiz oyunlaştırılmış bir mobil eğitim platformudur.</p>
<p>Uygulama, INUFEST kapsamında sunulmuş ve büyük ilgi görmüştür.</p>
<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>Kotlin & Android Studio</li>
    <li>Local Database</li>
    <li>XML Layout Tasarımı</li>
</ul>', null, null, null, 120),
('cafe', 'Kafe Garson-Müşteri Arayüzü', 'Müşteri - Garson Sipariş Arayüzü', '2024', 'Web', 'web', false, 'Garson paneli ve müşteri sipariş menüsünden oluşan web arayüzü.', array[]::text[], array['HTML', 'CSS']::text[], 'landscape', '[{"src":"görseller/Kafe/garson_paneli.webp","alt":"","width":1400,"height":718}]'::jsonb, '<img src="görseller/Kafe/garson_paneli.webp" alt="Garson Paneli">
<p><strong>Garson Paneli:</strong> Masaların durumu ve gelen siparişler anlık olarak takip edilebilir.</p>

<img src="görseller/Kafe/musteri_paneli.webp" alt="Restoran Menüsü">
<p><strong>Müşteri Paneli:</strong> Müşteri ürünleri tercihine göre düzenleyebilir (malzeme ekleyip çıkarabilir), siparişini verebilir ve hesabı masasına isteyebilir.</p>

<h3>Kullanılan Teknolojiler</h3>
<ul class="tech-list">
    <li>HTML5 & CSS3</li>
    <li>Cursor AI Destekli Geliştirme</li>
</ul>', null, null, null, 130)
on conflict (id) do nothing;
