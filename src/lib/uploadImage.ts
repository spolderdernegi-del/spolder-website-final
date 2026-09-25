/**
 * Bir base64 data URL'i (ör. FileReader.readAsDataURL çıktısı) backend'e
 * yükler, orada gerçek bir dosyaya çevrilir ve herkese açık URL'i döner.
 * Böylece görseller veritabanına devasa base64 metinler olarak gömülmez -
 * bu hem veritabanını küçültür hem de WhatsApp/Facebook gibi paylaşım
 * botlarının görsele erişebilmesini sağlar (onlar gerçek bir URL'e ihtiyaç
 * duyar, base64'e değil).
 */
export async function uploadImage(dataUrl: string): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: dataUrl }),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json?.error?.message || "Görsel yüklenemedi");
  }
  return json.data.url as string;
}
