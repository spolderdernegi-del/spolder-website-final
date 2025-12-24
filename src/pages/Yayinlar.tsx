import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Download, Calendar, ExternalLink, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Publication {
  id: number;
  title: string;
  type: string;
  year: string;
  description: string;
  pages: number;
  downloadUrl: string;
  previewUrl: string;
  created_at: string;
}



const getTypeColor = (type: string) => {
  switch (type) {
    case "Rapor":
      return "bg-primary/10 text-primary";
    case "Araştırma":
      return "bg-secondary/10 text-secondary";
    case "Politika Belgesi":
      return "bg-accent/10 text-accent";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Yayinlar = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (supabaseError) throw supabaseError;
      setPublications(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yayınlar yüklenirken hata oluştu");
      console.error("Error fetching publications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Rapor":
        return "bg-primary/10 text-primary";
      case "Araştırma":
        return "bg-secondary/10 text-secondary";
      case "Politika Belgesi":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredPublications = activeFilter === "Tümü" 
    ? publications 
    : publications.filter(pub => pub.type === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-secondary/10 via-primary/5 to-background">
        <div className="container-custom mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Yayınlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Derneğimizin hazırladığı raporlar, araştırmalar ve politika belgeleri.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      {!loading && (
        <section className="py-8 border-b border-border">
          <div className="container-custom mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === "Tümü" ? "gradient" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("Tümü")}
              >
                Tümü
              </Button>
              <Button 
                variant={activeFilter === "Rapor" ? "gradient" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("Rapor")}
              >
                Raporlar
              </Button>
              <Button 
                variant={activeFilter === "Araştırma" ? "gradient" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("Araştırma")}
              >
                Araştırmalar
              </Button>
              <Button 
                variant={activeFilter === "Politika Belgesi" ? "gradient" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("Politika Belgesi")}
              >
                Politika Belgeleri
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4 flex justify-center items-center min-h-96">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredPublications.length === 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Yayın bulunamadı</h3>
            <p className="text-muted-foreground">Seçili kategoride yayın yok.</p>
          </div>
        </section>
      )}

      {/* Publications Grid */}
      {!loading && filteredPublications.length > 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
            {filteredPublications.map((pub) => (
              <article
                key={pub.id}
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(pub.type)}`}>
                        {pub.type}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pub.year}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {pub.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {pub.pages} sayfa
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => window.open(pub.previewUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Önizle
                        </Button>
                        <Button 
                          variant="gradient" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = pub.downloadUrl;
                            link.download = `${pub.title}.pdf`;
                            link.click();
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          İndir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {!loading && (
        <section className="py-16 bg-muted/30">
          <div className="container-custom mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-display text-4xl font-bold text-primary mb-2">25+</div>
                <p className="text-sm text-muted-foreground">Yayınlanan Rapor</p>
              </div>
              <div>
                <div className="font-display text-4xl font-bold text-secondary mb-2">15+</div>
                <p className="text-sm text-muted-foreground">Araştırma Projesi</p>
              </div>
              <div>
                <div className="font-display text-4xl font-bold text-accent mb-2">10K+</div>
                <p className="text-sm text-muted-foreground">İndirme Sayısı</p>
              </div>
              <div>
                <div className="font-display text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Akademik Atıf</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Yayinlar;export default Yayinlar;
