import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { openDb } from '../server/db.js';
import { loadConfig } from '../server/config.js';
import { MemoryMailer } from '../server/mail.js';

const pub = (f: string): string => join('web', 'public', f);
const ORIGIN = 'http://localhost:8086';

describe('web app manifest and icons', () => {
  const manifest = JSON.parse(readFileSync(pub('manifest.webmanifest'), 'utf8')) as {
    name: string; short_name: string; start_url: string; scope: string; display: string; theme_color: string; background_color: string;
    icons: { src: string; sizes: string; type: string; purpose: string }[];
  };

  it('describes an installable app that stays inside /app', () => {
    expect(manifest.name).toBe('MathQuest');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url.startsWith(manifest.scope)).toBe(true);
    expect(manifest.scope).toBe('/app');
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('lists real PNG icons of the sizes it claims, including a maskable one', () => {
    for (const icon of manifest.icons) {
      const png = readFileSync(join('web', 'public', icon.src));
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
      expect(`${w}x${h}`, icon.src).toBe(icon.sizes);
    }
    const sizes = manifest.icons.filter((i) => i.purpose === 'any').map((i) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some((i) => i.purpose === 'maskable' && i.sizes === '512x512')).toBe(true);
  });

  it('has an icon for the browser tab and for Apple devices, and an offline page in both languages', () => {
    expect(readFileSync(pub('favicon.svg'), 'utf8')).toContain('<svg');
    expect(readFileSync(join('web', 'public', 'icons', 'apple-touch-icon.png')).readUInt32BE(16)).toBe(180);
    const off = readFileSync(pub('offline.html'), 'utf8');
    expect(off).toContain('You are offline');
    expect(off).toContain('Vous êtes hors ligne');
    // the app's Content Security Policy blocks inline scripts, handlers and styles, so the page may use none of them
    expect(off).not.toMatch(/<script/i);
    expect(off).not.toMatch(/<style/i);
    expect(off).not.toMatch(/\son[a-z]+=/i);
    expect(off).not.toMatch(/style=/i);
    expect(off).toContain('href="/offline.css"');
    expect(readFileSync(pub('offline.css'), 'utf8')).toContain('body');
    const idx = readFileSync(join('web', 'index.html'), 'utf8');
    expect(idx).toContain('rel="manifest"');
    expect(idx).toContain('apple-touch-icon');
  });
});

/** Runs the real sw.js in a sandbox with an in-memory cache and a scripted network. */
function loadWorker(version = '2.4.0') {
  const listeners: Record<string, ((e: unknown) => void)[]> = {};
  const stores = new Map<string, Map<string, Response>>();
  const network = new Map<string, () => Response>();
  let online = true;
  const fetched: string[] = [];
  const abs = (r: string | Request): string => (typeof r === 'string' ? new URL(r, ORIGIN).href : r.url);

  const fetchFn = async (r: string | Request): Promise<Response> => {
    const url = abs(r);
    fetched.push(url);
    if (!online) throw new TypeError('network down');
    const make = network.get(new URL(url).pathname);
    return make ? make() : new Response('not found', { status: 404 });
  };
  const cacheFor = (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name)!;
    return {
      add: async (r: string) => { const res = await fetchFn(r); if (!res.ok) throw new Error(`bad ${r}`); m.set(abs(r), res); },
      addAll: async (rs: string[]) => { for (const r of rs) { const res = await fetchFn(r); if (!res.ok) throw new Error(`bad ${r}`); m.set(abs(r), res); } },
      put: async (r: string | Request, res: Response) => { m.set(abs(r), res); },
      match: async (r: string | Request) => m.get(abs(r))?.clone(),
    };
  };
  const self = {
    location: { href: `${ORIGIN}/sw.js?v=${version}`, origin: ORIGIN },
    addEventListener: (type: string, fn: (e: unknown) => void) => { (listeners[type] ??= []).push(fn); },
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
  };
  const ctx = vm.createContext({
    self, URL, Response, Request, fetch: fetchFn, console,
    caches: { open: async (n: string) => cacheFor(n), keys: async () => [...stores.keys()], delete: async (n: string) => stores.delete(n) },
  });
  vm.runInContext(readFileSync(pub('sw.js'), 'utf8'), ctx);

  const waitUntil = async (type: string): Promise<void> => {
    const waits: Promise<unknown>[] = [];
    for (const l of listeners[type] ?? []) l({ waitUntil: (p: Promise<unknown>) => waits.push(p) });
    await Promise.all(waits);
  };
  const doFetch = async (url: string, init: { method?: string; mode?: string } = {}): Promise<Response | 'passed'> => {
    let result: Promise<Response> | null = null;
    const req = Object.assign(new Request(new URL(url, ORIGIN), { method: init.method ?? 'GET' }), {});
    Object.defineProperty(req, 'mode', { value: init.mode ?? 'no-cors' });
    for (const l of listeners.fetch ?? []) l({ request: req, respondWith: (p: Promise<Response>) => { result = p; } });
    return result ? await result : 'passed';
  };
  return {
    stores, network, fetched,
    setOnline: (v: boolean) => { online = v; },
    install: () => waitUntil('install'),
    activate: () => waitUntil('activate'),
    fetch: doFetch,
  };
}

