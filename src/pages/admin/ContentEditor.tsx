import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, ChevronUp, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { uploadImage } from '@/lib/uploadImage';

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
        const dataUrl = reader.result as string;
        // Önce base64 olarak hemen eklenir (beklemeden görünsün diye),
        // arka planda gerçek dosyaya yüklenip src ile değiştirilir.
        ed.insertEmbed(insertIndex, 'image', dataUrl);
        ed.setSelection(insertIndex + 1, 0);
        syncContentFromDom();

        requestAnimationFrame(() => {
          const [leafBlot] = ed.getLeaf(insertIndex);
          const insertedImg = (leafBlot as any)?.domNode as HTMLImageElement | undefined;
          if (!insertedImg) return;
          uploadImage(dataUrl)
            .then((url) => {
              insertedImg.src = url;
              syncContentFromDom();
            })
            .catch((err) => console.error('Görsel yüklenemedi, base64 olarak kalacak:', err));
        });
      };
      reader.readAsDataURL(file);
    };
  };

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
            placeholder="İçeriğinizi buraya yazın, veya sağ üstteki 'Word Dosyası Yükle' ile Word'de hazırladığınız belgeyi içe aktarın..."
          />
        </div>
      </div>

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
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
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
