import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, '404.html'),
        ambot: resolve(__dirname, 'work/ambot/index.html'),
        fpd: resolve(__dirname, 'work/fpd/index.html'),
        'gip-monitoring': resolve(__dirname, 'work/gip-monitoring/index.html')
      }
    }
  }
});
