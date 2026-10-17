const projectData = {
    'izeka': {
        title: 'IZeka Mobil Eğitim Uygulaması',
        content: `
            <img src="görseller/IZeka/proje_kapak.webp" alt="IZeka Görsel">
            <p><strong>IZeka</strong>, ekibimle birlikte geliştirdiğimiz oyunlaştırılmış bir mobil eğitim platformudur.</p>
            <p>Uygulama, INUFEST kapsamında sunulmuş ve büyük ilgi görmüştür.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin & Android Studio</li>
                <li>Local Database</li>
                <li>XML Layout Tasarımı</li>
            </ul>
        `
    },

    'cafe': {
        title: 'Müşteri - Garson Sipariş Arayüzü',
        content: `
            <img src="görseller/Kafe/garson_paneli.webp" alt="Garson Paneli">
            <p><strong>Garson Paneli:</strong> Masaların durumu ve gelen siparişler anlık olarak takip edilebilir.</p>
            
            <img src="görseller/Kafe/musteri_paneli.webp" alt="Restoran Menüsü">
            <p><strong>Müşteri Paneli:</strong> Müşteri ürünleri tercihine göre düzenleyebilir (malzeme ekleyip çıkarabilir), siparişini verebilir ve hesabı masasına isteyebilir.</p>
            
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>HTML5 & CSS3</li>
                <li>Cursor AI Destekli Geliştirme</li>
            </ul>
        `
    },

    'YemekKitabi': {
        title: 'Yemek Kitabı Android Mobil Uygulaması',
        content: `
            <img src="görseller/yemekkitabi/yemekkitabi.webp" alt="Yemek Kitabı">
            <p><strong>Yemek Kitabı</strong>, istediğiniz yemekleri isim, tarif/malzeme ve görsel olarak cihazınıza kaydedebildiğiniz temel bir Kotlin çalışmasıdır.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin</li>
                <li>Local Database & Room Yapısı</li>
            </ul>
        `
    },

    'wordgame': {
        title: 'Kelime Oyunu Mobil Uygulaması',
        content: ` 
            <img src="görseller/kelimeoyunu/kelimeoyunu.webp" alt="Kelime Oyunu">
            <p><strong>Kelime Oyunu</strong>, çeşitli kategorilerdeki kelimeleri tahmin etmeye çalıştığınız temel bir Kotlin çalışmasıdır.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin</li>
                <li>Local Database & Room Yapısı</li>
            </ul>
        `
    },

    'BlackJack': {
        title: 'BlackJack Android Mobil Uygulaması',
        content: `
            <div class="image-row">
                <img src="görseller/blackjack/blackjackmain.webp" alt="BlackJack Giriş Ekranı">
                <img src="görseller/blackjack/blackjackmasa.webp" alt="BlackJack Oyun Masası">
            </div>
            <p><strong>BlackJack</strong>, klasik blackjack mantığını mobil cihazlara taşıyan temel bir Android uygulamasıdır.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin</li>
                <li>Android Studio</li>
            </ul>
        `
    },

    'notehub': {
        title: 'NoteHub Android Mobil Uygulaması',
        content: ` 
            <p><strong>NoteHub</strong>; aktivitelerinizi, planlarınızı ve programlarınızı başlık-detay (title - content) olarak kaydetmenizi sağlayan bir Kotlin çalışmasıdır.</p>
            <div class="image-row">
                <img src="görseller/noteHub/notehubmain.webp" alt="NoteHub Ana Ekran">
                <img src="görseller/noteHub/notehubdelete.webp" alt="NoteHub Görev Silme">
            </div>
            <p>Ayrıca <strong>NoteHub</strong>'da eklenmiş görevleri sola kaydırarak silebilirsiniz.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin</li>
                <li>Local Database & Room Yapısı</li>
                <li>RecyclerView</li>
                <li>AI ile Görsel Oluşturma</li>
            </ul>
        `
    },
    
    'cardwars': {
        title: 'Kart Savaşları Mobil Oyunu',
        content: ` 
            <p><strong>Kart Savaşları</strong>, çevrimiçi/çevrimdışı olarak mücadele edebileceğiniz, strateji üzerine kurulu sıra tabanlı bir mobil oyun çalışmasıdır.</p>
            <div class="image-row">
                <img src="görseller/cardwars/cardwars_menu.webp" alt="Kart Savaşları Menü">
                <img src="görseller/cardwars/cardwars_game.webp" alt="Kart Savaşları Oyun Ekranı">
            </div>
            <p>
                <strong>Kart Savaşları</strong>'nda arenaya çıktığınızda size 3 kart verilir ve bu kartları kullanarak çeşitli stratejilerle rakibinizi alt etmeye çalışırsınız.
                Kartlar kullanıldıkça değişir; temel kartların (saldırı, savunma) yanı sıra özel etkilere sahip kartlar da bulunur.
                Uygulama şu an (05.02.2026) demo sürümündedir (v1.0) ve zamanla geliştirilmeye devam edecektir.
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
            </ul>
        `
    },
    'MangaApp': {
        title: 'TrendManga Android Mobil Uygulaması',
        content: `
            <div class="image-row">
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
            </ul>
        `
    },
        'DevTrack': {
        title: 'DevTrack Android Mobil Uygulaması',
        content: `
            <div class="image-row">
                <img src="görseller/devTrack/devTrack_mainScreen.webp" alt="devtrack1">
                <img src="görseller/devTrack/devTrack_addPorject.webp" alt="devtrack2">
                <img src="görseller/devTrack/devTrack_projectdetail.webp" alt="devtrack3">
            </div>
            <p><strong>DevTrack</strong>, geliştiriciler için tasarlanmış olmakla birlikte genel kullanıcı kitlesine de hitap eden bir planlayıcı uygulamasıdır.
            Bu uygulamada amaç; çalışmaları düzenli ve sistematik olarak ilerletmek, ilerlemeleri arşiv halinde kaydedip bir kayıt tutmak ve kullanıcıların çalışmaları üzerinde 
            daha kontrol sahibi olmalarını sağlamaktır. Bu projeyle birlikte modern "Compose" teknolojisi hakkında daha fazla pratik yaparak yapay zekayı da projelerimde daha etkili kullanma yollarını öğrenmiş oldum.</p>

            <img src="görseller/devTrack/devTrack_archive.webp" alt="devtrack4">

            <p>Görsellerde görüldüğü üzere uygulama içerisinde eklenen projeler belirlenen görevlerin tamamlanmasına bağlı olarak ilerleme kaydeder ve ilerleme %100'e ulaştığında 
            kullanıcı projeyi "Tamamlandı" olarak işaretleyerek arşive gönderebilir. Arşivlenen projelerde tekrar ekleme yapılarak projelerin sürekli olarak geliştirilebilmesine olanak tanır.</p>
            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Kotlin</li>
                <li>Android Studio</li>
                <li>Compose</li>
                <li>AI</li>
                <li>Room, Local DB</li>
                <li>Firebase</li>
            </ul>
        `
    },
        'Yasarlar24': {
    title: 'Yaşarlar 24 Manitou Kiralama Web Sitesi',
    content: `
        <img src="görseller/yasarlar24/yasarlar24anasayfa.webp" alt="Yaşarlar 24 Ana Sayfa">

        <p>
            <strong>YAŞARLAR 24 Manitou Kiralama</strong>, İstanbul Anadolu Yakası'nda
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
        </ul>
    `
},
    'FinansDefteri': {
        title: 'Finans Defteri Mobil Uygulaması',
        content: `
            <p>
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
            <p>Finans Defteri'nde bir işlem üç yoldan eklenebiliyor:</p>
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
            </ul>
        `
    },
    'DersAsistanim': {
        title: 'DersAsistanım: Maskotlu Ders Çalışma Asistanı',
        content: `
            <p>
                <strong>DersAsistanım</strong>; ortaokul ve LGS öğrencilerinin ders çalışmayı planlamasına, takip etmesine
                ve sürdürmesine yardım eden, maskotlu bir asistanı olan ve internetsiz çalışan bir web uygulamasıdır (PWA).
                Telefonda "Ana ekrana ekle" ile uygulama gibi kurulur; hesap, sunucu ya da ücret gerektirmez.
            </p>

            <div class="image-row">
                <img src="görseller/dersAsistanim/01-ana-sayfa.webp" alt="DersAsistanım ana sayfa">
                <img src="görseller/dersAsistanim/02-ana-sayfa-plan.webp" alt="DersAsistanım bugünün planı ve seri">
            </div>

            <h3>Problem</h3>
            <p>
                Öğrenciler için ders çalışmanın en zor kısmı çoğu zaman başlamak ve devam ettirmek. Planlama uygulamaları
                öğrenciden her şeyi kendisinin kurmasını bekliyor; bir süre sonra uygulama bırakılıyor. Amacım baskı kurmadan,
                küçük adımlarla çalışmaya yönlendiren ve planı öğrencinin yerine hazırlayan bir asistan yapmaktı.
            </p>

            <h3>Ürettiğim Çözüm</h3>
            <ul class="feature-list">
                <li><strong>Maskot asistan:</strong> Günün durumuna (süren oturum, saat, ruh hali, bekleyen yanlışlar, plan) bakıp ne yapılacağını öneren kural tabanlı bir asistan. Hızlı mesajlar ve Türkçe serbest yazıyla konuşulabiliyor.</li>
                <li><strong>Akıllı program:</strong> Öğrenci okul ders programını girer; uygulama o gün işlenen derslerin tekrarını, ertesi günün derslerine hazırlığı ve hafta sonu soru çözümünü haftaya kendisi yerleştirir.</li>
                <li><strong>Çevrimdışı ve gizli:</strong> Tüm veri cihazda kalır; ilk açılıştan sonra internet gerekmez.</li>
            </ul>

            <div class="image-row">
                <img src="görseller/dersAsistanim/04-derslerim.webp" alt="DersAsistanım Derslerim ve akıllı program">
                <img src="görseller/dersAsistanim/05-ders-programi.webp" alt="DersAsistanım okul ders programı">
                <img src="görseller/dersAsistanim/06-akilli-program.webp" alt="DersAsistanım akıllı program önizlemesi">
            </div>

            <h3>Öne Çıkan Özellikler</h3>

            <p><strong>Haftalık plan ve hazır programlar:</strong> Tek dokunuşla tamamlama, erteleme ve hafifletme; LGS hazırlık, sayısal/sözel ağırlıklı gibi 9 hazır program.</p>
            <div class="image-row">
                <img src="görseller/dersAsistanim/03-haftalik-plan.webp" alt="DersAsistanım haftalık plan">
                <img src="görseller/dersAsistanim/09-kronometre.webp" alt="DersAsistanım kronometre">
            </div>

            <p><strong>Kronometre, yanlış defteri ve gelişim:</strong> Hedef süreli çalışma oturumları; yanlış sorular için 2 → 3 → 7 → 14 günlük aralıklı tekrar; haftalık süre ve 6 haftalık doğruluk grafikleri, LGS net hesabı.</p>
            <div class="image-row">
                <img src="görseller/dersAsistanim/08-yanlis-defteri.webp" alt="DersAsistanım yanlış defteri">
                <img src="görseller/dersAsistanim/07-gelisim.webp" alt="DersAsistanım gelişim grafikleri">
            </div>

            <p><strong>İlk açılış turu ve bildirimler:</strong> Gerçek ekran öğelerini vurgulayan 8 adımlık tanıtım turu; maskotun kendi sesiyle gönderdiği, uzun süre girilmeyince "Neredesin?" diye soran nazik hatırlatmalar.</p>
            <img src="görseller/dersAsistanim/10-uygulama-turu.webp" alt="DersAsistanım uygulama turu">

            <p><strong>Güvenli güncelleme:</strong> Yeni sürüm arka planda iner, kullanıcı "Güncelle" deyince devreye girer. Kendine zarar verme ifadelerini algılayıp ders önerisini durduran bir güvenlik kuralı da var.</p>

            <h3>Kullanılan Teknolojiler</h3>
            <ul class="tech-list">
                <li>Flutter Dart</li>
                <li>PWA</li>
                <li>Service Worker</li>
                <li>IndexedDB (Sembast)</li>
                <li>fl_chart</li>
                <li>Vercel</li>
                <li>315 otomatik test</li>
            </ul>
        `
    }
};

