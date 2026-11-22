// Grade 12 (MHF4U) Exponential and Logarithmic Functions: evaluating logarithms, the laws of logarithms, graphs of logarithmic
// functions, and solving exponential and logarithmic equations. Bases and arguments are powers of one another, so answers are exact
// (except where an equation is solved with logarithms, which accepts a rounded answer).
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const L = (b: number, arg: string): string => `\\log_{${b}} ${arg}`;

/** MHF4U.A1: evaluate logarithms and connect them to exponents */
export const logEval12 = (id: string): Generator => numGen(id, (tier, r) => {
  const b = pick(r, [2, 3, 5, 10]);
  if (tier === 1) {
    const n = randInt(r, 1, 5), N = b ** n;
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(L(b, f.n(N)))}.`, `Évalue ${f.m(L(b, f.n(N)))}.`)),
      answer: n, category: 'KU',
      wrong: wr(n, [[b, t('That is the base. A logarithm asks for the exponent: what power of the base gives the number?', 'C\'est la base. Un logarithme demande l\'exposant : à quelle puissance faut-il élever la base pour obtenir le nombre ?'), 0], [N, t('That is the number inside the logarithm. The answer is the exponent.', 'C\'est le nombre dans le logarithme. La réponse est l\'exposant.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(L(b, f.n(N)))} asks: ${f.N(b)} to what power equals ${f.N(N)}?`, `${f.m(L(b, f.n(N)))} demande : ${f.N(b)} à quelle puissance égale ${f.N(N)} ?`)), bi((f) => f.t(`${f.m(`${f.n(b)}^{${f.n(n)}} = ${f.n(N)}`)}, so the answer is ${f.N(n)}.`, `${f.m(`${f.n(b)}^{${f.n(n)}} = ${f.n(N)}`)}, donc la réponse est ${f.N(n)}.`))],
      nudge: t('Ask: the base to what power gives the number?', 'Demande-toi : la base à quelle puissance donne le nombre ?'),
    };
  }
  if (tier === 2) {
    const kind = pick(r, ['reciprocal', 'root'] as const), n = randInt(r, 1, 4), m = randInt(r, 2, 4);
    if (kind === 'reciprocal') {
      const N = b ** n;
      return {
        prompt: bi((f) => f.t(`Evaluate ${f.m(L(b, `\\frac{1}{${f.n(N)}}`))}.`, `Évalue ${f.m(L(b, `\\frac{1}{${f.n(N)}}`))}.`)),
        answer: -n, category: 'KU',
        wrong: wr(-n, [[n, t('A reciprocal means a negative exponent: the base to a negative power gives a fraction.', 'Un inverse veut dire un exposant négatif : la base à une puissance négative donne une fraction.'), 1], [1 / N, t('That is the number again. The answer is the exponent.', 'C\'est encore le nombre. La réponse est l\'exposant.'), 0]]),
        steps: [bi((f) => f.t(`${f.m(`\\frac{1}{${f.n(N)}} = ${f.n(b)}^{-${f.n(n)}}`)}.`, `${f.m(`\\frac{1}{${f.n(N)}} = ${f.n(b)}^{-${f.n(n)}}`)}.`)), bi((f) => f.t(`So the logarithm is ${f.N(-n)}.`, `Donc le logarithme vaut ${f.N(-n)}.`))],
        nudge: t('Write the fraction as the base to a negative power.', 'Écris la fraction comme la base à une puissance négative.'),
      };
    }
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(L(b, `\\sqrt[${f.n(m)}]{${f.n(b)}}`))} as a decimal.`, `Évalue ${f.m(L(b, `\\sqrt[${f.n(m)}]{${f.n(b)}}`))} sous forme décimale.`)),
      answer: r6(1 / m), category: 'KU',
      wrong: wr(r6(1 / m), [[m, t('A root is a fractional exponent: the mth root is the power 1/m, not m.', 'Une racine est un exposant fractionnaire : la racine m-ième est la puissance 1/m, et non m.'), 0]]),
      steps: [bi((f) => f.t(`The ${f.N(m)}th root of ${f.N(b)} is ${f.m(`${f.n(b)}^{\\frac{1}{${f.n(m)}}}`)}.`, `La racine ${f.N(m)}-ième de ${f.N(b)} est ${f.m(`${f.n(b)}^{\\frac{1}{${f.n(m)}}}`)}.`)), bi((f) => f.t(`So the exponent, and the logarithm, is ${f.m(`\\frac{1}{${f.n(m)}}`)} = ${f.N(r6(1 / m))}.`, `Donc l'exposant, et le logarithme, est ${f.m(`\\frac{1}{${f.n(m)}}`)} = ${f.N(r6(1 / m))}.`))],
      nudge: t('Write the root as a power of the base with a fractional exponent.', 'Écris la racine comme une puissance de la base avec un exposant fractionnaire.'),
    };
  }
  const p = pick(r, [4, 16]), q = randInt(r, 1, 9), base = 2, ans = q / Math.log2(p);
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(L(p, f.n(base ** q)))} as a decimal.`, `Évalue ${f.m(L(p, f.n(base ** q)))} sous forme décimale.`)),
    answer: r6(ans), category: 'AP',
    wrong: wr(r6(ans), [[q, t('That is the logarithm in base 2. This logarithm uses a different base.', 'C\'est le logarithme en base 2. Ce logarithme utilise une autre base.'), 0], [q * Math.log2(p), t('Divide the exponents; do not multiply them.', 'Divise les exposants ; ne les multiplie pas.'), 1]]),
    steps: [bi((f) => f.t(`Write both as powers of 2: ${f.m(`${f.n(p)} = 2^{${f.n(Math.log2(p))}}`)} and ${f.m(`${f.n(base ** q)} = 2^{${f.n(q)}}`)}.`, `Écris les deux comme des puissances de 2 : ${f.m(`${f.n(p)} = 2^{${f.n(Math.log2(p))}}`)} et ${f.m(`${f.n(base ** q)} = 2^{${f.n(q)}}`)}.`)), bi((f) => f.t(`${f.m(`(2^{${f.n(Math.log2(p))}})^x = 2^{${f.n(q)}}`)}, so ${f.m(`${f.n(Math.log2(p))}x = ${f.n(q)}`)} and x = ${f.N(r6(ans))}.`, `${f.m(`(2^{${f.n(Math.log2(p))}})^x = 2^{${f.n(q)}}`)}, donc ${f.m(`${f.n(Math.log2(p))}x = ${f.n(q)}`)} et x = ${f.N(r6(ans))}.`))],
    nudge: t('Write the base and the number as powers of 2, then compare the exponents.', 'Écris la base et le nombre comme des puissances de 2, puis compare les exposants.'),
  };
});

/** MHF4U.A1: the laws of logarithms */
export const logLaws12 = (id: string): Generator => numGen(id, (tier, r) => {
  const b = pick(r, [2, 3, 5]);
  if (tier === 1) {
    const kind = pick(r, ['sum', 'difference', 'power'] as const), i = randInt(r, 2, 5), j = randInt(r, 1, i - 1), k = randInt(r, 2, 4);
    const expr = (f: { n: (x: number) => number | string }): string => kind === 'sum' ? `${L(b, String(f.n(b ** i)))} + ${L(b, String(f.n(b ** j)))}` : kind === 'difference' ? `${L(b, String(f.n(b ** i)))} - ${L(b, String(f.n(b ** j)))}` : `${k} ${L(b, String(f.n(b ** j)))}`;
    const ans = kind === 'sum' ? i + j : kind === 'difference' ? i - j : k * j;
    return {
      prompt: bi((f) => f.t(`Evaluate ${f.m(expr(f))}.`, `Évalue ${f.m(expr(f))}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[kind === 'sum' ? i * j : kind === 'difference' ? i / j : k + j, t('Use the law: a sum of logarithms is the logarithm of a product, so the exponents add; a difference subtracts; a coefficient multiplies the exponent.', 'Utilise la loi : une somme de logarithmes est le logarithme d\'un produit, donc les exposants s\'additionnent ; une différence soustrait ; un coefficient multiplie l\'exposant.'), 1], [kind === 'sum' ? b ** (i + j) : kind === 'difference' ? b ** (i - j) : b ** (k * j), t('That is the number, not its logarithm. The answer is the exponent.', 'C\'est le nombre, et non son logarithme. La réponse est l\'exposant.'), 1]]),
      steps: [t('Evaluate each logarithm as an exponent, then combine as the law says.', 'Évalue chaque logarithme comme un exposant, puis combine selon la loi.'), bi((f) => f.t(`The result is ${f.N(ans)}.`, `Le résultat est ${f.N(ans)}.`))],
      nudge: t('Find the exponent in each logarithm first.', 'Trouve d\'abord l\'exposant dans chaque logarithme.'),
    };
  }
  if (tier === 2) {
    const p = randInt(r, 2, 6), q = randInt(r, 2, 6), s = randInt(r, 1, 4), a = randInt(r, 2, 3), c = randInt(r, 2, 3);
    const ans = a * p + c * q - s;
    return {
      prompt: bi((f) => f.t(`Given ${f.m(`${L(b, 'x')} = ${f.n(p)}`)}, ${f.m(`${L(b, 'y')} = ${f.n(q)}`)} and ${f.m(`${L(b, 'z')} = ${f.n(s)}`)}, evaluate ${f.m(L(b, `\\frac{x^{${f.n(a)}} y^{${f.n(c)}}}{z}`))}.`, `Sachant que ${f.m(`${L(b, 'x')} = ${f.n(p)}`)}, ${f.m(`${L(b, 'y')} = ${f.n(q)}`)} et ${f.m(`${L(b, 'z')} = ${f.n(s)}`)}, évalue ${f.m(L(b, `\\frac{x^{${f.n(a)}} y^{${f.n(c)}}}{z}`))}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a * p * c * q - s, t('Products turn into sums of logarithms, not products.', 'Les produits deviennent des sommes de logarithmes, et non des produits.'), 1], [a * p + c * q + s, t('Division by z subtracts its logarithm.', 'La division par z soustrait son logarithme.'), 1], [p + q - s, t('Each power brings its exponent down as a coefficient.', 'Chaque puissance fait descendre son exposant comme coefficient.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(a)}${L(b, 'x')} + ${f.n(c)}${L(b, 'y')} - ${L(b, 'z')}`)}.`, `${f.m(`${f.n(a)}${L(b, 'x')} + ${f.n(c)}${L(b, 'y')} - ${L(b, 'z')}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(a)}(${f.n(p)}) + ${f.n(c)}(${f.n(q)}) - ${f.n(s)}`)} = ${f.N(ans)}.`, `${f.m(`${f.n(a)}(${f.n(p)}) + ${f.n(c)}(${f.n(q)}) - ${f.n(s)}`)} = ${f.N(ans)}.`))],
      nudge: t('Powers come down as coefficients, products add and quotients subtract.', 'Les puissances descendent comme coefficients, les produits s\'additionnent et les quotients se soustraient.'),
    };
  }
  const bb = pick(r, [2, 3, 5]), x = pick(r, [2, 3, 4]), y = pick(r, [2, 3, 5]), w = pick(r, [1, 2, 3]);
  const A = bb ** x * 1, C = bb ** y, D = bb ** w;
  const N = (A * C) / D;
  return {
    prompt: bi((f) => f.t(`Write ${f.m(`${L(bb, f.n(A))} + ${L(bb, f.n(C))} - ${L(bb, f.n(D))}`)} as a single logarithm ${f.m(`${L(bb, 'N')}`)}. What is N?`, `Écris ${f.m(`${L(bb, f.n(A))} + ${L(bb, f.n(C))} - ${L(bb, f.n(D))}`)} sous la forme d'un seul logarithme ${f.m(`${L(bb, 'N')}`)}. Que vaut N ?`)),
    answer: N, category: 'TH',
    wrong: wr(N, [[A * C * D, t('Subtracting a logarithm divides; it does not multiply.', 'Soustraire un logarithme divise ; cela ne multiplie pas.'), 1], [A + C - D, t('Do not add the numbers: a sum of logarithms is a product.', 'N\'additionne pas les nombres : une somme de logarithmes est un produit.'), 1]]),
    steps: [t('A sum of logarithms is the logarithm of a product, and a difference is the logarithm of a quotient.', 'Une somme de logarithmes est le logarithme d\'un produit, et une différence est le logarithme d\'un quotient.'), bi((f) => f.t(`${f.m(`N = \\frac{${f.n(A)} \\times ${f.n(C)}}{${f.n(D)}}`)} = ${f.N(N)}.`, `${f.m(`N = \\frac{${f.n(A)} \\times ${f.n(C)}}{${f.n(D)}}`)} = ${f.N(N)}.`))],
    nudge: t('Multiply for a sum, divide for a difference.', 'Multiplie pour une somme, divise pour une différence.'),
  };
});

