// Grade 12 (MCV4U) Rate of Change and Derivatives and Their Applications: limits, first principles, derivatives of sinusoidal and
// exponential functions, the derivative rules, critical points and inflection points, and optimization. All answers are exact integers
// or terminating decimals.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';
import { expand, lin, polyTex } from './poly12.js';

const sgn = (n: number): string => (n < 0 ? '-' : '+');
const nz = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
/** A coefficient written before a variable: 1 is left out and -1 becomes a minus sign. */
const co = (f: F, k: number): string => (k === 1 ? '' : k === -1 ? '-' : f.n(k));
/** Terms like "+ 3" or "- 4" for a constant after another term, or '' when zero. */
const tail = (f: F, k: number): string => (k === 0 ? '' : ` ${sgn(k)} ${f.n(Math.abs(k))}`);
const same = (en: string, fr: string): Text => t(en, fr);

/** MCV4U.A1: limits */
export const limits12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nz(r, -6, 6);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`\\lim_{x \\to ${f.n(a)}} \\frac{x^2 - ${f.n(a * a)}}{${lin(f, a)}}`)}.`, `Évalue ${f.m(`\\lim_{x \\to ${f.n(a)}} \\frac{x^2 - ${f.n(a * a)}}{${lin(f, a)}}`)}.`)),
      answer: 2 * a, category: 'KU',
      wrong: wr(2 * a, [[0, same('Putting x = a in gives 0 over 0, which is not an answer. Factor the numerator and cancel first.', 'Remplacer x par a donne 0 sur 0, ce qui n\'est pas une réponse. Factorise d\'abord le numérateur et simplifie.'), 0], [a * a, same('Cancel the common factor first, then put in the value.', 'Simplifie d\'abord le facteur commun, puis remplace par la valeur.'), 1]]),
      steps: [bi((f) => f.t(`Factor: ${f.m(`x^2 - ${f.n(a * a)} = (${lin(f, a)})(${lin(f, -a)})`)}, so the fraction simplifies to ${f.m(lin(f, -a))}.`, `Factorise : ${f.m(`x^2 - ${f.n(a * a)} = (${lin(f, a)})(${lin(f, -a)})`)} : la fraction se simplifie en ${f.m(lin(f, -a))}.`)), bi((f) => f.t(`Put x = ${f.N(a)}: ${f.m(`${f.n(a)} + ${f.n(a)}`)} = ${f.N(2 * a)}.`, `Remplace x par ${f.N(a)} : ${f.m(`${f.n(a)} + ${f.n(a)}`)} = ${f.N(2 * a)}.`))],
      nudge: same('Factor the numerator and cancel the factor that makes the denominator zero.', 'Factorise le numérateur et simplifie le facteur qui annule le dénominateur.'),
    };
  }
  if (tier === 2) {
    const m = nz(r, -6, 6), num = expand(1, [a, -m]); // (x - a)(x + m)
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(`\\lim_{x \\to ${f.n(a)}} \\frac{${polyTex(f, num)}}{${lin(f, a)}}`)}.`, `Évalue ${f.m(`\\lim_{x \\to ${f.n(a)}} \\frac{${polyTex(f, num)}}{${lin(f, a)}}`)}.`)),
      answer: a + m, category: 'AP',
      wrong: wr(a + m, [[m, same('Factor the numerator, cancel x minus a, and put in the value of x in what is left.', 'Factorise le numérateur, simplifie x moins a, et remplace x par la valeur dans ce qui reste.'), 1], [a - m, same('Check the sign in the second factor.', 'Vérifie le signe du deuxième facteur.'), 0]]),
      steps: [bi((f) => f.t(`The numerator factors as ${f.m(`(${lin(f, a)})(${lin(f, -m)})`)}, so the fraction simplifies to ${f.m(lin(f, -m))}.`, `Le numérateur se factorise en ${f.m(`(${lin(f, a)})(${lin(f, -m)})`)} : la fraction se simplifie en ${f.m(lin(f, -m))}.`)), bi((f) => f.t(`${f.m(`${f.n(a)} ${sgn(m)} ${f.n(Math.abs(m))}`)} = ${f.N(a + m)}.`, `${f.m(`${f.n(a)} ${sgn(m)} ${f.n(Math.abs(m))}`)} = ${f.N(a + m)}.`))],
      nudge: same('Factor the numerator so that x minus a appears, then cancel.', 'Factorise le numérateur pour faire apparaître x moins a, puis simplifie.'),
    };
  }
  const q = pick(r, [1, 2, 3, 4]), p = q * nz(r, -4, 4), u = randInt(r, 1, 9), v = randInt(r, 1, 9);
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(`\\lim_{x \\to \\infty} \\frac{${f.n(p)}x^2 + ${f.n(u)}x}{${co(f, q)}x^2 - ${f.n(v)}}`)}.`, `Évalue ${f.m(`\\lim_{x \\to \\infty} \\frac{${f.n(p)}x^2 + ${f.n(u)}x}{${co(f, q)}x^2 - ${f.n(v)}}`)}.`)),
    answer: p / q, category: 'TH',
    wrong: wr(p / q, [[0, same('The degrees are equal, so the limit is the ratio of the leading coefficients, not zero.', 'Les degrés sont égaux : la limite est le rapport des coefficients dominants, et non zéro.'), 1], [q / p, same('Put the numerator\'s coefficient on top.', 'Mets le coefficient du numérateur en haut.'), 1]]),
    steps: [same('Divide the top and bottom by the highest power of x. The other terms go to zero.', 'Divise le numérateur et le dénominateur par la plus haute puissance de x. Les autres termes tendent vers zéro.'), bi((f) => f.t(`The limit is ${f.m(`\\frac{${f.n(p)}}{${f.n(q)}}`)} = ${f.N(p / q)}.`, `La limite est ${f.m(`\\frac{${f.n(p)}}{${f.n(q)}}`)} = ${f.N(p / q)}.`))],
    nudge: same('For equal degrees, divide the leading coefficients.', 'Pour des degrés égaux, divise les coefficients dominants.'),
  };
});

/** MCV4U.A1: the derivative from first principles, f'(x0) = lim (f(x0 + h) - f(x0)) / h */
export const firstPrinciples12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nz(r, -4, 4), b = randInt(r, -5, 5), c = randInt(r, -5, 5), x0 = randInt(r, -3, 4);
  const defn = (f: F): string => f.m("f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}");
  if (tier === 3) {
    const ans = 3 * a * x0 * x0;
    return {
      prompt: bi((f) => f.t(`Using ${defn(f)}, find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = ${co(f, a)}x^3`)}.`, `En utilisant ${defn(f)}, trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = ${co(f, a)}x^3`)}.`)),
      answer: ans, category: 'TH',
      wrong: wr(ans, [[2 * a * x0, same('The difference quotient for x cubed leaves 3x squared, not 2x.', 'Le taux de variation de x au cube donne 3x au carré, et non 2x.'), 1], [3 * a * x0, same('Square x before multiplying by 3a.', 'Élève x au carré avant de multiplier par 3a.'), 1]]),
      steps: [bi((f) => f.t(`Expand ${f.m('(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3')}. The difference quotient is ${f.m(`${co(f, a)}(3x^2 + 3xh + h^2)`)}.`, `Développe ${f.m('(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3')}. Le taux de variation est ${f.m(`${co(f, a)}(3x^2 + 3xh + h^2)`)}.`)), bi((f) => f.t(`As h goes to 0 it becomes ${f.m(`${f.n(3 * a)}x^2`)}. At x = ${f.N(x0)}: ${f.N(ans)}.`, `Quand h tend vers 0, cela devient ${f.m(`${f.n(3 * a)}x^2`)}. En x = ${f.N(x0)} : ${f.N(ans)}.`))],
      nudge: same('Expand (x + h) cubed, subtract f(x), divide by h, then let h go to zero.', 'Développe (x + h) au cube, soustrais f(x), divise par h, puis laisse h tendre vers zéro.'),
    };
  }
  const q = tier === 1 ? 0 : b, k = tier === 1 ? 0 : c;
  const ans = 2 * a * x0 + q;
  return {
    prompt: bi((f) => f.t(`Using ${defn(f)}, find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = ${co(f, a)}x^2${q === 0 ? '' : ` ${sgn(q)} ${co(f, Math.abs(q))}x`}${tail(f, k)}`)}.`, `En utilisant ${defn(f)}, trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = ${co(f, a)}x^2${q === 0 ? '' : ` ${sgn(q)} ${co(f, Math.abs(q))}x`}${tail(f, k)}`)}.`)),
    answer: ans, category: tier === 1 ? 'KU' : 'AP',
    wrong: wr(ans, [[a * x0 * x0, same('The difference quotient simplifies to 2ax + ah + b; then h goes to zero.', 'Le taux de variation se simplifie en 2ax + ah + b ; puis h tend vers zéro.'), 1], [2 * a * x0 + q + k, same('The constant drops out of the difference quotient, because it cancels in f(x + h) minus f(x).', 'La constante disparaît du taux de variation, car elle s\'annule dans f(x + h) moins f(x).'), 1], [2 * a + q, same('Put x in: the term 2ax needs the value of x.', 'Remplace x : le terme 2ax a besoin de la valeur de x.'), 1]]),
    steps: [bi((f) => f.t(`The difference quotient simplifies to ${f.m(`${f.n(2 * a)}x + ${f.n(a)}h${q === 0 ? '' : ` ${sgn(q)} ${f.n(Math.abs(q))}`}`)}.`, `Le taux de variation se simplifie en ${f.m(`${f.n(2 * a)}x + ${f.n(a)}h${q === 0 ? '' : ` ${sgn(q)} ${f.n(Math.abs(q))}`}`)}.`)), bi((f) => f.t(`As h goes to 0, ${f.m(`f'(x) = ${f.n(2 * a)}x${q === 0 ? '' : ` ${sgn(q)} ${f.n(Math.abs(q))}`}`)}, so ${f.m(`f'(${f.n(x0)})`)} = ${f.N(ans)}.`, `Quand h tend vers 0, ${f.m(`f'(x) = ${f.n(2 * a)}x${q === 0 ? '' : ` ${sgn(q)} ${f.n(Math.abs(q))}`}`)}, donc ${f.m(`f'(${f.n(x0)})`)} = ${f.N(ans)}.`))],
    nudge: same('Expand f(x + h), subtract f(x), divide by h, then let h go to zero.', 'Développe f(x + h), soustrais f(x), divise par h, puis laisse h tendre vers zéro.'),
  };
});

/** MCV4U.A2: derivatives of sinusoidal and exponential functions */
export const trigExpDeriv12 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nz(r, -5, 5), b = nz(r, -5, 5), c = nz(r, -4, 4);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Find ${f.m("f'(0)")} for ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}e^x`)}.`, `Trouve ${f.m("f'(0)")} pour ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}e^x`)}.`)),
      answer: a + b, category: 'KU',
      wrong: wr(a + b, [[b, same('The derivative of sin x is cos x, and cos 0 is 1, not 0.', 'La dérivée de sin x est cos x, et cos 0 égale 1, et non 0.'), 1], [-a + b, same('The derivative of sine is cosine, with no sign change.', 'La dérivée du sinus est le cosinus, sans changement de signe.'), 0], [a, same('The derivative of e to the x is e to the x, and it is 1 at 0.', 'La dérivée de e à la x est e à la x, qui égale 1 en 0.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`f'(x) = ${co(f, a)}\\cos x ${sgn(b)} ${co(f, Math.abs(b))}e^x`)}.`, `${f.m(`f'(x) = ${co(f, a)}\\cos x ${sgn(b)} ${co(f, Math.abs(b))}e^x`)}.`)), bi((f) => f.t(`At 0, cos 0 = 1 and ${f.m('e^0')} = 1, so ${f.m(`f'(0)`)} = ${f.N(a + b)}.`, `En 0, cos 0 = 1 et ${f.m('e^0')} = 1, donc ${f.m(`f'(0)`)} = ${f.N(a + b)}.`))],
      nudge: same('The derivative of sin x is cos x, and the derivative of e to the x is e to the x.', 'La dérivée de sin x est cos x, et la dérivée de e à la x est e à la x.'),
    };
  }
  if (tier === 2) {
    const x0 = pick(r, ['0', '\\frac{\\pi}{2}', '\\pi'] as const);
    const cs = x0 === '0' ? { cos: 1, sin: 0 } : x0 === '\\pi' ? { cos: -1, sin: 0 } : { cos: 0, sin: 1 };
    const ans = a * cs.cos - b * cs.sin;
    return {
      prompt: bi((f) => f.t(`Find ${f.m(`f'\\left(${x0}\\right)`)} for ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}\\cos x`)}.`, `Trouve ${f.m(`f'\\left(${x0}\\right)`)} pour ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}\\cos x`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a * cs.cos + b * cs.sin, same('The derivative of cos x is negative sin x.', 'La dérivée de cos x est moins sin x.'), 0], [a * cs.sin - b * cs.cos, same('The derivative of sin x is cos x, not the other way round.', 'La dérivée de sin x est cos x, et non l\'inverse.'), 0], [a * cs.sin + b * cs.cos, same('Differentiate first: sin becomes cos and cos becomes negative sin.', 'Dérive d\'abord : sin devient cos et cos devient moins sin.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`f'(x) = ${co(f, a)}\\cos x ${sgn(-b)} ${co(f, Math.abs(b))}\\sin x`)}.`, `${f.m(`f'(x) = ${co(f, a)}\\cos x ${sgn(-b)} ${co(f, Math.abs(b))}\\sin x`)}.`)), bi((f) => f.t(`With cos = ${f.N(cs.cos)} and sin = ${f.N(cs.sin)} at that angle, the value is ${f.N(ans)}.`, `Avec cos = ${f.N(cs.cos)} et sin = ${f.N(cs.sin)} à cet angle, la valeur est ${f.N(ans)}.`))],
      nudge: same('sin x becomes cos x, and cos x becomes negative sin x. Then put in the angle.', 'sin x devient cos x, et cos x devient moins sin x. Puis remplace l\'angle.'),
    };
  }
  const ans = -b + c;
  return {
    prompt: bi((f) => f.t(`Find ${f.m("f''(0)")}, the second derivative at 0, for ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}\\cos x ${sgn(c)} ${co(f, Math.abs(c))}e^x`)}.`, `Trouve ${f.m("f''(0)")}, la dérivée seconde en 0, pour ${f.m(`f(x) = ${co(f, a)}\\sin x ${sgn(b)} ${co(f, Math.abs(b))}\\cos x ${sgn(c)} ${co(f, Math.abs(c))}e^x`)}.`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[b + c, same('Differentiate twice: cos becomes negative sin and then negative cos.', 'Dérive deux fois : cos devient moins sin, puis moins cos.'), 1], [-b - c, same('The exponential stays the same, with its sign.', 'L\'exponentielle reste la même, avec son signe.'), 1], [a - b + c, same('Sine twice becomes negative sine, which is 0 at 0.', 'Le sinus deux fois devient moins sinus, qui égale 0 en 0.'), 1]]),
    steps: [bi((f) => f.t(`Each term: sin goes to cos to negative sin; cos goes to negative sin to negative cos; ${f.m('e^x')} stays. So ${f.m(`f''(x) = ${f.n(-a)}\\sin x ${sgn(-b)} ${co(f, Math.abs(b))}\\cos x ${sgn(c)} ${co(f, Math.abs(c))}e^x`)}.`, `Chaque terme : sin donne cos puis moins sin ; cos donne moins sin puis moins cos ; ${f.m('e^x')} reste. Donc ${f.m(`f''(x) = ${f.n(-a)}\\sin x ${sgn(-b)} ${co(f, Math.abs(b))}\\cos x ${sgn(c)} ${co(f, Math.abs(c))}e^x`)}.`)), bi((f) => f.t(`At 0: ${f.N(-b)} + ${f.N(c)} = ${f.N(ans)}.`, `En 0 : ${f.N(-b)} + ${f.N(c)} = ${f.N(ans)}.`))],
    nudge: same('Differentiate twice, then put in x = 0 (sin 0 = 0, cos 0 = 1, e to the 0 = 1).', 'Dérive deux fois, puis remplace x = 0 (sin 0 = 0, cos 0 = 1, e à la 0 = 1).'),
  };
});

/** The derivative of a polynomial given by coefficients (highest power first), evaluated at x. */
const dPoly = (c: number[], x: number): number => c.slice(0, -1).reduce((s, k, i) => s + k * (c.length - 1 - i) * x ** (c.length - 2 - i), 0);

/** MCV4U.A3: power, constant multiple and sum rules */
export const powerRule12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 3, 5), a = nz(r, -4, 4), b = nz(r, -5, 5), c = randInt(r, -6, 6), x0 = randInt(r, -2, 3);
    const coeffs = Array.from({ length: n + 1 }, () => 0); coeffs[0] = a; coeffs[n - 2] = (coeffs[n - 2] ?? 0) + b; coeffs[n] = c;
    const ans = dPoly(coeffs, x0);
    return {
      prompt: bi((f) => f.t(`Find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = ${polyTex(f, coeffs)}`)}.`, `Trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = ${polyTex(f, coeffs)}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[coeffs.reduce((s, k, i) => s + k * x0 ** (n - i), 0), same('That is f(x), the value of the function. Differentiate first.', 'C\'est f(x), la valeur de la fonction. Dérive d\'abord.'), 0], [dPoly(coeffs, x0) + c, same('A constant has derivative 0.', 'La dérivée d\'une constante est zéro.'), 0]]),
      steps: [bi((f) => f.t(`Multiply each coefficient by its exponent and lower the exponent by 1: ${f.m(`f'(x) = ${polyTex(f, coeffs.slice(0, -1).map((k, i) => k * (n - i)))}`)}.`, `Multiplie chaque coefficient par son exposant et diminue l'exposant de 1 : ${f.m(`f'(x) = ${polyTex(f, coeffs.slice(0, -1).map((k, i) => k * (n - i)))}`)}.`)), bi((f) => f.t(`Put in x = ${f.N(x0)} to get ${f.N(ans)}.`, `Remplace x par ${f.N(x0)} pour obtenir ${f.N(ans)}.`))],
      nudge: same('Power rule: bring the exponent down as a multiplier and reduce the exponent by 1.', 'Règle de la puissance : fais descendre l\'exposant comme multiplicateur et diminue l\'exposant de 1.'),
    };
  }
  if (tier === 2) {
    const x0 = pick(r, [-2, -1, 1, 2]), a = 4 * nz(r, -3, 3), b = nz(r, -3, 3);
    const ans = -a / (x0 * x0) + 3 * b * x0 * x0;
    return {
      prompt: bi((f) => f.t(`Find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = \\frac{${f.n(a)}}{x} ${sgn(b)} ${f.n(Math.abs(b))}x^3`)}.`, `Trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = \\frac{${f.n(a)}}{x} ${sgn(b)} ${f.n(Math.abs(b))}x^3`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a / (x0 * x0) + 3 * b * x0 * x0, same('Write a over x as a times x to the power negative 1. Its derivative is negative a times x to the power negative 2.', 'Écris a sur x comme a fois x à la puissance moins 1. Sa dérivée est moins a fois x à la puissance moins 2.'), 0], [-a / x0 + 3 * b * x0 * x0, same('Reduce the exponent: negative 1 becomes negative 2, so divide by x squared.', 'Diminue l\'exposant : moins 1 devient moins 2, donc divise par x au carré.'), 1]]),
      steps: [bi((f) => f.t(`Write ${f.m(`f(x) = ${f.n(a)}x^{-1} ${sgn(b)} ${f.n(Math.abs(b))}x^3`)}, so ${f.m(`f'(x) = ${f.n(-a)}x^{-2} ${sgn(b)} ${f.n(Math.abs(3 * b))}x^2`)}.`, `Écris ${f.m(`f(x) = ${f.n(a)}x^{-1} ${sgn(b)} ${f.n(Math.abs(b))}x^3`)}, donc ${f.m(`f'(x) = ${f.n(-a)}x^{-2} ${sgn(b)} ${f.n(Math.abs(3 * b))}x^2`)}.`)), bi((f) => f.t(`At x = ${f.N(x0)}: ${f.N(ans)}.`, `En x = ${f.N(x0)} : ${f.N(ans)}.`))],
      nudge: same('Rewrite the fraction as a power with a negative exponent, then use the power rule.', 'Réécris la fraction comme une puissance à exposant négatif, puis utilise la règle de la puissance.'),
    };
  }
  const a = nz(r, -3, 3), b = nz(r, -4, 4), x0 = randInt(r, -3, 4), ans = 2 * a * x0 + b;
  return {
    prompt: bi((f) => f.t(`Simplify first, then find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = \\frac{${co(f, a)}x^3 ${sgn(b)} ${co(f, Math.abs(b))}x^2}{x}`)}.`, `Simplifie d'abord, puis trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = \\frac{${co(f, a)}x^3 ${sgn(b)} ${co(f, Math.abs(b))}x^2}{x}`)}.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[3 * a * x0 * x0 + 2 * b * x0, same('Divide each term by x first: the function is a quadratic, so its derivative is linear.', 'Divise d\'abord chaque terme par x : la fonction est du second degré, donc sa dérivée est du premier degré.'), 0], [a * x0 * x0 + b * x0, same('That is the simplified function. Differentiate it.', 'C\'est la fonction simplifiée. Dérive-la.'), 1]]),
    steps: [bi((f) => f.t(`Divide by x: ${f.m(`f(x) = ${co(f, a)}x^2 ${sgn(b)} ${co(f, Math.abs(b))}x`)}.`, `Divise par x : ${f.m(`f(x) = ${co(f, a)}x^2 ${sgn(b)} ${co(f, Math.abs(b))}x`)}.`)), bi((f) => f.t(`${f.m(`f'(x) = ${f.n(2 * a)}x ${sgn(b)} ${f.n(Math.abs(b))}`)}, so ${f.m(`f'(${f.n(x0)})`)} = ${f.N(ans)}.`, `${f.m(`f'(x) = ${f.n(2 * a)}x ${sgn(b)} ${f.n(Math.abs(b))}`)}, donc ${f.m(`f'(${f.n(x0)})`)} = ${f.N(ans)}.`))],
    nudge: same('Divide each term by x before you differentiate.', 'Divise chaque terme par x avant de dériver.'),
  };
});

