import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192x192.png', 'icons/icon-512x512.png'],
      manifest: {
        name: 'MedPrescription',
        short_name: 'MedRx',
        description: 'Your prescriptions, always with you',
        theme_color: '#0891b2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' },
          },
          {
            urlPattern: /\/uploads\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'images-cache' },
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ['.ngrok-free.dev', 'localhost'],
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
});
