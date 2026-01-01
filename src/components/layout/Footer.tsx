import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo_disi.webp";

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

const Footer = () => {
  const [contact, setContact] = useState<ContactInfo>({
    address: "Atatürk Bulvarı No: 123, Çankaya, Ankara",
    phone: "+90 (312) 123 45 67",
    email: "info@spolider.org.tr",
  });

  useEffect(() => {
    const fetchContact = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["organization_location", "contact_phone", "contact_email"]);

      if (error || !data) return;

      const map = Object.fromEntries(data.map((item) => [item.key, item.value]));
      setContact((prev) => ({
        address: map.organization_location || prev.address,
        phone: map.contact_phone || prev.phone,
        email: map.contact_email || prev.email,
      }));
    };

    fetchContact();
  }, []);

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
              <a href="https://www.facebook.com/spolderorg/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300" title="Facebook">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#1877F2"/>
                  <path d="M26.5 25.5H30L31 21.5H26.5V19.5C26.5 18.47 26.5 17.5 28.5 17.5H31V14.14C30.174 14.054 29.3435 14.0087 28.5 14C25.5 14 23.5 15.72 23.5 18.8V21.5H20V25.5H23.5V36H26.5V25.5Z" fill="white"/>
                </svg>
              </a>
              <a href="https://x.com/spolderorg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300" title="X (Twitter)">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#000000"/>
                  <path d="M29.5 16.5H31.8L26.4 22.7L33 31.5H28L23.8 26L19 31.5H16.7L22.5 24.8L16 16.5H21L24.7 21.5L29.5 16.5ZM28.6 29.8H30L20.4 18.2H18.8L28.6 29.8Z" fill="white"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/spolderorg/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300" title="Instagram">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="url(#instagram-gradient)"/>
                  <defs>
                    <linearGradient id="instagram-gradient" x1="6" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FD5"/>
                      <stop offset=".5" stopColor="#FF543E"/>
                      <stop offset="1" stopColor="#C837AB"/>
                    </linearGradient>
                  </defs>
                  <path d="M24 16.5C27.5899 16.5 31.5 17.4 31.5 21V27C31.5 30.6 27.5899 31.5 24 31.5C20.4101 31.5 16.5 30.6 16.5 27V21C16.5 17.4 20.4101 16.5 24 16.5ZM24 14C19.6 14 14 14.9 14 21V27C14 33.1 19.6 34 24 34C28.4 34 34 33.1 34 27V21C34 14.9 28.4 14 24 14ZM24 20C26.2091 20 28 21.7909 28 24C28 26.2091 26.2091 28 24 28C21.7909 28 20 26.2091 20 24C20 21.7909 21.7909 20 24 20ZM24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18ZM31 17C31 17.5523 30.5523 18 30 18C29.4477 18 29 17.5523 29 17C29 16.4477 29.4477 16 30 16C30.5523 16 31 16.4477 31 17Z" fill="white"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/spolderorg" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300" title="LinkedIn">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#0A66C2"/>
                  <path d="M20.5 32H16.5V20.5H20.5V32ZM18.5 18.8C17.12 18.8 16 17.68 16 16.3C16 14.92 17.12 13.8 18.5 13.8C19.88 13.8 21 14.92 21 16.3C21 17.68 19.88 18.8 18.5 18.8ZM32 32H28V26.4C28 24.84 27.98 22.82 25.84 22.82C23.68 22.82 23.36 24.52 23.36 26.3V32H19.36V20.5H23.18V22.38H23.24C23.76 21.42 25.04 20.4 26.96 20.4C30.98 20.4 32 23.02 32 26.42V32Z" fill="white"/>
                </svg>
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
              <li>
                <Link to="/search?q=araştırma analiz" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Araştırma & Analiz
                </Link>
              </li>
              <li>
                <Link to="/search?q=eğitim programları" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Eğitim Programları
                </Link>
              </li>
              <li>
                <Link to="/search?q=politika önerileri" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Politika Önerileri
                </Link>
              </li>
              <li>
                <Link to="/search?q=spor danışmanlığı" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Spor Danışmanlığı
                </Link>
              </li>
              <li>
                <Link to="/search?q=uluslararası işbirlikleri" className="text-sm text-primary-foreground/80 hover:text-primary transition-colors">
                  Uluslararası İşbirlikleri
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 hover:opacity-80 transition-opacity"
                >
                  <svg className="w-10 h-10 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#EA4335"/>
                    <path d="M24 14C19.58 14 16 17.58 16 22C16 27.25 24 34 24 34C24 34 32 27.25 32 22C32 17.58 28.42 14 24 14ZM24 25C22.34 25 21 23.66 21 22C21 20.34 22.34 19 24 19C25.66 19 27 20.34 27 22C27 23.66 25.66 25 24 25Z" fill="white"/>
                  </svg>
                  <span className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">{contact.address}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <svg className="w-10 h-10 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#34A853"/>
                    <path d="M32.5 28.5C31.85 28.5 31.2 28.4 30.6 28.2C30.4 28.13 30.18 28.17 30.03 28.32L28.2 30.82C25.4 29.43 18.58 22.77 17.18 19.82L19.68 17.98C19.83 17.82 19.88 17.6 19.8 17.4C19.6 16.8 19.5 16.15 19.5 15.5C19.5 14.95 19.05 14.5 18.5 14.5H15.5C14.95 14.5 14.5 14.95 14.5 15.5C14.5 24.89 22.11 32.5 31.5 32.5C32.05 32.5 32.5 32.05 32.5 31.5V28.5C33.5 28.5 33.05 28.5 32.5 28.5Z" fill="white"/>
                  </svg>
                  <span className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">{contact.phone}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <svg className="w-10 h-10 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#9333EA"/>
                    <path d="M32 17H16C14.9 17 14 17.9 14 19V29C14 30.1 14.9 31 16 31H32C33.1 31 34 30.1 34 29V19C34 17.9 33.1 17 32 17ZM32 21L24 25.5L16 21V19L24 23.5L32 19V21Z" fill="white"/>
                  </svg>
                  <span className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">{contact.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} SPOLDER Spor Politikaları Derneği. Tüm hakları saklıdır.
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
