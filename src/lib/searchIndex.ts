// Small client-side search index used for suggestions and local search
export const allContent = [
  {
    id: "haber-1",
    type: "Haber",
    title: "Spor Ekonomisi Raporu 2024 Yayınlandı",
    excerpt: "Türkiye'nin spor ekonomisine ilişkin kapsamlı raporumuz kamuoyuyla paylaşıldı.",
    content:
      "Türkiye'nin spor ekonomisine ilişkin kapsamlı raporumuz kamuoyuyla paylaşıldı. Raporda spor sektörünün GSYH'ye katkısı, istihdam sayıları analiz edilmiştir.",
    date: "12 Aralık 2024",
    author: "SPOLDER Araştırma Ekibi",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80",
    category: "Araştırma",
    link: "/haber/1",
  },
  {
    id: "haber-2",
    type: "Haber",
    title: "Yerel Yönetimler ve Spor Forumu Gerçekleşti",
    excerpt: "Belediyelerin spor politikalarını ele aldığımız forum büyük ilgi gördü.",
    content:
      "Yerel Yönetimler ve Spor Forumu, 50'den fazla belediye temsilcisinin katılımıyla gerçekleşti.",
    date: "8 Aralık 2024",
    author: "SPOLDER Etkinlikler Ekibi",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&auto=format&fit=crop&q=80",
    category: "Etkinlik",
    link: "/haber/2",
  },
  {
    id: "haber-3",
    type: "Haber",
    title: "Avrupa Spor Şartı Türkçe'ye Çevrildi",
    excerpt: "Avrupa Konseyi'nin yeni Spor Şartı'nın Türkçe çevirisi derneğimiz tarafından tamamlandı.",
    content:
      "Avrupa Konseyi tarafından kabul edilen yeni Spor Şartı'nın Türkçe çevirisi, SPOLDER tarafından tamamlanmıştır.",
    date: "5 Aralık 2024",
    author: "Çeviri Ekibi",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80",
    category: "Yayın",
    link: "/haber/3",
  },
  {
    id: "blog-1",
    type: "Blog",
    title: "Spor Politikalarında Yeni Yaklaşımlar",
    excerpt: "Modern spor politikalarının toplum üzerindeki etkilerini ele alan kapsamlı bir analiz.",
    content:
      "Modern spor politikalarının toplum üzerindeki etkileri, vizyonu, dijitalleşme ve yönetim anlayışı üzerine detaylı inceleme.",
    date: "28 Kasım 2024",
    author: "Dr. Ahmet Yılmaz",
    category: "Analiz",
    link: "/blog",
  },
  {
    id: "blog-2",
    type: "Blog",
    title: "Kadın Sporculara Destek Programları",
    excerpt: "Türkiye'de kadın sporcuların karşılaştığı zorluklar ve çözüm önerileri.",
    content:
      "Türkiye'de kadın sporcuların karşılaştığı zorluklar, fırsatlar ve çözüm önerileri üzerine kapsamlı değerlendirme.",
    date: "25 Kasım 2024",
    author: "Prof. Elif Kaya",
    category: "Araştırma",
    link: "/blog",
  },
];

export function searchContent(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allContent.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
  );
}
