import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Search, Filter } from "lucide-react";
import { toast } from "@/lib/toast";
import { logActivity } from "@/lib/activityLog";

interface Project {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  publishStatus?: 'draft' | 'published';
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  showInSlider?: boolean;
}

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
    category: "",
    status: "Devam Ediyor",
    start_date: "",
    end_date: "",
    showInSlider: false,
    publishStatus: 'draft' as 'draft' | 'published',
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    checkAuth();
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    try {
      const storedCategories = localStorage.getItem('spolder_categories');
      const categoriesData = storedCategories ? JSON.parse(storedCategories) : [];
      setCategories(categoriesData.filter((c: any) => c.type === 'projects'));
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

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase error:", error);
        toast.error("Projeler yüklenirken hata: " + error.message);
        return;
      }
      
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Projeler yüklenirken hata oluştu");
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

      if (editingProject) {
        // Update mevcut proje
        const { error } = await supabase
          .from('projects')
          .update(dataToSave)
          .eq('id', editingProject.id);
        
        if (error) {
          throw error;
        }
        
        logActivity('update', 'project', formData.title);
        toast.success('Proje güncellendi!');
      } else {
        // Yeni proje ekle
        const { error } = await supabase
          .from('projects')
          .insert([dataToSave]);
        
        if (error) {
          throw error;
        }
        
        logActivity('create', 'project', formData.title);
        toast.success('Proje eklendi!');
      }

      resetForm();
      fetchProjects();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      content: project.content,
      image: project.image,
      category: project.category,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      publishStatus: project.publishStatus || 'draft',
      slug: project.slug || '',
      metaTitle: project.metaTitle || '',
      metaDescription: project.metaDescription || '',
      showInSlider: project.showInSlider || false,
    });
    setImagePreview(project.image || "");
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const project = projects.find(p => p.id === id);
    if (!confirm("Bu projeyi silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      logActivity('delete', 'project', project?.title || 'Proje');
      toast.success('Proje silindi!');
      fetchProjects();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) {
      toast.warning('Lütfen silinecek projeleri seçin');
      return;
    }

    if (!confirm(`${selectedProjects.length} proje silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', selectedProjects);
      
      if (error) {
        throw error;
      }
      
      logActivity('delete', 'project', `${selectedProjects.length} proje`);
      toast.success(`${selectedProjects.length} proje silindi!`);
      
      setSelectedProjects([]);
      fetchProjects();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const togglePublishStatus = async (id: number, currentStatus?: 'draft' | 'published') => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const project = projects.find(p => p.id === id);
      
      const { error } = await supabase
        .from('projects')
        .update({ publishStatus: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      logActivity(newStatus === 'published' ? 'publish' : 'unpublish', 'project', project?.title || 'Proje');
      toast.success(newStatus === 'published' ? 'Proje yayınlandı!' : 'Proje taslağa alındı!');
      fetchProjects();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const filteredProjects = projects.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.publishStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setImageFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      description: "",
      content: "",
      image: "",
      category: "",
      status: "Devam Ediyor",
      start_date: "",
      end_date: "",
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
            <h1 className="text-2xl font-bold text-foreground">Proje Yönetimi</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Proje
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingProject ? "Proje Düzenle" : "Yeni Proje Ekle"}
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
                  <label className="block text-sm font-medium text-foreground mb-2">Başlangıç Tarihi</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bitiş Tarihi</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Planlanıyor">Planlanıyor</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                  </select>
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
                <label className="block text-sm font-medium text-foreground mb-2">Detaylı Açıklama</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
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
                      placeholder="ornek-proje-basligi"
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
                      placeholder={formData.title || "Proje başlığı buraya"}
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
                      placeholder={formData.description || "Proje hakkında kısa açıklama"}
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
                  <span className="text-xs text-muted-foreground ml-2">(Ana sayfa proje sliderında görünür)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Detaylı İçerik</label>
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
                    alt="Proje görseli" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {formData.title || "Proje Başlığı"}
                </h2>
                {formData.category && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                    {formData.category}
                  </span>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {formData.start_date && <span>📅 Başlangıç: {formData.start_date}</span>}
                  {formData.end_date && <span>🏁 Bitiş: {formData.end_date}</span>}
                  <span className={`px-2 py-0.5 rounded ${formData.status === 'Planlanıyor' ? 'bg-yellow-100 text-yellow-700' : formData.status === 'Devam Ediyor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {formData.status}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4 font-medium">
                  {formData.description || "Proje açıklaması burada görünecek..."}
                </p>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {formData.content ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{formData.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Proje detayları burada görünecek...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arama ve Filtreleme */}
        {!showForm && projects.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Proje ara..."
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
            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-4">
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Seçilenleri Sil ({selectedProjects.length})
                </Button>
                <Button onClick={() => setSelectedProjects([])} variant="outline" size="sm">
                  Seçimi Temizle
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading && projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterCategory || filterStatus ? 'Arama kriterlerine uygun proje bulunamadı' : 'Henüz proje eklenmemiş'}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProjects([...selectedProjects, project.id]);
                      } else {
                        setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                      }
                    }}
                    className="mt-1.5 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex gap-4 flex-1">
                    {project.image && (
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                        {project.publishStatus === 'draft' ? (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                            Taslak
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                            Yayında
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>📅 {project.start_date} - {project.end_date}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                          {project.status}
                        </span>
                        {project.category && (
                          <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded">
                            {project.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={project.publishStatus === 'published' ? 'default' : 'outline'}
                      onClick={() => togglePublishStatus(project.id, project.publishStatus)}
                      title={project.publishStatus === 'published' ? 'Taslağa Al' : 'Yayınla'}
                    >
                      {project.publishStatus === 'published' ? '👁️' : '📝'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(project.id)}
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

export default AdminProjects;
