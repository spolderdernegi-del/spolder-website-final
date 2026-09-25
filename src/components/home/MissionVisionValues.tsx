import { Target, Eye, Heart } from "lucide-react";

const items = [
  {
    icon: Target,
    title: "Misyonumuz",
    description: "Sporun farklı alanlarında bilgi, deneyim ve saha ihtiyaçlarını bir araya getirerek; araştıran, üreten, geliştiren ve çözüm odaklı çalışmalarla daha nitelikli bir spor ekosisteminin oluşmasına katkı sunmak.",
    color: "primary",
  },
  {
    icon: Eye,
    title: "Vizyonumuz",
    description: "Spor politikaları ve yönetimi alanında güvenilir bir referans noktası olmak; Türkiye'de sporun geleceğine ilişkin fikir, politika ve modeller üreten öncü bir yapı haline gelmek.",
    color: "secondary",
  },
  {
    icon: Heart,
    title: "Değerlerimiz",
    description: "Bilimsellik • Şeffaflık • Liyakat • Katılımcılık • Eşitlik • Sürdürülebilirlik • İş Birliği • Toplumsal Fayda",
    color: "turquoise",
  },
];

const MissionVisionValues = () => {
  return (
    <section className="section-padding bg-muted">
      <div className="container-custom mx-auto">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Kurumsal</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
            Misyon, Vizyon & Değerler
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="group bg-card rounded-lg p-8 shadow-card card-hover relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                item.color === "primary" ? "bg-gradient-green" : 
                item.color === "secondary" ? "bg-gradient-blue" : 
                "bg-turquoise"
              }`} />
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 ${
                item.color === "primary" ? "bg-primary/10 text-primary" :
                item.color === "secondary" ? "bg-secondary/10 text-secondary" :
                "bg-turquoise/10 text-turquoise"
              }`}>
                <item.icon className="w-8 h-8" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                {item.title}
              </h3>
              {item.title === "Değerlerimiz" ? (
                <div className="flex flex-wrap gap-2">
                  {item.description.split("•").map((v) => v.trim()).filter(Boolean).map((value) => (
                    <span
                      key={value}
                      className="text-sm font-medium px-3 py-1.5 rounded-full bg-turquoise/10 text-turquoise"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValues;
