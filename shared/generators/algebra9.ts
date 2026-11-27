// Grade 9 (MTH1W) Algebra strand (C): creating, comparing and simplifying expressions, equations, linear and non-linear relations,
// lines, and transformations of y = ax. Graphs are described with tables, points and equations in words and numbers.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
/** a·v + b as TeX, for a letter v: "3n + 4", "n - 5", "-2x + 1". */
const lin = (f: F, a: number, b: number, v = 'n'): string => `${a === 1 ? '' : a === -1 ? '-' : f.n(a)}${v}${b === 0 ? '' : b > 0 ? ` + ${f.n(b)}` : ` - ${f.n(-b)}`}`;
const bx = (s: (f: F) => string): Text => bi((f) => f.m(s(f)));
const pts = (f: F, ps: [number, number][]): string => ps.map(([x, y]) => `(${f.n(x)},\\ ${f.n(y)})`).join(',\\ ');

/** MS.G9.C1.2.a: create expressions that generalize relationships */
const taxi = choiceGen('MS.G9.C1.2.a', (_tier, r) => {
  const a = randInt(r, 2, 6), b = a + randInt(r, 1, 4);
  const m = mc(r, bx((f) => lin(f, a, b)), [
    [bx((f) => lin(f, b, a)), t('The two amounts are swapped. The amount per kilometre multiplies n and the starting charge is added once.', 'Les deux montants sont échangés. Le montant par kilomètre multiplie n et les frais de départ s\'ajoutent une fois.')],
    [bx((f) => `${f.n(a + b)}n`), t('The starting charge is paid once, not for every kilometre.', 'Les frais de départ se paient une fois, pas pour chaque kilomètre.')],
    [bx((f) => lin(f, a, -b)), t('The starting charge is added to the cost, not taken away.', 'Les frais de départ s\'ajoutent au coût, ils ne se retirent pas.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A taxi charges ${f.D(b)} to start plus ${f.D(a)} for each kilometre. Which expression gives the cost, in dollars, of a trip of n kilometres?`, `Un taxi charge ${f.D(b)} au départ plus ${f.D(a)} par kilomètre. Quelle expression donne le coût, en dollars, d'un trajet de n kilomètres ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [t('The cost per kilometre multiplies n. The starting charge is a fixed amount added on.', 'Le coût par kilomètre multiplie n. Les frais de départ sont un montant fixe qui s\'ajoute.'), bi((f) => f.t(`Cost = ${f.m(lin(f, a, b))}.`, `Coût = ${f.m(lin(f, a, b))}.`))],
    nudge: t('Which amount repeats for every kilometre and which is charged only once?', 'Quel montant se répète à chaque kilomètre et lequel n\'est facturé qu\'une fois ?'),
  };
});
const perimeterExpr = choiceGen('MS.G9.C1.2.a', (_tier, r) => {
  const k = randInt(r, 1, 6);
  const m = mc(r, bx((f) => lin(f, 6, 2 * k, 'w')), [
    [bx((f) => lin(f, 3, k, 'w')), t('That is only half the perimeter. The perimeter goes all the way around: two widths and two lengths.', 'C\'est seulement la moitié du périmètre. Le périmètre fait tout le tour : deux largeurs et deux longueurs.')],
    [bx((f) => lin(f, 4, 2 * k, 'w')), t('Check the length: it is twice the width plus the extra, so each length contributes 2w + the extra.', 'Vérifie la longueur : c\'est le double de la largeur plus le supplément : chaque longueur apporte 2w + le supplément.')],
    [bx((f) => lin(f, 6, k, 'w')), t('The extra is in both lengths, so it is added twice.', 'Le supplément est dans les deux longueurs : il s\'ajoute deux fois.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A rectangle has width w. Its length is ${f.N(k)} more than twice its width. Which expression gives the perimeter?`, `Un rectangle a une largeur w. Sa longueur est ${f.N(k)} de plus que le double de sa largeur. Quelle expression donne le périmètre ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [bi((f) => f.t(`Length = ${f.m(lin(f, 2, k, 'w'))}. Perimeter = 2 × (width + length) = ${f.m(`2(w + ${lin(f, 2, k, 'w')})`)}.`, `Longueur = ${f.m(lin(f, 2, k, 'w'))}. Périmètre = 2 × (largeur + longueur) = ${f.m(`2(w + ${lin(f, 2, k, 'w')})`)}.`)), bi((f) => f.t(`Simplified: ${f.m(lin(f, 6, 2 * k, 'w'))}.`, `Simplifié : ${f.m(lin(f, 6, 2 * k, 'w'))}.`))],
    nudge: t('Write the length in terms of w, then add all four sides.', 'Écris la longueur en fonction de w, puis additionne les quatre côtés.'),
  };
});
const fromTable = choiceGen('MS.G9.C1.2.a', (_tier, r) => {
  const a = randInt(r, 2, 6), b = a + randInt(r, 1, 5);
  const vals = [1, 2, 3].map((n) => a * n + b);
  const m = mc(r, bx((f) => lin(f, a, b)), [
    [bx((f) => lin(f, b, a)), t('Test it with n = 1: it does not give the first value of the table.', 'Teste avec n = 1 : cela ne donne pas la première valeur du tableau.')],
    [bx((f) => lin(f, a, b + a)), t('Test it with n = 1: it gives a value that is too big.', 'Teste avec n = 1 : cela donne une valeur trop grande.')],
    [bx((f) => lin(f, 1, a + b - 1)), t('Test it with n = 2: the values grow by a different amount.', 'Teste avec n = 2 : les valeurs augmentent d\'un montant différent.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A pattern has the values ${f.m(vals.map((v) => f.n(v)).join(',\\ '))} for figures n = 1, 2, 3. Which expression gives the value of figure n?`, `Une suite a les valeurs ${f.m(vals.map((v) => f.n(v)).join(',\\ '))} pour les figures n = 1, 2, 3. Quelle expression donne la valeur de la figure n ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [bi((f) => f.t(`The values grow by ${f.N(a)} each time, so the expression starts with ${f.m(`${f.n(a)}n`)}.`, `Les valeurs augmentent de ${f.N(a)} chaque fois : l'expression commence par ${f.m(`${f.n(a)}n`)}.`)), bi((f) => f.t(`Check n = 1: ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}, which matches. So the expression is ${f.m(lin(f, a, b))}.`, `Vérifie n = 1 : ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}, ce qui correspond. L'expression est ${f.m(lin(f, a, b))}.`))],
    nudge: t('Find how much the values grow each time, then test the expression with n = 1.', 'Trouve de combien les valeurs augmentent chaque fois, puis teste l\'expression avec n = 1.'),
  };
});
export const createExpr9 = tierGen(taxi, perimeterExpr, fromTable);

/** MS.G9.C1.3.a: identify equivalent expressions */
const distribute = choiceGen('MS.G9.C1.3.a', (_tier, r) => {
  const k = randInt(r, 2, 7), c = randInt(r, 1, 9);
  const m = mc(r, bx((f) => lin(f, k, k * c, 'x')), [
    [bx((f) => lin(f, k, c, 'x')), t('The multiplier must be applied to both terms inside the brackets, not only the first.', 'Le multiplicateur doit s\'appliquer aux deux termes de la parenthèse, pas seulement au premier.')],
    [bx((f) => lin(f, 1, k * c, 'x')), t('The multiplier must also multiply x.', 'Le multiplicateur doit aussi multiplier x.')],
    [bx((f) => lin(f, k, k + c, 'x')), t('The multiplier multiplies the number inside, it is not added to it.', 'Le multiplicateur multiplie le nombre dans la parenthèse, il ne s\'y additionne pas.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Which expression is equivalent to ${f.m(`${f.n(k)}(x + ${f.n(c)})`)}?`, `Quelle expression est équivalente à ${f.m(`${f.n(k)}(x + ${f.n(c)})`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Use the distributive property: multiply every term inside the brackets.', 'Utilise la distributivité : multiplie chaque terme dans la parenthèse.'), bi((f) => `${f.m(`${f.n(k)} \\times x = ${f.n(k)}x`)}, ${f.m(`${f.n(k)} \\times ${f.n(c)} = ${f.n(k * c)}`)}.`)],
    nudge: t('Multiply both terms inside the brackets by the number outside.', 'Multiplie les deux termes dans la parenthèse par le nombre à l\'extérieur.'),
  };
});
const combine = choiceGen('MS.G9.C1.3.a', (_tier, r) => {
  const a = randInt(r, 2, 5), b = randInt(r, 1, 6), c0 = randInt(r, 1, 5), c = a === 2 && c0 === 2 ? 3 : c0;
  const m = mc(r, bx((f) => lin(f, a + c, a * b, 'x')), [
    [bx((f) => lin(f, a + c, b, 'x')), t('The number outside the brackets multiplies b too.', 'Le nombre à l\'extérieur multiplie aussi b.')],
    [bx((f) => lin(f, a * c, a * b, 'x')), t('The x terms are added, not multiplied.', 'Les termes en x s\'additionnent, ils ne se multiplient pas.')],
    [bx((f) => lin(f, a, a * b + c, 'x')), t('The c x term is an x term: add its number to the x terms.', 'Le terme c x est un terme en x : ajoute son nombre aux termes en x.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Which expression is equivalent to ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}x`)}?`, `Quelle expression est équivalente à ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}x`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [bi((f) => f.t(`Expand: ${f.m(`${f.n(a)}x + ${f.n(a * b)} + ${f.n(c)}x`)}.`, `Développe : ${f.m(`${f.n(a)}x + ${f.n(a * b)} + ${f.n(c)}x`)}.`)), bi((f) => f.t(`Combine the x terms: ${f.m(lin(f, a + c, a * b, 'x'))}.`, `Regroupe les termes en x : ${f.m(lin(f, a + c, a * b, 'x'))}.`))],
    nudge: t('Expand the brackets first, then combine like terms.', 'Développe d\'abord la parenthèse, puis regroupe les termes semblables.'),
  };
});
const notEquivalent = choiceGen('MS.G9.C1.3.a', (_tier, r) => {
  const a = randInt(r, 2, 5), b = randInt(r, 1, 5), c = randInt(r, 2, 5), d = randInt(r, 1, 4);
  const base = (f: F): string => `${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}(x - ${f.n(d)})`;
  const K = a * b - c * d;
  const eq1 = (f: F): string => lin(f, a + c, K, 'x');
  const eq2 = (f: F): string => `${f.n(a)}x + ${f.n(a * b)} + ${f.n(c)}x - ${f.n(c * d)}`;
  const eq3 = (f: F): string => `${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}x - ${f.n(c * d)}`;
  const bad = (f: F): string => lin(f, a + c, a * b + c * d, 'x');
  const m = mc(r, bx(bad), [[bx(eq1), t('This one is equivalent to the expression.', 'Celle-ci est équivalente à l\'expression.')], [bx(eq2), t('This one is equivalent to the expression.', 'Celle-ci est équivalente à l\'expression.')], [bx(eq3), t('This one is equivalent to the expression.', 'Celle-ci est équivalente à l\'expression.')]]);
  return {
    prompt: bi((f) => f.t(`Three of these expressions are equivalent to ${f.m(base(f))}. Which one is NOT?`, `Trois de ces expressions sont équivalentes à ${f.m(base(f))}. Laquelle ne l'est PAS ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [bi((f) => f.t(`Simplify the original: ${f.m(lin(f, a + c, K, 'x'))}.`, `Simplifie l'expression de départ : ${f.m(lin(f, a + c, K, 'x'))}.`)), t('Compare each choice with that. The one that does not match is the answer. Substituting a value for x in each is a good check.', 'Compare chaque choix avec celle-ci. Celui qui ne correspond pas est la réponse. Remplacer x par une valeur dans chacune est une bonne vérification.')],
    nudge: t('Simplify the original expression, then check each choice, or test each with x = 1.', 'Simplifie l\'expression de départ, puis vérifie chaque choix, ou teste chacun avec x = 1.'),
  };
});
export const equivalent9 = tierGen(distribute, combine, notEquivalent);

/** MS.G9.C1.4.a: simplify expressions */
const coeff = numGen('MS.G9.C1.4.a', (_tier, r) => {
  const a = randInt(r, 3, 9), b = randInt(r, 2, 8), c = randInt(r, 1, 6);
  const ans = a + b - c;
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}x + ${f.n(b)}x - ${f.n(c)}x`)}. What is the coefficient of x in the answer?`, `Simplifie ${f.m(`${f.n(a)}x + ${f.n(b)}x - ${f.n(c)}x`)}. Quel est le coefficient de x dans la réponse ?`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[a + b + c, t('The last term is subtracted, so subtract its coefficient.', 'Le dernier terme est soustrait : soustrais son coefficient.'), 0], [a * b - c, t('Like terms are added or subtracted, not multiplied.', 'Les termes semblables s\'additionnent ou se soustraient, ils ne se multiplient pas.'), 0]]),
    steps: [t('All three terms have x, so combine their coefficients.', 'Les trois termes ont x : combine leurs coefficients.'), bi((f) => `${f.N(a)} + ${f.N(b)} − ${f.N(c)} = ${f.N(ans)}.`)],
    nudge: t('Add and subtract the numbers in front of x.', 'Additionne et soustrais les nombres devant x.'),
  };
});
const constant = numGen('MS.G9.C1.4.a', (_tier, r) => {
  const a = randInt(r, 2, 6), b = randInt(r, 2, 8), c = randInt(r, 1, 6), d = randInt(r, 1, 9);
  const ans = a * b - d;
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}x - ${f.n(d)}`)}. What is the constant term (the number without x)?`, `Simplifie ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}x - ${f.n(d)}`)}. Quel est le terme constant (le nombre sans x) ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[b - d, t('The number outside the brackets multiplies b too.', 'Le nombre à l\'extérieur de la parenthèse multiplie aussi b.'), 0], [a * b + d, t('The last term is subtracted.', 'Le dernier terme est soustrait.'), 1]]),
    steps: [bi((f) => f.t(`Expand: ${f.m(`${f.n(a)}x + ${f.n(a * b)} + ${f.n(c)}x - ${f.n(d)}`)}.`, `Développe : ${f.m(`${f.n(a)}x + ${f.n(a * b)} + ${f.n(c)}x - ${f.n(d)}`)}.`)), bi((f) => `${f.N(a * b)} − ${f.N(d)} = ${f.N(ans)}.`)],
    nudge: t('Expand the brackets, then combine the plain numbers.', 'Développe la parenthèse, puis regroupe les nombres seuls.'),
  };
});
const evalSimplified = numGen('MS.G9.C1.4.a', (_tier, r) => {
  const a = randInt(r, 2, 5), b = randInt(r, 1, 6), c = randInt(r, 2, 5), d = randInt(r, 1, 4), k = randInt(r, 2, 6);
  const ans = (a + c) * k + a * b - c * d;
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}(x - ${f.n(d)})`)}, then find its value when ${f.m(`x = ${f.n(k)}`)}.`, `Simplifie ${f.m(`${f.n(a)}(x + ${f.n(b)}) + ${f.n(c)}(x - ${f.n(d)})`)}, puis trouve sa valeur quand ${f.m(`x = ${f.n(k)}`)}.`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[(a + c) * k + a * b + c * d, t('The number outside the second bracket multiplies the minus sign too: subtract c × d.', 'Le nombre à l\'extérieur de la deuxième parenthèse multiplie aussi le signe moins : soustrais c × d.'), 0], [(a + c) * k + b - d, t('The numbers outside the brackets also multiply the plain numbers inside.', 'Les nombres à l\'extérieur des parenthèses multiplient aussi les nombres seuls à l\'intérieur.'), 0]]),
    steps: [bi((f) => f.t(`Simplified: ${f.m(lin(f, a + c, a * b - c * d, 'x'))}.`, `Simplifié : ${f.m(lin(f, a + c, a * b - c * d, 'x'))}.`)), bi((f) => `${f.N(a + c)} × ${f.N(k)} + (${f.N(a * b - c * d)}) = ${f.N(ans)}.`)],
    nudge: t('Expand and combine like terms first, then replace x with the value.', 'Développe et regroupe d\'abord les termes semblables, puis remplace x par la valeur.'),
  };
});
export const simplify9 = tierGen(coeff, constant, evalSimplified);

