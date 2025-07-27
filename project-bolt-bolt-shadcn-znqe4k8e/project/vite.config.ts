import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'images': path.resolve(__dirname, './src/images'),
    },
  },
  appType: 'spa',
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.method, req.url);
          });
        }
      }
    }
  }
});