const projectData = {
    'izeka': {
        title: 'IZeka Mobil Eğitim Uygulaması',
        content: `
            <img src="proje_kapak.png" alt="IZeka Görsel">
            <p><strong>IZeka</strong>, ekibimle birlikte geliştirdiğim oyunlaştırılmış bir eğitim platformudur.</p>
            <p>Bu projede kullanılan teknolojiler:</p>
            <ul>
                <li>Kotlin & Android Studio</li>
                <li>Local Database</li>
                <li>XML Layout Tasarımı</li>
            </ul>
            <p>Uygulama, INUFEST kapsamında sunulmuş ve büyük ilgi görmüştür.</p>
        `
    },

    'cafe': {
        title: 'Müşteri - Garson Sipariş Arayüzü',
        content: `
            <img src="garson_paneli.png" alt="Garson Paneli">
            <p><strong>Garson Paneli:</strong> Masaların durumunu ve siparişleri anlık takip edebilirsiniz.</p>
            
            <img src="musteri_paneli.png" alt="Restoran Menüsü">
            <p><strong>Menü Yönetimi:</strong> Ürünleri tercihinize göre düzenleyebilir(Malzeme ekleyip çıkarabilir), siparişinizi verebilir ve hesabı masanıza isteyebilirsiniz.</p>
            
            <p>Kullanılan Teknolojiler</p>
            <ul>
                <li>HTML5 & CSS3</li>
                <li>Cursor AI Destekli Geliştirme</li>
            </ul>
        `
    },

    'YemekKitabi': {
        title: 'Yemek Kitabı Android Mobil Uygulaması',
        content: `
            <img src="yemekkitabi.png" alt="Yemek Kitabı">
            <p><strong>Yemek Kitabı</strong> İstediğiniz yemekleri tarif/malzeme, isim ve görsel olarak kaydederek cihazınızda not edebileceğiniz temel bir kotlin yazılım çalışmasıdır.</p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
                <li>Kotlin</li>
                <li>Local Database & Room Yapısı</li>
            </ul>
        `
    },

    'wordgame': {
        title: 'Kelime Oyunu Mobil Uygulaması',
        content: ` 
            <img src="kelimeoyunu.png" alt="Kelime Oyunu">
            <p><strong>Kelime Oyunu</strong> çeşitli kategorilerde ki kelimeleri tahmin etmeye çalıştığınız temel bir kotlin yazılım çalışmasıdır.</p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
                <li>Kotlin</li>
                <li>Local Database & Room Yapısı</li>
            </ul>
        `
    },

    'BlackJack': {
        title: 'BlackJack Android Mobil Uygulaması',
        content: `
            <div class="image-row">
                <img src="blackjackmain.png" alt="BlackJack Giriş Ekranı">
                <img src="blackjackmasa.png" alt="BlackJack Oyun Masası">
            </div>
            <p><strong>BlackJack</strong> klasik blackjack mantığını mobil cihazlarınıza taşıyan temel bir android yazılımdır.</p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
                <li>Kotlin</li>
                <li>Android Studio</li>
            </ul>
        `
    },

    'notehub': {
        title: 'NoteHub Android Mobil Uygulaması',
        content: ` 
            <img src="notehubmain.png" alt="Note Hub">
            <p><strong>NoteHub</strong> istediğiniz aktivitelerinizi planlarınızı ve programlarınıznı vs. başlık-detay (title - content) olarak kaydetmenize izin veren bir kotlin çalışmasıdır.</p>
            <img src="notehubdelete.png" alt="Note Hub Görev Silme">
            <p>Ayrıca, <strong>NoteHub</strong>'da görevleri sola kaydırarak eklenmiş görevleri silebilirsiniz.</p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
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
            <img src="cardwars_menu.png" alt="Kart Savaşları Menü">
            <p><strong>Kart Savaşları</strong> çevrimiçi/çevrimdışı olarak mücadele edebileceğiniz strateji üzerine kurulu sıra tabanlı bir mobil oyun çalışmasıdır.</p>
            <img src="cardwars_game.png" alt="Kart Savaşları Oyun Ekranı">
            <p>
                <strong>Kart Savaşları</strong>'nda arenaya çıktığınızda size 3 kart verilir ve bu kartları kullanarak çeşitli stratejilerle rakibinizi alt etmeye çalışırsınız.
                Kartlar kullanıcı kullandıkça değişir ve temel kartların (saldırı, savunma) yanı sıra özel etkilere sahip kartlarda bulunur.
                Uygulama şuan (05.02.2026) demo sürümündedir(v1.0) ve uygulama zamanla geliştirilmeye devam edecektir.
            </p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
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
                <img src="mangaapp1.png" alt="MangaApp1">
                <img src="mangaapp2.png" alt="MangaApp2">
                <img src="mangaapp3.png" alt="MangaApp3">
            </div>
            <p><strong>TrendManga</strong> Dünya genelinde yayınlanan mangaları isim ve puanlarıyla listeleyen bir android yazılım çalışmasıdır.
            Bu projeyle birlikte modern "Compose" yapısı hakkında genel bir çalışma yapmış bulunmaktayım. Bu gibi projelerle güncel gelişmeleri ve teknolojileri kullanarak kendimi geliştirmeye devam edeceğim.</p>
            <p>Kullanılan Teknolojiler:</p>
            <ul>
                <li>Kotlin</li>
                <li>Android Studio</li>
                <li>Compose</li>
                <li>API</li>
                <li>Room, Local DB</li>
            </ul>
        `
    }
};

function openProject(id) {
    const modal = document.getElementById("projectModal");
    const body = document.getElementById("modal-body");
    const data = projectData[id];

    if (data) {
        body.innerHTML = `<h2>${data.title}</h2>${data.content}`;
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Modal açıkken arka plan kaymasın
    }
}

function closeModal() {
    const modal = document.getElementById("projectModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Kaydırmayı geri aç
}

// Kapatma butonu ve dışarı tıklama olayları
const closeBtn = document.querySelector(".close-button");
if (closeBtn) closeBtn.onclick = closeModal;

window.onclick = (event) => {
    const modal = document.getElementById("projectModal");
    if (event.target == modal) closeModal();
};
