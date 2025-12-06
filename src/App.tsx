import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hakkimizda from "./pages/Hakkimizda";
import Haberler from "./pages/Haberler";
import HaberDetay from "./pages/HaberDetay";
import Etkinlikler from "./pages/Etkinlikler";
import EtkinlikDetay from "./pages/EtkinlikDetay";
import Projeler from "./pages/Projeler";
import ProjeDetay from "./pages/ProjeDetay";
import Iletisim from "./pages/Iletisim";
import Blog from "./pages/Blog";
import BlogDetay from "./pages/BlogDetay";
import Yayinlar from "./pages/Yayinlar";
import Search from "./pages/Search";
import Gizlilik from "./pages/Gizlilik";
import KVKK from "./pages/KVKK";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/lib/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
