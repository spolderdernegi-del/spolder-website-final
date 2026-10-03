import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCategoryColors, getCategoryBadgeStyle } from "@/hooks/useCategoryColors";
import CategoryFilterBar from "@/components/shared/CategoryFilterBar";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  categories?: string[];
  content: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryColors = useCategoryColors("blog");

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("blog")
        .select("*")
        .eq('publishStatus', 'published')
        .order("date", { ascending: false });
      
      if (supabaseError) throw supabaseError;
      setPosts(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blog yazıları yüklenirken hata oluştu");
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = Array.from(
    new Set(posts.flatMap((post) => (post.categories && post.categories.length > 0 ? post.categories : post.category ? [post.category] : [])))
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const filteredPosts = selectedCategory
    ? posts.filter((post) =>
        (post.categories && post.categories.length > 0 ? post.categories : post.category ? [post.category] : []).includes(selectedCategory)
      )
    : posts;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-blue py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Spor politikaları, araştırmalar ve güncel gelişmeler hakkında uzman görüşleri ve analizler
            </p>
          </div>
        </section>

      {/* Loading State */}
      {loading && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4 flex justify-center items-center min-h-96">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        </section>
      )}

      {/* Filter */}
      {!loading && posts.length > 0 && (
        <section className="pt-4">
          <div className="container-custom mx-auto px-4">
            <CategoryFilterBar
              categories={availableCategories}
              categoryColors={categoryColors}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredPosts.length === 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Blog yazısı bulunamadı</h3>
            <p className="text-muted-foreground">
              {selectedCategory ? "Bu kategoride gösterilecek bir blog yazısı yok." : "Şu anda gösterilecek bir blog yazısı yok."}
            </p>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {!loading && filteredPosts.length > 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4">
            <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(filteredPosts[0].categories && filteredPosts[0].categories.length > 0 ? filteredPosts[0].categories : filteredPosts[0].category ? [filteredPosts[0].category] : []).map((cat, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                        style={getCategoryBadgeStyle(categoryColors[cat])}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {filteredPosts[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {filteredPosts[0].date}
                    </span>
                  </div>
                  <Link to={`/blog/${filteredPosts[0].id}`}>
                    <Button variant="gradient" className="w-fit">
                      Devamını Oku
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      {!loading && filteredPosts.length > 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post) => (
                <Link
                  to={`/blog/${post.id}`}
                  key={post.id}
                  className="group block bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(post.categories && post.categories.length > 0 ? post.categories : post.category ? [post.category] : []).map((cat, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full"
                          style={getCategoryBadgeStyle(categoryColors[cat])}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
