import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCategoryColors, getCategoryBadgeStyle } from "@/hooks/useCategoryColors";
import { DEFAULT_EVENT_FORM_URL } from "@/lib/constants";
import CategoryFilterBar from "@/components/shared/CategoryFilterBar";

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
  kategori?: string;
  categories?: string[];
  slug?: string;
  google_form_link?: string;
  created_at: string;
}

const Etkinlikler = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryColors = useCategoryColors("events");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("events")
        .select("id, baslik, ozet, tarih, saat, konum, gorsel, durum, kategori, categories, google_form_link, created_at")
        .eq('yayin_durumu', 'yayinlandi')
        .order("tarih", { ascending: false });
      
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

  const getItemCategories = (event: Event) =>
    event.categories && event.categories.length > 0 ? event.categories : event.kategori ? [event.kategori] : [];

  // Etkinlik geçmiş mi? Saat boş/geçersizse gün sonu (23:59) kabul edilir;
  // böylece saatsiz etkinlik iki filtreden de kaybolmaz.
  const isPastEvent = (event: Event, now: Date) => {
    if (event.durum === "Tamamlandı") return true;
    const timeOk = /^\d{1,2}:\d{2}/.test(event.saat || "");
    const time = timeOk ? event.saat.slice(0, 5).padStart(5, "0") : "23:59";
    const dt = new Date(`${(event.tarih || "").slice(0, 10)}T${time}:00`);
    if (isNaN(dt.getTime())) return false;
    return dt < now;
  };

  const filterEvents = () => {
    const now = new Date();

    let result = events;

    if (activeFilter === "Devam Eden") {
      result = result.filter((event) => !isPastEvent(event, now));
    } else if (activeFilter === "Süresi Geçen") {
      result = result.filter((event) => isPastEvent(event, now));
    }

    if (selectedCategory) {
      result = result.filter((event) => getItemCategories(event).includes(selectedCategory));
    }

    return result;
  };

  const availableCategories = Array.from(
    new Set(events.flatMap((event) => getItemCategories(event)))
  ).sort((a, b) => a.localeCompare(b, "tr"));

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

        {/* Filter */}
        {!loading && events.length > 0 && (
          <section className="py-8">
            <div className="container-custom mx-auto">
              <CategoryFilterBar
                categories={availableCategories}
                categoryColors={categoryColors}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                statusOptions={["Devam Eden", "Süresi Geçen"]}
                selectedStatus={activeFilter}
                onSelectStatus={setActiveFilter}
              />
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && error && (
          <section className="section-padding">
            <div className="container-custom mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Etkinlikler yüklenemedi</h3>
              <p className="text-muted-foreground mb-4">Lütfen daha sonra tekrar deneyin.</p>
              <Button variant="outline" onClick={fetchEvents}>Tekrar Dene</Button>
            </div>
          </section>
        )}

        {!loading && !error && (events.length === 0 || filterEvents().length === 0) && (
          <section className="section-padding">
            <div className="container-custom mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Etkinlik bulunamadı</h3>
              <p className="text-muted-foreground">
                {events.length > 0 && (activeFilter || selectedCategory) ? "Bu filtreyle eşleşen bir etkinlik yok." : "Şu anda gösterilecek bir etkinlik yok."}
              </p>
            </div>
          </section>
        )}

        {/* Events Grid */}
        {!loading && filterEvents().length > 0 && (
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
                      <img src={event.gorsel} alt={event.baslik} loading="lazy" decoding="async" className="w-full h-48 md:h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(event.categories && event.categories.length > 0 ? event.categories : event.kategori ? [event.kategori] : []).map((cat, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              style={getCategoryBadgeStyle(categoryColors[cat])}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
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
                        {!isPastEvent(event, new Date()) && (
                          <a
                            href={event.google_form_link || DEFAULT_EVENT_FORM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="turquoise" size="sm">
                              Kayıt Ol
                            </Button>
                          </a>
                        )}
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
