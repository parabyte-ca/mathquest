// Grade 10 (MPM2D and MFM2P) linear algebra: systems of equations, equations with fractions, rearranging formulas, and slope.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { gcd, t } from './kit.js';
import { lin, poly } from './algebra10.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
/** a x + b y = d */
const std = (f: F, a: number, b: number, d: number): string => `${poly(f, [[a, 'x'], [b, 'y']])} = ${f.n(d)}`;
/** y = m x + c */
const slopeForm = (f: F, m: number, c: number): string => `y = ${poly(f, [[m, 'x'], [c, '']])}`;
const and = (f: F, a: string, b: string): string => `${f.m(a)} ${f.t('and', 'et')} ${f.m(b)}`;

// ── systems ─────────────────────────────────────────────────────────────────────

/** Substitution: one equation is solved for y. Asks for x. */
export const substitutionGen = (id: string): Generator => numGen(id, (tier, r) => {
  let x0 = 0, y0 = 0, m = 0, a = 0, b = 0;
  do {
    x0 = nonzero(r, -6, 8); y0 = nonzero(r, -8, 8);
    m = tier === 1 ? pick(r, [1, 2, 3]) : nonzero(r, -4, 4);
    a = tier === 1 ? 1 : nonzero(r, -4, 5); b = tier === 3 ? nonzero(r, 2, 5) * pick(r, [1, -1]) : pick(r, [1, 1, 2]);
  } while (a + b * m === 0 || x0 === y0 || a * x0 + b * y0 === 0);
  const c = y0 - m * x0, d = a * x0 + b * y0;
  const e1 = (f: F): string => slopeForm(f, m, c), e2 = (f: F): string => std(f, a, b, d);
  const combined = a + b * m, rhs = d - b * c;
  return {
    prompt: bi((f) => f.t(`Solve the system by substitution: ${and(f, e1(f), e2(f))}. What is x?`, `Résous le système par substitution : ${and(f, e1(f), e2(f))}. Quelle est la valeur de x ?`)),
    answer: x0, category: 'AP',
    wrong: wr(x0, [
      [y0, t('That is y. The question asks for x. Find x first, then put it in the first equation to get y.', 'C\'est y. La question demande x. Trouve d\'abord x, puis remplace-le dans la première équation pour obtenir y.'), 2],
      [-x0, t('A sign was lost when collecting terms. Redo the last step.', 'Un signe s\'est perdu en regroupant les termes. Refais la dernière étape.'), 2],
      [x0 + y0, t('That adds x and y. Solve for x alone.', 'Cela additionne x et y. Résous pour x seul.'), 2],
      [(d + b * c) / combined, t('When y is replaced by an expression, its constant must be subtracted from the right side, not added.', 'Quand on remplace y par une expression, sa constante se soustrait du membre de droite, elle ne s\'ajoute pas.'), 1],
    ]),
    steps: [
      bi((f) => f.t(`Replace y in the second equation by ${f.m(poly(f, [[m, 'x'], [c, '']]))}: ${f.m(`${poly(f, [[a, 'x']])} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : f.n(Math.abs(b))}(${poly(f, [[m, 'x'], [c, '']])}) = ${f.n(d)}`)}.`, `Remplace y dans la deuxième équation par ${f.m(poly(f, [[m, 'x'], [c, '']]))} : ${f.m(`${poly(f, [[a, 'x']])} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : f.n(Math.abs(b))}(${poly(f, [[m, 'x'], [c, '']])}) = ${f.n(d)}`)}.`)),
      bi((f) => f.t(`Expand and collect: ${f.m(`${lin(f, combined, 0)} = ${f.n(rhs)}`)}.`, `Développe et regroupe : ${f.m(`${lin(f, combined, 0)} = ${f.n(rhs)}`)}.`)),
      bi((f) => f.t(`So x = ${f.N(x0)}.`, `Donc x = ${f.N(x0)}.`)),
    ],
    nudge: t('Replace y in the other equation with the expression it equals, then solve for x.', 'Remplace y dans l\'autre équation par l\'expression à laquelle il est égal, puis résous pour x.'),
  };
});

