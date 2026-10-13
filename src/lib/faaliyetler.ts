// Site altlığındaki (footer) "Faaliyetlerimiz" listesi ve her öğenin kendi
// sayfasının adresi. Liste admin panelinden (Ayarlar → Faaliyetlerimiz)
// düzenlenir; her öğenin sayfası otomatik oluşur: /faaliyetlerimiz/<ad>.
export interface FooterService {
  label: string;
  query: string; // virgülle ayrılmış kategori adları
}

export const FOOTER_SERVICES_MAX = 5;

// Admin panelden hiç kaydedilmemişse gösterilen varsayılan liste.
export const DEFAULT_FOOTER_SERVICES: FooterService[] = [
  { label: "Araştırma & Analiz", query: "araştırma analiz" },
  { label: "Eğitim Programları", query: "eğitim programları" },
  { label: "Politika Önerileri", query: "politika önerileri" },
  { label: "Spor Danışmanlığı", query: "spor danışmanlığı" },
  { label: "Uluslararası İşbirlikleri", query: "uluslararası işbirlikleri" },
];

// "Eğitim Programları" -> "egitim-programlari"
export const slugify = (value: string) =>
  value
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const faaliyetPath = (service: FooterService) => `/faaliyetlerimiz/${slugify(service.label)}`;

export const parseFooterServices = (raw?: string | null): FooterService[] => {
  if (!raw) return DEFAULT_FOOTER_SERVICES;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, FOOTER_SERVICES_MAX);
  } catch {
    // bozuk veri: varsayılan liste
  }
  return DEFAULT_FOOTER_SERVICES;
};
