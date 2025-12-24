import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 1,
    title: "Spor ve Toplum Araştırması",
    description: "Türkiye genelinde spor alışkanlıklarını ve spor tesislerine erişimi inceleyen kapsamlı araştırma projesi.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80",
    status: "Devam Ediyor",
    statusColor: "primary",
  },
  {
    id: 2,
    title: "Yerel Spor Politikaları Rehberi",
    description: "Belediyelere yönelik spor politikası geliştirme rehberi hazırlama projesi.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format&fit=crop&q=80",
    status: "Tamamlandı",
    statusColor: "secondary",
  },
  {
    id: 3,
    title: "Spor Ekonomisi İzleme Sistemi",
    description: "Türkiye'nin spor ekonomisini takip eden dijital platform geliştirme projesi.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80",
    status: "Devam Ediyor",
    statusColor: "primary",
  },
  {
    id: 4,
    title: "Kadın Sporcu Destek Programı",
    description: "Kadın sporcuların kariyer gelişimini destekleyen mentorluk ve eğitim programı.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
    status: "Devam Ediyor",
    statusColor: "primary",
  },
  {
    id: 5,
    title: "Okul Sporları Analiz Raporu",
    description: "Türkiye'deki okul sporları sisteminin kapsamlı analizi ve politika önerileri.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80",
    status: "Tamamlandı",
    statusColor: "secondary",
  },
  {
    id: 6,
    title: "Engelli Sporları Erişilebilirlik Projesi",
    description: "Engelli bireylerin spora erişimini artırmaya yönelik kapsamlı araştırma ve savunuculuk projesi.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
    status: "Planlanıyor",
    statusColor: "turquoise",
  },
];

const Projeler = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-green py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Projelerimiz
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Spor politikalarını geliştirmek için yürüttüğümüz projeler
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article key={project.id} className="bg-card rounded-lg overflow-hidden shadow-card card-hover group">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-anthracite/60 to-transparent" />
                    <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${
                      project.statusColor === "primary" ? "bg-primary text-primary-foreground" :
                      project.statusColor === "secondary" ? "bg-secondary text-secondary-foreground" :
                      "bg-turquoise text-primary-foreground"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="p-6">
                    <Link to={`/proje/${project.id}`}>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                      <Link to={`/proje/${project.id}`} className="flex items-center">
                        Detaylar <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Projeler;
