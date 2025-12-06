import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo_disi.webp";

const Footer = () => {
  return (
    <footer className="bg-anthracite text-primary-foreground">
      <div className="container-custom mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="SPOlDER Logo" className="h-16 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Türkiye'de spor politikalarının geliştirilmesi ve spor kültürünün yaygınlaştırılması için çalışıyoruz.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/hakkimizda" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/haberler" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Haberler
                </Link>
              </li>
              <li>
                <Link to="/etkinlikler" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Etkinlikler
                </Link>
              </li>
              <li>
                <Link to="/projeler" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Projeler
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Faaliyetlerimiz</h4>
            <ul className="space-y-3">
              {["Araştırma & Analiz", "Eğitim Programları", "Politika Önerileri", "Spor Danışmanlığı", "Uluslararası İşbirlikleri"].map((item) => (
                <li key={item}>
                  <Link to={`/search?q=${encodeURIComponent(item)}`} className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <a href="https://www.google.com/maps/search/?api=1&query=Atat%C3%BCrk+Bulvar%C4%B1+No:+123+%C3%87ankaya+Ankara" target="_blank" rel="noreferrer" className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span className="text-sm text-primary-foreground/80">Atatürk Bulvarı No: 123, Çankaya, Ankara</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href="tel:+903121234567" className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-white shrink-0" />
                  <span className="text-sm text-primary-foreground/80">+90 (312) 123 45 67</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href="mailto:info@spolider.org.tr" className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white shrink-0" />
                  <span className="text-sm text-primary-foreground/80">info@spolider.org.tr</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} SPOlDER Spor Politikaları Derneği. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            <Link to="/gizlilik" className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
              Gizlilik Politikası
            </Link>
            <Link to="/kvkk" className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
              KVKK
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
