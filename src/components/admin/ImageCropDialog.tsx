import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageCropDialogProps {
  imageSrc: string | null;
  onClose: () => void;
  onCropDone: (croppedDataUrl: string) => void;
}

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DISPLAY_MAX = 560; // Görüntülenen kutu genişliği/yüksekliği üst sınırı
const HANDLE_SIZE = 12;
const MIN_SIZE = 24; // Kırpma kutusu en az bu kadar (görüntü pikseli) olabilir

const HANDLES: { id: HandleId; cursor: string; style: (r: Rect) => React.CSSProperties }[] = [
  { id: 'nw', cursor: 'nwse-resize', style: (r) => ({ left: r.x - HANDLE_SIZE / 2, top: r.y - HANDLE_SIZE / 2 }) },
  { id: 'n', cursor: 'ns-resize', style: (r) => ({ left: r.x + r.w / 2 - HANDLE_SIZE / 2, top: r.y - HANDLE_SIZE / 2 }) },
  { id: 'ne', cursor: 'nesw-resize', style: (r) => ({ left: r.x + r.w - HANDLE_SIZE / 2, top: r.y - HANDLE_SIZE / 2 }) },
  { id: 'e', cursor: 'ew-resize', style: (r) => ({ left: r.x + r.w - HANDLE_SIZE / 2, top: r.y + r.h / 2 - HANDLE_SIZE / 2 }) },
  { id: 'se', cursor: 'nwse-resize', style: (r) => ({ left: r.x + r.w - HANDLE_SIZE / 2, top: r.y + r.h - HANDLE_SIZE / 2 }) },
  { id: 's', cursor: 'ns-resize', style: (r) => ({ left: r.x + r.w / 2 - HANDLE_SIZE / 2, top: r.y + r.h - HANDLE_SIZE / 2 }) },
  { id: 'sw', cursor: 'nesw-resize', style: (r) => ({ left: r.x - HANDLE_SIZE / 2, top: r.y + r.h - HANDLE_SIZE / 2 }) },
  { id: 'w', cursor: 'ew-resize', style: (r) => ({ left: r.x - HANDLE_SIZE / 2, top: r.y + r.h / 2 - HANDLE_SIZE / 2 }) },
];

const ImageCropDialog = ({ imageSrc, onClose, onCropDone }: ImageCropDialogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [processing, setProcessing] = useState(false);

  const dragRef = useRef<{ handle: HandleId; startX: number; startY: number; startRect: Rect } | null>(null);

  // Görsel her değiştiğinde (dialog her açıldığında) ölçüleri hesapla ve
  // kırpma kutusunu görselin tamamını kaplayacak şekilde sıfırla.
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(DISPLAY_MAX / img.naturalWidth, DISPLAY_MAX / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setDisplaySize({ w, h });
      setRect({ x: 0, y: 0, w, h });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const clampRect = (r: Rect): Rect => {
    let { x, y, w, h } = r;
    w = Math.max(MIN_SIZE, Math.min(w, displaySize.w));
    h = Math.max(MIN_SIZE, Math.min(h, displaySize.h));
    x = Math.max(0, Math.min(x, displaySize.w - w));
    y = Math.max(0, Math.min(y, displaySize.h - h));
    return { x, y, w, h };
  };

  const onHandleMouseDown = (handle: HandleId) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect: rect };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const s = drag.startRect;
      let next: Rect = { ...s };

      switch (drag.handle) {
        case 'move':
          next = { ...s, x: s.x + dx, y: s.y + dy };
          break;
        case 'nw':
          next = { x: s.x + dx, y: s.y + dy, w: s.w - dx, h: s.h - dy };
          break;
        case 'n':
          next = { x: s.x, y: s.y + dy, w: s.w, h: s.h - dy };
          break;
        case 'ne':
          next = { x: s.x, y: s.y + dy, w: s.w + dx, h: s.h - dy };
          break;
        case 'e':
          next = { x: s.x, y: s.y, w: s.w + dx, h: s.h };
          break;
        case 'se':
          next = { x: s.x, y: s.y, w: s.w + dx, h: s.h + dy };
          break;
        case 's':
          next = { x: s.x, y: s.y, w: s.w, h: s.h + dy };
          break;
        case 'sw':
          next = { x: s.x + dx, y: s.y, w: s.w - dx, h: s.h };
          break;
        case 'w':
          next = { x: s.x + dx, y: s.y, w: s.w - dx, h: s.h };
          break;
      }
      setRect(clampRect(next));
    };
    const onMouseUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displaySize]);

  const handleConfirm = async () => {
    if (!imageSrc || displaySize.w === 0) return;
    setProcessing(true);
    try {
      const scale = naturalSize.w / displaySize.w;
      const naturalCrop = {
        x: Math.round(rect.x * scale),
        y: Math.round(rect.y * scale),
        w: Math.round(rect.w * scale),
        h: Math.round(rect.h * scale),
      };

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = imageSrc;
      });

      const canvas = document.createElement('canvas');
      canvas.width = naturalCrop.w;
      canvas.height = naturalCrop.h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context oluşturulamadı');
      ctx.drawImage(img, naturalCrop.x, naturalCrop.y, naturalCrop.w, naturalCrop.h, 0, 0, naturalCrop.w, naturalCrop.h);

      onCropDone(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Görsel kırpılamadı:', err);
      alert('Görsel kırpılırken bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Görseli Kırp</DialogTitle>
        </DialogHeader>

        {imageSrc && displaySize.w > 0 && (
          <div
            ref={containerRef}
            className="relative select-none bg-muted"
            style={{ width: displaySize.w, height: displaySize.h }}
          >
            <img
              src={imageSrc}
              alt="Kırpılacak görsel"
              draggable={false}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ width: displaySize.w, height: displaySize.h }}
            />

            {/* Kırpma kutusunun dışını karart (kutunun kendisi üzerinden dev bir gölge ile) */}
            <div
              className="absolute border-2 border-white cursor-move"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              }}
              onMouseDown={onHandleMouseDown('move')}
            />

            {HANDLES.map((h) => (
              <div
                key={h.id}
                className="absolute bg-white border border-primary rounded-sm"
                style={{
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  cursor: h.cursor,
                  ...h.style(rect),
                }}
                onMouseDown={onHandleMouseDown(h.id)}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Kenarlardaki veya köşelerdeki küçük kareleri sürükleyerek kırpma alanını ayarlayın,
          ortadan tutup sürükleyerek taşıyın.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
            Vazgeç
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={processing || displaySize.w === 0}>
            {processing ? 'İşleniyor...' : 'Kırp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