/** Elimination. Asks for x or y. Tier 3 needs one equation multiplied first. */
export const eliminationGen = (id: string): Generator => numGen(id, (tier, r) => {
  let x0 = 0, y0 = 0, a1 = 0, b1 = 0, a2 = 0, b2 = 0, k = 1;
  do {
    x0 = nonzero(r, -7, 7); y0 = nonzero(r, -7, 7);
    a1 = nonzero(r, -5, 6); b1 = nonzero(r, 1, 5); a2 = nonzero(r, -5, 6);
    k = tier === 3 ? pick(r, [2, 3, -2]) : 1;
    b2 = tier === 1 ? -b1 : tier === 2 ? b1 : k * b1;
  } while (a1 * b2 - a2 * b1 === 0 || (tier === 3 && gcd(Math.abs(a1), Math.abs(a2)) > 3));
  const d1 = a1 * x0 + b1 * y0, d2 = a2 * x0 + b2 * y0;
  const askX = r() < 0.5, ans = askX ? x0 : y0, other = askX ? y0 : x0;
  const how = tier === 1 ? t('The y terms are opposites, so add the equations.', 'Les termes en y sont opposés : additionne les équations.') : tier === 2 ? t('The y terms are equal, so subtract the equations.', 'Les termes en y sont égaux : soustrais les équations.') : bi((f) => f.t(`Multiply the first equation by ${f.N(k)} so the y terms match, then subtract.`, `Multiplie la première équation par ${f.N(k)} pour que les termes en y soient égaux, puis soustrais.`));
  return {
    prompt: bi((f) => f.t(`Solve the system by elimination: ${and(f, std(f, a1, b1, d1), std(f, a2, b2, d2))}. What is ${askX ? 'x' : 'y'}?`, `Résous le système par élimination : ${and(f, std(f, a1, b1, d1), std(f, a2, b2, d2))}. Quelle est la valeur de ${askX ? 'x' : 'y'} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [
      [other, t(`That is ${askX ? 'y' : 'x'}. Check which variable the question asks for.`, `C'est ${askX ? 'y' : 'x'}. Vérifie quelle variable la question demande.`), 2],
      [-ans, t('A sign was lost. When you subtract equations, subtract every term, including the negative ones.', 'Un signe s\'est perdu. Quand on soustrait des équations, on soustrait chaque terme, y compris les négatifs.'), 1],
      [ans + other, t('That adds x and y. Solve for one variable at a time.', 'Cela additionne x et y. Résous une variable à la fois.'), 2],
      [-other, t('A sign was lost in the elimination step.', 'Un signe s\'est perdu à l\'étape d\'élimination.'), 1],
    ]),
    steps: [
      how,
      bi((f) => f.t(`Eliminating ${askX ? 'y' : 'x'} leaves an equation with one variable, which gives ${askX ? 'x' : 'y'} = ${f.N(ans)}.`, `L'élimination de ${askX ? 'y' : 'x'} laisse une équation à une variable, qui donne ${askX ? 'x' : 'y'} = ${f.N(ans)}.`)),
      bi((f) => f.t(`Check in an original equation: ${f.m(`${f.n(a1)}(${f.n(x0)}) + ${f.n(b1)}(${f.n(y0)}) = ${f.n(d1)}`)}.`, `Vérifie dans une équation de départ : ${f.m(`${f.n(a1)}(${f.n(x0)}) + ${f.n(b1)}(${f.n(y0)}) = ${f.n(d1)}`)}.`)),
    ],
    nudge: t('Make the coefficients of one variable match (or be opposites), then add or subtract to remove that variable.', 'Rends les coefficients d\'une variable égaux (ou opposés), puis additionne ou soustrais pour éliminer cette variable.'),
  };
});

