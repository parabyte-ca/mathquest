// Grade 9 (MTH1W) Number strand (B): number sets, density and limits, exponents and scientific notation, exponent laws, integers
// in context, unit fractions and measuring, signs in rates and decimals, signed fractions, and rates, percents and proportions.
import { makeRng, pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { build, frac, gcd, t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const pw = (f: F, b: number, e: number): string => `${f.n(b)}^{${f.n(e)}}`;

/** MS.G9.B1.2.a: subsets of the number system */
const SETS = ['natural numbers', 'whole numbers', 'integers', 'rational numbers', 'irrational numbers'] as const;
const SETS_FR: Record<string, string> = { 'natural numbers': 'nombres naturels', 'whole numbers': 'nombres entiers naturels (avec zéro)', integers: 'entiers relatifs', 'rational numbers': 'nombres rationnels', 'irrational numbers': 'nombres irrationnels' };
const KINDS: { tex: string; set: (typeof SETS)[number] }[] = [
  { tex: '7', set: 'natural numbers' }, { tex: '12', set: 'natural numbers' }, { tex: '0', set: 'whole numbers' },
  { tex: '-4', set: 'integers' }, { tex: '-15', set: 'integers' }, { tex: '\\frac{3}{5}', set: 'rational numbers' }, { tex: '-\\frac{7}{2}', set: 'rational numbers' },
  { tex: '0.25', set: 'rational numbers' }, { tex: '\\sqrt{2}', set: 'irrational numbers' }, { tex: '\\sqrt{7}', set: 'irrational numbers' }, { tex: '\\pi', set: 'irrational numbers' },
];
const WHY_SET = (n: string): Text => t(`The number ${n} is not in that set, or the set is not the smallest one that holds it.`, `Le nombre ${n} n'est pas dans cet ensemble, ou l'ensemble n'est pas le plus petit qui le contient.`);
const smallestSet = choiceGen('MS.G9.B1.2.a', (_tier, r) => {
  const k = pick(r, KINDS);
  const opt = (s: string): Text => t(s, SETS_FR[s]!);
  const m = mc(r, opt(k.set), SETS.filter((s) => s !== k.set).map((s): [Text, Text] => [opt(s), WHY_SET(k.tex)]));
  return {
    prompt: bi((f) => f.t(`What is the smallest set of numbers (natural, whole, integers, rational, irrational) that contains ${f.m(k.tex)}?`, `Quel est le plus petit ensemble de nombres (naturels, entiers naturels avec zéro, entiers relatifs, rationnels, irrationnels) qui contient ${f.m(k.tex)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('The sets nest: natural ⊂ whole ⊂ integers ⊂ rational. Irrational numbers are separate (non-repeating, non-terminating decimals).', 'Les ensembles s\'emboîtent : naturels ⊂ entiers naturels ⊂ entiers relatifs ⊂ rationnels. Les irrationnels sont à part (décimales infinies sans période).'), t(`The smallest set that holds it is the ${k.set}.`, `Le plus petit ensemble qui le contient est celui des ${SETS_FR[k.set]}.`)],
    nudge: t('Start with the natural numbers and move outward until the number fits.', 'Commence par les nombres naturels et va vers l\'extérieur jusqu\'à ce que le nombre convienne.'),
  };
});
const TRUE_STATEMENTS: [string, string][] = [['Every integer is a rational number.', 'Tout entier relatif est un nombre rationnel.'], ['Every natural number is a whole number.', 'Tout nombre naturel est un entier naturel (avec zéro).'], ['Every whole number is an integer.', 'Tout entier naturel (avec zéro) est un entier relatif.']];
const FALSE_STATEMENTS: [string, string][] = [['Every rational number is an integer.', 'Tout nombre rationnel est un entier relatif.'], ['Every integer is a natural number.', 'Tout entier relatif est un nombre naturel.'], ['Some irrational numbers are rational.', 'Certains nombres irrationnels sont rationnels.'], ['Every whole number is a natural number.', 'Tout entier naturel (avec zéro) est un nombre naturel.']];
const trueStatement = choiceGen('MS.G9.B1.2.a', (_tier, r) => {
  const good = pick(r, TRUE_STATEMENTS);
  const bad = FALSE_STATEMENTS.filter((_, i) => i !== randInt(r, 0, 3)).slice(0, 2);
  const m = mc(r, t(...good), bad.map((b): [Text, Text] => [t(...b), t('This statement is false. Think of an example that breaks it (for example 1/2 is rational but not an integer, 0 is whole but not natural, −3 is an integer but not natural).', 'Cet énoncé est faux. Pense à un exemple qui le contredit (par exemple 1/2 est rationnel mais pas entier, 0 est entier naturel mais pas naturel, −3 est entier relatif mais pas naturel).')]));
  return {
    prompt: t('Which statement is true?', 'Quel énoncé est vrai ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Picture the sets inside each other: natural, whole, integers, rational.', 'Imagine les ensembles les uns dans les autres : naturels, entiers naturels, entiers relatifs, rationnels.'), t('A statement "every A is a B" is true only when the set A sits completely inside B.', 'Un énoncé « tout A est un B » est vrai seulement quand l\'ensemble A est entièrement dans B.')],
    nudge: t('Test each statement with an example number.', 'Teste chaque énoncé avec un exemple.'),
  };
});
const IRRATIONAL = choiceGen('MS.G9.B1.2.a', (_tier, r) => {
  const nonSq = pick(r, [2, 3, 5, 6, 7, 10, 11]);
  const sq = pick(r, [4, 9, 16, 25, 36, 49]);
  const a = randInt(r, 1, 9), b = pick(r, [3, 6, 7, 9]);
  const opts: [string, boolean][] = [[`\\sqrt{${nonSq}}`, true], [`\\sqrt{${sq}}`, false], [`0.${a}5`, false], [`\\frac{${a}}{${b}}`, false]];
  const rightTex = opts[0]![0];
  const wrongs = opts.slice(1).map(([x]): [Text, Text] => [bi((f) => f.m(x)), t('This number is rational: it is a fraction, a terminating decimal, a repeating decimal or the root of a perfect square.', 'Ce nombre est rationnel : c\'est une fraction, une décimale finie, une décimale périodique ou la racine d\'un carré parfait.')]);
  const m = mc(r, bi((f) => f.m(rightTex)), wrongs);
  return {
    prompt: t('Which of these numbers is irrational?', 'Lequel de ces nombres est irrationnel ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('An irrational number cannot be written as a fraction of integers. The root of a number that is not a perfect square is irrational.', 'Un nombre irrationnel ne peut pas s\'écrire comme une fraction d\'entiers. La racine d\'un nombre qui n\'est pas un carré parfait est irrationnelle.'), t('The other choices are fractions, repeating decimals, or the root of a perfect square, so they are rational.', 'Les autres choix sont des fractions, des décimales périodiques ou la racine d\'un carré parfait : ils sont rationnels.')],
    nudge: t('Which one is not a fraction, not a repeating decimal and not a perfect-square root?', 'Lequel n\'est ni une fraction, ni une décimale périodique, ni la racine d\'un carré parfait ?'),
  };
});
export const subsets9 = tierGen(smallestSet, trueStatement, IRRATIONAL);

/** MS.G9.B1.3.a: density, infinity and limit */
const howMany = choiceGen('MS.G9.B1.3.a', (_tier, r) => {
  const a = randInt(r, 1, 8);
  const lo = a / 10, hi = (a + 1) / 10;
  const m = mc(r, t('Infinitely many', 'Une infinité'), [
    [t('None', 'Aucun'), t('There is always another number between two different rational numbers: for example, their average.', 'Il y a toujours un autre nombre entre deux nombres rationnels différents : par exemple, leur moyenne.')],
    [t('Exactly 9', 'Exactement 9'), t('Those are only the decimals with two places. You can keep adding decimal places (0.351, 0.3512, ...).', 'Ce ne sont que les décimales à deux chiffres. Tu peux continuer d\'ajouter des décimales (0,351, 0,3512, ...).')],
    [t('Exactly 1', 'Exactement 1'), t('The average of the two numbers is one, but there is another between each of them and the average, and so on.', 'La moyenne des deux nombres en est un, mais il y en a un autre entre chacun d\'eux et la moyenne, et ainsi de suite.')],
  ]);
  return {
    prompt: bi((f) => f.t(`How many rational numbers are between ${f.N(lo)} and ${f.N(hi)}?`, `Combien de nombres rationnels y a-t-il entre ${f.N(lo)} et ${f.N(hi)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('The rational numbers are dense: between any two there is a third (their average), and then more between those.', 'Les nombres rationnels sont denses : entre deux nombres, il y en a un troisième (leur moyenne), puis d\'autres entre ceux-ci.'), t('This never stops, so there are infinitely many.', 'Cela ne s\'arrête jamais : il y en a une infinité.')],
    nudge: t('Find the average of the two numbers. Is there room for another one next to it?', 'Trouve la moyenne des deux nombres. Y a-t-il de la place pour un autre à côté ?'),
  };
});
const between = choiceGen('MS.G9.B1.3.a', (_tier, r) => {
  const d1 = randInt(r, 2, 6), d2 = d1 + randInt(r, 1, 3);
  const lo = 1 / d2, hi = 1 / d1; // d2 > d1 so 1/d2 < 1/d1
  const good = r6((lo + hi) / 2);
  const bads = [r6(lo - 0.05), r6(hi + 0.05), r6(lo / 2)].filter((x) => x !== good).slice(0, 3);
  const m = mc(r, bi((f) => f.N(good)), bads.map((x): [Text, Text] => [bi((f) => f.N(x)), t('This number is not between the two fractions. Change both fractions to decimals and compare.', 'Ce nombre n\'est pas entre les deux fractions. Transforme les deux fractions en décimales et compare.')]));
  return {
    prompt: bi((f) => f.t(`Which number is between ${f.m(frac(1, f.n(d2)))} and ${f.m(frac(1, f.n(d1)))}?`, `Quel nombre est entre ${f.m(frac(1, f.n(d2)))} et ${f.m(frac(1, f.n(d1)))} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [bi((f) => f.t(`As decimals the fractions are about ${f.N(r6(lo))} and ${f.N(r6(hi))}.`, `En décimales, les fractions valent environ ${f.N(r6(lo))} et ${f.N(r6(hi))}.`)), bi((f) => f.t(`Their average ${f.N(good)} is between them.`, `Leur moyenne ${f.N(good)} est entre elles.`))],
    nudge: t('Write both fractions as decimals, then pick the number in between.', 'Écris les deux fractions en décimales, puis choisis le nombre entre elles.'),
  };
});
const LIMITS: { seq: (f: F) => string; limit: number; seqTex: string }[] = [
  { seq: (f) => `${f.n(0.9)},\\ ${f.n(0.99)},\\ ${f.n(0.999)},\\ ${f.n(0.9999)},\\ \\ldots`, limit: 1, seqTex: 'nines' },
  { seq: (f) => `${f.n(2.1)},\\ ${f.n(2.01)},\\ ${f.n(2.001)},\\ ${f.n(2.0001)},\\ \\ldots`, limit: 2, seqTex: 'twos' },
  { seq: (f) => `1,\\ ${frac(1, 2)},\\ ${frac(1, 3)},\\ ${frac(1, 4)},\\ \\ldots`, limit: 0, seqTex: 'harmonic' },
  { seq: (f) => `${f.n(5)},\\ ${f.n(2.5)},\\ ${f.n(1.25)},\\ ${f.n(0.625)},\\ \\ldots`, limit: 0, seqTex: 'halving' },
  { seq: (f) => `${f.n(3.9)},\\ ${f.n(3.99)},\\ ${f.n(3.999)},\\ ${f.n(3.9999)},\\ \\ldots`, limit: 4, seqTex: 'fours' },
];
const limitGen = choiceGen('MS.G9.B1.3.a', (_tier, r) => {
  const L = pick(r, LIMITS);
  const cands = [0, 1, 2, 4].filter((x) => x !== L.limit);
  const m = mc(r, bi((f) => f.N(L.limit)), cands.slice(0, 3).map((x): [Text, Text] => [bi((f) => f.N(x)), t('The terms get closer and closer to a different number. Look at the last terms: how close are they to this one?', 'Les termes se rapprochent d\'un autre nombre. Regarde les derniers termes : sont-ils proches de celui-ci ?')]));
  return {
    prompt: bi((f) => f.t(`The terms ${f.m(L.seq(f))} get closer and closer to a number. Which number is the limit?`, `Les termes ${f.m(L.seq(f))} se rapprochent d'un nombre. Quel nombre est la limite ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('The limit is the number the terms get as close to as you like, even if they never reach it.', 'La limite est le nombre dont les termes se rapprochent autant qu\'on veut, même s\'ils ne l\'atteignent jamais.'), bi((f) => f.t(`Here the limit is ${f.N(L.limit)}.`, `Ici, la limite est ${f.N(L.limit)}.`))],
    nudge: t('Look at the later terms: what number are they nearing?', 'Regarde les termes suivants : de quel nombre s\'approchent-ils ?'),
  };
});
export const density9 = tierGen(howMany, between, limitGen);

/** MS.G9.B2.1.a: exponents (sign and size) and scientific notation */
const negPower = numGen('MS.G9.B2.1.a', (_tier, r) => {
  const [b, e] = pick(r, [[2, 2], [2, 3], [2, 4], [5, 1], [5, 2], [5, 3], [10, 2], [10, 3], [10, 4]] as [number, number][]);
  const ans = r6(1 / b ** e);
  return {
    prompt: bi((f) => f.t(`Write ${f.m(pw(f, b, -e))} as a decimal.`, `Écris ${f.m(pw(f, b, -e))} sous forme de nombre décimal.`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[-(b ** e), t('A negative exponent does not make the number negative. It means the reciprocal: 1 divided by the power.', 'Un exposant négatif ne rend pas le nombre négatif. Il signifie l\'inverse : 1 divisé par la puissance.'), 0], [b ** e, t('That ignores the negative sign of the exponent. A negative exponent gives a number smaller than 1.', 'Cela ignore le signe négatif de l\'exposant. Un exposant négatif donne un nombre plus petit que 1.'), 0], [-b * e, t('The exponent tells how many times to multiply the base, not to multiply the base by the exponent.', 'L\'exposant indique combien de fois multiplier la base, pas de multiplier la base par l\'exposant.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(pw(f, b, -e))} means ${f.m(`${frac(1, pw(f, b, e))}`)}, which is 1 ÷ ${f.N(b ** e)}.`, `${f.m(pw(f, b, -e))} signifie ${f.m(`${frac(1, pw(f, b, e))}`)}, c'est-à-dire 1 ÷ ${f.N(b ** e)}.`)), bi((f) => `1 ÷ ${f.N(b ** e)} = ${f.N(ans)}.`)],
    nudge: t('A negative exponent means the reciprocal: 1 over the power with a positive exponent.', 'Un exposant négatif signifie l\'inverse : 1 sur la puissance avec un exposant positif.'),
  };
});
const sciExponent = numGen('MS.G9.B2.1.a', (_tier, r) => {
  const big = r() < 0.5;
  const digits = randInt(r, 11, 99);
  const n = big ? randInt(r, 3, 7) : -randInt(r, 2, 4);
  const value = r6(big ? digits * 10 ** (n - 1) : digits * 10 ** (n - 1));
  return {
    prompt: bi((f) => f.t(`Write ${f.N(value)} in scientific notation ${f.m('a \\times 10^{n}')} with ${f.m('1 \\le a < 10')}. What is the exponent n?`, `Écris ${f.N(value)} en notation scientifique ${f.m('a \\times 10^{n}')} avec ${f.m('1 \\le a < 10')}. Quel est l'exposant n ?`)),
    answer: n, category: 'AP',
    wrong: wr(n, [[-n, t('The sign is wrong. Numbers 10 or more have a positive exponent. Numbers between 0 and 1 have a negative exponent.', 'Le signe est faux. Les nombres de 10 ou plus ont un exposant positif. Les nombres entre 0 et 1 ont un exposant négatif.'), 0], [big ? n - 1 : n + 1, t('Count the places the decimal point moves to get a number between 1 and 10. It is easy to be off by one.', 'Compte les positions dont la virgule se déplace pour obtenir un nombre entre 1 et 10. Il est facile de se tromper d\'un.'), 0]]),
    steps: [t('Move the decimal point so that a is between 1 and 10, and count the moves.', 'Déplace la virgule pour que a soit entre 1 et 10, et compte les déplacements.'), bi((f) => f.t(`Moving right means a negative exponent and moving left means a positive exponent. Here n = ${f.N(n)}.`, `Déplacer vers la droite donne un exposant négatif et vers la gauche un exposant positif. Ici, n = ${f.N(n)}.`))],
    nudge: t('Count how many places the decimal point moves to make a number from 1 up to 10.', 'Compte de combien de positions la virgule se déplace pour obtenir un nombre de 1 à moins de 10.'),
  };
});
const sciProduct = numGen('MS.G9.B2.1.a', (_tier, r) => {
  const a = randInt(r, 2, 9), b = randInt(r, 2, 9), m = randInt(r, -5, 6), n = randInt(r, -5, 6);
  const p = m + n + (a * b >= 10 ? 1 : 0);
  return {
    prompt: bi((f) => f.t(`${f.m(`(${f.n(a)} \\times 10^{${f.n(m)}}) \\times (${f.n(b)} \\times 10^{${f.n(n)}})`)} is written as ${f.m('c \\times 10^{p}')} with ${f.m('1 \\le c < 10')}. What is p?`, `${f.m(`(${f.n(a)} \\times 10^{${f.n(m)}}) \\times (${f.n(b)} \\times 10^{${f.n(n)}})`)} s'écrit ${f.m('c \\times 10^{p}')} avec ${f.m('1 \\le c < 10')}. Quelle est la valeur de p ?`)),
    answer: p, category: 'TH',
    wrong: wr(p, [[m + n, t('The powers of 10 add to give that, but the product of the first numbers may be 10 or more. Then it must be rewritten, which adds 1 to the exponent.', 'Les puissances de 10 s\'additionnent pour donner cela, mais le produit des premiers nombres peut être de 10 ou plus. Il faut alors le réécrire, ce qui ajoute 1 à l\'exposant.'), 1], [m * n, t('Exponents are added when powers with the same base are multiplied, not multiplied.', 'Les exposants s\'additionnent quand on multiplie des puissances de même base, ils ne se multiplient pas.'), 1], [m + n + 1, t('Only add 1 when the product of the first numbers is 10 or more.', 'Ajoute 1 seulement quand le produit des premiers nombres est de 10 ou plus.'), 1]]),
    steps: [bi((f) => f.t(`Multiply the first numbers: ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)}. Add the exponents: ${f.N(m)} + ${f.N(n)} = ${f.N(m + n)}.`, `Multiplie les premiers nombres : ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)}. Additionne les exposants : ${f.N(m)} + ${f.N(n)} = ${f.N(m + n)}.`)), a * b >= 10 ? bi((f) => f.t(`${f.N(a * b)} is 10 or more, so write it as ${f.m(`${f.n(a * b / 10)} \\times 10`)} and add 1 to the exponent: p = ${f.N(p)}.`, `${f.N(a * b)} est de 10 ou plus : écris-le ${f.m(`${f.n(a * b / 10)} \\times 10`)} et ajoute 1 à l'exposant : p = ${f.N(p)}.`)) : bi((f) => f.t(`${f.N(a * b)} is less than 10, so p = ${f.N(p)}.`, `${f.N(a * b)} est inférieur à 10 : p = ${f.N(p)}.`))],
    nudge: t('Multiply the front numbers, add the exponents, then check that the front number is below 10.', 'Multiplie les nombres de devant, additionne les exposants, puis vérifie que le nombre de devant est inférieur à 10.'),
  };
});
export const exponents9 = tierGen(negPower, sciExponent, sciProduct);

/** MS.G9.B2.2.a: exponent laws for numeric and algebraic expressions */
const lawExponent = numGen('MS.G9.B2.2.a', (_tier, r) => {
  const kind = pick(r, ['product', 'quotient', 'power'] as const);
  const b = pick(r, [2, 3, 5, 7]), m = randInt(r, 2, 9), n = randInt(r, 2, 6);
  const ans = kind === 'product' ? m + n : kind === 'quotient' ? m - n : m * n;
  const expr = (f: F): string => (kind === 'product' ? `${pw(f, b, m)} \\times ${pw(f, b, n)}` : kind === 'quotient' ? `${pw(f, b, m)} \\div ${pw(f, b, n)}` : `(${pw(f, b, m)})^{${f.n(n)}}`);
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${expr(f)} = ${f.n(b)}^{?}`)}. What exponent replaces the ?`, `Simplifie ${f.m(`${expr(f)} = ${f.n(b)}^{?}`)}. Quel exposant remplace le ? ?`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, kind === 'product' ? [[m * n, t('When you multiply powers with the same base, add the exponents.', 'Quand on multiplie des puissances de même base, on additionne les exposants.'), 0]] : kind === 'quotient' ? [[m + n, t('When you divide powers with the same base, subtract the exponents.', 'Quand on divise des puissances de même base, on soustrait les exposants.'), 0], [n - m, t('Subtract in the right order: the exponent of the top minus the exponent of the bottom.', 'Soustrais dans le bon ordre : l\'exposant du haut moins l\'exposant du bas.'), 0]] : [[m + n, t('For a power of a power, multiply the exponents.', 'Pour une puissance de puissance, multiplie les exposants.'), 0]]),
    steps: [t(kind === 'product' ? 'Same base, multiply: add the exponents.' : kind === 'quotient' ? 'Same base, divide: subtract the exponents.' : 'A power of a power: multiply the exponents.', kind === 'product' ? 'Même base, multiplication : additionne les exposants.' : kind === 'quotient' ? 'Même base, division : soustrais les exposants.' : 'Une puissance de puissance : multiplie les exposants.'), bi((f) => (kind === 'product' ? `${f.N(m)} + ${f.N(n)} = ${f.N(ans)}.` : kind === 'quotient' ? `${f.N(m)} − ${f.N(n)} = ${f.N(ans)}.` : `${f.N(m)} × ${f.N(n)} = ${f.N(ans)}.`))],
    nudge: t('Which law applies: product, quotient or power of a power?', 'Quelle loi s\'applique : produit, quotient ou puissance de puissance ?'),
  };
});
const lawValue = numGen('MS.G9.B2.2.a', (_tier, r) => {
  const b = pick(r, [2, 3, 5]), a = randInt(r, 2, 5), c = randInt(r, 2, 5), d = randInt(r, 1, a + c - 1);
  const e = a + c - d;
  return {
    prompt: bi((f) => f.t(`Evaluate ${f.m(`\\frac{${pw(f, b, a)} \\times ${pw(f, b, c)}}{${pw(f, b, d)}}`)}.`, `Évalue ${f.m(`\\frac{${pw(f, b, a)} \\times ${pw(f, b, c)}}{${pw(f, b, d)}}`)}.`)),
    answer: b ** e, category: 'AP',
    wrong: wr(b ** e, [[b ** (a * c - d), t('Multiplying powers with the same base adds the exponents, it does not multiply them.', 'Multiplier des puissances de même base additionne les exposants, il ne les multiplie pas.'), 0], [b ** (a + c + d), t('Dividing by a power subtracts its exponent.', 'Diviser par une puissance soustrait son exposant.'), 1]]),
    steps: [bi((f) => f.t(`Add the exponents on top, then subtract the bottom: ${f.N(a)} + ${f.N(c)} − ${f.N(d)} = ${f.N(e)}.`, `Additionne les exposants du haut, puis soustrais celui du bas : ${f.N(a)} + ${f.N(c)} − ${f.N(d)} = ${f.N(e)}.`)), bi((f) => `${f.m(pw(f, b, e))} = ${f.N(b ** e)}.`)],
    nudge: t('Use the exponent laws first, then work out the power.', 'Utilise d\'abord les lois des exposants, puis calcule la puissance.'),
  };
});
const lawAlgebra = numGen('MS.G9.B2.2.a', (_tier, r) => {
  const a = randInt(r, 2, 5), b = randInt(r, 2, 4), c = randInt(r, 1, a * b - 1);
  const ans = a * b - c;
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`\\frac{(x^{${f.n(a)}})^{${f.n(b)}}}{x^{${f.n(c)}}} = x^{?}`)}. What exponent replaces the ? (it is positive)?`, `Simplifie ${f.m(`\\frac{(x^{${f.n(a)}})^{${f.n(b)}}}{x^{${f.n(c)}}} = x^{?}`)}. Quel exposant remplace le ? (il est positif) ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[a + b - c, t('A power of a power multiplies the exponents: first find a × b.', 'Une puissance de puissance multiplie les exposants : trouve d\'abord a × b.'), 0], [a * b + c, t('Dividing subtracts the exponent of the bottom.', 'Diviser soustrait l\'exposant du bas.'), 1]]),
    steps: [bi((f) => f.t(`Power of a power: ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)}, so the top is ${f.m(`x^{${f.n(a * b)}}`)}.`, `Puissance de puissance : ${f.N(a)} × ${f.N(b)} = ${f.N(a * b)} : le haut est ${f.m(`x^{${f.n(a * b)}}`)}.`)), bi((f) => `${f.N(a * b)} − ${f.N(c)} = ${f.N(ans)}.`)],
    nudge: t('Multiply the exponents in the bracket first, then subtract the exponent below.', 'Multiplie d\'abord les exposants dans la parenthèse, puis soustrais l\'exposant du bas.'),
  };
});
export const expLaws9 = tierGen(lawExponent, lawValue, lawAlgebra);

/** MS.G9.B3.1.a: integers for location, direction and change */
const netChange = numGen('MS.G9.B3.1.a', (_tier, r) => {
  const start = -randInt(r, 5, 30) * 5, up = randInt(r, 4, 20) * 5, down = randInt(r, 2, 15) * 5;
  const ans = start + up - down;
  return {
    prompt: bi((f) => f.t(`A submarine is at ${f.N(start)} m (negative means below sea level). It rises ${f.N(up)} m and then dives ${f.N(down)} m. What is its position now, in metres?`, `Un sous-marin est à ${f.N(start)} m (négatif signifie sous le niveau de la mer). Il monte de ${f.N(up)} m, puis plonge de ${f.N(down)} m. Quelle est sa position maintenant, en mètres ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[start - up - down, t('Rising adds to the position and diving subtracts from it.', 'Monter ajoute à la position et plonger en soustrait.'), 1], [start + up + down, t('Diving moves the submarine down, so subtract that part.', 'Plonger fait descendre le sous-marin : soustrais cette partie.'), 1]]),
    steps: [t('Rising is positive and diving is negative. Add the changes to the start.', 'Monter est positif et plonger est négatif. Ajoute les changements au départ.'), bi((f) => `${f.N(start)} + ${f.N(up)} − ${f.N(down)} = ${f.N(ans)}.`)],
    nudge: t('Add the rise and subtract the dive, starting from the first position.', 'Ajoute la montée et soustrais la plongée, en partant de la première position.'),
  };
});
const gapBetween = numGen('MS.G9.B3.1.a', (_tier, r) => {
  const below = -randInt(r, 5, 60), above = randInt(r, 5, 80);
  return {
    prompt: bi((f) => f.t(`A diver is at ${f.N(below)} m and a bird is at ${f.N(above)} m, measured from sea level (above is positive). How many metres apart are they?`, `Un plongeur est à ${f.N(below)} m et un oiseau est à ${f.N(above)} m, mesurés à partir du niveau de la mer (au-dessus est positif). À combien de mètres l'un de l'autre sont-ils ?`)),
    answer: above - below, category: 'AP',
    wrong: wr(above - below, [[above + below, t('To find the distance between two positions, subtract them: the larger minus the smaller.', 'Pour trouver la distance entre deux positions, soustrais-les : la plus grande moins la plus petite.'), 0], [Math.abs(below) - above, t('That leaves out part of the gap. One is above sea level and one is below, so add their distances from sea level.', 'Cela oublie une partie de l\'écart. L\'un est au-dessus du niveau de la mer et l\'autre en dessous : additionne leurs distances au niveau de la mer.'), 0]]),
    steps: [bi((f) => f.t(`Distance = larger − smaller = ${f.N(above)} − (${f.N(below)}).`, `Distance = plus grand − plus petit = ${f.N(above)} − (${f.N(below)}).`)), bi((f) => `${f.N(above)} + ${f.N(-below)} = ${f.N(above - below)}.`)],
    nudge: t('Subtract the lower position from the higher one.', 'Soustrais la position la plus basse de la plus haute.'),
  };
});
const rateTime = numGen('MS.G9.B3.1.a', (_tier, r) => {
  const start = randInt(r, 20, 90), rate = -randInt(r, 3, 12), mins = randInt(r, 4, 12);
  const ans = start + rate * mins;
  return {
    prompt: bi((f) => f.t(`A balloon is at ${f.N(start)} m. It changes height by ${f.N(rate)} m each minute (negative means going down). Where is it after ${f.N(mins)} minutes, in metres? (A negative answer means below ground level.)`, `Un ballon est à ${f.N(start)} m. Sa hauteur change de ${f.N(rate)} m chaque minute (négatif signifie qu'il descend). Où est-il après ${f.N(mins)} minutes, en mètres ? (Une réponse négative signifie sous le niveau du sol.)`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[start - rate * mins, t('The change per minute is already negative, so add it (a negative number added goes down).', 'Le changement par minute est déjà négatif : ajoute-le (ajouter un négatif fait descendre).'), 1], [rate * mins, t('That is only the total change. Add it to the starting height.', 'C\'est seulement le changement total. Ajoute-le à la hauteur de départ.'), 1]]),
    steps: [bi((f) => f.t(`Total change: ${f.N(rate)} × ${f.N(mins)} = ${f.N(rate * mins)} m.`, `Changement total : ${f.N(rate)} × ${f.N(mins)} = ${f.N(rate * mins)} m.`)), bi((f) => `${f.N(start)} + (${f.N(rate * mins)}) = ${f.N(ans)}.`)],
    nudge: t('Multiply the rate by the minutes, then add to the start.', 'Multiplie le taux par les minutes, puis ajoute au départ.'),
  };
});
export const integers9 = tierGen(netChange, gapBetween, rateTime);

