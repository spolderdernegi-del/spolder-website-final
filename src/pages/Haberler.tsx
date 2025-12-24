import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const newsItems = [
  {
    id: 1,
    title: "Spor Ekonomisi Raporu 2024 Yayınlandı",
    excerpt: "Türkiye'nin spor ekonomisine ilişkin kapsamlı raporumuz kamuoyuyla paylaşıldı. Raporda spor sektörünün GSYH'ye katkısı analiz edildi.",
    content: "Türkiye'nin spor ekonomisine ilişkin kapsamlı raporumuz kamuoyuyla paylaşıldı. Raporda spor sektörünün GSYH'ye katkısı, istihdam rakamları ve gelecek projeksiyonları detaylı şekilde analiz edildi. Araştırmamız, spor sektörünün Türkiye ekonomisindeki yerini ve potansiyelini ortaya koyuyor.",
    date: "12 Aralık 2024",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80",
    category: "Araştırma",
    author: "SPOLDER",
  },
  {
    id: 2,
    title: "Yerel Yönetimler ve Spor Forumu Gerçekleşti",
    excerpt: "Belediyelerin spor politikalarını ele aldığımız forum büyük ilgi gördü. 50'den fazla belediye temsilcisi katıldı.",
    content: "Belediyelerin spor politikalarını ele aldığımız forum büyük ilgi gördü. 50'den fazla belediye temsilcisi katıldı. Forumda yerel yönetimlerin spor politikalarındaki rolü, bütçe planlaması ve tesis yönetimi konuları masaya yatırıldı.",
    date: "8 Aralık 2024",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format&fit=crop&q=80",
    category: "Etkinlik",
    author: "SPOLDER",
  },
  {
    id: 3,
    title: "Avrupa Spor Şartı Türkçe'ye Çevrildi",
    excerpt: "Avrupa Konseyi'nin yeni Spor Şartı'nın Türkçe çevirisi derneğimiz tarafından tamamlandı.",
    content: "Avrupa Konseyi'nin yeni Spor Şartı'nın Türkçe çevirisi derneğimiz tarafından tamamlandı. Şart, tüm bireylerin spor yapma hakkını ve sporla ilgili temel ilkeleri içeriyor. Çeviri çalışması, Türkiye'deki spor politikalarının geliştirilmesine katkı sağlayacak.",
    date: "5 Aralık 2024",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80",
    category: "Yayın",
    author: "SPOLDER",
  },
  {
    id: 4,
    title: "Gençlik ve Spor Bakanlığı ile Protokol",
    excerpt: "Bakanlık ile spor politikaları alanında işbirliği protokolü imzalandı.",
    content: "Gençlik ve Spor Bakanlığı ile spor politikaları alanında işbirliği protokolü imzalandı. Protokol kapsamında araştırma projeleri, eğitim programları ve politika önerileri geliştirilecek.",
    date: "1 Aralık 2024",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80",
    category: "Kurumsal",
    author: "SPOLDER",
  },
  {
    id: 5,
    title: "Spor ve Medya Çalıştayı",
    excerpt: "Medya profesyonelleri ve spor yöneticilerinin katıldığı çalıştay başarıyla tamamlandı.",
    content: "Medya profesyonelleri ve spor yöneticilerinin katıldığı çalıştay başarıyla tamamlandı. Çalıştayda sporun medyada temsili, spor gazeteciliğinin geleceği ve dijital medyanın spor üzerindeki etkileri tartışıldı.",
    date: "28 Kasım 2024",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    category: "Etkinlik",
    author: "SPOLDER",
  },
  {
    id: 6,
    title: "Olimpik Hareket ve Türkiye Analizi",
    excerpt: "Türkiye'nin olimpik performansına ilişkin detaylı analiz raporumuz yayınlandı.",
    content: "Türkiye'nin olimpik performansına ilişkin detaylı analiz raporumuz yayınlandı. Raporda Türkiye'nin olimpiyat tarihindeki başarıları, güçlü ve geliştirilmesi gereken alanlar incelendi. Gelecek olimpiyatlar için stratejik öneriler sunuldu.",
    date: "25 Kasım 2024",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
    category: "Araştırma",
    author: "SPOLDER",
  },
  {
    id: 7,
    title: "Kadın Sporcular İçin Mentorluk Programı Başladı",
    excerpt: "Kadın sporcuların kariyer gelişimini destekleyen mentorluk programımız başarıyla başlatıldı.",
    content: "Kadın sporcuların kariyer gelişimini destekleyen mentorluk programımız başarıyla başlatıldı. Program kapsamında başarılı kadın sporcular ve spor yöneticileri, genç sporculara rehberlik edecek.",
    date: "20 Kasım 2024",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
    category: "Program",
    author: "SPOLDER",
  },
  {
    id: 8,
    title: "Sporda Sürdürülebilirlik Zirvesi 2024",
    excerpt: "Yeşil enerji ve çevre dostu spor tesisleri konulu zirve düzenlendi.",
    content: "Yeşil enerji ve çevre dostu spor tesisleri konulu zirve düzenlendi. Zirveye yerli ve yabancı uzmanlar katıldı, en iyi uygulamalar paylaşıldı.",
    date: "15 Kasım 2024",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80",
    category: "Zirve",
    author: "SPOLDER",
  },
  {
    id: 9,
    title: "Engelsiz Spor Tesisleri Projesi Tanıtıldı",
    excerpt: "Engelli bireylerin spora erişimini kolaylaştıran proje hayata geçiyor.",
    content: "Engelli bireylerin spora erişimini kolaylaştıran proje hayata geçiyor. Pilot uygulama 5 ilde başlatıldı.",
    date: "10 Kasım 2024",
    image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&auto=format&fit=crop&q=80",
    category: "Proje",
    author: "SPOLDER",
  },
];

const Haberler = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, newsItems.length));
  };
  
  const visibleNews = newsItems.slice(0, visibleCount);
  const hasMore = visibleCount < newsItems.length;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-green py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Haberler
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              SPOlDER'den en güncel haberler ve gelişmeler
            </p>
          </div>
        </section>

        {/* News Grid */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleNews.map((item) => (
                <Link
                  to={`/haber/${item.id}`}
                  key={item.id}
                  className="bg-card rounded-lg overflow-hidden shadow-card card-hover block"
                >
                  <div className="relative h-52">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      <Button size="sm" className="text-white bg-foreground hover:bg-foreground/80">
                        Devamı
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <Button onClick={loadMore} variant="outline" size="lg">
                  Daha Fazla Haber Yükle
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Haberler;
