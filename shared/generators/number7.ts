// Grade 7 Number strand (B): squares and roots, rational numbers, simplest form, order of operations, percent change,
// integers, fractions, GCF and LCM, powers, decimals and proportional reasoning.
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, numGen, r6, type F } from './dsl.js';
import { build, frac, gcd, lcm, t, tex } from './kit.js';

/** A signed number inside a sum or difference: negatives get brackets. */
const sg = (f: F, x: number): string => (x < 0 ? `(${f.n(x)})` : f.n(x));
const SYMS = ['<', '>', '='] as const;
const symOptions: Text[] = SYMS.map((s) => t(tex(s), tex(s)));
const symIdx = (a: number, b: number): number => (Math.abs(a - b) < 1e-9 ? 2 : a < b ? 0 : 1);

/** MS.G7.B1.2.a: perfect squares and square roots */
export const squares7 = numGen('MS.G7.B1.2.a', (tier, r) => {
  if (tier === 1) {
    const k = randInt(r, 2, 12);
    const N = k * k;
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`\\sqrt{${f.n(N)}}`)}?`, `Combien vaut ${f.m(`\\sqrt{${f.n(N)}}`)} ?`)),
      answer: k,
      wrong: [[N / 2, t('It looks like the number was cut in half. The square root is the number that multiplies by itself to make it.', 'Il semble que le nombre a été divisé par deux. La racine carrée est le nombre qui, multiplié par lui-même, donne ce nombre.'), 0]],
      steps: [bi((f) => f.t(`Ask: what number times itself is ${f.N(N)}?`, `Demande-toi : quel nombre multiplié par lui-même donne ${f.N(N)} ?`)), bi((f) => f.t(`${f.N(k)} × ${f.N(k)} = ${f.N(N)}, so the square root is ${f.N(k)}.`, `${f.N(k)} × ${f.N(k)} = ${f.N(N)}, donc la racine carrée est ${f.N(k)}.`))],
      nudge: t('Which number multiplied by itself makes it?', 'Quel nombre multiplié par lui-même donne ce nombre ?'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 13, 20);
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`${f.n(k)}^2`)}?`, `Combien vaut ${f.m(`${f.n(k)}^2`)} ?`)),
      answer: k * k,
      wrong: [[2 * k, t('It looks like the number was doubled. Squaring means multiplying the number by itself.', 'Il semble que le nombre a été doublé. Mettre au carré, c\'est multiplier le nombre par lui-même.'), 0]],
      steps: [t('Squaring means multiplying the number by itself.', 'Mettre au carré, c\'est multiplier le nombre par lui-même.'), bi((f) => f.t(`${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}.`, `${f.N(k)} × ${f.N(k)} = ${f.N(k * k)}.`))],
      nudge: t('Multiply the number by itself.', 'Multiplie le nombre par lui-même.'),
    };
  }
  const k = randInt(r, 3, 15);
  const N = k * k;
  return {
    prompt: bi((f) => f.t(`A square garden has an area of ${f.N(N)} m². What is its perimeter, in metres?`, `Un jardin carré a une aire de ${f.N(N)} m². Quel est son périmètre, en mètres ?`)),
    answer: 4 * k, category: 'AP',
    wrong: [[k, t('That is one side. The perimeter is the distance around all four sides.', 'C\'est un seul côté. Le périmètre est la distance autour des quatre côtés.'), 1], [2 * k, t('It looks like only two sides were added. A square has four equal sides.', 'Il semble que seulement deux côtés ont été additionnés. Un carré a quatre côtés égaux.'), 1]],
    steps: [bi((f) => f.t(`The side is the square root of the area: ${f.m(`\\sqrt{${f.n(N)}}`)} = ${f.N(k)} m.`, `Le côté est la racine carrée de l\'aire : ${f.m(`\\sqrt{${f.n(N)}}`)} = ${f.N(k)} m.`)), bi((f) => f.t(`Perimeter: 4 × ${f.N(k)} = ${f.N(4 * k)} m.`, `Périmètre : 4 × ${f.N(k)} = ${f.N(4 * k)} m.`))],
    nudge: t('Find the length of one side first.', 'Trouve d\'abord la longueur d\'un côté.'),
  };
});

/** MS.G7.B1.3.a: compare rational numbers, including negative fractions and decimals */
export const rational7 = choiceGen('MS.G7.B1.3.a', (tier, r) => {
  let a: number, b: number, ta: (f: F) => string, tb: (f: F) => string;
  if (tier === 1) {
    do { a = -randInt(r, 1, 99) / 10; b = -randInt(r, 1, 99) / 10; } while (a === b);
    ta = (f) => f.n(a); tb = (f) => f.n(b);
  } else if (tier === 2) {
    const d = pick(r, [2, 4, 5, 8]);
    const n = randInt(r, 1, d - 1);
    const exact = n / d;
    const dec = r() < 0.3 ? exact : Math.round((exact + (r() < 0.5 ? -1 : 1) * randInt(r, 1, 9) / 100) * 100) / 100;
    a = -exact; b = -(dec > 0 ? dec : exact);
    ta = () => `-${frac(n, d)}`; tb = (f) => f.n(b);
  } else {
    const d1 = pick(r, [3, 4, 5, 6, 7]);
    let d2 = pick(r, [3, 4, 5, 6, 7, 8]);
    while (d2 === d1) d2 = pick(r, [3, 4, 5, 6, 7, 8]);
    const n1 = randInt(r, 1, d1 - 1);
    const n2 = randInt(r, 1, d2 - 1);
    a = -n1 / d1; b = -n2 / d2;
    ta = () => `-${frac(n1, d1)}`; tb = () => `-${frac(n2, d2)}`;
  }
  const idx = symIdx(a, b);
  const wrongIdx = idx === 2 ? -1 : idx === 0 ? 1 : 0;
  const why: Record<number, Text> = {};
  if (wrongIdx >= 0) why[wrongIdx] = t('It looks like the numbers were compared as if they were positive. Of two negative numbers, the one farther from zero is smaller.', 'Il semble que les nombres ont été comparés comme s\'ils étaient positifs. De deux nombres négatifs, celui qui est le plus loin de zéro est le plus petit.');
  return {
    prompt: bi((f) => f.t(`Which symbol makes this true? ${f.m(`${ta(f)} \\ \\square \\ ${tb(f)}`)}`, `Quel symbole rend cette phrase vraie ? ${f.m(`${ta(f)} \\ \\square \\ ${tb(f)}`)}`)),
    options: symOptions, correct: idx, why,
    steps: [t('Picture both numbers on a number line. The number farther to the left is the smaller one.', 'Imagine les deux nombres sur une droite numérique. Le nombre le plus à gauche est le plus petit.'), bi((f) => f.t(`${f.m(ta(f))} is ${idx === 0 ? 'to the left of' : idx === 1 ? 'to the right of' : 'at the same place as'} ${f.m(tb(f))}, so the symbol is ${SYMS[idx]}.`, `${f.m(ta(f))} est ${idx === 0 ? 'à gauche de' : idx === 1 ? 'à droite de' : 'au même endroit que'} ${f.m(tb(f))}, donc le symbole est ${SYMS[idx]}.`))],
    nudge: t('Which number is closer to zero? With negatives, closer to zero means greater.', 'Quel nombre est le plus proche de zéro ? Avec des nombres négatifs, plus proche de zéro veut dire plus grand.'),
    category: 'KU',
  };
});

