// Grade 12 (MHF4U) Polynomial and Rational Functions: features of polynomial functions, features of rational functions, the factor and
// remainder theorems, solving polynomial equations, and solving polynomial and rational inequalities. All answers are exact.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const sgn = (n: number): string => (n < 0 ? '-' : '+');
/** (x - r) written as x + k or x - k, or x when r is 0. */
export const lin = (f: F, r: number): string => (r === 0 ? 'x' : `x ${sgn(-r)} ${f.n(Math.abs(r))}`);
/** A product of linear factors with optional multiplicities. */
const factors = (f: F, roots: [number, number][]): string => roots.map(([r, m]) => `(${lin(f, r)})${m > 1 ? `^{${f.n(m)}}` : ''}`).join('');
/** Evaluate a polynomial with coefficients from the highest power down. */
export const evalPoly = (c: number[], x: number): number => c.reduce((acc, k) => acc * x + k, 0);
/** A polynomial a(x - r1)(x - r2)... as coefficients from the highest power down. */
export const expand = (a: number, roots: number[]): number[] => roots.reduce((cs, r) => { const out = new Array(cs.length + 1).fill(0) as number[]; cs.forEach((k, i) => { out[i] = (out[i] ?? 0) + k; out[i + 1] = (out[i + 1] ?? 0) - k * r; }); return out; }, [a]);
/** TeX for a polynomial from its coefficients (highest power first). */
export const polyTex = (f: F, c: number[]): string => {
  const deg = c.length - 1;
  const terms = c.map((k, i) => ({ k, p: deg - i })).filter(({ k }) => k !== 0);
  return terms.map(({ k, p }, i) => {
    const body = p === 0 ? f.n(Math.abs(k)) : `${Math.abs(k) === 1 ? '' : f.n(Math.abs(k))}x${p > 1 ? `^{${p}}` : ''}`;
    return i === 0 ? `${k < 0 ? '-' : ''}${body}` : ` ${sgn(k)} ${body}`;
  }).join('');
};

