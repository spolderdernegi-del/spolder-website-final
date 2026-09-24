import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/lib/toast';

const INFLIGHT_KEY = 'spolder_admin_content_inflight';
const RESULT_KEY = 'spolder_admin_content_result';
const MAX_INLINE_IMAGE_MB = 3;

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
        [{ size: ['small', false, 'large', 'huge'] }],
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
