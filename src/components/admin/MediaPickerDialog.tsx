import { useEffect, useState } from "react";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { loadMediaItems, type MediaItem } from "@/lib/mediaLibrary";

interface MediaPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

// Medya kütüphanesindeki (sitede yüklenmiş tüm) görsellerden birini seçtirir.
const MediaPickerDialog = ({ open, onClose, onSelect }: MediaPickerDialogProps) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setSearch("");
    loadMediaItems()
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setUploadsError(res.uploadsError);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Medya Kütüphanesi</DialogTitle>
          <DialogDescription>Kullanmak istediğiniz görsele tıklayın.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Görsel ara..."
            className="pl-9"
          />
        </div>

        {uploadsError && (
          <p className="text-xs text-amber-600">
            Yüklenen dosyaların tam listesi alınamadı; sadece içeriklere bağlı görseller gösteriliyor.
          </p>
        )}

        <div className="flex-1 overflow-y-auto min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mb-2" />
              Görsel bulunamadı
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group text-left rounded-lg overflow-hidden border bg-card hover:ring-2 hover:ring-primary transition"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs p-2 truncate" title={item.title}>
                    {item.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPickerDialog;
