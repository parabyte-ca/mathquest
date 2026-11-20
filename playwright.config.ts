import { defineConfig } from '@playwright/test';

const E2E_PORT = 18086;
const MOCK_PORT = 18788;
// Set PW_CHROMIUM_PATH to use a pre-installed Chromium (e.g. /opt/pw-browsers/chromium); CI uses 'playwright install'.
const chromium = { launchOptions: { args: ['--no-sandbox'], executablePath: process.env.PW_CHROMIUM_PATH || undefined } };

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  retries: 0,
  reporter: 'list',
  use: { baseURL: `http://localhost:${E2E_PORT}`, trace: 'off', ...chromium },
  webServer: [
    { command: 'npx tsx e2e/mock-services.ts', port: MOCK_PORT, reuseExistingServer: false, env: { MOCK_PORT: String(MOCK_PORT) } },
    { command: 'npx tsx e2e/start-app.ts', url: `http://localhost:${E2E_PORT}/api/health`, reuseExistingServer: false, env: { E2E_PORT: String(E2E_PORT), MOCK_PORT: String(MOCK_PORT) } },
  ],
  projects: [
    { name: 'phone', use: { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, extraHTTPHeaders: { 'x-forwarded-for': '10.1.0.1' } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, hasTouch: true, extraHTTPHeaders: { 'x-forwarded-for': '10.1.0.2' } } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 }, extraHTTPHeaders: { 'x-forwarded-for': '10.1.0.3' } } },
  ],
});
