import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { generate } from '../shared/generators/index.js';
import { graphLayout, graphTable, ticks, type GraphVisual } from '../shared/graphLayout.js';
import type { Item, Visual } from '../shared/items/types.js';

// Independent check of the Grade 10 figure and graph skills: the answer is recomputed from the picture's own points (the plane's
// labelled points, the graph's curve), not from the numbers the generator used, so a picture that disagrees with the question is caught.

const SEEDS = 250;
const G = 'MS.G10.';
const val = (it: Item): number => (it.answer as { value: number }).value;
const each = (skill: string, tiers: number[], fn: (it: Item, tier: number) => void): void => {
  for (const tier of tiers) for (let seed = 1; seed <= SEEDS; seed++) fn(generate(G + skill, tier, seed), tier);
};
const near = (a: number, b: number, id: string, tol = 1e-9): void => expect(Math.abs(a - b), id).toBeLessThanOrEqual(tol);
type P = [number, number];
const points = (it: Item): Record<string, P> => {
  const v = it.visual as Extract<Visual, { type: 'plane' }>;
  expect(v.type).toBe('plane');
  return Object.fromEntries(v.points!.map((p) => [p.label!, [p.x, p.y] as P]));
};
const graph = (it: Item): GraphVisual => { const v = it.visual as GraphVisual; expect(v.type).toBe('graph'); return v; };
const dist = (a: P, b: P): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/** The coordinate pairs written in the prompt, in order: "$(3,\ 4)$". */
const written = (it: Item): P[] => [...it.prompt.en.matchAll(/\((-?\d+),\\ (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])] as P);

describe('MPM2D B3: figures on a grid', () => {
  it('lists the new skills with generators', () => {
    const ids = (JSON.parse(readFileSync('content/microskills.json', 'utf8')) as { microskills: { id: string }[] }).microskills.map((m) => m.id);
    for (const id of ['MPM2D.B3.1', 'MPM2D.B3.2', 'MPM2D.B3.3', 'MFM2P.C3.1', 'MFM2P.C3.2']) expect(ids).toContain(`${G}${id}.a`);
  });
  it('midsegment: half of the third side, from the drawn points', () => {
    each('MPM2D.B3.1.a', [1, 2], (it) => {
      const p = points(it);
      expect(written(it)).toEqual([p.A, p.B, p.C]); // the picture shows the vertices the question names
      near(val(it), dist(mid(p.A!, p.C!), mid(p.B!, p.C!)), it.id, 1e-6);
      near(val(it), dist(p.A!, p.B!) / 2, it.id, 1e-6);
    });
    each('MPM2D.B3.1.a', [3], (it) => {
      const p = points(it);
      expect(written(it)).toEqual([p.M, p.N]);
      near(val(it), 2 * dist(p.M!, p.N!), it.id, 1e-6);
      expect(Number.isInteger(val(it)), it.id).toBe(true);
    });
  });
  it('medians and the centroid, from the drawn points', () => {
    each('MPM2D.B3.2.a', [1], (it) => {
      const p = points(it);
      expect(written(it)).toEqual([p.A, p.B, p.C]);
      const k = /x-coordinate/.test(it.prompt.en) ? 0 : 1;
      near(val(it), (p.B![k]! + p.C![k]!) / 2, it.id);
      expect(Number.isInteger(val(it)), it.id).toBe(true);
    });
    each('MPM2D.B3.2.a', [2], (it) => { const p = points(it); near(val(it), dist(p.A!, mid(p.B!, p.C!)), it.id, 1e-6); });
    each('MPM2D.B3.2.a', [3], (it) => {
      const p = points(it), k = /x-coordinate/.test(it.prompt.en) ? 0 : 1;
      near(val(it), (p.A![k]! + p.B![k]! + p.C![k]!) / 3, it.id, 1e-9);
      expect(Number.isInteger(val(it)), it.id).toBe(true);
    });
  });
  it('the fourth vertex of a parallelogram from its bisecting diagonals', () => {
    each('MPM2D.B3.3.a', [1], (it) => {
      const p = points(it), k = /x-coordinate/.test(it.prompt.en) ? 0 : 1;
      near(val(it), p.A![k]! + p.C![k]! - p.B![k]!, it.id);
    });
  });
  it('names a quadrilateral from its diagonals, and the picture matches the question', () => {
    const name = (A: P, B: P, C: P, D: P): string => {
      const m1 = mid(A, C), m2 = mid(B, D);
      if (m1[0] !== m2[0] || m1[1] !== m2[1]) return 'Not a parallelogram';
      const eq = Math.abs(dist(A, C) - dist(B, D)) < 1e-9, perp = (C[0] - A[0]) * (D[0] - B[0]) + (C[1] - A[1]) * (D[1] - B[1]) === 0;
      return eq && perp ? 'A square' : eq ? 'A rectangle' : perp ? 'A rhombus' : 'A parallelogram that';
    };
    const seen = new Set<string>();
    each('MPM2D.B3.3.a', [2, 3], (it, tier) => {
      const p = points(it);
      expect(written(it)).toEqual([p.A, p.B, p.C, p.D]);
      const expected = name(p.A!, p.B!, p.C!, p.D!);
      const options = it.options!.map((o) => o.en);
      const right = options[(it.answer as { index: number }).index]!;
      expect(right.startsWith(expected), `${it.id}: ${right} for ${expected}`).toBe(true);
      expect(options.filter((o) => o.startsWith(expected)), it.id).toHaveLength(1);
      expect(new Set(options).size, it.id).toBe(4);
      if (tier === 2) expect(options.some((o) => o.startsWith('Not a parallelogram')), it.id).toBe(false);
      expect(it.steps.at(-1)!.en.toLowerCase(), `${it.id} worked solution names the figure`).toContain(expected.toLowerCase()); // the steps agree with the answer
      seen.add(`${tier}:${expected}`);
    });
    for (const k of ['A square', 'A rectangle', 'A rhombus', 'A parallelogram that']) expect(seen.has(`2:${k}`), k).toBe(true);
    for (const k of ['Not a parallelogram', 'A rectangle', 'A rhombus', 'A parallelogram that']) expect(seen.has(`3:${k}`), k).toBe(true);
  });
  it('explains every wrong name by the property that fails', () => {
    each('MPM2D.B3.3.a', [2, 3], (it) => {
      const right = (it.answer as { index: number }).index;
      it.options!.forEach((_, i) => {
        if (i === right) return;
        const w = it.wrong.find((x) => x.answer.kind === 'choice' && x.answer.index === i);
        expect(w?.why.en.length ?? 0, `${it.id} option ${i}`).toBeGreaterThan(20);
        expect(w?.why.fr && w.why.fr !== w.why.en, `${it.id} option ${i} French`).toBe(true);
      });
    });
  });
});

