import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, X } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { toast } from "@/lib/toast";
import { logActivity } from "@/lib/activityLog";
import { PAGE_HERO_PAGES, parsePageHeroes, type PageHeroMap } from "@/lib/pageHeroes";

const AdminPageHeroes = () => {
  const [heroes, setHeroes] = useState<PageHeroMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadFailedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("settings").select("value").eq("key", "page_heroes");
      if (error) {
        loadFailedRef.current = true;
        toast.error("Görseller yüklenemedi. Kaydetmeden önce sayfayı yenileyin.");
      } else {
        setHeroes(parsePageHeroes(data?.[0]?.value));
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (loadFailedRef.current) {
      toast.error("Veriler yüklenemediği için kaydedilemez; sayfayı yenileyin.");
      return;
    }
    setSaving(true);
    try {
      const clean: PageHeroMap = {};
      for (const [k, v] of Object.entries(heroes)) if (v.trim()) clean[k] = v.trim();
      const { error } = await supabase
        .from("settings")
        .upsert(
          { key: "page_heroes", value: JSON.stringify(clean), updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
      logActivity("update", "settings", "Sayfa başlık görselleri");
      toast.success("Sayfa başlık görselleri kaydedildi.");
    } catch (e: any) {
      toast.error("Hata: " + (e?.message || "Kaydedilemedi"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Sayfa Başlık Görselleri</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8 space-y-6">
        <p className="text-sm text-muted-foreground">
          Sayfaların üstündeki yeşil başlık alanına görsel ekleyebilirsiniz. Görsel, ana sayfadaki slider gibi
          yarı saydam menünün altında da devam eder ve okunabilirlik için hafif karartılır. Görsel eklemezseniz
          varsayılan yeşil zemin kullanılır. Geniş (yatay) görseller önerilir.
        </p>
        {PAGE_HERO_PAGES.map((page) => (
          <div
            key={page.key}
            className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-3"
          >
            <ImageUploadField
              label={page.label}
              value={heroes[page.key] || ""}
              onChange={(url) => setHeroes((h) => ({ ...h, [page.key]: url }))}
              aspectRatio={16 / 5}
            />
            {heroes[page.key] && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHeroes((h) => ({ ...h, [page.key]: "" }))}
              >
                <X className="w-4 h-4 mr-2" />
                Görseli kaldır (yeşile dön)
              </Button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminPageHeroes;
