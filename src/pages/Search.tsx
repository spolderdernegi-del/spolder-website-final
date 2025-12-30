import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  author: string;
  image: string;
  category: string;
  link: string;
  date: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchAllContent();
  }, [query]);

  const searchAllContent = async () => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allResults: SearchResult[] = [];

      // Haberler
      const { data: news } = await supabase
        .from("news")
        .select("*")
        .eq("yayin_durumu", "yayinlandi")
        .or(`baslik.ilike.%${query}%,ozet.ilike.%${query}%,icerik.ilike.%${query}%,kategori.ilike.%${query}%`);
      
      if (news) {
        news.forEach((item) => {
          allResults.push({
            id: `news-${item.id}`,
            type: "Haber",
            title: item.baslik,
            excerpt: item.ozet || "",
            author: item.yazar || "SPOLDER",
            image: item.gorsel || "",
            category: item.kategori || "",
            link: `/haber/${item.id}`,
            date: item.tarih || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Etkinlikler
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("yayin_durumu", "yayinlandi")
        .or(`baslik.ilike.%${query}%,ozet.ilike.%${query}%,icerik.ilike.%${query}%,kategori.ilike.%${query}%`);
      
      if (events) {
        events.forEach((item) => {
          allResults.push({
            id: `event-${item.id}`,
            type: "Etkinlik",
            title: item.baslik,
            excerpt: item.ozet || "",
            author: "SPOLDER",
            image: item.gorsel || "",
            category: item.kategori || "",
            link: `/etkinlik/${item.id}`,
            date: item.tarih || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Projeler
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("publishStatus", "published")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`);
      
      if (projects) {
        projects.forEach((item) => {
          allResults.push({
            id: `project-${item.id}`,
            type: "Proje",
            title: item.title,
            excerpt: item.description || "",
            author: "SPOLDER",
            image: item.image || "",
            category: item.category || "",
            link: `/proje/${item.id}`,
            date: item.start_date || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Blog
      const { data: blogs } = await supabase
        .from("blog")
        .select("*")
        .eq("publishStatus", "published")
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`);
      
      if (blogs) {
        blogs.forEach((item) => {
          allResults.push({
            id: `blog-${item.id}`,
            type: "Blog",
            title: item.title,
            excerpt: item.excerpt || "",
            author: item.author || "SPOLDER",
            image: item.image || "",
            category: item.category || "",
            link: `/blog/${item.id}`,
            date: item.date || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error("Arama hatası:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
          <div className="container-custom mx-auto px-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Arama Sonuçları
            </h1>
            <p className="text-muted-foreground">
              "{query}" için <strong>{results.length}</strong> sonuç bulundu
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="section-padding">
          <div className="container-custom mx-auto">
            {loading ? (
              <div className="flex justify-center items-center min-h-96">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((item) => (
                  <Link
                    to={item.link}
                    key={item.id}
                    className="block bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {item.type}
                          </span>
                          <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground mb-2 hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {item.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-2">İçerik Bulunamadı</h2>
                <p className="text-muted-foreground mb-6">
                  "{query}" ile ilgili içerik bulunamadı. Lütfen farklı bir arama terimi deneyin.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-2">Arama Yapın</h2>
                <p className="text-muted-foreground mb-6">
                  Lütfen bir arama terimi girin.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
