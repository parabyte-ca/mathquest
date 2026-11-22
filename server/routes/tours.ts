import { Router } from 'express';
import type { Ctx } from '../context.js';
import { welcomeFor } from '../household.js';

/** Which tour belongs to which kind of person. A person can only mark their own tour. */
const TOURS = { user: ['caregiver', 'welcome'], student: ['student'] } as const;

/** First-run walkthrough progress. Completion (finished or skipped) is stored per person, so it follows them across devices. */
export function tourRoutes(ctx: Ctx): Router {
  const r = Router();

  const who = (req: import('express').Request): { kind: 'user' | 'student'; id: string } | null => {
    if (req.auth?.kind === 'user') return { kind: 'user', id: req.auth.user.id };
    if (req.auth?.kind === 'student') return { kind: 'student', id: req.auth.student.id };
    return null;
  };

  r.get('/tours', (req, res) => {
    const me = who(req);
    if (!me) return void res.status(401).json({ error: 'unauthorized' });
    const rows = ctx.db.prepare('SELECT tour FROM tour_seen WHERE subject_kind = ? AND subject_id = ?').all(me.kind, me.id) as { tour: string }[];
    // A caregiver who was invited gets the welcome first; the walkthrough then waits for them to ask for it.
    const welcomePending = me.kind === 'user' && welcomeFor(ctx.db, me.id).show;
    res.json({ done: rows.map((x) => x.tour), available: TOURS[me.kind].filter((x) => x !== 'welcome'), ...(welcomePending ? { welcomePending: true } : {}) });
  });

  r.post('/tours/:tour/complete', (req, res) => {
    const me = who(req);
    if (!me) return void res.status(401).json({ error: 'unauthorized' });
    const tour = req.params.tour as string;
    if (!(TOURS[me.kind] as readonly string[]).includes(tour)) return void res.status(404).json({ error: 'not_found' });
    ctx.db.prepare('INSERT OR IGNORE INTO tour_seen (subject_kind, subject_id, tour, seen_at) VALUES (?,?,?,?)').run(me.kind, me.id, tour, ctx.now());
    // Seeing the welcome stands in for the first-run walkthrough, which they can still start from the welcome or the Help link.
    if (tour === 'welcome') ctx.db.prepare('INSERT OR IGNORE INTO tour_seen (subject_kind, subject_id, tour, seen_at) VALUES (?,?,?,?)').run(me.kind, me.id, 'caregiver', ctx.now());
    res.json({ ok: true });
  });

  return r;
}
