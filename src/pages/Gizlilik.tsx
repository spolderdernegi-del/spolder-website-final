import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Gizlilik = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="section-padding">
          <div className="container-custom mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">Gizlilik Politikası</h1>
            
            <div className="space-y-6 text-foreground/90">
              <div>
                <h2 className="text-2xl font-bold mb-3">1. Genel Bilgiler</h2>
                <p>SPOLDER Spor Politikaları Derneği olarak, kullanıcılarımızın gizliliğini ve kişisel verilerinin korunmasını son derece önemli görüyoruz.</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">2. Toplanan Veriler</h2>
                <p>Web sitemizi ziyaret ettiğinizde, sizden aşağıdaki bilgileri toplayabiliriz:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Ad ve Soyad</li>
                  <li>E-posta Adresi</li>
                  <li>Telefon Numarası</li>
                  <li>IP Adresi ve Tarayıcı Bilgileri</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">3. Veri Kullanımı</h2>
                <p>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Hizmet sunumu ve iyileştirilmesi</li>
                  <li>İletişim ve bildirimlerin sağlanması</li>
                  <li>İstatistiksel analiz ve raporlama</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">4. Veri Güvenliği</h2>
                <p>Kişisel verileriniz güvenli sunucularda saklanır ve yetkisiz erişimden korunur.</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">5. İletişim</h2>
                <p>Gizlilik politikası hakkında sorularınız varsa, lütfen bize spolderdernegi@gmail.com adresinden ulaşın.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gizlilik;
