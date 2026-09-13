import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Scissors } from "lucide-react";
import { toast } from "@/lib/toast";
import ImageCropperDialog from "./ImageCropperDialog";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  aspectRatio?: number;
}

const ImageUploadField = ({
  label,
  value,
  onChange,
  required = false,
  aspectRatio = 16 / 9,
}: ImageUploadFieldProps) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin");
      return;
    }

    setUploadFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropImage = () => {
    const urlToCrop = imagePreview || value;
    if (!urlToCrop) {
      toast.error("Lütfen önce bir görsel seçin");
      return;
    }
    setImageToCrop(urlToCrop);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedImage: string) => {
    onChange(croppedImage);
    setImagePreview(croppedImage);
    setShowCropper(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && "*"}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... veya dosya yükleyin"
        required={required}
      />
      <div className="flex gap-2 mt-2">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button type="button" variant="outline" className="pointer-events-none">
            <Upload className="w-4 h-4 mr-2" />
            Dosya Yükle
          </Button>
        </div>
        {(imagePreview || value) && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCropImage}
          >
            <Scissors className="w-4 h-4 mr-2" />
            Kırp
          </Button>
        )}
      </div>
      {(imagePreview || value) && (
        <div className="mt-2">
          <img
            src={imagePreview || value}
            alt="Önizleme"
            className="w-full max-w-md h-48 object-cover rounded"
          />
        </div>
      )}

      <ImageCropperDialog
        open={showCropper}
        onClose={() => setShowCropper(false)}
        imageUrl={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
      />
    </div>
  );
};

export default ImageUploadField;