/** MS.G9.B3.2.a: unit fractions and measuring tools */
const scoops = numGen('MS.G9.B3.2.a', (_tier, r) => {
  const d = pick(r, [4, 8, 16]), b = pick(r, [2, 4]), a = randInt(r, 1, b - 1) + b * randInt(r, 0, 1);
  const ans = (a * d) / b;
  const unit = d === 4 ? ['quarter', 'quart'] : d === 8 ? ['eighth', 'huitième'] : ['sixteenth', 'seizième'];
  return {
    prompt: bi((f) => f.t(`A recipe needs ${f.m(frac(f.n(a), f.n(b)))} cup of flour. You only have a measuring scoop that holds one ${unit[0]} (${f.m(frac(1, f.n(d)))}) of a cup. How many scoops do you need?`, `Une recette demande ${f.m(frac(f.n(a), f.n(b)))} tasse de farine. Tu n'as qu'une mesure qui contient un ${unit[1]} (${f.m(frac(1, f.n(d)))}) de tasse. Combien de mesures te faut-il ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6(a / b), t('That is the amount of flour in cups. Count how many unit fractions fit in it.', 'C\'est la quantité de farine en tasses. Compte combien de fractions unitaires tiennent dedans.'), 1], [a * d, t('That leaves out dividing by the denominator of the amount.', 'Cela oublie de diviser par le dénominateur de la quantité.'), 1]]),
    steps: [bi((f) => f.t(`Divide: ${f.m(`${frac(f.n(a), f.n(b))} \\div ${frac(1, f.n(d))}`)}, which is ${f.m(`${frac(f.n(a), f.n(b))} \\times ${f.n(d)}`)}.`, `Divise : ${f.m(`${frac(f.n(a), f.n(b))} \\div ${frac(1, f.n(d))}`)}, c'est-à-dire ${f.m(`${frac(f.n(a), f.n(b))} \\times ${f.n(d)}`)}.`)), bi((f) => `${f.N(a)} × ${f.N(d)} ÷ ${f.N(b)} = ${f.N(ans)}.`)],
    nudge: t('How many one-' + unit[0] + ' scoops fit in the amount? Divide by the unit fraction.', 'Combien de mesures d\'un ' + unit[1] + ' tiennent dans la quantité ? Divise par la fraction unitaire.'),
  };
});
const marks = numGen('MS.G9.B3.2.a', (_tier, r) => {
  const w = randInt(r, 1, 4), q = randInt(r, 1, 3);
  const ans = (w * 4 + q) * 4; // quarters to sixteenths
  return {
    prompt: bi((f) => f.t(`A ruler has a mark every ${f.m(frac(1, 16))} inch. How many ${f.m(frac(1, 16))}-inch marks are there in ${f.m(`${f.n(w)}${frac(f.n(q), 4)}`)} inches?`, `Une règle a une marque tous les ${f.m(frac(1, 16))} de pouce. Combien de marques de ${f.m(frac(1, 16))} de pouce y a-t-il dans ${f.m(`${f.n(w)}${frac(f.n(q), 4)}`)} pouces ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[w * 16 + q, t('The fraction part needs to be changed to sixteenths too: each quarter is 4 sixteenths.', 'La partie fractionnaire doit aussi être transformée en seizièmes : chaque quart vaut 4 seizièmes.'), 0], [w * 4 + q, t('That counts quarters. There are 4 sixteenths in each quarter.', 'Cela compte des quarts. Il y a 4 seizièmes dans chaque quart.'), 1]]),
    steps: [bi((f) => f.t(`Each inch has ${f.N(16)} marks, and each quarter has ${f.N(4)}: ${f.N(w)} × ${f.N(16)} + ${f.N(q)} × ${f.N(4)}.`, `Chaque pouce a ${f.N(16)} marques, et chaque quart en a ${f.N(4)} : ${f.N(w)} × ${f.N(16)} + ${f.N(q)} × ${f.N(4)}.`)), bi((f) => `${f.N(w * 16)} + ${f.N(q * 4)} = ${f.N(ans)}.`)],
    nudge: t('Change the whole inches and the quarters into sixteenths, then add.', 'Transforme les pouces entiers et les quarts en seizièmes, puis additionne.'),
  };
});
const pieces = numGen('MS.G9.B3.2.a', (_tier, r) => {
  const d = pick(r, [2, 4, 8]), n = randInt(r, 3, 9);
  const whole = randInt(r, 2, 6), extra = randInt(r, 0, d - 1);
  const total = whole * d + extra; // in 1/d units
  const ans = Math.floor(total / n);
  return {
    prompt: bi((f) => f.t(`A board is ${f.m(`${f.n(whole)}${extra ? frac(f.n(extra), f.n(d)) : ''}`)} m long. Pieces of ${f.m(frac(f.n(n), f.n(d)))} m are cut from it. How many whole pieces can be cut?`, `Une planche mesure ${f.m(`${f.n(whole)}${extra ? frac(f.n(extra), f.n(d)) : ''}`)} m de long. On y coupe des morceaux de ${f.m(frac(f.n(n), f.n(d)))} m. Combien de morceaux entiers peut-on couper ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[total, t('That counts pieces of one unit fraction. Each piece is bigger than that: divide by the numerator too.', 'Cela compte des morceaux d\'une fraction unitaire. Chaque morceau est plus grand : divise aussi par le numérateur.'), 1], [Math.ceil(total / n), t('Only whole pieces count, so round down, not up.', 'Seuls les morceaux entiers comptent : arrondis vers le bas, pas vers le haut.'), 1]]),
    steps: [bi((f) => f.t(`The board is ${f.N(total)} pieces of ${f.m(frac(1, f.n(d)))} m long. Each cut piece is ${f.N(n)} of those.`, `La planche fait ${f.N(total)} morceaux de ${f.m(frac(1, f.n(d)))} m de long. Chaque morceau coupé en fait ${f.N(n)}.`)), bi((f) => f.t(`${f.N(total)} ÷ ${f.N(n)} is ${f.N(r6(total / n))}, so ${f.N(ans)} whole pieces.`, `${f.N(total)} ÷ ${f.N(n)} donne ${f.N(r6(total / n))} : ${f.N(ans)} morceaux entiers.`))],
    nudge: t('Count the board and each piece in the same unit fraction, then divide and round down.', 'Compte la planche et chaque morceau avec la même fraction unitaire, puis divise et arrondis vers le bas.'),
  };
});
export const unitFractions9 = tierGen(scoops, marks, pieces);

/** MS.G9.B3.3.a: how signs affect ratios, rates, fractions and decimals */
const signedRate = numGen('MS.G9.B3.3.a', (_tier, r) => {
  const k = randInt(r, 2, 9), n = randInt(r, 2, 9), total = -k * n;
  const ans = -k;
  return {
    prompt: bi((f) => f.t(`A glacier's edge changes by ${f.N(total)} m in ${f.N(n)} years (negative means it shrinks). What is the rate of change, in metres per year?`, `Le bord d'un glacier change de ${f.N(total)} m en ${f.N(n)} ans (négatif signifie qu'il recule). Quel est le taux de variation, en mètres par année ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[k, t('The rate keeps the sign: a negative change over positive time is a negative rate.', 'Le taux garde le signe : un changement négatif sur un temps positif donne un taux négatif.'), 1], [total + n, t('A rate comes from dividing the change by the time, not from adding them.', 'Un taux vient de la division du changement par le temps, pas de leur addition.'), 0]]),
    steps: [t('Rate of change = change ÷ time. A negative number divided by a positive number is negative.', 'Taux de variation = changement ÷ temps. Un nombre négatif divisé par un nombre positif est négatif.'), bi((f) => `${f.N(total)} ÷ ${f.N(n)} = ${f.N(ans)}.`)],
    nudge: t('Divide the change by the time and keep the sign.', 'Divise le changement par le temps et garde le signe.'),
  };
});
const signedDecimals = numGen('MS.G9.B3.3.a', (_tier, r) => {
  const q = randInt(r, 2, 9), d = pick(r, [0.2, 0.4, 0.5, 0.6, 0.8, 1.5]);
  const num = r6(q * d * (r() < 0.5 ? -1 : 1) * (r() < 0.5 ? 1 : -1));
  const ans = r6(num / (-d));
  return {
    prompt: bi((f) => f.t(`Calculate ${f.m(`${f.n(num)} \\div (${f.n(-d)})`)}.`, `Calcule ${f.m(`${f.n(num)} \\div (${f.n(-d)})`)}.`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[-ans, t('Check the sign: a negative divided by a negative is positive, and a positive divided by a negative is negative.', 'Vérifie le signe : un négatif divisé par un négatif est positif, et un positif divisé par un négatif est négatif.'), 0], [r6(num * -d), t('That multiplies instead of dividing.', 'Cela multiplie au lieu de diviser.'), 0]]),
    steps: [t('Divide the sizes first, then decide the sign: same signs give positive, different signs give negative.', 'Divise d\'abord les grandeurs, puis décide du signe : signes pareils donnent un positif, signes différents un négatif.'), bi((f) => `${f.N(Math.abs(num))} ÷ ${f.N(d)} = ${f.N(r6(Math.abs(num) / d))}, ${f.N(ans)}.`)],
    nudge: t('Divide the sizes, then use the sign rule.', 'Divise les grandeurs, puis utilise la règle des signes.'),
  };
});
const falling = numGen('MS.G9.B3.3.a', (_tier, r) => {
  const rate = -r6(randInt(r, 11, 39) / 10 * 2) / 2, days = randInt(r, 3, 9);
  const per = r6(Math.abs(rate));
  const ans = r6(-per * days);
  return {
    prompt: bi((f) => f.t(`A stock's price changes by ${f.N(-per)} dollars each day. What is the total change in price after ${f.N(days)} days, in dollars?`, `Le prix d'une action change de ${f.N(-per)} dollars chaque jour. Quel est le changement total du prix après ${f.N(days)} jours, en dollars ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(per * days), t('The price is falling, so the total change is negative.', 'Le prix baisse : le changement total est négatif.'), 1], [r6(-per + days), t('The daily change repeats every day: multiply it by the number of days.', 'Le changement quotidien se répète chaque jour : multiplie-le par le nombre de jours.'), 1]]),
    steps: [bi((f) => f.t(`Total change = rate × days = ${f.N(-per)} × ${f.N(days)}.`, `Changement total = taux × jours = ${f.N(-per)} × ${f.N(days)}.`)), bi((f) => `${f.N(-per)} × ${f.N(days)} = ${f.N(ans)}.`)],
    nudge: t('Multiply the daily change by the number of days, keeping the sign.', 'Multiplie le changement quotidien par le nombre de jours, en gardant le signe.'),
  };
});
export const signs9 = tierGen(signedRate, signedDecimals, falling);

/** MS.G9.B3.4.a: operations with positive and negative fractions and mixed numbers */
const reduce = (n: number, d: number): { n: number; d: number } => { const g = gcd(Math.abs(n), d); return { n: n / g, d: d / g }; };
export const signedFractions9: Generator = (tier, seed) => {
  const r = makeRng(seed);
  for (let tries = 0; tries < 500; tries++) {
    const d1 = randInt(r, 2, 9), d2 = tier === 1 ? d1 : randInt(r, 2, 9);
    const w1 = tier === 3 ? randInt(r, 1, 3) : 0, w2 = tier === 3 ? randInt(r, 1, 3) : 0;
    const n1 = randInt(r, 1, d1 - 1), n2 = randInt(r, 1, d2 - 1);
    const neg1 = r() < 0.5, op = r() < 0.5 ? '+' : '-';
    const L = (d1 * d2) / gcd(d1, d2);
    const A = (w1 * d1 + n1) * (L / d1) * (neg1 ? -1 : 1);
    const B = (w2 * d2 + n2) * (L / d2);
    const num = op === '+' ? A + B : A - B;
    if (num === 0) continue;
    const res = reduce(num, L);
    if (res.d === 1) continue;
    const term = (f: F, w: number, n: number, d: number): string => `${w ? f.n(w) : ''}${frac(f.n(n), f.n(d))}`;
    const wrongNaive = reduce(neg1 ? (op === '+' ? n2 - n1 : -n1 - n2) : op === '+' ? n1 + n2 : n1 - n2, d1 === d2 ? d1 : d1 + d2);
    const naive = tier === 1 ? { n: op === '+' ? (neg1 ? -n1 + n2 : n1 + n2) : neg1 ? -n1 - n2 : n1 - n2, d: d1 } : wrongNaive;
    const nr = naive.d > 0 ? reduce(naive.n, naive.d) : naive;
    return build({
      skill: 'MS.G9.B3.4.a', tier, seed, category: 'KU', format: 'fraction',
      prompt: bi((f) => f.t(`Calculate ${f.m(`${neg1 ? '-' : ''}${term(f, w1, n1, d1)} ${op} ${term(f, w2, n2, d2)}`)}. Write the answer as a fraction in simplest form (it can be negative or greater than 1 in size).`, `Calcule ${f.m(`${neg1 ? '-' : ''}${term(f, w1, n1, d1)} ${op} ${term(f, w2, n2, d2)}`)}. Écris la réponse sous forme de fraction irréductible (elle peut être négative ou de grandeur supérieure à 1).`)),
      answer: { kind: 'fraction', n: res.n, d: res.d, mustReduce: true },
      steps: [bi((f) => f.t(`Use the common denominator ${f.N(L)}${tier === 3 ? ' (change mixed numbers to improper fractions first)' : ''}: ${f.m(`${frac(f.n(A), f.n(L))} ${op} ${frac(f.n(B), f.n(L))}`)}.`, `Utilise le dénominateur commun ${f.N(L)}${tier === 3 ? ' (transforme d\'abord les nombres fractionnaires en fractions impropres)' : ''} : ${f.m(`${frac(f.n(A), f.n(L))} ${op} ${frac(f.n(B), f.n(L))}`)}.`)), bi((f) => f.t(`${f.m(frac(f.n(num), f.n(L)))} simplifies to ${f.m(frac(f.n(res.n), f.n(res.d)))}.`, `${f.m(frac(f.n(num), f.n(L)))} se simplifie en ${f.m(frac(f.n(res.n), f.n(res.d)))}.`))],
      nudge: t('Write both with the same denominator, add or subtract the numerators with their signs, then simplify.', 'Écris les deux avec le même dénominateur, additionne ou soustrais les numérateurs avec leurs signes, puis simplifie.'),
      stepHint: t('Find a common denominator and keep track of the signs.', 'Trouve un dénominateur commun et fais attention aux signes.'),
      wrong: tier === 1 && nr.d > 0 && !(nr.n === res.n && nr.d === res.d) && nr.n !== 0 ? [{ answer: { kind: 'fraction', n: nr.n, d: nr.d }, stepIndex: 0, why: t('It looks like the signs were mixed up. A negative term subtracts: combine the numerators using their signs.', 'Il semble que les signes ont été mélangés. Un terme négatif soustrait : combine les numérateurs en tenant compte de leurs signes.') }] : [],
    });
  }
  throw new Error('signedFractions9: no item found');
};

/** MS.G9.B3.5.a: rates, percentages and proportions */
const unitRate = numGen('MS.G9.B3.5.a', (_tier, r) => {
  const rate = randInt(r, 3, 15), litres = randInt(r, 3, 9);
  const area = rate * litres;
  return {
    prompt: bi((f) => f.t(`${f.N(litres)} litres of paint cover ${f.N(area)} square metres. How many square metres does 1 litre cover?`, `${f.N(litres)} litres de peinture couvrent ${f.N(area)} mètres carrés. Combien de mètres carrés 1 litre couvre-t-il ?`)),
    answer: rate, category: 'AP',
    wrong: wr(rate, [[r6(litres / area), t('The division is upside down. Divide the area by the litres to get the area per litre.', 'La division est à l\'envers. Divise l\'aire par les litres pour obtenir l\'aire par litre.'), 0], [area - litres, t('A rate comes from dividing, not subtracting.', 'Un taux vient d\'une division, pas d\'une soustraction.'), 0]]),
    steps: [t('The unit rate is the amount for one unit: divide the area by the litres.', 'Le taux unitaire est la quantité pour une unité : divise l\'aire par les litres.'), bi((f) => `${f.N(area)} ÷ ${f.N(litres)} = ${f.N(rate)}.`)],
    nudge: t('Divide the area by the number of litres.', 'Divise l\'aire par le nombre de litres.'),
  };
});
const percentChange = numGen('MS.G9.B3.5.a', (_tier, r) => {
  const old = randInt(r, 4, 20) * 20, pct = pick(r, [5, 10, 15, 20, 25, 30, 40]);
  const up = r() < 0.5;
  const nw = r6(old * (1 + (up ? pct : -pct) / 100));
  return {
    prompt: bi((f) => f.t(`A price ${up ? 'rises' : 'falls'} from ${f.N(old)} dollars to ${f.N(nw)} dollars. What is the percent ${up ? 'increase' : 'decrease'}? Type the number only.`, `Un prix ${up ? 'monte' : 'baisse'} de ${f.N(old)} dollars à ${f.N(nw)} dollars. Quel est le pourcentage de ${up ? 'hausse' : 'baisse'} ? Écris seulement le nombre.`)),
    answer: pct, category: 'AP',
    wrong: wr(pct, [[r6((Math.abs(nw - old) / nw) * 100), t('The percent change is based on the original price, not the new price.', 'Le pourcentage de variation se calcule sur le prix de départ, pas sur le nouveau prix.'), 1], [Math.abs(nw - old), t('That is the change in dollars, not in percent.', 'C\'est le changement en dollars, pas en pourcentage.'), 0]]),
    steps: [bi((f) => f.t(`Change: ${f.N(Math.abs(nw - old))} dollars.`, `Changement : ${f.N(Math.abs(nw - old))} dollars.`)), bi((f) => f.t(`${f.N(Math.abs(nw - old))} ÷ ${f.N(old)} × ${f.N(100)} = ${f.N(pct)}%.`, `${f.N(Math.abs(nw - old))} ÷ ${f.N(old)} × ${f.N(100)} = ${f.N(pct)} %.`))],
    nudge: t('Divide the change by the original price and multiply by 100.', 'Divise le changement par le prix de départ et multiplie par 100.'),
  };
});
const proportion = numGen('MS.G9.B3.5.a', (_tier, r) => {
  const a = randInt(r, 2, 6), b = randInt(r, 3, 8), k = pick(r, [2.5, 3, 4, 5, 1.5, 2]);
  const c = r6(a * k), ans = r6(b * k);
  return {
    prompt: bi((f) => f.t(`A recipe uses ${f.N(a)} cups of flour for ${f.N(b)} servings. You have ${f.N(c)} cups of flour. How many servings can you make with the same recipe?`, `Une recette utilise ${f.N(a)} tasses de farine pour ${f.N(b)} portions. Tu as ${f.N(c)} tasses de farine. Combien de portions peux-tu faire avec la même recette ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[r6(b + c - a), t('Proportions are about multiplying by the same factor, not adding the same amount.', 'Les proportions consistent à multiplier par le même facteur, pas à ajouter le même montant.'), 1], [r6(c / a), t('That is the scale factor. Multiply it by the original number of servings.', 'C\'est le facteur d\'échelle. Multiplie-le par le nombre de portions de départ.'), 1]]),
    steps: [bi((f) => f.t(`Scale factor: ${f.N(c)} ÷ ${f.N(a)} = ${f.N(k)}.`, `Facteur d'échelle : ${f.N(c)} ÷ ${f.N(a)} = ${f.N(k)}.`)), bi((f) => `${f.N(b)} × ${f.N(k)} = ${f.N(ans)}.`)],
    nudge: t('Find how many times as much flour you have, then scale the servings by the same factor.', 'Trouve combien de fois plus de farine tu as, puis multiplie les portions par le même facteur.'),
  };
});
export const ratesPercents9 = tierGen(unitRate, percentChange, proportion);
