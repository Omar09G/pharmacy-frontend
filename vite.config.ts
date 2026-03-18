import { defineConfig } from 'vite';
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
  server: {
    // Development proxy to avoid CORS issues when calling the API
    proxy: {
      // Proxy any request starting with /api to the backend server
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // keep the /api prefix so front and backend paths align; remove "rewrite" if backend expects it
      },
    },
  },
});
