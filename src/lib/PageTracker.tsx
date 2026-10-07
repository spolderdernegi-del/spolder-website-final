import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Çerezsiz, kimlik saklamayan sayfa görüntüleme sayacı. Sunucu yalnızca
// ülke/şehir, cihaz türü ve günlük değişen anonim bir kod kaydeder.
const PageTracker = () => {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/admin") || path === lastPath.current) return;
    const referrer = lastPath.current === null ? document.referrer : "";
    lastPath.current = path;
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, referrer }),
        keepalive: true,
        credentials: "include",
      }).catch(() => {});
    } catch {
      // sayaç hatası siteyi etkilememeli
    }
  }, [location.pathname]);

  return null;
};

export default PageTracker;
