import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, MapPin, Clock, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: number;
  baslik: string;
  ozet: string;
  icerik?: string;
  tarih: string;
  saat: string;
  konum: string;
  gorsel: string;
  kategori: string;
  kapasite: string;
  kayitli: string;
  durum: string;
}

const eventsDatabase = [
  {
    id: 1,
    title: "Spor ve Gençlik Konferansı 2024",
    excerpt: "Gençlerin spor yoluyla gelişimi üzerine kapsamlı bir konferans.",
    fullContent: "Spor ve Gençlik Konferansı 2024, genç sporcuların gelişimi, eğitim ve kariyer yolları hakkında derinlemesine tartışmaların yapıldığı bir etkinliktir. Konferansımız, spor dünyasının önde gelen isimleri, akademisyenler ve spor politikası uzmanlarını bir araya getirmektedir.\n\nKonferansta şu konular ele alınacaktır:\n- Gençlerin spora katılımını arttırma stratejileri\n- Sporla eğitimin entegrasyonu\n- Spor alanında kariyer fırsatları\n- Uluslararası gençlik spor programları\n\nEtkinliğimize katılmak için kayıt yaptırabilirsiniz. Sınırlı sayıda yer bulunmaktadır.",
    date: "15 Ocak 2025",
    month: "Ocak",
    year: "2025",
    time: "09:30",
    location: "İstanbul Kongre Merkezi, Ana Salon",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    category: "Konferans",
    capacity: "500",
    registered: "387",
    status: "Devam Ediyor",
  },
  {
    id: 2,
    title: "Yerel Yönetimler Spor Forumu",
    excerpt: "Belediyelerin spor politikaları ve bütçe planlaması üzerine eğitim semineri.",
    fullContent: "Yerel Yönetimler Spor Forumu, belediyelerin spor alanında daha etkili kararlar alabilmesi için tasarlanmış bir platformdur. Forumuzdaki oturumlar şu başlıklar etrafında dönecektir:\n\n- Spor tesisi yatırımı ve bakım işletme\n- Toplumsal spor programlarının planlaması\n- Spor camiasıyla işbirliği\n- Uluslararası en iyi uygulamalar\n\nForuma tüm belediye temsilcileri, muhtar ve yerel yönetim çalışanları katılabilir. Katılım tamamen ücretsizdir.",
    date: "22 Ocak 2025",
    month: "Ocak",
    year: "2025",
    time: "10:00",
    location: "Ankara, Kamu Yönetimi Enstitüsü",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&auto=format&fit=crop&q=80",
    category: "Forum",
    capacity: "300",
    registered: "245",
    status: "Açık",
  },
  {
    id: 3,
    title: "Spor Bilimleri Araştırma Atölyesi",
    excerpt: "Spor araştırmalarında metodoloji ve veri analizi tekniklerinin öğretildiği atölye.",
    fullContent: "Spor Bilimleri Araştırma Atölyesi, akademisyen ve araştırmacıların spor alanında daha nitelikli çalışmalar yapabilmesi için tasarlanmıştır. Atölyede aşağıdaki konular uygulamalı olarak anlatılacaktır:\n\n- Spor araştırmalarında araştırma tasarımı\n- Veri toplama teknikleri\n- İstatistiksel analiz\n- Akademik yayın yazma\n- Etik konular\n\nAtölye dört gün sürecek olup, her gün 6 saat çalışma yapılacaktır. Katılımcılara sertifikat verilecektir.",
    date: "3 Şubat 2025",
    month: "Şubat",
    year: "2025",
    time: "09:00",
    location: "İstanbul Üniversitesi, Spor Bilimleri Fakültesi",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop&q=80",
    category: "Atölye",
    capacity: "60",
    registered: "52",
    status: "Açık",
  },
];

const EtkinlikDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [etkinlik, setEtkinlik] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', parseInt(id || "0"))
          .eq('yayin_durumu', 'yayinlandi')
          .single();
        
        if (error) throw error;
        setEtkinlik(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEtkinlik(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (!etkinlik) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Etkinlik Bulunamadı</h1>
            <Link to="/etkinlikler">
              <Button>Etkinlikler Sayfasına Dön</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleRegister = () => {
    // show inline modal (frontend stub). The modal includes a direct link to the original Google Form.
    setShowRegisterModal(true);
  };

  const handleLocationClick = () => {
    setShowMapModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Image */}
        <section className="relative h-96">
          <img
            src={etkinlik.gorsel}
            alt={etkinlik.baslik}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anthracite/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-custom mx-auto">
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-4">
                {etkinlik.kategori}
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
                {etkinlik.baslik}
              </h1>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Event Details Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Tarih</p>
                        <p className="font-semibold text-foreground">{etkinlik.tarih}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Saat</p>
                        <p className="font-semibold text-foreground">{etkinlik.saat}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={handleLocationClick}
                    className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 col-span-2 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Konum</p>
                        <p className="font-semibold text-foreground">{etkinlik.konum}</p>
                        <p className="text-xs text-primary mt-1">Haritada görmek için tıklayın</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                  <div className="bg-white dark:bg-slate-950 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Etkinlik Hakkında</h2>
                    <div className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {etkinlik.icerik}
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium mb-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri Dön
                </button>
              </div>

              {/* Sidebar */}
              <div>
                  {/* Registration Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6 border border-primary/20 mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Katılım</h3>

                  {/* Capacity */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Kapasite
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {etkinlik.kayitli}/{etkinlik.kapasite}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${(parseInt(etkinlik.kayitli) / parseInt(etkinlik.kapasite)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        etkinlik.durum === "Açık"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {etkinlik.durum === "Açık" ? "✓ Kayıtlar Açık" : "⏳ Devam Ediyor"}
                    </span>
                  </div>

                  {/* Register Button */}
                  <Button
                    onClick={handleRegister}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                  >
                    Katıl ve Kayıt Ol
                  </Button>

                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Google Form üzerinden kayıt yaptırılacaktır
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-foreground mb-3">Önemli Bilgiler</h4>
                  <ul className="space-y-2 text-sm text-foreground/70">
                    <li>✓ Katılım tamamen ücretsizdir</li>
                    <li>✓ Sertifikat verilecektir</li>
                    <li>✓ Kahve ve su ikramı</li>
                    <li>✓ Otopark bulunmaktadır</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* Map modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMapModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-4xl z-70 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">{etkinlik.location}</h3>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="w-full h-96 md:h-[500px]">
              <iframe
                title="Etkinlik Konumu"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(etkinlik.location)}&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
      {/* Registration modal (inline) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegisterModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-lg z-70">
            <h3 className="text-xl font-bold mb-2">Etkinliğe Kayıt</h3>
            <p className="text-sm text-muted-foreground mb-4">Kayıt formunu doldurarak etkinliğe başvurabilirsiniz. (Bu bir ön yüz örneğidir.)</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Simple stub behaviour
                setShowRegisterModal(false);
                alert("Kayıt isteğiniz alındı (örnek). Gerçek kayıt akışı için form entegrasyonu gereklidir.");
              }}
            >
              <div className="grid grid-cols-1 gap-3 mb-4">
                <input required name="name" placeholder="Ad Soyad" className="w-full p-2 border rounded" />
                <input required name="email" type="email" placeholder="E-posta" className="w-full p-2 border rounded" />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfFMYRza3z7VlxwQ8H9FHtSx2ghoN1MjXQOtlFRuCAjGD20og/viewform?usp=publish-editor"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Google Form ile devam et
                </a>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2">Vazgeç</button>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Gönder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtkinlikDetay;