/** Word problems that give a system. */
export const systemProblemGen = (id: string): Generator => numGen(id, (tier, r) => {
  const ctx = tier === 3 ? 2 : r() < 0.5 ? 0 : 1;
  if (ctx === 2) {
    const big = randInt(r, 8, 30), small = randInt(r, 2, big - 1);
    return {
      prompt: bi((f) => f.t(`Two numbers add to ${f.N(big + small)} and their difference is ${f.N(big - small)}. What is the larger number?`, `Deux nombres ont pour somme ${f.N(big + small)} et pour différence ${f.N(big - small)}. Quel est le plus grand nombre ?`)),
      answer: big, category: 'AP',
      wrong: wr(big, [[small, t('That is the smaller number. The question asks for the larger.', 'C\'est le plus petit nombre. La question demande le plus grand.'), 2], [big + small, t('That is the sum of the two numbers.', 'C\'est la somme des deux nombres.'), 1], [big - small, t('That is the difference of the two numbers.', 'C\'est la différence des deux nombres.'), 1], [(big + small) / 2, t('That is the average. Add the equations to get 2x.', 'C\'est la moyenne. Additionne les équations pour obtenir 2x.'), 1]]),
      steps: [bi((f) => f.t(`Let the numbers be x and y: ${and(f, `x + y = ${f.n(big + small)}`, `x - y = ${f.n(big - small)}`)}.`, `Soit x et y les nombres : ${and(f, `x + y = ${f.n(big + small)}`, `x - y = ${f.n(big - small)}`)}.`)), bi((f) => f.t(`Add the equations: ${f.m(`2x = ${f.n(2 * big)}`)}.`, `Additionne les équations : ${f.m(`2x = ${f.n(2 * big)}`)}.`)), bi((f) => f.t(`The larger number is ${f.N(big)}.`, `Le plus grand nombre est ${f.N(big)}.`))],
      nudge: t('Write one equation for the sum and one for the difference, then add them.', 'Écris une équation pour la somme et une pour la différence, puis additionne-les.'),
    };
  }
  const [en1, fr1, en2, fr2] = ctx === 0 ? ['adult tickets', 'billets adultes', 'student tickets', 'billets étudiants'] : ['muffins', 'muffins', 'cookies', 'biscuits'];
  const p1 = randInt(r, tier === 1 ? 4 : 5, 12), p2 = randInt(r, 2, p1 - 1);
  const n1 = randInt(r, 5, 25), n2 = randInt(r, 5, 25);
  const total = p1 * n1 + p2 * n2, count = n1 + n2;
  return {
    prompt: bi((f) => ctx === 0
      ? f.t(`A school play sold ${f.N(count)} tickets. Adult tickets cost ${f.N(p1)} dollars and student tickets cost ${f.N(p2)} dollars. The total sales were ${f.N(total)} dollars. How many student tickets were sold?`, `Une pièce de théâtre scolaire a vendu ${f.N(count)} billets. Les billets adultes coûtent ${f.N(p1)} dollars et les billets étudiants coûtent ${f.N(p2)} dollars. Les ventes totales étaient de ${f.N(total)} dollars. Combien de billets étudiants ont été vendus ?`)
      : f.t(`A bakery sold ${f.N(count)} items. Muffins cost ${f.N(p1)} dollars each and cookies cost ${f.N(p2)} dollars each. The total sales were ${f.N(total)} dollars. How many cookies were sold?`, `Une boulangerie a vendu ${f.N(count)} articles. Les muffins coûtent ${f.N(p1)} dollars chacun et les biscuits coûtent ${f.N(p2)} dollars chacun. Les ventes totales étaient de ${f.N(total)} dollars. Combien de biscuits ont été vendus ?`)),    answer: n2, category: 'AP',
    wrong: wr(n2, [[n1, t(`That is the number of ${en1}. The question asks for ${en2}.`, `C'est le nombre de ${fr1}. La question demande les ${fr2}.`), 2], [count, t('That is the total number of items.', 'C\'est le nombre total d\'articles.'), 1], [total / p2, t('That treats every item as the cheaper one.', 'Cela suppose que tous les articles sont les moins chers.'), 1], [count - n2 - 1, t('Check the count against the total cost.', 'Vérifie le nombre avec le coût total.'), 2]]),
    steps: [
      bi((f) => f.t(`Let x be the ${en1} and y the ${en2}: ${and(f, `x + y = ${f.n(count)}`, `${f.n(p1)}x + ${f.n(p2)}y = ${f.n(total)}`)}.`, `Soit x le nombre de ${fr1} et y celui de ${fr2} : ${and(f, `x + y = ${f.n(count)}`, `${f.n(p1)}x + ${f.n(p2)}y = ${f.n(total)}`)}.`)),
      bi((f) => f.t(`Multiply the first equation by ${f.N(p1)} and subtract: ${f.m(`${f.n(p1 - p2)}y = ${f.n(p1 * count - total)}`)}.`, `Multiplie la première équation par ${f.N(p1)} et soustrais : ${f.m(`${f.n(p1 - p2)}y = ${f.n(p1 * count - total)}`)}.`)),
      bi((f) => f.t(`So y = ${f.N(n2)}.`, `Donc y = ${f.N(n2)}.`)),
    ],
    nudge: t('Write one equation for the number of items and one for the total cost.', 'Écris une équation pour le nombre d\'articles et une pour le coût total.'),
  };
});

/** Point of intersection of two lines (MFM2P), asking for x. */
export const intersectionGen = (id: string): Generator => numGen(id, (tier, r) => {
  let x0 = 0, y0 = 0, m1 = 0, m2 = 0, a = 0, b = 0, a2 = 0, b2 = 0;
  do {
    x0 = nonzero(r, -6, 8); y0 = nonzero(r, -8, 8);
    m1 = nonzero(r, -4, 4); m2 = nonzero(r, -4, 4);
    a = nonzero(r, -4, 5); b = nonzero(r, 1, 4); a2 = nonzero(r, -4, 5); b2 = nonzero(r, 1, 4);
  } while ((tier < 3 && m1 === m2) || (tier === 3 && a * b2 - a2 * b === 0) || (tier === 2 && a2 + b2 * m1 === 0));
  const c1 = y0 - m1 * x0, c2 = y0 - m2 * x0, d = a * x0 + b * y0, d2 = a2 * x0 + b2 * y0;
  const e1 = (f: F): string => (tier < 3 ? slopeForm(f, m1, c1) : std(f, a, b, d));
  const e2 = (f: F): string => (tier === 1 ? slopeForm(f, m2, c2) : std(f, a2, b2, d2));
  return {
    prompt: bi((f) => f.t(`Two lines are given by ${and(f, e1(f), e2(f))}. What is the x-coordinate of their point of intersection?`, `Deux droites ont pour équations ${and(f, e1(f), e2(f))}. Quelle est l'abscisse de leur point d'intersection ?`)),
    answer: x0, category: 'AP',
    wrong: wr(x0, [[y0, t('That is the y-coordinate. The question asks for x.', 'C\'est l\'ordonnée. La question demande l\'abscisse.'), 2], [-x0, t('A sign was lost when solving. Check by putting your x in both equations.', 'Un signe s\'est perdu en résolvant. Vérifie en remplaçant ton x dans les deux équations.'), 1], [x0 + y0, t('That adds the two coordinates.', 'Cela additionne les deux coordonnées.'), 2], [c2 - c1, t('That is the difference of the y-intercepts, not yet divided by the difference of the slopes.', 'C\'est la différence des ordonnées à l\'origine, pas encore divisée par la différence des pentes.'), 1]]),
    steps: [
      tier === 1 ? t('At the point of intersection both y values are equal, so set the two right sides equal.', 'Au point d\'intersection, les deux valeurs de y sont égales : pose les deux membres de droite égaux.') : t('Solve the system by substitution or elimination.', 'Résous le système par substitution ou par élimination.'),
      bi((f) => f.t(`This gives x = ${f.N(x0)}.`, `On obtient x = ${f.N(x0)}.`)),
      bi((f) => f.t(`The point is ${f.m(`(${f.n(x0)},\\ ${f.n(y0)})`)}.`, `Le point est ${f.m(`(${f.n(x0)},\\ ${f.n(y0)})`)}.`)),
    ],
    nudge: t('At the intersection both equations are true at once. Solve the system.', 'À l\'intersection, les deux équations sont vraies en même temps. Résous le système.'),
  };
});

