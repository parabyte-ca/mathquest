// Math-to-speech: turns text with $...$ (LaTeX) into words a speech engine reads naturally,
// "x squared plus three x", never "x caret two plus three x". English and Canadian French.
import type { Lang } from './items/types.js';

const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const FR_ONES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const FR_TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** Words for 0-99; larger numbers stay as digits (speech engines read those correctly). */
export function numberWords(n: number, lang: Lang): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (lang === 'en') {
    if (n < 20) return EN_ONES[n]!;
    const t = EN_TENS[Math.floor(n / 10)]!;
    return n % 10 ? `${t}-${EN_ONES[n % 10]}` : t;
  }
  if (n < 20) return FR_ONES[n]!;
  if (n < 70) {
    const t = FR_TENS[Math.floor(n / 10)]!;
    const u = n % 10;
    return u === 0 ? t : u === 1 ? `${t} et un` : `${t}-${FR_ONES[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante et onze' : `soixante-${FR_ONES[n - 60]}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${FR_ONES[n - 80]}`;
}

const EN_DENOM: Record<number, [string, string]> = {
  2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'],
  7: ['seventh', 'sevenths'], 8: ['eighth', 'eighths'], 9: ['ninth', 'ninths'], 10: ['tenth', 'tenths'], 11: ['eleventh', 'elevenths'],
  12: ['twelfth', 'twelfths'], 100: ['hundredth', 'hundredths'], 1000: ['thousandth', 'thousandths'],
};
const FR_DENOM: Record<number, [string, string]> = {
  2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'], 6: ['sixième', 'sixièmes'],
  7: ['septième', 'septièmes'], 8: ['huitième', 'huitièmes'], 9: ['neuvième', 'neuvièmes'], 10: ['dixième', 'dixièmes'], 11: ['onzième', 'onzièmes'],
  12: ['douzième', 'douzièmes'], 100: ['centième', 'centièmes'], 1000: ['millième', 'millièmes'],
};

function fractionWords(n: number, d: number, lang: Lang): string {
  const table = lang === 'en' ? EN_DENOM : FR_DENOM;
  const entry = table[d];
  if (!entry) return `${numberWords(n, lang)} ${lang === 'en' ? 'over' : 'sur'} ${numberWords(d, lang)}`;
  return `${numberWords(n, lang)} ${n === 1 ? entry[0] : entry[1]}`;
}

const T = {
  en: { plus: 'plus', minus: 'minus', neg: 'negative', times: 'times', div: 'divided by', eq: 'equals', lt: 'is less than', gt: 'is greater than', le: 'is less than or equal to', ge: 'is greater than or equal to', pct: 'percent', pi: 'pi', sqrt: 'the square root of', sq: 'squared', cube: 'cubed', pow: 'to the power of', point: 'point', and: 'and', quantity: 'the quantity', neq: 'is not equal to', degree: 'degrees', blank: 'blank' },
  fr: { plus: 'plus', minus: 'moins', neg: 'négatif', times: 'fois', div: 'divisé par', eq: 'égale', lt: 'est plus petit que', gt: 'est plus grand que', le: 'est plus petit ou égal à', ge: 'est plus grand ou égal à', pct: 'pour cent', pi: 'pi', sqrt: 'la racine carrée de', sq: 'au carré', cube: 'au cube', pow: 'à la puissance', point: 'virgule', and: 'et', quantity: 'la quantité', neq: 'n\'est pas égal à', degree: 'degrés', blank: 'case vide' },
} as const;

/** Reads the `{...}` group starting at s[i] (s[i] must be '{'); returns [inner, indexAfter]. */
function group(s: string, i: number): [string, number] {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1];
  }
  return [s.slice(i + 1), s.length];
}

export function latexToSpeech(tex: string, lang: Lang): string {
  const t = T[lang];
  const out: string[] = [];
  // Digit groups written 12\,345 (thin space) and French decimals written 3{,}5 must read as numbers, not separate pieces.
  const joined = tex.replace(/(\d)\\,(?=\d{3})/g, '$1').replace(/(\d)\{,\}(\d)/g, '$1.$2');
  const s = joined.replace(/\\left|\\right|\\,|\\;|\\!|\\ /g, ' ').replace(/\\dfrac|\\tfrac/g, '\\frac').replace(/\\cdot/g, '\\times');
  let i = 0;
  let atStart = true; // for "negative" versus "minus"
  const push = (w: string) => w && out.push(w);

  while (i < s.length) {
    const c = s[i]!;
    if (/\s/.test(c)) { i++; continue; }

    if (s.startsWith('\\frac', i)) {
      const [a, j] = group(s, i + 5);
      const [b, k] = group(s, j);
      const na = Number(a), nb = Number(b);
      // a whole number directly before a fraction reads as a mixed number: "two and one third"
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        if (/\d\s*$/.test(s.slice(0, i))) out.push(t.and);
        push(fractionWords(na, nb, lang));
      } else {
        push(`${latexToSpeech(a, lang)} ${lang === 'en' ? 'over' : 'sur'} ${latexToSpeech(b, lang)}`);
      }
      i = k; atStart = false; continue;
    }
    if (s.startsWith('\\text', i)) {
      const [a, j] = group(s, i + 5);
      push(a.trim());
      i = j; continue;
    }
    if (s.startsWith('\\sqrt', i)) {
      const [a, j] = group(s, i + 5);
      push(`${t.sqrt} ${latexToSpeech(a, lang)}`);
      i = j; atStart = false; continue;
    }
    if (c === '^') {
      let a: string; let j: number;
      if (s[i + 1] === '{') [a, j] = group(s, i + 1); else { a = s[i + 1] ?? ''; j = i + 2; }
      a = a.trim();
      if (a === '2') push(t.sq); else if (a === '3') push(t.cube); else push(`${t.pow} ${latexToSpeech(a, lang)}`);
      i = j; continue;
    }
    if (c === '_') { // subscripts: read the subscript plainly
      let a: string; let j: number;
      if (s[i + 1] === '{') [a, j] = group(s, i + 1); else { a = s[i + 1] ?? ''; j = i + 2; }
      push(latexToSpeech(a, lang)); i = j; continue;
    }
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i))!;
      const cmd = m[1]!;
      i += m[0].length;
      const map: Record<string, string> = { times: t.times, div: t.div, pi: t.pi, le: t.le, leq: t.le, ge: t.ge, geq: t.ge, neq: t.neq, ne: t.neq, '%': t.pct, circ: t.degree, '$': '' };
      push(map[cmd] ?? '');
      atStart = false; continue;
    }
    if (/\d/.test(c)) {
      const m = /^\d+(?:\.\d+)?/.exec(s.slice(i))!;
      const num = m[0];
      i += num.length;
      if (num.includes('.')) {
        const [whole, frac] = num.split('.') as [string, string];
        push(`${numberWords(Number(whole), lang)} ${t.point} ${frac.split('').map((d) => numberWords(Number(d), lang)).join(' ')}`);
      } else push(numberWords(Number(num), lang));
      atStart = false; continue;
    }
    if (/[a-zA-Z]/.test(c)) { push(c); i++; atStart = false; continue; }
    switch (c) {
      case '+': push(t.plus); atStart = true; break;
      case '-': case '−': push(atStart ? t.neg : t.minus); atStart = true; break;
      case '*': push(t.times); atStart = true; break;
      case '/': push(t.div); atStart = true; break;
      case '×': push(t.times); atStart = true; break;
      case '÷': push(t.div); atStart = true; break;
      case '=': push(t.eq); atStart = true; break;
      case '<': push(t.lt); atStart = true; break;
      case '>': push(t.gt); atStart = true; break;
      case '≤': push(t.le); atStart = true; break;
      case '≥': push(t.ge); atStart = true; break;
      case '%': push(t.pct); atStart = false; break;
      case '(': push(t.quantity); atStart = true; break;
      case ')': push(','); atStart = false; break;
      case ',': push(','); break;
      case ':': push(lang === 'en' ? 'to' : 'à'); atStart = true; break;
      case '?': push(t.blank); atStart = false; break;
      case '°': push(t.degree); atStart = false; break;
      default: break;
    }
    i++;
  }
  return out.join(' ').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim();
}

/** Reads an amount written with the `\dollar` macro: "twelve dollars and fifty cents", "douze dollars et cinquante cents". */
export function moneyWords(tex: string, lang: Lang): string {
  const amount = tex.replace(/\\dollar\s?/g, '').replace(/\\\s*$/, '').replace(/\\,/g, '').trim();
  const m = /^(\d+)(?:(?:\.|\{,\})(\d{1,2}))?$/.exec(amount);
  if (!m) return `${latexToSpeech(amount, lang)} dollars`;
  const dollars = Number(m[1]);
  const cents = m[2] ? Number(m[2].padEnd(2, '0')) : 0;
  const d = `${numberWords(dollars, lang)} ${dollars === 1 || (lang === 'fr' && dollars === 0) ? 'dollar' : 'dollars'}`;
  if (!cents) return d;
  return `${d} ${lang === 'en' ? 'and' : 'et'} ${numberWords(cents, lang)} ${cents === 1 ? 'cent' : 'cents'}`;
}

/** Speaks a whole learner-facing string: text outside $...$ is kept, math inside is converted. */
export function speakable(text: string, lang: Lang): string {
  return text
    .replace(/\$([^$]+)\$/g, (_m, tex: string) =>
      /\\dollar/.test(tex) ? ` ${moneyWords(tex, lang)} ` : ` ${latexToSpeech(tex, lang)} `,
    )
    .replace(/[*_`#]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
