import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-green" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />

      <div className="container-custom mx-auto px-4 md:px-8 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Content */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            Spor Politikalarının Geleceğini Birlikte Şekillendirelim
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            SPOLDER ailesine katılarak Türkiye'nin spor politikalarının gelişimine katkı sağlayın. 
            Üyelerimize özel etkinlikler, yayınlar ve networking fırsatlarından yararlanın.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/iletisim">
              <Button variant="hero" size="xl" className="group">
                Gönüllü Ol
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/hakkimizda">
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
              >
                Daha Fazla Bilgi
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 pt-8">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary-foreground">500+</span>
              <p className="text-sm text-primary-foreground/70 mt-1">Aktif Üye</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-bold text-primary-foreground">50+</span>
              <p className="text-sm text-primary-foreground/70 mt-1">Proje</p>
            </div>
            <div className="text-center">
              <span className="text-4xl font-bold text-primary-foreground">15+</span>
              <p className="text-sm text-primary-foreground/70 mt-1">Yıl</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
