import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader } from "lucide-react";
import ScrollToTop from "@/lib/ScrollToTop";
import PageTracker from "@/lib/PageTracker";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminBoard = lazy(() => import("./pages/admin/Board"));
const AdminBankInfo = lazy(() => import("./pages/admin/BankInfo"));
const AdminContactMessages = lazy(() => import("./pages/admin/ContactMessages"));
const AdminGuide = lazy(() => import("./pages/admin/Guide"));
const AdminStats = lazy(() => import("./pages/admin/Stats"));

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
        <PageTracker />
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
          <Route path="/admin/welcome-modal" element={<ProtectedRoute><AdminWelcomeModal /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><AdminMediaLibrary /></ProtectedRoute>} />
          <Route path="/admin/board" element={<ProtectedRoute><AdminBoard /></ProtectedRoute>} />
          <Route path="/admin/bank-info" element={<ProtectedRoute><AdminBankInfo /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><AdminContactMessages /></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />
          <Route path="/admin/guide" element={<ProtectedRoute><AdminGuide /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/905423045073"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
          aria-label="WhatsApp ile iletişime geç"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
