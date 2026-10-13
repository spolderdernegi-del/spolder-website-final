import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, Plus, X } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  DEFAULT_FOOTER_SERVICES,
  FOOTER_SERVICES_MAX,
  FooterService,
  faaliyetPath,
  parseFooterServices,
  slugify,
} from "@/lib/faaliyetler";

const AdminActivities = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<FooterService[]>(DEFAULT_FOOTER_SERVICES);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    try {
      const { data } = await supabase.from("settings").select("value").eq("key", "footer_services");
      setItems(parseFooterServices(data?.[0]?.value));
    } catch (err) {
      console.error("Faaliyetlerimiz listesi yüklenemedi:", err);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (index: number, field: keyof FooterService, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const add = () => {
    if (items.length >= FOOTER_SERVICES_MAX) {
      toast.warning(`En fazla ${FOOTER_SERVICES_MAX} öğe eklenebilir`);
      return;
    }
    setItems((prev) => [...prev, { label: "", query: "" }]);
  };

  const remove = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    const cleaned = items
      .map((item) => ({ label: item.label.trim(), query: item.query.trim() }))
      .filter((item) => item.label && item.query)
      .slice(0, FOOTER_SERVICES_MAX);

    if (cleaned.length === 0) {
      toast.warning("En az bir öğe girilmeli (başlık ve kategori)");
      return;
    }
    const slugs = cleaned.map((i) => slugify(i.label));
    if (new Set(slugs).size !== slugs.length) {
      toast.warning("İki öğenin başlığı aynı (veya çok benzer). Başlıklar farklı olmalı.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "footer_services", value: JSON.stringify(cleaned), updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
      setItems(cleaned);
      toast.success("Faaliyetlerimiz güncellendi. Sitenin altında ve sayfalarında görünecek.");
    } catch (err: any) {
      toast.error("Kaydedilemedi: " + (err?.message || "bilinmeyen hata"));
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
        <div className="container-custom mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Faaliyetlerimiz</h1>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Sitenin en altında (footer) görünen "Faaliyetlerimiz" listesi. Her öğenin kendi sayfası vardır
            (örn. /faaliyetlerimiz/egitim-programlari). Sayfada, yazdığınız kategorilere sahip yayındaki haber,
            etkinlik, proje ve blog yazıları listelenir. Birden fazla kategori için virgülle ayırın
            (örn. Eğitim, Spor). En fazla {FOOTER_SERVICES_MAX} öğe eklenebilir. Başlığı değiştirirseniz sayfa adresi de değişir.
          </p>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex-1 w-full">
                  <label className="block text-xs text-muted-foreground mb-1">Görünen Başlık</label>
                  <Input
                    value={item.label}
                    onChange={(e) => update(index, "label", e.target.value)}
                    placeholder="Örn. Eğitim Programları"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs text-muted-foreground mb-1">Kategoriler (virgülle ayırın)</label>
                  <Input
                    value={item.query}
                    onChange={(e) => update(index, "query", e.target.value)}
                    placeholder="Örn. Eğitim, Spor"
                  />
                </div>
                <div className="flex items-center gap-2 mt-5 shrink-0">
                  {item.label.trim() && (
                    <a href={faaliyetPath(item)} target="_blank" rel="noopener noreferrer" title="Sayfayı aç (kaydedilmiş hâli)">
                      <Button variant="outline" size="icon" type="button">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="icon" onClick={() => remove(index)} title="Bu öğeyi kaldır">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={add} disabled={items.length >= FOOTER_SERVICES_MAX} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Öğe Ekle ({items.length}/{FOOTER_SERVICES_MAX})
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Listeyi Kaydet"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
