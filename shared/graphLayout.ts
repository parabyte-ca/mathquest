// Layout of the read-only graph picture: where the axes, grid, ticks and curve go. Pure, so the browser, the tests and the screen-reader text agree.
import type { Visual } from './items/types.js';

export type GraphVisual = Extract<Visual, { type: 'graph' }>;
export interface GraphLayout {
  w: number; h: number; left: number; right: number; top: number; bottom: number;
  xticks: { v: number; x: number }[]; yticks: { v: number; y: number }[];
  path: string; toX: (x: number) => number; toY: (y: number) => number;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;
/** Tick values from `min` to `max` in steps of `step` (guarding against drift and a bad step). */
export function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  if (!(step > 0) || !(max > min)) return out;
  for (let v = min, i = 0; v <= max + 1e-9 && i < 200; i++, v = min + i * step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

export function graphLayout(v: GraphVisual): GraphLayout {
  const w = 360, h = 270, left = 48, right = 14, top = 14, bottom = 44;
  const toX = (x: number): number => left + ((x - v.xmin) / (v.xmax - v.xmin)) * (w - left - right);
  const toY = (y: number): number => h - bottom - ((y - v.ymin) / (v.ymax - v.ymin)) * (h - top - bottom);
  const path = v.pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round1(toX(x))} ${round1(toY(y))}`).join(' ');
  return {
    w, h, left, right, top, bottom, path, toX, toY,
    xticks: ticks(v.xmin, v.xmax, v.xstep).map((t) => ({ v: t, x: toX(t) })),
    yticks: ticks(v.ymin, v.ymax, v.ystep).map((t) => ({ v: t, y: toY(t) })),
  };
}

/** The curve as a table of whole-number x values and their y values: what a screen reader (or a worksheet) gets in place of the picture. */
export function graphTable(v: GraphVisual): [number, number][] {
  return v.pts.filter(([x]) => Number.isInteger(x));
}
