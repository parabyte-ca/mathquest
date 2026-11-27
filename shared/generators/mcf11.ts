// Grade 11 (MCF3M) extra skills: perfect squares, the range of a quadratic, vertex and standard form, exponent rules on numbers, and
// simple against compound interest. The course also reuses generators written for MPM2D and MCR3U.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';
import { quad } from './algebra10.js';

const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const money = (f: F, x: number): string => f.D(r6(x));

/** MCF3M.A1: perfect square trinomials */
export const perfectSquare11 = (id: string): Generator => choiceGen(id, (tier, r) => {
  const p = nonzero(r, -9, 9), k = tier === 1 ? 1 : pick(r, [2, 3, 4, 5]);
  const bracket = (f: F, s: number): string => `(${k === 1 ? '' : f.n(k)}x ${s < 0 ? '-' : '+'} ${f.n(Math.abs(s))})^{2}`;
  const expr = (f: F): string => quad(f, k * k, 2 * k * p, p * p);
  const m = mc(r, bi((f) => f.m(bracket(f, p))), [
    [bi((f) => f.m(bracket(f, -p))), t('The sign inside the bracket matches the sign of the middle term.', 'Le signe dans la parenthèse est celui du terme du milieu.')],
    [bi((f) => f.m(`(${k === 1 ? '' : f.n(k)}x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p * p))})^{2}`)), t('Take the square root of the last term: the number in the bracket is its square root, not the term itself.', 'Prends la racine carrée du dernier terme : le nombre dans la parenthèse est sa racine carrée, pas le terme lui-même.')],
    [bi((f) => f.m(`(${f.n(k * k)}x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))})^{2}`)), t('Take the square root of the first term as well: the x term in the bracket is the square root of the first coefficient.', 'Prends aussi la racine carrée du premier terme : le terme en x dans la parenthèse est la racine carrée du premier coefficient.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Factor ${f.m(expr(f))} as a perfect square.`, `Factorise ${f.m(expr(f))} sous forme de carré parfait.`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`The first term is ${f.m(`(${k === 1 ? '' : f.n(k)}x)^{2}`)} and the last is ${f.m(`${f.n(Math.abs(p))}^{2}`)}. The middle term ${f.m(`${f.n(2 * k * p)}x`)} is twice their product, so it is a perfect square.`, `Le premier terme est ${f.m(`(${k === 1 ? '' : f.n(k)}x)^{2}`)} et le dernier est ${f.m(`${f.n(Math.abs(p))}^{2}`)}. Le terme du milieu ${f.m(`${f.n(2 * k * p)}x`)} est le double de leur produit : c'est un carré parfait.`)), bi((f) => f.t(`So it factors as ${f.m(bracket(f, p))}.`, `Il se factorise donc en ${f.m(bracket(f, p))}.`))],
    nudge: t('Check that the first and last terms are squares, and that the middle term is twice the product of their roots.', 'Vérifie que le premier et le dernier terme sont des carrés et que le terme du milieu est le double du produit de leurs racines.'),
  };
});

/** MCF3M.A3: the range of a quadratic function */
export const quadRange11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = tier === 1 ? pick(r, [1, -1]) : nonzero(r, -4, 4), h = nonzero(r, -6, 6), k = randInt(r, -9, 12);
  const form = (f: F): string => `f(x) = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`;
  if (tier < 3) {
    return {
      prompt: bi((f) => f.t(`The range of ${f.m(form(f))} is y ${a > 0 ? '≥' : '≤'} k. What is k?`, `Le codomaine de ${f.m(form(f))} est y ${a > 0 ? '≥' : '≤'} k. Que vaut k ?`)),
      answer: k, category: 'KU',
      wrong: wr(k, [[h, t('That is the x-coordinate of the vertex. The range is about the y-values.', 'C\'est l\'abscisse du sommet. Le codomaine concerne les valeurs de y.'), 0], [-h, t('That is a sign slip on the x-coordinate, and the range is about y.', 'C\'est une erreur de signe sur l\'abscisse, et le codomaine concerne y.'), 0], [-k, t('Keep the sign of k as written.', 'Garde le signe de k tel qu\'il est écrit.'), 0]]),
      steps: [bi((f) => f.t(`The vertex is ${f.m(`(${f.n(h)},\\ ${f.n(k)})`)}, and the parabola opens ${a > 0 ? 'up' : 'down'}.`, `Le sommet est ${f.m(`(${f.n(h)},\\ ${f.n(k)})`)} et la parabole s'ouvre vers le ${a > 0 ? 'haut' : 'bas'}.`)), bi((f) => f.t(`So y ${a > 0 ? '≥' : '≤'} ${f.N(k)}.`, `Donc y ${a > 0 ? '≥' : '≤'} ${f.N(k)}.`))],
      nudge: t('The range starts or stops at the y-value of the vertex.', 'Le codomaine commence ou s\'arrête à la valeur de y du sommet.'),
    };
  }
  const x0 = randInt(r, 1, 3) * pick(r, [1, -1]);
  const lo = h - 2, hi = h + 2, vals = [lo, h, hi].map((x) => a * (x - h) ** 2 + k);
  const best = a > 0 ? Math.max(...vals) : Math.min(...vals);
  void x0;
  return {
    prompt: bi((f) => f.t(`For ${f.m(form(f))} with the domain ${f.m(`${f.n(lo)} \\le x \\le ${f.n(hi)}`)}, what is the ${a > 0 ? 'greatest' : 'least'} value of f(x)?`, `Pour ${f.m(form(f))} avec le domaine ${f.m(`${f.n(lo)} \\le x \\le ${f.n(hi)}`)}, quelle est la ${a > 0 ? 'plus grande' : 'plus petite'} valeur de f(x) ?`)),
    answer: best, category: 'AP',
    wrong: wr(best, [[k, t('The vertex is the least (or greatest) value only if x = h is in the domain, and here it gives the other extreme. Check the ends of the domain.', 'Le sommet donne le minimum (ou le maximum) ; ici, c\'est l\'autre extrême. Vérifie les extrémités du domaine.'), 1], [a * (hi - h) ** 2 - k, t('Add k, with its sign, after squaring.', 'Ajoute k, avec son signe, après avoir élevé au carré.'), 1], [a * (lo - h) ** 2, t('Add k to the squared part.', 'Ajoute k à la partie au carré.'), 1]]),
    steps: [t('The parabola opens ' + (a > 0 ? 'up' : 'down') + ', so the ' + (a > 0 ? 'greatest' : 'least') + ' value on a closed interval is at an end.', 'La parabole s\'ouvre vers le ' + (a > 0 ? 'haut' : 'bas') + ' : la ' + (a > 0 ? 'plus grande' : 'plus petite') + ' valeur sur un intervalle fermé est à une extrémité.'), bi((f) => f.t(`At x = ${f.N(lo)} and x = ${f.N(hi)} the value is ${f.N(vals[0]!)}.`, `À x = ${f.N(lo)} et x = ${f.N(hi)}, la valeur est ${f.N(vals[0]!)}.`))],
    nudge: t('Check the vertex and both ends of the domain, and pick the largest or smallest value.', 'Vérifie le sommet et les deux extrémités du domaine, et choisis la plus grande ou la plus petite valeur.'),
  };
});

/** MCF3M.A4: vertex form and standard form */
export const vertexStandard11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = tier === 1 ? pick(r, [1, -1, 2]) : nonzero(r, -3, 3), h = nonzero(r, -6, 6), k = randInt(r, -9, 12);
  const b = -2 * a * h, c = a * h * h + k;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Expand ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} into ${f.m('y = ax^{2} + bx + c')}. What is b?`, `Développe ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} sous la forme ${f.m('y = ax^{2} + bx + c')}. Que vaut b ?`)),
      answer: b, category: 'KU',
      wrong: wr(b, [[-b, t('Expand (x − h)² = x² − 2hx + h², and multiply by a. Keep the sign.', 'Développe (x − h)² = x² − 2hx + h², et multiplie par a. Garde le signe.'), 1], [r6(-h), t('The middle term is −2ah.', 'Le terme du milieu est −2ah.'), 1], [r6(-a * h), t('The middle term of (x − h)² is −2hx, so it has a factor of 2.', 'Le terme du milieu de (x − h)² est −2hx : il y a un facteur 2.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} = x^{2} ${-2 * h < 0 ? '-' : '+'} ${f.n(Math.abs(2 * h))}x + ${f.n(h * h)}`)}.`, `${f.m(`(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} = x^{2} ${-2 * h < 0 ? '-' : '+'} ${f.n(Math.abs(2 * h))}x + ${f.n(h * h)}`)}.`)), bi((f) => f.t(`Multiply by ${f.N(a)}: the x term is ${f.m(`${f.n(b)}x`)}, so b = ${f.N(b)}.`, `Multiplie par ${f.N(a)} : le terme en x est ${f.m(`${f.n(b)}x`)}, donc b = ${f.N(b)}.`))],
      nudge: t('Expand the square first, then multiply by a.', 'Développe d\'abord le carré, puis multiplie par a.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`What is the x-coordinate of the vertex of ${f.m(`y = ${quad(f, a, b, c)}`)}?`, `Quelle est l'abscisse du sommet de ${f.m(`y = ${quad(f, a, b, c)}`)} ?`)),
      answer: h, category: 'AP',
      wrong: wr(h, [[-h, t('The vertex is at x = −b ÷ 2a. Keep track of the sign of b.', 'Le sommet est à x = −b ÷ 2a. Surveille le signe de b.'), 1], [r6(-b / a), t('Divide by 2a, not a.', 'Divise par 2a, pas par a.'), 1], [r6(b / (2 * a)), t('The formula starts with −b.', 'La formule commence par −b.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(h)}.`, `${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(h)}.`)), bi((f) => f.t(`So the vertex has x = ${f.N(h)}.`, `Le sommet a donc x = ${f.N(h)}.`))],
      nudge: t('Use x = −b ÷ 2a.', 'Utilise x = −b ÷ 2a.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`Write ${f.m(`y = ${quad(f, a, b, c)}`)} in the form ${f.m('y = a(x - h)^{2} + k')} by completing the square. What is k?`, `Écris ${f.m(`y = ${quad(f, a, b, c)}`)} sous la forme ${f.m('y = a(x - h)^{2} + k')} en complétant le carré. Que vaut k ?`)),
    answer: k, category: 'AP',
    wrong: wr(k, [[c, t('c is the y-intercept. Subtract a × h², the amount added when you completed the square.', 'c est l\'ordonnée à l\'origine. Soustrais a × h², le montant ajouté en complétant le carré.'), 1], [r6(c - h * h), t('The amount taken away is a × h², not just h².', 'Le montant retiré est a × h², pas seulement h².'), 1], [r6(c + a * h * h), t('Subtract a × h²; do not add it.', 'Soustrais a × h² ; ne l\'ajoute pas.'), 1]]),
    steps: [bi((f) => f.t(`Factor a from the x terms: ${f.m(`${f.n(a)}(x^{2} ${b / a < 0 ? '-' : '+'} ${f.n(Math.abs(b / a))}x) ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}. Half of ${f.N(b / a)} is ${f.N(h * -1)}.`, `Mets a en facteur dans les termes en x : ${f.m(`${f.n(a)}(x^{2} ${b / a < 0 ? '-' : '+'} ${f.n(Math.abs(b / a))}x) ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}`)}. La moitié de ${f.N(b / a)} est ${f.N(h * -1)}.`)), bi((f) => f.t(`Add and subtract ${f.m(`${f.n(a)} \\times ${f.n(h * h)}`)}: ${f.m(`k = ${f.n(c)} - ${f.n(a * h * h)}`)} = ${f.N(k)}.`, `Ajoute et retire ${f.m(`${f.n(a)} \\times ${f.n(h * h)}`)} : ${f.m(`k = ${f.n(c)} - ${f.n(a * h * h)}`)} = ${f.N(k)}.`))],
    nudge: t('Factor a out of the x terms, complete the square inside, then subtract a × (half of b ÷ a) squared.', 'Mets a en facteur dans les termes en x, complète le carré à l\'intérieur, puis soustrais a × (la moitié de b ÷ a) au carré.'),
  };
});

/** MCF3M.B1: exponent rules on numbers */
export const exponentRules11 = (id: string): Generator => numGen(id, (tier, r) => {
  const base = tier === 3 ? pick(r, [2, 5, 10]) : pick(r, [2, 3, 5, 10]);
  if (tier === 1) {
    const e1 = randInt(r, 2, 5), e2 = randInt(r, 2, 4), e3 = randInt(r, 1, e1 + e2 - 1), ans = base ** (e1 + e2 - e3);
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`\\frac{${f.n(base)}^{${f.n(e1)}} \\times ${f.n(base)}^{${f.n(e2)}}}{${f.n(base)}^{${f.n(e3)}}}`)}.`, `Évalue ${f.m(`\\frac{${f.n(base)}^{${f.n(e1)}} \\times ${f.n(base)}^{${f.n(e2)}}}{${f.n(base)}^{${f.n(e3)}}}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[base ** (e1 * e2 - e3), t('When you multiply powers with the same base, add the exponents.', 'Quand on multiplie des puissances de même base, on additionne les exposants.'), 0], [base ** (e1 + e2 + e3), t('When you divide powers with the same base, subtract the exponents.', 'Quand on divise des puissances de même base, on soustrait les exposants.'), 0], [(base * base) ** (e1 + e2 - e3), t('The base stays the same; only the exponents combine.', 'La base reste la même ; seuls les exposants se combinent.'), 0]]),
      steps: [bi((f) => f.t(`Add the exponents on top: ${f.m(`${f.n(base)}^{${f.n(e1 + e2)}}`)}. Then subtract the bottom exponent: ${f.m(`${f.n(base)}^{${f.n(e1 + e2 - e3)}}`)}.`, `Additionne les exposants au numérateur : ${f.m(`${f.n(base)}^{${f.n(e1 + e2)}}`)}. Puis soustrais l'exposant du dénominateur : ${f.m(`${f.n(base)}^{${f.n(e1 + e2 - e3)}}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(base)}^{${f.n(e1 + e2 - e3)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(base)}^{${f.n(e1 + e2 - e3)}}`)} = ${f.N(ans)}.`))],
      nudge: t('Same base: add exponents when multiplying, subtract when dividing.', 'Même base : additionne les exposants en multipliant, soustrais-les en divisant.'),
    };
  }
  if (tier === 2) {
    const e1 = randInt(r, 2, 3), e2 = randInt(r, 2, 3), e3 = randInt(r, 1, e1 * e2 - 1), ans = base ** (e1 * e2 - e3);
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`\\frac{(${f.n(base)}^{${f.n(e1)}})^{${f.n(e2)}}}{${f.n(base)}^{${f.n(e3)}}}`)}.`, `Évalue ${f.m(`\\frac{(${f.n(base)}^{${f.n(e1)}})^{${f.n(e2)}}}{${f.n(base)}^{${f.n(e3)}}}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[base ** (e1 + e2 - e3), t('A power of a power multiplies the exponents: (a^m)^n = a^(mn).', 'Une puissance de puissance multiplie les exposants : (a^m)^n = a^(mn).'), 0], [base ** (e1 * e2 + e3), t('Dividing subtracts the exponents.', 'Diviser soustrait les exposants.'), 0], [base ** (e1 ** e2 - e3), t('Multiply the two exponents; do not raise one to the other.', 'Multiplie les deux exposants ; n\'élève pas l\'un à l\'autre.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`(${f.n(base)}^{${f.n(e1)}})^{${f.n(e2)}} = ${f.n(base)}^{${f.n(e1 * e2)}}`)}. Then subtract: ${f.m(`${f.n(base)}^{${f.n(e1 * e2 - e3)}}`)}.`, `${f.m(`(${f.n(base)}^{${f.n(e1)}})^{${f.n(e2)}} = ${f.n(base)}^{${f.n(e1 * e2)}}`)}. Puis soustrais : ${f.m(`${f.n(base)}^{${f.n(e1 * e2 - e3)}}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(base)}^{${f.n(e1 * e2 - e3)}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(base)}^{${f.n(e1 * e2 - e3)}}`)} = ${f.N(ans)}.`))],
      nudge: t('A power of a power multiplies exponents; division subtracts them.', 'Une puissance de puissance multiplie les exposants ; la division les soustrait.'),
    };
  }
  const e1 = randInt(r, 1, 3), e2 = randInt(r, e1 + 1, e1 + 4), ans = r6(base ** (e1 - e2));
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(`${f.n(base)}^{${f.n(e1)}} \\times ${f.n(base)}^{-${f.n(e2)}}`)} as a decimal.`, `Évalue ${f.m(`${f.n(base)}^{${f.n(e1)}} \\times ${f.n(base)}^{-${f.n(e2)}}`)} sous forme décimale.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[-(base ** (e2 - e1)), t('A negative exponent gives a reciprocal, not a negative number.', 'Un exposant négatif donne un inverse, pas un nombre négatif.'), 1], [base ** (e2 - e1), t('The exponent e1 − e2 is negative, which means a reciprocal.', 'L\'exposant e1 − e2 est négatif, ce qui signifie un inverse.'), 1], [r6(base ** (e1 + e2)), t('Add the exponents, keeping the negative sign on the second.', 'Additionne les exposants en gardant le signe négatif du second.'), 1]]),
    steps: [bi((f) => f.t(`Add the exponents: ${f.m(`${f.n(e1)} + (-${f.n(e2)}) = ${f.n(e1 - e2)}`)}.`, `Additionne les exposants : ${f.m(`${f.n(e1)} + (-${f.n(e2)}) = ${f.n(e1 - e2)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(base)}^{${f.n(e1 - e2)}} = \\frac{1}{${f.n(base ** (e2 - e1))}}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(base)}^{${f.n(e1 - e2)}} = \\frac{1}{${f.n(base ** (e2 - e1))}}`)} = ${f.N(ans)}.`))],
    nudge: t('Add the exponents, then turn a negative exponent into a reciprocal.', 'Additionne les exposants, puis transforme un exposant négatif en inverse.'),
  };
});

