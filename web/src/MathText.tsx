import { useEffect, useRef, useState } from 'preact/hooks';
import { TEX_MACROS, rawTex } from '../../shared/tex';
import type { Text } from '../../shared/items/types';
import { getLang } from './i18n';
import { speakable } from '../../shared/mathspeech';

type Katex = typeof import('katex');
let katexPromise: Promise<Katex> | null = null;
const loadKatex = (): Promise<Katex> => (katexPromise ??= import('katex').then((m) => (m as unknown as { default: Katex }).default ?? m));

/** Renders one TeX snippet to MathML (native, screen-reader friendly, no inline styles so the strict CSP holds). */
function render(katex: Katex, tex: string): string {
  return katex.renderToString(tex, { output: 'mathml', throwOnError: false, strict: 'ignore', trust: false, macros: { ...TEX_MACROS } });
}

/** Text with $...$ math. Plain text shows immediately; math upgrades to KaTeX once it has loaded. */
export function MathText({ text, class: cls }: { text: string; class?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  const [katex, setKatex] = useState<Katex | null>(null);
  useEffect(() => {
    if (parts.some((p) => p.startsWith('$'))) void loadKatex().then(setKatex);
  }, [text]);
  return (
    <span class={cls}>
      {parts.map((p, i) =>
        p.startsWith('$') && p.endsWith('$') && p.length > 2 ? (
          katex ? <span key={i} class="tex" dangerouslySetInnerHTML={{ __html: render(katex, p.slice(1, -1)) }} /> : <span key={i} class="tex-raw">{rawTex(p.slice(1, -1))}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

/** Picks the current language from a two-language Text. */
export const tt = (x: Text): string => x[getLang()];

/** Plain-words version of a Text (math as words), used for accessible names. */
export const plainName = (x: Text): string => speakable(tt(x), getLang());

export function T2({ x, class: cls }: { x: Text; class?: string }) {
  return <MathText text={tt(x)} class={cls} />;
}

/** A small live preview of what the student is typing (fractions, powers, roots and pi). */
export function Preview({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!value.trim()) { if (ref.current) ref.current.textContent = ''; return; }
    void loadKatex().then((k) => {
      if (!ref.current) return;
      const tex = value
        .replace(/(\d+|\([^()]*\))\s*\/\s*(\d+|\([^()]*\))/g, '\\frac{$1}{$2}')
        .replace(/sqrt\(([^()]*)\)/g, '\\sqrt{$1}')
        .replace(/\bpi\b/g, '\\pi')
        .replace(/\*/g, '\\times ');
      ref.current.innerHTML = render(k, tex);
    });
  }, [value]);
  return <span ref={ref} class="preview" aria-hidden="true" />;
}
