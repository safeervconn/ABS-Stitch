/**
 * Toast Notification System
 * 
 * Simple toast notification utility for showing success/error messages
 * across the application for CRUD operations.
 */

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class ToastManager {
  private container: HTMLElement | null = null;
  private toasts: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof window === 'undefined') return;
    
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-4 right-4 z-[9999] space-y-2';
    document.body.appendChild(this.container);
  }

  private getToastStyles(type: ToastOptions['type']) {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  private getIcon(type: ToastOptions['type']) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }

  show(message: string, options: ToastOptions = { type: 'info' }) {
    if (!this.container) return;

    const toastId = Date.now().toString();
    const toast = document.createElement('div');
    
    const styles = this.getToastStyles(options.type);
    const icon = this.getIcon(options.type);
    
    toast.className = `${styles} border rounded-lg p-4 shadow-lg transform transition-all duration-300 translate-x-full opacity-0 max-w-sm`;
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-lg font-semibold">${icon}</span>
        <span class="text-sm font-medium flex-1">${message}</span>
        <button class="text-current opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;

    this.container.appendChild(toast);
    this.toasts.set(toastId, toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Auto remove
    const duration = options.duration || 4000;
    setTimeout(() => {
      this.remove(toastId);
    }, duration);

    return toastId;
  }

  remove(toastId: string) {
    const toast = this.toasts.get(toastId);
    if (toast) {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.toasts.delete(toastId);
      }, 300);
    }
  }

  success(message: string, duration?: number) {
    return this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    return this.show(message, { type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    return this.show(message, { type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    return this.show(message, { type: 'info', duration });
  }
}

// Export singleton instance
export const toast = new ToastManager();