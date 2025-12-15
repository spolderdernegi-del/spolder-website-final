import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Briefcase, Download, LogOut, Users, Tag, BookOpen, MessageSquare, Settings, Image, UserCircle, CreditCard } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    news: 0,
    blog: 0,
    projects: 0,
    files: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    // Basit auth kontrolü
    const simpleAuth = localStorage.getItem("adminAuth");
    if (simpleAuth === "true") {
      setUser({ email: "admin@spolder.org" });
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    setUser(session.user);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const eventsData = JSON.parse(localStorage.getItem('spolder_events') || '[]');
      const newsData = JSON.parse(localStorage.getItem('spolder_news') || '[]');
      const blogData = JSON.parse(localStorage.getItem('spolder_blog') || '[]');
      const projectsData = JSON.parse(localStorage.getItem('spolder_projects') || '[]');
      const filesData = JSON.parse(localStorage.getItem('spolder_files') || '[]');

      setStats({
        events: eventsData.length,
        news: newsData.length,
        blog: blogData.length,
        projects: projectsData.length,
        files: filesData.length,
      });
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("adminAuth");
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Etkinlikler",
      description: "Etkinlik ekle, düzenle, sil",
      icon: Calendar,
      href: "/admin/events",
      color: "bg-blue-500",
    },
    {
      title: "Haberler",
      description: "Haber ekle, düzenle, sil",
      icon: FileText,
      href: "/admin/news",
      color: "bg-green-500",
    },
    {
      title: "Blog",
      description: "Blog yazıları ekle, düzenle",
      icon: BookOpen,
      href: "/admin/blog",
      color: "bg-indigo-500",
    },
    {
      title: "Projeler",
      description: "Proje ekle, düzenle, sil",
      icon: Briefcase,
      href: "/admin/projects",
      color: "bg-purple-500",
    },
    {
      title: "Dosyalar",
      description: "PDF, resim ve diğer dosyalar",
      icon: Download,
      href: "/admin/files",
      color: "bg-orange-500",
    },
    {
      title: "Kategoriler",
      description: "İçerikleri kategorilere ayır",
      icon: Tag,
      href: "/admin/categories",
      color: "bg-pink-500",
    },
    {
      title: "Medya Kütüphanesi",
      description: "Görseller ve dosyaları yönet",
      icon: Image,
      href: "/admin/media",
      color: "bg-teal-500",
    },
    {
      title: "Yönetim Kurulu",
      description: "Yönetim kurulu üyelerini düzenle",
      icon: UserCircle,
      href: "/admin/board",
      color: "bg-amber-500",
    },
    {
      title: "IBAN Bilgileri",
      description: "Bağış hesap bilgilerini düzenle",
      icon: CreditCard,
      href: "/admin/bank-info",
      color: "bg-emerald-500",
    },
    {
      title: "Hoş Geldiniz Pop-up",
      description: "Ana sayfa pop-up içeriği düzenle",
      icon: MessageSquare,
      href: "/admin/welcome-modal",
      color: "bg-cyan-500",
    },
    {
      title: "Ayarlar",
      description: "Veri yönetimi, aktivite logu, şifre",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SPOLDER Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Hoş geldiniz, {user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Yönetim Paneli</h2>
          <p className="text-muted-foreground">İçerik yönetimi için aşağıdaki seçenekleri kullanabilirsiniz</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Etkinlik</p>
                <p className="text-3xl font-bold text-foreground">{stats.events}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Haber</p>
                <p className="text-3xl font-bold text-foreground">{stats.news}</p>
              </div>
              <FileText className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Toplam Proje</p>
                <p className="text-3xl font-bold text-foreground">{stats.projects}</p>
              </div>
              <Briefcase className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Son Eklenen İçerikler */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">Son Eklenen İçerikler</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Son Etkinlikler */}
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Son Etkinlikler
                </h4>
                <Link to="/admin/events">
                  <Button variant="ghost" size="sm">Tümü</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {JSON.parse(localStorage.getItem('spolder_events') || '[]')
                  .slice(0, 5)
                  .map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date || 'Tarih belirtilmemiş'}</p>
                      </div>
                    </div>
                  ))}
                {JSON.parse(localStorage.getItem('spolder_events') || '[]').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz etkinlik eklenmemiş</p>
                )}
              </div>
            </div>

            {/* Son Haberler */}
            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Son Haberler
                </h4>
                <Link to="/admin/news">
                  <Button variant="ghost" size="sm">Tümü</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {JSON.parse(localStorage.getItem('spolder_news') || '[]')
                  .slice(0, 5)
                  .map((news: any) => (
                    <div key={news.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{news.title}</p>
                        <p className="text-xs text-muted-foreground">{news.date || 'Tarih belirtilmemiş'}</p>
                      </div>
                    </div>
                  ))}
                {JSON.parse(localStorage.getItem('spolder_news') || '[]').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Henüz haber eklenmemiş</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
