import { useEffect } from "react";

export const DEFAULT_PAGE_TITLE = "SPOLDER - Spor Politikaları Derneği";

// Sayfa açıldığında tarayıcı sekme başlığını (ve arama sonuçlarındaki başlığı)
// ayarlar; sayfadan çıkınca varsayılana döner.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);
}
