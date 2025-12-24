import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  content: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("blog")
        .select("*")
        .order("created_at", { ascending: false });
      
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className="container-custom mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Spor politikaları, araştırmalar ve güncel gelişmeler hakkında uzman görüşleri ve analizler.
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

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Blog yazısı bulunamadı</h3>
            <p className="text-muted-foreground">Şu anda gösterilecek bir blog yazısı yok.</p>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {!loading && posts.length > 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4">
            <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img
                    src={posts[0].image}
                    alt={posts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4 w-fit">
                    {posts[0].category}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {posts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {posts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {posts[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {posts[0].date}
                    </span>
                  </div>
                  <Link to={`/blog/${posts[0].id}`}>
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
      {!loading && posts.length > 0 && (
        <section className="py-12">
          <div className="container-custom mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post) => (
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
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full mb-3">
                      {post.category}
                    </span>
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

      <Footer />
    </div>
  );
};

export default Blog;
