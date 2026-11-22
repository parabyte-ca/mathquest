import { useRef, useState } from 'preact/hooks';
import type { Given, PublicItem } from '../../shared/items/types';
import { MathKeyboard } from './MathKeyboard';
import { Preview, T2, plainName } from './MathText';
import { Visual } from './visuals';
import { t } from './i18n';

const intText = (s: string) => /^-?\d{1,9}$/.test(s.trim());

/** The answer area for every item format. Calls onSubmit with a Given once the student presses Check. */
export function ItemInput({ item, disabled, onSubmit }: { item: PublicItem; disabled: boolean; onSubmit: (g: Given) => void }) {
  const [text, setText] = useState('');
  const [frac, setFrac] = useState({ whole: '', n: '', d: '' });
  const [choice, setChoice] = useState<number | null>(null);
  const [multi, setMulti] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>(() => item.options?.map((_, i) => i) ?? []);
  const [pairs, setPairs] = useState<[number, number][]>([]);
  const [left, setLeft] = useState<number | null>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [moved, setMoved] = useState<number | null>(null); // slider value or angle in degrees; null until the student moves it
  const [kb, setKb] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const insert = (s: string) => {
    const el = inputRef.current;
    const at = el?.selectionStart ?? text.length;
    const to = el?.selectionEnd ?? at;
    setText(text.slice(0, at) + s + text.slice(to));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + s.length, at + s.length); });
  };

  let given: Given | null = null;
  switch (item.format) {
    case 'number': given = text.trim() ? { kind: 'number', text } : null; break;
    case 'expression': given = text.trim() ? { kind: 'expression', text } : null; break;
    case 'fraction': given = intText(frac.n) && intText(frac.d) ? { kind: 'fraction', n: frac.n, d: frac.d } : null; break;
    case 'mixed': given = intText(frac.whole) && intText(frac.n) && intText(frac.d) ? { kind: 'mixed', whole: frac.whole, n: frac.n, d: frac.d } : null; break;
    case 'choice': given = choice === null ? null : { kind: 'choice', index: choice }; break;
    case 'multi': given = multi.length ? { kind: 'multi', indices: multi } : null; break;
    case 'order': given = { kind: 'order', order }; break;
    case 'match': given = pairs.length === (item.options?.length ?? -1) ? { kind: 'match', pairs } : null; break;
    case 'slider': case 'angle': given = moved === null ? null : { kind: 'number', text: String(moved) }; break;
    case 'point': given = point ? { kind: 'point', x: point.x, y: point.y } : null; break;
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x!);
    setOrder(next);
  };

  // The picture follows the control: the marker on a number line, the arm on a protractor.
  const shownVisual = (v: NonNullable<PublicItem['visual']>): NonNullable<PublicItem['visual']> => {
    if (item.format === 'slider' && v.type === 'numberLine') return { ...v, marks: moved === null ? [] : [{ at: moved }] };
    if (item.format === 'angle' && v.type === 'protractor') return { ...v, angle: moved ?? undefined };
    return v;
  };
  const unit = item.slider?.unit ?? '';

  const field = (value: string, onInput: (v: string) => void, label: string, id: string) => (
    <div class="fld">
      <label for={id} class="sr">{label}</label>
      <input id={id} inputmode="numeric" autocomplete="off" value={value} aria-label={label} onInput={(e) => onInput((e.target as HTMLInputElement).value)} disabled={disabled} />
    </div>
  );

  return (
    <form class="answer" data-item={item.id} onSubmit={(e) => { e.preventDefault(); if (given && !disabled) onSubmit(given); }}>
      {item.visual && <div class="visual"><Visual v={shownVisual(item.visual)} picked={point} onPick={item.format === 'point' ? (x, y) => !disabled && setPoint({ x, y }) : undefined} onAngle={item.format === 'angle' ? (a) => !disabled && setMoved(a) : undefined} /></div>}

      {(item.format === 'number' || item.format === 'expression') && (
        <div class="entry">
          <label for="ans">{t('play.yourAnswer')}</label>
          <div class="entry-row">
            <input id="ans" ref={inputRef} value={text} inputmode={kb ? 'none' : 'decimal'} autocomplete="off" autocapitalize="none" spellcheck={false} disabled={disabled}
              onInput={(e) => setText((e.target as HTMLInputElement).value)} />
            <button type="button" class="secondary" aria-pressed={kb} onClick={() => setKb(!kb)}>{t('kb.toggle')}</button>
          </div>
          <Preview value={text} />
          {kb && <MathKeyboard onInsert={insert} onBackspace={() => setText(text.slice(0, -1))} onClear={() => setText('')} />}
        </div>
      )}

      {item.format === 'fraction' && (
        <div class="fracin" role="group" aria-label={t('play.fraction')}>
          {field(frac.n, (v) => setFrac({ ...frac, n: v }), t('play.numerator'), 'fn')}
          <hr class="bar" aria-hidden="true" />
          {field(frac.d, (v) => setFrac({ ...frac, d: v }), t('play.denominator'), 'fd')}
        </div>
      )}

      {item.format === 'mixed' && (
        <div class="fracin mixed" role="group" aria-label={t('play.mixed')}>
          {field(frac.whole, (v) => setFrac({ ...frac, whole: v }), t('play.whole'), 'fw')}
          <div class="stack">
            {field(frac.n, (v) => setFrac({ ...frac, n: v }), t('play.numerator'), 'fn')}
            <hr class="bar" aria-hidden="true" />
            {field(frac.d, (v) => setFrac({ ...frac, d: v }), t('play.denominator'), 'fd')}
          </div>
        </div>
      )}

      {item.format === 'choice' && (
        <div class="choices" role="radiogroup" aria-label={t('play.choose')}>
          {item.options!.map((o, i) => (
            <label key={i} class={`choice${choice === i ? ' on' : ''}`}>
              <input type="radio" name="choice" aria-label={plainName(o)} checked={choice === i} onChange={() => setChoice(i)} disabled={disabled} />
              <T2 x={o} />
            </label>
          ))}
        </div>
      )}

      {item.format === 'multi' && (
        <div class="choices" role="group" aria-label={t('play.chooseMany')}>
          {item.options!.map((o, i) => (
            <label key={i} class={`choice${multi.includes(i) ? ' on' : ''}`}>
              <input type="checkbox" aria-label={plainName(o)} checked={multi.includes(i)} onChange={() => setMulti(multi.includes(i) ? multi.filter((x) => x !== i) : [...multi, i])} disabled={disabled} />
              <T2 x={o} />
            </label>
          ))}
        </div>
      )}

      {item.format === 'order' && (
        <div>
          <p class="muted small" id="order-help">{t('play.orderHelp')}</p>
          <ol class="orderlist" aria-describedby="order-help">
            {order.map((idx, pos) => (
              <li key={idx} draggable={!disabled} class="orderitem"
                onDragStart={() => (dragFrom.current = pos)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragFrom.current !== null) move(dragFrom.current, pos); dragFrom.current = null; }}>
                <span class="grip" aria-hidden="true">⋮⋮</span>
                <T2 x={item.options![idx]!} class="grow-1" />
                <button type="button" class="secondary icon" aria-label={t('play.moveUp')} disabled={disabled || pos === 0} onClick={() => move(pos, pos - 1)}>↑</button>
                <button type="button" class="secondary icon" aria-label={t('play.moveDown')} disabled={disabled || pos === order.length - 1} onClick={() => move(pos, pos + 1)}>↓</button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {item.format === 'match' && (
        <div>
          <p class="muted small">{t('play.matchHelp')}</p>
          <div class="match">
            <ul class="plain">
              {item.options!.map((o, i) => {
                const paired = pairs.find((p) => p[0] === i);
                return (
                  <li key={i}>
                    <button type="button" class={`pill${left === i ? ' on' : ''}${paired ? ' done' : ''}`} aria-pressed={left === i} aria-label={`${plainName(o)}${paired ? ` ${t('play.matchedTo')} ${plainName(item.right![paired[1]]!)}` : ''}`} disabled={disabled}
                      onClick={() => { setPairs(pairs.filter((p) => p[0] !== i)); setLeft(i); }}>
                      <T2 x={o} />{paired && <span class="sr"> {t('play.matchedTo')} </span>}{paired && <T2 x={item.right![paired[1]]!} class="pairtag" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul class="plain">
              {item.right!.map((o, j) => {
                const used = pairs.some((p) => p[1] === j);
                return (
                  <li key={j}>
                    <button type="button" class={`pill${used ? ' done' : ''}`} aria-label={plainName(o)} disabled={disabled || used || left === null}
                      onClick={() => { if (left !== null) { setPairs([...pairs.filter((p) => p[0] !== left), [left, j]]); setLeft(null); } }}>
                      <T2 x={o} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {item.format === 'slider' && item.slider && (
        <div class="slider-in">
          <label for="slide">{t('play.sliderLabel')}</label>
          <input id="slide" type="range" min={item.slider.min} max={item.slider.max} step={item.slider.step} value={moved ?? item.slider.min} disabled={disabled}
            aria-valuetext={moved === null ? t('play.sliderUntouched') : `${moved}${unit}`}
            onInput={(e) => setMoved(Number((e.target as HTMLInputElement).value))}
            onKeyUp={(e) => { if (moved === null) setMoved(Number((e.target as HTMLInputElement).value)); }}
            onPointerUp={(e) => { if (moved === null) setMoved(Number((e.target as HTMLInputElement).value)); }} />
          <div class="ends muted small" aria-hidden="true"><span>{item.slider.min}{unit}</span><span>{item.slider.max}{unit}</span></div>
          <p class="readout" role="status">{moved === null ? t('play.sliderUntouched') : t('play.sliderValue', { v: `${moved}${unit}` })}</p>
        </div>
      )}

      {item.format === 'angle' && (
        <div class="slider-in">
          <p class="muted small">{t('play.angleHelp')}</p>
          <label for="angle-range">{t('play.angleLabel')}</label>
          <input id="angle-range" type="range" min={0} max={180} step={1} value={moved ?? 0} disabled={disabled}
            aria-valuetext={moved === null ? t('play.sliderUntouched') : `${moved}°`}
            onInput={(e) => setMoved(Number((e.target as HTMLInputElement).value))}
            onKeyUp={(e) => { if (moved === null) setMoved(Number((e.target as HTMLInputElement).value)); }} />
          <p class="readout" role="status">{moved === null ? t('play.sliderUntouched') : t('play.angleValue', { v: moved })}</p>
        </div>
      )}

      {item.format === 'point' && item.visual?.type === 'plane' && (
        <div class="pointin">
          <p class="muted small">{t('play.pointHelp')}</p>
          <div class="row2">
            <div class="fld"><label for="px">x</label><input id="px" inputmode="numeric" value={point?.x ?? ''} disabled={disabled}
              onInput={(e) => { const v = Number((e.target as HTMLInputElement).value); if ((e.target as HTMLInputElement).value !== '' && Number.isInteger(v)) setPoint({ x: v, y: point?.y ?? 0 }); }} /></div>
            <div class="fld"><label for="py">y</label><input id="py" inputmode="numeric" value={point?.y ?? ''} disabled={disabled}
              onInput={(e) => { const v = Number((e.target as HTMLInputElement).value); if ((e.target as HTMLInputElement).value !== '' && Number.isInteger(v)) setPoint({ x: point?.x ?? 0, y: v }); }} /></div>
          </div>
        </div>
      )}

      <button type="submit" class="go" disabled={disabled || !given}>{t('play.check')}</button>
    </form>
  );
}