/** MS.G7.B1.4.a: simplify fractions */
export const simplify7: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const gMax = tier === 1 ? 5 : tier === 2 ? 9 : 12;
  let n: number, d: number, g: number;
  do { d = randInt(r, 2, 12); n = randInt(r, 1, tier === 3 ? d + 4 : d - 1); } while (gcd(n, d) !== 1 || n === d);
  g = randInt(r, 2, gMax);
  const N = n * g, D = d * g;
  // a partly simplified fraction: divide by the smallest prime factor of g only (when g is not prime)
  const p = [2, 3, 5, 7, 11].find((q) => g % q === 0)!;
  const partial = p !== g ? { answer: { kind: 'fraction' as const, n: N / p, d: D / p }, stepIndex: 1, why: t('It looks like you divided by a common factor, but not the greatest one. Keep dividing until only 1 divides both numbers.', 'Il semble que tu as divisé par un facteur commun, mais pas le plus grand. Continue jusqu\'à ce que seul 1 divise les deux nombres.') } : null;
  return build({
    skill: 'MS.G7.B1.4.a', tier, seed, category: 'KU', format: 'fraction',
    prompt: bi((f) => f.t(`Write ${f.m(frac(f.n(N), f.n(D)))} in simplest form.`, `Écris ${f.m(frac(f.n(N), f.n(D)))} sous forme irréductible.`)),
    answer: { kind: 'fraction', n, d, mustReduce: true },
    steps: [bi((f) => f.t(`Find the greatest number that divides both ${f.N(N)} and ${f.N(D)}: it is ${f.N(g)}.`, `Trouve le plus grand nombre qui divise ${f.N(N)} et ${f.N(D)} : c\'est ${f.N(g)}.`)), bi((f) => f.t(`Divide both by ${f.N(g)}: ${f.m(frac(f.n(n), f.n(d)))}.`, `Divise les deux par ${f.N(g)} : ${f.m(frac(f.n(n), f.n(d)))}.`))],
    nudge: t('Look for a number that divides both the numerator and the denominator.', 'Cherche un nombre qui divise à la fois le numérateur et le dénominateur.'),
    stepHint: t('Find the greatest common factor of the two numbers.', 'Trouve le plus grand facteur commun des deux nombres.'),
    wrong: partial ? [partial] : [],
    praise: t('Nice, both numbers share no more factors.', 'Bravo, les deux nombres n\'ont plus de facteur commun.'),
  });
};

/** MS.G7.B2.1.a: order of operations */
export const orderOps7 = numGen('MS.G7.B2.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), b = randInt(r, 2, 9), c = randInt(r, 2, 9), d = randInt(r, 1, 9);
    const ans = a + b * c - d;
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} + ${f.n(b)} \\times ${f.n(c)} - ${f.n(d)}`)}`),
      answer: ans,
      wrong: [[(a + b) * c - d, t('It looks like the work went left to right. Multiplication comes before addition and subtraction.', 'Il semble que le calcul a été fait de gauche à droite. La multiplication se fait avant l\'addition et la soustraction.'), 0]],
      steps: [bi((f) => f.t(`Multiply first: ${f.N(b)} × ${f.N(c)} = ${f.N(b * c)}.`, `Multiplie d\'abord : ${f.N(b)} × ${f.N(c)} = ${f.N(b * c)}.`)), bi((f) => f.t(`${f.N(a)} + ${f.N(b * c)} − ${f.N(d)} = ${f.N(ans)}.`, `${f.N(a)} + ${f.N(b * c)} − ${f.N(d)} = ${f.N(ans)}.`))],
      nudge: t('Which operation comes first: multiplying or adding?', 'Quelle opération vient en premier : multiplier ou additionner ?'),
    };
  }
  if (tier === 2) {
    let a: number, b: number, c: number, d: number;
    do { a = randInt(r, 1, 6); b = randInt(r, 1, 6); c = randInt(r, 2, 6); d = randInt(r, 2, 6); } while ((a + b) ** 2 - c * d < 1);
    const ans = (a + b) ** 2 - c * d;
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`(${f.n(a)} + ${f.n(b)})^2 - ${f.n(c)} \\times ${f.n(d)}`)}`),
      answer: ans,
      wrong: [[a + b * b - c * d, t('It looks like the exponent was used on the last number only. The exponent applies to everything inside the brackets.', 'Il semble que l\'exposant a été appliqué au dernier nombre seulement. L\'exposant s\'applique à tout ce qui est dans les parenthèses.'), 0]],
      steps: [bi((f) => f.t(`Brackets first: ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}. Then the exponent: ${f.N(a + b)}² = ${f.N((a + b) ** 2)}.`, `Parenthèses d\'abord : ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}. Puis l\'exposant : ${f.N(a + b)}² = ${f.N((a + b) ** 2)}.`)), bi((f) => f.t(`Multiply: ${f.N(c)} × ${f.N(d)} = ${f.N(c * d)}. Then subtract: ${f.N((a + b) ** 2)} − ${f.N(c * d)} = ${f.N(ans)}.`, `Multiplie : ${f.N(c)} × ${f.N(d)} = ${f.N(c * d)}. Puis soustrais : ${f.N((a + b) ** 2)} − ${f.N(c * d)} = ${f.N(ans)}.`))],
      nudge: t('Work in the order: brackets, exponents, then multiply and divide, then add and subtract.', 'Suis l\'ordre : parenthèses, exposants, puis multiplication et division, puis addition et soustraction.'),
    };
  }
  let a: number, b: number, c: number, d: number, e: number, q: number;
  do { e = randInt(r, 2, 6); q = randInt(r, 2, 9); b = randInt(r, 2, 9); c = randInt(r, 2, 9); d = b * c - e * q; a = randInt(r, 2, 12); } while (d < 1 || d >= b * c);
  const ans = a + q;
  return {
    prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} + (${f.n(b)} \\times ${f.n(c)} - ${f.n(d)}) \\div ${f.n(e)}`)}`),
    answer: ans,
    wrong: [[r6(a + b * c - d / e), t('It looks like only the last number in the brackets was divided. Finish everything inside the brackets first, then divide.', 'Il semble que seul le dernier nombre des parenthèses a été divisé. Termine d\'abord tout ce qui est dans les parenthèses, puis divise.'), 0]],
    steps: [bi((f) => f.t(`Inside the brackets: ${f.N(b)} × ${f.N(c)} = ${f.N(b * c)}, then ${f.N(b * c)} − ${f.N(d)} = ${f.N(e * q)}.`, `Dans les parenthèses : ${f.N(b)} × ${f.N(c)} = ${f.N(b * c)}, puis ${f.N(b * c)} − ${f.N(d)} = ${f.N(e * q)}.`)), bi((f) => f.t(`Divide: ${f.N(e * q)} ÷ ${f.N(e)} = ${f.N(q)}. Then add: ${f.N(a)} + ${f.N(q)} = ${f.N(ans)}.`, `Divise : ${f.N(e * q)} ÷ ${f.N(e)} = ${f.N(q)}. Puis additionne : ${f.N(a)} + ${f.N(q)} = ${f.N(ans)}.`))],
    nudge: t('Do everything inside the brackets first.', 'Fais d\'abord tout ce qui est dans les parenthèses.'),
  };
});