/** MS.G9.C1.5.a: create and solve equations and verify the solutions */
const numberPuzzle = numGen('MS.G9.C1.5.a', (_tier, r) => {
  const m = randInt(r, 2, 9), x = randInt(r, 2, 15), b = randInt(r, 1, 12);
  return {
    prompt: bi((f) => f.t(`${f.N(m)} times a number, plus ${f.N(b)}, equals ${f.N(m * x + b)}. What is the number?`, `${f.N(m)} fois un nombre, plus ${f.N(b)}, égale ${f.N(m * x + b)}. Quel est le nombre ?`)),
    answer: x, category: 'AP',
    wrong: wr(x, [[m * x + b - b, t('That undoes the adding but not the multiplying. Divide by the number that multiplies.', 'Cela défait l\'addition mais pas la multiplication. Divise par le nombre qui multiplie.'), 1], [(m * x + b) / m, t('Undo the adding first: subtract before you divide.', 'Défais d\'abord l\'addition : soustrais avant de diviser.'), 0]]),
    steps: [bi((f) => f.t(`Write the equation: ${f.m(`${f.n(m)}x + ${f.n(b)} = ${f.n(m * x + b)}`)}.`, `Écris l'équation : ${f.m(`${f.n(m)}x + ${f.n(b)} = ${f.n(m * x + b)}`)}.`)), bi((f) => f.t(`Subtract ${f.N(b)}, then divide by ${f.N(m)}: x = ${f.N(x)}.`, `Soustrais ${f.N(b)}, puis divise par ${f.N(m)} : x = ${f.N(x)}.`))],
    nudge: t('Write an equation, then undo the adding and the multiplying in reverse order.', 'Écris une équation, puis défais l\'addition et la multiplication dans l\'ordre inverse.'),
  };
});
const plumber = numGen('MS.G9.C1.5.a', (_tier, r) => {
  const call = randInt(r, 3, 12) * 5, rate = randInt(r, 2, 9) * 5, h = randInt(r, 2, 9);
  const total = call + rate * h;
  return {
    prompt: bi((f) => f.t(`A plumber charges ${f.D(call)} for the call plus ${f.D(rate)} per hour. The bill is ${f.D(total)}. For how many hours did the plumber work?`, `Un plombier charge ${f.D(call)} pour le déplacement plus ${f.D(rate)} l'heure. La facture est de ${f.D(total)}. Combien d'heures le plombier a-t-il travaillé ?`)),
    answer: h, category: 'AP',
    wrong: wr(h, [[total / rate, t('The call charge is paid once. Take it away first, then divide by the hourly rate.', 'Les frais de déplacement se paient une fois. Retire-les d\'abord, puis divise par le taux horaire.'), 0], [total - call, t('That is the cost of the hours, not the number of hours. Divide it by the hourly rate.', 'C\'est le coût des heures, pas le nombre d\'heures. Divise-le par le taux horaire.'), 1]]),
    steps: [bi((f) => f.t(`Equation: ${f.m(`${f.n(rate)}h + ${f.n(call)} = ${f.n(total)}`)}.`, `Équation : ${f.m(`${f.n(rate)}h + ${f.n(call)} = ${f.n(total)}`)}.`)), bi((f) => f.t(`${f.N(total)} − ${f.N(call)} = ${f.N(total - call)}, and ${f.N(total - call)} ÷ ${f.N(rate)} = ${f.N(h)}.`, `${f.N(total)} − ${f.N(call)} = ${f.N(total - call)}, et ${f.N(total - call)} ÷ ${f.N(rate)} = ${f.N(h)}.`))],
    nudge: t('Subtract the call charge, then divide by the hourly rate.', 'Soustrais les frais de déplacement, puis divise par le taux horaire.'),
  };
});
const bothSides = numGen('MS.G9.C1.5.a', (_tier, r) => {
  const a = randInt(r, 4, 9), c = randInt(r, 1, a - 1), x = randInt(r, 2, 12), b = randInt(r, 1, 15);
  const d = a * x + b - c * x;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(d)}`)}. What is x?`, `Résous ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(d)}`)}. Quelle est la valeur de x ?`)),
    answer: x, category: 'TH',
    wrong: wr(x, [[(d - b) / (a + c), t('Subtract the smaller x term from both sides (do not add them).', 'Soustrais le plus petit terme en x des deux côtés (ne les additionne pas).'), 0], [(d + b) / (a - c), t('Move the plain number the other way: subtract b from both sides.', 'Déplace le nombre seul dans l\'autre sens : soustrais b des deux côtés.'), 0]]),
    steps: [bi((f) => f.t(`Subtract ${f.m(`${f.n(c)}x`)} from both sides: ${f.m(`${f.n(a - c)}x + ${f.n(b)} = ${f.n(d)}`)}.`, `Soustrais ${f.m(`${f.n(c)}x`)} des deux côtés : ${f.m(`${f.n(a - c)}x + ${f.n(b)} = ${f.n(d)}`)}.`)), bi((f) => f.t(`Subtract ${f.N(b)}: ${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, so x = ${f.N(x)}. Check: both sides equal ${f.N(a * x + b)}.`, `Soustrais ${f.N(b)} : ${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, donc x = ${f.N(x)}. Vérifie : les deux côtés valent ${f.N(a * x + b)}.`))],
    nudge: t('Collect the x terms on one side and the numbers on the other.', 'Regroupe les termes en x d\'un côté et les nombres de l\'autre.'),
  };
});
export const solveEq9 = tierGen(numberPuzzle, plumber, bothSides);

/** MS.G9.C3.1.a: linear versus non-linear rates of change */
type Pt = [number, number];
const linearPoints = (r: () => number): Pt[] => { const m = randInt(r, 2, 6) * (r() < 0.3 ? -1 : 1), b = randInt(r, -3, 8); return [0, 1, 2, 3].map((x) => [x, m * x + b] as Pt); };
const quadPoints = (r: () => number): Pt[] => { const a = randInt(r, 1, 3), b = randInt(r, 0, 5); return [0, 1, 2, 3].map((x) => [x, a * x * x + b] as Pt); };
const growthPoints = (r: () => number): Pt[] => { const a = randInt(r, 1, 3), b = pick(r, [2, 3]); return [0, 1, 2, 3].map((x) => [x, a * b ** x] as Pt); };
const linearOrNot = choiceGen('MS.G9.C3.1.a', (_tier, r) => {
  const lin1 = r() < 0.5;
  const ps = lin1 ? linearPoints(r) : pick(r, [quadPoints, growthPoints])(r);
  const right = lin1 ? t('Linear: the rate of change is constant', 'Linéaire : le taux de variation est constant') : t('Non-linear: the rate of change is not constant', 'Non linéaire : le taux de variation n\'est pas constant');
  const wrong = lin1 ? t('Non-linear: the rate of change is not constant', 'Non linéaire : le taux de variation n\'est pas constant') : t('Linear: the rate of change is constant', 'Linéaire : le taux de variation est constant');
  const m = mc(r, right, [[wrong, lin1 ? t('Check the differences in y when x goes up by 1: they are all the same, so the rate is constant.', 'Vérifie les différences de y quand x augmente de 1 : elles sont toutes pareilles, le taux est donc constant.') : t('Check the differences in y when x goes up by 1: they are not all the same, so the rate is not constant.', 'Vérifie les différences de y quand x augmente de 1 : elles ne sont pas toutes pareilles, le taux n\'est donc pas constant.')]]);
  const dy = ps.slice(1).map((p, i) => p[1] - ps[i]![1]);
  return {
    prompt: bi((f) => f.t(`A table of values gives the points ${f.m(pts(f, ps))}. Is the relation linear or non-linear?`, `Un tableau de valeurs donne les points ${f.m(pts(f, ps))}. La relation est-elle linéaire ou non linéaire ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`When x goes up by ${f.N(1)}, y changes by ${dy.map((d) => f.N(d)).join(', ')}.`, `Quand x augmente de ${f.N(1)}, y change de ${dy.map((d) => f.N(d)).join(', ')}.`)), t(lin1 ? 'The changes are all equal, so the relation is linear.' : 'The changes are not all equal, so the relation is not linear.', lin1 ? 'Les changements sont tous égaux : la relation est linéaire.' : 'Les changements ne sont pas tous égaux : la relation n\'est pas linéaire.')],
    nudge: t('Find how much y changes each time x goes up by 1. Are the changes the same?', 'Trouve de combien y change chaque fois que x augmente de 1. Les changements sont-ils pareils ?'),
  };
});
const whichTable = choiceGen('MS.G9.C3.1.a', (_tier, r) => {
  const good = linearPoints(r), q = quadPoints(r), g = growthPoints(r);
  const m = mc(r, bx((f) => pts(f, good)), [[bx((f) => pts(f, q)), t('The changes in y get bigger each time, so this table is not linear.', 'Les changements de y augmentent chaque fois : ce tableau n\'est pas linéaire.')], [bx((f) => pts(f, g)), t('y is multiplied each time instead of changing by the same amount, so this table is not linear.', 'y est multiplié chaque fois au lieu de changer du même montant : ce tableau n\'est pas linéaire.')]]);
  return {
    prompt: t('Which table of values shows a linear relation?', 'Quel tableau de valeurs montre une relation linéaire ?'),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [t('In a linear relation, y changes by the same amount every time x goes up by the same step.', 'Dans une relation linéaire, y change du même montant chaque fois que x augmente du même pas.'), t('Check the differences in y for each table.', 'Vérifie les différences de y pour chaque tableau.')],
    nudge: t('Find the differences in y for each table. Only one has all the same differences.', 'Trouve les différences de y pour chaque tableau. Un seul a toutes les différences pareilles.'),
  };
});
const rateUneven = numGen('MS.G9.C3.1.a', (_tier, r) => {
  const m = randInt(r, 2, 8) * (r() < 0.3 ? -1 : 1), b = randInt(r, 0, 9);
  const xs = [1, 3, 4, 7].map((x) => x + randInt(r, 0, 2)).sort((p, q) => p - q);
  const ps = xs.filter((x, i) => xs.indexOf(x) === i).slice(0, 4).map((x) => [x, m * x + b] as Pt);
  const [p0, p1] = [ps[0]!, ps[ps.length - 1]!];
  return {
    prompt: bi((f) => f.t(`A linear relation has the points ${f.m(pts(f, ps))}. What is the constant rate of change?`, `Une relation linéaire a les points ${f.m(pts(f, ps))}. Quel est le taux de variation constant ?`)),
    answer: m, category: 'TH',
    wrong: wr(m, [[p1[1] - p0[1], t('That is the change in y only. The x values jump by different amounts, so divide by the change in x.', 'C\'est seulement le changement de y. Les valeurs de x font des sauts différents : divise par le changement de x.'), 1], [(p1[0] - p0[0]) / (p1[1] - p0[1] || 1), t('The division is upside down: change in y over change in x.', 'La division est à l\'envers : changement de y sur changement de x.'), 1]]),
    steps: [bi((f) => f.t(`Use any two points: change in y = ${f.N(p1[1] - p0[1])}, change in x = ${f.N(p1[0] - p0[0])}.`, `Utilise deux points : changement de y = ${f.N(p1[1] - p0[1])}, changement de x = ${f.N(p1[0] - p0[0])}.`)), bi((f) => `${f.N(p1[1] - p0[1])} ÷ ${f.N(p1[0] - p0[0])} = ${f.N(m)}.`)],
    nudge: t('Rate of change = change in y ÷ change in x, using two points.', 'Taux de variation = changement de y ÷ changement de x, avec deux points.'),
  };
});
export const linearVs9 = tierGen(linearOrNot, whichTable, rateUneven);

