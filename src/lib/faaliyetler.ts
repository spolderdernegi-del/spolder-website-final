// Site altlığındaki (footer) "Faaliyetlerimiz" listesi ve her öğenin kendi
// sayfasının adresi. Liste admin panelinden (Ayarlar → Faaliyetlerimiz)
// düzenlenir; her öğenin sayfası otomatik oluşur: /faaliyetlerimiz/<ad>.
export interface FooterService {
  id?: string; // sabit kimlik: başlık değişse de sayfa içeriği kaybolmaz
  label: string;
  query: string; // virgülle ayrılmış kategori adları
}

// Her faaliyetin kendi sayfa içeriği (settings: faaliyet_pages -> { [id]: ... }).
export interface FaaliyetPage {
  summary?: string; // hero altında kısa açıklama
  image?: string; // sayfanın üst görseli
  content?: string; // editörle yazılan HTML
  showRelated?: boolean; // altta kategoriye ait yazıları göster (varsayılan: evet)
}

// Bir faaliyetin altındaki tek tek gönderiler (settings: faaliyet_posts -> { [faaliyetId]: FaaliyetPost[] }).
// Sitede kart olarak listelenir; karta tıklayınca gönderinin kendi sayfası açılır.
export interface FaaliyetPost {
  id: string;
  title: string;
  summary?: string; // kartta görünen kısa metin
  image?: string; // kart ve sayfa görseli
  content?: string; // editörle yazılan HTML
  date?: string; // ISO tarih (sıralama ve gösterim)
}

export const parseFaaliyetPosts = (raw?: string | null): Record<string, FaaliyetPost[]> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, FaaliyetPost[]> = {};
    Object.entries(parsed).forEach(([key, list]) => {
      if (Array.isArray(list)) out[key] = list.filter((p: any) => p && p.id && p.title);
    });
    return out;
  } catch {
    return {};
  }
};

export const sortPostsNewestFirst = (list: FaaliyetPost[]) =>
  [...list].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

export const serviceId = (service: FooterService) => service.id || slugify(service.label);

export const parseFaaliyetPages = (raw?: string | null): Record<string, FaaliyetPage> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

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