/** MS.G7.B2.3.a: mental math to increase or decrease a number by 1%, 5%, 10%, 25%, 50%, 100% */
export const percentChange7 = numGen('MS.G7.B2.3.a', (tier, r) => {
  const up = r() < 0.5;
  const pcts = tier === 1 ? [10, 50, 100] : tier === 2 ? [5, 10, 25] : [1, 5, 25];
  const p = pick(r, pcts);
  const base = tier === 3 ? 100 * randInt(r, 2, 15) : 20 * randInt(r, 2, 20);
  const change = (base * p) / 100;
  const ans = up ? base + change : base - change;
  const story = tier === 3;
  return {
    prompt: story
      ? bi((f) => (up ? f.t(`A bike costs ${f.D(base)}. The price goes up by ${f.N(p)}%. What is the new price, in dollars?`, `Un vélo coûte ${f.D(base)}. Le prix augmente de ${f.N(p)} %. Quel est le nouveau prix, en dollars ?`) : f.t(`A bike costs ${f.D(base)}. It is on sale for ${f.N(p)}% off. What is the sale price, in dollars?`, `Un vélo coûte ${f.D(base)}. Il est en solde à ${f.N(p)} % de rabais. Quel est le prix de solde, en dollars ?`)))
      : bi((f) => (up ? f.t(`Increase ${f.N(base)} by ${f.N(p)}%.`, `Augmente ${f.N(base)} de ${f.N(p)} %.`) : f.t(`Decrease ${f.N(base)} by ${f.N(p)}%.`, `Diminue ${f.N(base)} de ${f.N(p)} %.`))),
    answer: ans, category: story ? 'AP' : 'KU',
    wrong: [[change, t('That is only the amount of the change. Add it to (or subtract it from) the original number.', 'C\'est seulement le montant du changement. Additionne-le au nombre de départ (ou soustrais-le).'), 1]],
    steps: [bi((f) => f.t(`${f.N(p)}% of ${f.N(base)} is ${f.N(change)} (${p === 1 ? 'divide by 100' : p === 5 ? 'find 10% and halve it' : p === 10 ? 'divide by 10' : p === 25 ? 'find half of a half' : p === 50 ? 'halve it' : 'it is the whole number'}).`, `${f.N(p)} % de ${f.N(base)} égale ${f.N(change)} (${p === 1 ? 'divise par 100' : p === 5 ? 'trouve 10 % et prends la moitié' : p === 10 ? 'divise par 10' : p === 25 ? 'prends la moitié de la moitié' : p === 50 ? 'prends la moitié' : 'c\'est le nombre entier'}).`)), bi((f) => f.t(`${f.N(base)} ${up ? '+' : '−'} ${f.N(change)} = ${f.N(ans)}.`, `${f.N(base)} ${up ? '+' : '−'} ${f.N(change)} = ${f.N(ans)}.`))],
    nudge: t('Find the percent of the number first, then add or subtract it.', 'Trouve d\'abord le pourcentage du nombre, puis additionne ou soustrais.'),
  };
});

/** MS.G7.B2.4.a: add and subtract integers */
export const intAddSub7 = numGen('MS.G7.B2.4.a', (tier, r) => {
  if (tier === 1) {
    let a: number, b: number;
    do { a = randInt(r, -12, 12); b = randInt(r, -12, 12); } while (a === 0 || b === 0 || (a > 0) === (b > 0));
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} + ${sg(f, b)}`)}`),
      answer: a + b,
      wrong: [[Math.sign(a) * (Math.abs(a) + Math.abs(b)), t('It looks like the sizes were added. When the signs are different, subtract the sizes and keep the sign of the larger one.', 'Il semble que les grandeurs ont été additionnées. Quand les signes sont différents, soustrais les grandeurs et garde le signe de la plus grande.'), 0]],
      steps: [t('The signs are different, so subtract the sizes: the larger size minus the smaller.', 'Les signes sont différents : soustrais les grandeurs, la plus grande moins la plus petite.'), bi((f) => f.t(`${f.N(Math.max(Math.abs(a), Math.abs(b)))} − ${f.N(Math.min(Math.abs(a), Math.abs(b)))} = ${f.N(Math.abs(a + b))}, and the larger size is ${Math.abs(a) > Math.abs(b) ? f.n(a) : f.n(b)}, so the answer is ${f.N(a + b)}.`, `${f.N(Math.max(Math.abs(a), Math.abs(b)))} − ${f.N(Math.min(Math.abs(a), Math.abs(b)))} = ${f.N(Math.abs(a + b))}, et la plus grande grandeur est ${Math.abs(a) > Math.abs(b) ? f.n(a) : f.n(b)}, donc la réponse est ${f.N(a + b)}.`))],
      nudge: t('Picture a number line: start at the first number and move by the second.', 'Imagine une droite numérique : pars du premier nombre et déplace-toi du deuxième.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, -12, 12);
    const b = -randInt(r, 1, 12);
    return {
      prompt: bi((f) => `${f.t('Calculate', 'Calcule')} ${f.m(`${f.n(a)} - ${sg(f, b)}`)}`),
      answer: a - b,
      wrong: [[a + b, t('It looks like subtracting a negative was treated as subtracting a positive. Subtracting a negative number is the same as adding its opposite.', 'Il semble que soustraire un nombre négatif a été traité comme soustraire un nombre positif. Soustraire un nombre négatif revient à additionner son opposé.'), 0]],
      steps: [bi((f) => f.t(`Subtracting ${f.N(b)} is the same as adding ${f.N(-b)}.`, `Soustraire ${f.N(b)} revient à additionner ${f.N(-b)}.`)), bi((f) => f.t(`${f.N(a)} + ${f.N(-b)} = ${f.N(a - b)}.`, `${f.N(a)} + ${f.N(-b)} = ${f.N(a - b)}.`))],
      nudge: t('Subtracting a negative number is the same as adding a positive number.', 'Soustraire un nombre négatif revient à additionner un nombre positif.'),
    };
  }
  const start = randInt(r, -9, 9), drop = randInt(r, 5, 15), rise = randInt(r, 3, 12);
  const ans = start - drop + rise;
  return {
    prompt: bi((f) => f.t(`The temperature at dawn was ${f.N(start)} °C. It dropped ${f.N(drop)} degrees by noon, then rose ${f.N(rise)} degrees by evening. What was the evening temperature, in °C?`, `La température à l\'aube était de ${f.N(start)} °C. Elle a baissé de ${f.N(drop)} degrés à midi, puis a monté de ${f.N(rise)} degrés en soirée. Quelle était la température en soirée, en °C ?`)),
    answer: ans, category: 'AP',
    wrong: [[start + drop + rise, t('It looks like the drop was added. A drop makes the temperature lower, so subtract it.', 'Il semble que la baisse a été additionnée. Une baisse diminue la température : soustrais-la.'), 0]],
    steps: [bi((f) => f.t(`After the drop: ${f.N(start)} − ${f.N(drop)} = ${f.N(start - drop)}.`, `Après la baisse : ${f.N(start)} − ${f.N(drop)} = ${f.N(start - drop)}.`)), bi((f) => f.t(`After the rise: ${f.N(start - drop)} + ${f.N(rise)} = ${f.N(ans)}.`, `Après la hausse : ${f.N(start - drop)} + ${f.N(rise)} = ${f.N(ans)}.`))],
    nudge: t('Do the drop and the rise one at a time, in order.', 'Fais la baisse et la hausse une à la fois, dans l\'ordre.'),
  };
});

