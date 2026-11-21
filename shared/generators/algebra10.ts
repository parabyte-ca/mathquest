// Grade 10 (MPM2D and MFM2P) quadratic algebra: expanding, factoring, solving and completing the square. Expressions are TeX, so they
// are read aloud the same way in both languages. Several skills are written for both courses; the MFM2P versions stay simpler.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, type F } from './dsl.js';
import { gcd, t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const bx = (s: (f: F) => string): Text => bi((f) => f.m(s(f)));

/** One term of a polynomial: signed, with a coefficient of 1 left out unless it is the constant. */
const term = (f: F, c: number, v: string, first: boolean): string => {
  if (c === 0) return '';
  const mag = Math.abs(c), body = v === '' ? f.n(mag) : `${mag === 1 ? '' : f.n(mag)}${v}`;
  return first ? `${c < 0 ? '-' : ''}${body}` : ` ${c < 0 ? '-' : '+'} ${body}`;
};
export const poly = (f: F, parts: [number, string][]): string => {
  let out = '';
  for (const [c, v] of parts) { const s = term(f, c, v, out === ''); if (s) out += s; }
  return out || '0';
};
export const quad = (f: F, a: number, b: number, c: number, v = 'x'): string => poly(f, [[a, `${v}^{2}`], [b, v], [c, '']]);
export const lin = (f: F, a: number, b: number, v = 'x'): string => poly(f, [[a, v], [b, '']]);
const bin = (f: F, a: number, p: number, v = 'x'): string => `(${lin(f, a, p, v)})`;
/** Multiplier written in front of a product: nothing for 1. */
const kk = (f: F, k: number): string => (k === 1 ? '' : f.n(k));

/** Right option and up to three different wrong ones, each with its reason. */
const optMc = (r: () => number, right: (f: F) => string, wrongs: [(f: F) => string, Text][]) => {
  const rt = bx(right), seen = new Set([rt.en]), list: [Text, Text][] = [];
  for (const [fn, why] of wrongs) {
    const o = bx(fn);
    if (!seen.has(o.en)) { seen.add(o.en); list.push([o, why]); }
    if (list.length === 3) break;
  }
  return mc(r, rt, list);
};
const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };

// ── expanding ───────────────────────────────────────────────────────────────────

