import { useEffect, useMemo, useState } from 'preact/hooks';
import { api } from '../api';
import { t } from '../i18n';
import type { MapNode, SkillMapData } from '../learnTypes';

const ICON: Record<string, string> = { mastered: '★', in_progress: '◐', needs_review: '↻', new: '○', locked: '🔒', soon: '…' };

/** A visual tree of expectations: prerequisites above, what they unlock below. Colour is never the only signal. */
export function SkillMap({ go }: { go: (to: string) => void }) {
  const q = new URLSearchParams(location.search);
  const grade = Number(q.get('grade') ?? 5);
  const course = q.get('course');
  const [data, setData] = useState<SkillMapData | null>(null);
  const [sel, setSel] = useState<MapNode | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void api<SkillMapData>('GET', `/learn/skillmap?grade=${grade}${course ? `&course=${course}` : ''}`).then((r) => (r.ok ? setData(r.data) : setError(true)));
  }, [grade, course]);

  const layout = useMemo(() => {
    if (!data) return null;
    const depth = new Map<string, number>();
    const parents = (c: string) => data.edges.filter((e) => e.to === c).map((e) => e.from);
    const d = (c: string, seen: string[] = []): number => {
      if (depth.has(c)) return depth.get(c)!;
      if (seen.includes(c)) return 0;
      const v = Math.max(-1, ...parents(c).map((p) => d(p, [...seen, c]))) + 1;
      depth.set(c, v);
      return v;
    };
    data.nodes.forEach((n) => d(n.code));
    const rows = new Map<number, MapNode[]>();
    data.nodes.forEach((n) => rows.set(depth.get(n.code)!, [...(rows.get(depth.get(n.code)!) ?? []), n]));
    const W = 360, nodeW = 62, nodeH = 34, gapY = 62;
    const pos = new Map<string, { x: number; y: number }>();
    [...rows.entries()].sort((a, b) => a[0] - b[0]).forEach(([row, ns]) => {
      // wrap long rows so the tree fits a phone without sideways scrolling
      const perLine = Math.floor((W - 10) / (nodeW + 6));
      ns.sort((a, b) => a.code.localeCompare(b.code)).forEach((n, i) => {
        const line = Math.floor(i / perLine);
        const inLine = Math.min(perLine, ns.length - line * perLine);
        const startX = (W - (inLine * (nodeW + 6) - 6)) / 2;
        pos.set(n.code, { x: startX + (i % perLine) * (nodeW + 6), y: 12 + (row + line * 0.0) * gapY + line * (nodeH + 8) + extra(rows, row, perLine) });
      });
    });
    function extra(r: Map<number, MapNode[]>, row: number, per: number): number {
      let e = 0;
      for (const [k, ns] of r) if (k < row) e += (Math.ceil(ns.length / per) - 1) * (nodeH + 8);
      return e;
    }
    const H = Math.max(...[...pos.values()].map((p) => p.y)) + nodeH + 16;
    return { pos, W, H, nodeW, nodeH };
  }, [data]);

  if (error) return <section class="card narrow"><p class="note" role="alert">{t('common.error')}</p></section>;
  if (!data || !layout) return <section class="card narrow"><p role="status">{t('common.loading')}</p></section>;

  return (
    <section class="card" aria-labelledby="map-title">
      <h1 id="map-title">{t('learn.skillMap')} · {t('caregiver.grade')} {grade}</h1>
      <ul class="legend" aria-label={t('map.legend')}>
        {Object.keys(ICON).map((k) => <li key={k}><span class={`dot ${k}`} aria-hidden="true">{ICON[k]}</span> {t(`map.${k}`)}</li>)}
      </ul>
      <svg viewBox={`0 0 ${layout.W} ${layout.H}`} class="skillmap" role="group" aria-label={t('learn.skillMap')}>
        {data.edges.map((e, i) => {
          const a = layout.pos.get(e.from), b = layout.pos.get(e.to);
          if (!a || !b) return null;
          return <line key={i} class="edge" x1={a.x + layout.nodeW / 2} y1={a.y + layout.nodeH} x2={b.x + layout.nodeW / 2} y2={b.y} />;
        })}
        {data.nodes.map((n) => {
          const p = layout.pos.get(n.code)!;
          return (
            <g key={n.code} class={`node ${n.state}${sel?.code === n.code ? ' sel' : ''}${n.grade !== grade ? ' other' : ''}`} transform={`translate(${p.x} ${p.y})`} tabindex={0} role="button"
              aria-label={`${n.code}. ${t(`map.${n.state}`)}`} aria-pressed={sel?.code === n.code}
              onClick={() => setSel(n)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(n); } }}>
              <rect width={layout.nodeW} height={layout.nodeH} rx={8} />
              <text x={8} y={14} class="ncode">{n.code.replace(/^G\d\./, '')}</text>
              <text x={layout.nodeW - 18} y={24} class="nicon">{ICON[n.state]}</text>
              {n.grade !== grade && <text x={8} y={28} class="ngrade">G{n.grade}</text>}
            </g>
          );
        })}
      </svg>

      {sel ? (
        <div class="detail" role="region" aria-live="polite" aria-label={sel.code}>
          <h2>{sel.code} <span class="badge">{ICON[sel.state]} {t(`map.${sel.state}`)}</span></h2>
          <p>{sel.text}</p>
          {sel.micro > 0 && <p class="muted small">{t('map.progress', { pct: Math.round(sel.p * 100) })}</p>}
          {sel.state === 'locked' && <p class="note">{t('map.recommendFirst', { codes: sel.unmet.join(', ') })}</p>}
          {sel.micro > 0 && <button type="button" onClick={() => go(`/app/learn/practice?grade=${sel.grade}&strands=${sel.strand}`)}>{t('map.practice')}</button>}
          {sel.state === 'soon' && <p class="muted">{t('learn.soon')}</p>}
        </div>
      ) : <p class="muted">{t('map.tap')}</p>}
      <button type="button" class="secondary" onClick={() => go('/app/learn')}>{t('common.back')}</button>
    </section>
  );
}