// ── equations with fractions and formulas (MFM2P) ───────────────────────────────

export const fractionEqGen = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 2, 9), b = nonzero(r, -9, 9), x0 = a * randInt(r, 1, 7), c = x0 / a + b;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`\\frac{x}{${f.n(a)}} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`, `Résous ${f.m(`\\frac{x}{${f.n(a)}} ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))} = ${f.n(c)}`)}.`)),
      answer: x0, category: 'KU',
      wrong: wr(x0, [[c - b, t('That is the value of x divided by the denominator. Multiply both sides by it.', 'C\'est la valeur de x divisée par le dénominateur. Multiplie les deux membres par celui-ci.'), 1], [a * (c + b), t('The number added to the fraction must be subtracted from both sides, not added.', 'Le nombre ajouté à la fraction doit être soustrait des deux membres, pas additionné.'), 0], [(c - b) / a, t('Multiply by the denominator, do not divide.', 'Multiplie par le dénominateur, ne divise pas.'), 1]]),
      steps: [bi((f) => f.t(`Subtract ${f.N(b)} from both sides: ${f.m(`\\frac{x}{${f.n(a)}} = ${f.n(c - b)}`)}.`, `Soustrais ${f.N(b)} des deux membres : ${f.m(`\\frac{x}{${f.n(a)}} = ${f.n(c - b)}`)}.`)), bi((f) => f.t(`Multiply both sides by ${f.N(a)}: x = ${f.N(x0)}.`, `Multiplie les deux membres par ${f.N(a)} : x = ${f.N(x0)}.`))],
      nudge: t('Do the opposite operation to each side, starting with the number added to the fraction.', 'Fais l\'opération inverse sur chaque membre, en commençant par le nombre ajouté à la fraction.'),
    };
  }
  if (tier === 2) {
    let p = 1, q = 2;
    do { p = randInt(r, 1, 7); q = randInt(r, 2, 9); } while (gcd(p, q) !== 1);
    const x0 = q * randInt(r, 1, 6), c = (p * x0) / q;
    return {
      prompt: bi((f) => f.t(`Solve ${f.m(`\\frac{${f.n(p)}}{${f.n(q)}}x = ${f.n(c)}`)}.`, `Résous ${f.m(`\\frac{${f.n(p)}}{${f.n(q)}}x = ${f.n(c)}`)}.`)),
      answer: x0, category: 'KU',
      wrong: wr(x0, [[(c * p) / q, t('To undo multiplying by a fraction, multiply by its reciprocal (the fraction turned upside down).', 'Pour annuler la multiplication par une fraction, multiplie par son inverse (la fraction renversée).'), 0], [c - p / q, t('The fraction multiplies x, so use multiplication, not subtraction.', 'La fraction multiplie x : utilise la multiplication, pas la soustraction.'), 0], [c * q, t('Multiply by the denominator, then divide by the numerator.', 'Multiplie par le dénominateur, puis divise par le numérateur.'), 1]]),
      steps: [bi((f) => f.t(`Multiply both sides by the reciprocal ${f.m(`\\frac{${f.n(q)}}{${f.n(p)}}`)}.`, `Multiplie les deux membres par l'inverse ${f.m(`\\frac{${f.n(q)}}{${f.n(p)}}`)}.`)), bi((f) => f.t(`${f.m(`x = ${f.n(c)} \\times \\frac{${f.n(q)}}{${f.n(p)}}`)} = ${f.N(x0)}.`, `${f.m(`x = ${f.n(c)} \\times \\frac{${f.n(q)}}{${f.n(p)}}`)} = ${f.N(x0)}.`))],
      nudge: t('Multiply both sides by the reciprocal of the fraction.', 'Multiplie les deux membres par l\'inverse de la fraction.'),
    };
  }
  const a = pick(r, [2, 3, 4, 5]), b = pick(r, [2, 3, 4, 6]);
  const L = (a * b) / gcd(a, b), x0 = L * randInt(r, 1, 4), c = x0 / a + x0 / b;
  return {
    prompt: bi((f) => f.t(`Solve ${f.m(`\\frac{x}{${f.n(a)}} + \\frac{x}{${f.n(b)}} = ${f.n(c)}`)}.`, `Résous ${f.m(`\\frac{x}{${f.n(a)}} + \\frac{x}{${f.n(b)}} = ${f.n(c)}`)}.`)),
    answer: x0, category: 'KU',
    wrong: wr(x0, [[c * a * b, t('Multiplying by the product of the denominators gives a bigger equation: both sides must be multiplied, and then x is collected.', 'Multiplier par le produit des dénominateurs donne une équation plus grande : il faut multiplier les deux membres, puis regrouper x.'), 1], [c / 2, t('The two fractions have different denominators, so they are not simply halves.', 'Les deux fractions ont des dénominateurs différents : ce ne sont pas de simples moitiés.'), 0], [c - 1, t('Multiply every term by a common denominator to clear the fractions.', 'Multiplie chaque terme par un dénominateur commun pour éliminer les fractions.'), 0]]),
    steps: [bi((f) => f.t(`Multiply every term by the common denominator ${f.N(L)}: ${f.m(`${f.n(L / a)}x + ${f.n(L / b)}x = ${f.n(L * c)}`)}.`, `Multiplie chaque terme par le dénominateur commun ${f.N(L)} : ${f.m(`${f.n(L / a)}x + ${f.n(L / b)}x = ${f.n(L * c)}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(L / a + L / b)}x = ${f.n(L * c)}`)}, so x = ${f.N(x0)}.`, `${f.m(`${f.n(L / a + L / b)}x = ${f.n(L * c)}`)}, donc x = ${f.N(x0)}.`))],
    nudge: t('Multiply every term by a common denominator to clear the fractions, then collect x.', 'Multiplie chaque terme par un dénominateur commun pour éliminer les fractions, puis regroupe x.'),
  };
});

