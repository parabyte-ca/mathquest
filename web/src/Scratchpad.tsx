import { useEffect, useRef, useState } from 'preact/hooks';
import { t } from './i18n';

/** A drawing area for working things out. It is never graded and never leaves the device. */
export function Scratchpad({ resetKey }: { resetKey: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const paint = () => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = getComputedStyle(c).getPropertyValue('--ink') || '#14213d';
    for (const s of strokes.current) {
      g.beginPath();
      s.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      if (s.length === 1) g.lineTo(s[0]!.x + 0.1, s[0]!.y);
      g.stroke();
    }
    setEmpty(strokes.current.length === 0);
  };

  useEffect(() => { strokes.current = []; paint(); }, [resetKey]);

  const pos = (e: PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  return (
    <div class="scratch">
      <div class="scratch-bar">
        <strong>{t('scratch.title')}</strong>
        <span class="muted small">{t('scratch.note')}</span>
        <button type="button" class="secondary small" disabled={empty} onClick={() => { strokes.current.pop(); paint(); }}>{t('scratch.undo')}</button>
        <button type="button" class="secondary small" disabled={empty} onClick={() => { strokes.current = []; paint(); }}>{t('scratch.clear')}</button>
      </div>
      <canvas
        ref={ref} width={600} height={260} class="canvas" role="img" aria-label={t('scratch.title')}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); drawing.current = true; strokes.current.push([pos(e)]); paint(); }}
        onPointerMove={(e) => { if (drawing.current) { strokes.current.at(-1)!.push(pos(e)); paint(); } }}
        onPointerUp={() => { drawing.current = false; }}
        onPointerCancel={() => { drawing.current = false; }}
      />
    </div>
  );
}