// Proje detaylarının altında gösterilen kaynak kod / canlı site bağlantıları
const projectLinks = {
    'FinansDefteri': { repo: 'https://github.com/osmnnuri/FinansDefteri-Showcase', live: 'https://financeapp-997b3.web.app/?demo=1', liveLabel: 'Canlı demoyu dene' },
    'DersAsistanim': { repo: 'https://github.com/osmnnuri/dersasistanim-showcase', live: 'https://dersasistanim.vercel.app', liveLabel: 'Uygulamayı aç' },
    'DevTrack': { repo: 'https://github.com/osmnnuri/DevTrack-Showcase' },
    'Yasarlar24': { repo: 'https://github.com/osmnnuri/Yasarlar24ManitouKiralama-Showcase', live: 'https://yasarlar24manitoukiralama.com' },
    'MangaApp': { repo: 'https://github.com/osmnnuri/MangaAppCompose-Showcase' },
    'cardwars': { repo: 'https://github.com/osmnnuri/SM-CardWars-Demo---Showcase' },
    'notehub': { repo: 'https://github.com/osmnnuri/NoteHub-Showcase' },
    'BlackJack': { repo: 'https://github.com/osmnnuri/Blackjack-Showcase' },
    'YemekKitabi': { repo: 'https://github.com/osmnnuri/YemekKitabi-Showcase' }
};

