// Grade 12 (MHF4U) Characteristics of Functions: average and instantaneous rates of change, combining functions, and even and odd
// functions. All answers are exact.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';
import { polyTex } from './poly12.js';

const sgn = (n: number): string => (n < 0 ? '-' : '+');

/** MHF4U.D1: average rate of change over an interval, and the instantaneous rate estimated from a very short interval */
export const rateOfChange12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = pick(r, [-3, -2, -1, 1, 2, 3, 4]), b = randInt(r, -5, 5), c = randInt(r, -6, 6), x1 = randInt(r, -3, 2), x2 = x1 + randInt(r, 1, 4);
    const fn = (x: number): number => a * x * x + b * x + c, ans = (fn(x2) - fn(x1)) / (x2 - x1);
    return {
      prompt: bi((f) => f.t(`Find the average rate of change of ${f.m(`f(x) = ${polyTex(f, [a, b, c])}`)} from x = ${f.N(x1)} to x = ${f.N(x2)}.`, `Trouve le taux de variation moyen de ${f.m(`f(x) = ${polyTex(f, [a, b, c])}`)} de x = ${f.N(x1)} à x = ${f.N(x2)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[fn(x2) - fn(x1), t('Divide the change in f by the change in x.', 'Divise la variation de f par la variation de x.'), 1], [(fn(x1) - fn(x2)) / (x2 - x1), t('Subtract in the same order on the top and the bottom: end minus start.', 'Soustrais dans le même ordre en haut et en bas : fin moins début.'), 1], [fn(x2) / x2, t('Use the change from the start to the end, not the value at the end.', 'Utilise la variation du début à la fin, et non la valeur à la fin.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`f(${f.n(x1)}) = ${f.n(fn(x1))}`)} and ${f.m(`f(${f.n(x2)}) = ${f.n(fn(x2))}`)}.`, `${f.m(`f(${f.n(x1)}) = ${f.n(fn(x1))}`)} et ${f.m(`f(${f.n(x2)}) = ${f.n(fn(x2))}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(fn(x2))} - (${f.n(fn(x1))})}{${f.n(x2)} - (${f.n(x1)})}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(fn(x2))} - (${f.n(fn(x1))})}{${f.n(x2)} - (${f.n(x1)})}`)} = ${f.N(ans)}.`))],
      nudge: t('Rate of change = (f(end) − f(start)) divided by (end − start).', 'Taux de variation = (f(fin) − f(début)) divisé par (fin − début).'),
    };
  }
  if (tier === 2) {
    const a = pick(r, [1, 2, 3]), x1 = randInt(r, -3, 2), x2 = x1 + randInt(r, 1, 3);
    const fn = (x: number): number => a * x ** 3, ans = (fn(x2) - fn(x1)) / (x2 - x1);
    return {
      prompt: bi((f) => f.t(`Find the average rate of change of ${f.m(`f(x) = ${a === 1 ? '' : f.n(a)}x^3`)} over the interval from x = ${f.N(x1)} to x = ${f.N(x2)}.`, `Trouve le taux de variation moyen de ${f.m(`f(x) = ${a === 1 ? '' : f.n(a)}x^3`)} sur l'intervalle de x = ${f.N(x1)} à x = ${f.N(x2)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[fn(x2) - fn(x1), t('Divide by the change in x.', 'Divise par la variation de x.'), 1], [3 * a * x1 * x1, t('That is the instantaneous rate at the start, not the average over the interval.', 'C\'est le taux instantané au début, et non la moyenne sur l\'intervalle.'), 0], [(fn(x1) - fn(x2)) / (x2 - x1), t('Subtract in the same order on the top and the bottom.', 'Soustrais dans le même ordre en haut et en bas.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`f(${f.n(x1)}) = ${f.n(fn(x1))}`)} and ${f.m(`f(${f.n(x2)}) = ${f.n(fn(x2))}`)}.`, `${f.m(`f(${f.n(x1)}) = ${f.n(fn(x1))}`)} et ${f.m(`f(${f.n(x2)}) = ${f.n(fn(x2))}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(fn(x2) - fn(x1))}}{${f.n(x2 - x1)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(fn(x2) - fn(x1))}}{${f.n(x2 - x1)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Find f at both ends, subtract, and divide by the width of the interval.', 'Trouve f aux deux extrémités, soustrais, et divise par la largeur de l\'intervalle.'),
    };
  }
  const a = pick(r, [1, 2, 3, -1, -2]), b = randInt(r, -4, 4), x0 = randInt(r, -3, 4), h = pick(r, [0.1, 0.01]);
  const fn = (x: number): number => a * x * x + b * x, ans = r6((fn(x0 + h) - fn(x0)) / h);
  return {
    prompt: bi((f) => f.t(`Estimate the instantaneous rate of change of ${f.m(`f(x) = ${polyTex(f, [a, b, 0])}`)} at x = ${f.N(x0)} by using the interval from x = ${f.N(x0)} to x = ${f.N(r6(x0 + h))}.`, `Estime le taux de variation instantané de ${f.m(`f(x) = ${polyTex(f, [a, b, 0])}`)} en x = ${f.N(x0)} en utilisant l'intervalle de x = ${f.N(x0)} à x = ${f.N(r6(x0 + h))}.`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(fn(x0 + h) - fn(x0)), t('Divide by the width of the interval, which is a very small number.', 'Divise par la largeur de l\'intervalle, qui est un très petit nombre.'), 1], [r6(2 * a * x0 + b), t('That is the exact slope; this question asks for the estimate from the short interval, which is slightly different.', 'C\'est la pente exacte ; cette question demande l\'estimation à partir du court intervalle, qui est légèrement différente.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`f(${f.n(x0)}) = ${f.n(fn(x0))}`)} and ${f.m(`f(${f.n(r6(x0 + h))}) = ${f.n(r6(fn(x0 + h)))}`)}.`, `${f.m(`f(${f.n(x0)}) = ${f.n(fn(x0))}`)} et ${f.m(`f(${f.n(r6(x0 + h))}) = ${f.n(r6(fn(x0 + h)))}`)}.`)), bi((f) => f.t(`${f.m(`\\frac{${f.n(r6(fn(x0 + h) - fn(x0)))}}{${f.n(h)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(r6(fn(x0 + h) - fn(x0)))}}{${f.n(h)}}`)} = ${f.N(ans)}.`))],
    nudge: t('The slope of a very short secant line estimates the instantaneous rate.', 'La pente d\'une très courte sécante estime le taux instantané.'),
  };
});

/** MHF4U.D2: combine functions by adding, multiplying and composing */
export const combine12 = (id: string): Generator => numGen(id, (tier, r) => {
  const p = pick(r, [-3, -2, 2, 3]), q = randInt(r, -5, 5), u = pick(r, [1, 2, -1]), s = randInt(r, -4, 4), x = randInt(r, -3, 3);
  const f1 = (v: number): number => p * v + q, g1 = (v: number): number => u * v * v + s;
  const fText = (f: F): string => `f(x) = ${f.n(p)}x ${sgn(q)} ${f.n(Math.abs(q) || 0)}`.replace(/ [+-] 0$/, '');
  const gText = (f: F): string => `g(x) = ${u === 1 ? '' : u === -1 ? '-' : f.n(u)}x^2 ${sgn(s)} ${f.n(Math.abs(s))}`.replace(/ [+-] 0$/, '');
  const given = (f: F, ask: string, askFr: string): { en: string; fr: string } => ({ en: `Given ${f.m(fText(f))} and ${f.m(gText(f))}, find ${ask}.`, fr: `Sachant que ${f.m(fText(f))} et ${f.m(gText(f))}, trouve ${askFr}.` });
  if (tier === 1) {
    const op = pick(r, ['+', '-', '\\times'] as const);
    const ans = op === '+' ? f1(x) + g1(x) : op === '-' ? f1(x) - g1(x) : f1(x) * g1(x);
    const name = op === '\\times' ? '(f \\times g)' : op === '+' ? '(f + g)' : '(f - g)';
    return {
      prompt: bi((f) => { const g = given(f, f.m(`${name}(${f.n(x)})`), f.m(`${name}(${f.n(x)})`)); return f.lang === 'en' ? g.en : g.fr; }),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[op === '+' ? f1(x) - g1(x) : op === '-' ? f1(x) + g1(x) : f1(x) + g1(x), t('Check which operation the notation asks for: plus, minus or times.', 'Vérifie quelle opération la notation demande : plus, moins ou fois.'), 1], [f1(g1(x)), t('Evaluate each function at the same input, then combine the two values with the operation. It is not a composition.', 'Évalue chaque fonction pour la même valeur, puis combine les deux valeurs avec l\'opération. Ce n\'est pas une composition.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`f(${f.n(x)}) = ${f.n(f1(x))}`)} and ${f.m(`g(${f.n(x)}) = ${f.n(g1(x))}`)}.`, `${f.m(`f(${f.n(x)}) = ${f.n(f1(x))}`)} et ${f.m(`g(${f.n(x)}) = ${f.n(g1(x))}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(f1(x))} ${op} (${f.n(g1(x))})`)} = ${f.N(ans)}.`, `${f.m(`${f.n(f1(x))} ${op} (${f.n(g1(x))})`)} = ${f.N(ans)}.`))],
      nudge: t('Evaluate f and g at the input, then add, subtract or multiply the two values.', 'Évalue f et g pour la valeur donnée, puis additionne, soustrais ou multiplie les deux valeurs.'),
    };
  }
  if (tier === 2) {
    const order = pick(r, ['fg', 'gf'] as const), ans = order === 'fg' ? f1(g1(x)) : g1(f1(x));
    const name = order === 'fg' ? '(f \\circ g)' : '(g \\circ f)';
    return {
      prompt: bi((f) => { const g = given(f, f.m(`${name}(${f.n(x)})`), f.m(`${name}(${f.n(x)})`)); return f.lang === 'en' ? g.en : g.fr; }),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[order === 'fg' ? g1(f1(x)) : f1(g1(x)), t('Check the order: the function written second is applied first.', 'Vérifie l\'ordre : la fonction écrite en second est appliquée en premier.'), 0], [f1(x) * g1(x), t('A composition puts one function inside the other; it is not a product.', 'Une composition place une fonction à l\'intérieur de l\'autre ; ce n\'est pas un produit.'), 0]]),
      steps: [bi((f) => f.t(`Inside first: ${order === 'fg' ? f.m(`g(${f.n(x)}) = ${f.n(g1(x))}`) : f.m(`f(${f.n(x)}) = ${f.n(f1(x))}`)}.`, `D'abord l'intérieur : ${order === 'fg' ? f.m(`g(${f.n(x)}) = ${f.n(g1(x))}`) : f.m(`f(${f.n(x)}) = ${f.n(f1(x))}`)}.`)), bi((f) => f.t(`Then ${order === 'fg' ? f.m(`f(${f.n(g1(x))})`) : f.m(`g(${f.n(f1(x))})`)} = ${f.N(ans)}.`, `Puis ${order === 'fg' ? f.m(`f(${f.n(g1(x))})`) : f.m(`g(${f.n(f1(x))})`)} = ${f.N(ans)}.`))],
      nudge: t('In a composition, work from the inside out: the function written second goes first.', 'Dans une composition, travaille de l\'intérieur vers l\'extérieur : la fonction écrite en second passe en premier.'),
    };
  }
  const ans = g1(f1(x)) - f1(g1(x));
  return {
    prompt: bi((f) => { const g = given(f, f.m(`(g \\circ f)(${f.n(x)}) - (f \\circ g)(${f.n(x)})`), f.m(`(g \\circ f)(${f.n(x)}) - (f \\circ g)(${f.n(x)})`)); return f.lang === 'en' ? g.en : g.fr; }),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[f1(g1(x)) - g1(f1(x)), t('Keep the order of the subtraction: the g-after-f value comes first.', 'Garde l\'ordre de la soustraction : la valeur de g après f vient en premier.'), 1], [g1(f1(x)) + f1(g1(x)), t('The two compositions are subtracted.', 'Les deux compositions se soustraient.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`(g \\circ f)(${f.n(x)}) = g(${f.n(f1(x))}) = ${f.n(g1(f1(x)))}`)} and ${f.m(`(f \\circ g)(${f.n(x)}) = f(${f.n(g1(x))}) = ${f.n(f1(g1(x)))}`)}.`, `${f.m(`(g \\circ f)(${f.n(x)}) = g(${f.n(f1(x))}) = ${f.n(g1(f1(x)))}`)} et ${f.m(`(f \\circ g)(${f.n(x)}) = f(${f.n(g1(x))}) = ${f.n(f1(g1(x)))}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(g1(f1(x)))} - (${f.n(f1(g1(x)))})`)} = ${f.N(ans)}.`, `${f.m(`${f.n(g1(f1(x)))} - (${f.n(f1(g1(x)))})`)} = ${f.N(ans)}.`))],
    nudge: t('Work out each composition separately from the inside out, then subtract.', 'Calcule chaque composition séparément, de l\'intérieur vers l\'extérieur, puis soustrais.'),
  };
});

/** MHF4U.D3: even, odd or neither */
export const symmetry12 = (id: string): Generator => choiceGen(id, (tier, r) => {
  type Kind = 'even' | 'odd' | 'neither';
  const evenPow = pick(r, [2, 4, 6]), oddPow = pick(r, [1, 3, 5]);
  const a = pick(r, [1, 2, 3, -2]), b = pick(r, [1, 2, -3, 4]);
  let tex: string, kind: Kind;
  if (tier === 1) {
    const k = pick(r, ['even', 'odd', 'neither'] as const);
    kind = k;
    tex = k === 'even' ? `${a === 1 ? '' : a}x^{${evenPow}} ${sgn(b)} ${Math.abs(b)}` : k === 'odd' ? `${a === 1 ? '' : a}x^{${oddPow}} ${sgn(b)} ${Math.abs(b)}x^{${pick(r, [1, 3].filter((v) => v !== oddPow).concat([5].filter((v) => v !== oddPow)))}}` : `x^{${evenPow}} ${sgn(b)} ${Math.abs(b)}x^{${oddPow}}`;
  } else if (tier === 2) {
    const k = pick(r, ['even', 'odd', 'neither'] as const);
    kind = k;
    tex = k === 'even' ? `${a === 1 ? '' : a}x^{4} ${sgn(b)} ${Math.abs(b)}x^{2} + ${Math.abs(a) + 1}` : k === 'odd' ? `${a === 1 ? '' : a}x^{3} ${sgn(b)} ${Math.abs(b)}x` : `${a === 1 ? '' : a}x^{3} ${sgn(b)} ${Math.abs(b)}x^{2}`;
  } else {
    const k = pick(r, ['even', 'odd', 'neither'] as const);
    kind = k;
    tex = k === 'even' ? `\\frac{${Math.abs(a) + 1}}{x^{2} + ${Math.abs(b)}}` : k === 'odd' ? `\\frac{x}{x^{2} + ${Math.abs(b)}}` : `\\frac{x + 1}{x^{2} + ${Math.abs(b)}}`;
  }
  const label: Record<Kind, Text> = { even: t('Even', 'Paire'), odd: t('Odd', 'Impaire'), neither: t('Neither', 'Ni paire ni impaire') };
  const wrongs = (['even', 'odd', 'neither'] as const).filter((x) => x !== kind).map((x): [Text, Text] => [label[x], t('Replace x with negative x and compare: the same function is even, the opposite function is odd.', 'Remplace x par moins x et compare : la même fonction est paire, la fonction opposée est impaire.')]);
  const m = mc(r, label[kind], wrongs);
  tex = tex.replace(/x\^\{1\}/g, 'x');
  return {
    prompt: bi((f) => f.t(`Is ${f.m(`f(x) = ${tex}`)} even, odd or neither?`, `La fonction ${f.m(`f(x) = ${tex}`)} est-elle paire, impaire ou ni l'une ni l'autre ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Replace x with negative x and simplify. If f(−x) = f(x) the function is even; if f(−x) = −f(x) it is odd.', 'Remplace x par moins x et simplifie. Si f(−x) = f(x), la fonction est paire ; si f(−x) = −f(x), elle est impaire.'), t(`Here the function is ${kind === 'even' ? 'even' : kind === 'odd' ? 'odd' : 'neither even nor odd'}.`, `Ici, la fonction est ${kind === 'even' ? 'paire' : kind === 'odd' ? 'impaire' : 'ni paire ni impaire'}.`)],
    nudge: t('Work out f(−x) and compare it with f(x) and with −f(x).', 'Calcule f(−x) et compare-le avec f(x) et avec −f(x).'),
  };
});
