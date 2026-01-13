import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const features = [
  "Spor politikası araştırmaları ve analizleri",
  "Ulusal ve uluslararası konferanslar",
  "Eğitim programları ve atölye çalışmaları",
  "Politika önerileri ve raporlar",
];

const AboutSection = () => {
  return (
    <section className="section-padding">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80"
                alt="SPOLDER Dernek Tanıtım"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-anthracite/40 to-transparent" />
            </div>
            
            {/* Stats Card */}
            <div className="absolute -bottom-6 -right-6 bg-card rounded-lg shadow-elevated p-6 hidden md:block">
              <div className="flex gap-8">
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">15+</span>
                  <p className="text-sm text-muted-foreground">Yıllık Deneyim</p>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-secondary">500+</span>
                  <p className="text-sm text-muted-foreground">Üye</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Hakkımızda
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Spor Politikalarında <span className="text-gradient">Öncü Kuruluş</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SPOLDER Spor Politikaları Derneği, Türkiye'de spor politikalarının geliştirilmesi, 
              spor kültürünün yaygınlaştırılması ve sporun toplumsal faydalarının artırılması 
              amacıyla kurulmuş bir sivil toplum kuruluşudur.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ulusal ve uluslararası düzeyde araştırmalar yaparak, politika yapıcılara 
              bilimsel temelli öneriler sunuyor ve spor camiasının tüm paydaşlarıyla 
              işbirliği içinde çalışıyoruz.
            </p>

            {/* Features */}
            <ul className="space-y-3 pt-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="pt-4">
              <Link to="/hakkimizda">
                <Button variant="gradient" size="lg" className="group">
                  Daha Fazla Bilgi
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
