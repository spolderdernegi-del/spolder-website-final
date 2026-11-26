import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  useEffect(() => {
    document.title = "Sayfa Bulunamadı | SPOLDER";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 px-4">
        <div className="text-center py-20">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-8 text-xl text-muted-foreground">Aradığınız sayfa bulunamadı.</p>
          <Link to="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