describe('service worker', () => {
  let sw: ReturnType<typeof loadWorker>;
  beforeEach(() => {
    sw = loadWorker();
    sw.network.set('/app', () => new Response('<html>shell</html>'));
    sw.network.set('/offline.html', () => new Response('offline page'));
    sw.network.set('/offline.css', () => new Response('css'));
    sw.network.set('/manifest.webmanifest', () => new Response('{}'));
    sw.network.set('/favicon.svg', () => new Response('<svg/>'));
    sw.network.set('/icons/icon-192.png', () => new Response('png'));
    sw.network.set('/asset-manifest.json', () => new Response(JSON.stringify({ version: '2.4.0', files: ['/assets/index-abc.js', '/assets/Practice-def.js', '/assets/style-1.css', '/evil.js', '/assets/../secret.js'] })));
    sw.network.set('/assets/index-abc.js', () => new Response('js1'));
    sw.network.set('/assets/Practice-def.js', () => new Response('js2'));
    sw.network.set('/assets/style-1.css', () => new Response('css'));
    sw.network.set('/assets/later-9.js', () => new Response('later'));
    sw.network.set('/api/me', () => new Response('{"secret":true}'));
  });

  it('keeps the shell and every built script and stylesheet when it installs, and only those', async () => {
    await sw.install();
    const cached = [...sw.stores.get('mq-2.4.0')!.keys()].map((u) => new URL(u).pathname).sort();
    expect(cached).toEqual(['/app', '/assets/Practice-def.js', '/assets/index-abc.js', '/assets/style-1.css', '/favicon.svg', '/icons/icon-192.png', '/manifest.webmanifest', '/offline.css', '/offline.html'].sort());
    expect(cached).not.toContain('/evil.js'); // the list is untrusted: only plain /assets/ files are accepted
  });

  it('removes the caches of older versions when it activates, and keeps its own', async () => {
    sw.stores.set('mq-2.3.0', new Map());
    sw.stores.set('mq-2.2.0', new Map());
    sw.stores.set('somebody-elses', new Map());
    await sw.install();
    await sw.activate();
    expect([...sw.stores.keys()].sort()).toEqual(['mq-2.4.0', 'somebody-elses']);
  });

  it('never touches the API and ignores anything that is not a GET', async () => {
    await sw.install();
    expect(await sw.fetch('/api/me')).toBe('passed');
    expect(await sw.fetch('/api/learn/answer', { method: 'POST' })).toBe('passed');
    expect(await sw.fetch('/app/x', { method: 'POST', mode: 'navigate' })).toBe('passed');
    expect(await sw.fetch('https://elsewhere.example/app.js')).toBe('passed');
    for (const store of sw.stores.values()) for (const k of store.keys()) expect(k).not.toContain('/api/');
  });

  it('serves built assets from the cache without asking the network again', async () => {
    await sw.install();
    sw.fetched.length = 0;
    const res = (await sw.fetch('/assets/index-abc.js')) as Response;
    expect(await res.text()).toBe('js1');
    expect(sw.fetched).toEqual([]);
    // an asset it has not seen is fetched once, then kept
    const later = (await sw.fetch('/assets/later-9.js')) as Response;
    expect(await later.text()).toBe('later');
    sw.setOnline(false);
    expect(await ((await sw.fetch('/assets/later-9.js')) as Response).text()).toBe('later');
  });

  it('prefers the network for pages, and falls back to the app shell offline for app pages only', async () => {
    await sw.install();
    sw.network.set('/app/learn', () => new Response('fresh page'));
    expect(await ((await sw.fetch('/app/learn', { mode: 'navigate' })) as Response).text()).toBe('fresh page'); // online: the network wins
    sw.setOnline(false);
    expect(await ((await sw.fetch('/app/learn/rewards', { mode: 'navigate' })) as Response).text()).toBe('<html>shell</html>');
    expect(await ((await sw.fetch('/app', { mode: 'navigate' })) as Response).text()).toBe('<html>shell</html>');
    expect(await ((await sw.fetch('/', { mode: 'navigate' })) as Response).text()).toBe('offline page');
    expect(await ((await sw.fetch('/apple', { mode: 'navigate' })) as Response).text()).toBe('offline page'); // /apple is not /app/
  });

  it('keeps going when the list of built files cannot be read', async () => {
    sw.network.delete('/asset-manifest.json');
    await sw.install();
    expect([...sw.stores.get('mq-2.4.0')!.keys()].map((u) => new URL(u).pathname)).toContain('/app');
  });

  it('uses the version it was registered with for its cache name', async () => {
    const other = loadWorker('9.9.9');
    other.network.set('/app', () => new Response('x'));
    other.network.set('/offline.html', () => new Response('x'));
    other.network.set('/offline.css', () => new Response('x'));
    other.network.set('/manifest.webmanifest', () => new Response('x'));
    other.network.set('/favicon.svg', () => new Response('x'));
    other.network.set('/icons/icon-192.png', () => new Response('x'));
    await other.install();
    expect([...other.stores.keys()]).toEqual(['mq-9.9.9']);
  });
});