function linkButtons(links) {
    if (!links) return "";
    let html = "";
    if (links.live) html += `<a class="btn primary" href="${links.live}" target="_blank" rel="noopener">${links.liveLabel || "Canlı siteyi aç"} &nearr;</a>`;
    if (links.repo) html += `<a class="btn" href="${links.repo}" target="_blank" rel="noopener"><img src="görseller/icons/icons8-github-50.png" alt="">GitHub'da incele</a>`;
    return `<div class="modal-links">${html}</div>`;
}

function openProject(id) {
    const data = projectData[id];

    if (data) {
        showModal(`<h2 id="modal-title">${data.title}</h2>${data.content}${linkButtons(projectLinks[id])}`);
    }
}

let lastFocused = null;

function showModal(html) {
    const modal = document.getElementById("projectModal");
    const body = document.getElementById("modal-body");
    const content = modal.querySelector(".modal-content");
    lastFocused = document.activeElement;
    body.innerHTML = html;
    const title = body.querySelector("h2");
    if (title) {
        title.id = "modal-title";
        modal.setAttribute("aria-labelledby", "modal-title");
    }
    content.scrollTop = 0;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Modal açıkken arka plan kaymasın
    content.focus({ preventScroll: true });
}

function closeModal() {
    const modal = document.getElementById("projectModal");
    if (!modal.classList.contains("show")) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Kaydırmayı geri aç
    if (lastFocused && lastFocused.focus) lastFocused.focus({ preventScroll: true });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();

    // Modal açıkken Tab tuşu pencerenin içinde dolaşsın
    const modal = document.getElementById("projectModal");
    if (event.key !== "Tab" || !modal.classList.contains("show")) return;
    const focusables = [...modal.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])")];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === modal.querySelector(".modal-content"))) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

