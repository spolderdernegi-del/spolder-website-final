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
}

const DEFAULT_COLOR = "#3B82F6";

// "Filtrele" butonuna basılınca açılan, mevcut kategorileri (admin
// panelindeki renkleriyle) rozet listesi olarak gösteren, tıklanınca
// seçili kategoriye göre filtreleyen paylaşılan bileşen. Haberler,
// Etkinlikler, Projeler ve Blog listeleme sayfalarında kullanılıyor.
const CategoryFilterBar = ({ categories, categoryColors, selected, onSelect }: CategoryFilterBarProps) => {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) return null;

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filtrele
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
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selected === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            Tümü
          </button>
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
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={
                  isActive
                    ? { backgroundColor: color, color: "#fff", borderColor: color }
                    : { backgroundColor: `${color}1A`, color, borderColor: `${color}55` }
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