/** MS.G9.C3.2.a: representing linear relations; rate of change and initial value */
const candle = numGen('MS.G9.C3.2.a', (_tier, r) => {
  const h0 = randInt(r, 20, 50), rate = randInt(r, 1, 3), hrs = randInt(r, 3, 9);
  const ans = h0 - rate * hrs;
  return {
    prompt: bi((f) => f.t(`A candle is ${f.N(h0)} cm tall and burns down ${f.N(rate)} cm every hour. How tall is it after ${f.N(hrs)} hours, in cm?`, `Une chandelle mesure ${f.N(h0)} cm et brûle de ${f.N(rate)} cm chaque heure. Quelle est sa hauteur après ${f.N(hrs)} heures, en cm ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[h0 + rate * hrs, t('The candle gets shorter, so the rate is negative: subtract the burned part.', 'La chandelle raccourcit : le taux est négatif, soustrais la partie brûlée.'), 1], [rate * hrs, t('That is only how much has burned. Take it away from the starting height.', 'C\'est seulement ce qui a brûlé. Retire-le de la hauteur de départ.'), 1]]),
    steps: [bi((f) => f.t(`Initial value ${f.N(h0)}, rate of change ${f.N(-rate)} cm per hour: ${f.m(`h = ${f.n(h0)} - ${f.n(rate)}t`)}.`, `Valeur initiale ${f.N(h0)}, taux de variation ${f.N(-rate)} cm par heure : ${f.m(`h = ${f.n(h0)} - ${f.n(rate)}t`)}.`)), bi((f) => `${f.N(h0)} − ${f.N(rate)} × ${f.N(hrs)} = ${f.N(ans)}.`)],
    nudge: t('Start from the initial height and apply the rate for each hour.', 'Pars de la hauteur initiale et applique le taux pour chaque heure.'),
  };
});
const gymRate = numGen('MS.G9.C3.2.a', (_tier, r) => {
  const fee = randInt(r, 2, 8) * 10, rate = randInt(r, 2, 9) * 5, m1 = randInt(r, 2, 4), m2 = m1 + randInt(r, 2, 4);
  return {
    prompt: bi((f) => f.t(`A gym charges a one-time sign-up fee plus a monthly fee. After ${f.N(m1)} months a member has paid ${f.D(fee + rate * m1)} in all, and after ${f.N(m2)} months ${f.D(fee + rate * m2)}. What is the monthly fee, in dollars?`, `Un gym charge des frais d'inscription uniques plus des frais mensuels. Après ${f.N(m1)} mois, un membre a payé ${f.D(fee + rate * m1)} en tout, et après ${f.N(m2)} mois ${f.D(fee + rate * m2)}. Quels sont les frais mensuels, en dollars ?`)),
    answer: rate, category: 'AP',
    wrong: wr(rate, [[(fee + rate * m2) - (fee + rate * m1), t('That is the extra money paid, not the money per month. Divide by the number of extra months.', 'C\'est l\'argent payé en plus, pas l\'argent par mois. Divise par le nombre de mois de plus.'), 1], [r6((fee + rate * m1) / m1), t('That spreads the sign-up fee over the months too. Use the change between the two totals.', 'Cela répartit aussi les frais d\'inscription sur les mois. Utilise le changement entre les deux totaux.'), 0]]),
    steps: [bi((f) => f.t(`Extra paid: ${f.N(fee + rate * m2)} − ${f.N(fee + rate * m1)} = ${f.D(rate * (m2 - m1))} over ${f.N(m2 - m1)} months.`, `Payé en plus : ${f.N(fee + rate * m2)} − ${f.N(fee + rate * m1)} = ${f.D(rate * (m2 - m1))} sur ${f.N(m2 - m1)} mois.`)), bi((f) => `${f.N(rate * (m2 - m1))} ÷ ${f.N(m2 - m1)} = ${f.N(rate)}.`)],
    nudge: t('The sign-up fee cancels when you subtract the two totals. Divide by the extra months.', 'Les frais d\'inscription s\'annulent quand tu soustrais les deux totaux. Divise par les mois de plus.'),
  };
});
const initialValue = numGen('MS.G9.C3.2.a', (_tier, r) => {
  const fee = randInt(r, 2, 8) * 10, rate = randInt(r, 2, 9) * 5, m1 = randInt(r, 2, 4), m2 = m1 + randInt(r, 2, 4);
  return {
    prompt: bi((f) => f.t(`A gym charges a one-time sign-up fee plus a monthly fee. After ${f.N(m1)} months a member has paid ${f.D(fee + rate * m1)} in all, and after ${f.N(m2)} months ${f.D(fee + rate * m2)}. What is the sign-up fee (the initial value), in dollars?`, `Un gym charge des frais d'inscription uniques plus des frais mensuels. Après ${f.N(m1)} mois, un membre a payé ${f.D(fee + rate * m1)} en tout, et après ${f.N(m2)} mois ${f.D(fee + rate * m2)}. Quels sont les frais d'inscription (la valeur initiale), en dollars ?`)),
    answer: fee, category: 'TH',
    wrong: wr(fee, [[rate, t('That is the monthly fee. The sign-up fee is what is left of the first total after taking out the monthly fees.', 'Ce sont les frais mensuels. Les frais d\'inscription, c\'est ce qui reste du premier total après avoir retiré les frais mensuels.'), 1], [fee + rate * m1, t('That is the first total, which includes the monthly fees. Take them out.', 'C\'est le premier total, qui comprend les frais mensuels. Retire-les.'), 1]]),
    steps: [bi((f) => f.t(`Monthly fee: (${f.N(fee + rate * m2)} − ${f.N(fee + rate * m1)}) ÷ ${f.N(m2 - m1)} = ${f.D(rate)}.`, `Frais mensuels : (${f.N(fee + rate * m2)} − ${f.N(fee + rate * m1)}) ÷ ${f.N(m2 - m1)} = ${f.D(rate)}.`)), bi((f) => `${f.N(fee + rate * m1)} − ${f.N(rate)} × ${f.N(m1)} = ${f.N(fee)}.`)],
    nudge: t('Find the monthly fee first, then take the monthly fees out of one total.', 'Trouve d\'abord les frais mensuels, puis retire les frais mensuels d\'un des totaux.'),
  };
});
export const linearRelations9 = tierGen(candle, gymRate, initialValue);

/** MS.G9.C3.3.a: comparing two lines y = ax + b and the meaning of their intersection */
const lineMeet = numGen('MS.G9.C3.3.a', (_tier, r) => {
  const x = randInt(r, 1, 12), a = randInt(r, 2, 8), c = randInt(r, 1, a - 1), b = randInt(r, 0, 15);
  const d = b + (a - c) * x;
  return {
    prompt: bi((f) => f.t(`The lines ${f.m(`y = ${f.n(a)}x + ${f.n(b)}`)} and ${f.m(`y = ${f.n(c)}x + ${f.n(d)}`)} cross at one point. What is the x-coordinate of that point?`, `Les droites ${f.m(`y = ${f.n(a)}x + ${f.n(b)}`)} et ${f.m(`y = ${f.n(c)}x + ${f.n(d)}`)} se croisent en un point. Quelle est la coordonnée x de ce point ?`)),
    answer: x, category: 'AP',
    wrong: wr(x, [[(d - b) / (a + c), t('The x terms are on different sides: subtract the smaller from the larger, do not add them.', 'Les termes en x sont de chaque côté : soustrais le plus petit du plus grand, ne les additionne pas.'), 0], [d - b, t('That is the difference of the constants. Divide it by the difference of the slopes.', 'C\'est la différence des constantes. Divise-la par la différence des pentes.'), 0]]),
    steps: [bi((f) => f.t(`At the crossing the y values are equal: ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(d)}`)}.`, `Au point de croisement, les valeurs de y sont égales : ${f.m(`${f.n(a)}x + ${f.n(b)} = ${f.n(c)}x + ${f.n(d)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, so x = ${f.N(x)}.`, `${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, donc x = ${f.N(x)}.`))],
    nudge: t('Set the two expressions for y equal and solve for x.', 'Pose les deux expressions de y égales et résous pour x.'),
  };
});
const lineMeetY = numGen('MS.G9.C3.3.a', (_tier, r) => {
  const x = randInt(r, 1, 10), a = randInt(r, 2, 8), c = randInt(r, 1, a - 1), b = randInt(r, 0, 15);
  const d = b + (a - c) * x, y = a * x + b;
  return {
    prompt: bi((f) => f.t(`The lines ${f.m(`y = ${f.n(a)}x + ${f.n(b)}`)} and ${f.m(`y = ${f.n(c)}x + ${f.n(d)}`)} cross at one point. What is the y-coordinate of that point?`, `Les droites ${f.m(`y = ${f.n(a)}x + ${f.n(b)}`)} et ${f.m(`y = ${f.n(c)}x + ${f.n(d)}`)} se croisent en un point. Quelle est la coordonnée y de ce point ?`)),
    answer: y, category: 'AP',
    wrong: wr(y, [[x, t('That is the x-coordinate. Put it in either equation to get y.', 'C\'est la coordonnée x. Remplace-la dans l\'une ou l\'autre équation pour obtenir y.'), 1], [c * x + b, t('Use the constant that belongs to the same line as the slope.', 'Utilise la constante qui appartient à la même droite que la pente.'), 1]]),
    steps: [bi((f) => f.t(`Solve for x: ${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, so x = ${f.N(x)}.`, `Résous pour x : ${f.m(`${f.n(a - c)}x = ${f.n(d - b)}`)}, donc x = ${f.N(x)}.`)), bi((f) => `y = ${f.N(a)} × ${f.N(x)} + ${f.N(b)} = ${f.N(y)}.`)],
    nudge: t('Find x where the lines meet, then put it into one of the equations.', 'Trouve x où les droites se rencontrent, puis remplace-le dans l\'une des équations.'),
  };
});
const plansEqual = numGen('MS.G9.C3.3.a', (_tier, r) => {
  const n = randInt(r, 3, 12), a = randInt(r, 4, 9) * 5, c = randInt(r, 1, 3) * 5, b = randInt(r, 0, 4) * 5;
  const fee2 = b + (a - c) * n;
  const cost = a * n + b;
  return {
    prompt: bi((f) => f.t(`Plan A costs ${f.D(b)} to join plus ${f.D(a)} a month. Plan B costs ${f.D(fee2)} to join plus ${f.D(c)} a month. After how many months do the two plans cost the same in total? (Then the total cost is ${f.D(cost)}.)`, `Le forfait A coûte ${f.D(b)} pour s'inscrire plus ${f.D(a)} par mois. Le forfait B coûte ${f.D(fee2)} pour s'inscrire plus ${f.D(c)} par mois. Après combien de mois les deux forfaits coûtent-ils le même total ? (Le coût total est alors de ${f.D(cost)}.)`)),
    answer: n, category: 'TH',
    wrong: wr(n, [[cost, t('That is the total cost at that point, not the number of months.', 'C\'est le coût total à ce point, pas le nombre de mois.'), 1], [(fee2 - b) / (a + c), t('The monthly amounts are subtracted: the plan with the higher monthly fee catches up on the other.', 'Les montants mensuels se soustraient : le forfait avec les frais mensuels les plus élevés rattrape l\'autre.'), 0]]),
    steps: [bi((f) => f.t(`Equal costs: ${f.m(`${f.n(a)}m + ${f.n(b)} = ${f.n(c)}m + ${f.n(fee2)}`)}.`, `Coûts égaux : ${f.m(`${f.n(a)}m + ${f.n(b)} = ${f.n(c)}m + ${f.n(fee2)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(a - c)}m = ${f.n(fee2 - b)}`)}, so m = ${f.N(n)}.`, `${f.m(`${f.n(a - c)}m = ${f.n(fee2 - b)}`)}, donc m = ${f.N(n)}.`))],
    nudge: t('Write each plan\'s cost as an expression, set them equal and solve.', 'Écris le coût de chaque forfait sous forme d\'expression, pose-les égales et résous.'),
  };
});
export const compareLines9 = tierGen(lineMeet, lineMeetY, plansEqual);

/** MS.G9.C4.2.a: graphing x = k, y = k, x + y = k, ax + by = k (described by equations and intercepts) */
const verticalLine = choiceGen('MS.G9.C4.2.a', (_tier, r) => {
  const p = randInt(r, -6, 8) || 3, q = randInt(r, -6, 8) || -2;
  const vertical = r() < 0.5;
  const m = mc(r, bx((f) => (vertical ? `x = ${f.n(p)}` : `y = ${f.n(q)}`)), [
    [bx((f) => (vertical ? `y = ${f.n(q)}` : `x = ${f.n(p)}`)), t('This equation describes the other kind of line. x = k is vertical and y = k is horizontal.', 'Cette équation décrit l\'autre sorte de droite. x = k est verticale et y = k est horizontale.')],
    [bx((f) => `x + y = ${f.n(p + q)}`), t('That line is slanted: it goes through the point but is not vertical or horizontal.', 'Cette droite est oblique : elle passe par le point, mais n\'est ni verticale ni horizontale.')],
    [bx((f) => `x - y = ${f.n(p - q)}`), t('That line is slanted: it goes through the point but is not vertical or horizontal.', 'Cette droite est oblique : elle passe par le point, mais n\'est ni verticale ni horizontale.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Which equation describes the ${vertical ? 'vertical' : 'horizontal'} line through the point ${f.m(`(${f.n(p)},\\ ${f.n(q)})`)}?`, `Quelle équation décrit la droite ${vertical ? 'verticale' : 'horizontale'} passant par le point ${f.m(`(${f.n(p)},\\ ${f.n(q)})`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('A vertical line keeps the same x everywhere, so its equation is x = k. A horizontal line keeps the same y, so its equation is y = k.', 'Une droite verticale garde le même x partout : son équation est x = k. Une droite horizontale garde le même y : son équation est y = k.'), t(vertical ? 'Use the x-coordinate of the point.' : 'Use the y-coordinate of the point.', vertical ? 'Utilise la coordonnée x du point.' : 'Utilise la coordonnée y du point.')],
    nudge: t('Which coordinate stays the same along the line?', 'Quelle coordonnée reste la même le long de la droite ?'),
  };
});
const intercept = numGen('MS.G9.C4.2.a', (_tier, r) => {
  const b = randInt(r, 2, 8), y = randInt(r, 1, 9), x = randInt(r, 1, 9), a = randInt(r, 2, 6);
  const k = a * x + b * y;
  const askX = r() < 0.5;
  return {
    prompt: bi((f) => f.t(`The line ${f.m(`${f.n(a)}x + ${f.n(b)}y = ${f.n(k)}`)} crosses the ${askX ? 'x' : 'y'}-axis at one point. What is the ${askX ? 'x' : 'y'}-intercept (the ${askX ? 'x' : 'y'}-coordinate of that point)? Round to the nearest hundredth if needed.`, `La droite ${f.m(`${f.n(a)}x + ${f.n(b)}y = ${f.n(k)}`)} coupe l'axe des ${askX ? 'x' : 'y'} en un point. Quelle est l'ordonnée ou l'abscisse à l'origine (la coordonnée ${askX ? 'x' : 'y'} de ce point) ? Arrondis au centième près au besoin.`)),
    answer: askX ? r6(k / a) : r6(k / b), category: 'AP', tolerance: 0.006,
    wrong: wr(askX ? k / a : k / b, [[askX ? k / b : k / a, t('The other intercept was found. For the x-intercept set y = 0; for the y-intercept set x = 0.', 'L\'autre point d\'intersection a été trouvé. Pour l\'abscisse à l\'origine, pose y = 0 ; pour l\'ordonnée à l\'origine, pose x = 0.'), 0], [k, t('Divide k by the coefficient of the variable that is left.', 'Divise k par le coefficient de la variable qui reste.'), 0]]),
    steps: [bi((f) => (askX ? f.t(`Set y = 0: ${f.m(`${f.n(a)}x = ${f.n(k)}`)}.`, `Pose y = 0 : ${f.m(`${f.n(a)}x = ${f.n(k)}`)}.`) : f.t(`Set x = 0: ${f.m(`${f.n(b)}y = ${f.n(k)}`)}.`, `Pose x = 0 : ${f.m(`${f.n(b)}y = ${f.n(k)}`)}.`))), bi((f) => (askX ? `x = ${f.N(k)} ÷ ${f.N(a)} = ${f.N(r6(k / a))}.` : `y = ${f.N(k)} ÷ ${f.N(b)} = ${f.N(r6(k / b))}.`))],
    nudge: t('For an intercept, set the other variable to 0 and solve.', 'Pour trouver un point d\'intersection avec un axe, pose l\'autre variable égale à 0 et résous.'),
  };
});
const pointOnLine = numGen('MS.G9.C4.2.a', (_tier, r) => {
  const a = randInt(r, 2, 5), b = randInt(r, 2, 5), x = randInt(r, 1, 6), y = randInt(r, 1, 8);
  const k = a * x + b * y, x2 = x + b * randInt(r, 1, 3), y2 = (k - a * x2) / b;
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x2)},\\ y)`)} is on the line ${f.m(`${f.n(a)}x + ${f.n(b)}y = ${f.n(k)}`)}. What is y?`, `Le point ${f.m(`(${f.n(x2)},\\ y)`)} est sur la droite ${f.m(`${f.n(a)}x + ${f.n(b)}y = ${f.n(k)}`)}. Quelle est la valeur de y ?`)),
    answer: y2, category: 'TH',
    wrong: wr(y2, [[(k - a * x2) * b, t('Divide by the coefficient of y, do not multiply.', 'Divise par le coefficient de y, ne multiplie pas.'), 1], [(k + a * x2) / b, t('Subtract the x term from k when you move it across the equal sign.', 'Soustrais le terme en x de k quand tu le passes de l\'autre côté du signe égal.'), 0]]),
    steps: [bi((f) => f.t(`Replace x: ${f.m(`${f.n(a)} \\times ${f.n(x2)} + ${f.n(b)}y = ${f.n(k)}`)}.`, `Remplace x : ${f.m(`${f.n(a)} \\times ${f.n(x2)} + ${f.n(b)}y = ${f.n(k)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(b)}y = ${f.n(k - a * x2)}`)}, so y = ${f.N(y2)}.`, `${f.m(`${f.n(b)}y = ${f.n(k - a * x2)}`)}, donc y = ${f.N(y2)}.`))],
    nudge: t('Replace x by its value and solve the equation for y.', 'Remplace x par sa valeur et résous l\'équation pour y.'),
  };
});
export const graphEquations9 = tierGen(verticalLine, intercept, pointOnLine);

