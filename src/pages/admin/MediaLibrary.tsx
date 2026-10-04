import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Image as ImageIcon, Search, Filter, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";
import { loadMediaItems, type MediaItem } from "@/lib/mediaLibrary";

const AdminMediaLibrary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploadsError, setUploadsError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
    loadMedia();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const { items, uploadsError: failed } = await loadMediaItems();
      setMedia(items);
      setUploadsError(failed);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error('Medya yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Etkinlik';
      case 'news': return 'Haber';
      case 'blog': return 'Blog';
      case 'project': return 'Proje';
      case 'upload': return 'Yüklenen';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-700';
      case 'news': return 'bg-green-100 text-green-700';
      case 'blog': return 'bg-purple-100 text-purple-700';
      case 'project': return 'bg-orange-100 text-orange-700';
      case 'upload': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownload = (url: string, title: string) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Görsel indiriliyor...');
      } else {
        window.open(url, '_blank');
        toast.success('Görsel yeni sekmede açıldı');
      }
    } catch (error) {
      toast.error('İndirme hatası');
    }
  };

  // Sunucuya yüklenmiş dosyalar (/uploads/...) silinebilir; dış bağlantılar silinemez.
  const uploadName = (url: string) => {
    const path = url.replace(/^https?:\/\/[^/]+/i, "");
    return path.startsWith("/uploads/") ? path.slice("/uploads/".length) : null;
  };

  const usageCount = (item: MediaItem) => {
    const name = uploadName(item.url);
    if (!name) return 0;
    return media.filter((m) => m.type !== "upload" && uploadName(m.url) === name).length;
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const name = uploadName(toDelete.url);
    if (!name) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/media", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || "Görsel silinemedi");
      toast.success("Görsel silindi");
      setToDelete(null);
      await loadMedia();
    } catch (err: any) {
      toast.error(err.message || "Görsel silinemedi");
    } finally {
      setDeleting(false);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard'a Dön
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medya Kütüphanesi</h1>
              <p className="text-gray-600">Siteye yüklenen tüm görseller</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Görsel ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                <Filter className="w-4 h-4 mr-2" />
                Tümü ({media.length})
              </Button>
              <Button
                variant={filterType === 'event' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('event')}
              >
                Etkinlikler
              </Button>
              <Button
                variant={filterType === 'news' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('news')}
              >
                Haberler
              </Button>
              <Button
                variant={filterType === 'blog' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('blog')}
              >
                Blog
              </Button>
              <Button
                variant={filterType === 'project' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('project')}
              >
                Projeler
              </Button>
              <Button
                variant={filterType === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('upload')}
              >
                Yüklenenler
              </Button>
            </div>
          </div>
        </div>

        {uploadsError && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Sunucudaki yüklenmiş dosyaların listesi alınamadı; sadece içeriklere bağlı görseller gösteriliyor.
          </div>
        )}

        {/* Empty State */}
        {filteredMedia.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Görsel bulunamadı</h3>
            <p className="text-gray-600">Filtrelerinize uygun görsel yok.</p>
          </div>
        )}

        {/* Media Grid */}
        {filteredMedia.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDownload(item.url, item.title)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {uploadName(item.url) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setToDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mb-2 ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </span>
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.date).toLocaleDateString('tr-TR')}
                    {item.size ? ` · ${formatFileSize(item.size)}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && !deleting && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görsel silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu görsel sunucudan kalıcı olarak silinir ve geri alınamaz.
              {toDelete && usageCount(toDelete) > 0
                ? ` Görsel ${usageCount(toDelete)} içerikte kullanılıyor; bu içeriklerde SPOLDER logolu varsayılan görsel (varsayilan-gorsel.png) görünecek.`
                : " Hiçbir içerikte kullanılmıyor."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMediaLibrary;
