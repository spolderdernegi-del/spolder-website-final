import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useContentEditorHandoff } from "@/hooks/useContentEditorHandoff";
import { ArrowLeft, ExternalLink, FileEdit, Pencil, Plus, Save, X } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  DEFAULT_FOOTER_SERVICES,
  FOOTER_SERVICES_MAX,
  FaaliyetPage,
  faaliyetPath,
  parseFaaliyetPages,
  parseFooterServices,
  serviceId,
  slugify,
} from "@/lib/faaliyetler";

// Yönetim ekranındaki bir satır: liste bilgisi + sayfa içeriği bir arada.
interface Row {
  id: string;
  label: string;
  query: string;
  summary: string;
  image: string;
  content: string;
  showRelated: boolean;
}

const newId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const AdminActivities = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Row>({
    id: "", label: "", query: "", summary: "", image: "", content: "", showRelated: true,
  });

  const { openFullEditor } = useContentEditorHandoff<Row>({
    storageKey: "activities",
    formData,
    setFormData,
    showForm,
    setShowForm,
    editingId: editingIndex,
    setEditingId: setEditingIndex,
    editorTitle: "Faaliyet Sayfası İçeriği",
  });

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    try {
      const { data } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["footer_services", "faaliyet_pages"]);
      const map = Object.fromEntries((data || []).map((d: any) => [d.key, d.value]));
      const services = map.footer_services ? parseFooterServices(map.footer_services) : DEFAULT_FOOTER_SERVICES;
      const pages = parseFaaliyetPages(map.faaliyet_pages);
      setRows(
        services.map((s) => {
          const id = serviceId(s);
          const page: FaaliyetPage = pages[id] || {};
          return {
            id,
            label: s.label,
            query: s.query,
            summary: page.summary || "",
            image: page.image || "",
            content: page.content || "",
            showRelated: page.showRelated !== false,
          };
        }),
      );
    } catch (err) {
      console.error("Faaliyetlerimiz yüklenemedi:", err);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // Satırları (liste + sayfa içerikleri) sunucuya yazar.
  const persist = async (list: Row[]) => {
    const cleaned = list
      .map((r) => ({ ...r, label: r.label.trim(), query: r.query.trim() }))
      .filter((r) => r.label && r.query)
      .slice(0, FOOTER_SERVICES_MAX);

    if (cleaned.length === 0) {
      toast.warning("En az bir öğe girilmeli (başlık ve kategori)");
      return null;
    }
    const slugs = cleaned.map((r) => slugify(r.label));
    if (new Set(slugs).size !== slugs.length) {
      toast.warning("İki öğenin başlığı aynı (veya çok benzer). Başlıklar farklı olmalı.");
      return null;
    }

    const services = cleaned.map((r) => ({ id: r.id, label: r.label, query: r.query }));
    const pages: Record<string, FaaliyetPage> = {};
    cleaned.forEach((r) => {
      pages[r.id] = { summary: r.summary, image: r.image, content: r.content, showRelated: r.showRelated };
    });

    const now = new Date().toISOString();
    const a = await supabase
      .from("settings")
      .upsert({ key: "footer_services", value: JSON.stringify(services), updated_at: now }, { onConflict: "key" });
    if (a.error) throw a.error;
    const b = await supabase
      .from("settings")
      .upsert({ key: "faaliyet_pages", value: JSON.stringify(pages), updated_at: now }, { onConflict: "key" });
    if (b.error) throw b.error;
    return cleaned;
  };

  const saveList = async () => {
    setSaving(true);
    try {
      const cleaned = await persist(rows);
      if (cleaned) {
        setRows(cleaned);
        toast.success("Faaliyetlerimiz güncellendi.");
      }
    } catch (err: any) {
      toast.error("Kaydedilemedi: " + (err?.message || "bilinmeyen hata"));
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (index: number, field: "label" | "query", value: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  const addRow = () => {
    if (rows.length >= FOOTER_SERVICES_MAX) {
      toast.warning(`En fazla ${FOOTER_SERVICES_MAX} öğe eklenebilir`);
      return;
    }
    setRows((prev) => [
      ...prev,
      { id: newId(), label: "", query: "", summary: "", image: "", content: "", showRelated: true },
    ]);
  };

  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(rows[index]);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  // Sayfa içeriği formundaki "Kaydet": o satırı günceller ve tüm listeyi hemen kaydeder.
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;
    const next = rows.map((r, i) => (i === editingIndex ? { ...formData, label: r.label, query: r.query } : r));
    setSaving(true);
    try {
      const cleaned = await persist(next);
      if (cleaned) {
        setRows(next);
        toast.success("Sayfa içeriği kaydedildi.");
        closeForm();
      }
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

  const editingRow = editingIndex !== null ? rows[editingIndex] : null;

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

      <main className="container-custom mx-auto px-4 py-8 space-y-6">
        {showForm && editingRow && (
          <form
            onSubmit={submitForm}
            className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-5"
          >
            <h2 className="text-xl font-bold text-foreground">Sayfa İçeriği: {editingRow.label || "Yeni öğe"}</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Kısa Açıklama</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Sayfanın üstündeki başlığın altında görünecek 1-2 cümle"
                rows={2}
              />
            </div>

            <ImageUploadField
              label="Üst Görsel (Opsiyonel)"
              value={formData.image}
              onChange={(value) => setFormData({ ...formData, image: value })}
              aspectRatio={16 / 9}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sayfa İçeriği</label>
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground min-h-[40px] whitespace-pre-wrap">
                  {formData.content
                    ? formData.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220) +
                      (formData.content.length > 220 ? "…" : "")
                    : <span className="italic">Henüz içerik girilmedi.</span>}
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={openFullEditor}>
                  <FileEdit className="w-4 h-4" />
                  Tam Sayfa Düzenle (Word gibi)
                </Button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1"
                checked={formData.showRelated}
                onChange={(e) => setFormData({ ...formData, showRelated: e.target.checked })}
              />
              <span>
                Sayfanın altında, "{editingRow.query}" kategorisindeki haber, etkinlik, proje ve blog yazılarını da göster
              </span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Vazgeç
              </Button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Sitenin en altında (footer) görünen "Faaliyetlerimiz" listesi. Her öğenin kendi sayfası vardır
            (örn. /faaliyetlerimiz/egitim-programlari). Sayfanın metnini kalem simgesiyle yazarsınız; isterseniz
            altında, yazdığınız kategorilere sahip haber, etkinlik, proje ve blog yazıları da listelenir. Birden fazla
            kategori için virgülle ayırın (örn. Eğitim, Spor). En fazla {FOOTER_SERVICES_MAX} öğe eklenebilir.
            Başlığı değiştirirseniz sayfa adresi de değişir.
          </p>

          <div className="space-y-3">
            {rows.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex-1 w-full">
                  <label className="block text-xs text-muted-foreground mb-1">Görünen Başlık</label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateRow(index, "label", e.target.value)}
                    placeholder="Örn. Eğitim Programları"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs text-muted-foreground mb-1">Kategoriler (virgülle ayırın)</label>
                  <Input
                    value={item.query}
                    onChange={(e) => updateRow(index, "query", e.target.value)}
                    placeholder="Örn. Eğitim, Spor"
                  />
                </div>
                <div className="flex items-center gap-2 mt-5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="gap-1"
                    onClick={() => openEdit(index)}
                    title="Sayfa içeriğini düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                    İçerik
                  </Button>
                  {item.label.trim() && (
                    <a href={faaliyetPath(item)} target="_blank" rel="noopener noreferrer" title="Sayfayı aç (kaydedilmiş hâli)">
                      <Button variant="outline" size="icon" type="button">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="icon" type="button" onClick={() => removeRow(index)} title="Bu öğeyi kaldır">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={addRow} disabled={rows.length >= FOOTER_SERVICES_MAX} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Öğe Ekle ({rows.length}/{FOOTER_SERVICES_MAX})
            </Button>
            <Button onClick={saveList} disabled={saving}>
              {saving ? "Kaydediliyor..." : "Listeyi Kaydet"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Yeni eklediğiniz bir öğenin içeriğini yazmadan önce "Listeyi Kaydet"e basın.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminActivities;
