// MathQuest service worker. It makes the app installable and keeps the app shell and its scripts available when the
// connection drops. It never stores API responses: nothing about a person is ever kept by the worker.
// Registered as /sw.js?v=<version>; each version has its own cache and removes the old ones.
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE = `mq-${VERSION}`;
const SHELL = ['/app', '/offline.html', '/offline.css', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Every script and stylesheet of this build, so the pages already work offline the first time the app is opened.
    try {
      const res = await fetch('/asset-manifest.json', { cache: 'no-cache' });
      if (res.ok) {
        const { files } = await res.json();
        await Promise.all(files.filter((f) => /^\/assets\/[\w.-]+\.(js|css)$/.test(f)).map((f) => cache.add(f).catch(() => undefined)));
      }
    } catch { /* the shell alone is enough to start */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('mq-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function networkFirstPage(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE);
    const path = new URL(request.url).pathname;
    // The app's own pages all share one shell; anything else gets the plain offline page.
    return (path === '/app' || path.startsWith('/app/') ? await cache.match('/app') : null) || (await cache.match('/offline.html')) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.type !== 'opaque') cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // never intercepted or stored
  if (request.mode === 'navigate') return void event.respondWith(networkFirstPage(request));
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/favicon.svg') return void event.respondWith(cacheFirst(request));
});
