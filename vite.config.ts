import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration
 * 
 * Optimized build configuration for performance, SEO, and development experience.
 * Includes bundle optimization, preloading, and build optimizations.
 */
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  // Development server optimizations
  server: {
    hmr: {
      overlay: false,
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
});
