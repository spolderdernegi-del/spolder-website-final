// "Kayıt Ol" tıklamasını kendi sayacımıza yazar (admin panelinde etkinlik listesinde,
// gün gün görünür). Hem etkinlik listesindeki hem detay sayfasındaki butonlar kullanır.
// Sayaç hatası ziyaretçiyi asla etkilemesin diye hatalar yutulur.
export const trackEventRegister = (eventId: number | string) => {
  try {
    navigator.sendBeacon?.(
      "/api/track/event-register",
      new Blob([JSON.stringify({ eventId })], { type: "application/json" }),
    );
  } catch {
    /* yoksay */
  }
};
