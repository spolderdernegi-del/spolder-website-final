import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Search, Filter } from "lucide-react";
import { toast } from "@/lib/toast";
import { logActivity } from "@/lib/activityLog";

interface News {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  created_at: string;
  publishStatus?: 'draft' | 'published';
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  showInSlider?: boolean;
}

const AdminNews = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedNews, setSelectedNews] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    author: "",
    date: "",
    publishStatus: 'draft' as 'draft' | 'published',
    slug: "",
    showInSlider: false,
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    checkAuth();
    fetchNews();
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    try {
      const storedCategories = localStorage.getItem('spolder_categories');
      const categoriesData = storedCategories ? JSON.parse(storedCategories) : [];
      setCategories(categoriesData.filter((c: any) => c.type === 'news'));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const checkAuth = async () => {
    const simpleAuth = localStorage.getItem("adminAuth");
    if (simpleAuth === "true") {
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        toast.error("Haberler yüklenirken hata: " + error.message);
        return;
      }
      
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Haberler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image;

    setUploading(true);
    try {
      // Base64'e çevir ve imagePreview'i kullan (zaten base64 olarak var)
      return imagePreview;
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Slug oluştur
      const slug = formData.slug || formData.title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const dataToSave = { 
        ...formData, 
        image: imageUrl,
        slug,
        publishStatus: formData.publishStatus || 'draft'
      };

      if (editingNews) {
        // Update mevcut haber
        const { error } = await supabase
          .from('news')
          .update(dataToSave)
          .eq('id', editingNews.id);
        
        if (error) {
          throw error;
        }
        
        logActivity('update', 'news', formData.title);
        toast.success('Haber güncellendi!');
      } else {
        // Yeni haber ekle
        const { error } = await supabase
          .from('news')
          .insert([dataToSave]);
        
        if (error) {
          throw error;
        }
        
        logActivity('create', 'news', formData.title);
        toast.success('Haber eklendi!');
      }

      resetForm();
      fetchNews();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      excerpt: newsItem.excerpt,
      content: newsItem.content,
      image: newsItem.image,
      category: newsItem.category,
      author: newsItem.author,
      date: newsItem.date,
      publishStatus: newsItem.publishStatus || 'draft',
      slug: newsItem.slug || '',
      metaTitle: newsItem.metaTitle || '',
      metaDescription: newsItem.metaDescription || '',
      showInSlider: newsItem.showInSlider || false,
    });
    setImagePreview(newsItem.image || "");
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const newsItem = news.find(n => n.id === id);
    if (!confirm("Bu haberi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      logActivity('delete', 'news', newsItem?.title || 'Haber');
      toast.success('Haber silindi!');
      fetchNews();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNews.length === 0) {
      toast.warning('Lütfen silinecek haberleri seçin');
      return;
    }

    if (!confirm(`${selectedNews.length} haber silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .in('id', selectedNews);
      
      if (error) {
        throw error;
      }
      
      logActivity('delete', 'news', `${selectedNews.length} haber`);
      toast.success(`${selectedNews.length} haber silindi!`);
      
      setSelectedNews([]);
      fetchNews();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const togglePublishStatus = async (id: number, currentStatus?: 'draft' | 'published') => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const newsItem = news.find(n => n.id === id);
      
      const { error } = await supabase
        .from('news')
        .update({ publishStatus: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      logActivity(newStatus === 'published' ? 'publish' : 'unpublish', 'news', newsItem?.title || 'Haber');
      toast.success(newStatus === 'published' ? 'Haber yayınlandı!' : 'Haber taslağa alındı!');
      fetchNews();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.publishStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingNews(null);
    setImageFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      category: "",
      author: "",
      date: "",
      publishStatus: 'draft',
      slug: "",
      metaTitle: "",
      metaDescription: "",
      showInSlider: false,
    });
  };

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
            <h1 className="text-2xl font-bold text-foreground">Haber Yönetimi</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Haber
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingNews ? "Haber Düzenle" : "Yeni Haber Ekle"}
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Yazar</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="SPOLDER"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tarih</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Görsel</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  {imagePreview && (
                    <div className="mt-3 border rounded-lg p-2">
                      <img 
                        src={imagePreview} 
                        alt="Önizleme" 
                        className="max-w-full h-48 object-cover rounded"
                      />
                      {imageFile && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Boyut: {(imageFile.size / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">İçerik</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
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
                      placeholder="ornek-haber-basligi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Başlık
                      <span className="text-xs text-muted-foreground ml-2">(Google'da görünecek başlık)</span>
                    </label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder={formData.title || "Haber başlığı buraya"}
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.metaTitle?.length || 0}/60 karakter
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Meta Açıklama
                      <span className="text-xs text-muted-foreground ml-2">(Google'da görünecek açıklama)</span>
                    </label>
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder={formData.excerpt || "Haber hakkında kısa açıklama"}
                      rows={2}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.metaDescription?.length || 0}/160 karakter
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yayın Durumu</label>
                <select
                  value={formData.publishStatus}
                  onChange={(e) => setFormData({ ...formData, publishStatus: e.target.value as 'draft' | 'published' })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınla</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInSlider"
                  checked={formData.showInSlider}
                  onChange={(e) => setFormData({ ...formData, showInSlider: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="showInSlider" className="text-sm font-medium text-foreground cursor-pointer">
                  Ana Sayfada Slider'da Göster
                  <span className="text-xs text-muted-foreground ml-2">(Ana sayfa haber sliderında görünür)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">İçerik</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading || uploading} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading || uploading ? "Kaydediliyor..." : "Kaydet"}
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
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Haber görseli" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {formData.title || "Haber Başlığı"}
                </h2>
                {formData.category && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                    {formData.category}
                  </span>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {formData.date && <span>📅 {formData.date}</span>}
                  {formData.author && <span>✍️ {formData.author}</span>}
                </div>
                <p className="text-muted-foreground mb-4 font-medium">
                  {formData.excerpt || "Haber özeti burada görünecek..."}
                </p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formData.content ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{formData.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Haber içeriği burada görünecek...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arama ve Filtreleme */}
        {!showForm && news.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Haber ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
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
            {selectedNews.length > 0 && (
              <div className="flex items-center gap-4">
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Seçilenleri Sil ({selectedNews.length})
                </Button>
                <Button onClick={() => setSelectedNews([])} variant="outline" size="sm">
                  Seçimi Temizle
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading && news.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterCategory || filterStatus ? 'Arama kriterlerine uygun haber bulunamadı' : 'Henüz haber eklenmemiş'}
            </div>
          ) : (
            filteredNews.map((newsItem) => (
              <div
                key={newsItem.id}
                className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNews.includes(newsItem.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNews([...selectedNews, newsItem.id]);
                      } else {
                        setSelectedNews(selectedNews.filter(id => id !== newsItem.id));
                      }
                    }}
                    className="mt-1.5 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex gap-4 flex-1">
                    {newsItem.image && (
                      <img 
                        src={newsItem.image} 
                        alt={newsItem.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{newsItem.title}</h3>
                        {newsItem.publishStatus === 'draft' ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                            Taslak
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                            Yayında
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{newsItem.excerpt}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>📅 {newsItem.date}</span>
                        <span>✍️ {newsItem.author}</span>
                        {newsItem.category && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {newsItem.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={newsItem.publishStatus === 'published' ? 'default' : 'outline'}
                      onClick={() => togglePublishStatus(newsItem.id, newsItem.publishStatus)}
                      title={newsItem.publishStatus === 'published' ? 'Taslağa Al' : 'Yayınla'}
                    >
                      {newsItem.publishStatus === 'published' ? '👁️' : '📝'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(newsItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(newsItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

export default AdminNews;