const pairFrac = (n: number, d: number): { n: number; d: number } => { const g = gcd(n, d); return { n: n / g, d: d / g }; };

/** MS.G7.B2.5.a: add and subtract fractions with unlike denominators, including mixed numbers */
export const addSubFrac7: Generator = (tier, seed) => {
  const r = makeRng(seed);
  for (let tries = 0; tries < 200; tries++) {
    const sub = r() < 0.5;
    let d1: number, d2: number;
    if (tier === 1) { d1 = pick(r, [2, 3, 4, 5]); d2 = d1 * pick(r, [2, 3]); if (r() < 0.5) [d1, d2] = [d2, d1]; }
    else { d1 = pick(r, [3, 4, 5, 6, 8]); d2 = pick(r, [3, 4, 5, 6, 8, 9]); if (d1 === d2 || (tier === 2 && (d1 % d2 === 0 || d2 % d1 === 0))) continue; }
    const w1 = tier === 3 ? randInt(r, 1, 4) : 0, w2 = tier === 3 ? randInt(r, 1, 3) : 0;
    const n1 = randInt(r, 1, d1 - 1), n2 = randInt(r, 1, d2 - 1);
    const L = lcm(d1, d2);
    const v1 = w1 * L + n1 * (L / d1), v2 = w2 * L + n2 * (L / d2);
    if (sub && v1 <= v2) continue;
    const num = sub ? v1 - v2 : v1 + v2;
    const res = pairFrac(num, L);
    if (res.d === 1) continue;
    const showA = (f: F): string => (w1 ? `${f.n(w1)}${frac(f.n(n1), f.n(d1))}` : frac(f.n(n1), f.n(d1)));
    const showB = (f: F): string => (w2 ? `${f.n(w2)}${frac(f.n(n2), f.n(d2))}` : frac(f.n(n2), f.n(d2)));
    const naive = pairFrac(sub ? Math.abs(n1 - n2) : n1 + n2, d1 + d2);
    return build({
      skill: 'MS.G7.B2.5.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`${sub ? 'Subtract' : 'Add'} ${f.m(`${showA(f)} ${sub ? '-' : '+'} ${showB(f)}`)}. Write the answer as a fraction in simplest form (it can be greater than 1).`, `${sub ? 'Soustrais' : 'Additionne'} ${f.m(`${showA(f)} ${sub ? '-' : '+'} ${showB(f)}`)}. Écris la réponse sous forme de fraction irréductible (elle peut être plus grande que 1).`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`Use a common denominator: ${f.N(L)}. Write each number as a fraction over ${f.N(L)}${w1 || w2 ? ' (change mixed numbers to improper fractions first)' : ''}: ${f.m(`${frac(f.n(v1), f.n(L))} ${sub ? '-' : '+'} ${frac(f.n(v2), f.n(L))}`)}.`, `Utilise un dénominateur commun : ${f.N(L)}. Écris chaque nombre comme une fraction sur ${f.N(L)}${w1 || w2 ? ' (transforme d\'abord les nombres fractionnaires en fractions impropres)' : ''} : ${f.m(`${frac(f.n(v1), f.n(L))} ${sub ? '-' : '+'} ${frac(f.n(v2), f.n(L))}`)}.`)), bi((f) => f.t(`${sub ? 'Subtract' : 'Add'} the numerators: ${f.m(frac(f.n(num), f.n(L)))}, which simplifies to ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `${sub ? 'Soustrais' : 'Additionne'} les numérateurs : ${f.m(frac(f.n(num), f.n(L)))}, qui se simplifie en ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: t('Make the denominators the same before you add or subtract.', 'Rends les dénominateurs identiques avant d\'additionner ou de soustraire.'),
      stepHint: t('Find a common denominator and rewrite both fractions.', 'Trouve un dénominateur commun et réécris les deux fractions.'),
      wrong: !w1 && !w2 ? [{ answer: { kind: 'fraction', n: naive.n, d: naive.d }, stepIndex: 0, why: t('It looks like the numerators and the denominators were each added or subtracted. Rewrite with a common denominator first, then work with the numerators only.', 'Il semble que les numérateurs et les dénominateurs ont chacun été additionnés ou soustraits. Réécris d\'abord avec un dénominateur commun, puis travaille seulement avec les numérateurs.') }] : [],
    });
  }
  throw new Error('addSubFrac7: no item found');
};

/** MS.G7.B2.6.a: greatest common factor (numbers up to 144) */
export const gcf7 = numGen('MS.G7.B2.6.a', (tier, r) => {
  const max = tier === 1 ? 36 : tier === 2 ? 100 : 144;
  let g: number, p: number, q: number;
  do { g = randInt(r, 2, tier === 1 ? 6 : 12); p = randInt(r, 2, 12); q = randInt(r, 2, 12); } while (p === q || gcd(p, q) !== 1 || g * p > max || g * q > max);
  const a = g * p, b = g * q;
  const story = tier === 3;
  return {
    prompt: story
      ? bi((f) => f.t(`A baker has ${f.N(a)} muffins and ${f.N(b)} cookies. She makes identical boxes with no food left over. What is the greatest number of boxes she can make?`, `Une boulangère a ${f.N(a)} muffins et ${f.N(b)} biscuits. Elle fait des boîtes identiques sans rien laisser de côté. Quel est le plus grand nombre de boîtes possible ?`))
      : bi((f) => f.t(`What is the greatest common factor of ${f.N(a)} and ${f.N(b)}?`, `Quel est le plus grand facteur commun de ${f.N(a)} et ${f.N(b)} ?`)),
    answer: g, category: story ? 'AP' : 'KU',
    wrong: [[lcm(a, b), t('That is a common multiple. The greatest common factor is the largest number that divides both.', 'C\'est un multiple commun. Le plus grand facteur commun est le plus grand nombre qui divise les deux.'), 0], ...([2, 3, 5, 7].some((x) => x < g && g % x === 0) ? ([[[2, 3, 5, 7].find((x) => x < g && g % x === 0)!, t('That is a common factor, but not the greatest one. Look for a bigger one.', 'C\'est un facteur commun, mais pas le plus grand. Cherches-en un plus grand.'), 1]] as [number, Text, number][]) : [])],
    steps: [bi((f) => f.t(`List or find the factors both numbers share. ${f.N(a)} = ${f.N(g)} × ${f.N(p)} and ${f.N(b)} = ${f.N(g)} × ${f.N(q)}.`, `Trouve les facteurs que les deux nombres ont en commun. ${f.N(a)} = ${f.N(g)} × ${f.N(p)} et ${f.N(b)} = ${f.N(g)} × ${f.N(q)}.`)), bi((f) => f.t(`${f.N(p)} and ${f.N(q)} share no factor but 1, so the greatest common factor is ${f.N(g)}.`, `${f.N(p)} et ${f.N(q)} n\'ont que 1 comme facteur commun, donc le plus grand facteur commun est ${f.N(g)}.`))],
    nudge: t('Find the largest number that divides both numbers with no remainder.', 'Trouve le plus grand nombre qui divise les deux nombres sans reste.'),
  };
});

/** MS.G7.B2.6.b: least common multiple of two and three numbers */
export const lcm7 = numGen('MS.G7.B2.6.b', (tier, r) => {
  if (tier === 3) {
    let a: number, b: number, c: number;
    do { a = pick(r, [2, 3, 4, 5, 6, 8, 9, 10, 12]); b = pick(r, [2, 3, 4, 5, 6, 8, 9, 10, 12]); c = pick(r, [2, 3, 4, 5, 6, 8, 9, 10, 12]); } while (a === b || b === c || a === c || lcm(lcm(a, b), c) > 120);
    const ans = lcm(lcm(a, b), c);
    return {
      prompt: bi((f) => f.t(`What is the least common multiple of ${f.N(a)}, ${f.N(b)} and ${f.N(c)}?`, `Quel est le plus petit multiple commun de ${f.N(a)}, ${f.N(b)} et ${f.N(c)} ?`)),
      answer: ans,
      wrong: [[a * b * c, t('A product of all the numbers is a common multiple, but usually not the least one. Look for a smaller one.', 'Le produit de tous les nombres est un multiple commun, mais pas souvent le plus petit. Cherches-en un plus petit.'), 0]],
      steps: [bi((f) => f.t(`Find the LCM of ${f.N(a)} and ${f.N(b)}: ${f.N(lcm(a, b))}.`, `Trouve le PPMC de ${f.N(a)} et ${f.N(b)} : ${f.N(lcm(a, b))}.`)), bi((f) => f.t(`Then the LCM of ${f.N(lcm(a, b))} and ${f.N(c)}: ${f.N(ans)}.`, `Puis le PPMC de ${f.N(lcm(a, b))} et ${f.N(c)} : ${f.N(ans)}.`))],
      nudge: t('Find the least common multiple of two numbers first, then bring in the third.', 'Trouve d\'abord le plus petit multiple commun de deux nombres, puis ajoute le troisième.'),
    };
  }
  let a: number, b: number;
  do { a = randInt(r, 2, tier === 1 ? 8 : 12); b = randInt(r, 2, tier === 1 ? 8 : 12); } while (a === b || lcm(a, b) > (tier === 1 ? 40 : 84));
  const ans = lcm(a, b);
  const story = tier === 2;
  return {
    prompt: story
      ? bi((f) => f.t(`One bus comes every ${f.N(a)} minutes and another every ${f.N(b)} minutes. They are together now. In how many minutes will they next be together?`, `Un autobus passe aux ${f.N(a)} minutes et un autre aux ${f.N(b)} minutes. Ils sont ensemble en ce moment. Dans combien de minutes seront-ils de nouveau ensemble ?`))
      : bi((f) => f.t(`What is the least common multiple of ${f.N(a)} and ${f.N(b)}?`, `Quel est le plus petit multiple commun de ${f.N(a)} et ${f.N(b)} ?`)),
    answer: ans, category: story ? 'AP' : 'KU',
    wrong: gcd(a, b) > 1 ? [[a * b, t('The product is a common multiple, but not the least one. Look for a smaller one.', 'Le produit est un multiple commun, mais pas le plus petit. Cherches-en un plus petit.'), 0]] : [],
    steps: [bi((f) => f.t(`List multiples of ${f.N(Math.max(a, b))}: ${f.N(Math.max(a, b))}, ${f.N(2 * Math.max(a, b))}, ...`, `Écris des multiples de ${f.N(Math.max(a, b))} : ${f.N(Math.max(a, b))}, ${f.N(2 * Math.max(a, b))}, ...`)), bi((f) => f.t(`The first one that ${f.N(Math.min(a, b))} also divides is ${f.N(ans)}.`, `Le premier que ${f.N(Math.min(a, b))} divise aussi est ${f.N(ans)}.`))],
    nudge: t('List multiples of the larger number until the smaller one divides it.', 'Écris les multiples du plus grand nombre jusqu\'à ce que le plus petit le divise.'),
  };
});

/** MS.G7.B2.7.a: exponential notation */
export const exponent7 = numGen('MS.G7.B2.7.a', (tier, r) => {
  if (tier === 1) {
    const b = pick(r, [2, 3, 4, 5, 10]);
    const n = b === 10 ? randInt(r, 2, 4) : b === 2 ? randInt(r, 2, 6) : randInt(r, 2, 3);
    return {
      prompt: bi((f) => f.t(`What is ${f.m(`${f.n(b)}^{${f.n(n)}}`)}?`, `Combien vaut ${f.m(`${f.n(b)}^{${f.n(n)}}`)} ?`)),
      answer: b ** n,
      wrong: [[b * n, t('It looks like the base was multiplied by the exponent. The exponent tells how many times the base is used as a factor.', 'Il semble que la base a été multipliée par l\'exposant. L\'exposant indique combien de fois la base est utilisée comme facteur.'), 0]],
      steps: [bi((f) => f.t(`The exponent ${f.N(n)} means ${f.N(b)} is used ${f.N(n)} times as a factor: ${Array(n).fill(f.n(b)).join(' × ')}.`, `L\'exposant ${f.N(n)} veut dire que ${f.N(b)} est utilisé ${f.N(n)} fois comme facteur : ${Array(n).fill(f.n(b)).join(' × ')}.`)), bi((f) => f.t(`That equals ${f.N(b ** n)}.`, `Cela égale ${f.N(b ** n)}.`))],
      nudge: t('How many times is the base multiplied by itself?', 'Combien de fois la base est-elle multipliée par elle-même ?'),
    };
  }
  if (tier === 2) {
    const b = randInt(r, 2, 9), n = randInt(r, 3, 6);
    return {
      prompt: bi((f) => f.t(`${f.m(Array(n).fill(f.n(b)).join(' \\times '))} is written as ${f.m(`${f.n(b)}^{\\square}`)}. What is the missing exponent?`, `${f.m(Array(n).fill(f.n(b)).join(' \\times '))} s\'écrit ${f.m(`${f.n(b)}^{\\square}`)}. Quel est l\'exposant manquant ?`)),
      answer: n,
      wrong: [[n - 1, t('It looks like one factor was missed. Count every ' + b + ' in the product.', 'Il semble qu\'un facteur a été oublié. Compte chaque ' + b + ' dans le produit.'), 0]],
      steps: [bi((f) => f.t(`Count how many times ${f.N(b)} is a factor: ${f.N(n)}.`, `Compte combien de fois ${f.N(b)} est un facteur : ${f.N(n)}.`)), bi((f) => f.t(`So the product is ${f.m(`${f.n(b)}^{${f.n(n)}}`)}.`, `Donc le produit est ${f.m(`${f.n(b)}^{${f.n(n)}}`)}.`))],
      nudge: t('Count the factors.', 'Compte les facteurs.'),
    };
  }
  const b = randInt(r, 2, 4), n = randInt(r, 2, 5);
  const ans = (-b) ** n;
  return {
    prompt: bi((f) => f.t(`What is ${f.m(`(${f.n(-b)})^{${f.n(n)}}`)}?`, `Combien vaut ${f.m(`(${f.n(-b)})^{${f.n(n)}}`)} ?`)),
    answer: ans,
    wrong: [[-ans, t('It looks like the sign went wrong. An even number of negative factors gives a positive answer; an odd number gives a negative one.', 'Il semble que le signe est erroné. Un nombre pair de facteurs négatifs donne une réponse positive ; un nombre impair en donne une négative.'), 1]],
    steps: [bi((f) => f.t(`Multiply ${f.N(-b)} by itself ${f.N(n)} times. The size is ${f.N(b ** n)}.`, `Multiplie ${f.N(-b)} par lui-même ${f.N(n)} fois. La grandeur est ${f.N(b ** n)}.`)), bi((f) => f.t(`There are ${f.N(n)} negative factors, which is ${n % 2 === 0 ? 'even, so the answer is positive' : 'odd, so the answer is negative'}: ${f.N(ans)}.`, `Il y a ${f.N(n)} facteurs négatifs, ce qui est ${n % 2 === 0 ? 'pair, donc la réponse est positive' : 'impair, donc la réponse est négative'} : ${f.N(ans)}.`))],
    nudge: t('Is the number of negative factors even or odd?', 'Le nombre de facteurs négatifs est-il pair ou impair ?'),
  };
});

/** MS.G7.B2.8.a: multiply fractions by fractions */
export const mulFrac7: Generator = (tier, seed) => {
  const r = makeRng(seed);
  for (let tries = 0; tries < 300; tries++) {
    const d1 = randInt(r, 2, tier === 1 ? 6 : 9), d2 = randInt(r, 2, tier === 1 ? 6 : 9);
    const w = tier === 3 ? randInt(r, 1, 3) : 0;
    const n1 = randInt(r, 1, d1 - 1), n2 = randInt(r, 1, d2 - 1);
    const A = w * d1 + n1;
    const res = pairFrac(A * n2, d1 * d2);
    if (res.d === 1) continue;
    const showA = (f: F): string => (w ? `${f.n(w)}${frac(f.n(n1), f.n(d1))}` : frac(f.n(n1), f.n(d1)));
    const wrongN = pairFrac(A * n2, d1);
    return build({
      skill: 'MS.G7.B2.8.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Multiply ${f.m(`${showA(f)} \\times ${frac(f.n(n2), f.n(d2))}`)}. Write the answer as a fraction in simplest form.`, `Multiplie ${f.m(`${showA(f)} \\times ${frac(f.n(n2), f.n(d2))}`)}. Écris la réponse sous forme de fraction irréductible.`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`${w ? `Change the mixed number to ${f.m(frac(f.n(A), f.n(d1)))}. Then m` : 'M'}ultiply the numerators and multiply the denominators: ${f.m(frac(`${f.n(A)} \\times ${f.n(n2)}`, `${f.n(d1)} \\times ${f.n(d2)}`))}.`, `${w ? `Transforme le nombre fractionnaire en ${f.m(frac(f.n(A), f.n(d1)))}. Puis m` : 'M'}ultiplie les numérateurs et multiplie les dénominateurs : ${f.m(frac(`${f.n(A)} \\times ${f.n(n2)}`, `${f.n(d1)} \\times ${f.n(d2)}`))}.`)), bi((f) => f.t(`${f.m(frac(f.n(A * n2), f.n(d1 * d2)))} simplifies to ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `${f.m(frac(f.n(A * n2), f.n(d1 * d2)))} se simplifie en ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: t('Multiply straight across: numerator times numerator, denominator times denominator.', 'Multiplie en ligne droite : numérateur par numérateur, dénominateur par dénominateur.'),
      stepHint: t('Multiply the numerators, then multiply the denominators.', 'Multiplie les numérateurs, puis multiplie les dénominateurs.'),
      wrong: [{ answer: { kind: 'fraction', n: wrongN.n, d: wrongN.d }, stepIndex: 0, why: t('It looks like the denominator was kept, as in addition. When multiplying, multiply the denominators too.', 'Il semble que le dénominateur a été gardé, comme dans une addition. En multipliant, multiplie aussi les dénominateurs.') }],
    });
  }
  throw new Error('mulFrac7: no item found');
};

/** MS.G7.B2.8.b: divide fractions by fractions */
export const divFrac7: Generator = (tier, seed) => {
  const r = makeRng(seed);
  if (tier === 3) {
    const c = randInt(r, 1, 3), d = pick(r, [2, 3, 4, 5, 6]);
    const k = randInt(r, 2, 9);
    const tot = pairFrac(k * c, d);
    const cd = pairFrac(c, d);
    return numGen('MS.G7.B2.8.b', () => ({
      prompt: bi((f) => f.t(`A recipe uses ${f.m(frac(f.n(cd.n), f.n(cd.d)))} cup of rice per serving. How many servings can be made from ${f.m(frac(f.n(tot.n), f.n(tot.d)))} cups of rice?`, `Une recette utilise ${f.m(frac(f.n(cd.n), f.n(cd.d)))} tasse de riz par portion. Combien de portions peut-on faire avec ${f.m(frac(f.n(tot.n), f.n(tot.d)))} tasses de riz ?`)),
      answer: k, category: 'AP' as const,
      wrong: [[r6((tot.n / tot.d) * (cd.n / cd.d)), t('It looks like the amounts were multiplied. Asking "how many fit" is a division.', 'Il semble que les quantités ont été multipliées. Demander « combien y en a-t-il » est une division.'), 0]] as [number, Text, number][],
      steps: [bi((f) => f.t(`Divide the total by the amount per serving: ${f.m(`${frac(f.n(tot.n), f.n(tot.d))} \\div ${frac(f.n(cd.n), f.n(cd.d))}`)}.`, `Divise le total par la quantité par portion : ${f.m(`${frac(f.n(tot.n), f.n(tot.d))} \\div ${frac(f.n(cd.n), f.n(cd.d))}`)}.`)), bi((f) => f.t(`Multiply by the reciprocal: ${f.m(`${frac(f.n(tot.n), f.n(tot.d))} \\times ${frac(f.n(cd.d), f.n(cd.n))}`)} = ${f.N(k)}.`, `Multiplie par l\'inverse : ${f.m(`${frac(f.n(tot.n), f.n(tot.d))} \\times ${frac(f.n(cd.d), f.n(cd.n))}`)} = ${f.N(k)}.`))],
      nudge: t('To divide by a fraction, multiply by its reciprocal.', 'Pour diviser par une fraction, multiplie par son inverse.'),
    }))(tier, seed);
  }
  for (let tries = 0; tries < 300; tries++) {
    const d1 = randInt(r, 2, tier === 1 ? 6 : 9), d2 = randInt(r, 2, tier === 1 ? 6 : 9);
    const n1 = randInt(r, 1, d1 - 1), n2 = randInt(r, 1, d2 - 1);
    if (n1 * d2 === d1 * n2) continue;
    const res = pairFrac(n1 * d2, d1 * n2);
    if (res.d === 1) continue;
    const noFlip = pairFrac(n1 * n2, d1 * d2);
    const flipFirst = pairFrac(d1 * n2, n1 * d2);
    return build({
      skill: 'MS.G7.B2.8.b', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Divide ${f.m(`${frac(f.n(n1), f.n(d1))} \\div ${frac(f.n(n2), f.n(d2))}`)}. Write the answer as a fraction in simplest form.`, `Divise ${f.m(`${frac(f.n(n1), f.n(d1))} \\div ${frac(f.n(n2), f.n(d2))}`)}. Écris la réponse sous forme de fraction irréductible.`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`Flip the second fraction and multiply: ${f.m(`${frac(f.n(n1), f.n(d1))} \\times ${frac(f.n(d2), f.n(n2))}`)}.`, `Retourne la deuxième fraction et multiplie : ${f.m(`${frac(f.n(n1), f.n(d1))} \\times ${frac(f.n(d2), f.n(n2))}`)}.`)), bi((f) => f.t(`${f.m(frac(f.n(n1 * d2), f.n(d1 * n2)))} simplifies to ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `${f.m(frac(f.n(n1 * d2), f.n(d1 * n2)))} se simplifie en ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: t('Dividing by a fraction is the same as multiplying by its reciprocal.', 'Diviser par une fraction revient à multiplier par son inverse.'),
      stepHint: t('Flip the second fraction, then multiply.', 'Retourne la deuxième fraction, puis multiplie.'),
      wrong: [
        { answer: { kind: 'fraction', n: noFlip.n, d: noFlip.d }, stepIndex: 0, why: t('It looks like the second fraction was not flipped. Flip it (use its reciprocal) before multiplying.', 'Il semble que la deuxième fraction n\'a pas été retournée. Retourne-la (utilise son inverse) avant de multiplier.') },
        { answer: { kind: 'fraction', n: flipFirst.n, d: flipFirst.d }, stepIndex: 0, why: t('It looks like the first fraction was flipped. Keep the first fraction and flip the second.', 'Il semble que la première fraction a été retournée. Garde la première fraction et retourne la deuxième.') },
      ],
    });
  }
  throw new Error('divFrac7: no item found');
};

/** MS.G7.B2.9.a: multiply and divide decimals by decimals */
export const decimals7 = numGen('MS.G7.B2.9.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9) / 10, b = randInt(r, 2, 9) / 10;
    const ans = r6(a * b);
    return {
      prompt: bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${f.n(a)} \\times ${f.n(b)}`)}`),
      answer: ans,
      wrong: [[r6(ans * 10), t('It looks like the decimal point was placed one place too far right. Count the decimal places in both factors: together they give the places in the answer.', 'Il semble que la virgule est une position trop à droite. Compte les décimales des deux facteurs : ensemble, elles donnent les décimales de la réponse.'), 1]],
      steps: [bi((f) => f.t(`Multiply as whole numbers: ${f.N(a * 10)} × ${f.N(b * 10)} = ${f.N(a * 10 * b * 10)}.`, `Multiplie comme des nombres entiers : ${f.N(a * 10)} × ${f.N(b * 10)} = ${f.N(a * 10 * b * 10)}.`)), bi((f) => f.t(`There are 2 decimal places in total, so the answer is ${f.N(ans)}.`, `Il y a 2 décimales en tout, donc la réponse est ${f.N(ans)}.`))],
      nudge: t('Multiply as if there were no decimal points, then count the decimal places.', 'Multiplie comme s\'il n\'y avait pas de virgules, puis compte les décimales.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 12, 99) / 10, b = randInt(r, 12, 99) / 100;
    const ans = r6(a * b);
    return {
      prompt: bi((f) => `${f.t('Multiply', 'Multiplie')} ${f.m(`${f.n(a)} \\times ${f.n(b)}`)}`),
      answer: ans,
      wrong: [[r6(ans * 10), t('It looks like the decimal point was placed one place too far right. Count 1 place in the first factor and 2 in the second: 3 places in the answer.', 'Il semble que la virgule est une position trop à droite. Compte 1 décimale dans le premier facteur et 2 dans le deuxième : 3 décimales dans la réponse.'), 1]],
      steps: [bi((f) => f.t(`Multiply as whole numbers: ${f.N(Math.round(a * 10))} × ${f.N(Math.round(b * 100))} = ${f.N(Math.round(a * 10) * Math.round(b * 100))}.`, `Multiplie comme des nombres entiers : ${f.N(Math.round(a * 10))} × ${f.N(Math.round(b * 100))} = ${f.N(Math.round(a * 10) * Math.round(b * 100))}.`)), bi((f) => f.t(`1 + 2 = 3 decimal places, so the answer is ${f.N(ans)}.`, `1 + 2 = 3 décimales, donc la réponse est ${f.N(ans)}.`))],
      nudge: t('Multiply as whole numbers, then place the decimal point using the total number of decimal places.', 'Multiplie comme des nombres entiers, puis place la virgule selon le nombre total de décimales.'),
    };
  }
  const q = randInt(r, 12, 99) / 10;
  const div = pick(r, [0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 0.05, 0.06, 0.08]);
  const dividend = r6(q * div);
  const k = div < 0.1 ? 100 : 10;
  return {
    prompt: bi((f) => `${f.t('Divide', 'Divise')} ${f.m(`${f.n(dividend)} \\div ${f.n(div)}`)}`),
    answer: q,
    wrong: [[r6(q / 10), t('It looks like the decimal point was misplaced. Make the divisor a whole number by multiplying both numbers by the same power of 10.', 'Il semble que la virgule est mal placée. Rends le diviseur entier en multipliant les deux nombres par la même puissance de 10.'), 0]],
    steps: [bi((f) => f.t(`Multiply both numbers by ${f.N(k)} so the divisor is whole: ${f.N(r6(dividend * k))} ÷ ${f.N(r6(div * k))}.`, `Multiplie les deux nombres par ${f.N(k)} pour que le diviseur soit entier : ${f.N(r6(dividend * k))} ÷ ${f.N(r6(div * k))}.`)), bi((f) => f.t(`${f.N(r6(dividend * k))} ÷ ${f.N(r6(div * k))} = ${f.N(q)}.`, `${f.N(r6(dividend * k))} ÷ ${f.N(r6(div * k))} = ${f.N(q)}.`))],
    nudge: t('Make the divisor a whole number by multiplying both numbers by 10 or 100.', 'Rends le diviseur entier en multipliant les deux nombres par 10 ou 100.'),
  };
});

/** MS.G7.B2.10.a: proportional reasoning */
export const proportional7 = numGen('MS.G7.B2.10.a', (tier, r) => {
  if (tier === 3) {
    const s = pick(r, [40, 50, 60, 70, 80, 90]);
    const t1 = pick(r, [2, 3, 4]);
    const h = pick(r, [1.5, 2.5, 3.5, 4.5]);
    const d = s * t1;
    return {
      prompt: bi((f) => f.t(`A car travels ${f.N(d)} km in ${f.N(t1)} hours at a steady speed. How far does it travel in ${f.N(h)} hours?`, `Une voiture parcourt ${f.N(d)} km en ${f.N(t1)} heures à vitesse constante. Quelle distance parcourt-elle en ${f.N(h)} heures ?`)),
      answer: r6(s * h), category: 'AP',
      wrong: [[r6(d + (h - t1)), t('It looks like the extra time was added to the distance. In a proportion, both quantities are multiplied by the same number.', 'Il semble que le temps en plus a été ajouté à la distance. Dans une proportion, les deux quantités sont multipliées par le même nombre.'), 0]],
      steps: [bi((f) => f.t(`Unit rate: ${f.N(d)} ÷ ${f.N(t1)} = ${f.N(s)} km each hour.`, `Taux unitaire : ${f.N(d)} ÷ ${f.N(t1)} = ${f.N(s)} km par heure.`)), bi((f) => f.t(`Distance: ${f.N(s)} × ${f.N(h)} = ${f.N(r6(s * h))} km.`, `Distance : ${f.N(s)} × ${f.N(h)} = ${f.N(r6(s * h))} km.`))],
      nudge: t('Find how far the car goes in one hour.', 'Trouve la distance que la voiture parcourt en une heure.'),
    };
  }
  const u = tier === 1 ? randInt(r, 2, 9) : randInt(r, 5, 18) / 4;
  const q1 = randInt(r, 3, 8);
  let q2: number;
  do { q2 = randInt(r, 2, 12); } while (q2 === q1);
  const cost = r6(u * q1);
  const ans = r6(u * q2);
  return {
    prompt: bi((f) => f.t(`${f.N(q1)} notebooks cost ${f.D(cost)}. At the same price, how much do ${f.N(q2)} notebooks cost, in dollars?`, `${f.N(q1)} cahiers coûtent ${f.D(cost)}. Au même prix, combien coûtent ${f.N(q2)} cahiers, en dollars ?`)),
    answer: ans, category: 'AP',
    wrong: [[r6(cost + (q2 - q1)), t('It looks like the extra notebooks were added as ones. Each notebook costs the same amount, so use the price of one notebook.', 'Il semble que les cahiers en plus ont été ajoutés comme des unités. Chaque cahier coûte le même montant : utilise le prix d\'un cahier.'), 0]],
    steps: [bi((f) => f.t(`Cost of one notebook: ${f.N(cost)} ÷ ${f.N(q1)} = ${f.D(u)}.`, `Coût d\'un cahier : ${f.N(cost)} ÷ ${f.N(q1)} = ${f.D(u)}.`)), bi((f) => f.t(`${f.N(q2)} notebooks: ${f.N(q2)} × ${f.N(u)} = ${f.D(ans)}.`, `${f.N(q2)} cahiers : ${f.N(q2)} × ${f.N(u)} = ${f.D(ans)}.`))],
    nudge: t('Find the cost of one notebook first (the unit rate).', 'Trouve d\'abord le coût d\'un cahier (le taux unitaire).'),
  };
});

