import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics 4 ölçüm kimliği (analytics.google.com > Yönetici > Veri akışları).
const MEASUREMENT_ID = "G-112S66KK7W";

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

// --- Tıklama takibi -----------------------------------------------------------
// Tek bir dinleyici sayfadaki TÜM link/butonları izler (haber içeriğine admin panelinden
// eklenen "Kayıt Ol" gibi bağlantılar dahil); tek tek kod eklemek gerekmez.
// GA'da: Raporlar > Etkileşim > Etkinlikler. Olay adları:
//   kayit_ol_tikla  - metni "Kayıt Ol / Başvur" içeren link veya buton
//   whatsapp_tikla, telefon_tikla, eposta_tikla
//   dosya_indir     - PDF, Word, Excel, ZIP vb.
//   dis_link_tikla  - başka bir siteye giden link
//   sosyal_tikla    - Instagram, X, Facebook, LinkedIn, YouTube vb.
// Bir öğeye data-ga-event="olay_adi" yazılırsa o ad kullanılır.
const FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|csv)(\?|#|$)/i;
const SOCIAL_RE = /(^|\.)(instagram|facebook|x|twitter|linkedin|youtube|tiktok|t)\.(com|me)$/i;
const REGISTER_RE = /kay[ıi]t\s*(ol|formu|yapt[ıi]r)|ba[şs]vur|register|sign\s*up/i;

const trackEvent = (name: string, params: Record<string, string | number | undefined> = {}) => {
  if (typeof window === "undefined" || !window.gtag) return;
  if (window.location.pathname.startsWith("/admin")) return;
  window.gtag("event", name, {
    page_path: window.location.pathname,
    page_title: document.title,
    content_title: document.querySelector("h1")?.textContent?.trim().slice(0, 100) || undefined,
    transport_type: "beacon",
    ...params,
  });
};

const handleClick = (e: MouseEvent) => {
  const target = e.target as Element | null;
  const el = target?.closest?.("a, button, [data-ga-event]") as HTMLElement | null;
  if (!el) return;
  const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);
  const custom = el.closest("[data-ga-event]")?.getAttribute("data-ga-event");
  const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") || "" : "";
  const base = { link_text: text, link_url: href.slice(0, 200) || undefined };

  let name: string | null = null;
  if (custom) name = custom;
  else if (REGISTER_RE.test(text) && !/^\s*$/.test(text) && text.length <= 40) name = "kayit_ol_tikla";
  else if (href.startsWith("tel:")) name = "telefon_tikla";
  else if (href.startsWith("mailto:")) name = "eposta_tikla";
  else if (/wa\.me|whatsapp\.com|api\.whatsapp/i.test(href)) name = "whatsapp_tikla";
  else if (FILE_RE.test(href)) name = "dosya_indir";
  else if (/^https?:\/\//i.test(href)) {
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      if (host !== window.location.hostname.replace(/^www\./, "")) name = SOCIAL_RE.test(host) ? "sosyal_tikla" : "dis_link_tikla";
    } catch {
      /* geçersiz adres: izleme yok */
    }
  }
  if (name) trackEvent(name, base);
};

let clickTrackingOn = false;
const enableClickTracking = () => {
  if (clickTrackingOn) return;
  clickTrackingOn = true;
  document.addEventListener("click", handleClick, true);
  document.addEventListener("auxclick", handleClick, true); // orta tuş (yeni sekme)
};

// Yönetim paneli (/admin) gezintisi sayılmaz; yalnızca herkese açık sayfalar ölçülür.
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const isAdmin = location.pathname.startsWith("/admin");
    window[`ga-disable-${MEASUREMENT_ID}`] = isAdmin;
    if (!isAdmin) {
      loadAnalytics();
      enableClickTracking();
    }
  }, [location.pathname]);

  return null;
};

export default GoogleAnalytics;