/** MCV4U.A3: product and quotient rules */
export const productQuotient12 = (id: string): Generator => numGen(id, (tier, r) => {
  const x0 = randInt(r, -3, 4);
  if (tier === 1) {
    const a = nz(r, -5, 5), b = nz(r, -5, 5), ans = (x0 + b) + (x0 + a);
    return {
      prompt: bi((f) => f.t(`Use the product rule to find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = (${lin(f, -a)})(${lin(f, -b)})`)}.`, `Utilise la règle du produit pour trouver ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = (${lin(f, -a)})(${lin(f, -b)})`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[(x0 + a) * (x0 + b), same('That is f(x). For the derivative, add the derivative of the first times the second, and the first times the derivative of the second.', 'C\'est f(x). Pour la dérivée, additionne la dérivée du premier fois le second, et le premier fois la dérivée du second.'), 0], [1, same('Do not multiply the two derivatives. Use the product rule.', 'Ne multiplie pas les deux dérivées. Utilise la règle du produit.'), 0]]),
      steps: [bi((f) => f.t(`${f.m("f'(x) = (1)(x + b) + (x + a)(1)")} with a = ${f.N(a)} and b = ${f.N(b)}.`, `${f.m("f'(x) = (1)(x + b) + (x + a)(1)")} avec a = ${f.N(a)} et b = ${f.N(b)}.`)), bi((f) => f.t(`At x = ${f.N(x0)}: ${f.m(`${f.n(x0 + b)} + ${f.n(x0 + a)}`)} = ${f.N(ans)}.`, `En x = ${f.N(x0)} : ${f.m(`${f.n(x0 + b)} + ${f.n(x0 + a)}`)} = ${f.N(ans)}.`))],
      nudge: same('Product rule: derivative of the first times the second, plus the first times the derivative of the second.', 'Règle du produit : dérivée du premier fois le second, plus le premier fois la dérivée du second.'),
    };
  }
  if (tier === 2) {
    const a = nz(r, -4, 4), b = randInt(r, -5, 5), c = randInt(r, -5, 5), ans = a * (x0 * x0 + c) + (a * x0 + b) * 2 * x0;
    return {
      prompt: bi((f) => f.t(`Use the product rule to find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = (${co(f, a)}x${tail(f, b)})(x^2${tail(f, c)})`)}.`, `Utilise la règle du produit pour trouver ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = (${co(f, a)}x${tail(f, b)})(x^2${tail(f, c)})`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a * 2 * x0, same('Do not multiply the derivatives. Use the product rule with both parts.', 'Ne multiplie pas les dérivées. Utilise la règle du produit avec les deux parties.'), 0], [(a * x0 + b) * (x0 * x0 + c), same('That is f(x), not the derivative.', 'C\'est f(x), et non la dérivée.'), 0], [a * (x0 * x0 + c), same('Add the second part: the first times the derivative of the second.', 'Ajoute la deuxième partie : le premier fois la dérivée du second.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`f'(x) = (${f.n(a)})(x^2${tail(f, c)}) + (${co(f, a)}x${tail(f, b)})(2x)`)}.`, `${f.m(`f'(x) = (${f.n(a)})(x^2${tail(f, c)}) + (${co(f, a)}x${tail(f, b)})(2x)`)}.`)), bi((f) => f.t(`At x = ${f.N(x0)}: ${f.N(ans)}.`, `En x = ${f.N(x0)} : ${f.N(ans)}.`))],
      nudge: same('Differentiate each factor, then combine: (first)\' × second + first × (second)\'.', 'Dérive chaque facteur, puis combine : (premier)\' × second + premier × (second)\'.'),
    };
  }
  const d = pick(r, [1, 2, -1, -2]), c = d - x0, a = nz(r, -4, 4), m = randInt(r, -3, 3), b = a * c - 4 * m;
  const ans = (a * c - b) / (d * d);
  return {
    prompt: bi((f) => f.t(`Use the quotient rule to find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = \\frac{${co(f, a)}x${tail(f, b)}}{x${tail(f, c)}}`)}.`, `Utilise la règle du quotient pour trouver ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = \\frac{${co(f, a)}x${tail(f, b)}}{x${tail(f, c)}}`)}.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[(b - a * c) / (d * d), same('Quotient rule: (top\' × bottom − top × bottom\') ÷ bottom squared. Check the order of the subtraction.', 'Règle du quotient : (numérateur\' × dénominateur − numérateur × dénominateur\') ÷ dénominateur au carré. Vérifie l\'ordre de la soustraction.'), 1], [a * c - b, same('Divide by the denominator squared.', 'Divise par le carré du dénominateur.'), 1], [a / 1, same('Do not just divide the derivatives. Use the quotient rule.', 'Ne divise pas simplement les dérivées. Utilise la règle du quotient.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`f'(x) = \\frac{(${f.n(a)})(x${tail(f, c)}) - (${co(f, a)}x${tail(f, b)})(1)}{(x${tail(f, c)})^2}`)}, which simplifies to ${f.m(`\\frac{${f.n(a * c - b)}}{(x${tail(f, c)})^2}`)}.`, `${f.m(`f'(x) = \\frac{(${f.n(a)})(x${tail(f, c)}) - (${co(f, a)}x${tail(f, b)})(1)}{(x${tail(f, c)})^2}`)}, ce qui se simplifie en ${f.m(`\\frac{${f.n(a * c - b)}}{(x${tail(f, c)})^2}`)}.`)), bi((f) => f.t(`At x = ${f.N(x0)} the denominator is ${f.m(`${f.n(d)}^2 = ${f.n(d * d)}`)}, so the value is ${f.N(ans)}.`, `En x = ${f.N(x0)}, le dénominateur est ${f.m(`${f.n(d)}^2 = ${f.n(d * d)}`)} : la valeur est ${f.N(ans)}.`))],
    nudge: same('Quotient rule: (top\' × bottom − top × bottom\') divided by bottom squared.', 'Règle du quotient : (numérateur\' × dénominateur − numérateur × dénominateur\') divisé par le carré du dénominateur.'),
  };
});