describe('serving the app and the worker', () => {
  function appWithBuild() {
    const root = mkdtempSync(join(tmpdir(), 'mq-web-'));
    mkdirSync(join(root, 'assets'));
    writeFileSync(join(root, 'index.html'), '<!doctype html><title>shell</title>');
    writeFileSync(join(root, 'sw.js'), '// worker');
    writeFileSync(join(root, 'asset-manifest.json'), '{}');
    writeFileSync(join(root, 'manifest.webmanifest'), readFileSync(pub('manifest.webmanifest')));
    writeFileSync(join(root, 'assets', 'index-abc.js'), '// app');
    const cfg = loadConfig({ BASE_URL: ORIGIN, DB_PATH: ':memory:' });
    return createApp({ db: openDb(':memory:'), cfg, mailer: new MemoryMailer(), webRoot: root }).app;
  }

  it('makes the browser re-check the worker and the files that name the current build, but cache hashed assets', async () => {
    const app = appWithBuild();
    const sw = await request(app).get('/sw.js').expect(200);
    expect(sw.headers['cache-control']).toBe('no-cache');
    expect(sw.headers['service-worker-allowed']).toBe('/');
    expect(sw.headers['content-type']).toMatch(/javascript/);
    expect((await request(app).get('/asset-manifest.json').expect(200)).headers['cache-control']).toBe('no-cache');
    const man = await request(app).get('/manifest.webmanifest').expect(200);
    expect(man.headers['cache-control']).toBe('no-cache');
    expect(man.headers['content-type']).toMatch(/manifest\+json|application\/json/);
    expect((await request(app).get('/assets/index-abc.js').expect(200)).headers['cache-control']).toContain('max-age=3600');
  });

  it('serves the shell for app pages, keeps the API out of it, and allows workers in the CSP', async () => {
    const app = appWithBuild();
    expect((await request(app).get('/app/learn/rewards').expect(200)).text).toContain('shell');
    expect((await request(app).get('/api/nope').expect(404)).body).toEqual({ error: 'not_found' });
    const csp = (await request(app).get('/app')).headers['content-security-policy'] ?? '';
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("manifest-src 'self'");
    expect(csp).toContain("script-src 'self'");
  });
});
