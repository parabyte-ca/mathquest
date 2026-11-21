// Grade 10 parabolas (MPM2D A1, A2, A4 and MFM2P C2): second differences, vertex form, opening and width, the equation from a vertex
// and a point, maximum and minimum values, projectiles, and reading features from the three forms of a quadratic.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, type F } from './dsl.js';
import { t } from './kit.js';
import { poly, quad } from './algebra10.js';

const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
/** a(x − h)² + k as TeX, with the sign of h written as a sign inside the bracket. */
const vform = (f: F, a: number, h: number, k: number): string => `${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2}${k === 0 ? '' : k > 0 ? ` + ${f.n(k)}` : ` - ${f.n(-k)}`}`;
const list = (f: F, xs: (number | string)[]): string => xs.map((x) => (typeof x === 'number' ? f.n(x) : x)).join(',\\ ');

// ── second differences ──────────────────────────────────────────────────────────

export const secondDifferenceGen = (id: string): Generator => numGen(id, (tier, r) => {
  const a = tier === 1 ? randInt(r, 1, 4) : nonzero(r, -4, 4), b = randInt(r, -5, 6), c = randInt(r, -6, 9);
  const ys = [0, 1, 2, 3, 4, 5].map((x) => a * x * x + b * x + c);
  const sd = 2 * a;
  if (tier === 3) {
    const miss = randInt(r, 1, 4);
    const shown = ys.map((y, i) => (i === miss ? '?' : y));
    return {
      prompt: bi((f) => f.t(`A quadratic relation has these y-values for x = 0, 1, 2, 3, 4, 5: ${f.m(list(f, shown))}. Find the missing value.`, `Une relation quadratique a ces valeurs de y pour x = 0, 1, 2, 3, 4, 5 : ${f.m(list(f, shown))}. Trouve la valeur manquante.`)),
      answer: ys[miss]!, category: 'AP',
      wrong: wr(ys[miss]!, [[(ys[miss - 1]! + ys[miss + 1]!) / 2, t('That is the average of the neighbours. In a quadratic the first differences change, so the middle value is not halfway.', 'C\'est la moyenne des voisins. Dans une relation quadratique, les premières différences changent : la valeur du milieu n\'est pas à mi-chemin.'), 1], [ys[miss]! + sd, t('The second difference was added one step too many. Check the first differences on both sides.', 'La seconde différence a été ajoutée une fois de trop. Vérifie les premières différences de chaque côté.'), 1], [ys[miss]! - sd, t('The second difference was taken away one step too many.', 'La seconde différence a été retirée une fois de trop.'), 1]]),
      steps: [t('Use the known values to find the constant second difference.', 'Utilise les valeurs connues pour trouver la seconde différence constante.'), bi((f) => f.t(`The second difference is ${f.N(sd)}. The first differences grow by ${f.N(sd)} each time.`, `La seconde différence est ${f.N(sd)}. Les premières différences augmentent de ${f.N(sd)} chaque fois.`)), bi((f) => f.t(`The missing value is ${f.N(ys[miss]!)}.`, `La valeur manquante est ${f.N(ys[miss]!)}.`))],
      nudge: t('Find the first differences you can, then see how they change.', 'Trouve les premières différences possibles, puis regarde comment elles changent.'),
    };
  }
  const shown = ys.slice(0, 5);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A relation has y-values ${f.m(list(f, shown))} for x = 0, 1, 2, 3, 4. What is its constant second difference?`, `Une relation a pour valeurs de y ${f.m(list(f, shown))} pour x = 0, 1, 2, 3, 4. Quelle est sa seconde différence constante ?`)),
      answer: sd, category: 'KU',
      wrong: wr(sd, [[ys[1]! - ys[0]!, t('That is the first difference. The second difference is the change in the first differences.', 'C\'est la première différence. La seconde différence est la variation des premières différences.'), 1], [a, t('The second difference of ax² + bx + c is 2a. Work it out from the table.', 'La seconde différence de ax² + bx + c est 2a. Calcule-la à partir du tableau.'), 1], [-sd, t('Subtract each first difference from the one after it, in that order.', 'Soustrais chaque première différence de la suivante, dans cet ordre.'), 1]]),
      steps: [bi((f) => f.t(`First differences: ${f.m(list(f, shown.slice(1).map((y, i) => y - shown[i]!)))}.`, `Premières différences : ${f.m(list(f, shown.slice(1).map((y, i) => y - shown[i]!)))}.`)), bi((f) => f.t(`These change by ${f.N(sd)} each time, so the second difference is ${f.N(sd)}.`, `Elles varient de ${f.N(sd)} chaque fois : la seconde différence est ${f.N(sd)}.`))],
      nudge: t('Subtract neighbouring y-values to get the first differences, then subtract those.', 'Soustrais les valeurs de y voisines pour obtenir les premières différences, puis soustrais celles-ci.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`A quadratic relation has y-values ${f.m(list(f, shown))} for x = 0, 1, 2, 3, 4. What is y when x = 5?`, `Une relation quadratique a pour valeurs de y ${f.m(list(f, shown))} pour x = 0, 1, 2, 3, 4. Que vaut y quand x = 5 ?`)),
    answer: ys[5]!, category: 'AP',
    wrong: wr(ys[5]!, [[ys[4]! + (ys[4]! - ys[3]!), t('That continues the last first difference. In a quadratic the first differences keep changing by the second difference.', 'Cela prolonge la dernière première différence. Dans une relation quadratique, les premières différences continuent de varier de la seconde différence.'), 1], [ys[4]! + (ys[4]! - ys[3]!) - sd, t('The second difference was taken away instead of added.', 'La seconde différence a été retirée au lieu d\'être ajoutée.'), 1], [ys[4]! + sd, t('The second difference is the change in the first difference, not the next first difference itself.', 'La seconde différence est la variation de la première différence, pas la prochaine première différence.'), 1]]),
    steps: [bi((f) => f.t(`First differences: ${f.m(list(f, shown.slice(1).map((y, i) => y - shown[i]!)))}. Second difference: ${f.N(sd)}.`, `Premières différences : ${f.m(list(f, shown.slice(1).map((y, i) => y - shown[i]!)))}. Seconde différence : ${f.N(sd)}.`)), bi((f) => f.t(`The next first difference is ${f.N(ys[4]! - ys[3]! + sd)}, so y = ${f.N(ys[4]!)} + (${f.N(ys[4]! - ys[3]! + sd)}) = ${f.N(ys[5]!)}.`, `La prochaine première différence est ${f.N(ys[4]! - ys[3]! + sd)} : y = ${f.N(ys[4]!)} + (${f.N(ys[4]! - ys[3]! + sd)}) = ${f.N(ys[5]!)}.`))],
    nudge: t('Extend the first differences using the constant second difference, then add.', 'Prolonge les premières différences avec la seconde différence constante, puis additionne.'),
  };
});

// ── vertex form ─────────────────────────────────────────────────────────────────

export const vertexXGen = (id: string): Generator => numGen(id, (tier, r) => {
  const a = tier === 1 ? 1 : nonzero(r, -4, 4), h = tier === 3 ? -nonzero(r, -8, 8) : randInt(r, 1, 9) * pick(r, [1, -1]), k = nonzero(r, -9, 9);
  const eq = (f: F): string => `y = ${vform(f, a, h, k)}`;
  return {
    prompt: bi((f) => f.t(`What is the x-coordinate of the vertex of ${f.m(eq(f))}?`, `Quelle est l'abscisse du sommet de ${f.m(eq(f))} ?`)),
    answer: h, category: 'KU',
    wrong: wr(h, [[-h, t('The bracket is (x − h), so the sign is the opposite of what is written: (x − 3) means h = 3, and (x + 3) means h = −3.', 'La parenthèse est (x − h), donc le signe est l\'opposé de celui écrit : (x − 3) signifie h = 3, et (x + 3) signifie h = −3.'), 0], [k, t('That is k, the y-coordinate of the vertex.', 'C\'est k, l\'ordonnée du sommet.'), 0], [a, t('That is a, which gives the direction and width.', 'C\'est a, qui donne l\'ouverture et la largeur.'), 0]]),
    steps: [t('In y = a(x − h)² + k the vertex is (h, k).', 'Dans y = a(x − h)² + k, le sommet est (h, k).'), bi((f) => f.t(`${f.m(`(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})`)} means h = ${f.N(h)}, so the x-coordinate is ${f.N(h)}.`, `${f.m(`(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})`)} signifie h = ${f.N(h)} : l'abscisse est ${f.N(h)}.`))],
    nudge: t('Compare with a(x − h)² + k. The sign inside the bracket is the opposite of h.', 'Compare avec a(x − h)² + k. Le signe dans la parenthèse est l\'opposé de h.'),
  };
});

