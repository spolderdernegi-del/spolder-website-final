import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropperDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  // undefined -> 1 (kare, eski davranış); null -> serbest kırpma (oran kilidi yok)
  aspectRatio?: number | null;
  // Verilirse "Olduğu gibi ekle" butonu çıkar (kırpmadan devam etmek için).
  onUseOriginal?: () => void;
}

const ImageCropperDialog = ({
  open,
  onClose,
  imageUrl,
  onCropComplete,
  aspectRatio = 1,
  onUseOriginal,
}: ImageCropperDialogProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Çıktı, ekranda görünen küçük boyutta değil görselin gerçek çözünürlüğünde
    // üretilir (aksi halde kırpılan görsel bulanık/küçük kalıyordu). Çok büyük
    // fotoğraflar dosya boyutu şişmesin diye en uzun kenarda 2400px ile sınırlanır.
    const srcW = completedCrop.width * scaleX;
    const srcH = completedCrop.height * scaleY;
    const MAX_SIDE = 2400;
    const downscale = Math.min(1, MAX_SIDE / Math.max(srcW, srcH));
    canvas.width = Math.round(srcW * downscale);
    canvas.height = Math.round(srcH * downscale);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      srcW,
      srcH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      }, "image/jpeg", 0.95);
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fotoğrafı Kırp</DialogTitle>
          <DialogDescription>
            Fotoğrafı kırpmak için alanı sürükleyin ve boyutlandırın.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center items-center py-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio ?? undefined}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Kırpılacak görsel"
              style={{ maxHeight: "60vh", maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          {onUseOriginal && (
            <Button variant="outline" onClick={onUseOriginal}>
              Olduğu Gibi Ekle
            </Button>
          )}
          <Button onClick={handleCropConfirm}>
            Kırp ve Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropperDialog;
