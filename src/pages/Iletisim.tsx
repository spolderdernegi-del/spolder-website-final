import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Iletisim = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [organizationLocation, setOrganizationLocation] = useState("");
  const [contactInfo, setContactInfo] = useState({
    phone: "+90 (312) 123 45 67",
    email: "info@spolder.org.tr",
    working_hours: "Pazartesi - Cuma: 09:00 - 18:00\nCumartesi - Pazar: Kapalı",
    iban_tl: "TR00 0000 0000 0000 0000 00",
    iban_eur: "TR00 0000 0000 0000 0000 01"
  });

  useEffect(() => {
    const loadInfo = async () => {
      try {
        setLoading(true);
        const keys = [
          'organization_location',
          'contact_phone',
          'contact_email',
          'contact_working_hours',
          'contact_iban_tl',
          'contact_iban_eur'
        ];

        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', keys);

        if (data) {
          const newContactInfo = { ...contactInfo };
          
          data.forEach((item: any) => {
            if (item.key === 'organization_location') setOrganizationLocation(item.value);
            if (item.key === 'contact_phone') newContactInfo.phone = item.value;
            if (item.key === 'contact_email') newContactInfo.email = item.value;
            if (item.key === 'contact_working_hours') newContactInfo.working_hours = item.value;
            if (item.key === 'contact_iban_tl') newContactInfo.iban_tl = item.value;
            if (item.key === 'contact_iban_eur') newContactInfo.iban_eur = item.value;
          });

          setContactInfo(newContactInfo);
        }
      } catch (err) {
        console.error('İletişim bilgileri okunamadı', err);
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız başarıyla gönderildi!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const donationIbanTL = contactInfo.iban_tl;
  const donationIbanEUR = contactInfo.iban_eur;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Kopyalandı: " + text);
    } catch (e) {
      toast.error("Kopyalama başarısız. Lütfen manuel kopyalayın.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-blue py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              İletişim
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Sorularınız için bize ulaşın
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  İletişim Bilgileri
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-soft">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Adres</h3>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {organizationLocation || "Atatürk Bulvarı No: 123\nÇankaya, Ankara 06100"}
                      </p>
                    </div>
                  </div>

                  {/* Donation Card */}
                  <div id="bagis" className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-soft">
                    <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Bizi Destekleyebilirsiniz</h3>
                      <p className="text-muted-foreground text-sm mb-2">Katkılarınızla çalışmalarımızı sürdürmemize yardımcı olabilirsiniz. Aşağıdaki IBAN bilgilerini kullanarak destek olabilirsiniz.</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-background p-3 rounded">
                          <div>
                            <div className="text-xs text-muted-foreground">IBAN (TL)</div>
                            <div className="font-mono text-sm">{donationIbanTL}</div>
                          </div>
                          <button onClick={() => copyToClipboard(donationIbanTL)} className="px-3 py-2 rounded bg-sky-500 text-white flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Kopyala
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-background p-3 rounded">
                          <div>
                            <div className="text-xs text-muted-foreground">IBAN (EUR)</div>
                            <div className="font-mono text-sm">{donationIbanEUR}</div>
                          </div>
                          <button onClick={() => copyToClipboard(donationIbanEUR)} className="px-3 py-2 rounded bg-sky-500 text-white flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Kopyala
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-soft">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Telefon</h3>
                      <p className="text-muted-foreground text-sm">{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-soft">
                    <div className="w-12 h-12 rounded-lg bg-turquoise/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-turquoise" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">E-posta</h3>
                      <p className="text-muted-foreground text-sm">{contactInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg shadow-soft">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Çalışma Saatleri</h3>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">
                        {contactInfo.working_hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg shadow-card p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Mesaj Gönderin
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Adınız Soyadınız
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Adınızı girin"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          E-posta Adresiniz
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="E-posta adresinizi girin"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Konu
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Mesajınızın konusu"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Mesajınız
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Mesajınızı buraya yazın..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" variant="gradient" size="lg">
                      Mesaj Gönder
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-12 rounded-lg overflow-hidden shadow-card">
              <p className="text-center text-muted-foreground py-8">
                Harita yükleniyor...
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Iletisim;
