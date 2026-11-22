import type { Visual } from '../../shared/items/types';
import { getLang } from './i18n';

/** A text description for screen readers, so every picture has an equivalent. */
export function describeVisual(v: Visual): string {
  const fr = getLang() === 'fr';
  switch (v.type) {
    case 'fractionBar': return fr ? `Barre séparée en ${v.d} parties égales, ${v.n} ombrée${v.n > 1 ? 's' : ''}.` : `Bar split into ${v.d} equal parts, ${v.n} shaded.`;
    case 'fractionBars': return (fr ? 'Barres de fractions : ' : 'Fraction bars: ') + v.bars.map((b) => `${b.n}/${b.d}`).join(', ');
    case 'numberLine': return fr ? `Droite numérique de ${v.min} à ${v.max}.` : `Number line from ${v.min} to ${v.max}.`;
    case 'areaModel': return fr ? `Grille de ${v.rows} sur ${v.cols}, ${v.shaded} cases ombrées.` : `${v.rows} by ${v.cols} grid with ${v.shaded} squares shaded.`;
    case 'plane': return fr ? `Plan de coordonnées${v.points?.length ? ` avec ${v.points.length} point(s)` : ''}.` : `Coordinate grid${v.points?.length ? ` with ${v.points.length} point(s)` : ''}.`;
    case 'protractor': return fr ? `Rapporteur d'angles${v.angle !== undefined ? `, avec un bras tracé${v.flip ? ' (bras de base à gauche)' : ''}` : ''}.` : `Protractor${v.angle !== undefined ? `, with an arm drawn${v.flip ? ' (base arm on the left)' : ''}` : ''}.`;
    case 'blocks': return fr ? `${v.tenths} bandes de dixièmes et ${v.hundredths} petits carrés de centièmes.` : `${v.tenths} tenths strips and ${v.hundredths} hundredths squares.`;
  }
}

function Bar({ n, d, y = 0, label }: { n: number; d: number; y?: number; label?: boolean }) {
  const w = 300;
  const cell = w / d;
  return (
    <g transform={`translate(10 ${y + 6})`}>
      {Array.from({ length: d }, (_, i) => (
        <rect key={i} class={i < n ? 'seg fill grow' : 'seg'} x={i * cell} y={0} width={cell} height={34} />
      ))}
      {label && <text class="vlabel" x={w / 2} y={56} text-anchor="middle">{n}/{d}</text>}
    </g>
  );
}

