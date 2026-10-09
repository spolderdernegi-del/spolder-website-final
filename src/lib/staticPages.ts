// Veritabanından gelmeyen, sitedeki sabit sayfalar ve bölümler.
// Site arama kutusunda (hem header'daki anlık öneri hem /search sonuç sayfası)
// bu sayfaların da bulunabilmesi için kullanılır.
// Yeni bir statik sayfa/bölüm eklendiğinde buraya da eklenmesi gerekir.
export interface StaticPage {
  title: string;
  keywords: string[];
  excerpt: string;
  link: string;
}

export const STATIC_PAGES: StaticPage[] = [
  {
    title: "Hakkımızda",
    keywords: ["hakkımızda", "hakkinda", "sivil toplum kuruluşu", "misyon", "vizyon", "başkan mesajı"],
    excerpt: "SPOLDER Spor Politikaları Derneği'ni tanıyın.",
    link: "/hakkimizda",
  },
  {
    title: "Kurumsal Kimlik",
    keywords: ["kurumsal kimlik", "logo", "marka", "renk paleti", "marka kılavuzu", "vektör logo"],
    excerpt: "Logo kullanım kılavuzu, renk paleti ve tipografi.",
    link: "/hakkimizda#kurumsal-kimlik",
  },
  {
    title: "Yönetim Kurulu",
    keywords: ["yönetim kurulu", "kurul üyeleri", "yönetim"],
    excerpt: "SPOLDER yönetim kurulu üyeleri.",
    link: "/hakkimizda",
  },
  {
    title: "İletişim",
    keywords: ["iletişim", "contact", "adres", "telefon", "mail", "e-posta"],
    excerpt: "Bizimle iletişime geçin.",
    link: "/iletisim",
  },
  {
    title: "KVKK",
    keywords: ["kvkk", "kişisel verilerin korunması", "aydınlatma metni"],
    excerpt: "Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    link: "/kvkk",
  },
  {
    title: "Gizlilik Politikası",
    keywords: ["gizlilik", "gizlilik politikası", "privacy"],
    excerpt: "Gizlilik politikamız hakkında bilgi alın.",
    link: "/gizlilik",
  },
  {
    title: "Yayınlar",
    keywords: ["yayınlar", "raporlar", "araştırmalar", "politika belgeleri"],
    excerpt: "Raporlar, araştırmalar ve politika belgeleri.",
    link: "/yayinlar",
  },
];

/** Sorguya (query) göre eşleşen statik sayfaları döndürür. Harf harf daraltarak filtreler. */
export function matchStaticPages(query: string): StaticPage[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return STATIC_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(q) ||
      page.keywords.some((kw) => kw.toLowerCase().includes(q))
  );
}
