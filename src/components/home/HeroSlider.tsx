import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SlideItem {
  id: number;
  baslik: string;
  ozet: string;
  gorsel: string;
  tarih: string;
  kategori: string;
  sliderda_goster?: boolean;
  contentType: 'event' | 'news' | 'project';
  link: string;
}

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase'den tüm slider içeriklerini yükle (events, news, projects)
    const fetchSliderContent = async () => {
      try {
        const allSlides: SlideItem[] = [];

        // Etkinlikler
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, baslik, ozet, gorsel, tarih, kategori, sliderda_goster')
          .eq('sliderda_goster', true)
          .eq('yayin_durumu', 'yayinlandi')
          .order('created_at', { ascending: false });
        
        if (!eventsError && events) {
          allSlides.push(...events.map(e => ({
            ...e,
            contentType: 'event' as const,
            link: `/etkinlik/${e.id}`
          })));
        }

        // Haberler
        const { data: news, error: newsError } = await supabase
          .from('news')
          .select('id, baslik, ozet, gorsel, tarih, kategori, sliderda_goster')
          .eq('sliderda_goster', true)
          .eq('yayin_durumu', 'yayinlandi')
          .order('created_at', { ascending: false });
        
        if (!newsError && news) {
          allSlides.push(...news.map(n => ({
            ...n,
            contentType: 'news' as const,
            link: `/haber/${n.id}`
          })));
        }

        // Projeler
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, baslik, ozet, gorsel, tarih, kategori, sliderda_goster')
          .eq('sliderda_goster', true)
          .eq('yayin_durumu', 'yayinlandi')
          .order('created_at', { ascending: false });
        
        if (!projectsError && projects) {
          allSlides.push(...projects.map(p => ({
            ...p,
            contentType: 'project' as const,
            link: `/proje/${p.id}`
          })));
        }

        // Tarihe göre sırala (en yeni en başta)
        allSlides.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
        
        setSlides(allSlides);
      } catch (error) {
        console.error("Error loading slider content:", error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderContent();
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
            <p className="text-gray-300 text-lg">Admin panelinden etkinlik, haber veya proje oluşturup "Slider'da Göster" seçeneğini işaretleyin.</p>
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
            style={{ backgroundImage: `url(${slide.gorsel})` }}
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
              {slides[currentSlide].kategori}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {slides[currentSlide].baslik}
            </h1>

            {/* Description */}
            <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-xl">
              {slides[currentSlide].ozet}
            </p>

            {/* Date */}
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{slides[currentSlide].tarih}</span>
            </div>

            {/* CTA */}
            <div className="flex gap-4 pt-4">
              <Link to={slides[currentSlide].link}>
                <Button variant="hero" size="lg">
                  Devamını Oku
                </Button>
              </Link>
              <Link to={
                slides[currentSlide].contentType === 'event' ? '/etkinlikler' :
                slides[currentSlide].contentType === 'news' ? '/haberler' :
                '/projeler'
              }>
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  {slides[currentSlide].contentType === 'event' ? 'Tüm Etkinlikler' :
                   slides[currentSlide].contentType === 'news' ? 'Tüm Haberler' :
                   'Tüm Projeler'}
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
