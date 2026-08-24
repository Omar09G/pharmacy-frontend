import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint2';
import path from 'path';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      lintInWorker: true,
      lintOnStart: true,
      overrideConfigFile: path.resolve(__dirname, './eslint.config.mjs'),
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        // Split stable vendor code so app deploys don't invalidate the
        // whole cache: react runtime / tanstack / heavy chart libs.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/') ||
            id.includes('/react-router')
          ) {
            return 'react-vendor';
          }
          if (id.includes('@tanstack')) return 'tanstack-vendor';
          if (
            id.includes('/recharts') ||
            id.includes('/d3-') ||
            id.includes('/victory-') ||
            id.includes('/chart.js')
          ) {
            return 'charts-vendor';
          }
          if (
            id.includes('/axios/') ||
            id.includes('/i18next') ||
            id.includes('/zustand') ||
            id.includes('/date-fns') ||
            id.includes('/lodash')
          ) {
            return 'lib-vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    // Development proxy to avoid CORS issues when calling the API
    proxy: {
      // Proxy any request starting with /api to the backend server
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8081',
        changeOrigin: true,
        // A-4 fix: SSL verification is ON by default.
        // Set VITE_PROXY_INSECURE=true only when using self-signed certs in local dev.
        secure: process.env.VITE_PROXY_INSECURE !== 'true',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/i18n.ts'],
    },
  },
});