/** MCV4U.A3: the chain rule */
export const chainRule12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = nz(r, -3, 3), b = randInt(r, -4, 4), n = randInt(r, 2, 4), x0 = randInt(r, -2, 2), inner = a * x0 + b, ans = n * a * inner ** (n - 1);
    return {
      prompt: bi((f) => f.t(`Find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = (${co(f, a)}x${tail(f, b)})^{${f.n(n)}}`)}.`, `Trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = (${co(f, a)}x${tail(f, b)})^{${f.n(n)}}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[n * inner ** (n - 1), same('Multiply by the derivative of the inside, which is a.', 'Multiplie par la dérivée de l\'intérieur, qui est a.'), 1], [n * a * inner ** n, same('Lower the exponent by 1.', 'Diminue l\'exposant de 1.'), 1], [inner ** n, same('That is f(x). Differentiate it with the chain rule.', 'C\'est f(x). Dérive-la avec la règle de dérivation en chaîne.'), 0]]),
      steps: [bi((f) => f.t(`Chain rule: ${f.m(`f'(x) = ${f.n(n)}(${co(f, a)}x${tail(f, b)})^{${f.n(n - 1)}} \\times ${f.n(a)}`)}.`, `Règle en chaîne : ${f.m(`f'(x) = ${f.n(n)}(${co(f, a)}x${tail(f, b)})^{${f.n(n - 1)}} \\times ${f.n(a)}`)}.`)), bi((f) => f.t(`At x = ${f.N(x0)} the inside is ${f.N(inner)}, so the value is ${f.N(ans)}.`, `En x = ${f.N(x0)}, l'intérieur vaut ${f.N(inner)} : la valeur est ${f.N(ans)}.`))],
      nudge: same('Outer derivative with the inside kept, times the derivative of the inside.', 'Dérivée de l\'extérieur en gardant l\'intérieur, fois la dérivée de l\'intérieur.'),
    };
  }
  if (tier === 2) {
    const kind = pick(r, ['sin', 'exp'] as const), k = nz(r, -5, 5);
    const ans = k;
    return {
      prompt: bi((f) => f.t(`Find ${f.m("f'(0)")} for ${f.m(kind === 'sin' ? `f(x) = \\sin(${co(f, k)}x)` : `f(x) = e^{${co(f, k)}x}`)}.`, `Trouve ${f.m("f'(0)")} pour ${f.m(kind === 'sin' ? `f(x) = \\sin(${co(f, k)}x)` : `f(x) = e^{${co(f, k)}x}`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[1, same('Multiply by the derivative of the inside, which is k.', 'Multiplie par la dérivée de l\'intérieur, qui est k.'), 1], [0, same(kind === 'sin' ? 'The derivative of sine is cosine, and cos 0 is 1, not 0.' : 'At 0 the exponential is 1, not 0.', kind === 'sin' ? 'La dérivée du sinus est le cosinus, et cos 0 égale 1, et non 0.' : 'En 0, l\'exponentielle vaut 1, et non 0.'), 1], [k * k, same('The inside has derivative k, used once.', 'L\'intérieur a pour dérivée k, utilisée une seule fois.'), 1]]),
      steps: [bi((f) => f.t(kind === 'sin' ? `${f.m(`f'(x) = ${co(f, k)}\\cos(${co(f, k)}x)`)}.` : `${f.m(`f'(x) = ${co(f, k)}e^{${co(f, k)}x}`)}.`, kind === 'sin' ? `${f.m(`f'(x) = ${co(f, k)}\\cos(${co(f, k)}x)`)}.` : `${f.m(`f'(x) = ${co(f, k)}e^{${co(f, k)}x}`)}.`)), bi((f) => f.t(`At 0, cos 0 = 1 and ${f.m('e^0')} = 1, so ${f.m("f'(0)")} = ${f.N(ans)}.`, `En 0, cos 0 = 1 et ${f.m('e^0')} = 1, donc ${f.m("f'(0)")} = ${f.N(ans)}.`))],
      nudge: same('Differentiate the outer function, keep the inside, and multiply by the derivative of the inside.', 'Dérive la fonction extérieure, garde l\'intérieur, et multiplie par la dérivée de l\'intérieur.'),
    };
  }
  const s = randInt(r, 1, 4), k = nz(r, -3, 3), a = 2 * s * k, x0 = randInt(r, -3, 4), b = s * s - a * x0;
  return {
    prompt: bi((f) => f.t(`Find ${f.m(`f'(${f.n(x0)})`)} for ${f.m(`f(x) = \\sqrt{${co(f, a)}x${tail(f, b)}}`)}.`, `Trouve ${f.m(`f'(${f.n(x0)})`)} pour ${f.m(`f(x) = \\sqrt{${co(f, a)}x${tail(f, b)}}`)}.`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[a / s, same('The derivative of the square root is 1 over twice the root, so divide by 2s.', 'La dérivée de la racine carrée est 1 sur deux fois la racine : divise par 2s.'), 1], [r6(1 / (2 * s)), same('Multiply by the derivative of the inside, a.', 'Multiplie par la dérivée de l\'intérieur, a.'), 1], [r6(a / (2 * s * s)), same('The root at that point is s, not s squared.', 'La racine en ce point est s, et non s au carré.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`f'(x) = \\frac{${f.n(a)}}{2\\sqrt{${co(f, a)}x${tail(f, b)}}}`)}.`, `${f.m(`f'(x) = \\frac{${f.n(a)}}{2\\sqrt{${co(f, a)}x${tail(f, b)}}}`)}.`)), bi((f) => f.t(`At x = ${f.N(x0)} the inside is ${f.N(s * s)}, so the root is ${f.N(s)} and the value is ${f.m(`\\frac{${f.n(a)}}{${f.n(2 * s)}}`)} = ${f.N(k)}.`, `En x = ${f.N(x0)}, l'intérieur vaut ${f.N(s * s)}, la racine est ${f.N(s)} et la valeur est ${f.m(`\\frac{${f.n(a)}}{${f.n(2 * s)}}`)} = ${f.N(k)}.`))],
    nudge: same('The derivative of a square root is the derivative of the inside over twice the root.', 'La dérivée d\'une racine carrée est la dérivée de l\'intérieur sur deux fois la racine.'),
  };
});

