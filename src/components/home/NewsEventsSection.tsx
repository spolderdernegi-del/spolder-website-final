import { useEffect, useState } from "react";
import { Calendar, ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  id: number;
  baslik: string;
  ozet: string;
  gorsel: string;
  tarih: string;
  kategori: string;
  image?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  date?: string;
}

interface EventItem {
  id: number;
  baslik: string;
  tarih: string;
  konum: string;
}

const NewsEventsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [{ data: newsData }, { data: eventData }] = await Promise.all([
          supabase
            .from('news')
            .select('id, baslik, ozet, gorsel, tarih, kategori')
            .eq('yayin_durumu', 'yayinlandi')
            .order('created_at', { ascending: false })
            .limit(4),
          supabase
            .from('events')
            .select('id, baslik, tarih, konum')
            .eq('yayin_durumu', 'yayinlandi')
            .order('created_at', { ascending: false })
            .limit(4),
        ]);

        setNews(newsData || []);
        setEvents(eventData || []);
      } catch (error) {
        console.error('Error loading news/events', error);
        setNews([]);
        setEvents([]);
      }
    };

    fetchContent();
  }, []);

  const announcements = news.slice(0, 4).map((n) => ({
    id: n.id,
    title: n.baslik,
    date: n.tarih,
    link: `/haber/${n.id}`,
  }));

  return (
    <section className="section-padding bg-muted">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Haberler
              </h2>
              <Link to="/haberler">
                <Button variant="ghost" size="sm" className="group">
                  Tümü
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item) => (
                  <Link
                    to={`/haber/${item.id}`}
                    key={item.id}
                    className="bg-card rounded-lg overflow-hidden shadow-card card-hover block"
                  >
                    <div className="relative h-48">
                      {item.gorsel && (
                        <img
                          src={item.gorsel}
                          alt={item.baslik}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        {item.kategori}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {item.baslik}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {item.ozet}
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{item.tarih}</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Events & Announcements Column */}
          <div className="space-y-8">
            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Etkinlikler
                </h2>
                <Link to="/etkinlikler">
                  <Button variant="ghost" size="sm">
                    Tümü
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/etkinlik/${event.id}`}
                    className="flex gap-4 bg-card rounded-lg p-4 shadow-soft card-hover"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-green flex flex-col items-center justify-center text-primary-foreground shrink-0">
                      <span className="text-xl font-bold">{new Date(event.tarih).getDate()}</span>
                      <span className="text-xs uppercase">{new Date(event.tarih).toLocaleString('tr-TR', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors">
                        {event.baslik}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1">
                        📍 {event.konum}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Duyurular
                </h2>
              </div>

              <div className="bg-card rounded-lg shadow-soft overflow-hidden">
                {announcements.map((item, index) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                      index !== announcements.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <Bell className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground text-sm hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1">{item.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsEventsSection;