const FORMULAS: { en: string; fr: string; tex: string; solveFor: string; make: (r: () => number) => { given: [string, number][]; ans: number; step: (f: F) => string } }[] = [
  { en: 'distance', fr: 'distance', tex: 'd = vt', solveFor: 't', make: (r) => { const v = randInt(r, 3, 12), tt = randInt(r, 2, 9); return { given: [['d', v * tt], ['v', v]], ans: tt, step: (f) => `t = \\frac{d}{v} = \\frac{${f.n(v * tt)}}{${f.n(v)}}` }; } },
  { en: 'area of a rectangle', fr: 'aire d\'un rectangle', tex: 'A = lw', solveFor: 'w', make: (r) => { const l = randInt(r, 3, 12), w = randInt(r, 2, 9); return { given: [['A', l * w], ['l', l]], ans: w, step: (f) => `w = \\frac{A}{l} = \\frac{${f.n(l * w)}}{${f.n(l)}}` }; } },
  { en: 'perimeter of a rectangle', fr: 'périmètre d\'un rectangle', tex: 'P = 2l + 2w', solveFor: 'w', make: (r) => { const l = randInt(r, 4, 14), w = randInt(r, 2, 9); return { given: [['P', 2 * l + 2 * w], ['l', l]], ans: w, step: (f) => `w = \\frac{P - 2l}{2} = \\frac{${f.n(2 * l + 2 * w)} - ${f.n(2 * l)}}{2}` }; } },
  { en: 'area of a triangle', fr: 'aire d\'un triangle', tex: 'A = \\frac{bh}{2}', solveFor: 'h', make: (r) => { const b = randInt(r, 2, 10) * 2, h = randInt(r, 2, 9); return { given: [['A', (b * h) / 2], ['b', b]], ans: h, step: (f) => `h = \\frac{2A}{b} = \\frac{2(${f.n((b * h) / 2)})}{${f.n(b)}}` }; } },
  { en: 'speed after accelerating', fr: 'vitesse après accélération', tex: 'v = u + at', solveFor: 'a', make: (r) => { const u = randInt(r, 0, 8), a = randInt(r, 2, 6), tt = randInt(r, 2, 8); return { given: [['v', u + a * tt], ['u', u], ['t', tt]], ans: a, step: (f) => `a = \\frac{v - u}{t} = \\frac{${f.n(u + a * tt)} - ${f.n(u)}}{${f.n(tt)}}` }; } },
];
export const rearrangeGen = (id: string): Generator => numGen(id, (tier, r) => {
  const pool = tier === 1 ? FORMULAS.slice(0, 2) : tier === 2 ? FORMULAS.slice(2, 4) : [FORMULAS[2]!, FORMULAS[4]!];
  const F0 = pick(r, pool), d = F0.make(r);
  return {
    prompt: bi((f) => f.t(`The formula for ${F0.en} is ${f.m(F0.tex)}. Rearrange it to solve for ${f.m(F0.solveFor)}, then find ${f.m(F0.solveFor)} when ${d.given.map(([k, v]) => `${f.m(k)} = ${f.N(v)}`).join(', ')}.`, `La formule de ${F0.fr} est ${f.m(F0.tex)}. Isole ${f.m(F0.solveFor)}, puis trouve ${f.m(F0.solveFor)} quand ${d.given.map(([k, v]) => `${f.m(k)} = ${f.N(v)}`).join(', ')}.`)),
    answer: d.ans, category: 'AP',
    wrong: wr(d.ans, [[r6(d.given[0]![1] * d.given[1]![1]), t('The operation was not reversed. To get a variable out of a product, divide; out of a sum, subtract.', 'L\'opération n\'a pas été inversée. Pour dégager une variable d\'un produit, on divise ; d\'une somme, on soustrait.'), 0], [r6(d.given[0]![1] + d.given[1]![1]), t('Use the opposite operation of the one in the formula.', 'Utilise l\'opération inverse de celle de la formule.'), 0], [r6(d.given[1]![1] / d.given[0]![1]), t('The division was turned upside down. The larger quantity usually goes on top.', 'La division est à l\'envers. La plus grande quantité va généralement au numérateur.'), 1]]),
    steps: [bi((f) => f.t(`Rearrange: ${f.m(d.step(f).split('=')[0]!.trim() + ' = ' + d.step(f).split('=')[1]!.trim())}.`, `Isole : ${f.m(d.step(f).split('=')[0]!.trim() + ' = ' + d.step(f).split('=')[1]!.trim())}.`)), bi((f) => f.t(`Substitute the values: ${f.m(d.step(f))} = ${f.N(d.ans)}.`, `Remplace par les valeurs : ${f.m(d.step(f))} = ${f.N(d.ans)}.`))],
    nudge: t('Undo the operations in the formula one at a time, working backwards, then put in the numbers.', 'Annule les opérations de la formule une à la fois, en remontant, puis remplace par les nombres.'),
  };
});

