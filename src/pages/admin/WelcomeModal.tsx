import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

interface WelcomeModalContent {
  title: string;
  description: string;
  feature1: string;
  feature2: string;
  feature3: string;
  buttonText: string;
}

const AdminWelcomeModal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<WelcomeModalContent>({
    title: "",
    description: "",
    feature1: "",
    feature2: "",
    feature3: "",
    buttonText: "",
  });

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
    loadModalContent();
  }, [checkAuth]);

  const loadModalContent = () => {
    const stored = localStorage.getItem('spolder_welcome_modal');
    if (stored) {
      const content = JSON.parse(stored);
      setFormData(content);
    } else {
      // Varsayılan değerler
      setFormData({
        title: "Hoş Geldiniz!",
        description: "SPOLDER Spor Politikaları Derneği'ne hoş geldiniz. Türkiye'de spor politikalarının geliştirilmesi için çalışıyoruz.",
        feature1: "500+ üye ile spor camiasının güçlü sesi",
        feature2: "Araştırmalar, etkinlikler ve politika önerileri",
        feature3: "15+ yıllık deneyim ve uzmanlık",
        buttonText: "Keşfetmeye Başla",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      localStorage.setItem('spolder_welcome_modal', JSON.stringify(formData));
      alert("Hoş geldiniz pop-up içeriği başarıyla güncellendi!");
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Hoş Geldiniz Pop-up Yönetimi</h1>
          </div>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Başlık *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Hoş Geldiniz!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Açıklama *
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ana açıklama metni"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Özellikler (3 adet)</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Özellik 1 *
                </label>
                <Input
                  required
                  value={formData.feature1}
                  onChange={(e) => setFormData({ ...formData, feature1: e.target.value })}
                  placeholder="İlk özellik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Özellik 2 *
                </label>
                <Input
                  required
                  value={formData.feature2}
                  onChange={(e) => setFormData({ ...formData, feature2: e.target.value })}
                  placeholder="İkinci özellik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Özellik 3 *
                </label>
                <Input
                  required
                  value={formData.feature3}
                  onChange={(e) => setFormData({ ...formData, feature3: e.target.value })}
                  placeholder="Üçüncü özellik"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Buton Metni *
              </label>
              <Input
                required
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Keşfetmeye Başla"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <h4 className="font-semibold mb-2 text-foreground">Önizleme</h4>
            <p className="text-sm text-muted-foreground mb-4">Pop-up'ın görünümü:</p>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {formData.title || "Başlık"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formData.description || "Açıklama"}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{formData.feature1 || "Özellik 1"}</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{formData.feature2 || "Özellik 2"}</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-foreground/80">{formData.feature3 || "Özellik 3"}</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                {formData.buttonText || "Buton Metni"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminWelcomeModal;
