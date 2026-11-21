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

/**
 * Only variables that start with MQ_PUBLIC_ can ever reach the browser, and a name that looks like a secret is refused outright.
 * (The app has no such variables today: every credential stays on the server. See docs/SECURITY.md.)
 */
const SECRET_NAME = /(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD|DSN|PRIVATE|CREDENTIAL)/i;
const guardClientEnv = (): import('vite').Plugin => ({
  name: 'guard-client-env',
  config() {
    const bad = Object.keys(process.env).filter((k) => k.startsWith('MQ_PUBLIC_') && SECRET_NAME.test(k));
    if (bad.length > 0) throw new Error(`Refusing to build: ${bad.join(', ')} would be embedded in the browser bundle. Secrets belong on the server.`);
  },
});

export default defineConfig({
  root: here,
  plugins: [guardClientEnv(), preact(), assetManifest()],
  envPrefix: 'MQ_PUBLIC_', // never the default VITE_, and never anything else from the environment
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: { outDir: resolve(here, '../dist/web'), emptyOutDir: true, sourcemap: false }, // no source maps in production, so the original source is not published
  server: { port: 5173, proxy: { '/api': 'http://localhost:8086' } },
});