describe('MFM2P C3: reading graphs', () => {
  const y0 = (g: GraphVisual): number => g.pts[0]![1];
  it('draws a well-formed graph: ordered points, inside the window, a readable grid', () => {
    each('MFM2P.C3.1.a', [1, 2, 3], (it) => {
      const g = graph(it);
      for (let i = 1; i < g.pts.length; i++) expect(g.pts[i]![0], it.id).toBeGreaterThan(g.pts[i - 1]![0]);
      for (const [x, y] of g.pts) { expect(x).toBeGreaterThanOrEqual(g.xmin); expect(x).toBeLessThanOrEqual(g.xmax); expect(y).toBeGreaterThanOrEqual(g.ymin); expect(y).toBeLessThanOrEqual(g.ymax); }
      expect(ticks(g.ymin, g.ymax, g.ystep).length, it.id).toBeLessThanOrEqual(10);
      expect(Math.max(...g.pts.map((p) => p[1])), it.id).toBeLessThan(g.ymax); // room above the top
      expect(g.pts.at(-1)![1], it.id).toBe(0); // it ends on the ground
      expect(graphTable(g).every(([x]) => Number.isInteger(x))).toBe(true);
    });
  });
  it('the greatest height, the time it is reached and the starting height', () => {
    each('MFM2P.C3.1.a', [1], (it) => near(val(it), Math.max(...graph(it).pts.map((p) => p[1])), it.id));
    each('MFM2P.C3.1.a', [2], (it) => { const g = graph(it); const top = Math.max(...g.pts.map((p) => p[1])); near(val(it), g.pts.find((p) => p[1] === top)![0], it.id); });
    each('MFM2P.C3.1.a', [3], (it) => { const g = graph(it); near(val(it), y0(g), it.id); expect(y0(g), it.id).toBeGreaterThan(0); });
  });
  it('a height at a time, the landing time and the time above a height', () => {
    each('MFM2P.C3.2.a', [1], (it) => {
      const g = graph(it), k = Number(/after \$?(\d+)\$? second/.exec(it.prompt.en)![1]);
      near(val(it), g.pts.find((p) => p[0] === k)![1], it.id);
    });
    each('MFM2P.C3.2.a', [2], (it) => { const g = graph(it); near(val(it), g.pts.find((p) => p[0] > 0 && p[1] === 0)![0], it.id); });
    each('MFM2P.C3.2.a', [3], (it) => {
      const g = graph(it), H = Number(/at least \$?(\d+)\$? m/.exec(it.prompt.en)![1]);
      const above = g.pts.filter((p) => p[1] >= H).map((p) => p[0]);
      near(val(it), Math.max(...above) - Math.min(...above), it.id);
      expect(Number.isInteger(val(it)), it.id).toBe(true);
      expect(H, it.id).toBeLessThanOrEqual(Math.max(...g.pts.map((p) => p[1])));
    });
  });
  it('lays the graph out so the curve fits inside the axes', () => {
    each('MFM2P.C3.1.a', [1], (it) => {
      const g = graph(it), L = graphLayout(g);
      expect(L.toX(g.xmin)).toBeLessThan(L.toX(g.xmax));
      expect(L.toY(g.ymin)).toBeGreaterThan(L.toY(g.ymax)); // up is up
      for (const [x, y] of g.pts) { expect(L.toX(x)).toBeGreaterThanOrEqual(L.left - 1e-9); expect(L.toX(x)).toBeLessThanOrEqual(L.w - L.right + 1e-9); expect(L.toY(y)).toBeGreaterThanOrEqual(L.top - 1e-9); expect(L.toY(y)).toBeLessThanOrEqual(L.h - L.bottom + 1e-9); }
      expect(L.path.startsWith('M')).toBe(true);
      expect((L.path.match(/L/g) ?? []).length).toBe(g.pts.length - 1);
      expect(L.xticks.length).toBeGreaterThan(2);
    });
    expect(ticks(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(ticks(0, 5, 0)).toEqual([]);
  });
});