// ── slope and the equation of a line (MFM2P) ────────────────────────────────────

export const slopeGen = (id: string): Generator => numGen(id, (tier, r) => {
  let x1 = 0, y1 = 0, run = 0, m = 0;
  do {
    run = randInt(r, 1, 6) * (tier === 3 ? 2 : 1); x1 = randInt(r, -5, 5); y1 = randInt(r, -5, 5);
    m = tier === 1 ? randInt(r, 1, 5) : tier === 2 ? nonzero(r, -5, 5) : pick(r, [0.5, 1.5, 2.5, -0.5, -1.5, -0.25, 0.75].filter((v) => Number.isInteger(v * run)));
  } while (m === 0 || !Number.isInteger(m * run));
  const x2 = x1 + run, y2 = y1 + m * run;
  return {
    prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(x1)},\\ ${f.n(y1)})`)} and ${f.m(`(${f.n(x2)},\\ ${f.n(y2)})`)}. What is its slope?`, `Une droite passe par ${f.m(`(${f.n(x1)},\\ ${f.n(y1)})`)} et ${f.m(`(${f.n(x2)},\\ ${f.n(y2)})`)}. Quelle est sa pente ?`)),
    answer: m, category: 'KU',
    wrong: wr(m, [[r6(run / (m * run)), t('That is run ÷ rise. Slope is rise ÷ run.', 'C\'est la course ÷ la montée. La pente est la montée ÷ la course.'), 1], [-m, t('The sign is wrong. Subtract the coordinates in the same order for y and x.', 'Le signe est faux. Soustrais les coordonnées dans le même ordre pour y et pour x.'), 1], [r6(y2 - y1), t('That is the rise only. Divide it by the run.', 'C\'est seulement la montée. Divise-la par la course.'), 1], [r6((y2 + y1) / (x2 + x1)), t('Subtract the coordinates; do not add them.', 'Soustrais les coordonnées ; ne les additionne pas.'), 0]]),
    steps: [bi((f) => f.t(`Rise = ${f.m(`${f.n(y2)} - ${y1 < 0 ? `(${f.n(y1)})` : f.n(y1)} = ${f.n(y2 - y1)}`)}. Run = ${f.m(`${f.n(x2)} - ${x1 < 0 ? `(${f.n(x1)})` : f.n(x1)} = ${f.n(run)}`)}.`, `Montée = ${f.m(`${f.n(y2)} - ${y1 < 0 ? `(${f.n(y1)})` : f.n(y1)} = ${f.n(y2 - y1)}`)}. Course = ${f.m(`${f.n(x2)} - ${x1 < 0 ? `(${f.n(x1)})` : f.n(x1)} = ${f.n(run)}`)}.`)), bi((f) => f.t(`Slope = rise ÷ run = ${f.m(`\\frac{${f.n(y2 - y1)}}{${f.n(run)}}`)} = ${f.N(m)}.`, `Pente = montée ÷ course = ${f.m(`\\frac{${f.n(y2 - y1)}}{${f.n(run)}}`)} = ${f.N(m)}.`))],
    nudge: t('Slope is rise ÷ run: the change in y divided by the change in x.', 'La pente est la montée ÷ la course : la variation de y divisée par la variation de x.'),
  };
});

