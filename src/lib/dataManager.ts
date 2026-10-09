// Veri Export/Import yönetimi

export const exportAllData = () => {
  const data = {
    events: JSON.parse(localStorage.getItem('spolder_events') || '[]'),
    news: JSON.parse(localStorage.getItem('spolder_news') || '[]'),
    blog: JSON.parse(localStorage.getItem('spolder_blog') || '[]'),
    projects: JSON.parse(localStorage.getItem('spolder_projects') || '[]'),
    files: JSON.parse(localStorage.getItem('spolder_files') || '[]'),
    categories: JSON.parse(localStorage.getItem('spolder_categories') || '[]'),
    welcomeModal: JSON.parse(localStorage.getItem('spolder_welcome_modal') || 'null'),
    activityLogs: JSON.parse(localStorage.getItem('spolder_activity_logs') || '[]'),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spolder-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Veri doğrulama
        if (!data.version || !data.exportDate) {
          throw new Error('Geçersiz yedek dosyası formatı');
        }

        // Verileri geri yükle
        if (data.events) localStorage.setItem('spolder_events', JSON.stringify(data.events));
        if (data.news) localStorage.setItem('spolder_news', JSON.stringify(data.news));
        if (data.blog) localStorage.setItem('spolder_blog', JSON.stringify(data.blog));
        if (data.projects) localStorage.setItem('spolder_projects', JSON.stringify(data.projects));
        if (data.files) localStorage.setItem('spolder_files', JSON.stringify(data.files));
        if (data.categories) localStorage.setItem('spolder_categories', JSON.stringify(data.categories));
        if (data.welcomeModal) localStorage.setItem('spolder_welcome_modal', JSON.stringify(data.welcomeModal));
        if (data.activityLogs) localStorage.setItem('spolder_activity_logs', JSON.stringify(data.activityLogs));

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsText(file);
  });
};

export const clearAllData = (): boolean => {
  if (!confirm('TÜM VERİLER SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?')) {
    return false;
  }

  if (!confirm('SON UYARI: Tüm etkinlikler, haberler, projeler ve diğer içerikler kalıcı olarak silinecek. Yedek aldınız mı?')) {
    return false;
  }

  localStorage.removeItem('spolder_events');
  localStorage.removeItem('spolder_news');
  localStorage.removeItem('spolder_blog');
  localStorage.removeItem('spolder_projects');
  localStorage.removeItem('spolder_files');
  localStorage.removeItem('spolder_categories');
  localStorage.removeItem('spolder_activity_logs');
  
  return true;
};
