// Basit toast bildirim sistemi
export const toast = {
  success: (message: string) => {
    showToast(message, 'success');
  },
  error: (message: string) => {
    showToast(message, 'error');
  },
  info: (message: string) => {
    showToast(message, 'info');
  },
  warning: (message: string) => {
    showToast(message, 'warning');
  }
};

function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
  // Mevcut toast'ları kontrol et
  const existingContainer = document.getElementById('toast-container');
  let container = existingContainer;

  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    min-width: 300px;
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const colors = {
    success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  toast.style.background = colors[type];
  toast.innerHTML = `
    <span style="font-size: 18px; font-weight: bold;">${icons[type]}</span>
    <span style="flex: 1;">${message}</span>
  `;

  // Animasyon ekle
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  if (!document.getElementById('toast-styles')) {
    style.id = 'toast-styles';
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      container?.removeChild(toast);
      if (container?.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  }, 3000);
}
