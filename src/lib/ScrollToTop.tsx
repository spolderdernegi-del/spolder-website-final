import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // #bağlantı varsa ilgili öğeye kaydır (içerik geç yüklenebilir, kısa bekle).
      const t = setTimeout(() => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) el.scrollIntoView();
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }, 100);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