/** MHF4U.C1: features of polynomial functions */
export const polyFeatures12 = (id: string): Generator => (tier, seed) => {
  if (tier === 1) {
    return choiceGen(id, (_t, r) => {
      const deg = randInt(r, 2, 6), lead = pick(r, [-5, -3, -2, 2, 3, 4]);
      const odd = deg % 2 === 1, pos = lead > 0;
      const right = pos ? 'up' : 'down', left = odd ? (pos ? 'down' : 'up') : right;
      const text = (l: string, rr: string): Text => t(`Left end ${l}, right end ${rr}`, `Extrémité gauche vers le ${l === 'up' ? 'haut' : 'bas'}, extrémité droite vers le ${rr === 'up' ? 'haut' : 'bas'}`);
      const combos: [string, string][] = [['up', 'up'], ['down', 'down'], ['down', 'up'], ['up', 'down']];
      const m = mc(r, text(left, right), combos.filter(([l, rr]) => !(l === left && rr === right)).map(([l, rr]): [Text, Text] => [text(l, rr), t('The degree tells whether the ends go the same way (even) or opposite ways (odd), and the sign of the leading coefficient tells the right end.', 'Le degré indique si les extrémités vont dans le même sens (pair) ou en sens contraire (impair), et le signe du coefficient dominant indique l\'extrémité droite.')]));
      return {
        prompt: bi((f) => f.t(`Describe the end behaviour of ${f.m(`f(x) = ${f.n(lead)}x^{${f.n(deg)}} + x`)}.`, `Décris le comportement aux extrémités de ${f.m(`f(x) = ${f.n(lead)}x^{${f.n(deg)}} + x`)}.`)),
        options: m.options, correct: m.correct, why: m.why, category: 'KU',
        steps: [bi((f) => f.t(`The degree ${f.N(deg)} is ${odd ? 'odd' : 'even'}, so the ends go ${odd ? 'opposite ways' : 'the same way'}.`, `Le degré ${f.N(deg)} est ${odd ? 'impair' : 'pair'} : les extrémités vont ${odd ? 'en sens contraire' : 'dans le même sens'}.`)), bi((f) => f.t(`The leading coefficient ${f.N(lead)} is ${pos ? 'positive' : 'negative'}, so the right end goes ${right}.`, `Le coefficient dominant ${f.N(lead)} est ${pos ? 'positif' : 'négatif'} : l'extrémité droite va vers le ${right === 'up' ? 'haut' : 'bas'}.`))],
        nudge: t('Look at the degree (even or odd) and the sign of the leading coefficient.', 'Regarde le degré (pair ou impair) et le signe du coefficient dominant.'),
      };
    })(tier, seed);
  }
  return numGen(id, (_t, r) => {
    if (tier === 2) {
      const n = randInt(r, 2, 3);
      const roots: [number, number][] = Array.from({ length: n }, (_, i) => [i * 2 - randInt(r, 1, 3) + randInt(r, 0, 1), randInt(r, 1, 3)] as [number, number]);
      const uniq = [...new Map(roots.map((x) => [x[0], x])).values()];
      const deg = uniq.reduce((s, [, m]) => s + m, 0);
      return {
        prompt: bi((f) => f.t(`What is the greatest number of turning points of ${f.m(`f(x) = ${factors(f, uniq)}`)}?`, `Quel est le plus grand nombre de points de rebroussement (maximums et minimums) de ${f.m(`f(x) = ${factors(f, uniq)}`)} ?`)),
        answer: deg - 1, category: 'KU',
        wrong: wr(deg - 1, [[deg, t('A polynomial of degree n has at most n minus 1 turning points.', 'Un polynôme de degré n a au plus n moins 1 points de rebroussement.'), 1], [uniq.length - 1, t('Add the multiplicities to find the degree: a repeated factor counts each time.', 'Additionne les multiplicités pour trouver le degré : un facteur répété compte chaque fois.'), 0], [uniq.length, t('The number of different zeros is not the degree. Add the multiplicities.', 'Le nombre de zéros différents n\'est pas le degré. Additionne les multiplicités.'), 0]]),
        steps: [bi((f) => f.t(`The degree is the sum of the exponents: ${f.N(deg)}.`, `Le degré est la somme des exposants : ${f.N(deg)}.`)), bi((f) => f.t(`At most degree minus 1 turning points: ${f.N(deg - 1)}.`, `Au plus degré moins 1 points de rebroussement : ${f.N(deg - 1)}.`))],
        nudge: t('Find the degree by adding the exponents of the factors.', 'Trouve le degré en additionnant les exposants des facteurs.'),
      };
    }
    const a = pick(r, [-2, -1, 1, 2, 3]), roots = [randInt(r, -4, 4), randInt(r, -4, 4), randInt(r, -4, 4)];
    const ans = a * roots.reduce((p, x) => p * -x, 1);
    return {
      prompt: bi((f) => f.t(`What is the y-intercept of ${f.m(`f(x) = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}${factors(f, roots.map((x) => [x, 1] as [number, number]))}`)}?`, `Quelle est l'ordonnée à l'origine de ${f.m(`f(x) = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}${factors(f, roots.map((x) => [x, 1] as [number, number]))}`)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[roots.reduce((p, x) => p * x, 1) * a, t('Put x = 0 in each factor: x minus a becomes negative a.', 'Remplace x par 0 dans chaque facteur : x moins a devient moins a.'), 1], [ans === 0 ? 1 : Math.abs(ans), t('Keep the signs: multiply the leading coefficient by the value of every factor at x = 0.', 'Garde les signes : multiplie le coefficient dominant par la valeur de chaque facteur en x = 0.'), 1]]),
      steps: [t('Put x = 0 in every factor and multiply by the leading coefficient.', 'Remplace x par 0 dans chaque facteur et multiplie par le coefficient dominant.'), bi((f) => f.t(`${f.m(`${f.n(a)} \\times ${roots.map((x) => `(${f.n(-x)})`).join(' \\times ')}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(a)} \\times ${roots.map((x) => `(${f.n(-x)})`).join(' \\times ')}`)} = ${f.N(ans)}.`))],
      nudge: t('The y-intercept is f(0): replace x with 0 in every factor.', 'L\'ordonnée à l\'origine est f(0) : remplace x par 0 dans chaque facteur.'),
    };
  })(tier, seed);
};

/** MHF4U.C2: features of rational functions */
export const rational12 = (id: string): Generator => numGen(id, (tier, r) => {
  const s = randInt(r, -5, 6) || 2;
  if (tier === 1) {
    const a = randInt(r, 1, 5), b = randInt(r, -6, 6);
    return {
      prompt: bi((f) => f.t(`What is the vertical asymptote x = k of ${f.m(`f(x) = \\frac{${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b || 1))}}{${lin(f, s)}}`)}? Give k.`, `Quelle est l'asymptote verticale x = k de ${f.m(`f(x) = \\frac{${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b || 1))}}{${lin(f, s)}}`)} ? Donne k.`)),
      answer: s, category: 'KU',
      wrong: wr(s, [[-s, t('The asymptote is where the denominator is zero: set x minus s equal to 0.', 'L\'asymptote est là où le dénominateur est nul : pose x moins s égal à 0.'), 0], [a, t('That number is in the numerator. Look at where the denominator is zero.', 'Ce nombre est dans le numérateur. Regarde où le dénominateur est nul.'), 0]]),
      steps: [t('A vertical asymptote is where the denominator is zero (and the numerator is not).', 'Une asymptote verticale est là où le dénominateur est nul (et pas le numérateur).'), bi((f) => f.t(`${f.m(`${lin(f, s)} = 0`)} gives x = ${f.N(s)}.`, `${f.m(`${lin(f, s)} = 0`)} donne x = ${f.N(s)}.`))],
      nudge: t('Set the denominator equal to zero.', 'Pose le dénominateur égal à zéro.'),
    };
  }
  if (tier === 2) {
    const c = pick(r, [1, 2, 4, 5]), ratio = pick(r, [-3, -2, -1, 1, 2, 3, 4]), a = c * ratio, b = randInt(r, -5, 5), d = randInt(r, -5, 5) || 1;
    const ans = ratio;
    return {
      prompt: bi((f) => f.t(`What is the horizontal asymptote y = h of ${f.m(`f(x) = \\frac{${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b || 1))}}{${c === 1 ? '' : f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))}}`)}? Give h.`, `Quelle est l'asymptote horizontale y = h de ${f.m(`f(x) = \\frac{${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b || 1))}}{${c === 1 ? '' : f.n(c)}x ${sgn(d)} ${f.n(Math.abs(d))}}`)} ? Donne h.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[0, t('The degrees are equal, so the asymptote is not y = 0. It is the ratio of the leading coefficients.', 'Les degrés sont égaux : l\'asymptote n\'est pas y = 0. C\'est le rapport des coefficients dominants.'), 0], [r6(b / d), t('Compare the coefficients of x, not the constants.', 'Compare les coefficients de x, et non les constantes.'), 0], [r6(c / a), t('Put the numerator\'s coefficient on top.', 'Mets le coefficient du numérateur en haut.'), 1]]),
      steps: [t('When the numerator and denominator have the same degree, the horizontal asymptote is the ratio of the leading coefficients.', 'Quand le numérateur et le dénominateur ont le même degré, l\'asymptote horizontale est le rapport des coefficients dominants.'), bi((f) => f.t(`${f.m(`\\frac{${f.n(a)}}{${f.n(c)}}`)} = ${f.N(ans)}.`, `${f.m(`\\frac{${f.n(a)}}{${f.n(c)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Divide the coefficient of x on top by the coefficient of x on the bottom.', 'Divise le coefficient de x en haut par le coefficient de x en bas.'),
    };
  }
  const p = randInt(r, -4, 4), dd = pick(r, [1, 2, 3]), m = randInt(r, 2, 4) * (r() < 0.5 ? -1 : 1);
  const sh = p - dd, q = p - dd * m; // the hole's y-value is (p - q) / (p - sh) = m
  const which = pick(r, ['x', 'y'] as const);
  return {
    prompt: bi((f) => f.t(`The graph of ${f.m(`f(x) = \\frac{(${lin(f, p)})(${lin(f, q)})}{(${lin(f, p)})(${lin(f, sh)})}`)} has a hole. What is the ${which}-coordinate of the hole?`, `Le graphique de ${f.m(`f(x) = \\frac{(${lin(f, p)})(${lin(f, q)})}{(${lin(f, p)})(${lin(f, sh)})}`)} a un trou. Quelle est la coordonnée ${which} du trou ?`)),
    answer: which === 'x' ? p : m, category: 'TH',
    wrong: wr(which === 'x' ? p : m, [[which === 'x' ? sh : p, t(which === 'x' ? 'That is the vertical asymptote. The hole is at the factor that cancels.' : 'That is the x-coordinate. Put it into the simplified function to get y.', which === 'x' ? 'C\'est l\'asymptote verticale. Le trou est au facteur qui se simplifie.' : 'C\'est la coordonnée x. Remplace-la dans la fonction simplifiée pour obtenir y.'), 1], [which === 'x' ? q : r6(1 / m), t(which === 'x' ? 'That zero is not cancelled, so it is an x-intercept.' : 'Divide the numerator\'s value by the denominator\'s value.', which === 'x' ? 'Ce zéro ne se simplifie pas : c\'est une abscisse à l\'origine.' : 'Divise la valeur du numérateur par celle du dénominateur.'), 1]]),
    steps: [bi((f) => f.t(`The factor ${f.m(`(${lin(f, p)})`)} cancels, so there is a hole at x = ${f.N(p)}.`, `Le facteur ${f.m(`(${lin(f, p)})`)} se simplifie : il y a un trou en x = ${f.N(p)}.`)), bi((f) => f.t(`Simplified: ${f.m(`\\frac{${lin(f, q)}}{${lin(f, sh)}}`)}. At x = ${f.N(p)}: ${f.m(`\\frac{${f.n(p - q)}}{${f.n(p - sh)}}`)} = ${f.N(m)}.`, `Simplifié : ${f.m(`\\frac{${lin(f, q)}}{${lin(f, sh)}}`)}. En x = ${f.N(p)} : ${f.m(`\\frac{${f.n(p - q)}}{${f.n(p - sh)}}`)} = ${f.N(m)}.`))],
    nudge: t('Cancel the common factor; the hole is where it equals zero. Put that x into what is left for y.', 'Simplifie le facteur commun ; le trou est là où il est nul. Remplace ce x dans ce qui reste pour obtenir y.'),
  };
});

/** P(x) = x^3 + ax^2 + mx + c with the unknown m, leaving out zero terms. */
const withM = (f: F, a: number, c: number): string => `P(x) = x^{3}${a === 0 ? '' : ` ${sgn(a)} ${Math.abs(a) === 1 ? '' : f.n(Math.abs(a))}x^{2}`} + mx${c === 0 ? '' : ` ${sgn(c)} ${f.n(Math.abs(c))}`}`;

/** MHF4U.C3: the remainder and factor theorems */
export const factorThm12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = randInt(r, -4, 5), b = randInt(r, -5, 5), k = pick(r, [-3, -2, -1, 1, 2, 3, 4]);
  if (tier === 1) {
    const c = randInt(r, -9, 9), coeffs = [1, a, b, c], ans = evalPoly(coeffs, k);
    return {
      prompt: bi((f) => f.t(`What is the remainder when ${f.m(`P(x) = ${polyTex(f, coeffs)}`)} is divided by ${f.m(`(${lin(f, k)})`)}?`, `Quel est le reste de la division de ${f.m(`P(x) = ${polyTex(f, coeffs)}`)} par ${f.m(`(${lin(f, k)})`)} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[evalPoly(coeffs, -k), t('For the divisor x minus k, the remainder is P(k), not P(negative k).', 'Pour le diviseur x moins k, le reste est P(k), et non P(moins k).'), 0], [evalPoly(coeffs, k) + 1, t('Check each power as you evaluate: powers first, then multiply, then add.', 'Vérifie chaque puissance en évaluant : les puissances d\'abord, puis les produits, puis les sommes.'), 1]]),
      steps: [bi((f) => f.t(`The remainder is P(${f.n(k)}).`, `Le reste est P(${f.n(k)}).`)), bi((f) => f.t(`P(${f.n(k)}) = ${f.N(ans)}.`, `P(${f.n(k)}) = ${f.N(ans)}.`))],
      nudge: t('The remainder theorem: the remainder on dividing by x minus k is P(k).', 'Le théorème du reste : le reste de la division par x moins k est P(k).'),
    };
  }
  if (tier === 2) {
    const m = randInt(r, -6, 6), c = -(k ** 3 + a * k * k + m * k);
    return {
      prompt: bi((f) => f.t(`For what value of m is ${f.m(`(${lin(f, k)})`)} a factor of ${f.m(withM(f, a, c))}?`, `Pour quelle valeur de m le polynôme ${f.m(`(${lin(f, k)})`)} est-il un facteur de ${f.m(withM(f, a, c))} ?`)),
      answer: m, category: 'AP',
      wrong: wr(m, [[-m, t('Set P(k) = 0 and solve for m carefully, including its sign.', 'Pose P(k) = 0 et résous pour m avec soin, y compris son signe.'), 1], [m + 1, t('Check each power when you evaluate P(k).', 'Vérifie chaque puissance quand tu évalues P(k).'), 0]]),
      steps: [bi((f) => f.t(`By the factor theorem, P(${f.n(k)}) = 0.`, `Selon le théorème du facteur, P(${f.n(k)}) = 0.`)), bi((f) => f.t(`${f.m(`${f.n(k ** 3)} ${sgn(a * k * k)} ${f.n(Math.abs(a * k * k))} + ${f.n(k)}m ${sgn(c)} ${f.n(Math.abs(c))} = 0`)}, so m = ${f.N(m)}.`, `${f.m(`${f.n(k ** 3)} ${sgn(a * k * k)} ${f.n(Math.abs(a * k * k))} + ${f.n(k)}m ${sgn(c)} ${f.n(Math.abs(c))} = 0`)}, donc m = ${f.N(m)}.`))],
      nudge: t('If x minus k is a factor, P(k) = 0. Put k in and solve for m.', 'Si x moins k est un facteur, P(k) = 0. Remplace k et résous pour m.'),
    };
  }
  const c = randInt(r, -9, 9), coeffs = [2, a, b, c], ans = evalPoly(coeffs, -k);
  return {
    prompt: bi((f) => f.t(`What is the remainder when ${f.m(`P(x) = ${polyTex(f, coeffs)}`)} is divided by ${f.m(`(x ${sgn(k)} ${f.n(Math.abs(k))})`)}?`, `Quel est le reste de la division de ${f.m(`P(x) = ${polyTex(f, coeffs)}`)} par ${f.m(`(x ${sgn(k)} ${f.n(Math.abs(k))})`)} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[evalPoly(coeffs, k), t('The divisor is x plus k, which is x minus negative k, so evaluate at negative k.', 'Le diviseur est x plus k, soit x moins moins k : évalue en moins k.'), 0], [ans + 2, t('Check each term when you evaluate: signs matter with a negative input.', 'Vérifie chaque terme en évaluant : les signes comptent avec une valeur négative.'), 1]]),
    steps: [bi((f) => f.t(`x ${sgn(k)} ${f.n(Math.abs(k))} is x minus ${f.N(-k)}, so the remainder is P(${f.n(-k)}).`, `x ${sgn(k)} ${f.n(Math.abs(k))} est x moins ${f.N(-k)} : le reste est P(${f.n(-k)}).`)), bi((f) => f.t(`P(${f.n(-k)}) = ${f.N(ans)}.`, `P(${f.n(-k)}) = ${f.N(ans)}.`))],
    nudge: t('Write the divisor as x minus a number, then evaluate P at that number.', 'Écris le diviseur sous la forme x moins un nombre, puis évalue P en ce nombre.'),
  };
});

/** MHF4U.C3: solve polynomial equations */
export const polyEq12 = (id: string): Generator => numGen(id, (tier, r) => {
  const pickRoots = (): number[] => { const s = new Set<number>(); while (s.size < 3) s.add(randInt(r, -5, 5)); return [...s]; };
  if (tier === 1) {
    const roots = pickRoots(), ans = roots.reduce((s, x) => s + x, 0);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${factors(f, roots.map((x) => [x, 1] as [number, number]))} = 0`)}. What is the sum of the solutions?`, `Résous ${f.m(`${factors(f, roots.map((x) => [x, 1] as [number, number]))} = 0`)}. Quelle est la somme des solutions ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[-ans, t('Each factor x minus r gives the solution x = r, with the sign you see inside the factor flipped.', 'Chaque facteur x moins r donne la solution x = r : le signe lu dans le facteur est inversé.'), 0], [roots.reduce((p, x) => p * x, 1), t('Add the solutions; do not multiply them.', 'Additionne les solutions ; ne les multiplie pas.'), 1]]),
      steps: [bi((f) => f.t(`Set each factor to zero: x = ${roots.map((x) => f.N(x)).join(', ')}.`, `Pose chaque facteur égal à zéro : x = ${roots.map((x) => f.N(x)).join(', ')}.`)), bi((f) => f.t(`The sum is ${f.N(ans)}.`, `La somme est ${f.N(ans)}.`))],
      nudge: t('Set each factor equal to zero.', 'Pose chaque facteur égal à zéro.'),
    };
  }
  if (tier === 2) {
    const roots = pickRoots(), known = roots[0]!, rest = roots.slice(1), coeffs = expand(1, roots), ans = Math.max(...rest);
    return {
      prompt: bi((f) => f.t(`${f.m(`x = ${f.n(known)}`)} is a solution of ${f.m(`${polyTex(f, coeffs)} = 0`)}. What is the greatest of the other solutions?`, `${f.m(`x = ${f.n(known)}`)} est une solution de ${f.m(`${polyTex(f, coeffs)} = 0`)}. Quelle est la plus grande des autres solutions ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[Math.min(...rest), t('Look for the greatest of the two, not the least.', 'Cherche la plus grande des deux, pas la plus petite.'), 1], [Math.max(...roots) === ans ? known : Math.max(...roots), t('Leave out the solution you were given.', 'Laisse de côté la solution donnée.'), 1]]),
      steps: [bi((f) => f.t(`Divide by ${f.m(`(${lin(f, known)})`)} (by long or synthetic division) to leave a quadratic.`, `Divise par ${f.m(`(${lin(f, known)})`)} (par division longue ou synthétique) pour obtenir un trinôme du second degré.`)), bi((f) => f.t(`The quadratic has solutions ${f.N(rest[0]!)} and ${f.N(rest[1]!)}, so the greatest is ${f.N(ans)}.`, `Le trinôme a pour solutions ${f.N(rest[0]!)} et ${f.N(rest[1]!)} : la plus grande est ${f.N(ans)}.`))],
      nudge: t('Divide out the known factor, then solve the quadratic that is left.', 'Divise par le facteur connu, puis résous le trinôme qui reste.'),
    };
  }
  const [a, b] = (() => { const x = randInt(r, 1, 5); let y = randInt(r, 1, 5); while (y === x) y = randInt(r, 1, 5); return [x, y]; })();
  const ans = Math.max(a, b);
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`x^4 - ${f.n(a * a + b * b)}x^2 + ${f.n(a * a * b * b)} = 0`)}. What is the greatest solution?`, `Résous ${f.m(`x^4 - ${f.n(a * a + b * b)}x^2 + ${f.n(a * a * b * b)} = 0`)}. Quelle est la plus grande solution ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[a * a > b * b ? a * a : b * b, t('Let u = x squared, solve for u, then take square roots to find x.', 'Pose u = x au carré, résous pour u, puis prends les racines carrées pour trouver x.'), 1], [Math.min(a, b), t('Find the greatest solution, not the least.', 'Trouve la plus grande solution, pas la plus petite.'), 1]]),
    steps: [bi((f) => f.t(`Let ${f.m('u = x^2')}: ${f.m(`u^2 - ${f.n(a * a + b * b)}u + ${f.n(a * a * b * b)} = 0`)}, so ${f.m(`(u - ${f.n(a * a)})(u - ${f.n(b * b)}) = 0`)}.`, `Pose ${f.m('u = x^2')} : ${f.m(`u^2 - ${f.n(a * a + b * b)}u + ${f.n(a * a * b * b)} = 0`)}, donc ${f.m(`(u - ${f.n(a * a)})(u - ${f.n(b * b)}) = 0`)}.`)), bi((f) => f.t(`${f.m('x^2')} = ${f.N(a * a)} or ${f.N(b * b)}, so x = ±${f.N(a)} or ±${f.N(b)}. The greatest is ${f.N(ans)}.`, `${f.m('x^2')} = ${f.N(a * a)} ou ${f.N(b * b)}, donc x = ±${f.N(a)} ou ±${f.N(b)}. La plus grande est ${f.N(ans)}.`))],
    nudge: t('Let u equal x squared to get a quadratic in u.', 'Pose u égal à x au carré pour obtenir un trinôme du second degré en u.'),
  };
});

/** MHF4U.C4: polynomial and rational inequalities, counted over the integers from -10 to 10 */
export const inequality12 = (id: string): Generator => numGen(id, (tier, r) => {
  const ints = Array.from({ length: 21 }, (_, i) => i - 10);
  const two = (): [number, number] => { const a = randInt(r, -6, 4); return [a, a + randInt(r, 2, 6)]; };
  if (tier === 1) {
    const [a, b] = two(), strict = r() < 0.5, outside = r() < 0.5;
    const ok = (x: number): boolean => { const v = (x - a) * (x - b); return outside ? (strict ? v > 0 : v >= 0) : (strict ? v < 0 : v <= 0); };
    const ans = ints.filter(ok).length, sym = outside ? (strict ? '>' : '\\ge') : (strict ? '<' : '\\le');
    return {
      prompt: bi((f) => f.t(`How many integers from ${f.N(-10)} to ${f.N(10)} satisfy ${f.m(`(${lin(f, a)})(${lin(f, b)}) ${sym} 0`)}?`, `Combien d'entiers de ${f.N(-10)} à ${f.N(10)} satisfont ${f.m(`(${lin(f, a)})(${lin(f, b)}) ${sym} 0`)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[ints.filter((x) => { const v = (x - a) * (x - b); return outside ? (strict ? v >= 0 : v > 0) : (strict ? v <= 0 : v < 0); }).length, t('Check the endpoints: with a strict inequality the zeros are not included, and with "or equal to" they are.', 'Vérifie les extrémités : avec une inégalité stricte, les zéros ne sont pas inclus, et avec « ou égal » ils le sont.'), 1], [ints.filter((x) => { const v = (x - a) * (x - b); return !(outside ? (strict ? v > 0 : v >= 0) : (strict ? v < 0 : v <= 0)); }).length, t('Check which side of the zeros the parabola is on: a positive parabola is negative between its zeros.', 'Vérifie de quel côté des zéros se trouve la parabole : une parabole ouverte vers le haut est négative entre ses zéros.'), 1]]),
      steps: [bi((f) => f.t(`The zeros are ${f.N(a)} and ${f.N(b)}. The product is ${outside ? 'positive outside' : 'negative between'} them.`, `Les zéros sont ${f.N(a)} et ${f.N(b)}. Le produit est ${outside ? 'positif à l\'extérieur' : 'négatif entre'} de ces valeurs.`)), bi((f) => f.t(`Counting the whole numbers that fit gives ${f.N(ans)}.`, `En comptant les nombres entiers qui conviennent, on obtient ${f.N(ans)}.`))],
      nudge: t('Find the zeros, then test a number in each interval and count the integers.', 'Trouve les zéros, puis teste un nombre dans chaque intervalle et compte les entiers.'),
    };
  }
  if (tier === 2) {
    const s = new Set<number>(); while (s.size < 3) s.add(randInt(r, -6, 6));
    const [a, b, c] = [...s].sort((x, y) => x - y) as [number, number, number], le = r() < 0.5;
    const ok = (x: number): boolean => { const v = (x - a) * (x - b) * (x - c); return le ? v <= 0 : v >= 0; };
    const ans = ints.filter(ok).length, sym = le ? '\\le' : '\\ge';
    return {
      prompt: bi((f) => f.t(`How many integers from ${f.N(-10)} to ${f.N(10)} satisfy ${f.m(`(${lin(f, a)})(${lin(f, b)})(${lin(f, c)}) ${sym} 0`)}?`, `Combien d'entiers de ${f.N(-10)} à ${f.N(10)} satisfont ${f.m(`(${lin(f, a)})(${lin(f, b)})(${lin(f, c)}) ${sym} 0`)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[ints.filter((x) => !ok(x)).length, t('A cubic with a positive leading coefficient is negative to the left of its smallest zero, then the signs alternate.', 'Un polynôme du 3e degré avec un coefficient dominant positif est négatif à gauche de son plus petit zéro, puis les signes alternent.'), 1], [ints.filter((x) => { const v = (x - a) * (x - b) * (x - c); return le ? v < 0 : v > 0; }).length, t('The "or equal to" includes the three zeros.', 'Le « ou égal » inclut les trois zéros.'), 1]]),
      steps: [bi((f) => f.t(`The zeros are ${f.N(a)}, ${f.N(b)} and ${f.N(c)}. The signs alternate, starting negative on the far left.`, `Les zéros sont ${f.N(a)}, ${f.N(b)} et ${f.N(c)}. Les signes alternent, en commençant par négatif à l'extrême gauche.`)), bi((f) => f.t(`Counting the whole numbers that fit gives ${f.N(ans)}.`, `En comptant les nombres entiers qui conviennent, on obtient ${f.N(ans)}.`))],
      nudge: t('Make a sign table with the three zeros.', 'Fais un tableau de signes avec les trois zéros.'),
    };
  }
  const [a, b] = two(), ge = r() < 0.5;
  const ok = (x: number): boolean => x !== b && (ge ? (x - a) / (x - b) >= 0 : (x - a) / (x - b) <= 0);
  const ans = ints.filter(ok).length, sym = ge ? '\\ge' : '\\le';
  return {
    prompt: bi((f) => f.t(`How many integers from ${f.N(-10)} to ${f.N(10)} satisfy ${f.m(`\\frac{${lin(f, a)}}{${lin(f, b)}} ${sym} 0`)}?`, `Combien d'entiers de ${f.N(-10)} à ${f.N(10)} satisfont ${f.m(`\\frac{${lin(f, a)}}{${lin(f, b)}} ${sym} 0`)} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[ints.filter((x) => (ge ? (x - a) / (x - b) >= 0 : (x - a) / (x - b) <= 0) || x === b).length, t('The value that makes the denominator zero is never allowed.', 'La valeur qui annule le dénominateur n\'est jamais permise.'), 1], [ints.filter((x) => x !== b && !ok(x)).length, t('Check the sign of the quotient on each side of its two critical values.', 'Vérifie le signe du quotient de chaque côté de ses deux valeurs critiques.'), 1]]),
    steps: [bi((f) => f.t(`The critical values are ${f.N(a)} (numerator zero, allowed when "or equal to") and ${f.N(b)} (denominator zero, never allowed).`, `Les valeurs critiques sont ${f.N(a)} (numérateur nul, permis avec « ou égal ») et ${f.N(b)} (dénominateur nul, jamais permis).`)), bi((f) => f.t(`Counting the whole numbers that fit gives ${f.N(ans)}.`, `En comptant les nombres entiers qui conviennent, on obtient ${f.N(ans)}.`))],
    nudge: t('Find where the numerator and the denominator are zero, test each interval, and exclude the denominator\'s zero.', 'Trouve où le numérateur et le dénominateur sont nuls, teste chaque intervalle et exclus le zéro du dénominateur.'),
  };
});