/** MHF4U.A2: graphs of logarithmic functions, y = log_b(x - h) + k */
export const logGraph12 = (id: string): Generator => numGen(id, (tier, r) => {
  const b = pick(r, [2, 3, 4, 5]), h = randInt(r, -5, 6) || 3, k = randInt(r, -3, 0);
  const fx = (f: { n: (x: number) => number | string }): string => `y = ${L(b, `(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})`)} ${k === 0 ? '' : `${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`}`;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`The graph of ${f.m(fx(f))} has a vertical asymptote at x = a. What is a?`, `Le graphique de ${f.m(fx(f))} a une asymptote verticale en x = a. Que vaut a ?`)),
      answer: h, category: 'KU',
      wrong: wr(h, [[-h, t('The asymptote is where the inside of the logarithm is zero: x minus h = 0, so x = h.', 'L\'asymptote est là où l\'intérieur du logarithme est nul : x moins h égale 0, donc x = h.'), 0], [k, t('The number outside the logarithm moves the graph up or down; it does not move the asymptote.', 'Le nombre à l\'extérieur du logarithme déplace le graphique vers le haut ou le bas ; il ne déplace pas l\'asymptote.'), 0]]),
      steps: [t('The inside of a logarithm must be positive, so the asymptote is where it equals zero.', 'L\'intérieur d\'un logarithme doit être positif : l\'asymptote est là où il est nul.'), bi((f) => f.t(`That happens at x = ${f.N(h)}.`, `Cela se produit à x = ${f.N(h)}.`))],
      nudge: t('Set the inside of the logarithm equal to zero.', 'Pose l\'intérieur du logarithme égal à zéro.'),
    };
  }
  if (tier === 2) {
    const ans = h + b ** -k;
    return {
      prompt: bi((f) => f.t(`What is the x-intercept of ${f.m(fx(f))}?`, `Quelle est l'abscisse à l'origine de ${f.m(fx(f))} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[h, t('That is the asymptote, which the graph never touches. Set y = 0 and solve.', 'C\'est l\'asymptote, que le graphique ne touche jamais. Pose y = 0 et résous.'), 0], [h + k, t('Set the whole expression to zero: move the constant across, then rewrite as a power.', 'Pose toute l\'expression égale à zéro : déplace la constante, puis écris sous forme de puissance.'), 1]]),
      steps: [bi((f) => f.t(`Set y = 0: ${f.m(`${L(b, `(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})`)} = ${f.n(-k)}`)}.`, `Pose y = 0 : ${f.m(`${L(b, `(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})`)} = ${f.n(-k)}`)}.`)), bi((f) => f.t(`${f.m(`x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))} = ${f.n(b)}^{${f.n(-k)}} = ${f.n(b ** -k)}`)}, so x = ${f.N(ans)}.`, `${f.m(`x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))} = ${f.n(b)}^{${f.n(-k)}} = ${f.n(b ** -k)}`)}, donc x = ${f.N(ans)}.`))],
      nudge: t('Set y equal to zero, then rewrite the logarithm as a power.', 'Pose y égal à zéro, puis écris le logarithme sous forme de puissance.'),
    };
  }
  const m = randInt(r, 1, 3), ans = m + k;
  return {
    prompt: bi((f) => f.t(`For ${f.m(fx(f))}, find y when x = ${f.N(h + b ** m)}.`, `Pour ${f.m(fx(f))}, trouve y quand x = ${f.N(h + b ** m)}.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[h + b ** m + k, t('Put x in, subtract h first, and then take the logarithm of the result.', 'Remplace x, soustrais d\'abord h, puis prends le logarithme du résultat.'), 0], [b ** m + k, t('The logarithm of a power of the base is the exponent, not the power.', 'Le logarithme d\'une puissance de la base est l\'exposant, et non la puissance.'), 1]]),
    steps: [bi((f) => f.t(`The inside is ${f.m(`${f.n(h + b ** m)} ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))} = ${f.n(b ** m)}`)}.`, `L'intérieur est ${f.m(`${f.n(h + b ** m)} ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))} = ${f.n(b ** m)}`)}.`)), bi((f) => f.t(`${f.m(`${L(b, f.n(b ** m))} = ${f.n(m)}`)}, so y = ${f.m(`${f.n(m)} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} = ${f.N(ans)}.`, `${f.m(`${L(b, f.n(b ** m))} = ${f.n(m)}`)}, donc y = ${f.m(`${f.n(m)} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} = ${f.N(ans)}.`))],
    nudge: t('Work out the inside first, take the logarithm, then add the constant.', 'Calcule d\'abord l\'intérieur, prends le logarithme, puis ajoute la constante.'),
  };
});

