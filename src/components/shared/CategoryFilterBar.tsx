import { useState } from "react";
import { Filter } from "lucide-react";

interface CategoryFilterBarProps {
  // O anki içerik listesinde (sayfadaki haberler/etkinlikler/projeler/
  // bloglar) fiilen kullanılan kategori adları - sadece gerçekten içeriği
  // olan kategoriler listelenir.
  categories: string[];
  // useCategoryColors() hook'undan gelen kategori adı -> admin panelde
  // seçilen renk haritası. Eşleşme yoksa varsayılan mavi kullanılır.
  categoryColors: Record<string, string>;
  selected: string | null;
  onSelect: (category: string | null) => void;
  // Opsiyonel: kategori rozetlerinin yanında aynı panelde gösterilen ek
  // durum filtresi (örn. Etkinlikler'de "Devam Eden" / "Süresi Geçen").
  // Seçili olana tekrar tıklanınca seçim kalkar (tüm durumlar gösterilir).
  statusOptions?: string[];
  selectedStatus?: string | null;
  onSelectStatus?: (status: string | null) => void;
}

const DEFAULT_COLOR = "#3B82F6";

// "Filtrele" butonuna basılınca açılan, mevcut kategorileri (admin
// panelindeki renkleriyle) rozet listesi olarak gösteren, tıklanınca
// seçili kategoriye göre filtreleyen paylaşılan bileşen. Haberler,
// Etkinlikler, Projeler ve Blog listeleme sayfalarında kullanılıyor.
const CategoryFilterBar = ({
  categories,
  categoryColors,
  selected,
  onSelect,
  statusOptions,
  selectedStatus,
  onSelectStatus,
}: CategoryFilterBarProps) => {
  const [open, setOpen] = useState(false);

  if (categories.length === 0 && (!statusOptions || statusOptions.length === 0)) return null;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filtrele
        {selectedStatus && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {selectedStatus}
          </span>
        )}
        {selected && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${categoryColors[selected] || DEFAULT_COLOR}1A`, color: categoryColors[selected] || DEFAULT_COLOR }}
          >
            {selected}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 w-64 max-w-full rounded-lg border border-border bg-card shadow-card overflow-hidden">
          {statusOptions?.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                type="button"
                key={status}
                onClick={() => {
                  onSelectStatus?.(isActive ? null : status);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium border-b border-border last:border-b-0 transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {status}
              </button>
            );
          })}
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium border-b border-border last:border-b-0 transition-colors ${
                selected === null ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              Tümü
            </button>
          )}
          {categories.map((cat) => {
            const isActive = selected === cat;
            const color = categoryColors[cat] || DEFAULT_COLOR;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => {
                  onSelect(isActive ? null : cat);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium border-b border-border last:border-b-0 transition-colors hover:brightness-95"
                style={
                  isActive
                    ? { backgroundColor: color, color: "#fff" }
                    : { backgroundColor: "transparent", color }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilterBar;
