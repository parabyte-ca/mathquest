// Grade 11 (MCR3U) Characteristics of Functions: function notation and domain, inverses, transformations of a point, quadratics
// (intersections, maximum and minimum values) and simplifying radical and rational expressions. Asked in words and numbers.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';
import { lin, poly, quad } from './algebra10.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const par = (x: number): string => (x < 0 ? `(${x})` : String(x));

/** MCR3U.A1: function notation, evaluating and solving */
export const notation11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nonzero(r, -3, 4), c = randInt(r, -8, 9);
  let b = nonzero(r, -6, 6);
  if (tier === 3) b = -a * randInt(r, -4, 6); // the two x-values with the same output then add up to a whole number
  const fx = (x: number): number => a * x * x + b * x + c;
  if (tier === 1) {
    const x0 = nonzero(r, -4, 5), ans = fx(x0);
    return {
      prompt: bi((f) => f.t(`If ${f.m(`f(x) = ${quad(f, a, b, c)}`)}, what is ${f.m(`f(${f.n(x0)})`)}?`, `Si ${f.m(`f(x) = ${quad(f, a, b, c)}`)}, que vaut ${f.m(`f(${f.n(x0)})`)} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[a * x0 * x0 + b * x0 + c + 2 * b * x0, t('Replace every x by the number, and keep the signs. A negative number must be put in brackets before squaring.', 'Remplace chaque x par le nombre en gardant les signes. Un nombre négatif doit être mis entre parenthèses avant d\'être mis au carré.'), 0], [fx(-x0), t('f(x0) means put x0 in place of x. It does not mean the opposite number.', 'f(x0) signifie qu\'on remplace x par x0, pas par son opposé.'), 0], [(a * x0 + b) * x0 + c + a * x0, t('Square the number first, then multiply by the coefficient.', 'Élève d\'abord le nombre au carré, puis multiplie par le coefficient.'), 0]]),
      steps: [bi((f) => f.t(`Put ${f.N(x0)} in place of x: ${f.m(`${f.n(a)}(${f.n(x0)})^{2} + ${f.n(b)}(${f.n(x0)}) + ${f.n(c)}`)}.`, `Remplace x par ${f.N(x0)} : ${f.m(`${f.n(a)}(${f.n(x0)})^{2} + ${f.n(b)}(${f.n(x0)}) + ${f.n(c)}`)}.`)), bi((f) => f.t(`This equals ${f.N(ans)}.`, `Cela vaut ${f.N(ans)}.`))],
      nudge: t('f(a) means: put a in place of x everywhere in the rule.', 'f(a) signifie : remplace x par a partout dans la règle.'),
    };
  }
  if (tier === 2) {
    const m = nonzero(r, -4, 5), p = nonzero(r, -5, 5), x0 = randInt(r, -3, 4), ans = m * (x0 + p) + p;
    return {
      prompt: bi((f) => f.t(`If ${f.m(`f(x) = ${lin(f, m, p)}`)}, what is ${f.m(`f(${f.n(x0)} + ${par(p)})`)}? Work it out with the rule.`, `Si ${f.m(`f(x) = ${lin(f, m, p)}`)}, que vaut ${f.m(`f(${f.n(x0)} + ${par(p)})`)} ? Calcule avec la règle.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[m * x0 + p, t('The input is the whole value x0 + p, not just x0.', 'L\'entrée est toute la valeur x0 + p, pas seulement x0.'), 0], [m * (x0 + p) - p, t('Add the constant after multiplying: f(x) = mx + p.', 'Ajoute la constante après la multiplication : f(x) = mx + p.'), 1], [m * x0 + p + p, t('The coefficient multiplies the whole input, including p.', 'Le coefficient multiplie toute l\'entrée, y compris p.'), 1]]),
      steps: [bi((f) => f.t(`The input is ${f.m(`${f.n(x0)} + ${par(p)}`)} = ${f.N(x0 + p)}.`, `L'entrée est ${f.m(`${f.n(x0)} + ${par(p)}`)} = ${f.N(x0 + p)}.`)), bi((f) => f.t(`${f.m(`f(${f.n(x0 + p)}) = ${f.n(m)}(${f.n(x0 + p)}) + ${par(p)}`)} = ${f.N(ans)}.`, `${f.m(`f(${f.n(x0 + p)}) = ${f.n(m)}(${f.n(x0 + p)}) + ${par(p)}`)} = ${f.N(ans)}.`))],
      nudge: t('Work out the input first, then put it in the rule.', 'Calcule d\'abord l\'entrée, puis remplace-la dans la règle.'),
    };
  }
  let x0 = nonzero(r, -4, 5);
  if (-(b / a) - x0 === x0) x0 += 1; // the two x-values must be different
  const k = fx(x0);
  const other = -(b / a) - x0;
  const ints = Number.isInteger(other);
  const larger = ints ? Math.max(x0, other) : x0;
  return {
    prompt: bi((f) => f.t(`If ${f.m(`f(x) = ${quad(f, a, b, c)}`)}, then ${f.m(`f(${f.n(x0)}) = ${f.n(k)}`)}. ${ints ? 'There is one other x with the same output. What is the larger of the two values of x?' : 'What is f(x) when x is 0?'}`, `Si ${f.m(`f(x) = ${quad(f, a, b, c)}`)}, alors ${f.m(`f(${f.n(x0)}) = ${f.n(k)}`)}. ${ints ? 'Un autre x a la même valeur de sortie. Quelle est la plus grande des deux valeurs de x ?' : 'Que vaut f(x) quand x vaut 0 ?'}`)),
    answer: ints ? larger : c, category: 'AP',
    wrong: wr(ints ? larger : c, ints ? [[Math.min(x0, other), t('That is the smaller one. The question asks for the larger value of x.', 'C\'est la plus petite. La question demande la plus grande valeur de x.'), 1], [-larger, t('The sum of the two x-values is −b ÷ a. Use it to find the other value, then compare.', 'La somme des deux valeurs de x est −b ÷ a. Utilise-la pour trouver l\'autre valeur, puis compare.'), 1], [r6(-b / a), t('That is the sum of the two values, not the larger one.', 'C\'est la somme des deux valeurs, pas la plus grande.'), 1]] : [[k, t('That is the output at x0. At x = 0 only the constant term remains.', 'C\'est la sortie en x0. À x = 0, il ne reste que le terme constant.'), 0], [b, t('That is the coefficient of x. At x = 0 only the constant term remains.', 'C\'est le coefficient de x. À x = 0, il ne reste que le terme constant.'), 0], [a, t('That is the coefficient of x². At x = 0 only the constant term remains.', 'C\'est le coefficient de x². À x = 0, il ne reste que le terme constant.'), 0]]),
    steps: ints
      ? [bi((f) => f.t(`A parabola is symmetric, so the two x-values add up to ${f.m(`-b \\div a = ${f.n(r6(-b / a))}`)}.`, `Une parabole est symétrique : les deux valeurs de x ont pour somme ${f.m(`-b \\div a = ${f.n(r6(-b / a))}`)}.`)), bi((f) => f.t(`The other value is ${f.N(r6(other))}, so the larger is ${f.N(larger)}.`, `L'autre valeur est ${f.N(r6(other))} : la plus grande est ${f.N(larger)}.`))]
      : [t('At x = 0, every term with x disappears.', 'À x = 0, tous les termes en x disparaissent.'), bi((f) => f.t(`So f(0) = ${f.N(c)}.`, `Donc f(0) = ${f.N(c)}.`))],
    nudge: ints ? t('For a quadratic with the same output, the two inputs are symmetric about the axis, and add to −b ÷ a.', 'Pour un polynôme du second degré avec la même sortie, les deux entrées sont symétriques par rapport à l\'axe et ont pour somme −b ÷ a.') : t('Put 0 in the rule.', 'Remplace x par 0 dans la règle.'),
  };
});

