import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const KVKK = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="section-padding">
          <div className="container-custom mx-auto max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">Kişisel Verilerin Korunması (KVKK)</h1>
            
            <div className="space-y-6 text-foreground/90">
              <div>
                <h2 className="text-2xl font-bold mb-3">1. KVKK Uyum</h2>
                <p>SPOLDER, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile uyumlu olarak faaliyet göstermektedir.</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">2. Veri Sorumlusu</h2>
                <p>SPOLDER Spor Politikaları Derneği, web sitesi üzerinden toplanan kişisel verilerin sorumlusudur.</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">3. Veri İşleme Amaçları</h2>
                <p>Kişisel veriler aşağıdaki meşru amaçlarla işlenmektedir:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Hizmet sağlama</li>
                  <li>Müşteri desteği</li>
                  <li>Yasal yükümlülükleri yerine getirme</li>
                  <li>Dernek faaliyetlerinin yürütülmesi</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">4. Kişi Hakları</h2>
                <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>Verileriniz hakkında bilgi alma</li>
                  <li>Verilerinizin düzeltilmesini isteme</li>
                  <li>Verilerinizin silinmesini isteme</li>
                  <li>Veri işlemeye itiraz etme</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">5. Başvuru Yöntemi</h2>
                <p>Hakları hakkında başvuru yapmak için spolderdernegi@gmail.com adresine mail gönderebilirsiniz.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default KVKK;
