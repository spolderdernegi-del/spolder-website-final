import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DOMPurify from "dompurify";

interface Project {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  status: string;
  start_date: string;
}

const ProjeDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proje, setProje] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, description, content, image, category, status:status, start_date')
          .eq('id', parseInt(id || "0"))
          .eq('publishStatus', 'published')
          .single();
        if (error) throw error;
        setProje(data as Project);
      } catch (err) {
        console.error('Project load error', err);
        setProje(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!proje) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Proje Bulunamadı</h1>
            <Link to="/projeler">
              <Button>Projeler Sayfasına Dön</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero Image */}
        <section className="relative h-96">
          <img
            src={proje.image}
            alt={proje.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-anthracite/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-custom mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-secondary text-primary-foreground text-xs font-medium rounded-full">
                  {proje.category}
                </span>
                <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                  {proje.status}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
                {proje.title}
              </h1>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-secondary/10 to-primary/10 py-8">
          <div className="container-custom mx-auto px-4">
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{proje.start_date}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="max-w-3xl">
              <article className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <div 
                  className="text-foreground/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(proje.content || '') }}
                />
              </article>

              <div className="py-8 border-t border-border">
                <Button onClick={() => window.history.back()} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Geri Dön
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProjeDetay;