/** MCR3U.A1: domain restrictions */
export const domain11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nonzero(r, -9, 9);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`For which value of x is ${f.m(`f(x) = \\frac{1}{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)} not defined?`, `Pour quelle valeur de x ${f.m(`f(x) = \\frac{1}{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)} n'est-elle pas définie ?`)),
      answer: a, category: 'KU',
      wrong: wr(a, [[-a, t('The denominator is zero when x equals the number that makes x − a = 0, so the sign is the opposite of what is written.', 'Le dénominateur est nul quand x vaut le nombre qui annule x − a : le signe est l\'opposé de celui écrit.'), 0], [0, t('Division is a problem only when the denominator is zero, and the denominator is not x.', 'La division pose problème seulement quand le dénominateur est nul, et le dénominateur n\'est pas x.'), 0], [1, t('The numerator being 1 is fine. Look for what makes the denominator zero.', 'Que le numérateur soit 1 ne pose pas de problème. Cherche ce qui annule le dénominateur.'), 0]]),
      steps: [t('A fraction is not defined when its denominator is zero.', 'Une fraction n\'est pas définie quand son dénominateur est nul.'), bi((f) => f.t(`${f.m(`x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))} = 0`)} gives x = ${f.N(a)}.`, `${f.m(`x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))} = 0`)} donne x = ${f.N(a)}.`))],
      nudge: t('Set the denominator equal to zero and solve.', 'Pose le dénominateur égal à zéro et résous.'),
    };
  }
  if (tier === 2) {
    const flip = r() < 0.5;
    return {
      prompt: bi((f) => flip
        ? f.t(`What is the largest whole number x in the domain of ${f.m(`f(x) = \\sqrt{${f.n(a)} - x}`)}?`, `Quel est le plus grand nombre entier x du domaine de ${f.m(`f(x) = \\sqrt{${f.n(a)} - x}`)} ?`)
        : f.t(`What is the smallest whole number x in the domain of ${f.m(`f(x) = \\sqrt{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)}?`, `Quel est le plus petit nombre entier x du domaine de ${f.m(`f(x) = \\sqrt{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)} ?`)),
      answer: a, category: 'KU',
      wrong: wr(a, [[-a, t('The expression under the square root must be 0 or more. Solve that inequality carefully, keeping the signs.', 'L\'expression sous la racine doit être 0 ou plus. Résous cette inégalité en gardant les signes.'), 0], [a + 1, t('The expression under the root can equal 0, so the boundary value itself is allowed.', 'L\'expression sous la racine peut valoir 0 : la valeur frontière elle-même est permise.'), 0], [a - 1, t('That value makes the expression under the root negative, which is not allowed.', 'Cette valeur rend l\'expression sous la racine négative, ce qui n\'est pas permis.'), 0]]),
      steps: [t('The expression under a square root must be 0 or more.', 'L\'expression sous une racine carrée doit être 0 ou plus.'), bi((f) => f.t(`That gives ${flip ? `x ≤ ${f.N(a)}` : `x ≥ ${f.N(a)}`}, so the answer is ${f.N(a)}.`, `Cela donne ${flip ? `x ≤ ${f.N(a)}` : `x ≥ ${f.N(a)}`} : la réponse est ${f.N(a)}.`))],
      nudge: t('Write "expression ≥ 0" and solve for x.', 'Écris « expression ≥ 0 » et résous pour x.'),
    };
  }
  const k = randInt(r, 2, 9), minus = r() < 0.6, ans = minus ? 2 : 0;
  return {
    prompt: bi((f) => f.t(`How many real numbers are not in the domain of ${f.m(`f(x) = \\frac{1}{x^{2} ${minus ? '-' : '+'} ${f.n(k * k)}}`)}?`, `Combien de nombres réels ne sont pas dans le domaine de ${f.m(`f(x) = \\frac{1}{x^{2} ${minus ? '-' : '+'} ${f.n(k * k)}}`)} ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[1, t('Check whether the denominator can be 0 for one value, two values or none.', 'Vérifie si le dénominateur peut valoir 0 pour une valeur, deux valeurs ou aucune.'), 1], [minus ? 0 : 2, t('Factor or solve x² = k² (or x² = −k²) to count the values that make the denominator 0.', 'Factorise ou résous x² = k² (ou x² = −k²) pour compter les valeurs qui annulent le dénominateur.'), 1], [3, t('A quadratic denominator is zero for at most two values.', 'Un dénominateur du second degré s\'annule pour au plus deux valeurs.'), 1]]),
    steps: [t('Find when the denominator is 0.', 'Trouve quand le dénominateur vaut 0.'), minus ? bi((f) => f.t(`${f.m(`x^{2} = ${f.n(k * k)}`)} has two solutions, ${f.N(k)} and ${f.N(-k)}.`, `${f.m(`x^{2} = ${f.n(k * k)}`)} a deux solutions, ${f.N(k)} et ${f.N(-k)}.`)) : bi((f) => f.t(`${f.m(`x^{2} = ${f.n(-k * k)}`)} has no real solution, since a square is never negative.`, `${f.m(`x^{2} = ${f.n(-k * k)}`)} n'a pas de solution réelle, puisqu'un carré n'est jamais négatif.`))],
    nudge: t('Solve "denominator = 0" and count the real solutions.', 'Résous « dénominateur = 0 » et compte les solutions réelles.'),
  };
});

/** MCR3U.A2: inverse of a function */
export const inverse11 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const b = nonzero(r, -9, 9), x = randInt(r, -5, 9), y = x + b;
    return {
      prompt: bi((f) => f.t(`If ${f.m(`f(x) = x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}, what is ${f.m(`f^{-1}(${f.n(y)})`)}?`, `Si ${f.m(`f(x) = x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))}`)}, que vaut ${f.m(`f^{-1}(${f.n(y)})`)} ?`)),
      answer: x, category: 'KU',
      wrong: wr(x, [[y + b, t('f⁻¹ undoes f. Since f adds b, the inverse takes b away.', 'f⁻¹ annule f. Comme f ajoute b, l\'inverse retire b.'), 0], [1 / y, t('f⁻¹ is the inverse function, not the reciprocal 1 ÷ f.', 'f⁻¹ est la fonction réciproque, pas l\'inverse multiplicatif 1 ÷ f.'), 0], [-x, t('Undo the operation: the input that gives y.', 'Annule l\'opération : l\'entrée qui donne y.'), 1]].map(([v, w, s]) => [r6(v as number), w as Text, s as number] as [number, Text, number])),
      steps: [t('f⁻¹(y) is the x for which f(x) = y.', 'f⁻¹(y) est le x pour lequel f(x) = y.'), bi((f) => f.t(`${f.m(`x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))} = ${f.n(y)}`)} gives x = ${f.N(x)}.`, `${f.m(`x ${b < 0 ? '-' : '+'} ${f.n(Math.abs(b))} = ${f.n(y)}`)} donne x = ${f.N(x)}.`))],
      nudge: t('Find the x that f turns into the given number.', 'Trouve le x que f transforme en le nombre donné.'),
    };
  }
  if (tier === 2) {
    const a = nonzero(r, -5, 6), b = nonzero(r, -9, 9), x = randInt(r, -5, 9), y = a * x + b;
    return {
      prompt: bi((f) => f.t(`If ${f.m(`f(x) = ${lin(f, a, b)}`)}, what is ${f.m(`f^{-1}(${f.n(y)})`)}?`, `Si ${f.m(`f(x) = ${lin(f, a, b)}`)}, que vaut ${f.m(`f^{-1}(${f.n(y)})`)} ?`)),
      answer: x, category: 'AP',
      wrong: wr(x, [[r6((y + b) / a), t('Undo the steps in reverse order: subtract the constant first, then divide.', 'Annule les étapes dans l\'ordre inverse : soustrais d\'abord la constante, puis divise.'), 0], [r6(a * y + b), t('That is f(y). The inverse undoes f: it takes y back to x.', 'C\'est f(y). L\'inverse annule f : il ramène y à x.'), 0], [r6(y / a - b), t('Subtract the constant before dividing by the coefficient.', 'Soustrais la constante avant de diviser par le coefficient.'), 0]]),
      steps: [bi((f) => f.t(`Solve ${f.m(`${lin(f, a, b)} = ${f.n(y)}`)}: subtract ${f.N(b)} to get ${f.m(`${f.n(a)}x = ${f.n(y - b)}`)}.`, `Résous ${f.m(`${lin(f, a, b)} = ${f.n(y)}`)} : soustrais ${f.N(b)} pour obtenir ${f.m(`${f.n(a)}x = ${f.n(y - b)}`)}.`)), bi((f) => f.t(`Divide by ${f.N(a)}: x = ${f.N(x)}.`, `Divise par ${f.N(a)} : x = ${f.N(x)}.`))],
      nudge: t('f⁻¹(y) is the x with f(x) = y. Solve that equation.', 'f⁻¹(y) est le x tel que f(x) = y. Résous cette équation.'),
    };
  }
  const k = nonzero(r, -9, 9), x = randInt(r, 0, 9), y = x * x + k;
  return {
    prompt: bi((f) => f.t(`The function ${f.m(`f(x) = x^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} is defined only for x ≥ 0. What is ${f.m(`f^{-1}(${f.n(y)})`)}?`, `La fonction ${f.m(`f(x) = x^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} n'est définie que pour x ≥ 0. Que vaut ${f.m(`f^{-1}(${f.n(y)})`)} ?`)),
    answer: x, category: 'AP',
    wrong: wr(x, [[-x, t('The domain is x ≥ 0, so the inverse gives the non-negative root.', 'Le domaine est x ≥ 0 : l\'inverse donne la racine non négative.'), 1], [y - k, t('That is x². Take the square root.', 'C\'est x². Prends la racine carrée.'), 0], [r6(Math.sqrt(Math.abs(y + k))), t('Subtract k to undo the addition, then take the square root.', 'Soustrais k pour annuler l\'addition, puis prends la racine carrée.'), 0]]),
    steps: [bi((f) => f.t(`Solve ${f.m(`x^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))} = ${f.n(y)}`)}: ${f.m(`x^{2} = ${f.n(y - k)}`)}.`, `Résous ${f.m(`x^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))} = ${f.n(y)}`)} : ${f.m(`x^{2} = ${f.n(y - k)}`)}.`)), bi((f) => f.t(`Since x ≥ 0, x = ${f.N(x)}.`, `Comme x ≥ 0, x = ${f.N(x)}.`))],
    nudge: t('Undo the addition, then undo the square. Only the non-negative root fits the domain.', 'Annule l\'addition, puis annule le carré. Seule la racine non négative convient au domaine.'),
  };
});

