// Toast Notification System
class Toast {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 250ms cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        this.container.removeChild(toast);
      }, 250);
    }, duration);
  }

  success(message) {
    this.show(message, 'success');
  }

  error(message) {
    this.show(message, 'error');
  }

  info(message) {
    this.show(message, 'info');
  }
}

// Theme Manager
class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || 'light';
    this.applyTheme(this.theme);
  }

  getStoredTheme() {
    try {
      // Use in-memory state instead of localStorage
      return window.currentTheme || null;
    } catch (e) {
      return null;
    }
  }

  storeTheme(theme) {
    try {
      // Store in memory instead of localStorage
      window.currentTheme = theme;
    } catch (e) {
      // Silently fail if storage is unavailable
    }
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
    this.storeTheme(this.theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  getCurrentTheme() {
    return this.theme;
  }
}

// Content Generators for Different QR Types
class ContentGenerator {
  static url(data) {
    return data.url;
  }

  static text(data) {
    return data.text;
  }

  static email(data) {
    let content = `mailto:${data.email}`;
    const params = [];
    if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
    if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
    if (params.length > 0) content += `?${params.join('&')}`;
    return content;
  }

  static phone(data) {
    return `tel:${data.phone}`;
  }

  static sms(data) {
    let content = `sms:${data.phone}`;
    if (data.message) content += `?body=${encodeURIComponent(data.message)}`;
    return content;
  }

  static wifi(data) {
    const escape = (str) => str.replace(/[\\;,:"]/g, '\\$&');
    let content = 'WIFI:';
    content += `S:${escape(data.ssid)};`;
    content += `T:${data.security || 'nopass'};`;
    if (data.password) content += `P:${escape(data.password)};`;
    if (data.hidden) content += 'H:true;';
    content += ';';
    return content;
  }
}

// Validators
class Validator {
  static url(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static phone(phone) {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return re.test(phone);
  }

  static notEmpty(value) {
    return value && value.trim().length > 0;
  }
}

// Download Utility
class Downloader {
  static downloadCanvas(canvas, filename = 'qrcode.png') {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  static async canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve);
    });
  }
}

// Share Utility
class Sharing {
  static async shareImage(canvas, title = 'QR Code') {
    if (!navigator.share) {
      return false;
    }

    try {
      const blob = await Downloader.canvasToBlob(canvas);
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: title,
        text: 'Check out this QR code!',
        files: [file]
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Clipboard Utility
class Clipboard {
  static async copyCanvas(canvas) {
    try {
      const blob = await Downloader.canvasToBlob(canvas);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// History Manager
class HistoryManager {
  constructor() {
    this.history = this.loadHistory();
    this.maxItems = 50;
  }

  loadHistory() {
    try {
      // Use in-memory array instead of localStorage
      return window.qrHistory || [];
    } catch (e) {
      return [];
    }
  }

  saveHistory() {
    try {
      // Store in memory instead of localStorage
      window.qrHistory = this.history;
    } catch (e) {
      // Silently fail if storage is unavailable
    }
  }

  add(item) {
    const entry = {
      ...item,
      timestamp: Date.now(),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    
    this.history.unshift(entry);
    
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems);
    }
    
    this.saveHistory();
    return entry;
  }

  getAll() {
    return this.history;
  }

  clear() {
    this.history = [];
    this.saveHistory();
  }

  remove(id) {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }
}

// Export utilities
if (typeof window !== 'undefined') {
  window.Toast = Toast;
  window.ThemeManager = ThemeManager;
  window.ContentGenerator = ContentGenerator;
  window.Validator = Validator;
  window.Downloader = Downloader;
  window.Sharing = Sharing;
  window.Clipboard = Clipboard;
  window.HistoryManager = HistoryManager;
}