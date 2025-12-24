import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideEvent {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  showInSlider?: boolean;
}

const defaultSlides = [
  {
    id: 1,
    title: "Spor Ekonomisi Raporu 2024 Yayınlandı",
    excerpt: "Türkiye'nin spor ekonomisine ilişkin kapsamlı raporumuz kamuoyuyla paylaşıldı. Raporda spor sektörünün GSYH'ye katkısı analiz edildi.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80",
    date: "12 Aralık 2024",
    category: "Araştırma",
    showInSlider: false,
  },
  {
    id: 2,
    title: "Yerel Yönetimler ve Spor Forumu Gerçekleşti",
    excerpt: "Belediyelerin spor politikalarını ele aldığımız forum büyük ilgi gördü. 50'den fazla belediye temsilcisi katıldı.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&auto=format&fit=crop&q=80",
    date: "8 Aralık 2024",
    category: "Etkinlik",
    showInSlider: false,
  },
  {
    id: 3,
    title: "Avrupa Spor Şartı Türkçe'ye Çevrildi",
    excerpt: "Avrupa Konseyi'nin yeni Spor Şartı'nın Türkçe çevirisi derneğimiz tarafından tamamlandı.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&auto=format&fit=crop&q=80",
    date: "5 Aralık 2024",
    category: "Yayın",
    showInSlider: false,
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<SlideEvent[]>([]);

  useEffect(() => {
    // localStorage'dan etkinlikleri yükle ve filtreleme yap
    try {
      const storedEvents = localStorage.getItem('spolder_events');
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        const sliderEvents = events.filter((e: SlideEvent) => e.showInSlider === true);
        
        // Admin panelinden slider etkinlikleri varsa kullan
        if (sliderEvents.length > 0) {
          setSlides(sliderEvents);
        } else {
          // Slider etkinliği yoksa boş bırak (empty state gösterilecek)
          setSlides([]);
        }
      } else {
        // localStorage boş ise boş bırak
        setSlides([]);
      }
    } catch (error) {
      console.error("Error loading slider events:", error);
      setSlides([]);
    }
  }, []);

  useEffect(() => {
    // Slider otomatik döngüsü
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-gray-900">
      {/* Empty State */}
      {slides.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Slider Boş</h2>
            <p className="text-gray-300 text-lg">Admin panelinden etkinlik oluşturup "Show in Slider" seçeneğini işaretleyin.</p>
          </div>
        </div>
      )}

      {/* Background Slides */}
      {slides.length > 0 && slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-anthracite/90 via-anthracite/60 to-transparent" />
        </div>
      ))}

      {/* Content */}
      {slides.length > 0 && (
        <div className="relative h-full container-custom mx-auto px-4 md:px-8 flex items-center">
          <div className="max-w-2xl space-y-6 animate-fade-up">
            {/* Category Badge */}
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {slides[currentSlide].category}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {slides[currentSlide].title}
            </h1>

            {/* Description */}
            <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-xl">
              {slides[currentSlide].excerpt}
            </p>

            {/* Date */}
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{slides[currentSlide].date}</span>
            </div>

            {/* CTA */}
            <div className="flex gap-4 pt-4">
              <Link to={`/haber/${slides[currentSlide].id}`}>
                <Button variant="hero" size="lg">
                  Devamını Oku
                </Button>
              </Link>
              <Link to="/haberler">
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Tüm Haberler
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 0 && (
        <div className="absolute bottom-8 right-8 flex gap-3">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-primary transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {slides.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