function Plane({ v, onPick }: { v: Extract<Visual, { type: 'plane' }>; onPick?: (x: number, y: number) => void }) {
  const u = 36;
  const pad = 28;
  const n = v.size;
  const w = pad * 2 + n * u;
  const toX = (x: number) => pad + x * u;
  const toY = (y: number) => pad + (n - y) * u;
  return (
    <svg viewBox={`0 0 ${w} ${w}`} class="vis plane" role="img" aria-label={describeVisual(v)}
      onClick={onPick ? (e) => {
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const sx = ((e.clientX - rect.left) / rect.width) * w;
        const sy = ((e.clientY - rect.top) / rect.height) * w;
        const x = Math.round((sx - pad) / u);
        const y = Math.round(n - (sy - pad) / u);
        if (x >= 0 && x <= n && y >= 0 && y <= n) onPick(x, y);
      } : undefined}>
      {Array.from({ length: n + 1 }, (_, i) => (
        <g key={i}>
          <line class="grid" x1={toX(i)} y1={toY(0)} x2={toX(i)} y2={toY(n)} />
          <line class="grid" x1={toX(0)} y1={toY(i)} x2={toX(n)} y2={toY(i)} />
          <text class="tick" x={toX(i)} y={toY(0) + 16} text-anchor="middle">{i}</text>
          <text class="tick" x={toX(0) - 8} y={toY(i) + 4} text-anchor="end">{i}</text>
        </g>
      ))}
      <line class="axis" x1={toX(0)} y1={toY(0)} x2={toX(n)} y2={toY(0)} />
      <line class="axis" x1={toX(0)} y1={toY(0)} x2={toX(0)} y2={toY(n)} />
      {v.points?.map((p, i) => (
        <g key={i}>
          <circle class="pt" cx={toX(p.x)} cy={toY(p.y)} r={7} />
          {p.label && <text class="vlabel" x={toX(p.x) + 10} y={toY(p.y) - 8}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** A protractor with both scales. The base arm lies along 0 (right) or, when flipped, along 180 (left); `angle` is measured from it. */
function Protractor({ v, onAngle }: { v: Extract<Visual, { type: 'protractor' }>; onAngle?: (deg: number) => void }) {
  const cx = 170, cy = 165, R = 150;
  const at = (deg: number, r: number) => ({ x: cx + r * Math.cos(rad(deg)), y: cy - r * Math.sin(rad(deg)) });
  const abs = (measured: number): number => (v.flip ? 180 - measured : measured);
  const arm = v.angle === undefined ? null : at(abs(v.angle), R + 14);
  const base = at(v.flip ? 180 : 0, R + 14);
  const from = (e: PointerEvent): number | null => {
    const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const dx = ((e.clientX - svg.left) / svg.width) * 340 - cx;
    const dy = cy - ((e.clientY - svg.top) / svg.height) * 190;
    const a = Math.min(180, Math.max(0, (Math.atan2(dy, dx) * 180) / Math.PI));
    const abs0 = dy < 0 ? (dx >= 0 ? 0 : 180) : a;
    return Math.round(v.flip ? 180 - abs0 : abs0);
  };
  const drag = onAngle
    ? { onPointerDown: (e: PointerEvent) => { (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); const a = from(e); if (a !== null) onAngle(a); },
        onPointerMove: (e: PointerEvent) => { if ((e.buttons & 1) === 1) { const a = from(e); if (a !== null) onAngle(a); } } }
    : {};
  return (
    <svg viewBox="0 0 340 190" class={`vis protractor${onAngle ? ' draggable' : ''}`} role="img" aria-label={describeVisual(v)} {...drag}>
      <path class="proto-body" d={`M ${cx - R - 10} ${cy} A ${R + 10} ${R + 10} 0 0 1 ${cx + R + 10} ${cy} Z`} />
      {Array.from({ length: 37 }, (_, i) => {
        const deg = i * 5;
        const major = deg % 10 === 0;
        const a = at(deg, R), b = at(deg, R - (major ? 12 : 7));
        const lo = at(deg, R - 28), li = at(deg, R - 44);
        return (
          <g key={deg}>
            <line class="tick-line" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
            {major && <text class="tick" x={lo.x} y={lo.y + 3} text-anchor="middle">{deg}</text>}
            {major && <text class="tick inner" x={li.x} y={li.y + 3} text-anchor="middle">{180 - deg}</text>}
          </g>
        );
      })}
      <line class="axis" x1={cx - R - 14} y1={cy} x2={cx + R + 14} y2={cy} />
      <line class="axis base" x1={cx} y1={cy} x2={base.x} y2={base.y} />
      {arm && <line class="arm" x1={cx} y1={cy} x2={arm.x} y2={arm.y} />}
      <circle class="pt" cx={cx} cy={cy} r={4} />
    </svg>
  );
}

export function Visual({ v, picked, onPick, onAngle }: { v: Visual; picked?: { x: number; y: number } | null; onPick?: (x: number, y: number) => void; onAngle?: (deg: number) => void }) {
  const label = describeVisual(v);
  switch (v.type) {
    case 'fractionBar':
      return <svg viewBox="0 0 320 70" class="vis" role="img" aria-label={label}><Bar n={v.n} d={v.d} label={v.label} /></svg>;
    case 'fractionBars':
      return (
        <svg viewBox={`0 0 320 ${v.bars.length * 56 + 4}`} class="vis" role="img" aria-label={label}>
          {v.bars.map((b, i) => <Bar key={i} n={b.n} d={b.d} y={i * 56} label />)}
        </svg>
      );
    case 'numberLine': {
      const w = 300;
      const step = w / v.ticks;
      return (
        <svg viewBox="0 0 320 70" class="vis" role="img" aria-label={label}>
          <line class="axis" x1={10} y1={30} x2={310} y2={30} />
          {Array.from({ length: v.ticks + 1 }, (_, i) => (
            <g key={i}><line class="axis" x1={10 + i * step} y1={24} x2={10 + i * step} y2={36} /><text class="tick" x={10 + i * step} y={54} text-anchor="middle">{Number((v.min + ((v.max - v.min) * i) / v.ticks).toFixed(2))}</text></g>
          ))}
          {v.marks?.map((m, i) => <circle key={i} class="pt" cx={10 + ((m.at - v.min) / (v.max - v.min)) * w} cy={30} r={6} />)}
        </svg>
      );
    }
    case 'areaModel': {
      const c = 32;
      return (
        <svg viewBox={`0 0 ${v.cols * c + 20} ${v.rows * c + 20}`} class="vis" role="img" aria-label={label}>
          {Array.from({ length: v.rows * v.cols }, (_, i) => (
            <rect key={i} class={i < v.shaded ? 'seg fill grow' : 'seg'} x={10 + (i % v.cols) * c} y={10 + Math.floor(i / v.cols) * c} width={c} height={c} />
          ))}
        </svg>
      );
    }
    case 'blocks':
      return (
        <svg viewBox="0 0 320 170" class="vis" role="img" aria-label={label}>
          {Array.from({ length: v.tenths }, (_, i) => (
            <g key={i} transform={`translate(${10 + i * 26} 8)`}>
              {Array.from({ length: 10 }, (_, j) => <rect key={j} class="seg fill grow" x={0} y={j * 11} width={20} height={11} />)}
            </g>
          ))}
          {Array.from({ length: v.hundredths }, (_, i) => (
            <rect key={i} class="seg fill2 grow" x={10 + (i % 10) * 14} y={128 + Math.floor(i / 10) * 14} width={11} height={11} />
          ))}
        </svg>
      );
    case 'protractor':
      return <Protractor v={v} onAngle={onAngle} />;
    case 'plane': {
      const pts = [...(v.points ?? []), ...(picked ? [{ x: picked.x, y: picked.y }] : [])];
      return <Plane v={{ ...v, points: pts }} onPick={v.click ? onPick : undefined} />;
    }
  }
}
