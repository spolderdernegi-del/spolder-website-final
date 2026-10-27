// Yönetim işlem günlüğü: kayıtlar sunucuda (veritabanında) tutulur; kullanıcı adı
// sunucudaki oturumdan alınır. Günlük yazılamasa bile asıl işlem hiç etkilenmez.
export interface ActivityLog {
  id: number;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  contentType: 'event' | 'news' | 'blog' | 'project' | 'file' | 'category' | 'welcome-modal' | 'activity' | 'board' | 'settings';
  contentTitle: string;
  user: string;
  timestamp: string;
}

export const logActivity = (
  action: ActivityLog['action'],
  contentType: ActivityLog['contentType'],
  contentTitle: string
) => {
  // Beklenmez (fire-and-forget): hata olursa sessizce yok sayılır.
  fetch('/api/activity-log', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, contentType, contentTitle }),
  }).catch(() => {});
};

export const getActivityLogs = async (limit = 50): Promise<ActivityLog[]> => {
  try {
    const res = await fetch(`/api/activity-log?limit=${limit}`, { credentials: 'include' });
    const json = await res.json();
    return res.ok && Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
};

export const getActionText = (action: ActivityLog['action']): string => {
  const texts = {
    create: 'oluşturdu',
    update: 'güncelledi',
    delete: 'sildi',
    publish: 'yayınladı',
    unpublish: 'yayından kaldırdı'
  };
  return texts[action] || action;
};

export const getContentTypeText = (type: ActivityLog['contentType']): string => {
  const texts = {
    event: 'Etkinlik',
    news: 'Haber',
    blog: 'Blog',
    project: 'Proje',
    file: 'Dosya',
    category: 'Kategori',
    'welcome-modal': 'Hoş Geldiniz Pop-up',
    activity: 'Faaliyetlerimiz',
    board: 'Yönetim Kurulu',
    settings: 'Ayarlar'
  };
  return texts[type] || type;
};
