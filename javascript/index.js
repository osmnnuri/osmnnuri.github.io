const projectData = {
    'izeka': {
        title: 'IZeka Mobil Eğitim Uygulaması',
        content: `
            <img src="görseller/IZeka/proje_kapak.png" alt="IZeka Görsel">
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
            <img src="görseller/Kafe/garson_paneli.png" alt="Garson Paneli">
            <p><strong>Garson Paneli:</strong> Masaların durumu ve gelen siparişler anlık olarak takip edilebilir.</p>
            
            <img src="görseller/Kafe/musteri_paneli.png" alt="Restoran Menüsü">
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
            <img src="görseller/yemekkitabi/yemekkitabi.png" alt="Yemek Kitabı">
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
            <img src="görseller/kelimeoyunu/kelimeoyunu.png" alt="Kelime Oyunu">
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
                <img src="görseller/blackjack/blackjackmain.png" alt="BlackJack Giriş Ekranı">
                <img src="görseller/blackjack/blackjackmasa.png" alt="BlackJack Oyun Masası">
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
                <img src="görseller/noteHub/notehubmain.png" alt="NoteHub Ana Ekran">
                <img src="görseller/noteHub/notehubdelete.png" alt="NoteHub Görev Silme">
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
                <img src="görseller/cardwars/cardwars_menu.png" alt="Kart Savaşları Menü">
                <img src="görseller/cardwars/cardwars_game.png" alt="Kart Savaşları Oyun Ekranı">
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
                <img src="görseller/mangaApp/mangaapp1.png" alt="MangaApp1">
                <img src="görseller/mangaApp/mangaapp2.png" alt="MangaApp2">
                <img src="görseller/mangaApp/mangaapp3.png" alt="MangaApp3">
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
                <img src="görseller/devTrack/devTrack_mainScreen.png" alt="devtrack1">
                <img src="görseller/devTrack/devTrack_addPorject.png" alt="devtrack2">
                <img src="görseller/devTrack/devTrack_projectdetail.png" alt="devtrack3">
            </div>
            <p><strong>DevTrack</strong>, geliştiriciler için tasarlanmış olmakla birlikte genel kullanıcı kitlesine de hitap eden bir planlayıcı uygulamasıdır.
            Bu uygulamada amaç; çalışmaları düzenli ve sistematik olarak ilerletmek, ilerlemeleri arşiv halinde kaydedip bir kayıt tutmak ve kullanıcıların çalışmaları üzerinde 
            daha kontrol sahibi olmalarını sağlamaktır. Bu projeyle birlikte modern "Compose" teknolojisi hakkında daha fazla pratik yaparak yapay zekayı da projelerimde daha etkili kullanma yollarını öğrenmiş oldum.</p>

            <img src="görseller/devTrack/devTrack_archive.png" alt="devtrack4">

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
        <img src="görseller/yasarlar24/yasarlar24anasayfa.png" alt="Yaşarlar 24 Ana Sayfa">

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
            <img src="görseller/yasarlar24/yasarlar24yorumlar.png" alt="Yaşarlar 24 Yorumlar">
            <img src="görseller/yasarlar24/yasarlar24iletisim.png" alt="Yaşarlar 24 İletişim">
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
                <img src="görseller/finansDefteri/04-ana-ekran.png" alt="Finans Defteri Ana Sayfa">
                <img src="görseller/finansDefteri/13-koyu-ana-ekran.png" alt="Finans Defteri Ana Sayfa (Karanlık Tema)">
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
                <img src="görseller/finansDefteri/10-islemler.png" alt="Finans Defteri İşlemler">
                <img src="görseller/finansDefteri/11-gider-ekle.png" alt="Finans Defteri Gider Ekle">
                <img src="görseller/finansDefteri/03-tanitim.png" alt="Finans Defteri Tanıtım">
            </div>

            <h3>Öne Çıkan Özellikler</h3>

            <p><strong>Aylık rapor ve PDF:</strong> Gelir, gider, net birikim, tasarruf oranı ve kategori bazlı gider dağılımı. Rapor tek dokunuşla PDF olarak kaydediliyor.</p>
            <div class="image-row">
                <img src="görseller/finansDefteri/05-rapor.png" alt="Finans Defteri Rapor Ekranı">
                <img src="görseller/finansDefteri/06-rapor-kategoriler.png" alt="Finans Defteri Kategori Ekranı">
            </div>

            <p><strong>Bütçe ve hatırlatıcılar:</strong> Kategori bazlı aylık limitler, limite yaklaşınca uyarı; kira, fatura gibi tekrarlayan ödemeler için takvimli hatırlatıcılar.</p>
            <div class="image-row">
                <img src="görseller/finansDefteri/07-butce.png" alt="Finans Defteri Bütçe Ekranı">
                <img src="görseller/finansDefteri/08-hatirlaticilar.png" alt="Finans Defteri Hatırlatıcı Ekranı">
            </div>

            <p><strong>Döviz ve altın:</strong> Türkiye Cumhuriyet Merkez Bankası (TCMB) kurları, gram altın ve gümüş fiyatları, kur çeviricisi.</p>
            <img src="görseller/finansDefteri/09-doviz.png" alt="Finans Defteri Döviz Ekranı">

            <p><strong>Çevrimdışı çalışma:</strong> İnternet yokken girilen kayıtlar cihazda bekliyor, bağlantı gelince kendiliğinden eşitleniyor.</p>

            <p><strong>Güvenlik:</strong> E-posta doğrulamalı hesap, cihazda PIN kilidi, her kullanıcının yalnızca kendi verisine erişebildiği sunucu kuralları.</p>
            <div class="image-row">
                <img src="görseller/finansDefteri/01-giris.png" alt="Finans Defteri Giriş Ekranı">
                <img src="görseller/finansDefteri/02-pin.png" alt="Finans Defteri PIN Ekranı">
            </div>

            <p><strong>Kişiselleştirme:</strong> Açık/koyu tema, Türkçe/İngilizce ve ayarlanabilir yazı boyutu.</p>
            <div class="image-row">
                <img src="görseller/finansDefteri/12-ayarlar.png" alt="Finans Defteri Ayarlar Ekranı">
                <img src="görseller/finansDefteri/14-koyu-rapor.png" alt="Finans Defteri Koyu Rapor Ekranı">
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
    }
};

function openProject(id) {
    const data = projectData[id];

    if (data) {
        showModal(`<h2>${data.title}</h2>${data.content}`);
    }
}

function showModal(html) {
    const modal = document.getElementById("projectModal");
    const body = document.getElementById("modal-body");
    body.innerHTML = html;
    modal.querySelector(".modal-content").scrollTop = 0;
    modal.classList.add("show");
    document.body.style.overflow = "hidden"; // Modal açıkken arka plan kaymasın
}

function closeModal() {
    const modal = document.getElementById("projectModal");
    modal.classList.remove("show");
    document.body.style.overflow = "auto"; // Kaydırmayı geri aç
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
});

// --- Kartların kaydırma ile görünme animasyonu ---
const revealCards = document.querySelectorAll(".activity-card");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        let order = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty("--reveal-delay", `${order * 0.1}s`);
            entry.target.classList.add("visible");
            order++;
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealCards.forEach(card => {
        card.classList.add("reveal");
        revealObserver.observe(card);
    });
}

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
        if (window.innerWidth > 640) {
            closeMenu();
        }
    });
}

// --- Yetenek seviye bar animasyonu (Uzmanlık Alanları bölümü) ---
const skillLevelsGrid = document.querySelector(".skill-levels-grid");
if (skillLevelsGrid && "IntersectionObserver" in window) {
    const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll(".skill-bar-fill").forEach(bar => {
                bar.style.width = bar.dataset.width + "%";
            });
            skillBarObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    skillBarObserver.observe(skillLevelsGrid);
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
