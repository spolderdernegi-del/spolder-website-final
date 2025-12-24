import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, MapPin, Clock, ArrowLeft, Users, Loader } from "lucide-react";
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
  google_form_link?: string;
}

const EtkinlikDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [etkinlik, setEtkinlik] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', parseInt(id || "0"))
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

  const handleLocationClick = () => {
    setShowMapModal(true);
  };

  // Loading state
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

  // Not found state
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
                  {etkinlik.google_form_link ? (
                    <a
                      href={etkinlik.google_form_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                        Katıl ve Kayıt Ol
                      </Button>
                    </a>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-gray-400 text-white font-semibold py-6 cursor-not-allowed"
                    >
                      Kayıt Linki Eklenmemiş
                    </Button>
                  )}

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
    </div>
  );
};

export default EtkinlikDetay;
