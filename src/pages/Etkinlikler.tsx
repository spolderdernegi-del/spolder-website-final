import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: number;
  baslik: string;
  ozet: string;
  icerik: string;
  tarih: string;
  saat: string;
  konum: string;
  gorsel: string;
  durum: string;
  slug?: string;
  created_at: string;
}

const Etkinlikler = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("events")
        .select("*")
        .eq('yayin_durumu', 'yayinlandi')
        .order("tarih", { ascending: true });
      
      if (supabaseError) throw supabaseError;
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etkinlikler yüklenirken hata oluştu");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    
    if (activeFilter === "Tümü") return events;
    
    if (activeFilter === "Devam Eden") {
      return events.filter(event => {
        // Durum kontrolü
        if (event.durum === "Tamamlandı") return false;
        
        // Tarih ve saat kontrolü
        try {
          // Tarih formatı: "2025-12-04", Saat formatı: "14:00"
          const eventDateTime = new Date(`${event.tarih}T${event.saat}:00`);
          return eventDateTime >= now;
        } catch (error) {
          // Eğer tarih/saat parse edilemezse, sadece tarihe bak
          return event.tarih >= now.toISOString().split('T')[0];
        }
      });
    }
    
    if (activeFilter === "Süresi Geçen") {
      return events.filter(event => {
        // Durum kontrolü
        if (event.durum === "Tamamlandı") return true;
        
        // Tarih ve saat kontrolü
        try {
          // Tarih formatı: "2025-12-04", Saat formatı: "14:00"
          const eventDateTime = new Date(`${event.tarih}T${event.saat}:00`);
          return eventDateTime < now;
        } catch (error) {
          // Eğer tarih/saat parse edilemezse, sadece tarihe bak
          return event.tarih < now.toISOString().split('T')[0];
        }
      });
    }
    
    return events;
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const monthNames = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return { day, month, year };
    } catch (error) {
      return { day: dateStr, month: "", year: "" };
    }
  };

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

        {/* Loading State */}
        {loading && (
          <section className="section-padding">
            <div className="container-custom mx-auto flex justify-center items-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Etkinlik bulunamadı</h3>
              <p className="text-muted-foreground">Şu anda gösterilecek bir etkinlik yok.</p>
            </div>
          </section>
        )}

        {/* Filter Buttons */}
        {!loading && events.length > 0 && (
          <section className="py-8">
            <div className="container-custom mx-auto">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant={activeFilter === "Tümü" ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => setActiveFilter("Tümü")}
                >
                  Tümü
                </Button>
                <Button
                  variant={activeFilter === "Devam Eden" ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => setActiveFilter("Devam Eden")}
                >
                  Devam Eden
                </Button>
                <Button
                  variant={activeFilter === "Süresi Geçen" ? "gradient" : "outline"}
                  size="lg"
                  onClick={() => setActiveFilter("Süresi Geçen")}
                >
                  Süresi Geçen
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto">
              <div className="space-y-8">
                {filterEvents().map((event) => {
                  const { day, month, year } = formatEventDate(event.tarih);
                  return (
                <article key={event.id} className="bg-card rounded-lg overflow-hidden shadow-card card-hover relative">
                  {/* Status Badge */}
                  {event.durum && (
                    <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${
                      event.durum === 'Tamamlandı' ? 'bg-slate-700 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {event.durum}
                    </span>
                  )}
                  <div className="flex flex-col md:flex-row">
                    {/* Date Box */}
                    <div className="md:w-32 shrink-0 bg-gradient-green p-6 flex flex-row md:flex-col items-center justify-center text-primary-foreground">
                      <span className="text-4xl font-bold">{day}</span>
                      <span className="text-lg uppercase ml-2 md:ml-0">{month}</span>
                      <span className="text-sm ml-2 md:ml-0 md:mt-1">{year}</span>
                    </div>
                    
                    {/* Image */}
                    <div className="md:w-64 shrink-0">
                      <img src={event.gorsel} alt={event.baslik} className="w-full h-48 md:h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-xl text-foreground mb-2 hover:text-primary transition-colors">
                          <Link to={`/etkinlik/${event.id}`}>{event.baslik}</Link>
                        </h3>
                        <p className="text-muted-foreground mb-4">{event.ozet}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-secondary" />
                            {event.saat}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-secondary" />
                            {event.konum}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link to={`/etkinlik/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Detaylar
                          </Button>
                        </Link>
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSfFMYRza3z7VlxwQ8H9FHtSx2ghoN1MjXQOtlFRuCAjGD20og/viewform?usp=publish-editor"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="turquoise" size="sm">
                            Kayıt Ol
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          </div>
        </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Etkinlikler;
