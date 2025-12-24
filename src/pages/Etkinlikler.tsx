import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Clock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: number;
  title: string;
  description: string;
  content: string;
  date: string;
  time: string;
  location: string;
  image: string;
  status: string;
  author: string;
  created_at: string;
}

const Etkinlikler = () => {
  const [events, setEvents] = useState<Event[]>([]);
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
        .order("date", { ascending: true });
      
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

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto">
              <div className="space-y-8">
                {events.map((event) => (
                <article key={event.id} className="bg-card rounded-lg overflow-hidden shadow-card card-hover">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Box */}
                    <div className="md:w-32 shrink-0 bg-gradient-green p-6 flex flex-row md:flex-col items-center justify-center text-primary-foreground">
                      <span className="text-4xl font-bold">{event.date}</span>
                      <span className="text-lg uppercase ml-2 md:ml-0">TEM</span>
                      <span className="text-sm ml-2 md:ml-0 md:mt-1">2025</span>
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
              ))}
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