const CONTEXTS: { en: string; fr: string; unitEn: string; unitFr: string; fixedEn: string; fixedFr: string; rateEn: string; rateFr: string; tot: string; totFr: string }[] = [
  { en: 'A plumber charges', fr: 'Un plombier facture', unitEn: 'hour', unitFr: 'heure', fixedEn: 'the fixed call-out fee', fixedFr: 'les frais de déplacement fixes', rateEn: 'the charge for each hour', rateFr: 'le tarif pour chaque heure', tot: 'the total cost of one hour of work', totFr: 'le coût total d\'une heure de travail' },
  { en: 'A taxi charges', fr: 'Un taxi facture', unitEn: 'kilometre', unitFr: 'kilomètre', fixedEn: 'the starting charge', fixedFr: 'les frais de départ', rateEn: 'the cost for each kilometre', rateFr: 'le coût pour chaque kilomètre', tot: 'the cost of a one-kilometre trip', totFr: 'le coût d\'un trajet d\'un kilomètre' },
  { en: 'A phone plan costs', fr: 'Un forfait de téléphone coûte', unitEn: 'gigabyte', unitFr: 'gigaoctet', fixedEn: 'the monthly base fee', fixedFr: 'les frais de base mensuels', rateEn: 'the price of each gigabyte used', rateFr: 'le prix de chaque gigaoctet utilisé', tot: 'the cost for one gigabyte', totFr: 'le coût pour un gigaoctet' },
];
export const meaningGen = (id: string): Generator => choiceGen(id, (tier, r) => {
  const c = pick(r, CONTEXTS), m = randInt(r, 3, 15), b = randInt(r, 10, 90);
  const askB = tier === 1 ? true : tier === 2 ? false : r() < 0.5;
  const fixed = [c.fixedEn, c.fixedFr] as const, rate = [c.rateEn, c.rateFr] as const;
  const ans: Text = askB ? { en: fixed[0], fr: fixed[1] } : { en: rate[0], fr: rate[1] };
  const other: Text = askB ? { en: rate[0], fr: rate[1] } : { en: fixed[0], fr: fixed[1] };
  const m2 = mc(r, ans, [
    [other, askB ? t('That is the slope m, the amount that changes with each unit. The y-intercept b is the amount at zero.', 'C\'est la pente m, le montant qui change à chaque unité. L\'ordonnée à l\'origine b est le montant à zéro.') : t('That is the y-intercept b, the amount when the number of units is zero. The slope m is the change for each unit.', 'C\'est l\'ordonnée à l\'origine b, le montant quand le nombre d\'unités est zéro. La pente m est la variation par unité.')],
    [{ en: c.tot, fr: c.totFr }, t('The total for one unit would be m + b, not just one of them.', 'Le total pour une unité serait m + b, pas seulement l\'un des deux.')],
    [{ en: `the number of ${c.unitEn}s`, fr: `le nombre de ${c.unitFr}s` }, t('The number of units is x, the variable, not a number in the equation.', 'Le nombre d\'unités est x, la variable, pas un nombre de l\'équation.')],
  ]);
  return {
    prompt: bi((f) => f.t(`${c.en} ${f.m(`C = ${f.n(m)}n + ${f.n(b)}`)} dollars for n ${c.unitEn}s. What does ${f.N(askB ? b : m)} represent?`, `${c.fr} ${f.m(`C = ${f.n(m)}n + ${f.n(b)}`)} dollars pour n ${c.unitFr}s. Que représente ${f.N(askB ? b : m)} ?`)),
    options: m2.options, correct: m2.correct, why: m2.why, category: 'AP',
    steps: [t('In y = mx + b, the slope m is the change for each unit and b is the starting amount.', 'Dans y = mx + b, la pente m est la variation par unité et b est le montant de départ.'), bi((f) => f.t(`${f.N(askB ? b : m)} is ${askB ? c.fixedEn : c.rateEn}.`, `${f.N(askB ? b : m)} représente ${askB ? c.fixedFr : c.rateFr}.`))],
    nudge: t('The number multiplied by n changes with each unit. The number added on is paid once.', 'Le nombre multiplié par n varie à chaque unité. Le nombre ajouté est payé une seule fois.'),
  };
});

