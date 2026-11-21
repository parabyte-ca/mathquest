import type { Ctx } from '../context.js';
import { generate, hasGenerator } from '../../shared/generators/index.js';
import { allMicros } from './pipeline.js';

/** How many seeds are tried when counting how many different questions a generator gives at one tier. */
export const VARIETY_SEEDS = 40;
/** A tier with fewer different questions than this out of VARIETY_SEEDS is flagged as thin. */
export const THIN_BELOW = 12;

const varietyCache = new Map<string, [number, number, number]>();

/** Different questions (by prompt and options) among the first VARIETY_SEEDS seeds, for tiers 1 to 3. Content is fixed per release, so this is cached. */
export function variety(skill: string): [number, number, number] {
  const hit = varietyCache.get(skill);
  if (hit) return hit;
  const out: [number, number, number] = [0, 0, 0];
  for (let tier = 1; tier <= 3; tier++) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= VARIETY_SEEDS; seed++) {
      try {
        const it = generate(skill, tier, seed);
        seen.add(JSON.stringify([it.prompt.en, it.options]));
      } catch { /* a seed that cannot be generated counts as nothing */ }
    }
    out[tier - 1] = seen.size;
  }
  varietyCache.set(skill, out);
  return out;
}

export interface BankRow {
  id: string;
  name: string;
  expectation: string;
  generator: boolean;
  variety: [number, number, number];
  thin: boolean;
  approved: number;
  drafts: number;
  retired: number;
  served: number;
  openReports: number;
}

/** One row per micro-skill: how many different questions its generator gives, and what the Claude bank holds for it. */
export function bankSummary(ctx: Ctx): BankRow[] {
  const bank = new Map<string, { approved: number; drafts: number; retired: number; served: number }>();
  for (const r of ctx.db.prepare("SELECT skill, SUM(status = 'approved') AS approved, SUM(status = 'draft') AS drafts, SUM(status = 'retired') AS retired, SUM(served) AS served FROM bank_item GROUP BY skill").all() as { skill: string; approved: number; drafts: number; retired: number; served: number }[]) bank.set(r.skill, r);
  const reports = new Map<string, number>();
  for (const r of ctx.db.prepare('SELECT b.skill AS skill, COUNT(*) AS n FROM item_report i JOIN bank_item b ON b.id = i.bank_id WHERE i.resolved = 0 GROUP BY b.skill').all() as { skill: string; n: number }[]) reports.set(r.skill, r.n);
  return allMicros().map((m) => {
    const generator = hasGenerator(m.id);
    const v = generator ? variety(m.id) : ([0, 0, 0] as [number, number, number]);
    const b = bank.get(m.id);
    return {
      id: m.id, name: m.name, expectation: m.expectation, generator, variety: v,
      thin: generator && v.some((n) => n < THIN_BELOW),
      approved: b?.approved ?? 0, drafts: b?.drafts ?? 0, retired: b?.retired ?? 0, served: b?.served ?? 0, openReports: reports.get(m.id) ?? 0,
    };
  });
}
