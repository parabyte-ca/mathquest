import { t } from './i18n';

interface Key { label: string; insert: string; aria: string; wide?: boolean }

const ROWS: Key[][] = [
  [{ label: '7', insert: '7', aria: '7' }, { label: '8', insert: '8', aria: '8' }, { label: '9', insert: '9', aria: '9' }, { label: '÷', insert: '/', aria: 'divided by or fraction bar' }, { label: '(', insert: '(', aria: 'open bracket' }, { label: ')', insert: ')', aria: 'close bracket' }],
  [{ label: '4', insert: '4', aria: '4' }, { label: '5', insert: '5', aria: '5' }, { label: '6', insert: '6', aria: '6' }, { label: '×', insert: '*', aria: 'times' }, { label: 'xⁿ', insert: '^', aria: 'exponent' }, { label: '√', insert: 'sqrt(', aria: 'square root' }],
  [{ label: '1', insert: '1', aria: '1' }, { label: '2', insert: '2', aria: '2' }, { label: '3', insert: '3', aria: '3' }, { label: '−', insert: '-', aria: 'minus' }, { label: 'π', insert: 'pi', aria: 'pi' }, { label: '%', insert: '%', aria: 'percent' }],
  [{ label: '0', insert: '0', aria: '0' }, { label: '.', insert: '.', aria: 'decimal point' }, { label: 'x', insert: 'x', aria: 'x' }, { label: '+', insert: '+', aria: 'plus' }, { label: '<', insert: '<', aria: 'less than' }, { label: '>', insert: '>', aria: 'greater than' }],
];

/** Touch-friendly math keyboard: every key is at least 44 px and has a spoken label. */
export function MathKeyboard({ onInsert, onBackspace, onClear }: { onInsert: (s: string) => void; onBackspace: () => void; onClear: () => void }) {
  return (
    <div class="mathkb" role="group" aria-label={t('kb.label')}>
      {ROWS.map((row, i) => (
        <div class="kbrow" key={i}>
          {row.map((k) => <button type="button" class="key" key={k.label} aria-label={k.aria} onClick={() => onInsert(k.insert)}>{k.label}</button>)}
        </div>
      ))}
      <div class="kbrow">
        <button type="button" class="key wide" aria-label={t('kb.backspace')} onClick={onBackspace}>⌫</button>
        <button type="button" class="key wide" aria-label={t('kb.clear')} onClick={onClear}>{t('kb.clear')}</button>
      </div>
    </div>
  );
}
