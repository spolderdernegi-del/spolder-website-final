import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader } from "lucide-react";
import ScrollToTop from "@/lib/ScrollToTop";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

// Her sayfa ayrı bir JS parçası (chunk) olarak, sadece o sayfaya girildiğinde
// indiriliyor. Böylece örn. bir haberi okumaya gelen sıradan bir ziyaretçi,
// hiç kullanmayacağı koca admin panelini (içerik editörü, Word import vb.)
// indirmek zorunda kalmıyor - önceden hepsi tek bir ~1.1MB dosyadaydı.
const Index = lazy(() => import("./pages/Index"));
const Hakkimizda = lazy(() => import("./pages/Hakkimizda"));
const Haberler = lazy(() => import("./pages/Haberler"));
const HaberDetay = lazy(() => import("./pages/HaberDetay"));
const Etkinlikler = lazy(() => import("./pages/Etkinlikler"));
const EtkinlikDetay = lazy(() => import("./pages/EtkinlikDetay"));
const Projeler = lazy(() => import("./pages/Projeler"));
const ProjeDetay = lazy(() => import("./pages/ProjeDetay"));
const Iletisim = lazy(() => import("./pages/Iletisim"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetay = lazy(() => import("./pages/BlogDetay"));
const Yayinlar = lazy(() => import("./pages/Yayinlar"));
const Search = lazy(() => import("./pages/Search"));
const Faaliyet = lazy(() => import("./pages/Faaliyet"));
const FaaliyetGonderi = lazy(() => import("./pages/FaaliyetGonderi"));
const Gizlilik = lazy(() => import("./pages/Gizlilik"));
const KVKK = lazy(() => import("./pages/KVKK"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminMediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminFiles = lazy(() => import("./pages/admin/Files"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminBlog = lazy(() => import("./pages/admin/Blog"));
const AdminContentEditor = lazy(() => import("./pages/admin/ContentEditor"));
const AdminWelcomeModal = lazy(() => import("./pages/admin/WelcomeModal"));
const AdminPageHeroes = lazy(() => import("./pages/admin/PageHeroes"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminBoard = lazy(() => import("./pages/admin/Board"));
const AdminContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const AdminGuide = lazy(() => import("./pages/admin/Guide"));
const AdminTrash = lazy(() => import("./pages/admin/Trash"));
const AdminActivities = lazy(() => import("./pages/admin/Activities"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GoogleAnalytics />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hakkimizda" element={<Hakkimizda />} />
          <Route path="/haberler" element={<Haberler />} />
          <Route path="/haber/:id" element={<HaberDetay />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/etkinlik/:id" element={<EtkinlikDetay />} />
          <Route path="/projeler" element={<Projeler />} />
          <Route path="/proje/:id" element={<ProjeDetay />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetay />} />
          <Route path="/yayinlar" element={<Yayinlar />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/search" element={<Search />} />
          <Route path="/faaliyetlerimiz/:slug" element={<Faaliyet />} />
          <Route path="/faaliyetlerimiz/:slug/:postId" element={<FaaliyetGonderi />} />
          <Route path="/gizlilik" element={<Gizlilik />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
          <Route path="/admin/files" element={<ProtectedRoute><AdminFiles /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
          <Route path="/admin/content-editor" element={<ProtectedRoute><AdminContentEditor /></ProtectedRoute>} />
          <Route path="/admin/page-heroes" element={<ProtectedRoute><AdminPageHeroes /></ProtectedRoute>} />
          <Route path="/admin/welcome-modal" element={<ProtectedRoute><AdminWelcomeModal /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><AdminMediaLibrary /></ProtectedRoute>} />
          <Route path="/admin/board" element={<ProtectedRoute><AdminBoard /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><AdminContactMessages /></ProtectedRoute>} />
          <Route path="/admin/activities" element={<ProtectedRoute><AdminActivities /></ProtectedRoute>} />
          <Route path="/admin/trash" element={<ProtectedRoute><AdminTrash /></ProtectedRoute>} />
          <Route path="/admin/guide" element={<ProtectedRoute><AdminGuide /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