/** MCF3M.B2: simple against compound interest */
export const simpleCompound11 = (id: string): Generator => numGen(id, (tier, r) => {
  const P = randInt(r, 1, 9) * 1000, rate = pick(r, [10, 20]), n = tier === 1 ? 2 : tier === 2 ? 3 : 4;
  const simple = P * (rate / 100) * n, compound = r6(P * (1 + rate / 100) ** n - P), diff = r6(compound - simple);
  if (tier < 3) {
    return {
      prompt: bi((f) => f.t(`${money(f, P)} is invested for ${f.N(n)} years at ${f.m(`${f.n(rate)}\\%`)} per year. How much more interest does compound interest (compounded annually) earn than simple interest, in dollars?`, `${money(f, P)} sont investis pendant ${f.N(n)} ans à ${f.m(`${f.n(rate)}\\%`)} par an. Combien d'intérêt de plus l'intérêt composé (composé annuellement) rapporte-t-il que l'intérêt simple, en dollars ?`)),
      answer: diff, category: 'AP',
      wrong: wr(diff, [[compound, t('That is the compound interest only. Subtract the simple interest.', 'C\'est seulement l\'intérêt composé. Soustrais l\'intérêt simple.'), 1], [simple, t('That is the simple interest only. Find the compound interest and subtract.', 'C\'est seulement l\'intérêt simple. Trouve l\'intérêt composé et soustrais.'), 1], [r6(P * (1 + rate / 100) ** n), t('That is the final amount, not the interest. Subtract the principal.', 'C\'est le montant final, pas l\'intérêt. Soustrais le capital.'), 1]]),
      steps: [bi((f) => f.t(`Simple interest: ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(n)}`)} = ${money(f, simple)}. Compound interest: ${f.m(`${f.n(P)}(1 + ${f.n(rate / 100)})^{${f.n(n)}} - ${f.n(P)}`)} = ${money(f, compound)}.`, `Intérêt simple : ${f.m(`${f.n(P)} \\times ${f.n(rate / 100)} \\times ${f.n(n)}`)} = ${money(f, simple)}. Intérêt composé : ${f.m(`${f.n(P)}(1 + ${f.n(rate / 100)})^{${f.n(n)}} - ${f.n(P)}`)} = ${money(f, compound)}.`)), bi((f) => f.t(`The difference is ${money(f, diff)}.`, `La différence est de ${money(f, diff)}.`))],
      nudge: t('Work out each interest amount (compound interest is the final amount minus the principal), then subtract.', 'Calcule chaque montant d\'intérêt (l\'intérêt composé est le montant final moins le capital), puis soustrais.'),
    };
  }
  const nn = 3, A = r6(P * 1.1 ** nn), simpleFinal = P + P * 0.1 * nn;
  return {
    prompt: bi((f) => f.t(`After ${f.N(nn)} years, ${money(f, P)} at ${f.m('10\\%')} per year compounded annually is worth ${money(f, A)}. How much less would it be worth with simple interest, in dollars?`, `Après ${f.N(nn)} ans, ${money(f, P)} à ${f.m('10\\%')} par an composé annuellement valent ${money(f, A)}. Combien de moins vaudraient-ils avec un intérêt simple, en dollars ?`)),
    answer: r6(A - simpleFinal), category: 'AP',
    wrong: wr(r6(A - simpleFinal), [[r6(simpleFinal), t('That is the value with simple interest. The question asks for the difference.', 'C\'est la valeur avec l\'intérêt simple. La question demande la différence.'), 1], [r6(A - P), t('That is the compound interest. Subtract the simple interest, not the principal.', 'C\'est l\'intérêt composé. Soustrais l\'intérêt simple, pas le capital.'), 1], [r6(P * 0.1 * nn), t('That is the simple interest alone.', 'C\'est l\'intérêt simple seul.'), 1]]),
    steps: [bi((f) => f.t(`Simple interest: ${f.m(`${f.n(P)} \\times 0.1 \\times ${f.n(nn)}`)} = ${money(f, P * 0.1 * nn)}, so the value is ${money(f, simpleFinal)}.`, `Intérêt simple : ${f.m(`${f.n(P)} \\times 0.1 \\times ${f.n(nn)}`)} = ${money(f, P * 0.1 * nn)} : la valeur est donc de ${money(f, simpleFinal)}.`)), bi((f) => f.t(`${f.m(`${f.n(A)} - ${f.n(simpleFinal)}`)} = ${money(f, A - simpleFinal)}.`, `${f.m(`${f.n(A)} - ${f.n(simpleFinal)}`)} = ${money(f, A - simpleFinal)}.`))],
    nudge: t('Find the value with simple interest, then subtract it from the compound value.', 'Trouve la valeur avec l\'intérêt simple, puis soustrais-la de la valeur composée.'),
  };
});

