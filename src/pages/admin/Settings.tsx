import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Upload, Trash2, Key, Activity } from "lucide-react";
import { exportAllData, importData, clearAllData } from "@/lib/dataManager";
import { toast } from "@/lib/toast";
import { getActivityLogs, getActionText, getContentTypeText, type ActivityLog } from "@/lib/activityLog";
import GoogleMapPicker from "@/components/admin/GoogleMapPicker";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [counts, setCounts] = useState({ events: 0, news: 0, projects: 0, blog: 0 });
  const [mapEmbed, setMapEmbed] = useState("");
  const [mapEmbedInput, setMapEmbedInput] = useState("");
  const [organizationLocation, setOrganizationLocation] = useState("");
  const [organizationLocationInput, setOrganizationLocationInput] = useState("");
  const [organizationLat, setOrganizationLat] = useState(39.9334);
  const [organizationLng, setOrganizationLng] = useState(32.8597);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    working_hours: "",
    iban_tl: "",
    iban_eur: ""
  });
  const [contactInfoInput, setContactInfoInput] = useState({
    phone: "",
    email: "",
    working_hours: "",
    iban_tl: "",
    iban_eur: ""
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
  }, [checkAuth]);

  useEffect(() => {
    loadActivityLogs();
    loadCounts();
    loadCurrentEmail();
    loadMapEmbed();
    loadOrganizationLocation();
    loadContactInfo();
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

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning('Lütfen tüm şifre alanlarını doldurun');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Yeni şifre en az 8 karakter olmalıdır');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || 'Şifre güncellenemedi');
      }
      toast.success('Şifreniz başarıyla değiştirildi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Şifre güncellenemedi');
    } finally {
      setChangingPassword(false);
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
        .select('key, value')
        .in('key', ['organization_location', 'organization_lat', 'organization_lng']);
      
      if (!error && data) {
        data.forEach(item => {
          if (item.key === 'organization_location') {
            setOrganizationLocation(item.value);
            setOrganizationLocationInput(item.value);
          } else if (item.key === 'organization_lat') {
            const lat = parseFloat(item.value);
            if (!isNaN(lat)) {
              setOrganizationLat(lat);
            }
          } else if (item.key === 'organization_lng') {
            const lng = parseFloat(item.value);
            if (!isNaN(lng)) {
              setOrganizationLng(lng);
            }
          }
        });
      }
    } catch (err) {
      console.error("Konum ayarı yüklenemedi:", err);
    }
  };

  const handleLocationChangeAuto = async (lat: number, lng: number) => {
    try {
      await supabase
        .from('settings')
        .upsert([
          { key: 'organization_location', value: organizationLocationInput, updated_at: new Date().toISOString() },
          { key: 'organization_lat', value: lat.toString(), updated_at: new Date().toISOString() },
          { key: 'organization_lng', value: lng.toString(), updated_at: new Date().toISOString() }
        ], { onConflict: 'key' });
      
      setOrganizationLat(lat);
      setOrganizationLng(lng);
      toast.success('Konum otomatik kaydedildi');
    } catch (err: any) {
      toast.error('Konum kaydedilemedi: ' + err.message);
    }
  };

  const loadContactInfo = async () => {
    try {
      const keys = ['contact_phone', 'contact_email', 'contact_working_hours', 'contact_iban_tl', 'contact_iban_eur'];
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', keys);
      
      if (!error && data) {
        const contactData: any = {
          phone: "",
          email: "",
          working_hours: "",
          iban_tl: "",
          iban_eur: ""
        };
        
        data.forEach((item: any) => {
          if (item.key === 'contact_phone') contactData.phone = item.value;
          if (item.key === 'contact_email') contactData.email = item.value;
          if (item.key === 'contact_working_hours') contactData.working_hours = item.value;
          if (item.key === 'contact_iban_tl') contactData.iban_tl = item.value;
          if (item.key === 'contact_iban_eur') contactData.iban_eur = item.value;
        });
        
        setContactInfo(contactData);
        setContactInfoInput(contactData);
      }
    } catch (err) {
      console.error("İletişim bilgileri yüklenemedi:", err);
    }
  };

  const handleContactInfoChange = async () => {
    try {
      const updates = [
        { key: 'contact_phone', value: contactInfoInput.phone },
        { key: 'contact_email', value: contactInfoInput.email },
        { key: 'contact_working_hours', value: contactInfoInput.working_hours },
        { key: 'contact_iban_tl', value: contactInfoInput.iban_tl },
        { key: 'contact_iban_eur', value: contactInfoInput.iban_eur }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: update.key, value: update.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
      }

      setContactInfo(contactInfoInput);
      toast.success('İletişim bilgileri başarıyla güncellendi');
    } catch (err: any) {
      toast.error('İletişim bilgileri güncellenemedi: ' + err.message);
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

        {/* E-posta Güncelleme */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            E-posta Adresi Güncelle
          </h2>
          
          <div>
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
        </div>

        {/* Şifre Değiştirme */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Şifre Değiştir
          </h2>

          <div className="grid gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mevcut Şifre</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mevcut şifreniz"
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yeni Şifre</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yeni Şifre (Tekrar)</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifreyi tekrar girin"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button onClick={handlePasswordChange} disabled={changingPassword} className="w-fit">
              {changingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
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
          <p className="text-sm text-muted-foreground mb-4">İletişim sayfasında gösterilecek adres ve harita konumunu güncelleyin.</p>
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Harita Konumu
                <span className="text-xs text-muted-foreground ml-2">(İşaretçiyi sürükleyin veya haritaya tıklayın)</span>
              </label>
              <GoogleMapPicker
                lat={organizationLat}
                lng={organizationLng}
                onLocationChange={handleLocationChangeAuto}
                height="400px"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Seçili Konum: {organizationLat.toFixed(6)}, {organizationLng.toFixed(6)}
              </p>
            </div>
            <Button 
              onClick={async () => {
                if (!organizationLocationInput.trim()) {
                  toast.warning('Lütfen konum bilgisini girin');
                  return;
                }
                await handleLocationChangeAuto(organizationLat, organizationLng);
              }} 
              className="w-full"
            >
              Konumu Kaydet
            </Button>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">İletişim Bilgileri</h2>
          <p className="text-sm text-muted-foreground mb-4">İletişim sayfasında gösterilecek tüm iletişim bilgilerini düzenleyin.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telefon</label>
              <Input
                type="tel"
                value={contactInfoInput.phone}
                onChange={(e) => setContactInfoInput({ ...contactInfoInput, phone: e.target.value })}
                placeholder="+90 (312) 123 45 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">E-posta</label>
              <Input
                type="email"
                value={contactInfoInput.email}
                onChange={(e) => setContactInfoInput({ ...contactInfoInput, email: e.target.value })}
                placeholder="info@spolder.org.tr"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Çalışma Saatleri</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              value={contactInfoInput.working_hours}
              onChange={(e) => setContactInfoInput({ ...contactInfoInput, working_hours: e.target.value })}
              placeholder="Pazartesi - Cuma: 09:00 - 18:00&#10;Cumartesi - Pazar: Kapalı"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">IBAN (TL)</label>
              <Input
                value={contactInfoInput.iban_tl}
                onChange={(e) => setContactInfoInput({ ...contactInfoInput, iban_tl: e.target.value })}
                placeholder="TR00 0000 0000 0000 0000 00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">IBAN (EUR)</label>
              <Input
                value={contactInfoInput.iban_eur}
                onChange={(e) => setContactInfoInput({ ...contactInfoInput, iban_eur: e.target.value })}
                placeholder="TR00 0000 0000 0000 0000 01"
              />
            </div>
          </div>

          <Button onClick={handleContactInfoChange} className="w-full mt-4">İletişim Bilgilerini Kaydet</Button>
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
              <p className="font-medium">PostgreSQL (Natro VPS)</p>
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
