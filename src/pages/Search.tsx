import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { matchStaticPages } from "@/lib/staticPages";
import { useCategoryColors, getCategoryBadgeStyle } from "@/hooks/useCategoryColors";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  author: string;
  image: string;
  category: string;
  categories?: string[];
  link: string;
  date: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  // Footer "Faaliyetlerimiz" bağlantıları ?kategori=eğitim,spor şeklinde gelir:
  // metin araması yapılmaz, sadece virgülle ayrılmış kategorilerden en az
  // birine sahip içerikler listelenir.
  const kategoriParam = searchParams.get("kategori") || "";
  const categoryList = kategoriParam
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const categoryMode = categoryList.length > 0;
  const normalize = (v: string) => v.trim().toLocaleLowerCase("tr");
  const wantedCategories = categoryList.map(normalize);
  const matchesCategories = (item: any) => {
    const cats: string[] =
      item.categories && item.categories.length > 0
        ? item.categories
        : item.kategori
          ? [item.kategori]
          : item.category
            ? [item.category]
            : [];
    return cats.some((c) => wantedCategories.includes(normalize(c)));
  };
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  // Arama sonuçları tüm içerik türlerini (haber/etkinlik/proje/blog)
  // karışık gösterdiği için tüm türlerdeki kategori renklerini kullanıyoruz.
  const categoryColors = useCategoryColors();

  useEffect(() => {
    searchAllContent();
  }, [query, kategoriParam]);

  const searchAllContent = async () => {
    if (!query && !categoryMode) {
      setResults([]);
      setLoading(false);
      return;
    }

    const allResults: SearchResult[] = [];
    try {
      setLoading(true);

      // Haberler
      let newsQuery = supabase
        .from("news")
        .select("*")
        .eq("yayin_durumu", "yayinlandi");
      if (!categoryMode) newsQuery = newsQuery.or(`baslik.ilike.%${query}%,ozet.ilike.%${query}%,icerik.ilike.%${query}%,kategori.ilike.%${query}%`);
      const { data: newsRaw } = await newsQuery;
      const news = categoryMode ? newsRaw?.filter(matchesCategories) : newsRaw;
      
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
            categories: item.categories,
            link: `/haber/${item.id}`,
            date: item.tarih || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Etkinlikler
      let eventsQuery = supabase
        .from("events")
        .select("*")
        .eq("yayin_durumu", "yayinlandi");
      if (!categoryMode) eventsQuery = eventsQuery.or(`baslik.ilike.%${query}%,ozet.ilike.%${query}%,icerik.ilike.%${query}%,kategori.ilike.%${query}%`);
      const { data: eventsRaw } = await eventsQuery;
      const events = categoryMode ? eventsRaw?.filter(matchesCategories) : eventsRaw;
      
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
            categories: item.categories,
            link: `/etkinlik/${item.id}`,
            date: item.tarih || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Projeler
      let projectsQuery = supabase
        .from("projects")
        .select("*")
        .eq("publishStatus", "published");
      if (!categoryMode) projectsQuery = projectsQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`);
      const { data: projectsRaw } = await projectsQuery;
      const projects = categoryMode ? projectsRaw?.filter(matchesCategories) : projectsRaw;
      
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
            categories: item.categories,
            link: `/proje/${item.id}`,
            date: item.start_date || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

      // Blog
      let blogsQuery = supabase
        .from("blog")
        .select("*")
        .eq("publishStatus", "published");
      if (!categoryMode) blogsQuery = blogsQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`);
      const { data: blogsRaw } = await blogsQuery;
      const blogs = categoryMode ? blogsRaw?.filter(matchesCategories) : blogsRaw;
      
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
            categories: item.categories,
            link: `/blog/${item.id}`,
            date: item.date || new Date(item.created_at).toLocaleDateString("tr-TR"),
          });
        });
      }

    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      // Sabit sayfalar (Kurumsal Kimlik, KVKK, İletişim vb.) veritabanından gelmez,
      // ayrı olarak, hata durumundan etkilenmeden aranır.
      const staticMatches = categoryMode ? [] : matchStaticPages(query);

      staticMatches.forEach((page) => {
        allResults.push({
          id: `page-${page.link}`,
          type: "Sayfa",
          title: page.title,
          excerpt: page.excerpt,
          author: "SPOLDER",
          image: "",
          category: "",
          link: page.link,
          date: "",
        });
      });

      setResults(allResults);
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
              {categoryMode ? (
                <>Kategori: <strong>{categoryList.join(", ")}</strong> - <strong>{results.length}</strong> sonuç bulundu</>
              ) : (
                <>"{query}" için <strong>{results.length}</strong> sonuç bulundu</>
              )}
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {item.type}
                          </span>
                          {item.categories && item.categories.length > 0 ? (
                            item.categories.map((cat, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded"
                                style={getCategoryBadgeStyle(categoryColors[cat])}
                              >
                                {cat}
                              </span>
                            ))
                          ) : item.category ? (
                            <span
                              className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded"
                              style={getCategoryBadgeStyle(categoryColors[item.category])}
                            >
                              {item.category}
                            </span>
                          ) : null}
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
            ) : query || categoryMode ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-2">İçerik Bulunamadı</h2>
                <p className="text-muted-foreground mb-6">
                  {categoryMode
                    ? `"${categoryList.join(", ")}" kategorisinde henüz içerik yok.`
                    : `"${query}" ile ilgili içerik bulunamadı. Lütfen farklı bir arama terimi deneyin.`}
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
