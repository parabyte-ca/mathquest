// Renders web/public/favicon.svg into the PNG icons the install prompt needs. Run once after changing the icon:
//   node scripts/make-icons.mjs        (uses the Chromium that Playwright already provides)
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'web', 'public');
const svg = readFileSync(join(root, 'favicon.svg'), 'utf8');
// A "maskable" icon is cropped to a circle or squircle by the phone, so it needs full-bleed colour and content inside the middle 80%.
const maskable = svg.replace('<rect width="64" height="64" rx="14" fill="#1f5fd6"/>', '<rect width="64" height="64" fill="#1f5fd6"/>')
  .replace(/<path d="M32 14v36M14 32h36"[^>]*\/>/, '<path d="M32 19v26M19 32h26" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>')
  .replace(/<path d="M47 8l[^>]*\/>/, '<path d="M43 14l1.9 3.9 4.3.6-3.1 3 .7 4.2L43 23.6 39.2 25.7l.7-4.2-3.1-3 4.3-.6z" fill="#ffb703"/>');

const browser = await chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.PW_CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const [name, size, source] of [['icon-192.png', 192, svg], ['icon-512.png', 512, svg], ['icon-maskable-512.png', 512, maskable], ['apple-touch-icon.png', 180, maskable]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`);
  writeFileSync(join(root, 'icons', name), await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }));
}
await browser.close();
console.log('icons written to web/public/icons');
