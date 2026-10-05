import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        404: resolve(import.meta.dirname, '404.html'),
        ambot: resolve(import.meta.dirname, 'work/ambot/index.html'),
        fpd: resolve(import.meta.dirname, 'work/fpd/index.html'),
        'gip-monitoring': resolve(import.meta.dirname, 'work/gip-monitoring/index.html')
      }
    }
  }
});