/** MCR3U.A3: transformations of a point on y = af(k(x − d)) + c */
export const transform11 = (id: string): Generator => numGen(id, (tier, r) => {
  const x = randInt(r, -6, 8), y = randInt(r, -6, 8);
  const a = tier === 1 ? pick(r, [2, 3, -1, -2]) : pick(r, [2, 3, -1, -2, 0.5]);
  const c = nonzero(r, -6, 6), k = tier === 1 ? 1 : pick(r, [2, 0.5, -1, 4, -2]), d = tier === 1 ? 0 : nonzero(r, -5, 5);
  const askX = tier > 1 && r() < 0.5;
  const nx = r6(x / k + d), ny = r6(a * y + c);
  const eq = (f: F): string => `y = ${f.n(a)}f(${k === 1 ? '' : f.n(k)}(x ${d < 0 ? '+' : '-'} ${f.n(Math.abs(d))}))${c < 0 ? ' - ' : ' + '}${f.n(Math.abs(c))}`.replace('(x - 0)', 'x');
  const base = tier === 1 ? (f: F): string => `y = ${a === -1 ? '-' : f.n(a)}f(x) ${c < 0 ? '-' : '+'} ${f.n(Math.abs(c))}` : eq;
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is on the graph of ${f.m('y = f(x)')}. The graph is transformed to ${f.m(base(f))}. What is the ${askX ? 'x' : 'y'}-coordinate of the image of this point?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} est sur le graphique de ${f.m('y = f(x)')}. Le graphique est transformé en ${f.m(base(f))}. Quelle est la coordonnée ${askX ? 'x' : 'y'} de l'image de ce point ?`)),
    answer: askX ? nx : ny, category: 'AP',
    wrong: wr(askX ? nx : ny, askX ? [[r6(x * k + d), t('k compresses horizontally by a factor of 1 ÷ k: divide the x-coordinate by k.', 'k comprime horizontalement d\'un facteur 1 ÷ k : divise l\'abscisse par k.'), 0], [r6(x / k - d), t('The shift is d units to the right when the bracket reads (x − d). Use the sign inside the bracket the opposite way.', 'Le déplacement est de d unités vers la droite quand la parenthèse indique (x − d). Utilise le signe dans la parenthèse à l\'envers.'), 1], [r6((x + d) / k), t('Apply the horizontal stretch or compression first, then the shift.', 'Applique d\'abord l\'étirement ou la compression horizontale, puis le déplacement.'), 0]] : [[r6(a * (y + c)), t('The vertical shift c is added after the stretch: ay + c.', 'Le déplacement vertical c s\'ajoute après l\'étirement : ay + c.'), 0], [r6(y + c), t('Do not forget the vertical stretch a: multiply the y-coordinate by a first.', 'N\'oublie pas l\'étirement vertical a : multiplie d\'abord l\'ordonnée par a.'), 0], [r6(a * y - c), t('The shift c is added, keeping its sign.', 'Le déplacement c s\'ajoute en gardant son signe.'), 0]]),
    steps: askX ? [bi((f) => f.t(`Divide x by k = ${f.N(k)}: ${f.N(r6(x / k))}.`, `Divise x par k = ${f.N(k)} : ${f.N(r6(x / k))}.`)), bi((f) => f.t(`Then shift by d = ${f.N(d)}: ${f.N(nx)}.`, `Puis déplace de d = ${f.N(d)} : ${f.N(nx)}.`))] : [bi((f) => f.t(`Multiply y by a = ${f.N(a)}: ${f.N(r6(a * y))}.`, `Multiplie y par a = ${f.N(a)} : ${f.N(r6(a * y))}.`)), bi((f) => f.t(`Then add c = ${f.N(c)}: ${f.N(ny)}.`, `Puis ajoute c = ${f.N(c)} : ${f.N(ny)}.`))],
    nudge: askX ? t('For x: divide by k, then shift by d.', 'Pour x : divise par k, puis déplace de d.') : t('For y: multiply by a, then add c.', 'Pour y : multiplie par a, puis ajoute c.'),
  };
});

