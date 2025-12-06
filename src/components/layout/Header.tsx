import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoFull from "@/assets/logo_disi.webp";
import logoMark from "@/assets/logo_erkek_tek.webp";
import { allContent } from "@/lib/searchIndex";

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
    const q = searchQuery.trim().toLowerCase();
    const filtered = allContent.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
    );
    setSuggestions(filtered);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page with query parameter
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Determine if dark header: not scrolled anywhere = dark, scrolled = light
  const isDarkHeader = !isScrolled;

  // Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);

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
          {/* Logo - Dynamic based on header state */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={isScrolled ? logoMark : logoFull}
              alt="SPOLDER Logo"
              className={`w-auto transition-all duration-300 ${isScrolled ? "h-14" : "h-11"}`}
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

            {/* Search Button with Expandable Input */}
            <div
              ref={searchRef}
              className="relative ml-2"
              onMouseEnter={() => setIsSearchOpen(true)}
            >
              <form onSubmit={handleSearch} className="flex items-center">
                <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out rounded-full ${
                  isSearchOpen 
                    ? "w-48 bg-background border border-border shadow-lg" 
                    : "w-10"
                }`}>
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

              {/* Suggestions dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && suggestions.length > 0 && (
                <div className="absolute left-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {suggestions.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(s.link)}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground">{s.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{s.excerpt}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* donation button removed per request */}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Search */}
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkHeader
                  ? "text-white hover:bg-white/10"
                  : "hover:bg-muted"
              }`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-lg transition-colors ${
                isDarkHeader
                  ? "text-white hover:bg-white/10"
                  : "hover:bg-muted"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4 animate-fade-in">
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
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
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
            {/* mobile donation/member button removed */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
