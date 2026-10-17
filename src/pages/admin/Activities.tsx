import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { useContentEditorHandoff } from "@/hooks/useContentEditorHandoff";
import { ArrowLeft, ExternalLink, FileEdit, FolderOpen, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { formatDate } from "@/lib/formatDate";
import { logActivity } from "@/lib/activityLog";
import {
  DEFAULT_FOOTER_SERVICES,
  FOOTER_SERVICES_MAX,
  FaaliyetPage,
  FaaliyetPost,
  faaliyetPath,
  parseFaaliyetPages,
  parseFaaliyetPosts,
  parseFooterServices,
  serviceId,
  slugify,
  sortPostsNewestFirst,
} from "@/lib/faaliyetler";

// Yönetim ekranındaki bir satır: liste bilgisi + sayfa ayarları.
interface Row {
  id: string;
  label: string;
  query: string;
  summary: string; // sayfanın üstündeki kısa açıklama
  showRelated: boolean; // altta kategoriye ait haber/etkinlik/proje/blog göster
}

// Gönderi formu (activityId: hangi faaliyete ait; tam sayfa editörden dönüşte de korunur).
interface PostForm extends FaaliyetPost {
  activityId: string;
}

type PostsMap = Record<string, FaaliyetPost[]>;

const newId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const emptyPost = (activityId: string): PostForm => ({
  activityId,
  id: "",
  title: "",
  summary: "",
  image: "",
  content: "",
  date: "",
});

const AdminActivities = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [posts, setPosts] = useState<PostsMap>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<number | null>(null); // -1: yeni, >=0: listedeki sıra
  const [formData, setFormData] = useState<PostForm>(emptyPost(""));

  const { openFullEditor } = useContentEditorHandoff<PostForm>({
    storageKey: "activity-posts",
    formData,
    setFormData,
    showForm,
    setShowForm,
    editingId: editingPost,
    setEditingId: setEditingPost,
    editorTitle: "Faaliyet Gönderisi İçeriği",
  });

  // Tam sayfa editörden dönünce hangi faaliyetin gönderisi olduğunu geri seç.
  useEffect(() => {
    if (showForm && formData.activityId && !selectedId) setSelectedId(formData.activityId);
  }, [showForm, formData.activityId, selectedId]);

  const loadFailedRef = useRef(false);
  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    try {
      const { data, error: loadError } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["footer_services", "faaliyet_pages", "faaliyet_posts"]);
      if (loadError) throw loadError;
      const map = Object.fromEntries((data || []).map((d: any) => [d.key, d.value]));
      const services = map.footer_services ? parseFooterServices(map.footer_services) : DEFAULT_FOOTER_SERVICES;
      const pages = parseFaaliyetPages(map.faaliyet_pages);
      const savedPosts = parseFaaliyetPosts(map.faaliyet_posts);

      const nextPosts: PostsMap = {};
      const nextRows: Row[] = services.map((s) => {
        const id = serviceId(s);
        const page: FaaliyetPage = pages[id] || {};
        let list = savedPosts[id] || [];
        // Eski tek-sayfa içeriği (metin/görsel) varsa, ilk gönderi olarak taşı.
        // Kaydedilene kadar yalnızca bu ekranda görünür; siteyi bozmaz.
        if (list.length === 0 && (page.content || page.image)) {
          list = [
            {
              id: newId(),
              title: s.label,
              summary: page.summary || "",
              image: page.image || "",
              content: page.content || "",
              date: new Date().toISOString(),
            },
          ];
        }
        nextPosts[id] = list;
        return { id, label: s.label, query: s.query, summary: page.summary || "", showRelated: page.showRelated !== false };
      });
      setRows(nextRows);
      setPosts(nextPosts);
    } catch (err) {
      console.error("Faaliyetlerimiz yüklenemedi:", err);
      // Yükleme başarısızsa varsayılan listeyle kaydedip gerçek veriyi ezmeyelim.
      loadFailedRef.current = true;
      toast.error("Veriler yüklenemedi. Kaydetmeden önce sayfayı yenileyin.");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // Liste + sayfa ayarları + gönderileri sunucuya yazar.
  const persist = async (list: Row[], postsMap: PostsMap) => {
    if (loadFailedRef.current) throw new Error("Veriler yüklenemediği için kaydedilemez; sayfayı yenileyin.");
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
    const postsOut: PostsMap = {};
    cleaned.forEach((r) => {
      pages[r.id] = { summary: r.summary, showRelated: r.showRelated };
      postsOut[r.id] = (postsMap[r.id] || []).filter((p) => p.title.trim());
    });

    const now = new Date().toISOString();
    const entries = [
      { key: "footer_services", value: JSON.stringify(services) },
      { key: "faaliyet_pages", value: JSON.stringify(pages) },
      { key: "faaliyet_posts", value: JSON.stringify(postsOut) },
    ];
    for (const e of entries) {
      const res = await supabase.from("settings").upsert({ ...e, updated_at: now }, { onConflict: "key" });
      if (res.error) throw res.error;
    }
    return cleaned;
  };

  const run = async (list: Row[], postsMap: PostsMap, successMessage: string, logTitle = "Faaliyetlerimiz", logAction: "update" | "create" | "delete" = "update") => {
    setSaving(true);
    try {
      const cleaned = await persist(list, postsMap);
      if (cleaned) {
        setRows(cleaned);
        setPosts(postsMap);
        toast.success(successMessage);
        logActivity(logAction, "activity", logTitle);
        return true;
      }
    } catch (err: any) {
      toast.error("Kaydedilemedi: " + (err?.message || "bilinmeyen hata"));
    } finally {
      setSaving(false);
    }
    return false;
  };

  const saveAll = () => run(rows, posts, "Faaliyetlerimiz güncellendi.");

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const addRow = () => {
    if (rows.length >= FOOTER_SERVICES_MAX) {
      toast.warning(`En fazla ${FOOTER_SERVICES_MAX} öğe eklenebilir`);
      return;
    }
    setRows((prev) => [...prev, { id: newId(), label: "", query: "", summary: "", showRelated: true }]);
  };

  const removeRow = (index: number) => {
    const row = rows[index];
    const count = posts[row.id]?.length || 0;
    if (count > 0 && !window.confirm(`"${row.label || "Bu öğe"}" altındaki ${count} gönderi de silinecek. Devam edilsin mi?`)) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    if (selectedId === row.id) closeAll();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const closeAll = () => {
    closeForm();
    setSelectedId(null);
  };

  const openNewPost = (activityId: string) => {
    setFormData(emptyPost(activityId));
    setEditingPost(-1);
    setShowForm(true);
  };

  const openEditPost = (activityId: string, index: number) => {
    setFormData({ ...(posts[activityId][index] as FaaliyetPost), activityId });
    setEditingPost(index);
    setShowForm(true);
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Gönderi başlığı gerekli");
      return;
    }
    const { activityId, ...rest } = formData;
    const list = [...(posts[activityId] || [])];
    if (editingPost !== null && editingPost >= 0 && list[editingPost]) {
      list[editingPost] = { ...rest, title: rest.title.trim() };
    } else {
      list.push({ ...rest, id: newId(), title: rest.title.trim(), date: new Date().toISOString() });
    }
    const isNew = !(editingPost !== null && editingPost >= 0);
    const ok = await run(rows, { ...posts, [activityId]: list }, "Gönderi kaydedildi.", formData.title.trim(), isNew ? "create" : "update");
    if (ok) closeForm();
  };

  const deletePost = async (activityId: string, index: number) => {
    const post = posts[activityId][index];
    if (!window.confirm(`"${post.title}" gönderisi silinsin mi? Bu işlem geri alınamaz.`)) return;
    const list = posts[activityId].filter((_, i) => i !== index);
    await run(rows, { ...posts, [activityId]: list }, "Gönderi silindi.", post.title, "delete");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  const selectedIndex = rows.findIndex((r) => r.id === selectedId);
  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null;
  const selectedPosts = selectedRow ? sortPostsNewestFirst(posts[selectedRow.id] || []) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex items-center gap-4">
          {selectedRow ? (
            <Button variant="outline" size="sm" onClick={closeAll}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Faaliyet Listesi
            </Button>
          ) : (
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {selectedRow ? `Faaliyetlerimiz › ${selectedRow.label}` : "Faaliyetlerimiz"}
          </h1>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8 space-y-6">
        {/* ---- Seçili faaliyetin gönderileri ---- */}
        {selectedRow && (
          <>
            {showForm && (
              <form
                onSubmit={submitPost}
                className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-5"
              >
                <h2 className="text-xl font-bold text-foreground">
                  {editingPost !== null && editingPost >= 0 ? "Gönderiyi Düzenle" : "Yeni Gönderi"}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Başlık *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Örn. 2026 Bahar Dönemi Antrenör Eğitimi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Kısa Açıklama (kartta görünür)</label>
                  <Textarea
                    value={formData.summary || ""}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={2}
                  />
                </div>

                <ImageUploadField
                  label="Görsel (Opsiyonel)"
                  value={formData.image || ""}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  aspectRatio={16 / 9}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">İçerik</label>
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

            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Gönderiler ({selectedPosts.length})</h2>
                  <p className="text-sm text-muted-foreground">
                    Bu faaliyetin sayfasında kart olarak listelenir; karta tıklayan ziyaretçi gönderinin tam sayfasını görür.
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedRow.label.trim() && (
                    <a href={faaliyetPath(selectedRow)} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" type="button" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Sayfayı Aç
                      </Button>
                    </a>
                  )}
                  <Button size="sm" type="button" className="gap-2" onClick={() => openNewPost(selectedRow.id)}>
                    <Plus className="w-4 h-4" />
                    Yeni Gönderi
                  </Button>
                </div>
              </div>

              {selectedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-6 text-center">Henüz gönderi eklenmedi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPosts.map((post) => {
                    const realIndex = (posts[selectedRow.id] || []).findIndex((p) => p.id === post.id);
                    return (
                      <div key={post.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 flex flex-col">
                        <div className="h-36 bg-slate-200 dark:bg-slate-700">
                          <img
                            src={post.image || "/varsayilan-gorsel.png"}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
                          {post.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.summary}</p>}
                          {post.date && <p className="text-xs text-muted-foreground mt-2">{formatDate(post.date)}</p>}
                          <div className="flex gap-2 mt-4 pt-3">
                            <Button variant="outline" size="sm" type="button" className="gap-1" onClick={() => openEditPost(selectedRow.id, realIndex)}>
                              <Pencil className="w-4 h-4" />
                              Düzenle
                            </Button>
                            <Button variant="outline" size="icon" type="button" title="Sil" onClick={() => deletePost(selectedRow.id, realIndex)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Sayfa Ayarları</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kısa Açıklama</label>
                <Textarea
                  value={selectedRow.summary}
                  onChange={(e) => updateRow(selectedIndex, { summary: e.target.value })}
                  placeholder="Sayfanın üstündeki başlığın altında görünecek 1-2 cümle"
                  rows={2}
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedRow.showRelated}
                  onChange={(e) => updateRow(selectedIndex, { showRelated: e.target.checked })}
                />
                <span>
                  Gönderilerin altında, "{selectedRow.query}" kategorisindeki haber, etkinlik, proje ve blog yazılarını da göster
                </span>
              </label>
              <Button onClick={saveAll} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </Button>
            </div>
          </>
        )}

        {/* ---- Faaliyet listesi ---- */}
        {!selectedRow && (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Sitenin en altında (footer) görünen "Faaliyetlerimiz" listesi. Her öğenin kendi sayfası vardır
              (örn. /faaliyetlerimiz/egitim-programlari). "Gönderiler" ile o sayfaya istediğiniz kadar kart
              ekleyebilirsiniz; her kartın kendi sayfası olur. İsterseniz sayfanın altında, yazdığınız kategorilere
              sahip haber, etkinlik, proje ve blog yazıları da listelenir. Birden fazla kategori için virgülle
              ayırın (örn. Eğitim, Spor). En fazla {FOOTER_SERVICES_MAX} öğe eklenebilir. Başlığı değiştirirseniz
              sayfa adresi de değişir.
            </p>

            <div className="space-y-3">
              {rows.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-muted-foreground mb-1">Görünen Başlık</label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateRow(index, { label: e.target.value })}
                      placeholder="Örn. Eğitim Programları"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-muted-foreground mb-1">Kategoriler (virgülle ayırın)</label>
                    <Input
                      value={item.query}
                      onChange={(e) => updateRow(index, { query: e.target.value })}
                      placeholder="Örn. Eğitim, Spor"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="gap-1"
                      onClick={() => setSelectedId(item.id)}
                      title="Bu faaliyetin gönderilerini yönet"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Gönderiler ({posts[item.id]?.length || 0})
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
              <Button onClick={saveAll} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Listeyi Kaydet"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Yeni eklediğiniz bir öğenin gönderilerini eklemeden önce başlık ve kategorisini yazıp "Listeyi Kaydet"e basın.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminActivities;