// ── quadratics: intersections and extreme values ────────────────────────────────

export const lineParabola11 = (id: string): Generator => numGen(id, (tier, r) => {
  let p = 1, q = 2;
  do { p = nonzero(r, -6, 6); q = nonzero(r, -6, 6); } while (p === q);
  const m = nonzero(r, -4, 5), b0 = randInt(r, -6, 8), a = tier === 3 ? pick(r, [2, 3, -1]) : 1;
  // parabola y = a x² + B x + C, line y = m x + n, chosen so a x² + (B - m) x + (C - n) = a (x - p)(x - q)
  const B = -a * (p + q) + m, C = a * p * q + b0;
  const hi = Math.max(p, q);
  return {
    prompt: bi((f) => f.t(`A parabola ${f.m(`y = ${quad(f, a, B, C)}`)} meets the line ${f.m(`y = ${lin(f, m, b0)}`)} at two points. What is the larger x-coordinate of the two points of intersection?`, `La parabole ${f.m(`y = ${quad(f, a, B, C)}`)} rencontre la droite ${f.m(`y = ${lin(f, m, b0)}`)} en deux points. Quelle est la plus grande abscisse des deux points d'intersection ?`)),
    answer: hi, category: 'AP',
    wrong: wr(hi, [[Math.min(p, q), t('That is the smaller x-coordinate. The question asks for the larger.', 'C\'est la plus petite abscisse. La question demande la plus grande.'), 2], [-hi, t('A sign slipped when solving. Substitute your x into both equations to check they give the same y.', 'Un signe a glissé en résolvant. Remplace ton x dans les deux équations pour vérifier qu\'elles donnent le même y.'), 2], [p + q, t('That is the sum of the two x-values. Each factor gives one x-value.', 'C\'est la somme des deux valeurs de x. Chaque facteur donne une valeur de x.'), 2]]),
    steps: [t('At an intersection the two y-values are equal, so set the two expressions equal.', 'À une intersection, les deux valeurs de y sont égales : pose les deux expressions égales.'), bi((f) => f.t(`${f.m(`${quad(f, a, B - m, C - b0)} = 0`)}, which factors as ${f.m(`${a === 1 ? '' : f.n(a)}(x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))}) = 0`)}.`, `${f.m(`${quad(f, a, B - m, C - b0)} = 0`)}, qui se factorise en ${f.m(`${a === 1 ? '' : f.n(a)}(x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))}) = 0`)}.`)), bi((f) => f.t(`The x-coordinates are ${f.N(p)} and ${f.N(q)}. The larger is ${f.N(hi)}.`, `Les abscisses sont ${f.N(p)} et ${f.N(q)}. La plus grande est ${f.N(hi)}.`))],
    nudge: t('Set the two expressions for y equal, move everything to one side, and solve.', 'Pose les deux expressions de y égales, ramène tout d\'un côté et résous.'),
  };
});

