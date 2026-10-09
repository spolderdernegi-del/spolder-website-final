import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics 4 ölçüm kimliği (analytics.google.com > Yönetici > Veri akışları).
const MEASUREMENT_ID = "G-XBJM0JNM9W";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

let loaded = false;

// Betik dışarıdan (inline olmadan) yüklenir; sitenin içerik güvenlik politikası
// (CSP) inline betiğe izin vermez.
const loadAnalytics = () => {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

// Yönetim paneli (/admin) gezintisi sayılmaz; yalnızca herkese açık sayfalar ölçülür.
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const isAdmin = location.pathname.startsWith("/admin");
    window[`ga-disable-${MEASUREMENT_ID}`] = isAdmin;
    if (!isAdmin) loadAnalytics();
  }, [location.pathname]);

  return null;
};

export default GoogleAnalytics;
