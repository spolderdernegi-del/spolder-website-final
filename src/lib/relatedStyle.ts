import { useSearchParams } from "react-router-dom";

// "İlgili haberler/yazılar/projeler" kart görünümü:
//  1: büyük görsel, başlık ve tarih altında
//  2: solda küçük görsel, yanında başlık ve tarih
//  3: büyük görsel, başlık ve tarih görselin üstünde
// Kalıcı seçim aşağıdaki sabittir. Karşılaştırmak için adrese ?ilgili=1|2|3 eklenebilir.
export type RelatedStyle = "1" | "2" | "3";
export const DEFAULT_RELATED_STYLE: RelatedStyle = "1";

export function useRelatedStyle(): RelatedStyle {
  const [params] = useSearchParams();
  const q = params.get("ilgili");
  return q === "1" || q === "2" || q === "3" ? q : DEFAULT_RELATED_STYLE;
}