export const extreme11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = tier === 1 ? pick(r, [-1, 1]) : nonzero(r, -3, 3), h = nonzero(r, -5, 6), k = randInt(r, -9, 12);
  const b = -2 * a * h, c = a * h * h + k;
  return {
    prompt: bi((f) => f.t(`What is the ${a > 0 ? 'minimum' : 'maximum'} value of ${f.m(`y = ${quad(f, a, b, c)}`)}?`, `Quelle est la valeur ${a > 0 ? 'minimale' : 'maximale'} de ${f.m(`y = ${quad(f, a, b, c)}`)} ?`)),
    answer: k, category: 'AP',
    wrong: wr(k, [[h, t('That is the x-value where the extreme happens. The question asks for the value of y.', 'C\'est la valeur de x où se produit l\'extremum. La question demande la valeur de y.'), 2], [c, t('That is the y-intercept (the value at x = 0), not the extreme value.', 'C\'est l\'ordonnée à l\'origine (la valeur à x = 0), pas la valeur extrême.'), 1], [r6(c - h * h), t('Subtract a × h², not just h².', 'Soustrais a × h², pas seulement h².'), 2]]),
    steps: [bi((f) => f.t(`The vertex is at ${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(h)}.`, `Le sommet est à ${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(h)}.`)), bi((f) => f.t(`Put x = ${f.N(h)} in the equation: y = ${f.N(k)}.`, `Remplace x = ${f.N(h)} dans l'équation : y = ${f.N(k)}.`)), bi((f) => f.t(`The ${a > 0 ? 'minimum' : 'maximum'} value is ${f.N(k)}.`, `La valeur ${a > 0 ? 'minimale' : 'maximale'} est ${f.N(k)}.`))],
    nudge: t('Find the x of the vertex (−b ÷ 2a), then put it back in the equation.', 'Trouve le x du sommet (−b ÷ 2a), puis remplace-le dans l\'équation.'),
  };
});

