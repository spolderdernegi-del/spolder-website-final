// "2025-12-04" veya ISO tarih metnini "4 Aralık 2025" gibi okunur hale getirir.
// Geçersiz/boş değerde olduğu gibi (ya da boş) döner; sayfa asla "NaN" göstermez.
export const formatDate = (value?: string | null): string => {
  if (!value) return "";
  const text = String(value).trim();
  const ymd = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = ymd ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])) : new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
};
