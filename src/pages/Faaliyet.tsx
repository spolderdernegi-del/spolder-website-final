import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCategoryColors, getCategoryBadgeStyle } from "@/hooks/useCategoryColors";
import {
  DEFAULT_FOOTER_SERVICES,
  FaaliyetPage,
  FaaliyetPost,
  FooterService,
  legacyPost,
  parseFaaliyetPages,
  parseFaaliyetPosts,
  sortPostsNewestFirst,
  parseFooterServices,
  serviceId,
  slugify,
} from "@/lib/faaliyetler";

interface FaaliyetItem {
  key: string;
  type: string;
  title: string;
  excerpt: string;
  image: string;
  categories: string[];
  link: string;
  sortDate: string;
}

const normalize = (v: string) => v.trim().toLocaleLowerCase("tr");

// Footer'daki "Faaliyetlerimiz" öğelerinin her biri için sayfa:
// /faaliyetlerimiz/egitim-programlari gibi. İçerik, Ayarlar'da o öğeye yazılan
// kategoriye sahip haber/etkinlik/proje/blog yazılarından otomatik oluşur.
const Faaliyet = () => {
  const { slug = "" } = useParams();
  const [service, setService] = useState<FooterService | null | undefined>(undefined);
  const [page, setPage] = useState<FaaliyetPage>({});
  const [posts, setPosts] = useState<FaaliyetPost[]>([]);
  const [items, setItems] = useState<FaaliyetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryColors = useCategoryColors();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setItems([]);
      setPage({});
      setPosts([]);

      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["footer_services", "faaliyet_pages", "faaliyet_posts"]);
      const map = Object.fromEntries((data || []).map((d: any) => [d.key, d.value]));
      const list = map.footer_services ? parseFooterServices(map.footer_services) : DEFAULT_FOOTER_SERVICES;
      const found = list.find((s) => slugify(s.label) === slug) || null;
      if (cancelled) return;
      setService(found);
      if (!found) {
        setLoading(false);
        return;
      }
      const pageData = parseFaaliyetPages(map.faaliyet_pages)[serviceId(found)] || {};
      setPage(pageData);
      const savedPosts = parseFaaliyetPosts(map.faaliyet_posts)[serviceId(found)] || [];
      const legacy = savedPosts.length === 0 ? legacyPost(found.label, pageData) : null;
      setPosts(legacy ? [legacy] : sortPostsNewestFirst(savedPosts));
      if (pageData.showRelated === false) {
        setLoading(false);
        return;
      }

      const wanted = found.query.split(",").map(normalize).filter(Boolean);
      const matches = (cats: string[] | undefined, single?: string) => {
        const all = cats && cats.length > 0 ? cats : single ? [single] : [];
        return all.some((c) => wanted.includes(normalize(c)));
      };
      const catsOf = (cats: string[] | undefined, single?: string) =>
        cats && cats.length > 0 ? cats : single ? [single] : [];

      const result: FaaliyetItem[] = [];
      try {
        const [newsRes, eventsRes, projectsRes, blogRes] = await Promise.all([
          supabase.from("news").select("id, baslik, ozet, gorsel, kategori, categories, tarih, created_at").eq("yayin_durumu", "yayinlandi"),
          supabase.from("events").select("id, baslik, ozet, gorsel, kategori, categories, tarih, created_at").eq("yayin_durumu", "yayinlandi"),
          supabase.from("projects").select("id, title, description, image, category, categories, start_date, created_at").eq("publishStatus", "published"),
          supabase.from("blog").select("id, title, excerpt, image, category, categories, date, created_at").eq("publishStatus", "published"),
        ]);

        (newsRes.data || []).filter((i: any) => matches(i.categories, i.kategori)).forEach((i: any) =>
          result.push({ key: `news-${i.id}`, type: "Haber", title: i.baslik, excerpt: i.ozet || "", image: i.gorsel || "", categories: catsOf(i.categories, i.kategori), link: `/haber/${i.id}`, sortDate: i.tarih || i.created_at || "" }),
        );
        (eventsRes.data || []).filter((i: any) => matches(i.categories, i.kategori)).forEach((i: any) =>
          result.push({ key: `event-${i.id}`, type: "Etkinlik", title: i.baslik, excerpt: i.ozet || "", image: i.gorsel || "", categories: catsOf(i.categories, i.kategori), link: `/etkinlik/${i.id}`, sortDate: i.tarih || i.created_at || "" }),
        );
        (projectsRes.data || []).filter((i: any) => matches(i.categories, i.category)).forEach((i: any) =>
          result.push({ key: `project-${i.id}`, type: "Proje", title: i.title, excerpt: i.description || "", image: i.image || "", categories: catsOf(i.categories, i.category), link: `/proje/${i.id}`, sortDate: i.start_date || i.created_at || "" }),
        );
        (blogRes.data || []).filter((i: any) => matches(i.categories, i.category)).forEach((i: any) =>
          result.push({ key: `blog-${i.id}`, type: "Blog", title: i.title, excerpt: i.excerpt || "", image: i.image || "", categories: catsOf(i.categories, i.category), link: `/blog/${i.id}`, sortDate: i.date || i.created_at || "" }),
        );
      } catch (err) {
        console.error("Faaliyet içerikleri yüklenemedi:", err);
      }

      result.sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate)));
      if (!cancelled) {
        setItems(result);
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (service) document.title = `${service.label} - SPOLDER`;
  }, [service]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-gradient-green py-20">
          <div className="container-custom mx-auto px-4 md:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {service ? service.label : "Faaliyetlerimiz"}
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              {service
                ? page.summary || `${service.label} kapsamındaki çalışmalarımız ve içeriklerimiz`
                : "SPOLDER faaliyetleri"}
            </p>
          </div>
        </section>

        {loading && (
          <section className="section-padding">
            <div className="container-custom mx-auto flex justify-center items-center min-h-96">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          </section>
        )}

        {!loading && service === null && (
          <section className="section-padding">
            <div className="container-custom mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Sayfa bulunamadı</h3>
              <p className="text-muted-foreground mb-6">Aradığınız faaliyet sayfası mevcut değil.</p>
              <Link to="/">
                <Button variant="outline">Ana Sayfa</Button>
              </Link>
            </div>
          </section>
        )}

        {/* Gönderiler: kart kart; karta tıklayınca gönderinin kendi sayfası açılır */}
        {!loading && service && posts.length > 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="bg-card rounded-lg overflow-hidden shadow-card card-hover group">
                    <Link to={`/faaliyetlerimiz/${slug}/${post.id}`} className="block">
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={post.image || "/varsayilan-gorsel.png"}
                          alt={post.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-anthracite/60 to-transparent" />
                      </div>
                    </Link>
                    <div className="p-6">
                      {post.date && <p className="text-xs text-muted-foreground mb-2">{formatDate(post.date)}</p>}
                      <Link to={`/faaliyetlerimiz/${slug}/${post.id}`}>
                        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      {post.summary && <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.summary}</p>}
                      <Link to={`/faaliyetlerimiz/${slug}/${post.id}`} className="text-primary text-sm font-medium">
                        Devamını Oku
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && service && items.length === 0 && posts.length === 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Henüz içerik yok</h3>
              <p className="text-muted-foreground">Bu faaliyet için yakında içerik eklenecek.</p>
            </div>
          </section>
        )}

        {!loading && items.length > 0 && (
          <section className="section-padding">
            <div className="container-custom mx-auto">
              {posts.length > 0 && (
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">İlgili İçerikler</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                  <article key={item.key} className="bg-card rounded-lg overflow-hidden shadow-card card-hover group">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.image || "/varsayilan-gorsel.png"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-anthracite/60 to-transparent" />
                      <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                        {item.type}
                      </span>
                    </div>
                    <div className="p-6">
                      {item.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              style={getCategoryBadgeStyle(categoryColors[cat])}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link to={item.link}>
                        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                      <Button variant="ghost" size="sm" className="text-primary p-0 h-auto">
                        <Link to={item.link} className="flex items-center">
                          Detaylar
                        </Link>
                      </Button>
                    </div>
                  </article>
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

export default Faaliyet;
