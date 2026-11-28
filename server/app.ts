import express, { type Express } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join, sep } from 'node:path';
import type { Config } from './config.js';
import { makeLimits, type Ctx } from './context.js';
import type { DB } from './db.js';
import type { Mailer } from './mail.js';
import { originMiddleware, sessionMiddleware } from './session.js';
import { authRoutes } from './routes/auth.js';
import { deviceRoutes } from './routes/devices.js';
import { studentRoutes } from './routes/students.js';
import { householdRoutes } from './routes/household.js';
import { rewardRoutes } from './routes/rewards.js';
import { tourRoutes } from './routes/tours.js';
import { aiRoutes } from './routes/ai.js';
import { adminRoutes } from './routes/admin.js';
import { updateRoutes } from './routes/updates.js';
import { curriculumRoutes } from './routes/curriculum.js';
import { learnRoutes } from './routes/learn.js';

export interface AppDeps {
  rand?: () => number;
  db: DB;
  cfg: Config;
  mailer: Mailer;
  now?: () => number;
  webRoot?: string;
}

export function createApp(deps: AppDeps): { app: Express; ctx: Ctx } {
  const now = deps.now ?? Date.now;
  const ctx: Ctx = { db: deps.db, cfg: deps.cfg, mailer: deps.mailer, now, rand: deps.rand, limits: makeLimits(now) };
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal'); // Cloudflare Tunnel / reverse proxy on the host

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          mediaSrc: ["'self'"],
          workerSrc: ["'self'"],
          manifestSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: deps.cfg.secure,
    }),
  );
  // A photo of a worksheet is the one request that is bigger than a page of JSON; everything else stays small.
  const small = express.json({ limit: '100kb' });
  const photo = express.json({ limit: '6mb' });
  app.use((req, res, next) => (/^\/api\/students\/[^/]+\/worksheet\/photo$/.test(req.path) ? photo : small)(req, res, next));

  app.get('/api/health', (_req, res) => {
    try {
      deps.db.prepare('SELECT 1').get();
      res.json({ ok: true, version: deps.cfg.version });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  const api = express.Router();
  // Responses carry session and CSRF material and personal data: no browser, proxy or CDN should ever keep a copy.
  api.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  api.use(originMiddleware(ctx));
  api.use(sessionMiddleware(ctx));
  api.use(authRoutes(ctx));
  api.use(deviceRoutes(ctx));
  api.use(studentRoutes(ctx));
  api.use(householdRoutes(ctx));
  api.use(rewardRoutes(ctx));
  api.use(tourRoutes(ctx));
  api.use(adminRoutes(ctx));
  api.use(aiRoutes(ctx));
  api.use(updateRoutes(ctx));
  api.use(curriculumRoutes(ctx));
  api.use(learnRoutes(ctx));
  api.use((_req, res) => void res.status(404).json({ error: 'not_found' }));
  app.use('/api', api);

  // Built SPA. Client routes live under /app/* so they can never collide with /api/*.
  const webRoot = deps.webRoot ?? join(process.cwd(), 'dist', 'web');
  if (existsSync(webRoot)) {
    // Built assets have hashed names and can be kept; the service worker and the files that name the current build must always be re-checked.
    const REVALIDATE = new Set(['/sw.js', '/asset-manifest.json', '/manifest.webmanifest', '/offline.html', '/offline.css', '/favicon.svg']);
    app.use(express.static(webRoot, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, file) => {
        const name = `/${file.slice(webRoot.length + 1).split(sep).join('/')}`;
        if (REVALIDATE.has(name)) res.setHeader('Cache-Control', 'no-cache');
        if (name === '/sw.js') res.setHeader('Service-Worker-Allowed', '/');
      },
    }));
    app.get(/^\/(app(\/.*)?)?$/, (_req, res) => res.sendFile(join(webRoot, 'index.html')));
  }

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(`[error] ${err.message}`);
    res.status(err.name === 'SyntaxError' ? 400 : 500).json({ error: 'server_error' });
  });
  return { app, ctx };
}
