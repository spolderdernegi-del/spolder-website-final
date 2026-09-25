import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RESULT_KEY = 'spolder_admin_content_result';
const INFLIGHT_KEY = 'spolder_admin_content_inflight';
const DRAFT_PREFIX = 'spolder_admin_draft_';

interface HandoffOptions<T> {
  /** Bu sayfaya özgü, benzersiz bir anahtar (örn. 'blog', 'news'). */
  storageKey: string;
  formData: T;
  setFormData: (data: T) => void;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  /** Tam sayfa editörün üst barında gösterilecek başlık. */
  editorTitle: string;
  /** formData içindeki içerik alanının adı (varsayılan: 'content'). Events.tsx gibi sayfalarda 'icerik' olabilir. */
  contentField?: keyof T & string;
}

/**
 * "Tam Sayfa Düzenle" akışını yönetir: mevcut formu (içerik dahil)
 * sessionStorage'a yazıp tam sayfa editöre gider; geri dönüldüğünde
 * hem formu hem de düzenlenmiş içeriği geri yükler. Bu sayede sayfa
 * değişse bile (React Router bileşeni yeniden mount eder) doldurulmuş
 * form alanları kaybolmaz.
 */
export function useContentEditorHandoff<T extends Record<string, any>>(
  options: HandoffOptions<T>,
) {
  const { storageKey, formData, setFormData, setShowForm, editingId, setEditingId, editorTitle } = options;
  const contentField = (options.contentField ?? 'content') as string;
  const navigate = useNavigate();
  const location = useLocation();

  // location.key, her navigasyonda (geri dönüşler dahil) değişen benzersiz
  // bir değerdir. Bunu bağımlılık olarak kullanmak, sayfa bileşeni yeniden
  // mount edilmese bile (React Router'ın tam olarak nasıl davrandığından
  // bağımsız olarak) "tam sayfa düzenle"den her dönüşte taslağın kontrol
  // edilmesini garantiler - önceki "sadece bir kez" koruması, ikinci
  // düzenleme denemesinde geri dönüşün hiç işlenmemesine sebep oluyordu.
  useEffect(() => {
    const draftRaw = sessionStorage.getItem(DRAFT_PREFIX + storageKey);
    if (!draftRaw) return;

    try {
      const draft = JSON.parse(draftRaw);
      let restoredContent = draft.formData?.[contentField] ?? '';

      const resultRaw = sessionStorage.getItem(RESULT_KEY);
      if (resultRaw) {
        const result = JSON.parse(resultRaw);
        restoredContent = result.content ?? restoredContent;
      }

      setFormData({ ...draft.formData, [contentField]: restoredContent });
      setShowForm(true);
      setEditingId(draft.editingId ?? null);
    } catch (e) {
      console.error('Form taslağı geri yüklenemedi:', e);
    } finally {
      sessionStorage.removeItem(DRAFT_PREFIX + storageKey);
      sessionStorage.removeItem(RESULT_KEY);
      sessionStorage.removeItem(INFLIGHT_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const openFullEditor = () => {
    sessionStorage.setItem(
      DRAFT_PREFIX + storageKey,
      JSON.stringify({ formData, editingId }),
    );
    sessionStorage.setItem(
      INFLIGHT_KEY,
      JSON.stringify({ content: formData[contentField] ?? '', returnPath: location.pathname, title: editorTitle }),
    );
    navigate('/admin/content-editor');
  };

  return { openFullEditor };
}
