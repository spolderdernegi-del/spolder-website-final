import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";
import { allContent } from "@/lib/searchIndex";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  // Arama sonuçlarını filtrele
  const results = query
    ? allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.excerpt.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query)
      )
    : [];

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
            {results.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-foreground mb-2">Sonuç Bulunamadı</h2>
                <p className="text-muted-foreground mb-6">
                  "{query}" için uygun içerik bulunamadı. Lütfen arama teriminizi değiştirip tekrar deneyin.
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
