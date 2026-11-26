// Arama kutusuna yazılan metni, sunucuya giden "or=kolon.ilike.%metin%,..." süzgecinde
// güvenle kullanılacak hale getirir: virgül, parantez ve joker karakterleri (% _ *)
// filtreyi bozabildiği için boşluğa çevrilir.
export const sanitizeSearchTerm = (value: string) =>
  value
    .replace(/[,()%_*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ["baslik", "ozet"], "spor" -> "baslik.ilike.%spor%,ozet.ilike.%spor%"
export const buildIlikeFilter = (columns: string[], term: string) =>
  columns.map((column) => `${column}.ilike.%${term}%`).join(",");
