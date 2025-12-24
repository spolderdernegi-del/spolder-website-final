import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Spor ve Gençlik Konferansı 2024",
    description: "Gençlerin spor yoluyla gelişimi üzerine kapsamlı bir konferans.",
    content: "Gençlerin spor yoluyla gelişimi üzerine kapsamlı bir konferans. Eğitim, sağlık ve sosyal gelişim konularında uzmanlar bir araya geliyor. Konferansta gençlik ve spor politikaları, gençlerin spora erişimi ve sporun gençler üzerindeki etkileri tartışılacak.",
    date: "15 Ocak 2025",
    time: "09:30 - 17:00",
    location: "İstanbul Kongre Merkezi, Ana Salon",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
    author: "SPOLDER",
  },
  {
    id: 2,
    title: "Yerel Yönetimler Spor Forumu",
    description: "Belediyelerin spor politikaları ve bütçe planlaması üzerine eğitim semineri.",
    content: "Belediyelerin spor politikaları ve bütçe planlaması üzerine eğitim semineri. Yerel yönetimlerin spor tesisi yönetimi, spor kulüplerinin desteklenmesi ve toplum sporlarının yaygınlaştırılması konuları ele alınacak.",
    date: "22 Ocak 2025",
    time: "10:00 - 16:00",
    location: "Ankara, Kamu Yönetimi Enstitüsü",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
    author: "SPOLDER",
  },
  {
    id: 3,
    title: "Spor Bilimleri Araştırma Atölyesi",
    description: "Spor araştırmalarında metodoloji ve veri analizi tekniklerinin öğretildiği atölye.",
    content: "Spor araştırmalarında metodoloji ve veri analizi tekniklerinin öğretildiği atölye. Akademisyenler ve araştırmacılar için tasarlanan programda nicel ve nitel araştırma yöntemleri, veri toplama ve analiz teknikleri uygulamalı olarak öğretilecek.",
    date: "3 Şubat 2025",
    time: "09:00 - 15:00",
    location: "İstanbul Üniversitesi, Spor Bilimleri Fakültesi",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80",
    status: "upcoming",
    author: "SPOLDER",
  },
];

const Etkinlikler = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-blue py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Etkinlikler
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Yaklaşan etkinliklerimize katılın
            </p>
          </div>
        </section>

        {/* Events Grid */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="space-y-8">
              {events.map((event) => (
                <article key={event.id} className="bg-card rounded-lg overflow-hidden shadow-card card-hover">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Box */}
                    <div className="md:w-32 shrink-0 bg-gradient-green p-6 flex flex-row md:flex-col items-center justify-center text-primary-foreground">
                      <span className="text-4xl font-bold">{event.date}</span>
                      <span className="text-lg uppercase ml-2 md:ml-0">{event.month}</span>
                      <span className="text-sm ml-2 md:ml-0 md:mt-1">{event.year}</span>
                    </div>
                    
                    {/* Image */}
                    <div className="md:w-64 shrink-0">
                      <img src={event.image} alt={event.title} className="w-full h-48 md:h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-xl text-foreground mb-2 hover:text-primary transition-colors">
                          <Link to={`/etkinlik/${event.id}`}>{event.title}</Link>
                        </h3>
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-secondary" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-secondary" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link to={`/etkinlik/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Detaylar <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSfFMYRza3z7VlxwQ8H9FHtSx2ghoN1MjXQOtlFRuCAjGD20og/viewform?usp=publish-editor"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="turquoise" size="sm">
                            Kayıt Ol <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Etkinlikler;
