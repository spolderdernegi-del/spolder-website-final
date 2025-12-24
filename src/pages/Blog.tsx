import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "Spor Politikalarında Yeni Yaklaşımlar",
    excerpt: "Modern spor politikalarının toplum üzerindeki etkilerini ve gelecek vizyonunu ele alan kapsamlı bir analiz.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop",
    author: "Dr. Ahmet Yılmaz",
    date: "28 Kasım 2024",
    category: "Analiz",
  },
  {
    id: 2,
    title: "Kadın Sporculara Destek Programları",
    excerpt: "Türkiye'de kadın sporcuların karşılaştığı zorluklar ve çözüm önerileri üzerine bir değerlendirme.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    author: "Prof. Elif Kaya",
    date: "25 Kasım 2024",
    category: "Araştırma",
  },
  {
    id: 3,
    title: "Spor ve Sürdürülebilirlik",
    excerpt: "Çevre dostu spor tesisleri ve sürdürülebilir spor etkinlikleri hakkında güncel gelişmeler.",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=400&fit=crop",
    author: "Mehmet Demir",
    date: "20 Kasım 2024",
    category: "Görüş",
  },
  {
    id: 4,
    title: "Dijital Dönüşüm ve Spor",
    excerpt: "Teknolojinin spor dünyasındaki dönüştürücü etkisi ve geleceğe yönelik öngörüler.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
    author: "Zeynep Arslan",
    date: "15 Kasım 2024",
    category: "Teknoloji",
  },
  {
    id: 5,
    title: "Engelli Sporculara Eşit Fırsatlar",
    excerpt: "Engelli bireylerin spora erişimi ve paralimpik hareketin Türkiye'deki gelişimi.",
    image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&h=400&fit=crop",
    author: "Ali Öztürk",
    date: "10 Kasım 2024",
    category: "Sosyal",
  },
  {
    id: 6,
    title: "Gençlik ve Spor Kültürü",
    excerpt: "Z kuşağının spor alışkanlıkları ve spor kültürünün gençler arasında yaygınlaştırılması.",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop",
    author: "Selin Yıldız",
    date: "5 Kasım 2024",
    category: "Gençlik",
  },
];

const Blog = () => {
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

      {/* Featured Post */}
      <section className="py-12">
        <div className="container-custom mx-auto px-4">
          <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
                <div className="p-8 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4 w-fit">
                  {blogPosts[0].category}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {blogPosts[0].date}
                  </span>
                </div>
                <Link to={`/blog/${blogPosts[0].id}`}>
                  <Button variant="gradient" className="w-fit">
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12">
        <div className="container-custom mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
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

      <Footer />
    </div>
  );
};

export default Blog;
