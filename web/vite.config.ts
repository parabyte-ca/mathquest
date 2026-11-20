import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root: here,
  plugins: [preact()],
  build: { outDir: resolve(here, '../dist/web'), emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://localhost:8086' } },
});
