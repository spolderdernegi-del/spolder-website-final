import { useRef, useState } from "react";
import { Images, Upload, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaPickerDialog from "./MediaPickerDialog";

interface ImageSourceDialogProps {
  open: boolean;
  onClose: () => void;
  onPickFile: (file: File) => void;
  onPickUrl: (url: string) => void;
  onPickLibrary: (url: string) => void;
}

// Editöre görsel eklerken: Medya Kütüphanesi / Bilgisayardan / Link seçeneği.
const ImageSourceDialog = ({ open, onClose, onPickFile, onPickUrl, onPickLibrary }: ImageSourceDialogProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [url, setUrl] = useState("");

  const handleClose = () => {
    setUrl("");
    onClose();
  };

  const submitUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onPickUrl(trimmed);
    handleClose();
  };

  return (
    <>
      <Dialog open={open && !showLibrary} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Görsel Ekle</DialogTitle>
            <DialogDescription>Görseli nereden eklemek istiyorsunuz?</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => setShowLibrary(true)}>
              <Images className="w-4 h-4" />
              Medya Kütüphanesinden Seç
            </Button>

            <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Bilgisayardan Yükle
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                onPickFile(file);
                handleClose();
              }}
            />

            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link ile Ekle
              </p>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitUrl();
                    }
                  }}
                  placeholder="https://..."
                />
                <Button type="button" onClick={submitUrl} disabled={!url.trim()}>
                  Ekle
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MediaPickerDialog
        open={open && showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={(selected) => {
          onPickLibrary(selected);
          setShowLibrary(false);
          handleClose();
        }}
      />
    </>
  );
};

export default ImageSourceDialog;
