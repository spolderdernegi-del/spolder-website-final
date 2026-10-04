// Admin paneli kullanım rehberinin içeriği. Sayfa düzeni (Guide.tsx) ile
// içerik ayrı tutuldu: panelde bir şey değiştiğinde sadece bu dosya
// güncellenir. Buradaki her cümle ilgili admin sayfasının koduna göre
// yazıldı; kodda olmayan bir özellik anlatılmamalı.

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "steps"; title?: string; items: string[] }
  | { type: "list"; title?: string; items: string[] }
  | { type: "tip"; text: string }
  | { type: "warn"; title?: string; items: string[] };

export interface GuideSection {
  id: string;
  title: string;
  /** Bu bölümün anlattığı admin sayfasının adresi (varsa "Sayfaya git" düğmesi çıkar). */
  route?: string;
  summary: string;
  blocks: GuideBlock[];
}

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "baslarken",
    title: "Başlarken",
    route: "/admin/login",
    summary: "Panele giriş, çıkış ve her sayfada geçerli genel kurallar.",
    blocks: [
      {
        type: "p",
        text: "Bu panel; haber, etkinlik, proje, blog, yayın dosyaları, yönetim kurulu ve iletişim bilgileri gibi sitedeki her şeyi kod yazmadan yönettiğiniz yerdir. Panelde yaptığınız değişiklikler kaydedildiği anda siteye yansır (tarayıcıda görmek için sayfayı yenilemek gerekebilir).",
      },
      {
        type: "steps",
        title: "Giriş yapma",
        items: [
          "Tarayıcıda spolder.org/admin/login adresini açın.",
          "\"E-posta\" ve \"Şifre\" alanlarını doldurun (göz simgesi şifreyi gösterir/gizler).",
          "\"Giriş Yap\" düğmesine basın. Başarılıysa Kontrol Paneli açılır.",
          "İşiniz bitince sağ üstteki \"Çıkış Yap\" düğmesini kullanın.",
        ],
      },
      {
        type: "list",
        title: "Her sayfada geçerli kurallar",
        items: [
          "Oturum 8 saat sürer; sonra yeniden giriş yapmanız istenir.",
          "Kısa sürede çok fazla yanlış giriş denerseniz (15 dakikada 20 deneme) sistem sizi bir süre bekletir.",
          "\"Şifremi unuttum\" bağlantısı yoktur. Şifrenizi unutursanız sistem yöneticisinden sıfırlamasını isteyin.",
          "Sol üstteki \"Geri\" düğmesi (Medya Kütüphanesi'nde \"Dashboard'a Dön\") Kontrol Paneli'ne döndürür.",
          "Silme işlemleri geri alınamaz. Her silmeden önce onay sorulur ama çöp kutusu yoktur.",
          "Yeni oluşturduğunuz haber, etkinlik, proje ve blog kayıtları \"Taslak\" olarak başlar. Sitede görünmesi için \"Yayınla\" yapmanız gerekir.",
        ],
      },
    ],
  },
  {
    id: "kontrol-paneli",
    title: "Kontrol Paneli",
    route: "/admin",
    summary: "Giriş yaptıktan sonra açılan ana ekran.",
    blocks: [
      {
        type: "list",
        title: "Neler var?",
        items: [
          "Kartlar: Etkinlikler, Haberler, Blog, Projeler, Dosyalar, Kategoriler, Medya Kütüphanesi, Yönetim Kurulu, Hoş Geldiniz Pop-up, Gelen Mesajlar, Ayarlar ve Kullanım Rehberi. Karta tıklayınca ilgili yönetim sayfası açılır.",
          "\"Gelen Mesajlar\" kartında okunmamış mesaj sayısı kırmızı rozetle görünür.",
          "Üstteki sayaçlar: Toplam Etkinlik, Toplam Haber, Toplam Proje. Bu sayılara taslaklar da dahildir.",
          "\"Son Eklenen İçerikler\" altında son 5 etkinlik ve son 5 haber listelenir; \"Tümü\" düğmesi ilgili yönetim sayfasına götürür.",
        ],
      },
    ],
  },
  {
    id: "icerik-ortak",
    title: "Haber, Etkinlik, Proje ve Blog: ortak kullanım",
    summary: "Dört içerik türünün listelerinde ve formlarında aynı şekilde çalışan özellikler.",
    blocks: [
      {
        type: "list",
        title: "Liste ekranı",
        items: [
          "Her kayıtta görsel, başlık, \"Taslak\" veya \"Yayında\" rozeti, kategoriler ve tarih görünür.",
          "Üstteki arama kutusu (örn. \"Haber ara...\") başlık ve özette arar. \"Tüm Kategoriler\" menüsüyle kategoriye göre süzebilirsiniz.",
          "Kaydın sağındaki 👁️ / 📝 düğmesi yayın durumunu tek tıkla değiştirir (Taslağa Al / Yayınla). Ayrıca Kaydet'e basmak gerekmez.",
          "Kalem simgesi kaydı düzenler, çöp kutusu siler.",
          "Soldaki kutucukları işaretleyince \"Seçilenleri Sil (n)\" ve \"Seçimi Temizle\" belirir; birden çok kaydı birlikte silebilirsiniz.",
        ],
      },
      {
        type: "list",
        title: "Formda ortak alanlar",
        items: [
          "Başlık (zorunlu): boş bırakırsanız \"Başlık alanı zorunludur!\" uyarısı çıkar.",
          "Kategoriler (zorunlu): en az bir kategori seçmelisiniz. Birden fazla seçebilirsiniz; ilk seçtiğiniz ana kategori olur. Listede kategori yoksa \"Kategori Yönet\" bağlantısından önce kategori oluşturun.",
          "Görsel (zorunlu): Medya Kütüphanesi'nden seçin, bilgisayardan yükleyin veya link yapıştırın. Ayrıntılar için \"Görsel ekleme ve kırpma\" bölümüne bakın.",
          "İçerik: formda yalnızca kısa bir önizleme görünür. Yazmak için \"Tam Sayfa Düzenle (Word gibi)\" düğmesini kullanın.",
          "SEO Ayarları (opsiyonel): URL Slug, Meta Başlık (en fazla 60 karakter), Meta Açıklama (en fazla 160 karakter). Boş bırakabilirsiniz.",
          "Yayın Durumu: \"Taslak\" veya \"Yayınla\".",
          "\"Ana Sayfada Slider'da Göster\" kutusu: işaretlenirse kayıt ana sayfadaki büyük slider'a girer (bkz. \"Ana sayfa slider'ı\").",
        ],
      },
      {
        type: "tip",
        text: "Bir kaydı sitede göstermek için iki şey gerekir: Yayın Durumu \"Yayınla\" olmalı ve Kaydet'e basılmalı. Kaydettiniz ama sitede görünmüyorsa önce kaydın rozetinin \"Yayında\" olduğundan emin olun.",
      },
    ],
  },
  {
    id: "haberler",
    title: "Haberler",
    route: "/admin/news",
    summary: "Haber ekleme, düzenleme ve yayınlama.",
    blocks: [
      {
        type: "steps",
        title: "Yeni haber ekleme",
        items: [
          "Kontrol Paneli'nde \"Haberler\" kartına, ardından \"Yeni Haber\" düğmesine tıklayın.",
          "Başlığı yazın ve en az bir kategori seçin. Yazar ve Tarih alanlarını doldurun (Yazar boşsa sitede \"SPOLDER\" görünür).",
          "Görseli ekleyin (16:9 oranı önerilir).",
          "\"Tam Sayfa Düzenle (Word gibi)\" ile haberin metnini yazın veya Word dosyasından aktarın; bitince \"İçeriği Aktar ve Geri Dön\" deyin.",
          "İsterseniz kısa bir Özet yazın. Bu metin haber kartlarında ve sosyal medya paylaşımlarında görünür.",
          "Yayın Durumu'nu \"Yayınla\" yapıp \"Kaydet\" düğmesine basın.",
        ],
      },
      {
        type: "list",
        title: "Sitede nasıl görünür?",
        items: [
          "Yalnızca \"Yayında\" haberler Haberler sayfasında görünür; en yeni tarihli en üstte durur.",
          "Sayfada ilk 6 haber çıkar, \"Daha Fazla Haber Yükle\" her tıklamada 3 haber daha açar.",
          "Ziyaretçiler \"Filtrele\" menüsünden kategoriye göre süzebilir. Kategori rozetleri, Kategoriler sayfasında seçtiğiniz renkte görünür.",
          "Haber detay sayfasında yazar, tarih ve tam içerik yer alır. Yan tarafta en yeni 3 haber \"İlgili Haberler\" olarak gösterilir.",
        ],
      },
      {
        type: "warn",
        title: "Dikkat",
        items: [
          "\"Tam Sayfa Düzenle\"den dönünce içerik yalnızca forma aktarılır. Kalıcı olması için formdaki asıl \"Kaydet\" düğmesine de basmalısınız.",
          "Silinen haber geri getirilemez.",
        ],
      },
    ],
  },
  {
    id: "etkinlikler",
    title: "Etkinlikler",
    route: "/admin/events",
    summary: "Etkinlik ekleme; tarih, saat, konum, kapasite ve durum bilgileri.",
    blocks: [
      {
        type: "steps",
        title: "Yeni etkinlik ekleme",
        items: [
          "Kontrol Paneli'nde \"Etkinlikler\" kartına, ardından \"Yeni Etkinlik\" düğmesine tıklayın.",
          "Başlık, kategori ve görseli girin.",
          "Tarih ve Saat alanlarını doldurun.",
          "Konum için iki yol vardır: \"Manuel Giriş\" ile yazılı konum adını girin veya \"Haritadan Seç\" ile haritaya tıklayın / işaretçiyi sürükleyin.",
          "İsterseniz Kapasite, Kayıtlı sayısı ve Durum (Açık, Devam Ediyor, Tamamlandı) alanlarını doldurun.",
          "Özet ve içeriği girin, Yayın Durumu'nu \"Yayınla\" yapıp \"Kaydet\" deyin.",
        ],
      },
      {
        type: "list",
        title: "Sitede nasıl görünür?",
        items: [
          "Yalnızca \"Yayında\" etkinlikler Etkinlikler sayfasında listelenir. Her kartta tarih kutusu, görsel, kategori, başlık, özet, saat, konum, durum rozeti, \"Detaylar\" ve \"Kayıt Ol\" düğmeleri bulunur.",
          "Ziyaretçiler \"Filtrele\" menüsünden \"Devam Eden\", \"Süresi Geçen\" ve kategorilere göre süzebilir. \"Devam Eden / Süresi Geçen\" ayrımı, etkinliğin Durum alanına ve tarih-saatine bakar.",
        ],
      },
      {
        type: "warn",
        title: "Bilmeniz gerekenler",
        items: [
          "Yönetim listesindeki \"Tüm Durumlar / Taslak / Yayınlanmış\" menüsü şu an etkinliklerde doğru çalışmıyor (Taslak veya Yayınlanmış seçince liste boş görünür). \"Tüm Durumlar\"da bırakın; hangisinin taslak olduğunu kayıttaki rozetten anlayabilirsiniz.",
          "Formdaki \"Google Form Kayıt Linki\" alanı kaydedilir ama sitedeki \"Kayıt Ol\" butonunu şu an değiştirmez; buton sabit bir kayıt formuna gider.",
          "Kapasite ve Kayıtlı sayısı sitede gösterilmez.",
          "Haritadan seçilen koordinatlar sitede harita olarak gösterilmez; ziyaretçiler yazdığınız konum adını görür. Bu yüzden konum adını mutlaka yazın.",
          "Formda \"İçerik\" bölümü iki kez görünür; ikisi de aynı içeriği düzenler, birini kullanmanız yeterli.",
        ],
      },
    ],
  },
  {
    id: "projeler",
    title: "Projeler",
    route: "/admin/projects",
    summary: "Proje ekleme; durum ve tarihler.",
    blocks: [
      {
        type: "steps",
        title: "Yeni proje ekleme",
        items: [
          "Kontrol Paneli'nde \"Projeler\" kartına, ardından \"Yeni Proje\" düğmesine tıklayın.",
          "Başlığı yazın, kategorileri seçin, görseli ekleyin.",
          "İsterseniz Başlangıç ve Bitiş Tarihi'ni girin.",
          "Durum olarak \"Planlanıyor\", \"Devam Ediyor\" veya \"Tamamlandı\" seçin. Bu bilgi proje kartında rozet olarak görünür.",
          "\"Detaylı İçerik\" için \"Tam Sayfa Düzenle (Word gibi)\" düğmesini kullanın.",
          "Yayın Durumu'nu \"Yayınla\" yapıp \"Kaydet\" deyin.",
        ],
      },
      {
        type: "list",
        title: "Sitede nasıl görünür?",
        items: [
          "Yalnızca \"Yayında\" projeler Projeler sayfasında görünür; başlangıç tarihine göre yeniden eskiye sıralanır.",
          "Ziyaretçiler \"Filtrele\" menüsünden kategoriye göre süzebilir.",
        ],
      },
      {
        type: "warn",
        title: "Bilmeniz gerekenler",
        items: [
          "Proje formunda, liste kartında görünen kısa açıklama için ayrı bir alan şu an yok; proje detayını \"Detaylı İçerik\" ile yazarsınız.",
          "Proje detay sayfasında kategorilerden yalnızca ilki gösterilir; liste sayfasında hepsi görünür.",
        ],
      },
    ],
  },
  {
    id: "blog",
    title: "Blog",
    route: "/admin/blog",
    summary: "Blog yazısı ekleme.",
    blocks: [
      {
        type: "steps",
        title: "Yeni blog yazısı ekleme",
        items: [
          "Kontrol Paneli'nde \"Blog\" kartına, ardından \"Yeni Blog Yazısı\" düğmesine tıklayın.",
          "Başlık, kategoriler, Yazar (varsayılan \"SPOLDER\") ve Tarih'i girin. Sitedeki sıralama bu tarihe göredir.",
          "\"Kapak Görseli\" ekleyin.",
          "\"Tam Sayfa Düzenle (Word gibi)\" ile yazıyı hazırlayın.",
          "Yayın Durumu'nu \"Yayınla\" yapıp \"Kaydet\" deyin.",
        ],
      },
      {
        type: "list",
        title: "Sitede nasıl görünür?",
        items: [
          "Yalnızca \"Yayında\" yazılar Blog sayfasında görünür. Tüm yazılar aynı kart düzeniyle listelenir ve ziyaretçiler \"Filtrele\" ile kategoriye göre süzebilir.",
        ],
      },
      {
        type: "warn",
        title: "Bilmeniz gerekenler",
        items: [
          "Blog formunda, kartlarda görünen kısa özet için ayrı bir alan şu an yok.",
          "Formda \"İçerik\" bölümü iki kez görünür; ikisi de aynı içeriği düzenler.",
        ],
      },
    ],
  },
  {
    id: "dosyalar",
    title: "Dosyalar (Yayınlar)",
    route: "/admin/files",
    summary: "Rapor, araştırma, politika belgesi gibi indirilebilir dosyalar. Sitedeki adı \"Yayınlar\".",
    blocks: [
      {
        type: "steps",
        title: "Yeni dosya ekleme",
        items: [
          "Kontrol Paneli'nde \"Dosyalar\" kartına, ardından \"Yeni Dosya\" düğmesine tıklayın.",
          "Başlığı yazın ve en az bir kategori seçin (Rapor, Araştırma, Politika Belgesi, Bültenler veya sizin eklediğiniz dosya kategorileri).",
          "Dosyayı seçin. İsterseniz kısa bir Açıklama yazın.",
          "\"Kaydet\" düğmesine basın.",
        ],
      },
      {
        type: "list",
        title: "Bilgiler",
        items: [
          "Kabul edilen dosya türleri: PDF, Word (DOC/DOCX), Excel (XLS/XLSX), PowerPoint (PPT/PPTX) ve görseller (PNG, JPG, WEBP, GIF). En büyük dosya boyutu 15 MB'tır.",
          "Düzenlerken yeni dosya seçmezseniz eski dosya korunur; seçerseniz yenisiyle değişir.",
          "Listede arama kutusu, kategori süzgeci, toplu silme ve dosyayı yeni sekmede açan indirme simgesi bulunur.",
          "Sitedeki Yayınlar sayfasında dosyalar kategoriye göre süzülebilir; kartta başlık, kategori, dosya türü, boyut ve açıklama görünür.",
        ],
      },
      {
        type: "warn",
        items: [
          "Dosyalarda taslak/yayın ayrımı yoktur: kaydettiğiniz anda sitede yayındadır.",
          "TXT ve SVG dosyaları kabul edilmez.",
        ],
      },
    ],
  },
  {
    id: "kategoriler",
    title: "Kategoriler",
    route: "/admin/categories",
    summary: "İçerikleri gruplandıran etiketler ve sitedeki renkleri.",
    blocks: [
      {
        type: "steps",
        title: "Yeni kategori ekleme",
        items: [
          "Kontrol Paneli'nde \"Kategoriler\" kartına, ardından \"Yeni Kategori\" düğmesine tıklayın.",
          "\"Kategori Adı\" yazın.",
          "\"İçerik Türü\" seçin: Etkinlikler, Haberler, Blog, Projeler veya Dosyalar. Kategori yalnızca seçtiğiniz türdeki içeriklerde listelenir.",
          "İsterseniz rengi seçin (varsayılan mavidir). Bu renk sitede kategori rozetlerinde ve filtre listesinde kullanılır.",
          "Kaydedin. Kategori artık ilgili içerik formlarında seçilebilir.",
        ],
      },
      {
        type: "list",
        title: "Bilgiler",
        items: [
          "\"Sabit\" etiketli kategoriler (Rapor, Araştırma, Politika Belgesi, Bültenler) düzenlenemez ve silinemez.",
          "Sitenin altındaki \"Faaliyetlerimiz\" bağlantıları kategori adlarını kullanır; adlar birebir aynı olmalıdır.",
        ],
      },
      {
        type: "warn",
        title: "Önemli",
        items: [
          "Bir kategoriyi yeniden adlandırırsanız eski içeriklerdeki kategori adı otomatik değişmez. Eski içerikler eski adı taşımaya devam eder ve yeni rengi almaz. İçerikleri açıp yeni kategoriyi seçerek kaydetmeniz gerekir. Mümkünse kategori adını sonradan değiştirmeyin.",
          "Bir kategoriyi silerseniz içerikler silinmez; ama içerikler eski kategori adını taşımaya devam eder ve rengi kaybolur.",
          "Düzenlerken \"İçerik Türü\"nü değiştirmeniz önerilmez; mevcut içerikler bundan etkilenmez.",
        ],
      },
    ],
  },
  {
    id: "yonetim-kurulu",
    title: "Yönetim Kurulu",
    route: "/admin/board",
    summary: "Hakkımızda sayfasında görünen kurul üyeleri.",
    blocks: [
      {
        type: "steps",
        title: "Üye ekleme",
        items: [
          "Kontrol Paneli'nde \"Yönetim Kurulu\" kartına, ardından \"Yeni Üye Ekle\" düğmesine tıklayın.",
          "Açılan pencerede Ad Soyad, Görev, Biyografi, Fotoğraf ve Sıra alanlarının hepsini doldurun (hepsi zorunludur). Fotoğraf kare (1:1) kırpılır.",
          "Sıra küçük sayıdan büyüğe dizilir; 1 en başta görünür.",
          "\"Ekle\" düğmesine basın. Mevcut bir üyeyi kalem simgesiyle düzenleyebilirsiniz (\"Güncelle\").",
        ],
      },
      {
        type: "list",
        title: "Sitede nasıl görünür?",
        items: [
          "Üyeler Hakkımızda sayfasındaki \"Yönetim Kurulu\" bölümünde Sıra numarasına göre dizilir. Kartta fotoğraf, ad ve görev görünür; karta tıklayınca biyografi açılır.",
        ],
      },
      {
        type: "warn",
        items: [
          "Görevi tam olarak \"Başkan\" olan üye silinemez, sadece düzenlenebilir. Görevi başka bir şeye çevirirseniz silinebilir hâle gelir.",
          "Tablo ilk kez boşsa panel örnek bir Başkan kaydı ekleyebilir; bu kaydı gerçek bilgilerle düzenleyin.",
          "Aynı Sıra numarasını birden fazla üyeye verebilirsiniz; bu durumda aralarındaki sıra belirsiz olur, her üyeye farklı numara verin.",
        ],
      },
    ],
  },
  {
    id: "medya",
    title: "Medya Kütüphanesi",
    route: "/admin/media",
    summary: "Siteye yüklenen tüm görsellerin listesi.",
    blocks: [
      {
        type: "list",
        title: "Ne gösterir?",
        items: [
          "Sunucuya yüklenmiş tüm görseller (PNG, JPG, WEBP, GIF vb.), hangi içeriğe bağlı olursa olsun, hiç kullanılmayanlar dahil.",
          "Haber, etkinlik, blog ve proje kapak görselleri. Aynı dosya birden çok yerde kullanılıyorsa tek kayıt olarak görünür.",
          "Her kartta tür etiketi (Etkinlik, Haber, Blog, Proje, Yüklenen), başlık, tarih ve dosya boyutu yazar. En yeni üstte durur.",
        ],
      },
      {
        type: "list",
        title: "Neler yapabilirsiniz?",
        items: [
          "\"Görsel ara...\" kutusuyla başlığa göre arama.",
          "Üstteki düğmelerle süzme: Tümü, Etkinlikler, Haberler, Blog, Projeler, Yüklenenler.",
          "Görselin üzerine gelince çıkan simgelerle görseli yeni sekmede açma veya indirme.",
          "Bu listedeki görselleri, içerik formlarında ve editörde \"Medya Kütüphanesinden Seç\" ile yeniden kullanabilirsiniz.",
        ],
      },
      {
        type: "warn",
        title: "Yapamayacağınız şeyler",
        items: [
          "Bu sayfadan görsel yükleyemez, silemez veya yeniden adlandıramazsınız. Yükleme, görselin kullanıldığı formlardan yapılır.",
          "PDF, Word gibi belgeler burada görünmez; onlar \"Dosyalar\" sayfasındadır.",
          "Bir haberi silseniz bile görseli sunucuda kalır ve \"Yüklenenler\" altında görünmeye devam eder.",
        ],
      },
    ],
  },
  {
    id: "gorsel-ekleme",
    title: "Görsel ekleme ve kırpma",
    summary: "Form görsel alanlarında ve içerik editöründe görsel eklemenin yolları.",
    blocks: [
      {
        type: "list",
        title: "Formlardaki görsel alanı (Görsel, Kapak Görseli, Fotoğraf, Slider Görseli)",
        items: [
          "\"Medya Kütüphanesinden Seç\": daha önce yüklenmiş bir görseli arayıp tıklayarak seçersiniz. Aynı fotoğrafı tekrar yüklemekten kaçınmak için en iyi yoldur.",
          "\"Bilgisayardan Yükle\": bilgisayarınızdan bir görsel seçersiniz; anında sunucuya yüklenir.",
          "\"görsel bağlantısı (link) yapıştırın\": başka bir adresteki görselin linkini yapıştırırsınız.",
          "\"Kırp\" düğmesi (görsel seçiliyse çıkar): görseli kırpar ve yeni dosya olarak kaydeder. Oran sabittir (içerik görsellerinde 16:9, Yönetim Kurulu fotoğrafında 1:1).",
        ],
      },
      {
        type: "list",
        title: "Sınırlar",
        items: [
          "Kabul edilen türler: PNG, JPG, WEBP, GIF. Dosya başına en fazla 15 MB.",
          "Başka bir siteden link ile eklenen görsel kırpılamayabilir; önce kendi bilgisayarınızdan yükleyin.",
          "Kırpılan görsel JPEG olarak kaydedilir; en uzun kenarı en fazla 2400 piksel olur.",
        ],
      },
      {
        type: "tip",
        text: "Önerilen görsel boyutu: 1920×1080 piksel (16:9). Aynı görsel slider'da, kartlarda ve paylaşım önizlemesinde farklı kırpılarak kullanılır; önemli kısımları ortada tutun.",
      },
      {
        type: "warn",
        items: [
          "Yükleme başarısız olursa görsel formda geçici olarak kalabilir ve \"Görsel yüklenemedi\" uyarısı çıkar. Kaydetmeden önce görseli yeniden yükleyin.",
        ],
      },
    ],
  },
  {
    id: "editor",
    title: "Tam Sayfa Düzenle (Word gibi) editörü",
    summary: "Haber, etkinlik, proje ve blog metinlerinin yazıldığı geniş editör.",
    blocks: [
      {
        type: "steps",
        title: "Nasıl açılır ve kaydedilir?",
        items: [
          "İlgili formdaki \"İçerik\" bölümünden \"Tam Sayfa Düzenle (Word gibi)\" düğmesine basın.",
          "Metni yazın veya biçimlendirin.",
          "Bitince sağ üstteki \"İçeriği Aktar ve Geri Dön\" düğmesine basın.",
          "Forma döndükten sonra formun altındaki asıl \"Kaydet\" düğmesine mutlaka basın. İçerik ancak o zaman kalıcı olur.",
        ],
      },
      {
        type: "list",
        title: "Araç çubuğu",
        items: [
          "Başlık seviyeleri, kalın, italik, altı çizili, üstü çizili, yazı rengi, arka plan rengi.",
          "Numaralı liste, madde işaretli liste, hizalama, alıntı, bağlantı, görsel ve biçim temizleme.",
          "Üstteki \"Yazı Boyutu (px)\" kutusu: 6 ile 200 arasında bir değer yazın veya ok düğmeleriyle 1'er değiştirin. Metni seçip değiştirirsiniz; seçili metin yoksa sonra yazacağınız metne uygulanır.",
        ],
      },
      {
        type: "steps",
        title: "Word dosyası yükleme",
        items: [
          "\"Word Dosyası Yükle\" düğmesine basın ve bir .docx dosyası seçin (en fazla 15 MB).",
          "Editörde yazı varsa \"mevcut içeriğin TAMAMININ yerini alacak\" uyarısı çıkar; onaylarsanız tüm içerik Word'den gelenle değişir.",
          "Başlıklar, kalın/italik metin ve belgedeki görseller aktarılır; görseller sunucuya kaydedilir.",
        ],
      },
      {
        type: "steps",
        title: "Metne görsel ekleme",
        items: [
          "Görseli koymak istediğiniz yere imleci götürün ve araç çubuğundaki görsel simgesine basın.",
          "Açılan \"Görsel Ekle\" penceresinde bir yol seçin: \"Medya Kütüphanesinden Seç\", \"Bilgisayardan Yükle\" veya \"Link ile Ekle\".",
          "Kütüphane ve bilgisayardan seçilen görsel için kırpma penceresi açılır: istediğiniz alanı seçip \"Kırp ve Kaydet\" diyebilir veya \"Olduğu Gibi Ekle\" ile kırpmadan ekleyebilirsiniz. Kırpma serbest orandadır.",
          "Link ile eklenen görsel kırpılmadan olduğu gibi eklenir.",
          "Metindeki bir görsele tıklarsanız aynı kırpma penceresi açılır ve kırpılan görsel yerine geçer.",
        ],
      },
      {
        type: "list",
        title: "Görseller sitede nasıl görünür?",
        items: [
          "Metindeki görseller sayfada ortalanır ve kırptığınız boyutta gösterilir; sadece sayfadan genişse küçülür.",
        ],
      },
      {
        type: "warn",
        title: "Sınırlar",
        items: [
          "Bilgisayardan eklenen görsel en fazla 3 MB olabilir.",
          "Görsel yüklemesi arka planda birkaç saniye sürer. Görsel ekledikten hemen sonra \"İçeriği Aktar ve Geri Dön\"e basmayın, kısa bir süre bekleyin.",
          "Editördeki içerik tarayıcı oturumunda taşınır. Sekmeyi kapatırsanız veya adresi doğrudan açarsanız \"Düzenlenecek bir içerik bulunamadı\" uyarısı çıkar; editörü her zaman formdaki düğmeyle açın.",
          "\"Vazgeç\" yaptığınız değişiklikleri atar.",
          "Eski .doc dosyaları kabul edilmez; Word'de \"Farklı Kaydet\" ile .docx yapın.",
        ],
      },
    ],
  },
  {
    id: "slider",
    title: "Ana sayfa slider'ı",
    summary: "Ana sayfadaki büyük, kayan görsel alanı.",
    blocks: [
      {
        type: "steps",
        title: "Bir içeriği slider'a koymak",
        items: [
          "Haber, etkinlik, proje veya blog formunda \"Ana Sayfada Slider'da Göster\" kutusunu işaretleyin.",
          "İsterseniz çıkan \"Slider Görseli (Opsiyonel)\" alanına slider için ayrı bir görsel yükleyin. Boş bırakırsanız ana görsel kullanılır.",
          "Yayın Durumu'nu \"Yayınla\" yapıp kaydedin.",
        ],
      },
      {
        type: "list",
        title: "Kurallar",
        items: [
          "Slider haber, etkinlik, proje ve blogu tarihe göre karışık gösterir; en yeni en başta durur.",
          "Yalnızca hem \"Yayında\" olan hem de slider kutusu işaretli içerikler slider'a girer.",
          "Slider'da başlık yaklaşık 58, özet yaklaşık 110 karakterden sonra \"…\" ile kısaltılır. Tam metin içeriğin kendi detay sayfasında görünür.",
          "Slider görseli kartlarda ve detay sayfalarında kullanılmaz; onlar ana görseli kullanır. Böylece slider için farklı (örneğin logosuz) bir görsel seçebilirsiniz.",
        ],
      },
    ],
  },
  {
    id: "mesajlar",
    title: "Gelen Mesajlar",
    route: "/admin/messages",
    summary: "Sitedeki İletişim formundan gelen mesajlar.",
    blocks: [
      {
        type: "list",
        title: "Neler var?",
        items: [
          "Tabloda Gönderen (ad, e-posta, telefon), Konu, Mesaj, Tarih ve İşlem sütunları bulunur.",
          "Yeni mesajlar mavi nokta ve mavi satırla gösterilir. Sayfayı açtığınızda tüm mesajlar okundu sayılır ve Kontrol Paneli'ndeki kırmızı rozet sıfırlanır.",
          "Bir mesajı \"Sil\" düğmesiyle silebilirsiniz (onay sorulur, geri alınamaz).",
        ],
      },
      {
        type: "warn",
        title: "Yapamayacağınız şeyler",
        items: [
          "Panelden yanıt veremezsiniz. Yanıtlamak için mesajdaki e-posta adresine kendi e-posta programınızdan yazın.",
          "Arama, süzme veya \"okunmadı olarak işaretle\" yoktur.",
        ],
      },
    ],
  },
  {
    id: "popup",
    title: "Hoş Geldiniz Pop-up",
    route: "/admin/welcome-modal",
    summary: "Ana sayfada açılan karşılama penceresinin metinleri.",
    blocks: [
      {
        type: "list",
        items: [
          "Başlık, Açıklama, Özellik 1-3 ve Buton Metni alanlarının hepsi zorunludur; altta canlı önizleme görünür.",
        ],
      },
      {
        type: "warn",
        title: "Şu anki sınırlama",
        items: [
          "Burada yaptığınız değişiklik şu an yalnızca kendi tarayıcınıza kaydedilir; sitenin ziyaretçilerine yansımaz. Ziyaretçiler varsayılan metni görür.",
        ],
      },
    ],
  },
  {
    id: "ayarlar",
    title: "Ayarlar",
    route: "/admin/settings",
    summary: "Şifre, iletişim bilgileri, harita, site altlığı ve diğer genel ayarlar.",
    blocks: [
      {
        type: "steps",
        title: "Şifre değiştirme",
        items: [
          "Kontrol Paneli'nde \"Ayarlar\" kartına tıklayın.",
          "\"Şifre Değiştir\" bölümünde \"Mevcut Şifre\", \"Yeni Şifre\" ve \"Yeni Şifre (Tekrar)\" alanlarını doldurun. Yeni şifre en az 8 karakter olmalı ve iki alan aynı olmalıdır.",
          "\"Şifreyi Güncelle\" düğmesine basın. Başarılıysa \"Şifreniz başarıyla değiştirildi!\" mesajı çıkar.",
        ],
      },
      {
        type: "steps",
        title: "İletişim bilgilerini güncelleme",
        items: [
          "\"İletişim Bilgileri\" bölümünde Telefon, E-posta, Çalışma Düzeni, IBAN (TL) ve IBAN (EUR) alanlarını doldurun. Hiçbiri zorunlu değildir.",
          "\"İletişim Bilgilerini Kaydet\" düğmesine basın.",
          "Bu bilgiler İletişim sayfasında ve sitenin altında görünür.",
        ],
      },
      {
        type: "steps",
        title: "Harita ve kuruluş konumu",
        items: [
          "\"İletişim Haritası\" bölümüne Google Haritalar'dan aldığınız \"Haritayı yerleştir\" adresini (Paylaş > Haritayı yerleştir) yapıştırıp \"Kaydet\" deyin.",
          "\"Kuruluş Konumu\" bölümünde \"Adres Bilgisi\"ni yazın (her satıra bir adres satırı) ve haritada işaretçiyi sürükleyin veya haritaya tıklayın.",
          "\"Konumu Kaydet\" düğmesine basın. İşaretçiyi sürükleyince konum hemen otomatik kaydedilir.",
        ],
      },
      {
        type: "steps",
        title: "Faaliyetlerimiz (site altlığı) listesi",
        items: [
          "\"Faaliyetlerimiz (Site Altlığı)\" bölümünde her satıra bir \"Görünen Başlık\" yazın.",
          "\"Kategoriler (virgülle ayırın)\" alanına o başlığa tıklanınca listelenecek kategorileri yazın. Birden fazla kategori için virgül kullanın, örneğin: Eğitim, Spor.",
          "\"Öğe Ekle\" ile yeni satır ekleyin (en fazla 5), X ile satırı silin.",
          "\"Listeyi Kaydet\" düğmesine basın. Başlığı veya kategorisi boş satırlar kaydedilirken atılır.",
          "Ziyaretçi sitenin altındaki bir öğeye tıklayınca, yalnızca bu kategorilerden en az birine sahip haber, etkinlik, proje ve blog içerikleri listelenir.",
        ],
      },
      {
        type: "tip",
        text: "Kategori adlarını Kategoriler sayfasındaki yazımla aynı yazın. Büyük/küçük harf fark etmez ama harfler eşleşmelidir (örn. \"Eğit\" yazarsanız \"Eğitim\" kategorisi bulunmaz).",
      },
      {
        type: "list",
        title: "Diğer bölümler",
        items: [
          "Aktivite Logu: yaptığınız son işlemleri gösterir (\"Göster/Gizle\").",
          "Sistem Bilgileri: toplam etkinlik, haber, proje ve blog sayıları.",
        ],
      },
      {
        type: "warn",
        title: "Dikkat",
        items: [
          "\"E-posta Adresi Güncelle\" bölümü, giriş yaptığınız e-posta adresini değiştirmez. Giriş e-postasını değiştirmek için sistem yöneticisine başvurun.",
          "\"Veri Yönetimi\" (dışa aktar, içe aktar, tüm verileri temizle) sitenin gerçek içeriğini yedeklemez; yalnızca bu tarayıcıdaki eski verilerle çalışır. Haber, etkinlik, blog ve proje içeriklerinizin yedeği için sistem yöneticisine başvurun. \"Tüm Verileri Temizle\" düğmesine basmayın.",
          "Aktivite Logu yalnızca bu tarayıcıda tutulur, son kayıtları gösterir ve başka bir bilgisayarda görünmez.",
        ],
      },
    ],
  },
  {
    id: "sorun-giderme",
    title: "Sık karşılaşılan durumlar",
    summary: "Bir şey beklediğiniz gibi görünmüyorsa buraya bakın.",
    blocks: [
      {
        type: "list",
        title: "Kaydettim ama sitede görünmüyor",
        items: [
          "Kaydın rozetinin \"Yayında\" olduğunu kontrol edin; \"Taslak\" ise 👁️/📝 düğmesiyle yayınlayın.",
          "Tarayıcıda Ctrl+Shift+R ile sayfayı sert yenileyin.",
          "Ana sayfa slider'ında göstermek istiyorsanız \"Ana Sayfada Slider'da Göster\" kutusunun da işaretli olduğundan emin olun.",
        ],
      },
      {
        type: "list",
        title: "Yazdığım metin kayboldu",
        items: [
          "Tam Sayfa Düzenle'den döndükten sonra formdaki asıl \"Kaydet\" düğmesine basmış olmalısınız.",
          "Editör sekmesini kapattıysanız veya sayfayı yenilediyseniz içerik kaybolabilir.",
        ],
      },
      {
        type: "list",
        title: "Kategori rengi sitede değişmedi",
        items: [
          "Renk, kategori adına göre eşleşir. Kategoriyi yeniden adlandırdıysanız içerikleri açıp yeni kategoriyi seçerek tekrar kaydedin.",
          "Değişiklikten sonra tarayıcıyı sert yenileyin.",
        ],
      },
      {
        type: "list",
        title: "Görsel yüklenmiyor veya kırpılamıyor",
        items: [
          "Dosya PNG, JPG, WEBP veya GIF olmalı ve 15 MB'tan küçük olmalı (editörde bilgisayardan eklenenler için 3 MB).",
          "Link ile eklenen başka siteden görseller kırpılamayabilir; görseli bilgisayarınıza indirip \"Bilgisayardan Yükle\" ile ekleyin.",
        ],
      },
      {
        type: "list",
        title: "Yanlışlıkla sildim",
        items: [
          "Silinen kayıtlar geri getirilemez. Panelde çöp kutusu yoktur; önemli bir şey silindiyse hemen sistem yöneticisine haber verin.",
        ],
      },
    ],
  },
];