/** MCV4U.B1: critical points and points of inflection */
export const curveFeatures12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = nz(r, -3, 3), m = randInt(r, -4, 4), b = -2 * a * m, c = randInt(r, -6, 6), isMax = a < 0;
    return {
      prompt: bi((f) => f.t(`What is the x-coordinate of the local ${isMax ? 'maximum' : 'minimum'} of ${f.m(`f(x) = ${polyTex(f, [a, b, c])}`)}?`, `Quelle est l'abscisse du ${isMax ? 'maximum' : 'minimum'} local de ${f.m(`f(x) = ${polyTex(f, [a, b, c])}`)} ?`)),
      answer: m, category: 'KU',
      wrong: wr(m, [[-m, same('Set the derivative to zero and solve: 2ax + b = 0 gives x = negative b over 2a.', 'Pose la dérivée égale à zéro et résous : 2ax + b = 0 donne x = moins b sur 2a.'), 1], [r6(c / a), same('The critical point comes from the derivative, not from the constant.', 'Le point critique vient de la dérivée, et non de la constante.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`f'(x) = ${f.n(2 * a)}x ${sgn(b)} ${f.n(Math.abs(b))}`)}. Set it to 0.`, `${f.m(`f'(x) = ${f.n(2 * a)}x ${sgn(b)} ${f.n(Math.abs(b))}`)}. Pose-la égale à 0.`)), bi((f) => f.t(`x = ${f.N(m)}.`, `x = ${f.N(m)}.`))],
      nudge: same('Set the first derivative equal to zero and solve.', 'Pose la dérivée première égale à zéro et résous.'),
    };
  }
  if (tier === 2) {
    const k = randInt(r, 1, 4), a = pick(r, [1, 2]);
    return {
      prompt: bi((f) => f.t(`${f.m(`f(x) = ${co(f, a)}x^3 - ${f.n(3 * a * k * k)}x`)} has a local maximum at x = ?`, `${f.m(`f(x) = ${co(f, a)}x^3 - ${f.n(3 * a * k * k)}x`)} a un maximum local en x = ?`)),
      answer: -k, category: 'AP',
      wrong: wr(-k, [[k, same('The derivative is zero at both k and negative k. Check the sign of f prime on each side: the maximum is where f prime changes from positive to negative.', 'La dérivée égale zéro en k et en moins k. Vérifie le signe de f\' de chaque côté : le maximum est là où f\' passe de positif à négatif.'), 1], [0, same('Set the derivative to zero: 3a x squared minus a constant, not x itself.', 'Pose la dérivée égale à zéro : 3a x au carré moins une constante, et non x lui-même.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`f'(x) = ${f.n(3 * a)}x^2 - ${f.n(3 * a * k * k)} = ${f.n(3 * a)}(x - ${f.n(k)})(x + ${f.n(k)})`)}, so the critical points are x = ±${f.N(k)}.`, `${f.m(`f'(x) = ${f.n(3 * a)}x^2 - ${f.n(3 * a * k * k)} = ${f.n(3 * a)}(x - ${f.n(k)})(x + ${f.n(k)})`)} : les points critiques sont x = ±${f.N(k)}.`)), bi((f) => f.t(`f prime goes from positive to negative at x = ${f.N(-k)}, so that is the local maximum.`, `f' passe de positif à négatif en x = ${f.N(-k)} : c'est le maximum local.`))],
      nudge: same('Find where f prime is zero, then check where it changes from positive to negative.', 'Trouve où f\' égale zéro, puis vérifie où elle passe de positive à négative.'),
    };
  }
  const a = pick(r, [1, 2]), m = randInt(r, -3, 3), b = -3 * a * m, c = randInt(r, -5, 5), d = randInt(r, -5, 5);
  return {
    prompt: bi((f) => f.t(`At what x does ${f.m(`f(x) = ${polyTex(f, [a, b, c, d])}`)} have its point of inflection?`, `En quel x la fonction ${f.m(`f(x) = ${polyTex(f, [a, b, c, d])}`)} a-t-elle son point d'inflexion ?`)),
    answer: m, category: 'TH',
    wrong: wr(m, [[-m, same('The point of inflection is where the second derivative is zero: 6ax + 2b = 0.', 'Le point d\'inflexion est là où la dérivée seconde égale zéro : 6ax + 2b = 0.'), 1], [r6(c / (3 * a)), same('Use the second derivative, not the first.', 'Utilise la dérivée seconde, et non la première.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`f''(x) = ${f.n(6 * a)}x ${sgn(2 * b)} ${f.n(Math.abs(2 * b))}`)}. Set it to 0.`, `${f.m(`f''(x) = ${f.n(6 * a)}x ${sgn(2 * b)} ${f.n(Math.abs(2 * b))}`)}. Pose-la égale à 0.`)), bi((f) => f.t(`x = ${f.N(m)}. The concavity changes there, so it is the point of inflection.`, `x = ${f.N(m)}. La concavité change là : c'est le point d'inflexion.`))],
    nudge: same('Set the second derivative equal to zero and solve.', 'Pose la dérivée seconde égale à zéro et résous.'),
  };
});

/** MCV4U.B2: optimization */
export const optimize12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const P = 4 * randInt(r, 3, 15), ans = (P / 4) ** 2;
    return {
      prompt: bi((f) => f.t(`A rectangle has a perimeter of ${f.N(P)} m. What is the greatest area it can have, in square metres?`, `Un rectangle a un périmètre de ${f.N(P)} m. Quelle est la plus grande aire qu'il peut avoir, en mètres carrés ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[P / 4, same('That is a side length. The greatest area is a square of that side.', 'C\'est la longueur d\'un côté. L\'aire maximale est celle d\'un carré de ce côté.'), 1], [(P / 2) ** 2 / 4 * 2, same('A side is the perimeter divided by 4 when the rectangle is a square.', 'Un côté égale le périmètre divisé par 4 quand le rectangle est un carré.'), 0]]),
      steps: [bi((f) => f.t(`With width w, length is ${f.m(`${f.n(P / 2)} - w`)} and the area is ${f.m(`A = w(${f.n(P / 2)} - w)`)}. Setting ${f.m("A' = 0")} gives w = ${f.N(P / 4)}.`, `Avec une largeur w, la longueur est ${f.m(`${f.n(P / 2)} - w`)} et l'aire est ${f.m(`A = w(${f.n(P / 2)} - w)`)}. Poser ${f.m("A' = 0")} donne w = ${f.N(P / 4)}.`)), bi((f) => f.t(`The greatest area is ${f.m(`${f.n(P / 4)} \\times ${f.n(P / 4)}`)} = ${f.N(ans)} square metres.`, `L'aire maximale est ${f.m(`${f.n(P / 4)} \\times ${f.n(P / 4)}`)} = ${f.N(ans)} mètres carrés.`))],
      nudge: same('Write the area in terms of one side, differentiate, and set it to zero.', 'Écris l\'aire en fonction d\'un côté, dérive et pose égal à zéro.'),
    };
  }
  if (tier === 2) {
    const L = 4 * randInt(r, 3, 15), ans = (L * L) / 8;
    return {
      prompt: bi((f) => f.t(`A farmer has ${f.N(L)} m of fence for three sides of a rectangular pen. The fourth side is a river and needs no fence. What is the greatest area, in square metres?`, `Un fermier a ${f.N(L)} m de clôture pour trois côtés d'un enclos rectangulaire. Le quatrième côté est une rivière et n'a pas besoin de clôture. Quelle est la plus grande aire, en mètres carrés ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[(L / 4) ** 2, same('Only three sides are fenced: the two sides next to the river are w and the side along it is L minus 2w.', 'Seulement trois côtés sont clôturés : les deux côtés près de la rivière valent w et le côté le long vaut L moins 2w.'), 0], [r6((L / 2) * (L / 4)), same('The side along the river is L minus 2w, so use w = L over 4 for the sides next to it.', 'Le côté le long de la rivière vaut L moins 2w : utilise w = L sur 4 pour les côtés à côté.'), 1]]),
      steps: [bi((f) => f.t(`With sides w next to the river, the side along it is ${f.m(`${f.n(L)} - 2w`)}. Area ${f.m(`A = w(${f.n(L)} - 2w)`)}. ${f.m("A' = " + `${f.n(L)} - 4w`)} = 0 gives w = ${f.N(L / 4)}.`, `Avec des côtés w près de la rivière, le côté le long vaut ${f.m(`${f.n(L)} - 2w`)}. Aire ${f.m(`A = w(${f.n(L)} - 2w)`)}. ${f.m("A' = " + `${f.n(L)} - 4w`)} = 0 donne w = ${f.N(L / 4)}.`)), bi((f) => f.t(`The side along the river is ${f.N(L / 2)}, so the area is ${f.m(`${f.n(L / 4)} \\times ${f.n(L / 2)}`)} = ${f.N(ans)}.`, `Le côté le long de la rivière vaut ${f.N(L / 2)} : l'aire est ${f.m(`${f.n(L / 4)} \\times ${f.n(L / 2)}`)} = ${f.N(ans)}.`))],
      nudge: same('Write the area in terms of w, the side next to the river, differentiate, and set it to zero.', 'Écris l\'aire en fonction de w, le côté près de la rivière, dérive et pose égal à zéro.'),
    };
  }
  const b = randInt(r, 1, 4), p0 = randInt(r, 3, 12), a = 2 * b * p0, ans = (a * a) / (4 * b);
  return {
    prompt: bi((f) => f.t(`A shop sells ${f.m(`x = ${f.n(a)} - ${f.n(b)}p`)} items a week at a price of p dollars. What is the greatest weekly revenue, in dollars?`, `Un magasin vend ${f.m(`x = ${f.n(a)} - ${f.n(b)}p`)} articles par semaine au prix de p dollars. Quel est le revenu hebdomadaire maximal, en dollars ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[p0, same('That is the best price. The question asks for the revenue at that price.', 'C\'est le meilleur prix. La question demande le revenu à ce prix.'), 1], [a - b * p0, same('That is the number of items sold. Revenue is price times items.', 'C\'est le nombre d\'articles vendus. Le revenu est le prix fois le nombre d\'articles.'), 1]]),
    steps: [bi((f) => f.t(`Revenue ${f.m(`R = p(${f.n(a)} - ${f.n(b)}p)`)}. ${f.m("R' = " + `${f.n(a)} - ${f.n(2 * b)}p`)} = 0 gives p = ${f.N(p0)}.`, `Revenu ${f.m(`R = p(${f.n(a)} - ${f.n(b)}p)`)}. ${f.m("R' = " + `${f.n(a)} - ${f.n(2 * b)}p`)} = 0 donne p = ${f.N(p0)}.`)), bi((f) => f.t(`${f.m(`R = ${f.n(p0)}(${f.n(a)} - ${f.n(b * p0)})`)} = ${f.N(ans)} dollars.`, `${f.m(`R = ${f.n(p0)}(${f.n(a)} - ${f.n(b * p0)})`)} = ${f.N(ans)} dollars.`))],
    nudge: same('Revenue is price times the number sold. Write it in terms of p, differentiate, and set it to zero.', 'Le revenu est le prix fois le nombre vendu. Écris-le en fonction de p, dérive et pose égal à zéro.'),
  };
});
