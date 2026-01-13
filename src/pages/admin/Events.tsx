import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, MapPin, Search, Filter } from "lucide-react";
import { toast } from "@/lib/toast";
import { logActivity } from "@/lib/activityLog";
import ImageUploadField from "@/components/admin/ImageUploadField";
import GoogleMapPicker from "@/components/admin/GoogleMapPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Event {
  id: number;
  baslik: string;
  ozet: string;
  icerik: string;
  tarih: string;
  saat: string;
  konum: string;
  konum_lat?: number;
  konum_lng?: number;
  gorsel: string;
  kategori: string;
  kapasite: string;
  kayitli: string;
  durum: string;
  yayin_durumu: 'taslak' | 'yayinlandi';
  slug?: string;
  meta_baslik?: string;
  meta_aciklama?: string;
  sliderda_goster?: boolean;
  google_form_link?: string;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locationMode, setLocationMode] = useState<'manual' | 'map'>('manual');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    baslik: "",
    ozet: "",
    icerik: "",
    tarih: "",
    saat: "",
    konum: "",
    konum_lat: 0,
    konum_lng: 0,
    gorsel: "",
    kategori: "",
    kapasite: "",
    kayitli: "0",
    durum: "Açık",
    yayin_durumu: "taslak" as 'taslak' | 'yayinlandi',
    slug: "",
    meta_baslik: "",
    meta_aciklama: "",
    sliderda_goster: false,
    google_form_link: "",
  });

  useEffect(() => {
    checkAuth();
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'events')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Etkinlikler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kategori kontrolü
    if (!formData.kategori || formData.kategori.trim() === "") {
      toast.error("Lütfen bir kategori seçin! Kategori oluşturmak için Kategoriler sayfasına gidin.");
      return;
    }

    // Diğer zorunlu alanları kontrol et
    if (!formData.baslik || formData.baslik.trim() === "") {
      toast.warning("Başlık alanı zorunludur!");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = formData.gorsel;

      // Slug oluştur
      const slug = formData.slug || formData.baslik.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const dataToSave = { ...formData, gorsel: imageUrl, slug };

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(dataToSave)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        logActivity('update', 'event', formData.baslik);
        toast.success(`"${formData.baslik}" başarıyla güncellendi!`);
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([dataToSave]);
        
        if (error) throw error;
        logActivity('create', 'event', formData.baslik);
        toast.success(`"${formData.baslik}" başarıyla oluşturuldu!`);
      }

      resetForm();
      fetchEvents();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      baslik: event.baslik,
      ozet: event.ozet,
      icerik: event.icerik,
      tarih: event.tarih,
      saat: event.saat,
      konum: event.konum,
      konum_lat: event.konum_lat || 0,
      konum_lng: event.konum_lng || 0,
      gorsel: event.gorsel,
      kategori: event.kategori,
      kapasite: event.kapasite,
      kayitli: event.kayitli,
      durum: event.durum,
      yayin_durumu: event.yayin_durumu || 'yayinlandi',
      slug: event.slug || '',
      meta_baslik: event.meta_baslik || '',
      meta_aciklama: event.meta_aciklama || '',
      sliderda_goster: event.sliderda_goster || false,
      google_form_link: event.google_form_link || '',
    });
    if (event.konum_lat && event.konum_lng) {
      setLocationMode('map');
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) return;

    try {
      console.log("Silme işlemi başlatılıyor, ID:", id);
      
      // Önce etkinliği alalım (log için)
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error("Etkinlik bilgisi alınamadı:", fetchError);
      }

      // Silme işlemi
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error("Silme hatası:", deleteError);
        throw deleteError;
      }
      
      console.log("Silme başarılı!");
      
      if (event) {
        const title = event.title || event.baslik || 'Etkinlik';
        logActivity('delete', 'event', title);
        toast.success(`"${title}" başarıyla silindi!`);
      } else {
        toast.success('Etkinlik başarıyla silindi!');
      }
      
      fetchEvents();
    } catch (error: any) {
      console.error("handleDelete catch bloğu:", error);
      toast.error("Silme hatası: " + (error.message || "Bilinmeyen hata"));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.length === 0) {
      toast.warning('Lütfen silinecek etkinlikleri seçin');
      return;
    }

    if (!confirm(`${selectedEvents.length} etkinlik silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .in('id', selectedEvents);

      if (error) throw error;

      logActivity('delete', 'event', `${selectedEvents.length} etkinlik`);
      toast.success(`${selectedEvents.length} etkinlik başarıyla silindi!`);

      setSelectedEvents([]);
      fetchEvents();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const togglePublishStatus = async (event: Event) => {
    try {
      const newStatus = event.yayin_durumu === 'yayinlandi' ? 'taslak' : 'yayinlandi';
      const { error } = await supabase
        .from('events')
        .update({ yayin_durumu: newStatus })
        .eq('id', event.id);

      if (error) throw error;

      logActivity(newStatus === 'yayinlandi' ? 'publish' : 'unpublish', 'event', event.baslik);
      toast.success(`"${event.baslik}" ${newStatus === 'yayinlandi' ? 'yayınlandı' : 'taslağa alındı'}!`);

      fetchEvents();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setLocationMode('manual');
    setFormData({
      baslik: "",
      ozet: "",
      icerik: "",
      tarih: "",
      saat: "",
      konum: "",
      konum_lat: 0,
      konum_lng: 0,
      gorsel: "",
      kategori: "",
      kapasite: "",
      kayitli: "0",
      durum: "Açık",
      yayin_durumu: "taslak",
      slug: "",
      meta_baslik: "",
      meta_aciklama: "",
      sliderda_goster: false,
      google_form_link: "",
    });
  };

  // Filtrelenmiş ve aranmış etkinlikler
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.ozet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || event.kategori === filterCategory;
    const matchesStatus = !filterStatus || event.durum === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            <h1 className="text-2xl font-bold text-foreground">Etkinlik Yönetimi</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Etkinlik
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingEvent ? "Etkinlik Düzenle" : "Yeni Etkinlik Ekle"}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Başlık *</label>
                  <Input
                    required
                    value={formData.baslik}
                    onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kategori *</label>
                  {categories.length === 0 ? (
                    <div className="text-sm text-red-500 p-2 border border-red-300 rounded-md bg-red-50">
                      ⚠️ Henüz kategori oluşturulmamış. <Link to="/admin/categories" className="underline font-medium">Kategoriler sayfasına</Link> gidip etkinlik kategorisi ekleyin.
                    </div>
                  ) : (
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Kategori seçin...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tarih</label>
                  <Input
                    type="date"
                    value={formData.tarih}
                    onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Saat</label>
                  <Input
                    type="time"
                    value={formData.saat}
                    onChange={(e) => setFormData({ ...formData, saat: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Konum</label>
                  
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant={locationMode === 'manual' ? 'default' : 'outline'}
                      onClick={() => setLocationMode('manual')}
                      className="flex-1"
                    >
                      Manuel Giriş
                    </Button>
                    <Button
                      type="button"
                      variant={locationMode === 'map' ? 'default' : 'outline'}
                      onClick={() => setLocationMode('map')}
                      className="flex-1"
                    >
                      Haritadan Seç
                    </Button>
                  </div>

                  {locationMode === 'manual' ? (
                    <Input
                      value={formData.konum}
                      onChange={(e) => setFormData({ ...formData, konum: e.target.value })}
                      placeholder="İstanbul Kongre Merkezi"
                    />
                  ) : (
                    <div className="space-y-3">
                      <Input
                        value={formData.konum}
                        onChange={(e) => setFormData({ ...formData, konum: e.target.value })}
                        placeholder="Konum adı (örn: İstanbul Kongre Merkezi)"
                        className="mb-2"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Google Haritasında işaretçiyi sürükleyin veya haritaya tıklayarak konum seçin
                      </p>
                      <GoogleMapPicker
                        lat={formData.konum_lat}
                        lng={formData.konum_lng}
                        onLocationChange={(lat, lng) => {
                          setFormData({ 
                            ...formData, 
                            konum_lat: parseFloat(lat.toFixed(6)),
                            konum_lng: parseFloat(lng.toFixed(6))
                          });
                        }}
                        height="400px"
                      />
                      {formData.konum_lat !== 0 && formData.konum_lng !== 0 && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded">
                          <strong>Seçili Konum:</strong> {formData.konum_lat.toFixed(6)}, {formData.konum_lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  )}\n                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kapasite</label>
                  <Input
                    type="number"
                    value={formData.kapasite}
                    onChange={(e) => setFormData({ ...formData, kapasite: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kayıtlı</label>
                  <Input
                    type="number"
                    value={formData.kayitli}
                    onChange={(e) => setFormData({ ...formData, kayitli: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Durum</label>
                  <select
                    value={formData.durum}
                    onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Açık">Açık</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Google Form Kayıt Linki
                    <span className="text-xs text-muted-foreground ml-2">(Etkinliğe kayıt için)</span>
                  </label>
                  <Input
                    type="url"
                    value={formData.google_form_link}
                    onChange={(e) => setFormData({ ...formData, google_form_link: e.target.value })}
                    placeholder="https://docs.google.com/forms/d/e/..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    "Kayıt Ol" butonuna tıklandığında bu link açılacak
                  </p>
                </div>

                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Görsel"
                    value={formData.gorsel}
                    onChange={(value) => setFormData({ ...formData, gorsel: value })}
                    required
                    aspectRatio={16 / 9}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Özet</label>
                <Textarea
                  value={formData.ozet}
                  onChange={(e) => setFormData({ ...formData, ozet: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">İçerik</label>
                <RichTextEditor
                  value={formData.icerik}
                  onChange={(value) => setFormData({ ...formData, icerik: value })}
                  placeholder="Etkinlik içeriğini buraya yazın..."
                  rows={6}
                />
              </div>

              {/* SEO Metadata Bölümü */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  🔍 SEO Ayarları (Opsiyonel)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      URL Slug
                      <span className="text-xs text-muted-foreground ml-2">(Otomatik oluşturulur)</span>
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="ornek-etkinlik-basligi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Başlık
                      <span className="text-xs text-muted-foreground ml-2">(Google'da görünecek başlık)</span>
                    </label>
                    <Input
                      value={formData.meta_baslik}
                      onChange={(e) => setFormData({ ...formData, meta_baslik: e.target.value })}
                      placeholder={formData.baslik || "Etkinlik başlığı buraya"}
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_baslik?.length || 0}/60 karakter
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Açıklama
                      <span className="text-xs text-muted-foreground ml-2">(Google'da görünecek açıklama)</span>
                    </label>
                    <Textarea
                      value={formData.meta_aciklama}
                      onChange={(e) => setFormData({ ...formData, meta_aciklama: e.target.value })}
                      placeholder={formData.ozet || "Etkinlik hakkında kısa açıklama"}
                      rows={2}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_aciklama?.length || 0}/160 karakter
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yayın Durumu</label>
                <select
                  value={formData.yayin_durumu}
                  onChange={(e) => setFormData({ ...formData, yayin_durumu: e.target.value as 'taslak' | 'yayinlandi' })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
                >
                  <option value="taslak">Taslak</option>
                  <option value="yayinlandi">Yayınla</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInSlider"
                  checked={formData.sliderda_goster}
                  onChange={(e) => setFormData({ ...formData, sliderda_goster: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="showInSlider" className="text-sm font-medium text-foreground cursor-pointer">
                  Ana Sayfada Slider'da Göster
                  <span className="text-xs text-muted-foreground ml-2">(Haber/Proje sliderlarında görünür)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">İçerik</label>
                <RichTextEditor
                  value={formData.icerik}
                  onChange={(value) => setFormData({ ...formData, icerik: value })}
                  placeholder="Etkinlik içeriğini buraya yazın..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  İptal
                </Button>
              </div>
            </form>

            {/* Önizleme Bölümü */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-foreground mb-4">Önizleme</h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
                {formData.gorsel && (
                  <img 
                    src={formData.gorsel} 
                    alt="Etkinlik görseli" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {formData.baslik || "Etkinlik Başlığı"}
                </h2>
                {formData.kategori && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                    {formData.kategori}
                  </span>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {formData.tarih && <span>📅 {formData.tarih}</span>}
                  {formData.saat && <span>🕐 {formData.saat}</span>}
                  {formData.konum && <span>📍 {formData.konum}</span>}
                  {formData.kapasite && <span>👥 Kapasite: {formData.kapasite}</span>}
                  <span className={`px-2 py-0.5 rounded ${formData.durum === 'Açık' ? 'bg-green-100 text-green-700' : formData.durum === 'Devam Ediyor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {formData.durum}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {formData.ozet || "Etkinlik özeti burada görünecek..."}
                </p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formData.icerik ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.icerik }} />
                  ) : (
                    <p className="text-muted-foreground italic">Etkinlik içeriği burada görünecek...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arama ve Filtreleme Araçları */}
        {!showForm && events.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Arama */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Etkinlik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Kategori Filtresi */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Durum Filtresi */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
              >
                <option value="">Tüm Durumlar</option>
                <option value="draft">Taslak</option>
                <option value="published">Yayınlanmış</option>
              </select>
            </div>

            {/* Toplu İşlemler */}
            {selectedEvents.length > 0 && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleBulkDelete}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Seçilenleri Sil ({selectedEvents.length})
                </Button>
                <Button
                  onClick={() => setSelectedEvents([])}
                  variant="outline"
                  size="sm"
                >
                  Seçimi Temizle
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading && events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterCategory || filterStatus ? 'Arama kriterlerine uygun etkinlik bulunamadı' : 'Henüz etkinlik eklenmemiş'}
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Seçim Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents([...selectedEvents, event.id]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                      }
                    }}
                    className="mt-1.5 w-5 h-5 cursor-pointer"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{event.baslik}</h3>
                          {event.yayin_durumu === 'taslak' ? (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                              Taslak
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                              Yayında
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.ozet}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>📅 {event.tarih}</span>
                      <span>🕐 {event.saat}</span>
                      <span>📍 {event.konum}</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {event.durum}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={event.yayin_durumu === 'yayinlandi' ? 'default' : 'outline'}
                      onClick={() => togglePublishStatus(event)}
                      title={event.yayin_durumu === 'yayinlandi' ? 'Taslağa Al' : 'Yayınla'}
                    >
                      {event.yayin_durumu === 'yayinlandi' ? '👁️' : '📝'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEvents;
