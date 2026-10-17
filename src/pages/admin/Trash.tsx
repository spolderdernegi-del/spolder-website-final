import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { ArrowLeft, RotateCcw, Trash2, Image as ImageIcon } from "lucide-react";

interface TrashItem {
  table: string;
  label: string;
  id: number;
  title: string;
  image: string | null;
  deleted_at: string;
}

interface TrashResponse {
  enabled: boolean;
  retentionDays?: number;
  items: TrashItem[];
}

const LABEL_COLORS: Record<string, string> = {
  Haber: "bg-green-100 text-green-700",
  Etkinlik: "bg-blue-100 text-blue-700",
  Blog: "bg-purple-100 text-purple-700",
  Proje: "bg-orange-100 text-orange-700",
};

const AdminTrash = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TrashResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
    });
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trash", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Çöp kutusu alınamadı");
      setData(json.data);
    } catch (err: any) {
      toast.error(err.message || "Çöp kutusu alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (url: string, method: string, okMessage: string) => {
    setBusy(true);
    try {
      const res = await fetch(url, { method, credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "İşlem başarısız");
      toast.success(okMessage);
      await load();
    } catch (err: any) {
      toast.error(err.message || "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  };

  const restore = (item: TrashItem) =>
    call(`/api/trash/${item.table}/${item.id}/restore`, "POST", `"${item.title}" geri alındı`);

  const removeForever = (item: TrashItem) => {
    if (!confirm(`"${item.title}" KALICI olarak silinecek ve geri alınamayacak. Emin misiniz?`)) return;
    call(`/api/trash/${item.table}/${item.id}`, "DELETE", "Kalıcı olarak silindi");
  };

  const emptyTrash = () => {
    if (!data || data.items.length === 0) return;
    if (!confirm(`Çöp kutusundaki ${data.items.length} kayıt KALICI olarak silinecek ve geri alınamayacak. Emin misiniz?`)) return;
    call("/api/trash", "DELETE", "Çöp kutusu boşaltıldı");
  };

  const retention = data?.retentionDays ?? 30;
  const daysLeft = (deletedAt: string) => {
    const passed = (Date.now() - new Date(deletedAt).getTime()) / 86_400_000;
    return Math.max(0, Math.ceil(retention - passed));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Çöp Kutusu</h1>
            <p className="text-sm text-muted-foreground">
              Silinen haber, etkinlik, blog ve projeler {retention} gün burada kalır, sonra kalıcı olarak silinir.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={busy || !data || data.items.length === 0}
            onClick={emptyTrash}
          >
            <Trash2 className="w-4 h-4" />
            Çöpü Boşalt
          </Button>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8">
        {loading && !data ? (
          <p className="text-muted-foreground">Yükleniyor...</p>
        ) : data && !data.enabled ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Çöp kutusu henüz etkinleştirilmedi. Sistem yöneticisinin veritabanı güncellemesini yapması gerekiyor; o zamana
            kadar silinen kayıtlar doğrudan kalıcı olarak silinir.
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-muted-foreground">
            <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            Çöp kutusu boş.
          </div>
        ) : (
          <ul className="space-y-3">
            {data?.items.map((item) => {
              const left = daysLeft(item.deleted_at);
              return (
                <li
                  key={`${item.table}-${item.id}`}
                  className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1 ${LABEL_COLORS[item.label] || "bg-slate-100 text-slate-700"}`}>
                      {item.label}
                    </span>
                    <p className="font-medium text-foreground truncate" title={item.title}>{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Silindi: {new Date(item.deleted_at).toLocaleDateString("tr-TR")} ·{" "}
                      <span className={left <= 5 ? "text-red-600 font-medium" : ""}>
                        {left === 0 ? "bugün kalıcı silinecek" : `${left} gün sonra kalıcı silinecek`}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2" disabled={busy} onClick={() => restore(item)}>
                      <RotateCcw className="w-4 h-4" />
                      Geri Al
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-2" disabled={busy} onClick={() => removeForever(item)}>
                      <Trash2 className="w-4 h-4" />
                      Kalıcı Sil
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default AdminTrash;
