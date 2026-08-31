import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Image as ImageIcon, Search, Filter, ExternalLink } from "lucide-react";
import { toast } from "@/lib/toast";

interface MediaItem {
  id: string;
  url: string;
  type: 'event' | 'news' | 'blog' | 'project';
  title: string;
  date: string;
  sourceId: number;
}

const AdminMediaLibrary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    checkAuth();
    loadMedia();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    setLoading(false);
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const allMedia: MediaItem[] = [];

      // Events'ten görselleri al
      const { data: events } = await supabase
        .from('events')
        .select('id, baslik, gorsel, created_at')
        .not('gorsel', 'is', null)
        .not('gorsel', 'eq', '');
      
      if (events) {
        events.forEach(event => {
          if (event.gorsel) {
            allMedia.push({
              id: `event-${event.id}`,
              url: event.gorsel,
              type: 'event',
              title: event.baslik,
              date: event.created_at,
              sourceId: event.id
            });
          }
        });
      }

      // News'ten görselleri al
      const { data: news } = await supabase
        .from('news')
        .select('id, baslik, gorsel, created_at')
        .not('gorsel', 'is', null)
        .not('gorsel', 'eq', '');
      
      if (news) {
        news.forEach(item => {
          if (item.gorsel) {
            allMedia.push({
              id: `news-${item.id}`,
              url: item.gorsel,
              type: 'news',
              title: item.baslik,
              date: item.created_at,
              sourceId: item.id
            });
          }
        });
      }

      // Blog'dan görselleri al
      const { data: blogs } = await supabase
        .from('blog')
        .select('id, title, image, created_at')
        .not('image', 'is', null)
        .not('image', 'eq', '');
      
      if (blogs) {
        blogs.forEach(blog => {
          if (blog.image) {
            allMedia.push({
              id: `blog-${blog.id}`,
              url: blog.image,
              type: 'blog',
              title: blog.title,
              date: blog.created_at,
              sourceId: blog.id
            });
          }
        });
      }

      // Projects'ten görselleri al
      const { data: projects } = await supabase
        .from('projects')
        .select('id, title, image, created_at')
        .not('image', 'is', null)
        .not('image', 'eq', '');
      
      if (projects) {
        projects.forEach(project => {
          if (project.image) {
            allMedia.push({
              id: `project-${project.id}`,
              url: project.image,
              type: 'project',
              title: project.title,
              date: project.created_at,
              sourceId: project.id
            });
          }
        });
      }

      // Tarihe göre sırala (en yeni en başta)
      allMedia.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setMedia(allMedia);
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
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-700';
      case 'news': return 'bg-green-100 text-green-700';
      case 'blog': return 'bg-purple-100 text-purple-700';
      case 'project': return 'bg-orange-100 text-orange-700';
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

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: number) => {
    const item = media.find(m => m.id === id);
    if (!confirm(`"${item?.name}" silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);
      if (error) throw error;
      logActivity('delete', 'file', item?.name || String(id));
      toast.success('Medya silindi!');
      loadMedia();
    } catch (err: any) {
      toast.error('Silme sırasında hata oluştu: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) {
      toast.warning('Lütfen silinecek medyaları seçin');
      return;
    }

    if (!confirm(`${selectedMedia.length} medya silinecek. Emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .in('id', selectedMedia);
      if (error) throw error;
      logActivity('delete', 'file', `${selectedMedia.length} medya`);
      setSelectedMedia([]);
      loadMedia();
      toast.success(`${selectedMedia.length} medya silindi!`);
    } catch (err: any) {
      toast.error('Toplu silme sırasında hata: ' + err.message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL kopyalandı!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
              <p className="text-gray-600">Sitede kullanılan tüm görseller</p>
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
            </div>
          </div>
        </div>

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
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMediaLibrary;
