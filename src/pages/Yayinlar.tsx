import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Download, Calendar, ExternalLink, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/toast";

interface Publication {
  id: number;
  title: string;
  category: string;
  categories?: string[];
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
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
  const [searchParams] = useSearchParams();
  const kategoriParam = searchParams.get("kategori");
  
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublications();
  }, []);

  useEffect(() => {
    if (kategoriParam) {
      setActiveFilter(kategoriParam);
    }
  }, [kategoriParam]);

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
    : publications.filter(pub => 
        pub.categories?.includes(activeFilter) || pub.category === activeFilter
      );

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getFileExtension = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'DOCX';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'XLSX';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PPTX';
    if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPG';
    if (fileType.includes('png')) return 'PNG';
    if (fileType.includes('gif')) return 'GIF';
    if (fileType.includes('webp')) return 'WEBP';
    if (fileType.includes('svg')) return 'SVG';
    if (fileType.includes('text')) return 'TXT';
    return 'FILE';
  };

  const handleDownload = (fileUrl: string, fileName: string, fileType: string) => {
    try {
      // Dosya uzantısını belirle
      let extension = '';
      if (fileType.includes('pdf')) {
        extension = '.pdf';
      } else if (fileType.includes('word') || fileType.includes('document')) {
        extension = '.docx';
      } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
        extension = '.xlsx';
      } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
        extension = '.pptx';
      } else if (fileType.includes('text')) {
        extension = '.txt';
      } else if (fileType.includes('image')) {
        // Resim dosyaları için uzantıyı mime type'dan al
        if (fileType.includes('jpeg') || fileType.includes('jpg')) {
          extension = '.jpg';
        } else if (fileType.includes('png')) {
          extension = '.png';
        } else if (fileType.includes('gif')) {
          extension = '.gif';
        } else if (fileType.includes('webp')) {
          extension = '.webp';
        } else if (fileType.includes('svg')) {
          extension = '.svg';
        } else {
          extension = '.jpg'; // varsayılan
        }
      }

      // Dosya adını hazırla
      const downloadFileName = fileName + extension;

      if (fileUrl.startsWith('data:')) {
        // Base64 dosyayı indir
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Dosya indiriliyor...');
      } else {
        // Normal URL - fetch ile indir
        fetch(fileUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Dosya indiriliyor...');
          })
          .catch(() => {
            // Fetch başarısız olursa yeni sekmede aç
            window.open(fileUrl, '_blank');
          });
      }
    } catch (error) {
      console.error('İndirme hatası:', error);
      toast.error('Dosya indirilirken hata oluştu');
    }
  };

  const handleOpen = (fileUrl: string, fileType: string) => {
    try {
      if (fileUrl.startsWith('data:')) {
        // Base64 dosyası - dosya tipine göre işlem yap
        const newWindow = window.open();
        if (newWindow) {
          if (fileType.includes('pdf')) {
            // PDF için iframe kullan
            newWindow.document.write(`
              <html>
                <head>
                  <title>PDF Önizleme</title>
                  <style>body{margin:0;overflow:hidden}</style>
                </head>
                <body>
                  <iframe src="${fileUrl}" style="width:100%;height:100vh;border:none"></iframe>
                </body>
              </html>
            `);
          } else if (fileType.includes('image')) {
            // Resimler için yeni sekmede göster
            newWindow.document.write(`
              <html>
                <head>
                  <title>Resim Önizleme</title>
                  <style>
                    body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000}
                    img{max-width:100%;max-height:100vh;object-fit:contain}
                  </style>
                </head>
                <body>
                  <img src="${fileUrl}" alt="Önizleme" />
                </body>
              </html>
            `);
          } else if (fileType.includes('word') || fileType.includes('document')) {
            // Word dosyaları için direkt indirmeye yönlendir
            newWindow.location.href = fileUrl;
          } else {
            // Diğer dosyalar için yeni sekmede aç
            newWindow.document.write(`
              <html>
                <head><title>Dosya Önizleme</title></head>
                <body style="margin:0">
                  <iframe src="${fileUrl}" style="width:100%;height:100vh;border:none"></iframe>
                </body>
              </html>
            `);
          }
        }
      } else {
        // Normal URL - yeni sekmede aç
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Açma hatası:', error);
      toast.error('Dosya açılırken hata oluştu');
    }
  };

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

      {/* ction>

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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {(pub.categories && pub.categories.length > 0 ? pub.categories : pub.category ? [pub.category] : ['Genel']).map((cat, idx) => (
                        <span 
                          key={idx}
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(cat)}`}
                        >
                          {cat}
                        </span>
                      ))}
                      <span className="inline-block px-2 py-0.5 text-xs font-bold rounded bg-primary/10 text-primary">
                        {getFileExtension(pub.file_type)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pub.created_at).toLocaleDateString('tr-TR')}
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
                        {formatFileSize(pub.file_size)}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleOpen(pub.file_url, pub.file_type)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Aç
                        </Button>
                        <Button 
                          variant="gradient" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleDownload(pub.file_url, pub.title, pub.file_type)}
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

export default Yayinlar;
