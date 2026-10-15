import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        diensten: resolve(__dirname, 'src/pages/diensten.html'),
        overOns: resolve(__dirname, 'src/pages/over-ons.html'),
        reviews: resolve(__dirname, 'src/pages/reviews.html'),
        contact: resolve(__dirname, 'src/pages/contact.html'),
        privacy: resolve(__dirname, 'src/pages/privacy.html'),
        algemeneVoorwaarden: resolve(__dirname, 'src/pages/algemene-voorwaarden.html'),
      },
    },
  },
});

