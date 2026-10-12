import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Fontes sempre como arquivo, nunca como data URI: a CSP de produção (`font-src 'self'`) só aceita a própria origem.
    assetsInlineLimit: (arquivo) => (arquivo.endsWith('.woff2') ? false : undefined),
  },
  server: {
    host: true,
    port: 4200,

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5178',
        changeOrigin: false,
      },
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/app/test/setup.ts',
    include: ['src/app/**/*.spec.{ts,tsx}'],
    css: true,
  },
});