export const openingGen = (id: string): Generator => choiceGen(id, (tier, r) => {
  const mag = tier === 1 ? pick(r, [1, 2, 3]) : pick(r, [0.5, 0.25, 2, 3, 4]), sign = pick(r, [1, -1]), a = mag * sign, h = nonzero(r, -6, 6), k = nonzero(r, -6, 6);
  const dir = a > 0 ? 'up' : 'down', wid = Math.abs(a) > 1 ? 'narrower' : Math.abs(a) < 1 ? 'wider' : 'same';
  const name = (d: string, w: string): Text => t(`Opens ${d}, ${w === 'same' ? 'the same width as' : `${w} than`} y = x²`, `S'ouvre vers le ${d === 'up' ? 'haut' : 'bas'}, ${w === 'same' ? 'même largeur que' : w === 'narrower' ? 'plus étroite que' : 'plus large que'} y = x²`);
  const w0 = wid, other = w0 === 'narrower' ? 'wider' : 'narrower';
  const rightT = name(dir, w0);
  const m = mc(r, rightT, [
    [name(dir === 'up' ? 'down' : 'up', w0), t('The sign of a decides the direction: a > 0 opens up, a < 0 opens down.', 'Le signe de a détermine l\'ouverture : a > 0 s\'ouvre vers le haut, a < 0 vers le bas.')],
    [name(dir, other), t('Compare |a| with 1. If |a| is bigger than 1 the parabola is narrower, and if it is between 0 and 1 it is wider.', 'Compare |a| à 1. Si |a| est plus grand que 1, la parabole est plus étroite ; s\'il est entre 0 et 1, elle est plus large.')],
    [name(dir === 'up' ? 'down' : 'up', other), t('Check both: the sign of a gives the direction and its size gives the width.', 'Vérifie les deux : le signe de a donne l\'ouverture et sa valeur donne la largeur.')],
  ]);
  return {
    prompt: bi((f) => f.t(`Which describes the graph of ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)}?`, `Lequel décrit le graphique de ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [bi((f) => f.t(`Here a = ${f.N(a)}. ${a > 0 ? 'It is positive, so the parabola opens up' : 'It is negative, so the parabola opens down'}.`, `Ici a = ${f.N(a)}. ${a > 0 ? 'Il est positif : la parabole s\'ouvre vers le haut' : 'Il est négatif : la parabole s\'ouvre vers le bas'}.`)), bi((f) => f.t(`|a| = ${f.N(Math.abs(a))} is ${Math.abs(a) > 1 ? 'bigger than' : 'less than'} 1, so it is ${wid}.`, `|a| = ${f.N(Math.abs(a))} est ${Math.abs(a) > 1 ? 'plus grand que' : 'plus petit que'} 1 : elle est ${wid === 'narrower' ? 'plus étroite' : 'plus large'}.`))],
    nudge: t('Look only at a. Its sign gives the direction, and its size compared with 1 gives the width.', 'Regarde seulement a. Son signe donne l\'ouverture et sa valeur comparée à 1 donne la largeur.'),
  };
});

export const equationFromVertexGen = (id: string): Generator => numGen(id, (tier, r) => {
  let h = 0, k = 0, p = 0, a = 1;
  do { a = tier === 1 ? randInt(r, 1, 3) : nonzero(r, -4, 4); h = tier === 1 ? 0 : nonzero(r, -5, 5); k = randInt(r, -6, 8); p = h + nonzero(r, -3, 3); } while (p === h);
  const q = a * (p - h) ** 2 + k;
  return {
    prompt: bi((f) => f.t(`A parabola has vertex ${f.m(`(${f.n(h)},\\ ${f.n(k)})`)} and passes through ${f.m(`(${f.n(p)},\\ ${f.n(q)})`)}. Find a in ${f.m('y = a(x - h)^{2} + k')}.`, `Une parabole a pour sommet ${f.m(`(${f.n(h)},\\ ${f.n(k)})`)} et passe par ${f.m(`(${f.n(p)},\\ ${f.n(q)})`)}. Trouve a dans ${f.m('y = a(x - h)^{2} + k')}.`)),
    answer: a, category: 'AP',
    wrong: wr(a, [[-a, t('Check the sign: put your a back in the equation. Does it give the point?', 'Vérifie le signe : remplace ton a dans l\'équation. Obtient-on le point ?'), 2], [(q - k) / Math.abs(p - h), t('The difference p − h must be squared before dividing.', 'La différence p − h doit être élevée au carré avant de diviser.'), 2], [q - k, t('Divide by (p − h)² as well.', 'Divise aussi par (p − h)².'), 2], [(q + k) / (p - h) ** 2, t('k must be subtracted from y, not added.', 'k doit être soustrait de y, pas additionné.'), 1]]),
    steps: [bi((f) => f.t(`Put h = ${f.N(h)}, k = ${f.N(k)} and the point in the equation: ${f.m(`${f.n(q)} = a(${f.n(p)} - ${h < 0 ? `(${f.n(h)})` : f.n(h)})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)}.`, `Remplace h = ${f.N(h)}, k = ${f.N(k)} et le point dans l'équation : ${f.m(`${f.n(q)} = a(${f.n(p)} - ${h < 0 ? `(${f.n(h)})` : f.n(h)})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)}.`)), bi((f) => f.t(`${f.m(`${f.n(q - k)} = ${f.n((p - h) ** 2)}a`)}.`, `${f.m(`${f.n(q - k)} = ${f.n((p - h) ** 2)}a`)}.`)), bi((f) => f.t(`So a = ${f.N(a)}.`, `Donc a = ${f.N(a)}.`))],
    nudge: t('Substitute the vertex and the point into y = a(x − h)² + k, then solve for a.', 'Remplace le sommet et le point dans y = a(x − h)² + k, puis résous pour a.'),
  };
});

// ── maximum, minimum and projectiles ────────────────────────────────────────────

export const maxMinGen = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier < 3) {
    const a = -randInt(r, 1, 5), h = randInt(r, 1, 9), k = randInt(r, 5, 40);
    if (tier === 1) {
      return {
        prompt: bi((f) => f.t(`A ball's height in metres after t seconds is ${f.m(`h = ${vform(f, a, h, k).replace(/\(x /, '(t ')}`)}. What is its maximum height, in metres?`, `La hauteur d'une balle, en mètres, après t secondes est ${f.m(`h = ${vform(f, a, h, k).replace(/\(x /, '(t ')}`)}. Quelle est sa hauteur maximale, en mètres ?`)),
        answer: k, category: 'AP',
        wrong: wr(k, [[h, t('That is the time of the maximum, not the height.', 'C\'est le moment du maximum, pas la hauteur.'), 0], [-h, t('The time of the maximum is h, and the height is k.', 'Le moment du maximum est h et la hauteur est k.'), 0], [k + a, t('The maximum is k exactly: the squared term is zero at the vertex.', 'Le maximum est exactement k : le terme au carré vaut zéro au sommet.'), 0]]),
        steps: [t('The parabola opens down, so the maximum is at the vertex (h, k).', 'La parabole s\'ouvre vers le bas : le maximum est au sommet (h, k).'), bi((f) => f.t(`The maximum height is k = ${f.N(k)} metres.`, `La hauteur maximale est k = ${f.N(k)} mètres.`))],
        nudge: t('At the vertex the squared part is 0. Read k.', 'Au sommet, la partie au carré vaut 0. Lis k.'),
      };
    }
    return {
      prompt: bi((f) => f.t(`A ball's height in metres after t seconds is ${f.m(`h = ${vform(f, a, h, k).replace(/\(x /, '(t ')}`)}. After how many seconds is the ball at its highest?`, `La hauteur d'une balle, en mètres, après t secondes est ${f.m(`h = ${vform(f, a, h, k).replace(/\(x /, '(t ')}`)}. Après combien de secondes la balle est-elle à son point le plus haut ?`)),
      answer: h, category: 'AP',
      wrong: wr(h, [[k, t('That is the maximum height, not the time.', 'C\'est la hauteur maximale, pas le moment.'), 0], [-h, t('The bracket (t − h) has the opposite sign of h.', 'La parenthèse (t − h) a le signe opposé de h.'), 0]]),
      steps: [t('The maximum happens at the vertex (h, k), so the time is h.', 'Le maximum est au sommet (h, k) : le moment est h.'), bi((f) => f.t(`The time is ${f.N(h)} seconds.`, `Le moment est ${f.N(h)} secondes.`))],
      nudge: t('The vertex gives the time (h) and the height (k). Which one is asked?', 'Le sommet donne le moment (h) et la hauteur (k). Lequel est demandé ?'),
    };
  }
  const a = -randInt(r, 1, 4), xm = randInt(r, 2, 12), b = -2 * a * xm, c = 0, R = a * xm * xm + b * xm + c;
  return {
    prompt: bi((f) => f.t(`The revenue from selling a product at x dollars is ${f.m(`R = ${poly(f, [[a, 'x^{2}'], [b, 'x']])}`)} dollars. What is the greatest possible revenue?`, `Le revenu de la vente d'un produit à x dollars est ${f.m(`R = ${poly(f, [[a, 'x^{2}'], [b, 'x']])}`)} dollars. Quel est le plus grand revenu possible ?`)),
    answer: R, category: 'AP',
    wrong: wr(R, [[xm, t('That is the price that gives the maximum, not the revenue itself. Put it back into the formula.', 'C\'est le prix qui donne le maximum, pas le revenu. Remplace-le dans la formule.'), 1], [-b, t('That is the coefficient of x. Find the vertex first.', 'C\'est le coefficient de x. Trouve d\'abord le sommet.'), 0], [R / 2, t('The maximum is at the vertex, x = −b ÷ 2a. Put that x in the formula.', 'Le maximum est au sommet, x = −b ÷ 2a. Remplace ce x dans la formule.'), 1]]),
    steps: [bi((f) => f.t(`The vertex is at ${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(xm)}.`, `Le sommet est à ${f.m(`x = \\frac{-b}{2a} = \\frac{${f.n(-b)}}{${f.n(2 * a)}}`)} = ${f.N(xm)}.`)), bi((f) => f.t(`Put it in: ${f.m(`R = ${f.n(a)}(${f.n(xm)})^{2} + ${f.n(b)}(${f.n(xm)})`)} = ${f.N(R)}.`, `Remplace : ${f.m(`R = ${f.n(a)}(${f.n(xm)})^{2} + ${f.n(b)}(${f.n(xm)})`)} = ${f.N(R)}.`))],
    nudge: t('The maximum is at x = −b ÷ 2a. Find that x, then put it in the formula.', 'Le maximum est à x = −b ÷ 2a. Trouve ce x, puis remplace-le dans la formule.'),
  };
});

export const projectileGen = (id: string): Generator => numGen(id, (tier, r) => {
  const hit = randInt(r, 2, 9), s = randInt(r, 1, 4), a = tier === 3 ? -pick(r, [4, 5, 6]) : -5;
  const B = -a * (hit - s), C = -a * hit * s;
  const eq = (f: F): string => (tier === 1 ? `h = ${f.n(a)}(t - ${f.n(hit)})(t + ${f.n(s)})` : `h = ${quad(f, a, B, C, 't')}`);
  return {
    prompt: bi((f) => f.t(`A ball is thrown so that its height in metres after t seconds is ${f.m(eq(f))}. After how many seconds does it hit the ground (h = 0)?`, `Une balle est lancée de sorte que sa hauteur, en mètres, après t secondes est ${f.m(eq(f))}. Après combien de secondes touche-t-elle le sol (h = 0) ?`)),
    answer: hit, category: 'AP',
    wrong: wr(hit, [[-s, t('That root is negative, so it is before the throw. Time cannot be negative.', 'Cette racine est négative : c\'est avant le lancer. Le temps ne peut pas être négatif.'), 1], [s, t('A sign slipped. Set each factor equal to 0 and solve.', 'Un signe a glissé. Pose chaque facteur égal à 0 et résous.'), 1], [hit + s, t('That adds the two roots. Each factor gives one root.', 'Cela additionne les deux racines. Chaque facteur donne une racine.'), 1], [C / -B * 1, t('Set h = 0 and find the roots, not a ratio of coefficients.', 'Pose h = 0 et trouve les racines, pas un rapport de coefficients.'), 1]]),
    steps: [tier === 1 ? t('Set h = 0. A product is 0 when a factor is 0.', 'Pose h = 0. Un produit est nul quand un facteur est nul.') : t('Set h = 0 and factor (take out the common factor first).', 'Pose h = 0 et factorise (mets d\'abord le facteur commun en évidence).'), bi((f) => f.t(`${f.m(`t = ${f.n(hit)}`)} or ${f.m(`t = ${f.n(-s)}`)}.`, `${f.m(`t = ${f.n(hit)}`)} ou ${f.m(`t = ${f.n(-s)}`)}.`)), bi((f) => f.t(`Time cannot be negative, so the ball lands after ${f.N(hit)} seconds.`, `Le temps ne peut pas être négatif : la balle atterrit après ${f.N(hit)} secondes.`))],
    nudge: t('Set the height to 0 and solve for t. Reject any negative time.', 'Pose la hauteur égale à 0 et résous pour t. Rejette tout temps négatif.'),
  };
});

// ── MFM2P: features of a parabola in standard and factored form ─────────────────

export const zerosGen = (id: string): Generator => numGen(id, (tier, r) => {
  let p = 1, q = 2;
  do { p = nonzero(r, -8, 8); q = nonzero(r, -8, 8); } while (p === q);
  const a = tier === 1 ? 1 : pick(r, [1, 2, -1, -2, 3]);
  const fac = (f: F): string => `y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))})`;
  const hi = Math.max(p, q), lo = Math.min(p, q);
  const axis = tier === 3;
  return {
    prompt: bi((f) => axis ? f.t(`A parabola is ${f.m(fac(f))}. What is the equation of its axis of symmetry, x = ?`, `Une parabole a pour équation ${f.m(fac(f))}. Quelle est l'équation de son axe de symétrie, x = ?`) : f.t(`What is the larger zero (x-intercept) of ${f.m(fac(f))}?`, `Quelle est la plus grande racine (abscisse à l'origine) de ${f.m(fac(f))} ?`)),
    answer: axis ? (p + q) / 2 : hi, category: 'KU',
    wrong: wr(axis ? (p + q) / 2 : hi, axis ? [[hi, t('That is one zero. The axis of symmetry is halfway between the two zeros.', 'C\'est une racine. L\'axe de symétrie est à mi-chemin entre les deux racines.'), 1], [-(p + q) / 2, t('A sign slipped. The zeros are the opposites of the numbers in the brackets.', 'Un signe a glissé. Les racines sont les opposés des nombres dans les parenthèses.'), 0], [p + q, t('That is the sum of the zeros. The axis is halfway between them: divide by 2.', 'C\'est la somme des racines. L\'axe est à mi-chemin : divise par 2.'), 1]] : [[-hi, t('A zero makes its bracket 0: (x − 3) = 0 gives x = 3, not −3.', 'Une racine annule sa parenthèse : (x − 3) = 0 donne x = 3, pas −3.'), 0], [lo, t('That is the smaller zero.', 'C\'est la plus petite racine.'), 1], [-lo, t('A zero makes its bracket 0, so change the sign of the number written.', 'Une racine annule sa parenthèse : change le signe du nombre écrit.'), 0]]),
    steps: [t('Set each bracket equal to 0 to find the zeros.', 'Pose chaque parenthèse égale à 0 pour trouver les racines.'), bi((f) => f.t(`The zeros are ${f.N(p)} and ${f.N(q)}.`, `Les racines sont ${f.N(p)} et ${f.N(q)}.`)), axis ? bi((f) => f.t(`The axis is halfway: x = ${f.N((p + q) / 2)}.`, `L'axe est à mi-chemin : x = ${f.N((p + q) / 2)}.`)) : bi((f) => f.t(`The larger zero is ${f.N(hi)}.`, `La plus grande racine est ${f.N(hi)}.`))],
    nudge: t('Each bracket equal to zero gives a zero of the parabola.', 'Chaque parenthèse égale à zéro donne une racine de la parabole.'),
  };
});

export const yInterceptGen = (id: string): Generator => numGen(id, (tier, r) => {
  const a = pick(r, [1, 2, -1, -2, 3]);
  if (tier === 1) {
    const b = randInt(r, -8, 8), c = nonzero(r, -9, 9);
    return {
      prompt: bi((f) => f.t(`What is the y-intercept of ${f.m(`y = ${quad(f, a, b, c)}`)}?`, `Quelle est l'ordonnée à l'origine de ${f.m(`y = ${quad(f, a, b, c)}`)} ?`)),
      answer: c, category: 'KU',
      wrong: wr(c, [[b, t('That is the coefficient of x. The y-intercept is the value when x = 0, which is the constant term.', 'C\'est le coefficient de x. L\'ordonnée à l\'origine est la valeur quand x = 0, soit le terme constant.'), 0], [a, t('That is the coefficient of x². Put x = 0 in the equation.', 'C\'est le coefficient de x². Remplace x par 0 dans l\'équation.'), 0], [-c, t('The sign is wrong. The constant term keeps its sign.', 'Le signe est faux. Le terme constant garde son signe.'), 0]]),
      steps: [t('The y-intercept is where x = 0.', 'L\'ordonnée à l\'origine est la valeur de y quand x = 0.'), bi((f) => f.t(`Only the constant term is left: y = ${f.N(c)}.`, `Il ne reste que le terme constant : y = ${f.N(c)}.`))],
      nudge: t('Put x = 0 in the equation.', 'Remplace x par 0 dans l\'équation.'),
    };
  }
  if (tier === 2) {
    let p = 1, q = 2;
    do { p = nonzero(r, -6, 6); q = nonzero(r, -6, 6); } while (p === q);
    return {
      prompt: bi((f) => f.t(`What is the y-intercept of ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))})`)}?`, `Quelle est l'ordonnée à l'origine de ${f.m(`y = ${a === 1 ? '' : a === -1 ? '-' : f.n(a)}(x ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(x ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))})`)} ?`)),
      answer: a * p * q, category: 'AP',
      wrong: wr(a * p * q, [[p * q, t('The factor a in front multiplies the product too.', 'Le facteur a devant multiplie aussi le produit.'), 1], [-a * p * q, t('Put x = 0 in each bracket: (0 − p) is −p, and two minus signs make a plus.', 'Remplace x par 0 dans chaque parenthèse : (0 − p) vaut −p, et deux signes moins donnent un plus.'), 1], [a * (p + q), t('Multiply the bracket values; do not add them.', 'Multiplie les valeurs des parenthèses ; ne les additionne pas.'), 1]]),
      steps: [t('Put x = 0 in the equation.', 'Remplace x par 0 dans l\'équation.'), bi((f) => f.t(`${f.m(`y = ${f.n(a)}(0 ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(0 ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))})`)} = ${f.N(a * p * q)}.`, `${f.m(`y = ${f.n(a)}(0 ${p < 0 ? '+' : '-'} ${f.n(Math.abs(p))})(0 ${q < 0 ? '+' : '-'} ${f.n(Math.abs(q))})`)} = ${f.N(a * p * q)}.`))],
      nudge: t('Put x = 0 in every bracket and multiply everything.', 'Remplace x par 0 dans chaque parenthèse et multiplie le tout.'),
    };
  }
  const h = nonzero(r, -6, 6), k = nonzero(r, -9, 9), y0 = a * h * h + k;
  return {
    prompt: bi((f) => f.t(`What is the y-intercept of ${f.m(`y = ${vform(f, a, h, k)}`)}?`, `Quelle est l'ordonnée à l'origine de ${f.m(`y = ${vform(f, a, h, k)}`)} ?`)),
    answer: y0, category: 'AP',
    wrong: wr(y0, [[k, t('That is k, the y-coordinate of the vertex. Put x = 0 in the whole equation.', 'C\'est k, l\'ordonnée du sommet. Remplace x par 0 dans toute l\'équation.'), 1], [a * h * h, t('Add k as well.', 'Ajoute aussi k.'), 1], [a * (-h) ** 2 - k, t('k keeps its sign.', 'k garde son signe.'), 1]]),
    steps: [t('Put x = 0 in the equation.', 'Remplace x par 0 dans l\'équation.'), bi((f) => f.t(`${f.m(`y = ${f.n(a)}(0 ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} = ${f.N(y0)}.`, `${f.m(`y = ${f.n(a)}(0 ${h < 0 ? '+' : '-'} ${f.n(Math.abs(h))})^{2} ${k < 0 ? '-' : '+'} ${f.n(Math.abs(k))}`)} = ${f.N(y0)}.`))],
    nudge: t('Put x = 0 in the whole equation, including the bracket.', 'Remplace x par 0 dans toute l\'équation, y compris la parenthèse.'),
  };
});
