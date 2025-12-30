import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Haberler", href: "/haberler" },
  { label: "Etkinlikler", href: "/etkinlikler" },
  { label: "Projeler", href: "/projeler" },
  { label: "Blog", href: "/blog" },
  { label: "Yayınlar", href: "/yayinlar" },
  { label: "İletişim", href: "/iletisim" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const searchInDatabase = async () => {
      try {
        const q = searchQuery.trim().toLowerCase();
        const allResults: any[] = [];

        // Haberler
        const { data: news } = await supabase
          .from("news")
          .select("*")
          .eq("yayin_durumu", "yayinlandi")
          .or(`baslik.ilike.%${q}%,ozet.ilike.%${q}%,icerik.ilike.%${q}%,kategori.ilike.%${q}%`)
          .limit(2);
        
        if (news) {
          news.forEach((item) => {
            allResults.push({
              id: `news-${item.id}`,
              type: "Haber",
              title: item.baslik,
              excerpt: item.ozet || "",
              link: `/haber/${item.id}`,
            });
          });
        }

        // Etkinlikler
        const { data: events } = await supabase
          .from("events")
          .select("*")
          .eq("yayin_durumu", "yayinlandi")
          .or(`baslik.ilike.%${q}%,ozet.ilike.%${q}%,icerik.ilike.%${q}%,kategori.ilike.%${q}%`)
          .limit(2);
        
        if (events) {
          events.forEach((item) => {
            allResults.push({
              id: `event-${item.id}`,
              type: "Etkinlik",
              title: item.baslik,
              excerpt: item.ozet || "",
              link: `/etkinlik/${item.id}`,
            });
          });
        }

        // Projeler
        const { data: projects } = await supabase
          .from("projects")
          .select("*")
          .eq("publishStatus", "published")
          .or(`title.ilike.%${q}%,description.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%`)
          .limit(2);
        
        if (projects) {
          projects.forEach((item) => {
            allResults.push({
              id: `project-${item.id}`,
              type: "Proje",
              title: item.title,
              excerpt: item.description || "",
              link: `/proje/${item.id}`,
            });
          });
        }

        // Blog
        const { data: blogs } = await supabase
          .from("blog")
          .select("*")
          .eq("publishStatus", "published")
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%`)
          .limit(2);
        
        if (blogs) {
          blogs.forEach((item) => {
            allResults.push({
              id: `blog-${item.id}`,
              type: "Blog",
              title: item.title,
              excerpt: item.excerpt || "",
              link: `/blog/${item.id}`,
            });
          });
        }

        setSuggestions(allResults);
      } catch (error) {
        console.error("Arama hatası:", error);
        setSuggestions([]);
      }
    };

    searchInDatabase();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isDarkHeader = !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-header"
          : "bg-anthracite/80 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={isScrolled ? "/logo-dark.svg" : "/logo.svg"}
              alt="SPOLDER Logo"
              className="h-10 w-auto transition-all duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : isDarkHeader
                      ? "text-white hover:text-sky-500 hover:bg-sky-50"
                      : "text-foreground hover:text-sky-500 hover:bg-sky-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Search */}
            <div
              ref={searchRef}
              className="relative ml-2"
              onMouseEnter={() => setIsSearchOpen(true)}
            >
              <form onSubmit={handleSearch} className="flex items-center">
                <div
                  className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out rounded-full ${
                    isSearchOpen
                      ? "w-48 bg-background border border-border shadow-lg"
                      : "w-10"
                  }`}
                >
                  <button
                    type="submit"
                    className={`flex-shrink-0 p-2.5 rounded-full transition-colors duration-200 ${
                      isDarkHeader && !isSearchOpen
                        ? "text-white hover:text-primary-light hover:bg-white/10"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <Input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`border-0 bg-transparent h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 ${
                      isSearchOpen ? "w-32 opacity-100 pr-3" : "w-0 opacity-0 p-0"
                    }`}
                  />
                </div>
              </form>

              {/* Suggestions */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <>
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            navigate(s.link);
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {s.title}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {s.excerpt}
                              </div>
                            </div>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap ml-2">
                              {s.type}
                            </span>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-center text-sm text-primary font-medium"
                      >
                        Tümünü Gör
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Buttons */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkHeader ? "text-white hover:bg-white/10" : "hover:bg-muted"
              }`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkHeader ? "text-white hover:bg-white/10" : "hover:bg-muted"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="gradient" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            {/* Mobile Suggestions */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-3 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          navigate(s.link);
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {s.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {s.excerpt}
                            </div>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap ml-2">
                            {s.type}
                          </span>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-center text-sm text-primary font-medium"
                    >
                      Tümünü Gör
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                    Sonuç bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <nav className="container-custom mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
