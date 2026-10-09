// Aktivite logu yönetimi
export interface ActivityLog {
  id: number;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  contentType: 'event' | 'news' | 'blog' | 'project' | 'file' | 'category' | 'welcome-modal';
  contentTitle: string;
  user: string;
  timestamp: string;
}

export const logActivity = (
  action: ActivityLog['action'],
  contentType: ActivityLog['contentType'],
  contentTitle: string
) => {
  const user = localStorage.getItem('adminAuth') === 'true' ? 'admin@spolder.org' : 'unknown';
  
  const log: ActivityLog = {
    id: Date.now(),
    action,
    contentType,
    contentTitle,
    user,
    timestamp: new Date().toISOString()
  };

  const existingLogs = localStorage.getItem('spolder_activity_logs');
  const logs: ActivityLog[] = existingLogs ? JSON.parse(existingLogs) : [];
  
  // En son 100 log'u tut
  logs.unshift(log);
  if (logs.length > 100) {
    logs.pop();
  }

  localStorage.setItem('spolder_activity_logs', JSON.stringify(logs));
};

export const getActivityLogs = (limit?: number): ActivityLog[] => {
  const logs = localStorage.getItem('spolder_activity_logs');
  const allLogs: ActivityLog[] = logs ? JSON.parse(logs) : [];
  return limit ? allLogs.slice(0, limit) : allLogs;
};

export const getActionText = (action: ActivityLog['action']): string => {
  const texts = {
    create: 'oluşturdu',
    update: 'güncelledi',
    delete: 'sildi',
    publish: 'yayınladı',
    unpublish: 'yayından kaldırdı'
  };
  return texts[action];
};

export const getContentTypeText = (type: ActivityLog['contentType']): string => {
  const texts = {
    event: 'Etkinlik',
    news: 'Haber',
    blog: 'Blog',
    project: 'Proje',
    file: 'Dosya',
    category: 'Kategori',
    'welcome-modal': 'Hoş Geldiniz Pop-up'
  };
  return texts[type];
};
