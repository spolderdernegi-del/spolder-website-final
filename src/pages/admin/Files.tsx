import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Download, FileText, Search } from "lucide-react";
import { toast } from "@/lib/toast";
import { logActivity } from "@/lib/activityLog";

interface File {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
}

const AdminFiles = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<globalThis.File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    checkAuth();
    fetchFiles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'files')
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

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error('Dosyalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const uploadFileToStorage = async (): Promise<{ url: string; type: string; size: number }> => {
    if (!uploadFile) throw new Error("Dosya seçilmedi");

    setUploading(true);
    try {
      // Base64'e çevir
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadFile);
      });

      return {
        url: base64,
        type: uploadFile.type,
        size: uploadFile.size,
      };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileData = null;

      if (uploadFile) {
        fileData = await uploadFileToStorage();
      }

      const dataToSave: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        file_url: fileData?.url ?? editingFile?.file_url ?? "",
        file_type: fileData?.type ?? editingFile?.file_type ?? "",
        file_size: fileData?.size ?? editingFile?.file_size ?? 0,
      };

      if (editingFile) {
        const { error } = await supabase
          .from('files')
          .update(dataToSave)
          .eq('id', editingFile.id);
        if (error) throw error;
        logActivity('update', 'file', formData.title);
        toast.success('Dosya güncellendi!');
      } else {
        const { error } = await supabase
          .from('files')
          .insert([dataToSave]);
        if (error) throw error;
        logActivity('create', 'file', formData.title);
        toast.success('Dosya eklendi!');
      }

      resetForm();
      fetchFiles();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (file: File) => {
    setEditingFile(file);
    setFormData({
      title: file.title,
      description: file.description,
      category: file.category,
    });
    setUploadFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const file = files.find(f => f.id === id);
    if (!confirm("Bu dosyayı silmek istediğinizden emin misiniz?")) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      if (error) throw error;

      logActivity('delete', 'file', file?.title || 'Dosya');
      toast.success('Dosya silindi!');
      fetchFiles();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Lütfen silinecek dosyaları seçin');
      return;
    }

    if (!confirm(`${selectedFiles.length} dosya silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', selectedFiles);
      if (error) throw error;

      logActivity('delete', 'file', `${selectedFiles.length} dosya`);
      toast.success(`${selectedFiles.length} dosya silindi!`);
      
      setSelectedFiles([]);
      fetchFiles();
    } catch (error: any) {
      toast.error("Hata: " + error.message);
    }
  };

  const filteredFiles = files.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingFile(null);
    setUploadFile(null);
    setFormData({
      title: "",
      description: "",
      category: "",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            <h1 className="text-2xl font-bold text-foreground">Dosya Yönetimi</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Dosya
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingFile ? "Dosya Düzenle" : "Yeni Dosya Ekle"}
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Dosya {!editingFile && "*"}</label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="mb-2"
                    required={!editingFile}
                  />
                  {uploadFile && (
                    <div className="mt-3 border rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{uploadFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Boyut: {formatFileSize(uploadFile.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Açıklama</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {formData.title || "Dosya Başlığı"}
                    </h2>
                    {formData.category && (
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                        {formData.category}
                      </span>
                    )}
                    {uploadFile && (
                      <div className="space-y-2 mb-3">
                        <div className="text-sm text-muted-foreground">
                          📄 Dosya Adı: <span className="font-medium">{uploadFile.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          💾 Dosya Boyutu: <span className="font-medium">{(uploadFile.size / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                    )}
                    <p className="text-muted-foreground mt-3">
                      {formData.description || "Dosya açıklaması burada görünecek..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Arama ve Filtreleme */}
        {!showForm && files.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Dosya ara..."
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
            </div>
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-4">
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Seçilenleri Sil ({selectedFiles.length})
                </Button>
                <Button onClick={() => setSelectedFiles([])} variant="outline" size="sm">
                  Seçimi Temizle
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading && files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || filterCategory ? 'Arama kriterlerine uygun dosya bulunamadı' : 'Henüz dosya eklenmemiş'}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-4"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                      }
                    }}
                    className="mt-1.5 w-5 h-5 cursor-pointer"
                  />
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{file.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{file.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>📦 {formatFileSize(file.file_size)}</span>
                        {file.category && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {file.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(file)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
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

export default AdminFiles;
