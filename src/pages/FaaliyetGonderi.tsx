import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Loader } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/formatDate";
import {
  DEFAULT_FOOTER_SERVICES,
  FaaliyetPost,
  FooterService,
  parseFaaliyetPosts,
  parseFooterServices,
  serviceId,
  slugify,
  sortPostsNewestFirst,
} from "@/lib/faaliyetler";

// /faaliyetlerimiz/<faaliyet>/<gönderi-kimliği>: bir faaliyet gönderisinin tam sayfası.
const FaaliyetGonderi = () => {
  const { slug = "", postId = "" } = useParams();
  const [service, setService] = useState<FooterService | null>(null);
  const [post, setPost] = useState<FaaliyetPost | null>(null);
  const [others, setOthers] = useState<FaaliyetPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setPost(null);
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["footer_services", "faaliyet_posts"]);
      const map = Object.fromEntries((data || []).map((d: any) => [d.key, d.value]));
      const list = map.footer_services ? parseFooterServices(map.footer_services) : DEFAULT_FOOTER_SERVICES;
      const found = list.find((s) => slugify(s.label) === slug) || null;
      const all = found ? sortPostsNewestFirst(parseFaaliyetPosts(map.faaliyet_posts)[serviceId(found)] || []) : [];
      if (cancelled) return;
      setService(found);
      setPost(all.find((p) => p.id === postId) || null);
      setOthers(all.filter((p) => p.id !== postId).slice(0, 3));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, postId]);

  useEffect(() => {
    if (post && service) document.title = `${post.title} - ${service.label} - SPOLDER`;
  }, [post, service]);

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

  if (!post || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Gönderi Bulunamadı</h1>
            <p className="text-muted-foreground mb-6">Aradığınız gönderi bulunamadı veya kaldırılmış olabilir.</p>
            <Link to={service ? `/faaliyetlerimiz/${slug}` : "/"}>
              <Button>{service ? `${service.label} Sayfasına Dön` : "Ana Sayfa"}</Button>
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
        <section className={`relative h-80 ${post.image ? "" : "bg-gradient-green"}`}>
          {post.image && (
            <>
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-anthracite/80 to-transparent" />
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container-custom mx-auto">
              <span className="inline-block px-3 py-1 mb-4 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {service.label}
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">{post.title}</h1>
            </div>
          </div>
        </section>

        {post.date && (
          <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-6">
            <div className="container-custom mx-auto px-4 flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.date)}</span>
            </div>
          </section>
        )}

        <section className="section-padding">
          <div className="container-custom mx-auto max-w-4xl">
            {post.summary && <p className="text-xl text-foreground/80 font-medium mb-8 leading-relaxed">{post.summary}</p>}
            {post.content && (
              <article className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <div
                  className="text-foreground/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                />
              </article>
            )}

            <div className="py-8 border-t border-border">
              <Link to={`/faaliyetlerimiz/${slug}`}>
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {service.label} Sayfasına Dön
                </Button>
              </Link>
            </div>

            {others.length > 0 && (
              <div className="pt-4">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Diğer Gönderiler</h2>
                <div className="space-y-3">
                  {others.map((o) => (
                    <Link
                      key={o.id}
                      to={`/faaliyetlerimiz/${slug}/${o.id}`}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h3 className="font-medium text-foreground hover:text-primary transition-colors">{o.title}</h3>
                      {o.date && <p className="text-xs text-muted-foreground mt-1">{formatDate(o.date)}</p>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FaaliyetGonderi;