/** MHF4U.A3: solve exponential equations */
export const expEq12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const [small, big] = pick(r, [[2, 4], [2, 16], [3, 9], [5, 25]] as [number, number][]);
    const e = Math.round(Math.log(big) / Math.log(small)), n = randInt(r, 2, 7), ans = r6(n / e);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(big)}^x = ${f.n(small ** n)}`)}. Give x as a decimal.`, `Résous ${f.m(`${f.n(big)}^x = ${f.n(small ** n)}`)}. Donne x sous forme décimale.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[n, t('Write both sides with the same base first: the base on the left is a power of the smaller base.', 'Écris d\'abord les deux côtés avec la même base : la base de gauche est une puissance de la plus petite base.'), 0], [r6(n * e), t('Divide the exponents, do not multiply them.', 'Divise les exposants, ne les multiplie pas.'), 1]]),
      steps: [bi((f) => f.t(`Write both sides as powers of ${f.N(small)}: ${f.m(`(${f.n(small)}^{${f.n(e)}})^x = ${f.n(small)}^{${f.n(n)}}`)}.`, `Écris les deux côtés comme des puissances de ${f.N(small)} : ${f.m(`(${f.n(small)}^{${f.n(e)}})^x = ${f.n(small)}^{${f.n(n)}}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(e)}x = ${f.n(n)}`)}, so x = ${f.N(ans)}.`, `${f.m(`${f.n(e)}x = ${f.n(n)}`)}, donc x = ${f.N(ans)}.`))],
      nudge: t('Write both sides as powers of the same base, then equate the exponents.', 'Écris les deux côtés comme des puissances de la même base, puis égale les exposants.'),
    };
  }
  if (tier === 2) {
    const b = pick(r, [2, 3, 5]), m = pick(r, [2, 4, 5]), c = randInt(r, 1, 5), n = randInt(r, 2, 5), ans = r6((n + c) / m);
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(b)}^{${f.n(m)}x - ${f.n(c)}} = ${f.n(b ** n)}`)}.`, `Résous ${f.m(`${f.n(b)}^{${f.n(m)}x - ${f.n(c)}} = ${f.n(b ** n)}`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6((n - c) / m), t('The exponent is 2x minus c, so add c to both sides before dividing.', 'L\'exposant est mx moins c : ajoute c des deux côtés avant de diviser.'), 1], [r6(n + c), t('Do not forget to divide by the coefficient of x.', 'N\'oublie pas de diviser par le coefficient de x.'), 1]]),
      steps: [bi((f) => f.t(`The bases match, so ${f.m(`${f.n(m)}x - ${f.n(c)} = ${f.n(n)}`)}.`, `Les bases sont égales, donc ${f.m(`${f.n(m)}x - ${f.n(c)} = ${f.n(n)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(m)}x = ${f.n(n + c)}`)}, so x = ${f.N(ans)}.`, `${f.m(`${f.n(m)}x = ${f.n(n + c)}`)}, donc x = ${f.N(ans)}.`))],
      nudge: t('When the bases match, set the exponents equal.', 'Quand les bases sont égales, égale les exposants.'),
    };
  }
  const b = pick(r, [2, 3, 5, 10]), N = randInt(r, 5, 90);
  const ans = r6(Math.log(N) / Math.log(b));
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(b)}^x = ${f.n(N)}`)}. Round to 2 decimal places.`, `Résous ${f.m(`${f.n(b)}^x = ${f.n(N)}`)}. Arrondis à 2 décimales.`)),
    answer: ans, tolerance: 0.005, category: 'AP',
    wrong: wr(ans, [[r6(N / b), t('Take the logarithm of both sides; the unknown is an exponent, so it is not found by division.', 'Prends le logarithme des deux côtés ; l\'inconnue est un exposant, on ne la trouve pas par division.'), 0], [r6(Math.log(b) / Math.log(N)), t('The logarithm of the number goes on top and the logarithm of the base on the bottom.', 'Le logarithme du nombre va en haut et le logarithme de la base en bas.'), 1]]),
    steps: [bi((f) => f.t(`Take the logarithm of both sides: ${f.m(`x \\log ${f.n(b)} = \\log ${f.n(N)}`)}.`, `Prends le logarithme des deux côtés : ${f.m(`x \\log ${f.n(b)} = \\log ${f.n(N)}`)}.`)), bi((f) => f.t(`${f.m(`x = \\frac{\\log ${f.n(N)}}{\\log ${f.n(b)}}`)} ≈ ${f.N(Math.round(ans * 100) / 100)}.`, `${f.m(`x = \\frac{\\log ${f.n(N)}}{\\log ${f.n(b)}}`)} ≈ ${f.N(Math.round(ans * 100) / 100)}.`))],
    nudge: t('Take the logarithm of both sides and bring the exponent down.', 'Prends le logarithme des deux côtés et fais descendre l\'exposant.'),
  };
});

