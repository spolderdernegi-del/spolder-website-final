import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlignLeft, AlignCenter, AlignRight, Baseline, Rows3, Crop, Trash2, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import ImageCropDialog from '@/components/admin/ImageCropDialog';

// Quill'in kendi resmi "size" attributor'ünü, piksel cinsinden tam
// değerlerle değiştiriyoruz (küçük/büyük/devasa gibi belirsiz etiketler
// yerine). Bu, Quill'in dokümante edilmiş standart özelleştirme yöntemi -
// üçüncü parti bir eklenti değil, riskli değil.
const PX_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
const SizeStyle = Quill.import('attributors/style/size') as any;
SizeStyle.whitelist = PX_SIZES;
Quill.register(SizeStyle, true);

const INFLIGHT_KEY = 'spolder_admin_content_inflight';
const RESULT_KEY = 'spolder_admin_content_result';
const MAX_INLINE_IMAGE_MB = 3;

// Görsele uygulanabilecek metin sarma (wrap) sınıfları - birbirini dışlar.
const WRAP_CLASSES = ['img-float-left', 'img-float-right', 'img-align-center', 'img-inline', 'img-wrap-topbottom'];
// Görsele uygulanabilecek boyut sınıfları - birbirini dışlar.
const SIZE_CLASSES = ['img-size-small', 'img-size-medium', 'img-size-large'];

interface InflightDraft {
  content: string;
  returnPath: string;
  title?: string;
}