// ── radicals and rational expressions ───────────────────────────────────────────

export const radicals11 = (id: string): Generator => numGen(id, (tier, r) => {
  const sq = pick(r, [2, 3, 5, 6, 7]), k = tier === 1 ? randInt(r, 2, 6) : randInt(r, 3, 12);
  if (tier < 3) {
    return {
      prompt: bi((f) => f.t(`Simplify ${f.m(`\\sqrt{${f.n(k * k * sq)}}`)} to the form ${f.m(`a\\sqrt{${f.n(sq)}}`)}. What is a?`, `Simplifie ${f.m(`\\sqrt{${f.n(k * k * sq)}}`)} sous la forme ${f.m(`a\\sqrt{${f.n(sq)}}`)}. Que vaut a ?`)),
      answer: k, category: 'KU',
      wrong: wr(k, [[k * k, t('Take the square root of the perfect square factor: √(k²) = k, not k².', 'Prends la racine carrée du facteur carré parfait : √(k²) = k, pas k².'), 0], [k * sq, t('Only the perfect square comes out of the root. The other factor stays inside.', 'Seul le carré parfait sort de la racine. L\'autre facteur reste dedans.'), 0], [(k * k * sq) / 2, t('Split the number into a perfect square times the number under the root: √(ab) = √a × √b.', 'Sépare le nombre en un carré parfait fois le nombre sous la racine : √(ab) = √a × √b.'), 0]]),
      steps: [bi((f) => f.t(`${f.N(k * k * sq)} = ${f.m(`${f.n(k * k)} \\times ${f.n(sq)}`)}, and ${f.N(k * k)} is a perfect square.`, `${f.N(k * k * sq)} = ${f.m(`${f.n(k * k)} \\times ${f.n(sq)}`)} et ${f.N(k * k)} est un carré parfait.`)), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(k * k)}} \\times \\sqrt{${f.n(sq)}}`)} = ${f.m(`${f.n(k)}\\sqrt{${f.n(sq)}}`)}, so a = ${f.N(k)}.`, `${f.m(`\\sqrt{${f.n(k * k)}} \\times \\sqrt{${f.n(sq)}}`)} = ${f.m(`${f.n(k)}\\sqrt{${f.n(sq)}}`)}, donc a = ${f.N(k)}.`))],
      nudge: t('Find the largest perfect square that divides the number, and take its square root outside.', 'Trouve le plus grand carré parfait qui divise le nombre et sors sa racine carrée.'),
    };
  }
  const m = randInt(r, 2, 5);
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`${f.n(m)}\\sqrt{${f.n(k * k * sq)}} + \\sqrt{${f.n(sq)}}`)} to the form ${f.m(`a\\sqrt{${f.n(sq)}}`)}. What is a?`, `Simplifie ${f.m(`${f.n(m)}\\sqrt{${f.n(k * k * sq)}} + \\sqrt{${f.n(sq)}}`)} sous la forme ${f.m(`a\\sqrt{${f.n(sq)}}`)}. Que vaut a ?`)),
    answer: m * k + 1, category: 'AP',
    wrong: wr(m * k + 1, [[m * k, t('The second term is √' + String(sq) + ', which is 1 × √' + String(sq) + '. Add its coefficient 1.', 'Le second terme est √' + String(sq) + ', soit 1 × √' + String(sq) + '. Ajoute son coefficient 1.'), 1], [m + k + 1, t('The coefficient m multiplies the simplified root: m × k.', 'Le coefficient m multiplie la racine simplifiée : m × k.'), 1], [m * k * k + 1, t('√(k²) is k, not k².', '√(k²) vaut k, pas k².'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`\\sqrt{${f.n(k * k * sq)}} = ${f.n(k)}\\sqrt{${f.n(sq)}}`)}, so the first term is ${f.m(`${f.n(m * k)}\\sqrt{${f.n(sq)}}`)}.`, `${f.m(`\\sqrt{${f.n(k * k * sq)}} = ${f.n(k)}\\sqrt{${f.n(sq)}}`)} : le premier terme est donc ${f.m(`${f.n(m * k)}\\sqrt{${f.n(sq)}}`)}.`)), bi((f) => f.t(`Add the like radicals: ${f.m(`${f.n(m * k)}\\sqrt{${f.n(sq)}} + 1\\sqrt{${f.n(sq)}}`)}, so a = ${f.N(m * k + 1)}.`, `Additionne les radicaux semblables : ${f.m(`${f.n(m * k)}\\sqrt{${f.n(sq)}} + 1\\sqrt{${f.n(sq)}}`)} : a = ${f.N(m * k + 1)}.`))],
    nudge: t('Simplify the first radical so both terms have the same radical, then add the coefficients.', 'Simplifie le premier radical pour que les deux termes aient le même radical, puis additionne les coefficients.'),
  };
});

