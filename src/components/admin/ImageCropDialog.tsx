import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ImageCropDialogProps {
  imageSrc: string | null;
  onClose: () => void;
  onCropDone: (croppedDataUrl: string) => void;
}

const ASPECT_OPTIONS: { label: string; value: number }[] = [
  { label: 'Serbest (Kare)', value: 1 },
  { label: 'Yatay (16:9)', value: 16 / 9 },
  { label: 'Dikey (4:5)', value: 4 / 5 },
  { label: 'Geniş (21:9)', value: 21 / 9 },
  { label: 'Orijinal (4:3)', value: 4 / 3 },
];

// Verilen kırpma alanına göre görseli canvas'a çizip base64 data URL olarak döndürür.
async function getCroppedImageDataUrl(imageSrc: string, cropPixels: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context oluşturulamadı');

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  );

  return canvas.toDataURL('image/png');
}

const ImageCropDialog = ({ imageSrc, onClose, onCropDone }: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(ASPECT_OPTIONS[0].value);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels);
      onCropDone(dataUrl);
    } catch (err) {
      console.error('Görsel kırpılamadı:', err);
      alert('Görsel kırpılırken bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Görseli Kırp</DialogTitle>
        </DialogHeader>

        {imageSrc && (
          <>
            <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {ASPECT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.label}
                    type="button"
                    size="sm"
                    variant={aspect === opt.value ? 'default' : 'outline'}
                    onClick={() => setAspect(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Yakınlaştır</span>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(v) => setZoom(v[0])}
                />
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
            Vazgeç
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={processing || !croppedAreaPixels}>
            {processing ? 'İşleniyor...' : 'Kırp ve Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
