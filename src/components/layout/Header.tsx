import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoLight from "@/assets/logo_disi.webp";
import logoDark from "@/assets/logo_erkek_tek.webp";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  // Determine if we're on the homepage and not scrolled (dark header)
  const isDarkHeader = location.pathname === "/" && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-header"
          : location.pathname === "/"
          ? "bg-anthracite/80 backdrop-blur-sm"
          : "bg-anthracite/5 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Dynamic based on header state */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={isDarkHeader ? logoDark : logoLight} 
              alt="SPOlDER Logo" 
              className="h-12 w-auto transition-opacity duration-300" 
            />
            <div className="hidden sm:block">
              <span className={`font-display font-bold text-lg transition-colors duration-300 ${
                isDarkHeader ? "text-white" : "text-foreground"
              }`}>
                SPOlDER
              </span>
              <p className={`text-xs transition-colors duration-300 ${
                isDarkHeader ? "text-white/70" : "text-muted-foreground"
              }`}>
                Spor Politikaları Derneği
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.href
                    ? isDarkHeader
                      ? "text-primary-light bg-white/10"
                      : "text-primary bg-primary/10"
                    : isDarkHeader
                    ? "text-white hover:text-primary-light hover:bg-white/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.label}
              </Link>
            ))}

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
            </div>

            <Button variant="gradient" size="sm" className="ml-2">
              Üye Ol
            </Button>
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
            <Button variant="gradient" className="mt-2">
              Üye Ol
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
