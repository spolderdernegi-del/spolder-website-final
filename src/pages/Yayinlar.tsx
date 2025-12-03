import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Download, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const publications = [
  {
    id: 1,
    title: "Türkiye'de Spor Politikalarının Tarihsel Gelişimi",
    type: "Rapor",
    year: "2024",
    description: "Cumhuriyet döneminden günümüze Türkiye'deki spor politikalarının kapsamlı analizi.",
    pages: 156,
    downloadUrl: "#",
  },
  {
    id: 2,
    title: "Kadın ve Spor: Fırsatlar ve Engeller",
    type: "Araştırma",
    year: "2024",
    description: "Türkiye'de kadın sporcuların karşılaştığı zorluklar üzerine saha araştırması.",
    pages: 98,
    downloadUrl: "#",
  },
  {
    id: 3,
    title: "Yerel Yönetimler ve Spor Tesisleri",
    type: "Politika Belgesi",
    year: "2023",
    description: "Belediyelerin spor tesisi yatırımları ve erişilebilirlik konusunda öneriler.",
    pages: 45,
    downloadUrl: "#",
  },
  {
    id: 4,
    title: "Sporda Dijital Dönüşüm",
    type: "Rapor",
    year: "2023",
    description: "Teknolojinin spor yönetimi ve performans analizindeki rolü.",
    pages: 72,
    downloadUrl: "#",
  },
  {
    id: 5,
    title: "Engelli Bireylerin Spora Katılımı",
    type: "Araştırma",
    year: "2023",
    description: "Engelli bireylerin spor olanaklarına erişimi üzerine kapsamlı değerlendirme.",
    pages: 134,
    downloadUrl: "#",
  },
  {
    id: 6,
    title: "Okul Sporları ve Fiziksel Aktivite",
    type: "Politika Belgesi",
    year: "2022",
    description: "Eğitim sisteminde beden eğitimi ve okul sporlarının güçlendirilmesi önerileri.",
    pages: 56,
    downloadUrl: "#",
  },
];

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
      <section className="py-8 border-b border-border">
        <div className="container-custom mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="gradient" size="sm">
              Tümü
            </Button>
            <Button variant="outline" size="sm">
              Raporlar
            </Button>
            <Button variant="outline" size="sm">
              Araştırmalar
            </Button>
            <Button variant="outline" size="sm">
              Politika Belgeleri
            </Button>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="py-12">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {publications.map((pub) => (
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
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Önizle
                        </Button>
                        <Button variant="gradient" size="sm" className="text-xs">
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

      {/* Stats Section */}
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

      <Footer />
    </div>
  );
};

export default Yayinlar;
