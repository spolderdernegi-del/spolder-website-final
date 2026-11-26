import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CategoryType = "events" | "news" | "blog" | "projects" | "files";

// Admin panelde (Kategoriler sayfası) her kategoriye bir renk atanabiliyor,
// ama site genelindeki kategori rozetleri bu rengi hiç kullanmıyor,
// hepsi sabit mavi/turuncu Tailwind sınıflarıyla çiziliyordu - admin
// panelden rengi değiştirmek yayındaki görünümü etkilemiyordu. Bu hook,
// kategori adını -> admin panelde seçilen rengine eşleyen bir harita
// döner; çağıran taraf her rozeti bu haritadan gelen renkle çizer.
export const useCategoryColors = (type?: CategoryType) => {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let query = supabase.from("categories").select("name, color");
      if (type) query = query.eq("type", type);
      const { data, error } = await query;
      if (!cancelled && !error && data) {
        const map: Record<string, string> = {};
        data.forEach((c: any) => {
          if (c.name && c.color) map[c.name] = c.color;
        });
        setColors(map);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return colors;
};

// Hex rengi, hafif saydam bir arka plan + tam renkte yazıdan oluşan bir
// rozet stiline çevirir (mevcut "bg-primary/10 text-primary" görünümünün
// dinamik hali). Eşleşen renk yoksa undefined döner - bu durumda çağıran
// taraf kendi varsayılan Tailwind sınıfını kullanmaya devam eder.
export const getCategoryBadgeStyle = (color?: string): CSSProperties | undefined => {
  if (!color) return undefined;
  return {
    backgroundColor: `${color}1A`, // ~%10 opaklık (hex alfa kanalı)
    color,
  };
};

// Koyu/renkli zemin üzerinde (slider, detay sayfası başlığı gibi) kullanılan
// dolgun (solid) rozet stili - arka plan tam renk, yazı her zaman beyaz.
export const getSolidCategoryBadgeStyle = (color?: string): CSSProperties | undefined => {
  if (!color) return undefined;
  return {
    backgroundColor: color,
    color: "#fff",
  };
};
