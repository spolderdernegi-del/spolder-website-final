import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Users } from "lucide-react";

interface StatsData {
  days: number;
  daily: { day: string; views: number; visitors: number }[];
  paths: { path: string; views: number; visitors: number }[];
  countries: { country: string; views: number; visitors: number }[];
  cities: { city: string; country: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  referrers: { referrer: string; visitors: number }[];
}

const PERIODS = [
  { days: 7, label: "Son 7 gün" },
  { days: 30, label: "Son 30 gün" },
  { days: 90, label: "Son 90 gün" },
  { days: 365, label: "Son 1 yıl" },
];

const countryName = (code: string) => {
  if (!code || code === "??") return "Bilinmiyor";
  try {
    return new Intl.DisplayNames(["tr"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
};

const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());

const StatCard = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint?: string }) => (
  <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
    <div className="flex items-center justify-between text-muted-foreground text-sm">
      <span>{label}</span>
      {icon}
    </div>
    <p className="text-3xl font-bold text-foreground mt-2">{value.toLocaleString("tr-TR")}</p>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const RankTable = ({ title, rows }: { title: string; rows: { name: string; value: number; extra?: string }[] }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz veri yok.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.name} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate" title={row.name}>{row.name}</span>
                <span className="text-muted-foreground shrink-0">{row.value.toLocaleString("tr-TR")}{row.extra}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded mt-1">
                <div className="h-1.5 bg-primary rounded" style={{ width: `${(row.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminStats = () => {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
    });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/stats?days=${days}`, { credentials: "include" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || "İstatistikler alınamadı");
        if (!cancelled) setData(json.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "İstatistikler alınamadı");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const summary = useMemo(() => {
    const daily = data?.daily || [];
    const today = daily.find((d) => d.day === todayKey());
    return {
      todayVisitors: today?.visitors || 0,
      todayViews: today?.views || 0,
      visitors: daily.reduce((sum, d) => sum + d.visitors, 0),
      views: daily.reduce((sum, d) => sum + d.views, 0),
    };
  }, [data]);

  // Boş günleri de göstermek için dönemdeki tüm günleri üret.
  const chartDays = useMemo(() => {
    if (!data) return [];
    const map = new Map(data.daily.map((d) => [d.day, d]));
    const out: { day: string; views: number; visitors: number }[] = [];
    const end = new Date(`${todayKey()}T12:00:00`);
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = new Intl.DateTimeFormat("en-CA").format(d);
      out.push(map.get(key) || { day: key, views: 0, visitors: 0 });
    }
    return out;
  }, [data]);
  const maxVisitors = Math.max(1, ...chartDays.map((d) => d.visitors));

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
            <h1 className="text-2xl font-bold text-foreground">Ziyaretçi İstatistikleri</h1>
            <p className="text-sm text-muted-foreground">Çerezsiz sayaç: kimlik ve IP adresi saklanmaz.</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 text-foreground"
          >
            {PERIODS.map((p) => (
              <option key={p.days} value={p.days}>{p.label}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="container-custom mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>
        )}
        {loading && !data ? (
          <p className="text-muted-foreground">Yükleniyor...</p>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="w-4 h-4" />} label="Bugün ziyaretçi" value={summary.todayVisitors} />
                <StatCard icon={<Eye className="w-4 h-4" />} label="Bugün sayfa görüntüleme" value={summary.todayViews} />
                <StatCard
                  icon={<Users className="w-4 h-4" />}
                  label="Dönem ziyaretçi"
                  value={summary.visitors}
                  hint="Her günün farklı kişi sayılarının toplamı"
                />
                <StatCard icon={<Eye className="w-4 h-4" />} label="Dönem sayfa görüntüleme" value={summary.views} />
              </div>

              <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-semibold text-foreground mb-4">Günlük ziyaretçi</h3>
                <div className="flex items-end gap-px h-40">
                  {chartDays.map((d) => (
                    <div
                      key={d.day}
                      className="flex-1 bg-primary/70 hover:bg-primary rounded-t min-h-[2px]"
                      style={{ height: `${(d.visitors / maxVisitors) * 100}%` }}
                      title={`${new Date(`${d.day}T12:00:00`).toLocaleDateString("tr-TR")}: ${d.visitors} ziyaretçi, ${d.views} görüntüleme`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{chartDays[0] && new Date(`${chartDays[0].day}T12:00:00`).toLocaleDateString("tr-TR")}</span>
                  <span>Bugün</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <RankTable
                  title="Ülkeler (ziyaretçi)"
                  rows={data.countries.map((c) => ({ name: countryName(c.country), value: c.visitors }))}
                />
                <RankTable
                  title="Şehirler (ziyaretçi)"
                  rows={data.cities.map((c) => ({ name: `${c.city} (${countryName(c.country)})`, value: c.visitors }))}
                />
                <RankTable
                  title="En çok bakılan sayfalar (görüntüleme)"
                  rows={data.paths.map((p) => ({ name: p.path, value: p.views }))}
                />
                <RankTable title="Cihazlar (ziyaretçi)" rows={data.devices.map((d) => ({ name: d.device, value: d.visitors }))} />
                <RankTable
                  title="Nereden geldiler (ziyaretçi)"
                  rows={data.referrers.map((r) => ({ name: r.referrer, value: r.visitors }))}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Konum bilgisi IP adresinden tahmin edilir ve yaklaşıktır. Giriş yapmış yöneticilerin ve arama botlarının
                gezintisi sayılmaz. Aynı kişi farklı günlerde yeniden sayılır, çünkü günlük anonim kod her gün değişir.
              </p>
            </>
          )
        )}
      </main>
    </div>
  );
};

export default AdminStats;
