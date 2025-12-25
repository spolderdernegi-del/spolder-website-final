import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface News {
  id: number;
  baslik: string;
  ozet: string;
  icerik: string;
  gorsel: string;
  kategori: string;
  yazar: string;
  tarih: string;
}

const HaberDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [haber, setHaber] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);

  useEffect(() => {
    fetchHaber();
    fetchRelatedNews();
  }, [id]);

  const fetchHaber = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .eq('yayin_durumu', 'yayinlandi')
        .single();
      
      if (error) throw error;
      setHaber(data);
    } catch (error) {
      console.error('Error fetching haber:', error);
      setHaber(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('yayin_durumu', 'yayinlandi')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setRelatedNews(data || []);
    } catch (error) {
      console.error('Error fetching related news:', error);
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

  if (!haber) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Haber Bulunamadı</h1>
            <Link to="/haberler">
              <Button>Haberler Sayfasına Dön</Button>
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
        {/* Hero */}
        <section className="relative h-96 overflow-hidden">
          <img
            src={haber.gorsel}
            alt={haber.baslik}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-anthracite/90 via-anthracite/70 to-transparent" />
          <div className="relative container-custom mx-auto px-4 md:px-8 h-full flex flex-col justify-end pb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium mb-4 w-fit">
              {haber.kategori}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
              {haber.baslik}
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{haber.yazar}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{haber.tarih}</span>
                  </div>
                </div>

                {/* Excerpt */}
                {haber.ozet && (
                  <p className="text-xl text-foreground/80 font-medium mb-8 leading-relaxed">
                    {haber.ozet}
                  </p>
                )}

                {/* Article Content */}
                <article className="prose prose-invert max-w-none mb-8">
                  {haber.icerik.split("\n").map((paragraph, index) => (
                    <p key={index} className="text-foreground/90 text-lg leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </article>

                {/* Share & Back */}
                <div className="flex gap-4 py-8 border-t border-border">
                  <Button
                    onClick={() => navigate("/haberler")}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Haberler'e Dön
                  </Button>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="bg-card rounded-lg p-6 h-fit">
                <h3 className="font-display text-lg font-bold text-foreground mb-6">
                  İlgili Haberler
                </h3>
                <div className="space-y-4">
                  {relatedNews.map((relatedNewsItem) => (
                    <Link
                      to={`/haber/${relatedNewsItem.id}`}
                      key={relatedNewsItem.id}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h4 className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-2">
                        {relatedNewsItem.baslik}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2">{relatedNewsItem.tarih}</p>
                    </Link>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HaberDetay;
