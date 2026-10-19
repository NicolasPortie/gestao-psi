import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Fontes sempre como arquivo, nunca como data URI: a CSP de produção (`font-src 'self'`) só aceita a própria origem.
    assetsInlineLimit: (arquivo) => (arquivo.endsWith('.woff2') ? false : undefined),
    // Bibliotecas que mudam pouco em pacotes próprios: o código do app atualiza sem invalidar o cache delas.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 30 },
            { name: 'dados', test: /node_modules[\\/](@tanstack|zod|react-hook-form|@hookform)[\\/]/, priority: 20 },
            { name: 'interface', test: /node_modules[\\/](@base-ui|@floating-ui|sonner|lucide-react|class-variance-authority|clsx)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    host: true,
    port: 4200,

    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://127.0.0.1:5178',
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