const AdminContentEditor = () => {
  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill>(null);
  const [draft, setDraft] = useState<InflightDraft | null>(null);
  const [content, setContent] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Editör içinde tıklanan görsel ve onun için gösterilen küçük araç çubuğu.
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem(INFLIGHT_KEY);
    if (!raw) {
      setNotFound(true);
      return;
    }
    try {
      const parsed: InflightDraft = JSON.parse(raw);
      setDraft(parsed);
      setContent(parsed.content || '');
    } catch {
      setNotFound(true);
    }
  }, []);

  // Editör içindeki görsellere tıklanmasını dinler; bir görsele tıklanınca
  // onun üstünde küçük bir hizalama/boyut araç çubuğu gösterir.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const root = editor?.root;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const rect = img.getBoundingClientRect();
        setSelectedImage(img);
        setToolbarPos({ top: rect.top + window.scrollY - 48, left: rect.left + window.scrollX });
      } else {
        setSelectedImage(null);
        setToolbarPos(null);
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [content === '']); // İçerik ilk yüklendiğinde editör hazır olunca yeniden bağlan

  const syncContentFromDom = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) setContent(editor.root.innerHTML);
  };

  const applyWrap = (cls: string) => {
    if (!selectedImage) return;
    WRAP_CLASSES.forEach((c) => selectedImage.classList.remove(c));
    selectedImage.classList.add(cls);
    forceRerender((n) => n + 1);
    syncContentFromDom();
  };

  const applySize = (cls: string | null) => {
    if (!selectedImage) return;
    SIZE_CLASSES.forEach((c) => selectedImage.classList.remove(c));
    if (cls) selectedImage.classList.add(cls);
    else selectedImage.style.width = '';
    forceRerender((n) => n + 1);
    syncContentFromDom();
  };

  const deleteSelectedImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    setToolbarPos(null);
    syncContentFromDom();
  };

  const openCrop = () => {
    if (!selectedImage) return;
    setCropSrc(selectedImage.src);
  };

  const handleCropDone = (croppedDataUrl: string) => {
    if (selectedImage) {
      selectedImage.src = croppedDataUrl;
      syncContentFromDom();
    }
    setCropSrc(null);
  };

  const imageHandler = () => {
    const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection(true);
    const insertIndex = range ? range.index : (editor?.getLength() ?? 0);

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > MAX_INLINE_IMAGE_MB * 1024 * 1024) {
        alert(`Görsel çok büyük (max ${MAX_INLINE_IMAGE_MB}MB). Lütfen daha küçük bir görsel seçin.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const ed = quillRef.current?.getEditor();
        if (!ed) return;
        ed.insertEmbed(insertIndex, 'image', reader.result);
        ed.setSelection(insertIndex + 1, 0);
      };
      reader.readAsDataURL(file);
    };
  };

  // Word'e benzer, genişletilmiş ama yalnızca Quill'in kendi çekirdek
  // (native) formatlarını kullanan bir araç çubuğu. Geçen seferki çökme
  // üçüncü parti bir eklentiden kaynaklandığı için, burada sadece
  // Quill'in kendi test edilmiş özellikleri kullanılıyor.
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: PX_SIZES }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  }), []);

  const formats = [
    'header', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote',
    'link', 'image',
  ];

  const handleSave = () => {
    if (!draft) return;
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ content }));
    sessionStorage.removeItem(INFLIGHT_KEY);
    toast.success('İçerik güncellendi, geri dönülüyor...');
    navigate(draft.returnPath || '/admin');
  };

  const handleCancel = () => {
    sessionStorage.removeItem(INFLIGHT_KEY);
    navigate(draft?.returnPath || '/admin');
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Düzenlenecek bir içerik bulunamadı. Lütfen ilgili sayfadaki
            "Tam Sayfa Düzenle" butonunu kullanarak buraya gelin.
          </p>
          <Button onClick={() => navigate('/admin')}>Admin Paneline Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-20 border-b bg-card shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Vazgeç
            </Button>
            <div>
              <h1 className="font-semibold text-foreground leading-tight">
                {draft?.title || 'İçerik Düzenle'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Değişiklikler yalnızca "Kaydet ve Geri Dön" ile kalıcı olur.
              </p>
            </div>
          </div>
          <Button type="button" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Kaydet ve Geri Dön
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="full-page-editor bg-card rounded-lg border shadow-sm">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="İçeriğinizi buraya yazın..."
          />
        </div>
      </div>

      {/* Görsele tıklanınca çıkan hizalama/boyut araç çubuğu (Word'deki "Resim Biçimi" mantığına benzer, sadeleştirilmiş) */}
      {selectedImage && toolbarPos && (
        <div
          className="fixed z-30 bg-card border rounded-md shadow-lg p-1.5 flex items-center gap-1 flex-wrap max-w-xs"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          <span className="text-[10px] text-muted-foreground px-1 w-full">Metin Sarma</span>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Sola yasla, metin sağdan sarsın" onClick={() => applyWrap('img-float-left')}>
            <AlignLeft className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Ortala" onClick={() => applyWrap('img-align-center')}>
            <AlignCenter className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Sağa yasla, metin soldan sarsın" onClick={() => applyWrap('img-float-right')}>
            <AlignRight className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Metinle aynı hizada (satır içi)" onClick={() => applyWrap('img-inline')}>
            <Baseline className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Üstte ve altta (kendi satırında, metin yanına sarmaz)" onClick={() => applyWrap('img-wrap-topbottom')}>
            <Rows3 className="w-3.5 h-3.5" />
          </Button>

          <span className="text-[10px] text-muted-foreground px-1 w-full mt-1">Boyut</span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => applySize('img-size-small')}>K</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => applySize('img-size-medium')}>O</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => applySize('img-size-large')}>B</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => applySize(null)}>Orijinal</Button>

          <div className="w-full flex justify-between mt-1 pt-1 border-t">
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Görseli kırp" onClick={openCrop}>
              <Crop className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Görseli sil" onClick={deleteSelectedImage}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Kapat" onClick={() => { setSelectedImage(null); setToolbarPos(null); }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ImageCropDialog
        imageSrc={cropSrc}
        onClose={() => setCropSrc(null)}
        onCropDone={handleCropDone}
      />

      <style>{`
        .full-page-editor .ql-toolbar {
          position: sticky;
          top: 64px;
          z-index: 10;
          background: hsl(var(--card));
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .full-page-editor .ql-container {
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 15px;
          min-height: calc(100vh - 260px);
        }
        .full-page-editor .ql-editor {
          min-height: calc(100vh - 260px);
          padding: 2rem 3rem;
        }
        .full-page-editor .ql-editor::after {
          content: '';
          display: block;
          clear: both;
        }
        .full-page-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
          cursor: pointer;
        }
        .full-page-editor .ql-editor img.img-float-left {
          float: left;
          margin: 0.25rem 1.5rem 1rem 0;
          width: 40%;
        }
        .full-page-editor .ql-editor img.img-float-right {
          float: right;
          margin: 0.25rem 0 1rem 1.5rem;
          width: 40%;
        }
        .full-page-editor .ql-editor img.img-align-center {
          display: block;
          margin-left: auto;
          margin-right: auto;
          float: none;
        }
        .full-page-editor .ql-editor img.img-inline {
          float: none;
          display: inline-block;
          margin: 0.5rem 0;
        }
        .full-page-editor .ql-editor img.img-wrap-topbottom {
          display: block;
          float: none;
          clear: both;
          margin: 1rem 0;
        }
        .full-page-editor .ql-editor img.img-size-small { width: 25%; }
        .full-page-editor .ql-editor img.img-size-medium { width: 50%; }
        .full-page-editor .ql-editor img.img-size-large { width: 75%; }
        .dark .full-page-editor .ql-toolbar {
          border-color: #334155;
        }
        .dark .full-page-editor .ql-container {
          border-color: #334155;
          background: #0f172a;
        }
        .dark .full-page-editor .ql-editor {
          color: #e2e8f0;
        }
        .dark .full-page-editor .ql-stroke {
          stroke: #94a3b8;
        }
        .dark .full-page-editor .ql-fill {
          fill: #94a3b8;
        }
        .dark .full-page-editor .ql-picker-label {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AdminContentEditor;