/** Expand and simplify a product of two binomials. `hard` allows leading coefficients other than 1 (MPM2D). */
export const expandGen = (id: string, hard: boolean): Generator => choiceGen(id, (tier, r) => {
  let a = 1, b = 1, p = 0, q = 0;
  for (;;) {
    a = hard && tier === 3 ? pick(r, [2, 3]) : hard && tier === 2 ? pick(r, [1, 2]) : 1;
    b = hard && tier === 3 ? pick(r, [1, 2, 3]) : 1;
    p = tier === 1 ? randInt(r, 1, 9) : nonzero(r, -9, 9);
    q = tier === 1 ? randInt(r, 1, 9) : (!hard && tier === 3 && r() < 0.5 ? p : nonzero(r, -9, 9));
    if (a * q + b * p !== 0) break;
  }
  const mid = a * q + b * p;
  const m = optMc(r, (f) => quad(f, a * b, mid, p * q), [
    [(f) => poly(f, [[a * b, 'x^{2}'], [p * q, '']]), t('The middle term is missing. Multiplying each term of one bracket by each term of the other gives four products, and two of them contain x.', 'Le terme du milieu manque. Multiplier chaque terme d\'une parenthèse par chaque terme de l\'autre donne quatre produits, dont deux contiennent x.')],
    [(f) => quad(f, a * b, mid, -p * q), t('Check the sign of the last term. It is the product of the two constants, with the signs they have.', 'Vérifie le signe du dernier terme. C\'est le produit des deux constantes, avec leurs signes.')],
    [(f) => quad(f, a * b, a * p + b * q, p * q), t('The inner and outer products are mixed up: the x term needs the first number of each bracket times the second number of the other.', 'Les produits intérieur et extérieur sont mélangés : le terme en x demande le premier terme d\'une parenthèse fois le second de l\'autre.')],
    [(f) => quad(f, a * b, -mid, p * q), t('Check the sign of the middle term. Add the two x products with their signs.', 'Vérifie le signe du terme du milieu. Additionne les deux produits en x avec leurs signes.')],
    [(f) => quad(f, a * b, mid, p + q), t('The last term is a product, not a sum: multiply the two constants.', 'Le dernier terme est un produit, pas une somme : multiplie les deux constantes.')],
  ]);
  const sq = a === b && p === q;
  return {
    prompt: bi((f) => f.t(`Expand and simplify ${f.m(`${bin(f, a, p)}${bin(f, b, q)}`)}.`, `Développe et simplifie ${f.m(`${bin(f, a, p)}${bin(f, b, q)}`)}.`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [
      bi((f) => f.t(`Multiply each term of the first bracket by each term of the second: ${f.m(`${f.n(a * b)}x^{2} ${a * q < 0 ? '-' : '+'} ${f.n(Math.abs(a * q))}x ${b * p < 0 ? '-' : '+'} ${f.n(Math.abs(b * p))}x ${p * q < 0 ? '-' : '+'} ${f.n(Math.abs(p * q))}`)}.`, `Multiplie chaque terme de la première parenthèse par chaque terme de la seconde : ${f.m(`${f.n(a * b)}x^{2} ${a * q < 0 ? '-' : '+'} ${f.n(Math.abs(a * q))}x ${b * p < 0 ? '-' : '+'} ${f.n(Math.abs(b * p))}x ${p * q < 0 ? '-' : '+'} ${f.n(Math.abs(p * q))}`)}.`)),
      bi((f) => f.t(`Collect the two x terms: ${f.m(quad(f, a * b, mid, p * q))}.${sq ? ' (This is a perfect square.)' : ''}`, `Regroupe les deux termes en x : ${f.m(quad(f, a * b, mid, p * q))}.${sq ? ' (C\'est un carré parfait.)' : ''}`)),
    ],
    nudge: t('Multiply each term of the first bracket by each term of the second, then collect the like terms.', 'Multiplie chaque terme de la première parenthèse par chaque terme de la seconde, puis regroupe les termes semblables.'),
  };
});

// ── common factors ──────────────────────────────────────────────────────────────

const smallestPrime = (n: number): number => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return d; return n; };
export const commonFactorGen = (id: string): Generator => choiceGen(id, (tier, r) => {
  let g = 2, m = 1, n = 1, c = 1;
  for (;;) {
    g = pick(r, tier === 2 ? [2, 3, 4, 5, 6] : [4, 6, 8, 9, 10, 12]);
    m = randInt(r, 1, 6); n = randInt(r, tier === 1 ? 1 : 2, 7); c = randInt(r, 1, 6);
    if (tier === 3 ? gcd(gcd(m, n), c) === 1 : gcd(m, n) === 1) break;
  }
  const d = smallestPrime(g), rest = g / d;
  const expr = (f: F): string => (tier === 1 ? lin(f, g * m, g * n) : tier === 2 ? poly(f, [[g * m, 'x^{2}'], [g * n, 'x']]) : quad(f, g * m, g * n, g * c));
  const right = (f: F): string => (tier === 1 ? `${f.n(g)}${bin(f, m, n)}` : tier === 2 ? `${f.n(g)}x${bin(f, m, n)}` : `${f.n(g)}(${quad(f, m, n, c)})`);
  const partial = (f: F): string => (tier === 1 ? `${f.n(d)}${bin(f, m * rest, n * rest)}` : tier === 2 ? `${f.n(d)}x${bin(f, m * rest, n * rest)}` : `${f.n(d)}(${quad(f, m * rest, n * rest, c * rest)})`);
  const forgot = (f: F): string => (tier === 1 ? `${f.n(g)}${bin(f, m, g * n)}` : tier === 2 ? `${f.n(g)}x${bin(f, m, g * n)}` : `${f.n(g)}(${quad(f, m, n, g * c)})`);
  const xOnly = (f: F): string => (tier === 2 ? `x(${lin(f, g * m, g * n)})` : tier === 1 ? `${f.n(g)}${bin(f, m, -n)}` : `${f.n(g)}(${quad(f, m, n, -c)})`);
  const mm = optMc(r, right, [
    [partial, t('That is a common factor, but not the greatest one, so the factoring is not finished. Look for a bigger factor shared by every term.', 'C\'est un facteur commun, mais pas le plus grand : la factorisation n\'est pas terminée. Cherche un facteur plus grand commun à tous les termes.')],
    [forgot, t('When a factor is taken out, every term inside the brackets is divided by it, including the last one.', 'Quand on met un facteur en évidence, chaque terme de la parenthèse est divisé par ce facteur, y compris le dernier.')],
    [xOnly, tier === 2 ? t('Only x was taken out. The numbers share a factor too.', 'Seul x a été mis en évidence. Les nombres ont aussi un facteur commun.') : t('A sign changed when the factor was taken out. Expand your answer to check it.', 'Un signe a changé quand le facteur a été mis en évidence. Développe ta réponse pour la vérifier.')],
    [(f) => `${f.n(g)}${tier === 2 ? 'x' : ''}${bin(f, m, n + 1)}`, t('Expand your answer: it does not give the original expression.', 'Développe ta réponse : elle ne redonne pas l\'expression de départ.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Factor fully: ${f.m(expr(f))}.`, `Factorise complètement : ${f.m(expr(f))}.`)),
    options: mm.options, correct: mm.correct, why: mm.why, category: 'KU',
    steps: [
      bi((f) => f.t(`The greatest common factor of the terms is ${f.m(tier === 2 ? `${f.n(g)}x` : f.n(g))}.`, `Le plus grand facteur commun des termes est ${f.m(tier === 2 ? `${f.n(g)}x` : f.n(g))}.`)),
      bi((f) => f.t(`Divide each term by it: ${f.m(right(f))}. Expanding gives back ${f.m(expr(f))}.`, `Divise chaque terme par ce facteur : ${f.m(right(f))}. En développant, on retrouve ${f.m(expr(f))}.`)),
    ],
    nudge: t('Find the biggest number (and letter) that divides every term, take it out, and divide each term by it.', 'Trouve le plus grand nombre (et la lettre) qui divise chaque terme, mets-le en évidence et divise chaque terme par lui.'),
  };
});

// ── factoring trinomials ────────────────────────────────────────────────────────

const sortedPair = (p: number, q: number): [number, number] => (p <= q ? [p, q] : [q, p]);
/** x² + bx + c with integer roots; tier 3 takes out a common factor first. */
export const factorMonicGen = (id: string): Generator => choiceGen(id, (tier, r) => {
  let p = 1, q = 2, k = 1;
  for (;;) {
    p = tier === 1 ? randInt(r, 1, 9) : nonzero(r, -9, 9); q = tier === 1 ? randInt(r, 1, 9) : nonzero(r, -9, 9);
    if (p !== q) break;
  }
  k = tier === 3 ? pick(r, [2, 3, 4, 5]) : 1;
  [p, q] = sortedPair(p, q);
  const prod = (f: F, s: number, u: number, w = 1): string => { const [x, y] = sortedPair(s, u); return `${kk(f, w)}${bin(f, 1, x)}${bin(f, 1, y)}`; };
  const m = optMc(r, (f) => prod(f, p, q, k), [
    [(f) => prod(f, -p, -q, k), t('The signs are the wrong way round. Expand to check: the middle term should have the sign of the original.', 'Les signes sont inversés. Développe pour vérifier : le terme du milieu doit avoir le signe de l\'original.')],
    [(f) => prod(f, p, -q, k), t('One sign is wrong. The two numbers multiply to the last term and add to the middle coefficient: check both.', 'Un signe est faux. Les deux nombres ont pour produit le dernier terme et pour somme le coefficient du milieu : vérifie les deux.')],
    [(f) => prod(f, p + q, p * q, k), t('The middle coefficient and the last term were put straight into the brackets. Look for two numbers that multiply to the last term and add to the middle one.', 'Le coefficient du milieu et le dernier terme ont été mis directement dans les parenthèses. Cherche deux nombres de produit égal au dernier terme et de somme égale au coefficient du milieu.')],
    [(f) => prod(f, -p, q, k), t('One sign is wrong. Multiply your two brackets back out to check.', 'Un signe est faux. Redéveloppe tes deux parenthèses pour vérifier.')],
    [(f) => (k === 1 ? prod(f, p + 1, q - 1) : prod(f, p, q)), k === 1 ? t('These numbers have the right sum or the right product, but not both.', 'Ces nombres ont la bonne somme ou le bon produit, mais pas les deux.') : t('The common factor was left out, so this does not give the original expression.', 'Le facteur commun a été oublié : cela ne redonne pas l\'expression de départ.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Factor fully: ${f.m(quad(f, k, k * (p + q), k * p * q))}.`, `Factorise complètement : ${f.m(quad(f, k, k * (p + q), k * p * q))}.`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [
      tier === 3
        ? bi((f) => f.t(`First take out the common factor ${f.N(k)}: ${f.m(`${f.n(k)}(${quad(f, 1, p + q, p * q)})`)}.`, `Mets d'abord en évidence le facteur commun ${f.N(k)} : ${f.m(`${f.n(k)}(${quad(f, 1, p + q, p * q)})`)}.`))
        : bi((f) => f.t(`Find two numbers that multiply to ${f.N(p * q)} and add to ${f.N(p + q)}.`, `Trouve deux nombres de produit ${f.N(p * q)} et de somme ${f.N(p + q)}.`)),
      bi((f) => f.t(`They are ${f.N(p)} and ${f.N(q)}, so the factors are ${f.m(prod(f, p, q, k))}.`, `Ce sont ${f.N(p)} et ${f.N(q)} : les facteurs sont ${f.m(prod(f, p, q, k))}.`)),
    ],
    nudge: t('Look for two numbers that multiply to the last term and add to the middle coefficient.', 'Cherche deux nombres de produit égal au dernier terme et de somme égale au coefficient du milieu.'),
  };
});

/** ax² + bx + c with a not 1: (ax + p)(bx + q) (MPM2D). */
export const factorGeneralGen = (id: string): Generator => choiceGen(id, (tier, r) => {
  const [a, b] = pick(r, tier === 1 ? [[2, 1], [3, 1]] : [[2, 1], [3, 1], [2, 3], [3, 2], [4, 1]] as [number, number][]);
  let p = 1, q = 2;
  for (;;) {
    p = tier === 3 ? nonzero(r, -8, 8) : randInt(r, 1, 8); q = tier === 3 ? nonzero(r, -8, 8) : randInt(r, 1, 8);
    if (p !== q && a * q + b * p !== 0 && gcd(gcd(a * b, a * q + b * p), Math.abs(p * q)) === 1) break;
  }
  const A = a * b, B = a * q + b * p, C = p * q;
  const fac = (f: F, s: number, u: number): string => `${bin(f, a, s)}${bin(f, b, u)}`;
  const m = optMc(r, (f) => fac(f, p, q), [
    [(f) => fac(f, q, p), t('The constants are in the wrong brackets. Expand: the x term does not match.', 'Les constantes sont dans les mauvaises parenthèses. Développe : le terme en x ne correspond pas.')],
    [(f) => fac(f, -p, -q), t('The signs are the wrong way round. Expand to check the middle term.', 'Les signes sont inversés. Développe pour vérifier le terme du milieu.')],
    [(f) => fac(f, p, -q), t('One sign is wrong. Expand to check the middle and last terms.', 'Un signe est faux. Développe pour vérifier les termes du milieu et du dernier.')],
    [(f) => `${bin(f, A, p)}${bin(f, 1, q)}`, t('The leading coefficient was put in only one bracket, so the x term is not right. Try the factors of the first coefficient in both brackets.', 'Le coefficient de x² a été mis dans une seule parenthèse, donc le terme en x est faux. Essaie les facteurs du premier coefficient dans les deux parenthèses.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Factor ${f.m(quad(f, A, B, C))}.`, `Factorise ${f.m(quad(f, A, B, C))}.`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [
      bi((f) => f.t(`Multiply ${f.N(A)} × ${f.N(C)} = ${f.N(A * C)}. Find two numbers that multiply to ${f.N(A * C)} and add to ${f.N(B)}: ${f.N(a * q)} and ${f.N(b * p)}.`, `Multiplie ${f.N(A)} × ${f.N(C)} = ${f.N(A * C)}. Trouve deux nombres de produit ${f.N(A * C)} et de somme ${f.N(B)} : ${f.N(a * q)} et ${f.N(b * p)}.`)),
      bi((f) => f.t(`Split the middle term and group: ${f.m(fac(f, p, q))}. Expanding gives back ${f.m(quad(f, A, B, C))}.`, `Sépare le terme du milieu et regroupe : ${f.m(fac(f, p, q))}. En développant, on retrouve ${f.m(quad(f, A, B, C))}.`)),
    ],
    nudge: t('Multiply the first and last coefficients, find two numbers with that product that add to the middle coefficient, then group.', 'Multiplie le premier et le dernier coefficient, trouve deux nombres de ce produit qui s\'additionnent au coefficient du milieu, puis regroupe.'),
  };
});

/** Difference of squares: x² − n², k²x² − m², and which expressions factor at all. */
export const diffSquaresGen = (id: string, hard: boolean): Generator => {
  const basic = choiceGen(id, (tier, r) => {
    const k = tier === 1 || !hard ? 1 : randInt(r, 2, 5), n = randInt(r, 2, 12);
    const m = optMc(r, (f) => `${bin(f, k, -n)}${bin(f, k, n)}`, [
      [(f) => `${bin(f, k, -n)}^{2}`, t('That expands to a trinomial with a middle term. A difference of squares has no middle term: the two middle products cancel.', 'Cela se développe en un trinôme avec un terme du milieu. Une différence de carrés n\'en a pas : les deux produits du milieu s\'annulent.')],
      [(f) => `${bin(f, k, n)}^{2}`, t('That expands to a trinomial with a middle term. Use one plus and one minus.', 'Cela se développe en un trinôme avec un terme du milieu. Utilise un plus et un moins.')],
      [(f) => `${bin(f, k, -n * n)}${bin(f, k, n * n)}`, t('The numbers were not square-rooted. Take the square root of each square before writing the brackets.', 'On n\'a pas pris la racine carrée de chaque carré. Prends la racine carrée de chaque carré avant d\'écrire les parenthèses.')],
      [(f) => `${bin(f, k, -n)}${bin(f, k, -n)}`, t('The two brackets must have opposite signs.', 'Les deux parenthèses doivent avoir des signes opposés.')],
    ]);
    return {
      prompt: bi((f) => f.t(`Factor ${f.m(poly(f, [[k * k, 'x^{2}'], [-n * n, '']]))}.`, `Factorise ${f.m(poly(f, [[k * k, 'x^{2}'], [-n * n, '']]))}.`)),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [
        bi((f) => f.t(`Both terms are perfect squares: ${f.m(`${f.n(k * k)}x^{2} = (${kk(f, k)}x)^{2}`)} and ${f.N(n * n)} = ${f.m(`${f.n(n)}^{2}`)}.`, `Les deux termes sont des carrés parfaits : ${f.m(`${f.n(k * k)}x^{2} = (${kk(f, k)}x)^{2}`)} et ${f.N(n * n)} = ${f.m(`${f.n(n)}^{2}`)}.`)),
        bi((f) => f.t(`a² − b² = (a − b)(a + b), so the answer is ${f.m(`${bin(f, k, -n)}${bin(f, k, n)}`)}.`, `a² − b² = (a − b)(a + b), donc la réponse est ${f.m(`${bin(f, k, -n)}${bin(f, k, n)}`)}.`)),
      ],
      nudge: t('Take the square root of each term, then write one bracket with a minus and one with a plus.', 'Prends la racine carrée de chaque terme, puis écris une parenthèse avec un moins et une avec un plus.'),
    };
  });
  const which = choiceGen(id, (_tier, r) => {
    const k = randInt(r, 1, 6), n = randInt(r, 2, 9);
    const sq = (f: F): string => poly(f, [[k * k, 'x^{2}'], [-n * n, '']]);
    const m = optMc(r, sq, [
      [(f) => poly(f, [[k * k, 'x^{2}'], [n * n, '']]), t('This is a sum of squares. It cannot be factored using integers.', 'C\'est une somme de carrés. On ne peut pas la factoriser avec des entiers.')],
      [(f) => poly(f, [[k * k, 'x^{2}'], [-(n * n + 1), '']]), t('The last number is not a perfect square, so this is not a difference of squares.', 'Le dernier nombre n\'est pas un carré parfait : ce n\'est pas une différence de carrés.')],
      [(f) => poly(f, [[k * k + 1, 'x^{2}'], [-n * n, '']]), t('The first coefficient is not a perfect square, so this is not a difference of squares.', 'Le premier coefficient n\'est pas un carré parfait : ce n\'est pas une différence de carrés.')],
    ]);
    return {
      prompt: t('Which of these is a difference of squares, so that it factors as (a − b)(a + b)?', 'Laquelle de ces expressions est une différence de carrés, donc se factorise en (a − b)(a + b) ?'),
      options: m.options, correct: m.correct, why: m.why, category: 'TH',
      steps: [t('A difference of squares has two perfect squares with a minus between them.', 'Une différence de carrés a deux carrés parfaits séparés par un signe moins.'), bi((f) => f.t(`Only ${f.m(sq(f))} fits: ${f.m(`(${kk(f, k)}x)^{2} - ${f.n(n)}^{2}`)}.`, `Seule ${f.m(sq(f))} convient : ${f.m(`(${kk(f, k)}x)^{2} - ${f.n(n)}^{2}`)}.`))],
      nudge: t('Check each expression: are both terms perfect squares, and is there a minus between them?', 'Vérifie chaque expression : les deux termes sont-ils des carrés parfaits, avec un moins entre eux ?'),
    };
  });
  return tierGen(basic, basic, hard ? which : basic);
};

// ── solving ─────────────────────────────────────────────────────────────────────

const distinctRoots = (r: () => number, neg: boolean): [number, number] => {
  let x = 1, y = 1;
  while (x === y || x === 0 || y === 0) { x = neg ? randInt(r, -9, 9) : randInt(r, 1, 9); y = neg ? randInt(r, -9, 9) : randInt(r, 1, 9); }
  return x > y ? [x, y] : [y, x];
};
/** Solve by factoring: the larger root. */
export const solveFactorGen = (id: string): Generator => numGen(id, (tier, r) => {
  const [hi, lo] = distinctRoots(r, tier > 1);
  const S = hi + lo, P = hi * lo;
  const form = tier === 1 ? 0 : tier === 2 ? 1 : pick(r, [2, 3]);
  const eq = (f: F): string => form === 0 ? `${bin(f, 1, -hi)}${bin(f, 1, -lo)} = 0` : form === 1 ? `${quad(f, 1, -S, P)} = 0` : form === 2 ? `${poly(f, [[1, 'x^{2}'], [-S, 'x']])} = ${f.n(-P)}` : `x^{2} = ${poly(f, [[S, 'x'], [-P, '']])}`;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(eq(f))}. Give the larger root.`, `Résous ${f.m(eq(f))}. Donne la plus grande racine.`)),
    answer: hi, category: 'AP',
    wrong: wr(hi, [
      [lo, t('That is the smaller root. The question asks for the larger one.', 'C\'est la plus petite racine. La question demande la plus grande.'), 1],
      [-hi, t('The roots are the values that make each bracket zero: x − 5 = 0 gives x = 5, not −5.', 'Les racines sont les valeurs qui annulent chaque parenthèse : x − 5 = 0 donne x = 5, pas −5.'), 1],
      [-lo, t('A sign slipped. Set each factor equal to zero and solve it.', 'Un signe a glissé. Pose chaque facteur égal à zéro et résous-le.'), 1],
      [S, t('That is the sum of the roots. Each root comes from one factor.', 'C\'est la somme des racines. Chaque racine vient d\'un facteur.'), 1],
    ]),
    steps: [
      form < 2 ? (form === 0 ? t('The equation is already factored.', 'L\'équation est déjà factorisée.') : bi((f) => f.t(`Factor: find two numbers that multiply to ${f.N(P)} and add to ${f.N(-S)}.`, `Factorise : trouve deux nombres de produit ${f.N(P)} et de somme ${f.N(-S)}.`)))
        : t('Move every term to one side so the other side is 0, then factor.', 'Ramène tous les termes d\'un côté pour que l\'autre soit 0, puis factorise.'),
      bi((f) => f.t(`${f.m(`${bin(f, 1, -hi)}${bin(f, 1, -lo)} = 0`)}, so x = ${f.N(hi)} or x = ${f.N(lo)}.`, `${f.m(`${bin(f, 1, -hi)}${bin(f, 1, -lo)} = 0`)}, donc x = ${f.N(hi)} ou x = ${f.N(lo)}.`)),
      bi((f) => f.t(`The larger root is ${f.N(hi)}.`, `La plus grande racine est ${f.N(hi)}.`)),
    ],
    nudge: t('If a product is zero, one of the factors is zero. Set each factor equal to zero.', 'Si un produit est nul, l\'un des facteurs est nul. Pose chaque facteur égal à zéro.'),
  };
});

/** The quadratic formula: the discriminant, the larger root, and rearranged equations. */
export const quadFormulaGen = (id: string): Generator => numGen(id, (tier, r) => {
  const [hi, lo] = distinctRoots(r, true);
  const a = tier === 1 ? 1 : randInt(r, 2, 3);
  const A = a, B = -a * (hi + lo), C = a * hi * lo, D = B * B - 4 * A * C;
  const sq = Math.sqrt(D);
  const std = (f: F): string => `${quad(f, A, B, C)} = 0`;
  const odd = tier === 3 ? pick(r, [0, 1]) : 0;
  const shown = (f: F): string => (tier < 3 ? std(f) : odd === 0 ? `${poly(f, [[A, 'x^{2}'], [B, 'x']])} = ${f.n(-C)}` : `${poly(f, [[A, 'x^{2}']])} = ${poly(f, [[-B, 'x'], [-C, '']])}`);
  return {
    prompt: bi((f) => f.t(`Use the quadratic formula to solve ${f.m(shown(f))}. Give the larger root.`, `Utilise la formule quadratique pour résoudre ${f.m(shown(f))}. Donne la plus grande racine.`)),
    answer: hi, category: 'AP',
    wrong: wr(hi, [
      [lo, t('That is the smaller root. Use the plus sign to get the larger one.', 'C\'est la plus petite racine. Utilise le signe plus pour obtenir la plus grande.'), 2],
      [-hi, t('The formula starts with −b. Watch the sign of b.', 'La formule commence par −b. Surveille le signe de b.'), 1],
      [(-B + sq) / A, t('The denominator is 2a, not a.', 'Le dénominateur est 2a, pas a.'), 2],
      [(B + sq) / (2 * A), t('The formula starts with −b, so b must change sign first.', 'La formule commence par −b : il faut d\'abord changer le signe de b.'), 1],
    ]),
    steps: [
      bi((f) => f.t(`Write the equation as ${f.m('ax^{2} + bx + c = 0')}: a = ${f.N(A)}, b = ${f.N(B)}, c = ${f.N(C)}.`, `Écris l'équation sous la forme ${f.m('ax^{2} + bx + c = 0')} : a = ${f.N(A)}, b = ${f.N(B)}, c = ${f.N(C)}.`)),
      bi((f) => f.t(`Discriminant: ${f.m(`b^{2} - 4ac = ${f.n(D)}`)}, and its square root is ${f.N(sq)}.`, `Discriminant : ${f.m(`b^{2} - 4ac = ${f.n(D)}`)}, et sa racine carrée est ${f.N(sq)}.`)),
      bi((f) => f.t(`${f.m(`x = \\frac{${f.n(-B)} \\pm ${f.n(sq)}}{${f.n(2 * A)}}`)}. The larger root is ${f.N(hi)}.`, `${f.m(`x = \\frac{${f.n(-B)} \\pm ${f.n(sq)}}{${f.n(2 * A)}}`)}. La plus grande racine est ${f.N(hi)}.`)),
    ],
    nudge: t('Write the equation as ax² + bx + c = 0 and read a, b and c. Then use x = (−b ± √(b² − 4ac)) ÷ 2a.', 'Écris l\'équation sous la forme ax² + bx + c = 0 et lis a, b et c. Puis utilise x = (−b ± √(b² − 4ac)) ÷ 2a.'),
  };
});

/** How many real roots, from the discriminant. */
export const discriminantGen = (id: string): Generator => {
  const NONE = t('No real roots', 'Aucune racine réelle'), ONE = t('Exactly one real root', 'Exactement une racine réelle'), TWO = t('Two different real roots', 'Deux racines réelles différentes'), MANY = t('Infinitely many real roots', 'Une infinité de racines réelles');
  const count = (tier: number) => choiceGen(id, (_t, r) => {
    let a = 1, b = 0, c = 0, D = 0;
    for (;;) {
      if (tier === 1) { D = randInt(r, -24, 24); a = 1; b = 0; c = 0; break; }
      a = randInt(r, 1, 3); b = randInt(r, -8, 8); c = randInt(r, -8, 8); D = b * b - 4 * a * c;
      if (r() < 0.25) { const k = randInt(r, 1, 4); b = 2 * a * k; c = a * k * k; D = 0; }
      break;
    }
    const right = D > 0 ? TWO : D === 0 ? ONE : NONE;
    const all = [NONE, ONE, TWO, MANY];
    const m = mc(r, right, all.filter((x) => x !== right).map((x): [Text, Text] => [x, x === MANY ? t('A quadratic equation has at most two real roots.', 'Une équation quadratique a au plus deux racines réelles.') : x === NONE ? t('Look at the sign of the discriminant. It is not negative.', 'Regarde le signe du discriminant. Il n\'est pas négatif.') : x === ONE ? t('One root happens only when the discriminant is exactly 0.', 'Il n\'y a qu\'une racine seulement quand le discriminant vaut exactement 0.') : t('Two roots need a positive discriminant.', 'Deux racines demandent un discriminant positif.')]));
    return {
      prompt: tier === 1
        ? bi((f) => f.t(`The discriminant of a quadratic equation is ${f.N(D)}. How many real roots does the equation have?`, `Le discriminant d'une équation quadratique est ${f.N(D)}. Combien de racines réelles l'équation a-t-elle ?`))
        : bi((f) => f.t(`How many real roots does ${f.m(`${quad(f, a, b, c)} = 0`)} have?`, `Combien de racines réelles l'équation ${f.m(`${quad(f, a, b, c)} = 0`)} a-t-elle ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: tier === 1
        ? [t('Positive discriminant: two roots. Zero: one root. Negative: no real roots.', 'Discriminant positif : deux racines. Nul : une racine. Négatif : aucune racine réelle.'), bi((f) => f.t(`The discriminant is ${f.N(D)}, so the answer is: ${right.en.toLowerCase()}.`, `Le discriminant est ${f.N(D)} : ${right.fr.toLowerCase()}.`))]
        : [bi((f) => f.t(`Discriminant: ${f.m(`b^{2} - 4ac = (${f.n(b)})^{2} - 4(${f.n(a)})(${f.n(c)}) = ${f.n(D)}`)}.`, `Discriminant : ${f.m(`b^{2} - 4ac = (${f.n(b)})^{2} - 4(${f.n(a)})(${f.n(c)}) = ${f.n(D)}`)}.`)), t(`Positive: two roots. Zero: one root. Negative: none. Answer: ${right.en.toLowerCase()}.`, `Positif : deux racines. Nul : une racine. Négatif : aucune. Réponse : ${right.fr.toLowerCase()}.`)],
      nudge: t('Work out b² − 4ac and look at its sign.', 'Calcule b² − 4ac et regarde son signe.'),
    };
  });
  const exactlyOne = numGen(id, (_tier, r) => {
    const b = pick(r, [4, 6, 8, 10, 12]), k = (b * b) / 4;
    return {
      prompt: bi((f) => f.t(`For what value of k does ${f.m(`x^{2} + ${f.n(b)}x + k = 0`)} have exactly one real root?`, `Pour quelle valeur de k l'équation ${f.m(`x^{2} + ${f.n(b)}x + k = 0`)} a-t-elle exactement une racine réelle ?`)),
      answer: k, category: 'TH',
      wrong: wr(k, [[b / 2, t('That is half of b. The discriminant needs b² − 4k = 0, so k = b² ÷ 4.', 'C\'est la moitié de b. Le discriminant doit être b² − 4k = 0, donc k = b² ÷ 4.'), 1], [b * b, t('That is b². Divide by 4: b² − 4k = 0 gives k = b² ÷ 4.', 'C\'est b². Divise par 4 : b² − 4k = 0 donne k = b² ÷ 4.'), 1], [(b * b) / 2, t('The discriminant has 4k, so divide b² by 4, not 2.', 'Le discriminant contient 4k : divise b² par 4, pas par 2.'), 1], [-k, t('The sign slipped. b² − 4k = 0 gives a positive k.', 'Le signe a glissé. b² − 4k = 0 donne un k positif.'), 1]]),
      steps: [t('One real root means the discriminant is 0.', 'Une racine réelle signifie que le discriminant vaut 0.'), bi((f) => f.t(`${f.m(`${f.n(b)}^{2} - 4(1)(k) = 0`)}, so ${f.m(`4k = ${f.n(b * b)}`)}.`, `${f.m(`${f.n(b)}^{2} - 4(1)(k) = 0`)}, donc ${f.m(`4k = ${f.n(b * b)}`)}.`)), bi((f) => f.t(`k = ${f.N(k)}.`, `k = ${f.N(k)}.`))],
      nudge: t('Set b² − 4ac equal to 0 and solve for k.', 'Pose b² − 4ac égal à 0 et résous pour k.'),
    };
  });
  return tierGen(count(1), count(2), exactlyOne);
};

/** Complete the square. */
export const completeSquareGen = (id: string): Generator => {
  const addNumber = numGen(id, (_tier, r) => {
    const b = pick(r, [2, 4, 6, 8, 10, 12, 14]), h = b / 2;
    return {
      prompt: bi((f) => f.t(`What number must be added to ${f.m(`x^{2} + ${f.n(b)}x`)} to make a perfect square trinomial?`, `Quel nombre faut-il ajouter à ${f.m(`x^{2} + ${f.n(b)}x`)} pour obtenir un trinôme carré parfait ?`)),
      answer: h * h, category: 'KU',
      wrong: wr(h * h, [[h, t('That is half of b. The number to add is half of b, squared.', 'C\'est la moitié de b. Le nombre à ajouter est la moitié de b, au carré.'), 0], [b * b, t('Half of b is squared, not b itself.', 'On élève au carré la moitié de b, pas b.'), 0], [h * h * 4 / 2, t('Take half of b first, then square it.', 'Prends d\'abord la moitié de b, puis élève-la au carré.'), 0]]),
      steps: [bi((f) => f.t(`Half of ${f.N(b)} is ${f.N(h)}.`, `La moitié de ${f.N(b)} est ${f.N(h)}.`)), bi((f) => f.t(`Square it: ${f.m(`${f.n(h)}^{2} = ${f.n(h * h)}`)}. Then ${f.m(`x^{2} + ${f.n(b)}x + ${f.n(h * h)} = (x + ${f.n(h)})^{2}`)}.`, `Élève-la au carré : ${f.m(`${f.n(h)}^{2} = ${f.n(h * h)}`)}. Alors ${f.m(`x^{2} + ${f.n(b)}x + ${f.n(h * h)} = (x + ${f.n(h)})^{2}`)}.`))],
      nudge: t('Take half of the coefficient of x, then square it.', 'Prends la moitié du coefficient de x, puis élève-la au carré.'),
    };
  });
  const find = (tier: number) => numGen(id, (_t, r) => {
    const h0 = randInt(r, 1, 8), neg = tier === 3 && r() < 0.6, b = (neg ? -2 : 2) * h0;
    const c = randInt(r, -12, 20), k = c - h0 * h0;
    return {
      prompt: tier === 2
        ? bi((f) => f.t(`Write ${f.m(quad(f, 1, b, c))} in the form ${f.m('(x - h)^{2} + k')}. What is k?`, `Écris ${f.m(quad(f, 1, b, c))} sous la forme ${f.m('(x - h)^{2} + k')}. Quelle est la valeur de k ?`))
        : bi((f) => f.t(`What is the minimum value of ${f.m(`y = ${quad(f, 1, b, c)}`)}? Complete the square to find out.`, `Quelle est la valeur minimale de ${f.m(`y = ${quad(f, 1, b, c)}`)} ? Complète le carré pour le savoir.`)),
      answer: k, category: 'AP',
      wrong: wr(k, [[c + h0 * h0, t('The square that was added must be taken away again: k = c − (half of b)².', 'Le carré qu\'on a ajouté doit être retiré : k = c − (la moitié de b)².'), 1], [c, t('That is the original constant. Subtract the square you added: k = c − (half of b)².', 'C\'est la constante de départ. Retire le carré ajouté : k = c − (la moitié de b)².'), 1], [-h0 * h0, t('The constant c is missing. k = c − (half of b)².', 'La constante c manque. k = c − (la moitié de b)².'), 1], [k + 2 * h0 * h0, t('The square was added instead of taken away.', 'On a ajouté le carré au lieu de le retirer.'), 1]]),
      steps: [bi((f) => f.t(`Half of ${f.N(b)} is ${f.N(b / 2)}, and ${f.m(`${f.n(b / 2)}^{2} = ${f.n(h0 * h0)}`)}.`, `La moitié de ${f.N(b)} est ${f.N(b / 2)}, et ${f.m(`${f.n(b / 2)}^{2} = ${f.n(h0 * h0)}`)}.`)), bi((f) => f.t(`${f.m(`${quad(f, 1, b, c)} = (x ${b < 0 ? '-' : '+'} ${f.n(h0)})^{2} + ${f.n(c)} - ${f.n(h0 * h0)}`)}.`, `${f.m(`${quad(f, 1, b, c)} = (x ${b < 0 ? '-' : '+'} ${f.n(h0)})^{2} + ${f.n(c)} - ${f.n(h0 * h0)}`)}.`)), bi((f) => f.t(`So k = ${f.N(k)}${tier === 3 ? ', which is the minimum value of y' : ''}.`, `Donc k = ${f.N(k)}${tier === 3 ? ', qui est la valeur minimale de y' : ''}.`))],
      nudge: t('Add and subtract the square of half the x coefficient, then write the perfect square.', 'Ajoute et retire le carré de la moitié du coefficient de x, puis écris le carré parfait.'),
    };
  });
  return tierGen(addNumber, find(2), find(3));
};