/** MHF4U.A3: solve logarithmic equations, rejecting extraneous roots */
export const logEq12 = (id: string): Generator => numGen(id, (tier, r) => {
  const b = pick(r, [2, 3, 5]);
  if (tier === 1) {
    const c = randInt(r, 1, 4), ans = b ** c;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${L(b, 'x')} = ${f.n(c)}`)}.`, `Résous ${f.m(`${L(b, 'x')} = ${f.n(c)}`)}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[b * c, t('Rewrite in exponent form: x is the base to the power c, not the base times c.', 'Écris sous forme exponentielle : x est la base à la puissance c, et non la base fois c.'), 0], [c ** b, t('The base is raised to the power. Do not swap them.', 'C\'est la base qu\'on élève à la puissance. Ne les inverse pas.'), 0]]),
      steps: [bi((f) => f.t(`In exponent form, ${f.m(`x = ${f.n(b)}^{${f.n(c)}}`)}.`, `Sous forme exponentielle, ${f.m(`x = ${f.n(b)}^{${f.n(c)}}`)}.`)), bi((f) => f.t(`So x = ${f.N(ans)}.`, `Donc x = ${f.N(ans)}.`))],
      nudge: t('Rewrite the logarithm as a power of the base.', 'Écris le logarithme comme une puissance de la base.'),
    };
  }
  if (tier === 2) {
    const c = randInt(r, 2, 4), a = randInt(r, -6, 7) || 3, ans = b ** c - a;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`${L(b, `(x ${a < 0 ? '-' : '+'} ${f.n(Math.abs(a))})`)} = ${f.n(c)}`)}.`, `Résous ${f.m(`${L(b, `(x ${a < 0 ? '-' : '+'} ${f.n(Math.abs(a))})`)} = ${f.n(c)}`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[b ** c + a, t('Subtract the constant that is added to x; do not add it again.', 'Soustrais la constante ajoutée à x ; ne l\'ajoute pas de nouveau.'), 1], [b ** c, t('The inside is x plus a number, not just x.', 'L\'intérieur est x plus un nombre, et non seulement x.'), 0]]),
      steps: [bi((f) => f.t(`In exponent form, ${f.m(`x ${a < 0 ? '-' : '+'} ${f.n(Math.abs(a))} = ${f.n(b)}^{${f.n(c)}} = ${f.n(b ** c)}`)}.`, `Sous forme exponentielle, ${f.m(`x ${a < 0 ? '-' : '+'} ${f.n(Math.abs(a))} = ${f.n(b)}^{${f.n(c)}} = ${f.n(b ** c)}`)}.`)), bi((f) => f.t(`So x = ${f.N(ans)}.`, `Donc x = ${f.N(ans)}.`))],
      nudge: t('Rewrite as a power, then undo the addition.', 'Écris sous forme de puissance, puis annule l\'addition.'),
    };
  }
  const [bb, c, x, d] = pick(r, [[2, 4, 8, 6], [2, 5, 8, 4], [2, 6, 16, 12], [3, 3, 9, 6], [3, 4, 27, 24], [4, 3, 16, 12], [2, 3, 4, 2], [5, 2, 25, 24]] as [number, number, number, number][]);
  const root2 = (d - Math.sqrt(d * d + 4 * bb ** c)) / 2;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${L(bb, 'x')} + ${L(bb, `(x - ${f.n(d)})`)} = ${f.n(c)}`)}. Reject any extraneous root.`, `Résous ${f.m(`${L(bb, 'x')} + ${L(bb, `(x - ${f.n(d)})`)} = ${f.n(c)}`)}. Rejette toute racine étrangère.`)),
    answer: x, category: 'TH',
    wrong: wr(x, [[r6(root2), t('That root makes the inside of a logarithm negative, so it is extraneous. Check each root in the original equation.', 'Cette racine rend l\'intérieur d\'un logarithme négatif : elle est étrangère. Vérifie chaque racine dans l\'équation de départ.'), 1], [bb ** c, t('Combine the logarithms into one first: a sum is a product.', 'Combine d\'abord les logarithmes en un seul : une somme est un produit.'), 0]]),
    steps: [bi((f) => f.t(`Combine: ${f.m(`${L(bb, `x(x - ${f.n(d)})`)} = ${f.n(c)}`)}, so ${f.m(`x(x - ${f.n(d)}) = ${f.n(bb ** c)}`)}.`, `Combine : ${f.m(`${L(bb, `x(x - ${f.n(d)})`)} = ${f.n(c)}`)}, donc ${f.m(`x(x - ${f.n(d)}) = ${f.n(bb ** c)}`)}.`)), bi((f) => f.t(`${f.m(`x^2 - ${f.n(d)}x - ${f.n(bb ** c)} = 0`)} gives x = ${f.N(x)} or ${f.N(r6(root2))}. Only ${f.N(x)} keeps both insides positive.`, `${f.m(`x^2 - ${f.n(d)}x - ${f.n(bb ** c)} = 0`)} donne x = ${f.N(x)} ou ${f.N(r6(root2))}. Seul ${f.N(x)} garde les deux intérieurs positifs.`))],
    nudge: t('Combine the logarithms, solve the quadratic, then check each root.', 'Combine les logarithmes, résous l\'équation du second degré, puis vérifie chaque racine.'),
  };
});
