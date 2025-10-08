/**
 * Toast Notification System
 * 
 * Centralized toast notification utility for consistent messaging
 * across the entire application. Ensures uniform styling and behavior.
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
    this.container.className = 'fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none';
    document.body.appendChild(this.container);
  }

  private getToastStyles(type: ToastOptions['type']) {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 shadow-lg';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-lg';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-lg';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-lg';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 shadow-lg';
    }
  }

  private getIcon(type: ToastOptions['type']) {
    switch (type) {
      case 'success':
        return '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
      case 'error':
        return '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>';
      case 'warning':
        return '<svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
      case 'info':
        return '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
      default:
        return '<svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>';
    }
  }

  show(message: string, options: ToastOptions = { type: 'info' }) {
    if (!this.container) return;

    const toastId = Date.now().toString();
    const toast = document.createElement('div');
    
    const styles = this.getToastStyles(options.type);
    const icon = this.getIcon(options.type);
    
    toast.className = `${styles} border rounded-lg p-4 transform transition-all duration-300 translate-x-full opacity-0 max-w-sm pointer-events-auto font-medium`;
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">${icon}</div>
        <span class="text-sm flex-1 leading-relaxed">${message}</span>
        <button class="text-current opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black hover:bg-opacity-10" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
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