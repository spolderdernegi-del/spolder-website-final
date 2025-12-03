import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hakkimizda from "./pages/Hakkimizda";
import Haberler from "./pages/Haberler";
import Etkinlikler from "./pages/Etkinlikler";
import Projeler from "./pages/Projeler";
import Iletisim from "./pages/Iletisim";
import Blog from "./pages/Blog";
import Yayinlar from "./pages/Yayinlar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hakkimizda" element={<Hakkimizda />} />
          <Route path="/haberler" element={<Haberler />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/projeler" element={<Projeler />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/yayinlar" element={<Yayinlar />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
