import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, ChevronUp, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { uploadImage } from '@/lib/uploadImage';
import ImageCropperDialog from '@/components/admin/ImageCropperDialog';
import ImageSourceDialog from '@/components/admin/ImageSourceDialog';

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
const MAX_DOCX_MB = 15;

// Yüklemesi başlatılmış görseller (HTML'e öznitelik yazmadan işaretlemek için).
const uploadingImgs = new WeakSet<Element>();

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
  const [importingDocx, setImportingDocx] = useState(false);
  // Toolbar'daki görsel butonu önce kaynak seçtiren pencereyi açar
  // (Medya Kütüphanesi / Bilgisayardan / Link).
  const [showImageSource, setShowImageSource] = useState(false);
  const insertIndexRef = useRef(0);
  // Kırpma penceresi: yeni eklenen görsel ('insert') veya editörde zaten
  // olan bir görsele tıklanarak ('replace') açılır.
  const [pendingCrop, setPendingCrop] = useState<
    | { kind: 'insert'; src: string; index: number }
    | { kind: 'replace'; src: string; img: HTMLImageElement }
    | null
  >(null);

  // Word'deki gibi, imlecin bulunduğu yerin yazı boyutunu gösteren/değiştiren
  // sayısal kutu. "...Text" olanlar serbestçe yazılabilsin diye ayrı tutuluyor;
  // sınır (min/max) sadece kutudan çıkılınca (blur) veya Enter'a basılınca
  // uygulanıyor - yoksa her tuşta anlık sınırlamaya takılıp örn. "300"
  // yazılamıyordu.
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [fontSizeText, setFontSizeText] = useState(String(DEFAULT_FONT_SIZE));

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

  const syncContentFromDom = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) setContent(editor.root.innerHTML);
  };

  // Basitleştirilmiş görsel ekleme: resim imlecin olduğu yere, tam
  // genişlikte, metnin arasına düz bir şekilde eklenir - hizalama/sarma/
  // kırpma gibi özel durumlar yok. Bu, önceki karmaşık sürümde tekrar
  // tekrar hatalara sebep olan kısımdı; basit ve garanti çalışan bir
  // davranış tercih edildi. Görsel arka planda gerçek bir dosyaya
  // yüklenip src'si (yalnızca bir öznitelik değişikliği, belge yapısına
  // dokunmuyor) güncelleniyor.
  const imageHandler = () => {
    const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection(true);
    insertIndexRef.current = range ? range.index : (editor?.getLength() ?? 0);
    setShowImageSource(true);
  };

  const handlePickFile = (file: File) => {
    if (file.size > MAX_INLINE_IMAGE_MB * 1024 * 1024) {
      alert(`Görsel çok büyük (max ${MAX_INLINE_IMAGE_MB}MB). Lütfen daha küçük bir görsel seçin.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      // Görsel doğrudan eklenmez; önce kırpma penceresi açılır
      // ("Olduğu Gibi Ekle" ile kırpmadan da eklenebilir).
      setPendingCrop({ kind: 'insert', src: reader.result as string, index: insertIndexRef.current });
    };
    reader.readAsDataURL(file);
  };

  // Kütüphanedeki görsel: kırpılabilir veya olduğu gibi eklenebilir.
  const handlePickLibrary = (url: string) => {
    setPendingCrop({ kind: 'insert', src: url, index: insertIndexRef.current });
  };

  // Link ile eklenen görsel olduğu gibi (kırpma/yükleme yapılmadan) eklenir.
  const handlePickUrl = (url: string) => {
    insertImage(url, insertIndexRef.current);
  };

  // Görseli (base64 olarak hemen, sonra gerçek dosyaya yükleyerek) imlecin
  // olduğu yere ekler.
  const insertImage = (dataUrl: string, insertIndex: number) => {
    const ed = quillRef.current?.getEditor();
    if (!ed) return;
    ed.insertEmbed(insertIndex, 'image', dataUrl);
    ed.setSelection(insertIndex + 1, 0);
    syncContentFromDom();

    // Zaten gerçek bir adresi olan (kütüphane/link) görsel tekrar yüklenmez.
    if (!dataUrl.startsWith('data:')) return;

    requestAnimationFrame(() => {
      // Eklenen görseli, henüz yükleme için işaretlenmemiş ve src'si bu base64 olan
      // <img> olarak bul (art arda eklenen görsellerde indeksle bulmak yanlış görseli veriyordu).
      const candidates = Array.from(ed.root.querySelectorAll('img')) as HTMLImageElement[];
      const insertedImg = candidates.find((el) => el.getAttribute('src') === dataUrl && !uploadingImgs.has(el));
      if (!insertedImg) return;
      uploadingImgs.add(insertedImg);
      uploadImage(dataUrl)
        .then((url) => {
          insertedImg.src = url;
          syncContentFromDom();
        })
        .catch((err) => console.error('Görsel yüklenemedi, base64 olarak kalacak:', err));
    });
  };

  const handleCropDone = (croppedDataUrl: string) => {
    if (!pendingCrop) return;
    if (pendingCrop.kind === 'insert') {
      insertImage(croppedDataUrl, pendingCrop.index);
    } else {
      const img = pendingCrop.img;
      img.src = croppedDataUrl;
      syncContentFromDom();
      uploadImage(croppedDataUrl)
        .then((url) => {
          img.src = url;
          syncContentFromDom();
        })
        .catch((err) => console.error('Görsel yüklenemedi, base64 olarak kalacak:', err));
    }
  };

  const handleUseOriginal = () => {
    if (pendingCrop?.kind === 'insert') insertImage(pendingCrop.src, pendingCrop.index);
    setPendingCrop(null);
  };

  // Editördeki bir görsele tıklayınca kırpma penceresi açılır.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        setPendingCrop({ kind: 'replace', src: (target as HTMLImageElement).src, img: target as HTMLImageElement });
      }
    };
    editor.root.addEventListener('click', onClick);
    return () => editor.root.removeEventListener('click', onClick);
  }, [content === '']);

  // Sürükle-bırak ve yapıştır:
  //  - Bilgisayardan bir (veya birkaç) görsel dosyası editöre sürüklenip bırakılınca
  //    bırakılan yere eklenir; panodan görsel yapıştırılınca imlecin olduğu yere eklenir.
  //  - Editördeki bir görsel sürüklenip başka bir yere bırakılınca taşınır.
  // Görseller arka planda gerçek dosyaya yüklenir (insertImage); sonradan görsele
  // tıklayıp kırpılabilir.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const root = editor.root as HTMLElement;
    let draggedImg: HTMLImageElement | null = null;

    const indexAtPoint = (x: number, y: number): number => {
      try {
        const doc = document as any;
        let node: Node | null = null;
        let offset = 0;
        if (doc.caretRangeFromPoint) {
          const r = doc.caretRangeFromPoint(x, y);
          if (r) { node = r.startContainer; offset = r.startOffset; }
        } else if (doc.caretPositionFromPoint) {
          const p = doc.caretPositionFromPoint(x, y);
          if (p) { node = p.offsetNode; offset = p.offset; }
        }
        if (node && root.contains(node)) {
          const sel = (editor as any).selection;
          const normalized = sel.normalizeNative({
            startContainer: node, startOffset: offset, endContainer: node, endOffset: offset,
          });
          const range = normalized && sel.normalizedToRange(normalized);
          if (range && typeof range.index === 'number') return range.index;
        }
      } catch {
        // aşağıdaki yedeğe düş
      }
      return editor.getSelection()?.index ?? Math.max(editor.getLength() - 1, 0);
    };

    const imageFiles = (list: FileList | null | undefined): File[] =>
      Array.from(list || []).filter((f) => f.type.startsWith('image/'));

    const insertFiles = async (files: File[], startIndex: number) => {
      let idx = startIndex;
      for (const file of files) {
        if (file.size > MAX_INLINE_IMAGE_MB * 1024 * 1024) {
          toast.error(`"${file.name}" çok büyük (max ${MAX_INLINE_IMAGE_MB}MB), eklenmedi.`);
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }).catch(() => '');
        if (!dataUrl) {
          toast.error(`"${file.name}" okunamadı.`);
          continue;
        }
        insertImage(dataUrl, idx);
        idx += 1;
      }
    };

    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement;
      draggedImg = t && t.tagName === 'IMG' ? (t as HTMLImageElement) : null;
    };
    const onDragEnd = () => { draggedImg = null; };
    const onDragOver = (e: DragEvent) => {
      const hasFiles = Array.from(e.dataTransfer?.types || []).includes('Files');
      if (hasFiles || draggedImg) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      // Editördeki görseli taşı
      if (draggedImg) {
        e.preventDefault();
        e.stopPropagation();
        const img = draggedImg;
        draggedImg = null;
        const blot = Quill.find(img) as any;
        if (!blot) return;
        const from = editor.getIndex(blot);
        let to = indexAtPoint(e.clientX, e.clientY);
        if (to === from || to === from + 1) return;
        const src = img.getAttribute('src') || '';
        editor.deleteText(from, 1, 'user');
        if (to > from) to -= 1;
        editor.insertEmbed(to, 'image', src, 'user');
        editor.setSelection(to + 1, 0);
        syncContentFromDom();
        return;
      }
      // Bilgisayardan görsel dosyası bırakıldı
      const files = imageFiles(e.dataTransfer?.files);
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        void insertFiles(files, indexAtPoint(e.clientX, e.clientY));
      } else if ((e.dataTransfer?.files?.length ?? 0) > 0) {
        // Görsel olmayan dosya bırakılırsa tarayıcı sayfayı o dosyaya yönlendirmesin.
        e.preventDefault();
        toast.error('Yalnızca görsel dosyaları (JPG, PNG, WEBP...) bırakabilirsiniz.');
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      const files = imageFiles(e.clipboardData?.files);
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const idx = editor.getSelection(true)?.index ?? Math.max(editor.getLength() - 1, 0);
      void insertFiles(files, idx);
    };

    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragend', onDragEnd);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop, true);
    root.addEventListener('paste', onPaste, true);
    return () => {
      root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragend', onDragEnd);
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('drop', onDrop, true);
      root.removeEventListener('paste', onPaste, true);
    };
  }, [content === '']);

  // Word (.docx) belgesi yükleme: admin, içeriği (resimler, başlıklar,
  // kalın/italik metin dahil) Word'de yazıp tek bir dosya olarak
  // yükleyebilir. Backend bunu HTML'e çevirir, gömülü görselleri gerçek
  // dosyalara kaydedip gerçek URL'lerle referanslar. Mevcut içeriğin
  // TAMAMININ yerini alır.
  const docxHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', '.docx');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > MAX_DOCX_MB * 1024 * 1024) {
        alert(`Dosya çok büyük (max ${MAX_DOCX_MB}MB).`);
        return;
      }

      if (content.trim() && !confirm('Bu, mevcut içeriğin TAMAMININ yerini alacak. Devam edilsin mi?')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        setImportingDocx(true);
        try {
          const dataUrl = reader.result as string;
          const res = await fetch('/api/upload/docx-to-html', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataUrl }),
          });
          const json = await res.json();
          if (!res.ok || json.error) {
            throw new Error(json?.error?.message || 'Word dosyası dönüştürülemedi');
          }
          setContent(json.data.html);
          toast.success('Word belgesi başarıyla içe aktarıldı');
        } catch (err: any) {
          toast.error('Word dosyası içe aktarılamadı: ' + err.message);
        } finally {
          setImportingDocx(false);
        }
      };
      reader.readAsDataURL(file);
    };
  };

  // Word'e benzer, genişletilmiş ama yalnızca Quill'in kendi çekirdek
  // (native) formatlarını kullanan bir araç çubuğu.
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
    const editor = quillRef.current?.getEditor();
    const finalContent = editor ? editor.root.innerHTML : content;
    sessionStorage.setItem(RESULT_KEY, JSON.stringify({ content: finalContent }));
    sessionStorage.removeItem(INFLIGHT_KEY);
    toast.success('İçerik forma aktarıldı - kalıcı olması için "Kaydet" butonuna basmayı unutmayın!');
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
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                ⚠️ Bu buton içeriği forma aktarır. KALICI olması için geri döndüğünüzde
                formdaki asıl "Kaydet" butonuna da basmanız gerekir.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={docxHandler} disabled={importingDocx} className="gap-2">
              {importingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {importingDocx ? 'Aktarılıyor...' : 'Word Dosyası Yükle'}
            </Button>
            <Button type="button" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              İçeriği Aktar ve Geri Dön
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
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
              Görselleri bilgisayarınızdan sürükleyip editöre bırakabilir veya yapıştırabilirsiniz; eklenmiş görseli sürükleyerek taşıyabilir, tıklayarak kırpabilirsiniz.
            </span>
          </div>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="İçeriğinizi buraya yazın, veya sağ üstteki 'Word Dosyası Yükle' ile Word'de hazırladığınız belgeyi içe aktarın..."
          />
        </div>
      </div>

      <ImageSourceDialog
        open={showImageSource}
        onClose={() => setShowImageSource(false)}
        onPickFile={handlePickFile}
        onPickUrl={handlePickUrl}
        onPickLibrary={handlePickLibrary}
      />

      {pendingCrop && (
        <ImageCropperDialog
          open
          onClose={() => setPendingCrop(null)}
          imageUrl={pendingCrop.src}
          onCropComplete={handleCropDone}
          aspectRatio={null}
          onUseOriginal={pendingCrop.kind === 'insert' ? handleUseOriginal : undefined}
        />
      )}

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
        .full-page-editor .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.75rem auto;
          cursor: pointer;
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
