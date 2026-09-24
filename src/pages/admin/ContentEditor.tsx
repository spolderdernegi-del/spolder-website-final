import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, AlignLeft, AlignCenter, AlignRight, Baseline, Rows3, Crop, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from '@/lib/toast';
import ImageCropDialog from '@/components/admin/ImageCropDialog';

// Quill'in kendi resmi "size" attributor'ünü, piksel cinsinden serbest
// değerlerle çalışacak şekilde ayarlıyoruz (Word'deki gibi elle yazılabilir
// bir punto kutusu için). Bu, Quill'in dokümante edilmiş standart
// özelleştirme yöntemi - üçüncü parti bir eklenti değil, riskli değil.
const DEFAULT_FONT_SIZE = 16;
const SizeStyle = Quill.import('attributors/style/size') as any;
SizeStyle.whitelist = null; // whitelist yok = herhangi bir px değeri kabul edilir
Quill.register(SizeStyle, true);

const INFLIGHT_KEY = 'spolder_admin_content_inflight';
const RESULT_KEY = 'spolder_admin_content_result';
const MAX_INLINE_IMAGE_MB = 3;

// Görsele uygulanabilecek metin sarma (wrap) sınıfları - birbirini dışlar.
const WRAP_CLASSES = ['img-float-left', 'img-float-right', 'img-align-center', 'img-inline', 'img-wrap-topbottom'];

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

  // Word'deki gibi, imlecin bulunduğu yerin yazı boyutunu gösteren/değiştiren
  // sayısal kutu. "...Text" olanlar serbestçe yazılabilsin diye ayrı tutuluyor;
  // sınır (min/max) sadece kutudan çıkılınca (blur) veya Enter'a basılınca
  // uygulanıyor - yoksa her tuşta anlık sınırlamaya takılıp örn. "300"
  // yazılamıyordu.
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [fontSizeText, setFontSizeText] = useState(String(DEFAULT_FONT_SIZE));
  // Seçili görselin genişliği (px) - araç çubuğundaki sayısal kutuda gösterilir.
  const [imageWidth, setImageWidth] = useState(0);
  const [imageWidthText, setImageWidthText] = useState('');

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
        const r = img.getBoundingClientRect();
        setSelectedImage(img);
        setToolbarPos({ top: r.top + window.scrollY - 48, left: r.left + window.scrollX });
        setImageWidth(Math.round(img.getBoundingClientRect().width));
        setImageWidthText(String(Math.round(img.getBoundingClientRect().width)));
      } else {
        setSelectedImage(null);
        setToolbarPos(null);
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [content === '']); // İçerik ilk yüklendiğinde editör hazır olunca yeniden bağlan

  // İmlecin bulunduğu yerin yazı boyutunu izler, Word'deki punto kutusunu günceller.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const updateFromSelection = () => {
      const range = editor.getSelection();
      if (!range) return;
      const fmt = editor.getFormat(range) as Record<string, any>;
      const sizeVal = fmt.size as string | undefined;
      const px = sizeVal ? parseInt(sizeVal, 10) : DEFAULT_FONT_SIZE;
      if (!Number.isNaN(px)) { setFontSize(px); setFontSizeText(String(px)); }
    };

    editor.on('selection-change', updateFromSelection);
    editor.on('editor-change', updateFromSelection);
    return () => {
      editor.off('selection-change', updateFromSelection);
      editor.off('editor-change', updateFromSelection);
    };
  }, [content === '']);

  const applyFontSize = (px: number) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const clamped = Math.max(6, Math.min(200, Math.round(px)));
    setFontSize(clamped);
    setFontSizeText(String(clamped));
    const range = editor.getSelection();
    if (range && range.length > 0) {
      editor.format('size', `${clamped}px`);
    } else {
      // Seçili metin yoksa, bundan sonra yazılacak metne uygulanır.
      editor.format('size', `${clamped}px`);
      editor.focus();
    }
  };

  // Kutudan çıkılınca (blur) veya Enter'a basılınca çağrılır; o ana kadar
  // kullanıcı sınırlanmadan istediği sayıyı serbestçe yazabilir.
  const commitFontSize = () => {
    const parsed = parseInt(fontSizeText, 10);
    applyFontSize(Number.isNaN(parsed) ? fontSize : parsed);
  };

  // Görsel üzerindeki de değişiklikler sadece ger DOM'a uygulanır; bunu
  // ReactQuill'in kontrollü "value" prop'una geri yazmıyoruz. Çünkü Quill
  // HTML'i kendi Delta modeline çevirirken class gibi kendi tanımadığı
  // özel öznitelikleri (attribute) silebiliyor - bu da az önce uyguladığımız
  // hizalama/boyut sınıflarının anlık olarak geri alınmasına neden oluyordu.
  // Bunun yerine gerçek/güncel HTML'i sadece kaydetme anında DOM'dan okuyoruz.
  const repositionToolbar = (img: HTMLImageElement) => {
    const r = img.getBoundingClientRect();
    setToolbarPos({ top: r.top + window.scrollY - 48, left: r.left + window.scrollX });
  };

  const applyWrap = (cls: string) => {
    if (!selectedImage) return;
    WRAP_CLASSES.forEach((c) => selectedImage.classList.remove(c));
    selectedImage.classList.add(cls);
    forceRerender((n) => n + 1);
    repositionToolbar(selectedImage);
  };

  const applyImageWidthPx = (px: number) => {
    if (!selectedImage) return;
    const clamped = Math.max(20, Math.min(2000, Math.round(px)));
    // Satır içi style, sınıf tabanlı kurallardan her zaman daha önceliklidir,
    // bu yüzden görsel genişliği burada kesin ve garanti şekilde uygulanır.
    selectedImage.style.width = `${clamped}px`;
    selectedImage.style.height = 'auto';
    setImageWidth(clamped);
    setImageWidthText(String(clamped));
    forceRerender((n) => n + 1);
    repositionToolbar(selectedImage);
  };

  // Kutudan çıkılınca (blur) veya Enter'a basılınca çağrılır; o ana kadar
  // kullanıcı sınırlanmadan istediği sayıyı serbestçe yazabilir.
  const commitImageWidth = () => {
    const parsed = parseInt(imageWidthText, 10);
    applyImageWidthPx(Number.isNaN(parsed) ? imageWidth : parsed);
  };

  const resetImageSize = () => {
    if (!selectedImage) return;
    selectedImage.style.width = '';
    selectedImage.style.height = '';
    setImageWidth(selectedImage.naturalWidth || 0);
    setImageWidthText(String(selectedImage.naturalWidth || 0));
    forceRerender((n) => n + 1);
    repositionToolbar(selectedImage);
  };

  const deleteSelectedImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    setToolbarPos(null);
  };

  const openCrop = () => {
    if (!selectedImage) return;
    setCropSrc(selectedImage.src);
  };

  const handleCropDone = (croppedDataUrl: string) => {
    if (selectedImage) {
      selectedImage.src = croppedDataUrl;
      // Kırpma sonrası boyut/oran değiştiği için araç çubuğunu yeniden konumlandır.
      requestAnimationFrame(() => {
        if (selectedImage) {
          repositionToolbar(selectedImage);
          setImageWidth(Math.round(selectedImage.getBoundingClientRect().width));
          setImageWidthText(String(Math.round(selectedImage.getBoundingClientRect().width)));
        }
      });
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
    // Görsel araç çubuğundaki değişiklikler React state'ine anlık
    // yansıtılmıyor (yukarıdaki not), o yüzden burada gerçek/güncel
    // HTML'i doğrudan editörün DOM'undan okuyoruz.
    const editor = quillRef.current?.getEditor();
    const finalContent = editor ? editor.root.innerHTML : content;
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ content: finalContent }));
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
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/40">
            <span className="text-xs text-muted-foreground">Yazı Boyutu (px)</span>
            <div className="flex items-center border rounded-md overflow-hidden bg-background">
              <Input
                type="number"
                value={fontSizeText}
                onChange={(e) => setFontSizeText(e.target.value)}
                onBlur={commitFontSize}
                onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                className="w-16 h-7 border-0 text-center px-1 focus-visible:ring-0"
              />
              <div className="flex flex-col border-l">
                <button
                  type="button"
                  className="h-3.5 w-5 flex items-center justify-center hover:bg-muted"
                  onClick={() => applyFontSize(fontSize + 1)}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="h-3.5 w-5 flex items-center justify-center hover:bg-muted border-t"
                  onClick={() => applyFontSize(fontSize - 1)}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Metni seçip değiştirin, veya seçim yokken sonraki yazılacak metne uygulanır.
            </span>
          </div>
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

          <span className="text-[10px] text-muted-foreground px-1 w-full mt-1">Genişlik (px)</span>
          <div className="flex items-center gap-1 w-full">
            <Input
              type="number"
              value={imageWidthText}
              onChange={(e) => setImageWidthText(e.target.value)}
              onBlur={commitImageWidth}
              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
              className="h-7 text-xs px-2 w-20"
            />
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2" onClick={resetImageSize}>
              Orijinal
            </Button>
          </div>

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
          float: left !important;
          margin: 0.25rem 2rem 1rem 0 !important;
          max-width: 45%;
        }
        .full-page-editor .ql-editor img.img-float-right {
          float: right !important;
          margin: 0.25rem 0 1rem 2rem !important;
          max-width: 45%;
        }
        .full-page-editor .ql-editor img.img-align-center {
          display: block;
          margin-left: auto !important;
          margin-right: auto !important;
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
