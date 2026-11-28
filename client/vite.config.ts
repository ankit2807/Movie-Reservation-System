import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/react/')) {
            return 'react-vendor';
          }
          if (id.includes('/@reduxjs/toolkit/') || id.includes('/react-redux/')) {
            return 'redux-vendor';
          }
          if (id.includes('/lucide-react/') || id.includes('/qrcode.react/')) {
            return 'ui-vendor';
          }
          if (id.includes('/@stripe/')) {
            return 'stripe-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