// Kapatma butonu ve dışarı tıklama olayları
const closeBtn = document.querySelector(".close-button");
if (closeBtn) closeBtn.onclick = closeModal;

window.onclick = (event) => {
    const modal = document.getElementById("projectModal");
    if (event.target == modal) closeModal();
};

// Kartlar klavyeyle de açılabilsin (Enter / Boşluk)
document.querySelectorAll(".project-card[onclick]").forEach(card => {
    card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        card.click();
    });
});

// --- Hamburger Menü (Mobil Navigasyon) ---
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navOverlay = document.getElementById("navOverlay");

function openMenu() {
    hamburger.classList.add("active");
    navLinks.classList.add("active");
    navOverlay.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
}

function closeMenu() {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
    navOverlay.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "auto";
}

if (hamburger && navLinks && navOverlay) {
    hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("active");
        isOpen ? closeMenu() : openMenu();
    });

    // Bir linke tıklandığında menüyü otomatik kapat
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Menü dışına (overlay'e) tıklandığında kapat
    navOverlay.addEventListener("click", closeMenu);

    // Ekran boyutu masaüstüne dönerse menüyü sıfırla
    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            closeMenu();
        }
    });
}

// --- Etkileşimli terminal ---
const termOutputs = {
    hakkimda: `<p><b>Osman Nuri Yaşar</b></p>
        <p>İnönü Üniversitesi Bilgisayar Mühendisliği öğrencisi.</p>
        <p><span class="key">uzmanlık</span> Mobil uygulama geliştirme</p>
        <p><span class="key">alanlar</span> Web · Siber güvenlik</p>
        <p><span class="key">hedef</span> Çok yönlü bir geliştirici olmak</p>`,
    yetenekler: `<p><span class="key">diller</span> Kotlin, Java, Dart, Python, C, JavaScript</p>
        <p><span class="key">mobil</span> Jetpack Compose, Flutter, React Native, Room</p>
        <p><span class="key">web</span> HTML &amp; CSS, Responsive Tasarım, SEO</p>
        <p><span class="key">servis</span> Firebase, Firestore, REST API</p>
        <p><span class="key">araçlar</span> Android Studio, VS Code, IntelliJ IDEA</p>`,
    projeler: `<p>Öne çıkan projeler (açmak için tıklayın):</p>
        <p><button type="button" onclick="openProject('FinansDefteri')">→ Finans Defteri</button> <span class="dim">Flutter</span></p>
        <p><button type="button" onclick="openProject('DersAsistanim')">→ DersAsistanım</button> <span class="dim">Flutter · PWA</span></p>
        <p><button type="button" onclick="openProject('DevTrack')">→ DevTrack</button> <span class="dim">Kotlin · Compose</span></p>
        <p><button type="button" onclick="openProject('Yasarlar24')">→ Yaşarlar 24</button> <span class="dim">Web</span></p>
        <p><a href="#projects">12 projenin tümünü gör ↓</a></p>`,
    guvenlik: `<p><span class="key">çalışma</span> Uygulama güvenliği</p>
        <p><span class="key">çalışma</span> Bilgisayar ağları / iletişimi</p>
        <p><span class="key">görev</span> Siber Güvenlik Topluluğu Ar-Ge Başkanı</p>
        <p><span class="key">proje</span> Siber Sözlük (INUFEST 2026)</p>
        <p class="dim">Bu alanda çalışmalarıma yeni başladım.</p>`,
    iletisim: `<p><span class="key">e-posta</span> <a href="mailto:osmannuriyasar57@gmail.com">osmannuriyasar57@gmail.com</a></p>
        <p><span class="key">github</span> <a href="https://github.com/osmnnuri" target="_blank" rel="noopener">github.com/osmnnuri</a></p>
        <p><span class="key">linkedin</span> <a href="https://www.linkedin.com/in/osman-nuri-yaşar-59901a324/" target="_blank" rel="noopener">Osman Nuri Yaşar</a></p>`
};

