export interface ThemeConfig {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  gradients: {
    primary: string;
    hero: string;
    card: string;
  };
  spacing: {
    containerMaxWidth: string;
    sectionPadding: string;
  };
}

export const themeConfig: ThemeConfig = {
  colors: {
    primary: import.meta.env.VITE_THEME_PRIMARY || '#3b82f6',
    primaryHover: import.meta.env.VITE_THEME_PRIMARY_HOVER || '#2563eb',
    secondary: import.meta.env.VITE_THEME_SECONDARY || '#10b981',
    accent: import.meta.env.VITE_THEME_ACCENT || '#f59e0b',
    background: import.meta.env.VITE_THEME_BACKGROUND || '#ffffff',
    surface: import.meta.env.VITE_THEME_SURFACE || '#f9fafb',
    text: {
      primary: import.meta.env.VITE_THEME_TEXT_PRIMARY || '#111827',
      secondary: import.meta.env.VITE_THEME_TEXT_SECONDARY || '#6b7280',
      light: import.meta.env.VITE_THEME_TEXT_LIGHT || '#9ca3af',
    },
    status: {
      success: import.meta.env.VITE_THEME_STATUS_SUCCESS || '#10b981',
      warning: import.meta.env.VITE_THEME_STATUS_WARNING || '#f59e0b',
      error: import.meta.env.VITE_THEME_STATUS_ERROR || '#ef4444',
      info: import.meta.env.VITE_THEME_STATUS_INFO || '#3b82f6',
    },
  },
  gradients: {
    primary: import.meta.env.VITE_THEME_GRADIENT_PRIMARY || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hero: import.meta.env.VITE_THEME_GRADIENT_HERO || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: import.meta.env.VITE_THEME_GRADIENT_CARD || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  spacing: {
    containerMaxWidth: import.meta.env.VITE_THEME_CONTAINER_MAX_WIDTH || '1280px',
    sectionPadding: import.meta.env.VITE_THEME_SECTION_PADDING || '4rem',
  },
};

export const applyTheme = () => {
  const root = document.documentElement;

  root.style.setProperty('--color-primary', themeConfig.colors.primary);
  root.style.setProperty('--color-primary-hover', themeConfig.colors.primaryHover);
  root.style.setProperty('--color-secondary', themeConfig.colors.secondary);
  root.style.setProperty('--color-accent', themeConfig.colors.accent);
  root.style.setProperty('--color-background', themeConfig.colors.background);
  root.style.setProperty('--color-surface', themeConfig.colors.surface);
  root.style.setProperty('--color-text-primary', themeConfig.colors.text.primary);
  root.style.setProperty('--color-text-secondary', themeConfig.colors.text.secondary);
  root.style.setProperty('--color-text-light', themeConfig.colors.text.light);
  root.style.setProperty('--color-status-success', themeConfig.colors.status.success);
  root.style.setProperty('--color-status-warning', themeConfig.colors.status.warning);
  root.style.setProperty('--color-status-error', themeConfig.colors.status.error);
  root.style.setProperty('--color-status-info', themeConfig.colors.status.info);
  root.style.setProperty('--gradient-primary', themeConfig.gradients.primary);
  root.style.setProperty('--gradient-hero', themeConfig.gradients.hero);
  root.style.setProperty('--gradient-card', themeConfig.gradients.card);
};
