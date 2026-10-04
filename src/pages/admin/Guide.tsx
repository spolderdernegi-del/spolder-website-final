import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ExternalLink, Lightbulb, AlertTriangle } from "lucide-react";
import { GUIDE_SECTIONS, type GuideBlock, type GuideSection } from "./guideContent";

// Bir bölümün aranabilir tüm metnini tek string'e çevirir.
const sectionText = (section: GuideSection) => {
  const parts: string[] = [section.title, section.summary];
  section.blocks.forEach((block) => {
    if (block.type === "p" || block.type === "tip") parts.push(block.text);
    if (block.type === "steps" || block.type === "list" || block.type === "warn") {
      if (block.title) parts.push(block.title);
      parts.push(...block.items);
    }
  });
  return parts.join(" ").toLocaleLowerCase("tr");
};

const Block = ({ block }: { block: GuideBlock }) => {
  switch (block.type) {
    case "p":
      return <p className="text-sm text-foreground/80 leading-relaxed">{block.text}</p>;

    case "steps":
      return (
        <div>
          {block.title && <h3 className="font-semibold text-foreground mb-2">{block.title}</h3>}
          <ol className="space-y-2">
            {block.items.map((item, index) => (
              <li key={index} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "list":
      return (
        <div>
          {block.title && <h3 className="font-semibold text-foreground mb-2">{block.title}</h3>}
          <ul className="space-y-1.5 list-disc pl-5 marker:text-primary/60">
            {block.items.map((item, index) => (
              <li key={index} className="text-sm text-foreground/80 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "tip":
      return (
        <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 p-3">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{block.text}</p>
        </div>
      );

    case "warn":
      return (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {block.title || "Dikkat"}
          </p>
          <ul className="space-y-1.5 list-disc pl-5 marker:text-amber-500">
            {block.items.map((item, index) => (
              <li key={index} className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
  }
};

const AdminGuide = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin/login");
    };
    checkAuth();
  }, [navigate]);

  const searchTexts = useMemo(
    () => new Map(GUIDE_SECTIONS.map((section) => [section.id, sectionText(section)])),
    []
  );

  const query = search.trim().toLocaleLowerCase("tr");
  const visibleSections = query
    ? GUIDE_SECTIONS.filter((section) => searchTexts.get(section.id)?.includes(query))
    : GUIDE_SECTIONS;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kullanım Rehberi</h1>
            <p className="text-sm text-muted-foreground">Paneldeki her sayfanın nasıl kullanılacağı ve nelerin yapılamayacağı</p>
          </div>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rehberde ara (örn. şifre, kategori, slider, görsel)..."
            className="pl-9 bg-white dark:bg-slate-950"
          />
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* İçindekiler */}
          <nav className="lg:sticky lg:top-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-2">İçindekiler</p>
            <ul className="space-y-0.5 max-h-44 lg:max-h-[60vh] overflow-y-auto">
              {visibleSections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(section.id)}
                    className="w-full text-left text-sm px-2 py-1.5 rounded-md text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bölümler */}
          <div className="space-y-6 min-w-0">
            {visibleSections.length === 0 && (
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-muted-foreground">
                "{search}" için rehberde sonuç bulunamadı.
              </div>
            )}

            {visibleSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{section.summary}</p>
                  </div>
                  {section.route && section.route !== "/admin/login" && (
                    <Link to={section.route}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Sayfaya git
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="space-y-5">
                  {section.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminGuide;
