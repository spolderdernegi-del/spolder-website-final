import { supabase } from "@/integrations/supabase/client";

export type MediaType = "event" | "news" | "blog" | "project" | "upload";

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  title: string;
  date: string;
  size?: number;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  modified: number;
}

// "https://spolder.org/uploads/x.jpg" ile "/uploads/x.jpg" aynı dosyadır.
const normalizeUrl = (url: string) => url.replace(/^https?:\/\/[^/]+/i, "");

/**
 * Sunucunun uploads/ klasöründeki TÜM görselleri (hiçbir içeriğe bağlı
 * olmayanlar dahil) ve haber/etkinlik/proje/blog kapak görsellerini tek
 * listede birleştirir. Bir yüklenmiş dosya aynı zamanda bir içeriğin kapağıysa
 * tek kayıt olarak, o içeriğin başlığı ve türüyle gösterilir.
 */
export async function loadMediaItems(): Promise<{ items: MediaItem[]; uploadsError: boolean }> {
  const covers: MediaItem[] = [];

  const sources: Array<{
    table: string;
    type: MediaType;
    titleField: string;
    imageField: string;
  }> = [
    { table: "events", type: "event", titleField: "baslik", imageField: "gorsel" },
    { table: "news", type: "news", titleField: "baslik", imageField: "gorsel" },
    { table: "blog", type: "blog", titleField: "title", imageField: "image" },
    { table: "projects", type: "project", titleField: "title", imageField: "image" },
  ];

  await Promise.all(
    sources.map(async ({ table, type, titleField, imageField }) => {
      const { data } = await supabase
        .from(table)
        .select(`id, ${titleField}, ${imageField}, created_at`)
        .not(imageField, "is", null)
        .not(imageField, "eq", "");
      (data || []).forEach((row: any) => {
        if (!row[imageField]) return;
        covers.push({
          id: `${type}-${row.id}`,
          url: row[imageField],
          type,
          title: row[titleField] || "",
          date: row.created_at,
        });
      });
    }),
  );

  let uploads: UploadedFile[] = [];
  let uploadsError = false;
  try {
    const res = await fetch("/api/media", { credentials: "include" });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error("liste alınamadı");
    uploads = json.data as UploadedFile[];
  } catch {
    uploadsError = true;
  }

  const uploadByUrl = new Map(uploads.map((u) => [normalizeUrl(u.url), u]));
  const usedUploadUrls = new Set<string>();

  const items: MediaItem[] = covers.map((cover) => {
    const upload = uploadByUrl.get(normalizeUrl(cover.url));
    if (upload) {
      usedUploadUrls.add(normalizeUrl(upload.url));
      return { ...cover, size: upload.size };
    }
    return cover;
  });

  uploads.forEach((u) => {
    if (usedUploadUrls.has(normalizeUrl(u.url))) return;
    items.push({
      id: `upload-${u.name}`,
      url: u.url,
      type: "upload",
      title: u.name,
      date: new Date(u.modified).toISOString(),
      size: u.size,
    });
  });

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return { items, uploadsError };
}
