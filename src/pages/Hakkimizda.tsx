import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Target, Eye, Heart } from "lucide-react";
import CorporateIdentitySection from "@/components/about/CorporateIdentitySection";
import { supabase } from "@/integrations/supabase/client";

interface BoardMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  order: number;
}

const Hakkimizda = () => {
  const [selectedMember, setSelectedMember] = React.useState<BoardMember | null>(null);
  const [boardMembers, setBoardMembers] = React.useState<BoardMember[]>([]);
  const [presidentInfo, setPresidentInfo] = React.useState<BoardMember | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Yönetim kurulu üyelerini Supabase'den yükle
  React.useEffect(() => {
    const loadBoardMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('board')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('Yönetim kurulu yüklenirken hata:', error);
          return;
        }

        if (data && data.length > 0) {
          setBoardMembers(data);
          // Başkanı bul (order = 1)
          const president = data.find((member: BoardMember) => member.order === 1 || member.position.toLowerCase().includes('başkan'));
          setPresidentInfo(president || data[0]);
        }
      } catch (error) {
        console.error('Yönetim kurulu yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBoardMembers();
  }, []);

  // SEO meta tags
  React.useEffect(() => {
    document.title = "Hakkımızda - SPOLDER Spor Politikaları Derneği";
    
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setPropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setMetaTag("description", "SPOLDER Spor Politikaları Derneği hakkında detaylı bilgi, yönetim kurulu, misyon, vizyon ve kurumsal kimlik. Logo tasarımı, vektörel logo dosyaları, renk paleti ve marka rehberi.");
    setMetaTag("keywords", "SPOLDER hakkında, spor derneği, yönetim kurulu, kurumsal kimlik, logo, vektör logo, renk paleti, marka, spor politikaları derneği");
    setPropertyTag("og:title", "Hakkımızda - SPOLDER Spor Politikaları Derneği");
    setPropertyTag("og:description", "SPOLDER'in misyon, vizyon, değerleri ve kurumsal kimlik sistemi hakkında bilgi alın.");
    setPropertyTag("og:url", "https://spolder.org/hakkimizda");

    return () => {
      // Cleanup optional - sayfadan çıkışta varsayılan meta'ya dönmek istemiyoruz
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-green py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Hakkımızda
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              SPOLDER Spor Politikaları Derneği'ni tanıyın.
            </p>
          </div>
        </section>

        {/* President Message */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            {presidentInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider">
                    Başkan Mesajı
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    Sporun Gücüne İnanıyoruz
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Spor Politikaları Derneği'nin resmi web sitesine hoş geldiniz. Sporun, toplumu bir araya getiren ve bireylerin yaşam kalitesini artıran en önemli unsurlardan biri olduğuna yürekten inanıyoruz. Dernek olarak, sporun her dalında sürdürülebilir ve kapsayıcı politikalar geliştirmek için çalışıyoruz.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Derneğimiz aracılığıyla sizlerle projelerimizi, araştırmalarımızı ve etkinliklerimizi paylaşmayı hedefliyoruz. Spor bilimleri, yönetimi ve eğitimine olan katkılarımızla, gençlerimize ve spor dünyasına yeni ufuklar açmak için buradayız. Herkesin spora erişimini kolaylaştırmak ve sporun yaygınlaşmasını sağlamak için çeşitli projeler yürütmekteyiz.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Siz değerli Spor paydaşlarının her birinin desteği, bizim için büyük bir motivasyon kaynağı. Sporun gücüne inanan herkesi, bu yolculukta bizimle birlikte olmaya ve katkı sunmaya davet ediyoruz. Görüşleriniz ve önerilerinizle bize yön vereceğinizi ve birlikte daha büyük başarılara imza atacağımızı umuyoruz.
                  </p>
                  <p className="text-muted-foreground leading-relaxed italic">
                    Spor dolu ve sağlıklı günler dileriz.
                  </p>
                  <p className="font-display font-bold text-foreground">
                    {presidentInfo.name}
                    <span className="font-normal text-muted-foreground block text-sm">SPOLDER Başkanı</span>
                  </p>
                  <p className="text-muted-foreground text-sm italic">
                    Sevgi ve saygılarımızla...
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={presidentInfo.image}
                    alt={presidentInfo.name}
                    className="rounded-lg shadow-elevated w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mission Vision Values */}
        <section className="section-padding bg-muted">
          <div className="container-custom mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Misyon",
                  text:
                    "Türkiye'de spor politikalarının bilimsel temellere dayalı olarak geliştirilmesine katkı sağlamak.",
                  color: "primary",
                },
                {
                  icon: Eye,
                  title: "Vizyon",
                  text:
                    "Spor politikaları alanında ulusal ve uluslararası düzeyde öncü bir sivil toplum kuruluşu olmak.",
                  color: "secondary",
                },
                {
                  icon: Heart,
                  title: "Değerler",
                  text:
                    "Bilimsellik, şeffaflık, katılımcılık, yenilikçilik ve sürdürülebilirlik.",
                  color: "turquoise",
                },
              ].map((item) => (
                <div key={item.title} className="bg-card rounded-lg p-8 shadow-card text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                      item.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : item.color === "secondary"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-turquoise/10 text-turquoise"
                    }`}
                  >
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Board Members */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="text-center mb-12">
              <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider">Ekibimiz</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">Yönetim Kurulu</h2>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Yükleniyor...</p>
              </div>
            ) : boardMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Henüz yönetim kurulu üyesi eklenmemiş.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {boardMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="bg-card rounded-lg overflow-hidden shadow-card card-hover text-center focus:outline-none"
                  >
                    <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                    <div className="p-6">
                      <h3 className="font-display font-bold text-lg text-foreground">{member.name}</h3>
                      <p className="text-primary text-sm">{member.position}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Kurumsal Kimlik */}
        <section className="section-padding bg-muted">
          <div className="container-custom mx-auto">
            <CorporateIdentitySection />
          </div>
        </section>
      </main>
      <Footer />
      {selectedMember && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedMember(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-2xl z-70">
            <div className="flex gap-6">
              <img src={selectedMember.image} alt={selectedMember.name} className="w-40 h-40 object-cover rounded" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                <p className="text-sm text-primary mb-3">{selectedMember.position}</p>
                <p className="text-sm text-muted-foreground mb-2">{selectedMember.bio}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setSelectedMember(null)} className="px-4 py-2">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hakkimizda;
