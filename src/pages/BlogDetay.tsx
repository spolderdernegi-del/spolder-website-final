import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader, Calendar, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  image: string;
  category: string;
  categories?: string[];
}

const BlogDetay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog')
          .select('id, title, excerpt, content, date, author, image, category, categories')
          .eq('id', parseInt(id || "0"))
          .eq('publishStatus', 'published')
          .single();
        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Blog load error', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
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

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Blog Yazısı Bulunamadı</h1>
            <Link to="/blog">
              <Button>Blog Sayfasına Dön</Button>
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
          {post.image && (
            <>
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-anthracite/80 to-transparent" />
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-custom mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {(post.categories && post.categories.length > 0 ? post.categories : post.category ? [post.category] : []).map((cat, idx) => (
                  <span 
                    key={idx}
                    className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground">
                {post.title}
              </h1>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-8">
          <div className="container-custom mx-auto px-4">
            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom mx-auto">
            <div className="max-w-3xl">
              <article className="prose prose-invert max-w-none mb-8">
                {(post.content || post.excerpt).split("\n").map((paragraph, index) => (
                  <p key={index} className="text-foreground/90 text-lg leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
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

export default BlogDetay;