/** MS.G7.B1.7.a: convert among fractions, decimals and percents */
export const convert7 = numGen('MS.G7.B1.7.a', (tier, r) => {
  if (tier === 1) {
    const d = pick(r, [2, 4, 5, 10, 20, 25, 50]);
    const n = randInt(r, 1, d - 1);
    const ans = r6((n * 100) / d);
    return {
      prompt: bi((f) => f.t(`Write ${f.m(frac(f.n(n), f.n(d)))} as a percent. Type the number only.`, `Écris ${f.m(frac(f.n(n), f.n(d)))} en pourcentage. Écris seulement le nombre.`)),
      answer: ans,
      wrong: [[r6(ans / 10), t('It looks like the percent is one place too small. A percent is a fraction out of 100.', 'Il semble que le pourcentage est une position trop petit. Un pourcentage est une fraction sur 100.'), 1]],
      steps: [bi((f) => f.t(`Find an equivalent fraction with denominator 100: ${f.m(`${frac(f.n(n), f.n(d))} = ${frac(f.n(ans), 100)}`)}.`, `Trouve une fraction équivalente de dénominateur 100 : ${f.m(`${frac(f.n(n), f.n(d))} = ${frac(f.n(ans), 100)}`)}.`)), bi((f) => f.t(`${f.N(ans)} out of 100 is ${f.N(ans)}%.`, `${f.N(ans)} sur 100 égale ${f.N(ans)} %.`))],
      nudge: t('Make the denominator 100, or divide the numerator by the denominator and multiply by 100.', 'Rends le dénominateur égal à 100, ou divise le numérateur par le dénominateur et multiplie par 100.'),
    };
  }
  if (tier === 2) {
    const dec = randInt(r, 1, 99) / 100;
    const ans = r6(dec * 100);
    return {
      prompt: bi((f) => f.t(`Write ${f.N(dec)} as a percent. Type the number only.`, `Écris ${f.N(dec)} en pourcentage. Écris seulement le nombre.`)),
      answer: ans,
      wrong: [[r6(dec * 10), t('It looks like the decimal was multiplied by 10. To change a decimal to a percent, multiply by 100.', 'Il semble que la décimale a été multipliée par 10. Pour transformer un nombre décimal en pourcentage, multiplie par 100.'), 0]],
      steps: [t('A percent is a number out of 100, so multiply the decimal by 100.', 'Un pourcentage est un nombre sur 100 : multiplie le nombre décimal par 100.'), bi((f) => f.t(`${f.N(dec)} × 100 = ${f.N(ans)}, so ${f.N(ans)}%.`, `${f.N(dec)} × 100 = ${f.N(ans)}, donc ${f.N(ans)} %.`))],
      nudge: t('Move the decimal point two places to the right.', 'Déplace la virgule de deux positions vers la droite.'),
    };
  }
  const d = pick(r, [8, 16, 40]);
  const n = randInt(r, 1, d - 1);
  const ans = r6((n * 100) / d);
  return {
    prompt: bi((f) => f.t(`Write ${f.m(frac(f.n(n), f.n(d)))} as a percent. Type the number only (it may have a decimal).`, `Écris ${f.m(frac(f.n(n), f.n(d)))} en pourcentage. Écris seulement le nombre (il peut avoir une décimale).`)),
    answer: ans,
    wrong: [[r6(n / d), t('That is the decimal. Multiply it by 100 to get the percent.', 'C\'est le nombre décimal. Multiplie-le par 100 pour obtenir le pourcentage.'), 1]],
    steps: [bi((f) => f.t(`Divide: ${f.N(n)} ÷ ${f.N(d)} = ${f.N(r6(n / d))}.`, `Divise : ${f.N(n)} ÷ ${f.N(d)} = ${f.N(r6(n / d))}.`)), bi((f) => f.t(`Multiply by 100: ${f.N(r6(n / d))} × 100 = ${f.N(ans)}, so ${f.N(ans)}%.`, `Multiplie par 100 : ${f.N(r6(n / d))} × 100 = ${f.N(ans)}, donc ${f.N(ans)} %.`))],
    nudge: t('Divide the numerator by the denominator, then multiply by 100.', 'Divise le numérateur par le dénominateur, puis multiplie par 100.'),
  };
});