export const rational11 = (id: string): Generator => numGen(id, (tier, r) => {
  const a = nonzero(r, -8, 8), x0 = nonzero(r, -9, 9);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`Simplify ${f.m(`\\frac{x^{2} - ${f.n(a * a)}}{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)}. What is its value when x = ${f.N(x0)}? (Assume x is not the excluded value.)`, `Simplifie ${f.m(`\\frac{x^{2} - ${f.n(a * a)}}{x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))}}`)}. Quelle est sa valeur quand x = ${f.N(x0)} ? (Suppose que x n'est pas la valeur exclue.)`)),
      answer: x0 + a, category: 'AP',
      wrong: wr(x0 + a, [[x0 - a, t('x² − a² = (x − a)(x + a). Divide by the matching factor and keep the other.', 'x² − a² = (x − a)(x + a). Divise par le facteur correspondant et garde l\'autre.'), 1], [x0 * x0 - a * a, t('That is the numerator. Divide by the denominator, or simplify first.', 'C\'est le numérateur. Divise par le dénominateur ou simplifie d\'abord.'), 1], [-x0 - a, t('A sign slipped. After simplifying you get x + a.', 'Un signe a glissé. Après simplification, on obtient x + a.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`x^{2} - ${f.n(a * a)} = (x - ${par(a)})(x + ${par(a)})`)}, and the denominator is ${f.m(`x - ${par(a)}`)}.`, `${f.m(`x^{2} - ${f.n(a * a)} = (x - ${par(a)})(x + ${par(a)})`)} et le dénominateur est ${f.m(`x - ${par(a)}`)}.`)), bi((f) => f.t(`The expression simplifies to ${f.m(`x + ${par(a)}`)}, which is ${f.N(x0 + a)} when x = ${f.N(x0)}.`, `L'expression se simplifie en ${f.m(`x + ${par(a)}`)}, qui vaut ${f.N(x0 + a)} quand x = ${f.N(x0)}.`))],
      nudge: t('Factor the numerator as a difference of squares and cancel the common factor.', 'Factorise le numérateur comme une différence de carrés et simplifie le facteur commun.'),
    };
  }
  if (tier === 2) {
    const b = nonzero(r, -8, 8);
    const n = a === b ? a + 1 : b;
    return {
      prompt: bi((f) => f.t(`For ${f.m(`\\frac{x + 1}{(x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))})(x ${n < 0 ? '+' : '-'} ${f.n(Math.abs(n))})}`)}, what is the sum of all the values of x that are excluded?`, `Pour ${f.m(`\\frac{x + 1}{(x ${a < 0 ? '+' : '-'} ${f.n(Math.abs(a))})(x ${n < 0 ? '+' : '-'} ${f.n(Math.abs(n))})}`)}, quelle est la somme de toutes les valeurs de x exclues ?`)),
      answer: a + n, category: 'KU',
      wrong: wr(a + n, [[-(a + n), t('Each excluded value makes one factor zero: x − a = 0 gives x = a, so the sign is the opposite of the number written in the bracket.', 'Chaque valeur exclue annule un facteur : x − a = 0 donne x = a, donc le signe est l\'opposé du nombre écrit dans la parenthèse.'), 1], [a * n, t('Add the excluded values; do not multiply.', 'Additionne les valeurs exclues ; ne les multiplie pas.'), 1], [a + n - 1, t('The numerator does not matter for exclusions. Only the denominator can be zero.', 'Le numérateur n\'a pas d\'importance pour les exclusions. Seul le dénominateur peut être nul.'), 1]]),
      steps: [t('Exclude every x that makes the denominator 0.', 'Exclus chaque x qui annule le dénominateur.'), bi((f) => f.t(`The excluded values are ${f.N(a)} and ${f.N(n)}, and their sum is ${f.N(a + n)}.`, `Les valeurs exclues sont ${f.N(a)} et ${f.N(n)}, et leur somme est ${f.N(a + n)}.`))],
      nudge: t('Set each factor of the denominator equal to zero.', 'Pose chaque facteur du dénominateur égal à zéro.'),
    };
  }
  const p = nonzero(r, -6, 6), q = nonzero(r, -6, 6);
  return {
    prompt: bi((f) => f.t(`Simplify ${f.m(`\\frac{${quad(f, 1, p + q, p * q)}}{x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))}}`)}. It becomes ${f.m(`x + c`)}. What is c?`, `Simplifie ${f.m(`\\frac{${quad(f, 1, p + q, p * q)}}{x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))}}`)}. Elle devient ${f.m(`x + c`)}. Que vaut c ?`)),
    answer: q, category: 'AP',
    wrong: wr(q, [[-q, t('Factor the numerator as (x + p)(x + q). The leftover factor has the same sign as q.', 'Factorise le numérateur en (x + p)(x + q). Le facteur restant a le même signe que q.'), 1], [p, t('That is the factor you cancelled. The leftover factor is the other one.', 'C\'est le facteur que tu as simplifié. Le facteur restant est l\'autre.'), 1], [p * q, t('That is the product of p and q, not one of them.', 'C\'est le produit de p et q, pas l\'un d\'eux.'), 1]]),
    steps: [bi((f) => f.t(`Factor the numerator: it is ${f.m(`(x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))})(x ${q < 0 ? '-' : '+'} ${f.n(Math.abs(q))})`)}.`, `Factorise le numérateur : c'est ${f.m(`(x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))})(x ${q < 0 ? '-' : '+'} ${f.n(Math.abs(q))})`)}.`)), bi((f) => f.t(`Cancel ${f.m(`x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))}`)}: what is left is ${f.m(`x ${q < 0 ? '-' : '+'} ${f.n(Math.abs(q))}`)}, so c = ${f.N(q)}.`, `Simplifie ${f.m(`x ${p < 0 ? '-' : '+'} ${f.n(Math.abs(p))}`)} : il reste ${f.m(`x ${q < 0 ? '-' : '+'} ${f.n(Math.abs(q))}`)}, donc c = ${f.N(q)}.`))],
    nudge: t('Factor the numerator and cancel the factor that matches the denominator.', 'Factorise le numérateur et simplifie le facteur qui correspond au dénominateur.'),
  };
});

void poly; void tierGen;
