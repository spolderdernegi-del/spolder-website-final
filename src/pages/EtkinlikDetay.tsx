import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, MapPin, ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const EtkinlikDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [etkinlik, setEtkinlik] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEtkinlik();
  }, [id]);

  const fetchEtkinlik = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('yayin_durumu', 'yayinlandi')
        .single();
      
      if (error) throw error;
      setEtkinlik(data);
    } catch (error) {
      console.error('Error fetching etkinlik:', error);
      setEtkinlik(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!etkinlik) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Etkinlik Bulunamadı
            </h1>
            <p className="text-muted-foreground mb-8">
              Aradığınız etkinlik bulunamadı veya yayından kaldırılmış olabilir.
            </p>
            <Link to="/etkinlikler">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Etkinlikler Sayfasına Dön
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  etkinlik.durum === "Tamamlandı" 
                    ? "bg-gray-500/20 text-gray-300" 
                    : "bg-secondary text-primary-foreground"
                }`}>
                  {etkinlik.durum}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
                {etkinlik.baslik}
              </h1>
            </div>
          </div>
        </section>

        {/* Event Meta Info */}
        <section className="bg-gradient-to-br from-secondary/10 to-primary/10 py-8">
          <div className="container-custom mx-auto px-4">
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{etkinlik.tarih}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{etkinlik.saat}</span>
              </div>
              {etkinlik.konum && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{etkinlik.konum}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Event Content */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Excerpt */}
                {etkinlik.ozet && (
                  <p className="text-xl text-foreground/80 font-medium mb-8 leading-relaxed">
                    {etkinlik.ozet}
                  </p>
                )}

                {/* Article Content - Fixed HTML rendering */}
                <article className="prose prose-invert max-w-none mb-8">
                  <div 
                    className="text-foreground/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: etkinlik.icerik || '' }}
                  />
                </article>

                <div className="py-8 border-t border-border">
                  <Button onClick={() => navigate('/etkinlikler')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Geri Dön
                  </Button>
                </div>
              </div>

              {/* Sidebar - Event Details */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-secondary/5 border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Etkinlik Detayları
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Tarih</p>
                          <p className="text-muted-foreground">{etkinlik.tarih}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Saat</p>
                          <p className="text-muted-foreground">{etkinlik.saat}</p>
                        </div>
                      </div>
                      {etkinlik.konum && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Konum</p>
                            <p className="text-muted-foreground">{etkinlik.konum}</p>
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border">
                        <p className="font-medium text-foreground mb-1">Durum</p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          etkinlik.durum === "Tamamlandı" 
                            ? "bg-gray-500/20 text-gray-300" 
                            : "bg-secondary text-primary-foreground"
                        }`}>
                          {etkinlik.durum}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EtkinlikDetay;