/** MS.G9.C4.3.a: translate, reflect and rotate y = ax */
const reflectSlope = numGen('MS.G9.C4.3.a', (_tier, r) => {
  const a = randInt(r, 2, 9) * (r() < 0.4 ? -1 : 1), axis = pick(r, ['x', 'y'] as const);
  return {
    prompt: bi((f) => f.t(`The line ${f.m(`y = ${f.n(a)}x`)} is reflected in the ${axis}-axis. What is the slope of the image?`, `La droite ${f.m(`y = ${f.n(a)}x`)} est réfléchie par rapport à l'axe des ${axis}. Quelle est la pente de l'image ?`)),
    answer: -a, category: 'KU',
    wrong: wr(-a, [[a, t('A reflection in an axis flips the line, so the slope changes sign.', 'Une réflexion par rapport à un axe retourne la droite : la pente change de signe.'), 0], [r6(1 / a), t('That is the reciprocal, which comes from a 90° rotation, not a reflection in an axis.', 'C\'est l\'inverse, qui vient d\'une rotation de 90°, pas d\'une réflexion par rapport à un axe.'), 0]]),
    steps: [t('Reflecting in the x-axis changes the sign of every y, and reflecting in the y-axis changes the sign of every x. Either way the slope changes sign.', 'Une réflexion par rapport à l\'axe des x change le signe de chaque y, et par rapport à l\'axe des y change le signe de chaque x. Dans les deux cas, la pente change de signe.'), bi((f) => `${f.N(a)} → ${f.N(-a)}.`)],
    nudge: t('A reflection in either axis turns a rising line into a falling line, and the other way round.', 'Une réflexion par rapport à l\'un ou l\'autre axe transforme une droite montante en droite descendante, et inversement.'),
  };
});
const translateRight = numGen('MS.G9.C4.3.a', (_tier, r) => {
  const a = randInt(r, 2, 7) * (r() < 0.3 ? -1 : 1), h = randInt(r, 1, 6);
  return {
    prompt: bi((f) => f.t(`The line ${f.m(`y = ${f.n(a)}x`)} is translated ${f.N(h)} units to the right. What is the y-intercept of the image?`, `La droite ${f.m(`y = ${f.n(a)}x`)} subit une translation de ${f.N(h)} unités vers la droite. Quelle est l'ordonnée à l'origine de l'image ?`)),
    answer: -a * h, category: 'AP',
    wrong: wr(-a * h, [[a * h, t('Moving right replaces x by (x − h), which gives −a × h.', 'Déplacer vers la droite remplace x par (x − h), ce qui donne −a × h.'), 1], [h, t('The slope stays the same, so the line is not simply shifted up by h. Use the new equation.', 'La pente reste la même : la droite n\'est pas simplement remontée de h. Utilise la nouvelle équation.'), 1]]),
    steps: [bi((f) => f.t(`The image is ${f.m(`y = ${f.n(a)}(x - ${f.n(h)})`)}.`, `L'image est ${f.m(`y = ${f.n(a)}(x - ${f.n(h)})`)}.`)), bi((f) => f.t(`Put x = 0: y = ${f.N(a)} × (${f.N(-h)}) = ${f.N(-a * h)}.`, `Pose x = 0 : y = ${f.N(a)} × (${f.N(-h)}) = ${f.N(-a * h)}.`))],
    nudge: t('Moving right by h replaces x with x − h. Then put x = 0.', 'Un déplacement de h vers la droite remplace x par x − h. Puis pose x = 0.'),
  };
});
const rotateSlope = numGen('MS.G9.C4.3.a', (_tier, r) => {
  const a = pick(r, [2, 4, 5, 8, -2, -4, -5, -8, 0.5, 0.25, -0.5, -0.25]);
  const ans = r6(-1 / a);
  return {
    prompt: bi((f) => f.t(`The line ${f.m(`y = ${f.n(a)}x`)} is rotated ${f.N(90)}° about the origin. What is the slope of the image?`, `La droite ${f.m(`y = ${f.n(a)}x`)} subit une rotation de ${f.N(90)}° autour de l'origine. Quelle est la pente de l'image ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[-a, t('That is the slope after a reflection. A 90° turn makes the new line perpendicular to the first: its slope is the negative reciprocal.', 'C\'est la pente après une réflexion. Une rotation de 90° rend la nouvelle droite perpendiculaire à la première : sa pente est l\'inverse négatif.'), 0], [r6(1 / a), t('The reciprocal needs a change of sign too: perpendicular slopes have opposite signs.', 'L\'inverse doit aussi changer de signe : les pentes perpendiculaires ont des signes opposés.'), 0]]),
    steps: [t('A 90° rotation makes the line perpendicular to the original. Perpendicular slopes are negative reciprocals.', 'Une rotation de 90° rend la droite perpendiculaire à l\'originale. Les pentes perpendiculaires sont des inverses négatifs.'), bi((f) => `−1 ÷ ${f.N(a)} = ${f.N(ans)}.`)],
    nudge: t('Flip the slope upside down and change its sign.', 'Retourne la pente à l\'envers et change son signe.'),
  };
});
export const transformLines9 = tierGen(reflectSlope, translateRight, rotateSlope);

/** MS.G9.C4.4.a: equations of lines from tables and graphs (slope and y-intercept) */
const slopeTwoPoints = numGen('MS.G9.C4.4.a', (_tier, r) => {
  const m = randInt(r, 1, 6) * (r() < 0.4 ? -1 : 1), b = randInt(r, -5, 9), x1 = randInt(r, -3, 3), x2 = x1 + randInt(r, 1, 4);
  return {
    prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} and ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. What is its slope?`, `Une droite passe par ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} et ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. Quelle est sa pente ?`)),
    answer: m, category: 'KU',
    wrong: wr(m, [[r6(1 / m), t('The slope is rise over run: the change in y divided by the change in x, not the other way round.', 'La pente est la variation verticale sur la variation horizontale : le changement de y divisé par le changement de x, pas l\'inverse.'), 1], [-m, t('Subtract the first point from the second in both coordinates, in the same order.', 'Soustrais le premier point du deuxième pour les deux coordonnées, dans le même ordre.'), 1]]),
    steps: [bi((f) => f.t(`Change in y: ${f.N(m * x2 + b)} − (${f.N(m * x1 + b)}) = ${f.N(m * (x2 - x1))}. Change in x: ${f.N(x2)} − (${f.N(x1)}) = ${f.N(x2 - x1)}.`, `Changement de y : ${f.N(m * x2 + b)} − (${f.N(m * x1 + b)}) = ${f.N(m * (x2 - x1))}. Changement de x : ${f.N(x2)} − (${f.N(x1)}) = ${f.N(x2 - x1)}.`)), bi((f) => `${f.N(m * (x2 - x1))} ÷ ${f.N(x2 - x1)} = ${f.N(m)}.`)],
    nudge: t('Slope = change in y ÷ change in x.', 'Pente = changement de y ÷ changement de x.'),
  };
});
const yInterceptTable = numGen('MS.G9.C4.4.a', (_tier, r) => {
  const m = randInt(r, 1, 6) * (r() < 0.4 ? -1 : 1), b = randInt(r, -8, 12);
  const ps: Pt[] = [1, 2, 3].map((x) => [x, m * x + b]);
  return {
    prompt: bi((f) => f.t(`A table of values for a linear relation gives ${f.m(pts(f, ps))}. The equation is ${f.m('y = mx + b')}. What is b, the y-intercept?`, `Un tableau de valeurs d'une relation linéaire donne ${f.m(pts(f, ps))}. L'équation est ${f.m('y = mx + b')}. Quelle est la valeur de b, l'ordonnée à l'origine ?`)),
    answer: b, category: 'AP',
    wrong: wr(b, [[ps[0]![1], t('That is the value of y when x = 1, not when x = 0. Go back one step in x using the slope.', 'C\'est la valeur de y quand x = 1, pas quand x = 0. Recule d\'un pas en x en utilisant la pente.'), 1], [m, t('That is the slope. The y-intercept is the value of y when x = 0.', 'C\'est la pente. L\'ordonnée à l\'origine est la valeur de y quand x = 0.'), 0]]),
    steps: [bi((f) => f.t(`The slope is ${f.N(m)}. Going back from x = 1 to x = 0 changes y by ${f.N(-m)}.`, `La pente est ${f.N(m)}. Reculer de x = 1 à x = 0 change y de ${f.N(-m)}.`)), bi((f) => `${f.N(ps[0]![1])} − (${f.N(m)}) = ${f.N(b)}.`)],
    nudge: t('Find the slope, then work backwards to x = 0.', 'Trouve la pente, puis remonte jusqu\'à x = 0.'),
  };
});
const xInterceptLine = numGen('MS.G9.C4.4.a', (_tier, r) => {
  const m = randInt(r, 1, 5) * (r() < 0.4 ? -1 : 1), x0 = randInt(r, 1, 8) * (r() < 0.5 ? -1 : 1), b = -m * x0, x1 = randInt(r, 1, 4);
  return {
    prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} and ${f.m(`(${f.n(x1 + 1)},\\ ${f.n(m * (x1 + 1) + b)})`)}. At what x-value does it cross the x-axis?`, `Une droite passe par ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} et ${f.m(`(${f.n(x1 + 1)},\\ ${f.n(m * (x1 + 1) + b)})`)}. Pour quelle valeur de x coupe-t-elle l'axe des x ?`)),
    answer: x0, category: 'TH',
    wrong: wr(x0, [[b, t('That is the y-intercept. The x-intercept is where y = 0.', 'C\'est l\'ordonnée à l\'origine. L\'abscisse à l\'origine est là où y = 0.'), 1], [-x0, t('Check the sign: solve m x + b = 0 for x, giving x = −b ÷ m.', 'Vérifie le signe : résous m x + b = 0 pour x, ce qui donne x = −b ÷ m.'), 1]]),
    steps: [bi((f) => f.t(`Slope ${f.N(m)}, y-intercept ${f.N(b)}: the equation is ${f.m(lin(f, m, b, 'x').replace(/^/, 'y = '))}.`, `Pente ${f.N(m)}, ordonnée à l'origine ${f.N(b)} : l'équation est ${f.m(lin(f, m, b, 'x').replace(/^/, 'y = '))}.`)), bi((f) => f.t(`Set y = 0: ${f.m(`${f.n(m)}x + ${f.n(b)} = 0`)}, so x = ${f.N(x0)}.`, `Pose y = 0 : ${f.m(`${f.n(m)}x + ${f.n(b)} = 0`)}, donc x = ${f.N(x0)}.`))],
    nudge: t('Find the slope and the y-intercept, then set y = 0.', 'Trouve la pente et l\'ordonnée à l\'origine, puis pose y = 0.'),
  };
});
export const lineEquations9 = tierGen(slopeTwoPoints, yInterceptTable, xInterceptLine);
