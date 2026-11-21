import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const version = readFileSync(resolve(here, '../VERSION'), 'utf8').trim();

/** Lists every built script and stylesheet so the service worker can keep them for offline use. */
const assetManifest = (): import('vite').Plugin => ({
  name: 'asset-manifest',
  generateBundle(_o, bundle) {
    const files = Object.keys(bundle).filter((f) => /\.(js|css)$/.test(f)).map((f) => `/${f}`).sort();
    this.emitFile({ type: 'asset', fileName: 'asset-manifest.json', source: JSON.stringify({ version, files }) });
  },
});

export default defineConfig({
  root: here,
  plugins: [preact(), assetManifest()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: { outDir: resolve(here, '../dist/web'), emptyOutDir: true },
  server: { port: 5173, proxy: { '/api': 'http://localhost:8086' } },
});
