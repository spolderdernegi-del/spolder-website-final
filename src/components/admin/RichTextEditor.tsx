import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const RichTextEditor = ({ value, onChange, placeholder = "İçerik yazın...", rows = 10 }: RichTextEditorProps) => {
  // Configure toolbar with basic formatting options
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link'
  ];

  // Calculate approximate height based on rows
  const editorHeight = rows * 24; // Approximate line height

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: `${editorHeight}px`, marginBottom: '42px' }}
      />
      <style>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: ${editorHeight}px;
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
