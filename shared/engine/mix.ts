import { pick, shuffle, type Rng } from '../rng.js';

export type Category = 'KU' | 'AP' | 'TH';
export interface SessionSlot {
  kind: 'target' | 'review' | 'stretch';
  skill: string;
  category: Category;
}

// Realistic achievement-chart mix (EQAO-style): knowledge 40%, application 30%, thinking 30%.
const CATEGORY_WEIGHTS: [Category, number][] = [['KU', 0.4], ['AP', 0.3], ['TH', 0.3]];

/** Spreads n items over categories using largest-remainder so small sessions still hit the mix. */
export function categoryPlan(n: number, rng: Rng): Category[] {
  const exact = CATEGORY_WEIGHTS.map(([c, w]) => ({ c, v: n * w }));
  const counts = new Map(exact.map((e) => [e.c, Math.floor(e.v)]));
  let left = n - [...counts.values()].reduce((a, b) => a + b, 0);
  for (const e of [...exact].sort((a, b) => (b.v % 1) - (a.v % 1))) {
    if (left <= 0) break;
    counts.set(e.c, counts.get(e.c)! + 1);
    left -= 1;
  }
  return shuffle(rng, [...counts.entries()].flatMap(([c, k]) => Array<Category>(k).fill(c)));
}

/** About 70% target skills, 20% due reviews, 10% stretch; empty buckets fall back to target skills. */
export function planSession(n: number, pools: { target: string[]; review: string[]; stretch: string[] }, rng: Rng): SessionSlot[] {
  if (pools.target.length === 0 && pools.review.length === 0) return [];
  const nReview = Math.min(pools.review.length ? Math.round(n * 0.2) : 0, pools.review.length * 2);
  const nStretch = pools.stretch.length ? Math.round(n * 0.1) : 0;
  const nTarget = n - nReview - nStretch;
  const cats = categoryPlan(n, rng);
  const kinds: SessionSlot['kind'][] = [
    ...Array<SessionSlot['kind']>(nTarget).fill('target'), ...Array<SessionSlot['kind']>(nReview).fill('review'), ...Array<SessionSlot['kind']>(nStretch).fill('stretch'),
  ];
  return shuffle(rng, kinds).map((kind, i) => {
    const pool = kind === 'review' ? pools.review : kind === 'stretch' ? pools.stretch : pools.target.length ? pools.target : pools.review;
    return { kind, skill: pick(rng, pool), category: cats[i]! };
  });
}