const termScreen = document.getElementById("termScreen");
const termButtons = document.querySelectorAll(".term-cmds button");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let termRun = 0;

function runCommand(cmd) {
    const run = ++termRun; // Yeni komut, süren yazma animasyonunu iptal eder
    termButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cmd === cmd)));
    termScreen.innerHTML = `<p class="term-line"><span class="prompt">$</span> <span class="typed"></span><span class="caret"></span></p>`;
    const typed = termScreen.querySelector(".typed");

    const showOutput = () => {
        termScreen.querySelector(".caret").remove();
        termScreen.insertAdjacentHTML("beforeend", `<div class="term-out">${termOutputs[cmd]}</div>`);
    };

    if (reduceMotion) {
        typed.textContent = cmd;
        showOutput();
        return;
    }

    let index = 0;
    const typeNext = () => {
        if (run !== termRun) return;
        typed.textContent = cmd.slice(0, ++index);
        if (index < cmd.length) setTimeout(typeNext, 45);
        else setTimeout(() => { if (run === termRun) showOutput(); }, 180);
    };
    typeNext();
}

termButtons.forEach(button => button.addEventListener("click", () => runCommand(button.dataset.cmd)));
runCommand("hakkimda");

// --- Proje türü filtresi ---
const filterButtons = document.querySelectorAll(".filters button");
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        document.querySelectorAll(".p-card").forEach(card => {
            card.hidden = button.dataset.filter !== "all" && card.dataset.type !== button.dataset.filter;
        });
    });
});

if ("IntersectionObserver" in window) {
    // --- Kaydırınca görünme ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

    // --- Menüde bulunulan bölümü vurgula ---
    const navAnchors = document.querySelectorAll(".nav-links a:not(.nav-btn)");
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach(a => a.classList.toggle("current", a.getAttribute("href") === "#" + entry.target.id));
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(section => sectionObserver.observe(section));
} else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
}

// --- Güncel sürüm kontrolü: eski önbelleği yok sayan service worker ---
if ("serviceWorker" in navigator) {
    // İlk kurulumda sayfa hâlâ eski önbellekten gelmiş olabilir; bir kez yenileyerek güncel sürüme geç
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController) window.location.reload();
    });

    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
}
