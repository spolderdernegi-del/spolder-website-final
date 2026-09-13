import { useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { ImageResize } from 'quill-image-resize-module-react';
import 'react-quill/dist/quill.snow.css';
import ImageCropDialog from './ImageCropDialog';

// Modülü sadece bir kez, uygulama genelinde kaydet.
Quill.register('modules/imageResize', ImageResize);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

// İçerik satırı çok büyümesin diye tek bir gömülü görsel için üst sınır.
// (Kapak görseli gibi bu da base64 olarak doğrudan içeriğin içine gömülüyor,
// ayrı bir dosya depolama/upload altyapısı gerektirmiyor.)
const MAX_INLINE_IMAGE_MB = 3;

const RichTextEditor = ({ value, onChange, placeholder = "İçerik yazın...", rows = 10 }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  // Kırpma modalı açıkken, kırpma bitince görseli imlecin doğru yerine
  // ekleyebilmek için seçilen ham görseli ve o andaki imleç konumunu tutar.
  const [pendingImage, setPendingImage] = useState<{ src: string; insertIndex: number } | null>(null);

  const imageHandler = () => {
    const editor = quillRef.current?.getEditor();
    // Modal açılınca editör odağı/seçimi kaybolabilir, o yüzden şimdi kaydet.
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
        setPendingImage({ src: reader.result as string, insertIndex });
      };
      reader.readAsDataURL(file);
    };
  };

  const handleCropDone = (croppedDataUrl: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor && pendingImage) {
      editor.insertEmbed(pendingImage.insertIndex, 'image', croppedDataUrl);
      editor.setSelection(pendingImage.insertIndex + 1, 0);
    }
    setPendingImage(null);
  };

  // Configure toolbar with basic formatting options
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      },
    },
    // Metin içine eklenen görsele tıklayınca boyutlandırma tutamaçları ve
    // hizalama (sol/orta/sağ) araç çubuğu çıkar.
    imageResize: {
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
    },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  // Calculate approximate height based on rows
  const editorHeight = rows * 24; // Approximate line height

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: `${editorHeight}px`, marginBottom: '42px' }}
      />
      <ImageCropDialog
        imageSrc={pendingImage?.src ?? null}
        onClose={() => setPendingImage(null)}
        onCropDone={handleCropDone}
      />
      <style>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: ${editorHeight}px;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        .rich-text-editor .ql-toolbar {
          background: #f8fafc;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        .rich-text-editor .ql-container {
          border-radius: 0 0 0.375rem 0.375rem;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #1e293b;
          border-color: #334155;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #334155;
          background: #0f172a;
        }
        .dark .rich-text-editor .ql-editor {
          color: #e2e8f0;
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: #94a3b8;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #94a3b8;
        }
        .dark .rich-text-editor .ql-picker-label {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
