import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Upload, Trash2, Key, Activity } from "lucide-react";
import { exportAllData, importData, clearAllData } from "@/lib/dataManager";
import { toast } from "@/lib/toast";
import { getActivityLogs, getActionText, getContentTypeText, type ActivityLog } from "@/lib/activityLog";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [counts, setCounts] = useState({ events: 0, news: 0, projects: 0, blog: 0 });
  const [mapEmbed, setMapEmbed] = useState("");
  const [mapEmbedInput, setMapEmbedInput] = useState("");
  const [organizationLocation, setOrganizationLocation] = useState("");
  const [organizationLocationInput, setOrganizationLocationInput] = useState("");

  useEffect(() => {
    checkAuth();
    loadActivityLogs();
    loadCounts();
    loadCurrentEmail();
    loadMapEmbed();
    loadOrganizationLocation();
  }, []);

  const loadCounts = async () => {
    try {
      const [eventsRes, newsRes, projectsRes, blogRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('blog').select('id', { count: 'exact', head: true })
      ]);

      setCounts({
        events: eventsRes.count || 0,
        news: newsRes.count || 0,
        projects: projectsRes.count || 0,
        blog: blogRes.count || 0
      });
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const checkAuth = () => {
    const simpleAuth = localStorage.getItem("adminAuth");
    if (simpleAuth !== "true") {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  };

  const loadActivityLogs = () => {
    const logs = getActivityLogs(50);
    setActivityLogs(logs);
  };

  const loadCurrentEmail = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_email')
        .single();
      
      if (!error && data) {
        setCurrentEmail(data.value);
      } else {
        setCurrentEmail('admin@spolder.org'); // Default email
      }
    } catch (err) {
      console.error("Email yüklenemedi:", err);
      setCurrentEmail('admin@spolder.org');
    }
  };

  const loadMapEmbed = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'contact_map_embed')
        .single();
      if (!error && data?.value) {
        setMapEmbed(data.value);
        setMapEmbedInput(data.value);
      }
    } catch (err) {
      console.error("Harita ayarı yüklenemedi:", err);
    }
  };

  const handleExport = () => {
    try {
      exportAllData();
      toast.success('Tüm veriler başarıyla dışa aktarıldı!');
    } catch (error) {
      toast.error('Dışa aktarma sırasında hata oluştu');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await importData(file);
      toast.success('Veriler başarıyla içe aktarıldı!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('İçe aktarma sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    const success = clearAllData();
    if (success) {
      toast.success('Tüm veriler temizlendi!');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.warning('Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }

    if (newPassword.length < 6) {
      toast.warning('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'admin_password', value: newPassword, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Şifre başarıyla değiştirildi!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Şifre güncellenemedi: ' + err.message);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.warning('Lütfen yeni e-posta adresini girin');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'admin_email', value: newEmail, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('E-posta başarıyla değiştirildi!');
      setCurrentEmail(newEmail);
      setNewEmail('');
      localStorage.setItem("adminEmail", newEmail);
    } catch (err: any) {
      toast.error('E-posta güncellenemedi: ' + err.message);
    }
  };

  const handleMapEmbedChange = async () => {
    if (!mapEmbedInput) {
      toast.warning('Lütfen harita yerleşim (embed) URL bilgisini girin');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'contact_map_embed', value: mapEmbedInput, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      setMapEmbed(mapEmbedInput);
      toast.success('Harita konumu güncellendi');
    } catch (err: any) {
      toast.error('Harita bilgisi güncellenemedi: ' + err.message);
    }
  };

  const loadOrganizationLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'organization_location')
        .single();
      if (!error && data?.value) {
        setOrganizationLocation(data.value);
        setOrganizationLocationInput(data.value);
      }
    } catch (err) {
      console.error("Konum ayarı yüklenemedi:", err);
    }
  };

  const handleOrganizationLocationChange = async () => {
    if (!organizationLocationInput.trim()) {
      toast.warning('Lütfen konum bilgisini girin');
      return;
    }

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'organization_location', value: organizationLocationInput, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      setOrganizationLocation(organizationLocationInput);
      toast.success('Konum bilgisi başarıyla güncellendi');
    } catch (err: any) {
      toast.error('Konum güncellenemedi: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
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
            <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
          </div>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8 space-y-6">
        {/* Veri Yönetimi */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Veri Yönetimi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Verileri Dışa Aktar
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full flex items-center gap-2 pointer-events-none">
                <Upload className="w-4 h-4" />
                Verileri İçe Aktar
              </Button>
            </div>

            <Button 
              onClick={handleClearData} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Tüm Verileri Temizle
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            💡 Veri dışa aktarma özelliği ile tüm içeriklerinizi yedekleyebilirsiniz. 
            İçe aktarma yapmadan önce mevcut verilerinizi yedeklemeyi unutmayın.
          </p>
        </div>

        {/* Şifre Değiştirme */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Giriş Bilgilerini Güncelle
          </h2>
          
          {/* Email Değiştirme */}
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-foreground mb-3">E-posta Adresi</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Mevcut e-posta: <span className="font-medium text-foreground">{currentEmail}</span>
            </p>
            <div className="flex gap-4 max-w-2xl">
              <div className="flex-1">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="yeni@email.com"
                />
              </div>
              <Button onClick={handleEmailChange}>
                E-postayı Güncelle
              </Button>
            </div>
          </div>

          {/* Şifre Değiştirme */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Şifre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Yeni Şifre
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Şifre Tekrar
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifreyi tekrar girin"
                />
              </div>
            </div>

            <Button 
              onClick={handlePasswordChange} 
              className="mt-4"
            >
              Şifreyi Güncelle
            </Button>
          </div>
        </div>

        {/* İletişim Haritası */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">İletişim Haritası</h2>
          <p className="text-sm text-muted-foreground mb-4">İletişim sayfasında görünen Google Maps yerleşim (embed) URL'sini güncelleyin.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Harita Embed URL</label>
              <Input
                value={mapEmbedInput}
                onChange={(e) => setMapEmbedInput(e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-muted-foreground mt-2">Mevcut: {mapEmbed || 'Henüz kaydedilmedi'}</p>
            </div>
            <div className="flex items-end">
              <Button onClick={handleMapEmbedChange} className="w-full">Kaydet</Button>
            </div>
          </div>
        </div>

        {/* Kuruluş Konumu */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Kuruluş Konumu</h2>
          <p className="text-sm text-muted-foreground mb-4">İletişim sayfasında gösterilecek adres bilgisini güncelleyin.</p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adres Bilgisi</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={organizationLocationInput}
                onChange={(e) => setOrganizationLocationInput(e.target.value)}
                placeholder="Atatürk Bulvarı No: 123&#10;Çankaya, Ankara 06100"
              />
              <p className="text-xs text-muted-foreground mt-2">Her satıra bir satır adres bilgisi yazın.</p>
            </div>
            <Button onClick={handleOrganizationLocationChange} className="w-full">Konumu Kaydet</Button>
          </div>
        </div>

        {/* Aktivite Logu */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Aktivite Logu
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? 'Gizle' : 'Göster'}
            </Button>
          </div>

          {showLogs && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Henüz aktivite kaydı yok
                </p>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{log.user}</span>
                        {' '}
                        <span className="text-muted-foreground">{getActionText(log.action)}</span>
                        {' '}
                        <span className="font-medium">{getContentTypeText(log.contentType)}</span>
                        {' → '}
                        <span className="text-primary">"{log.contentTitle}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sistem Bilgileri */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Sistem Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Depolama Tipi</p>
              <p className="font-medium">Supabase</p>
            </div>
            <div>
              <p className="text-muted-foreground">Toplam Etkinlik</p>
              <p className="font-medium">{counts.events}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Toplam Haber</p>
              <p className="font-medium">{counts.news}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Toplam Proje</p>
              <p className="font-medium">{counts.projects}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Toplam Blog Yazısı</p>
              <p className="font-medium">{counts.blog}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
