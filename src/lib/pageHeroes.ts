import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Sayfa başlık (yeşil alan) görselleri: settings tablosunda "page_heroes" anahtarında
// { sayfaAnahtarı: görselUrl } olarak tutulur. Yönetim: /admin/page-heroes
export const PAGE_HERO_PAGES: { key: string; label: string }[] = [
  { key: "hakkimizda", label: "Hakkımızda" },
  { key: "haberler", label: "Haberler" },
  { key: "etkinlikler", label: "Etkinlikler" },
  { key: "projeler", label: "Projeler" },
  { key: "blog", label: "Blog" },
  { key: "yayinlar", label: "Yayınlar" },
  { key: "iletisim", label: "İletişim" },
  { key: "faaliyet", label: "Faaliyetlerimiz (tüm kartlar ve sayfalar)" },
];

export type PageHeroMap = Record<string, string>;

export function parsePageHeroes(raw: unknown): PageHeroMap {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: PageHeroMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

let cache: PageHeroMap | null = null;
let inflight: Promise<PageHeroMap> | null = null;

function loadPageHeroes(): Promise<PageHeroMap> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = (async () => {
      try {
        const { data } = await supabase.from("settings").select("value").eq("key", "page_heroes");
        cache = parsePageHeroes(data?.[0]?.value);
        return cache;
      } catch {
        return {};
      } finally {
        inflight = null;
      }
    })();
  }
  return inflight;
}

/** Sayfanın başlık görseli (yoksa boş string → varsayılan yeşil). */
export function usePageHeroImage(pageKey: string): string {
  const [image, setImage] = useState<string>(cache?.[pageKey] ?? "");
  useEffect(() => {
    let cancelled = false;
    loadPageHeroes().then((map) => {
      if (!cancelled) setImage(map[pageKey] ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [pageKey]);
  return image;
}