export const lineEquationGen = (id: string): Generator => {
  const special = choiceGen(id, (_tier, r) => {
    const a = randInt(r, -6, 6);
    let b = randInt(r, -6, 6);
    while (b === a) b = randInt(r, -6, 6);
    const horizontal = r() < 0.5;
    const [px, py] = horizontal ? [a, b] : [b, a];
    const [qx, qy] = horizontal ? [a + randInt(r, 1, 5), b] : [b, a + randInt(r, 1, 5)];
    const right = horizontal ? `y = ${b}` : `x = ${b}`;
    const eqs = [`y = ${b}`, `x = ${b}`, `y = ${a}`, `x = ${a}`];
    const m = mc(r, bi((f) => f.m(right.replace(/-?\d+/, (n) => f.n(Number(n))))), eqs.filter((e) => e !== right).slice(0, 3).map((e): [Text, Text] => [bi((f) => f.m(e.replace(/-?\d+/, (n) => f.n(Number(n))))), t('Check the two points: which coordinate stays the same? A horizontal line is y = (that number); a vertical line is x = (that number).', 'Vérifie les deux points : quelle coordonnée reste la même ? Une droite horizontale est y = (ce nombre) ; une droite verticale est x = (ce nombre).')]));
    return {
      prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(px)},\\ ${f.n(py)})`)} and ${f.m(`(${f.n(qx)},\\ ${f.n(qy)})`)}. What is its equation?`, `Une droite passe par ${f.m(`(${f.n(px)},\\ ${f.n(py)})`)} et ${f.m(`(${f.n(qx)},\\ ${f.n(qy)})`)}. Quelle est son équation ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [horizontal ? t('The y-coordinates are the same, so the line is horizontal.', 'Les ordonnées sont égales : la droite est horizontale.') : t('The x-coordinates are the same, so the line is vertical.', 'Les abscisses sont égales : la droite est verticale.'), bi((f) => f.t(`Every point has ${horizontal ? 'y' : 'x'} = ${f.N(b)}, so the equation is ${f.m(right.replace(/-?\d+/, (n) => f.n(Number(n))))}.`, `Chaque point a ${horizontal ? 'y' : 'x'} = ${f.N(b)} : l'équation est ${f.m(right.replace(/-?\d+/, (n) => f.n(Number(n))))}.`))],
      nudge: t('Which coordinate is the same for both points?', 'Quelle coordonnée est la même pour les deux points ?'),
    };
  });
  const interceptNum = numGen(id, (_tier, r) => {
    const m = nonzero(r, -5, 5), b = nonzero(r, -9, 9), x1 = randInt(r, 1, 5), x2 = x1 + randInt(r, 1, 4);
    return {
      prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} and ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. What is its y-intercept?`, `Une droite passe par ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} et ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. Quelle est son ordonnée à l'origine ?`)),
      answer: b, category: 'AP',
      wrong: wr(b, [[m, t('That is the slope. The y-intercept is the value of y when x = 0.', 'C\'est la pente. L\'ordonnée à l\'origine est la valeur de y quand x = 0.'), 1], [m * x1 + b, t('That is the y-value of the first point, not the value at x = 0.', 'C\'est l\'ordonnée du premier point, pas la valeur à x = 0.'), 1], [m * x1 - b, t('A sign slipped when subtracting m × x from y.', 'Un signe a glissé en soustrayant m × x de y.'), 1], [-b, t('The sign is wrong. Use b = y − mx.', 'Le signe est faux. Utilise b = y − mx.'), 1]]),
      steps: [bi((f) => f.t(`Slope = ${f.m(`\\frac{${f.n(m * (x2 - x1))}}{${f.n(x2 - x1)}}`)} = ${f.N(m)}.`, `Pente = ${f.m(`\\frac{${f.n(m * (x2 - x1))}}{${f.n(x2 - x1)}}`)} = ${f.N(m)}.`)), bi((f) => f.t(`${f.m('b = y - mx')} = ${f.N(m * x1 + b)} − (${f.N(m)})(${f.N(x1)}) = ${f.N(b)}.`, `${f.m('b = y - mx')} = ${f.N(m * x1 + b)} − (${f.N(m)})(${f.N(x1)}) = ${f.N(b)}.`))],
      nudge: t('Find the slope first. Then put one point into y = mx + b and solve for b.', 'Trouve d\'abord la pente. Puis remplace un point dans y = mx + b et résous pour b.'),
    };
  });
  const fullEquation = choiceGen(id, (_tier, r) => {
    const m = nonzero(r, -5, 5), b = nonzero(r, -9, 9), x1 = randInt(r, 1, 5), x2 = x1 + randInt(r, 1, 4);
    const eq = (f: F, mm: number, bb: number): string => `y = ${poly(f, [[mm, 'x'], [bb, '']])}`;
    const cand: [number, number, Text][] = [
      [b, m, t('The slope and the y-intercept are swapped.', 'La pente et l\'ordonnée à l\'origine sont échangées.')],
      [m, -b, t('The sign of the y-intercept is wrong. Check by putting a point in the equation.', 'Le signe de l\'ordonnée à l\'origine est faux. Vérifie en remplaçant un point dans l\'équation.')],
      [-m, b, t('The sign of the slope is wrong. Rise ÷ run: subtract in the same order.', 'Le signe de la pente est faux. Montée ÷ course : soustrais dans le même ordre.')],
      [m, b + m, t('The y-intercept was worked out wrongly. Use b = y − mx with one of the points.', 'L\'ordonnée à l\'origine a été mal calculée. Utilise b = y − mx avec l\'un des points.')],
    ];
    const right = bi((f) => f.m(eq(f, m, b)));
    const seen = new Set([right.en]), wrongs: [Text, Text][] = [];
    for (const [mm, bb, why] of cand) { const o = bi((f) => f.m(eq(f, mm, bb))); if (!seen.has(o.en)) { seen.add(o.en); wrongs.push([o, why]); } }
    const mx = mc(r, right, wrongs.slice(0, 3).map(([o, w]) => [o, w] as [Text, Text]));
    return {
      prompt: bi((f) => f.t(`A line passes through ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} and ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. Which is its equation?`, `Une droite passe par ${f.m(`(${f.n(x1)},\\ ${f.n(m * x1 + b)})`)} et ${f.m(`(${f.n(x2)},\\ ${f.n(m * x2 + b)})`)}. Laquelle est son équation ?`)),
      options: mx.options, correct: mx.correct, why: mx.why, category: 'AP',
      steps: [bi((f) => f.t(`Slope m = ${f.N(m)}. Then ${f.m('b = y - mx')} = ${f.N(b)}.`, `Pente m = ${f.N(m)}. Puis ${f.m('b = y - mx')} = ${f.N(b)}.`)), bi((f) => f.t(`The equation is ${f.m(eq(f, m, b))}.`, `L'équation est ${f.m(eq(f, m, b))}.`))],
      nudge: t('Find the slope, then the y-intercept, then write y = mx + b.', 'Trouve la pente, puis l\'ordonnée à l\'origine, puis écris y = mx + b.'),
    };
  });
  return tierGen(special, interceptNum, fullEquation);
};
