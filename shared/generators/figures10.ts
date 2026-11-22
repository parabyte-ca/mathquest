// Grade 10 (MPM2D B3): verifying properties of geometric figures with coordinates: the midsegment of a triangle, medians and the centroid,
// and the diagonals of a quadrilateral. Every figure is drawn on a coordinate grid (the vertices are the picture's points) and every
// answer is a whole number or a name, found from the coordinates.
import { pick, randInt } from '../rng.js';
import type { Generator, Text, Visual } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, type F } from './dsl.js';
import { t } from './kit.js';

const SIZE = 14;
type P = [number, number];
const pt = (f: F, p: P): string => `(${f.n(p[0])},\\ ${f.n(p[1])})`;
const plane = (labelled: [string, P][]): Visual => ({ type: 'plane', size: SIZE, points: labelled.map(([label, [x, y]]) => ({ x, y, label })) });
const inGrid = (p: P): boolean => p[0] >= 0 && p[0] <= SIZE && p[1] >= 0 && p[1] <= SIZE;
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const dist = (a: P, b: P): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
const TRIPLES: P[] = [[3, 4], [4, 3], [6, 8], [8, 6]];

/** MPM2D.B3.1: the midsegment of a triangle is parallel to the third side and half as long */
export const midsegment10 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 3) {
    let M: P, N: P, d: P;
    for (;;) {
      d = pick(r, TRIPLES); const sx = pick(r, [1, -1]), sy = pick(r, [1, -1]);
      M = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; N = add(M, [sx * d[0], sy * d[1]]);
      if (inGrid(N)) break;
    }
    const mn = dist(M, N), ab = 2 * mn;
    return {
      prompt: bi((f) => f.t(`In triangle ABC, the points ${f.m('M')} ${f.m(pt(f, M))} and ${f.m('N')} ${f.m(pt(f, N))} are the midpoints of AC and BC. How long is side AB?`, `Dans le triangle ABC, les points ${f.m('M')} ${f.m(pt(f, M))} et ${f.m('N')} ${f.m(pt(f, N))} sont les milieux de AC et BC. Quelle est la longueur du côté AB ?`)),
      visual: plane([['M', M], ['N', N]]), answer: ab, category: 'TH',
      wrong: wr(ab, [[mn, t('That is the length of MN. The side AB is twice as long as the midsegment.', 'C\'est la longueur de MN. Le côté AB est deux fois plus long que le segment joignant les milieux.'), 1], [ab * 2, t('AB is twice MN, not four times.', 'AB vaut deux fois MN, pas quatre fois.'), 1], [Math.abs(N[0] - M[0]) + Math.abs(N[1] - M[1]), t('Do not add the horizontal and vertical changes: use the distance formula for MN, then double it.', 'N\'additionne pas les variations horizontale et verticale : utilise la formule de distance pour MN, puis double.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`MN = \\sqrt{${f.n(Math.abs(N[0] - M[0]))}^{2} + ${f.n(Math.abs(N[1] - M[1]))}^{2}}`)} = ${f.N(mn)}.`, `${f.m(`MN = \\sqrt{${f.n(Math.abs(N[0] - M[0]))}^{2} + ${f.n(Math.abs(N[1] - M[1]))}^{2}}`)} = ${f.N(mn)}.`)), bi((f) => f.t(`The midsegment is half the third side, so ${f.m(`AB = 2 \\times ${f.n(mn)}`)} = ${f.N(ab)}.`, `Le segment joignant les milieux vaut la moitié du troisième côté : ${f.m(`AB = 2 \\times ${f.n(mn)}`)} = ${f.N(ab)}.`))],
      nudge: t('Find the length of MN with the distance formula. AB is twice as long.', 'Trouve la longueur de MN avec la formule de distance. AB est deux fois plus long.'),
    };
  }
  let A: P, B: P, C: P;
  for (;;) {
    if (tier === 1) { const L = pick(r, [4, 6, 8, 10]); A = [randInt(r, 0, SIZE - L), randInt(r, 0, SIZE - 5)]; B = [A[0] + L, A[1]]; C = [randInt(r, 0, SIZE), randInt(r, A[1] + 2, SIZE)]; }
    else { const d = pick(r, TRIPLES), sx = pick(r, [1, -1]); A = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; B = add(A, [sx * d[0], d[1]]); C = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; }
    const cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
    if (inGrid(A) && inGrid(B) && inGrid(C) && cross !== 0) break;
  }
  const M = mid(A, C), N = mid(B, C), ab = dist(A, B), ans = dist(M, N);
  return {
    prompt: bi((f) => f.t(`In triangle ABC, A is ${f.m(pt(f, A))}, B is ${f.m(pt(f, B))} and C is ${f.m(pt(f, C))}. M and N are the midpoints of AC and BC. How long is the midsegment MN?`, `Dans le triangle ABC, A est ${f.m(pt(f, A))}, B est ${f.m(pt(f, B))} et C est ${f.m(pt(f, C))}. M et N sont les milieux de AC et BC. Quelle est la longueur du segment MN ?`)),
    visual: plane([['A', A], ['B', B], ['C', C]]), answer: ans, category: tier === 1 ? 'KU' : 'AP',
    wrong: wr(ans, [[ab, t('That is the length of side AB. The midsegment MN is half as long.', 'C\'est la longueur du côté AB. Le segment MN est deux fois plus court.'), 1], [ab / 3, t('MN is half of AB, not a third.', 'MN vaut la moitié de AB, pas le tiers.'), 1], [Math.abs(C[1] - A[1]) / 2 || 1, t('The midsegment is parallel to AB and half its length. Compare it with AB, not with the height.', 'Le segment MN est parallèle à AB et mesure la moitié. Compare-le à AB, pas à la hauteur.'), 1]]),
    steps: [bi((f) => f.t(`MN joins the midpoints of AC and BC, so it is parallel to AB and half as long. AB = ${f.N(ab)}.`, `MN joint les milieux de AC et BC : il est parallèle à AB et mesure la moitié. AB = ${f.N(ab)}.`)), bi((f) => f.t(`${f.m(`MN = ${f.n(ab)} \\div 2`)} = ${f.N(ans)}.`, `${f.m(`MN = ${f.n(ab)} \\div 2`)} = ${f.N(ans)}.`))],
    nudge: t('Find the length of AB, then take half.', 'Trouve la longueur de AB, puis prends la moitié.'),
  };
});

/** MPM2D.B3.2: medians and the centroid */
export const median10 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    let B: P, C: P;
    for (;;) { B = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; C = [B[0] + 2 * randInt(r, -5, 5), B[1] + 2 * randInt(r, -5, 5)]; if (inGrid(C) && (B[0] !== C[0] || B[1] !== C[1])) break; }
    const A: P = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)], axisX = r() < 0.5, D = mid(B, C), ans = axisX ? D[0] : D[1];
    const w = axisX ? 'x' : 'y';
    return {
      prompt: bi((f) => f.t(`In triangle ABC, A is ${f.m(pt(f, A))}, B is ${f.m(pt(f, B))} and C is ${f.m(pt(f, C))}. D is the midpoint of BC, so AD is a median. What is the ${w}-coordinate of D?`, `Dans le triangle ABC, A est ${f.m(pt(f, A))}, B est ${f.m(pt(f, B))} et C est ${f.m(pt(f, C))}. D est le milieu de BC : AD est une médiane. Quelle est la coordonnée ${w} de D ?`)),
      visual: plane([['A', A], ['B', B], ['C', C]]), answer: ans, category: 'KU',
      wrong: wr(ans, [[axisX ? A[0] : A[1], t('That is a coordinate of A. D is the midpoint of B and C.', 'C\'est une coordonnée de A. D est le milieu de B et C.'), 0], [axisX ? B[0] + C[0] : B[1] + C[1], t('That is the sum. Divide it by 2 to get the midpoint.', 'C\'est la somme. Divise-la par 2 pour obtenir le milieu.'), 0], [Math.abs((axisX ? C[0] - B[0] : C[1] - B[1])) / 2 || 1, t('That is half the distance between B and C. Add it to the smaller coordinate, or average the two.', 'C\'est la moitié de la distance entre B et C. Ajoute-la à la plus petite coordonnée, ou fais la moyenne des deux.'), 0]]),
      steps: [bi((f) => f.t(`The midpoint averages the coordinates: ${f.m(`(${f.n(axisX ? B[0] : B[1])} + ${f.n(axisX ? C[0] : C[1])}) \\div 2`)}.`, `Le milieu est la moyenne des coordonnées : ${f.m(`(${f.n(axisX ? B[0] : B[1])} + ${f.n(axisX ? C[0] : C[1])}) \\div 2`)}.`)), bi((f) => f.t(`The ${w}-coordinate of D is ${f.N(ans)}.`, `La coordonnée ${w} de D est ${f.N(ans)}.`))],
      nudge: t('Add the two coordinates of B and C and divide by 2.', 'Additionne les deux coordonnées de B et C et divise par 2.'),
    };
  }
  if (tier === 2) {
    let A: P, B: P, C: P, D: P, d: P;
    for (;;) {
      d = pick(r, TRIPLES); const sx = pick(r, [1, -1]), sy = pick(r, [1, -1]);
      D = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; A = add(D, [sx * d[0], sy * d[1]]);
      const u: P = [randInt(r, -4, 4), randInt(r, -4, 4)]; B = add(D, u); C = sub(D, u);
      if ((u[0] !== 0 || u[1] !== 0) && inGrid(A) && inGrid(B) && inGrid(C)) break;
    }
    const ans = dist(A, D);
    return {
      prompt: bi((f) => f.t(`In triangle ABC, A is ${f.m(pt(f, A))}, B is ${f.m(pt(f, B))} and C is ${f.m(pt(f, C))}. How long is the median from A to the midpoint D of BC?`, `Dans le triangle ABC, A est ${f.m(pt(f, A))}, B est ${f.m(pt(f, B))} et C est ${f.m(pt(f, C))}. Quelle est la longueur de la médiane issue de A jusqu'au milieu D de BC ?`)),
      visual: plane([['A', A], ['B', B], ['C', C]]), answer: ans, category: 'AP',
      wrong: wr(ans, [[dist(B, C), t('That is the length of side BC. The median goes from A to the midpoint of BC.', 'C\'est la longueur du côté BC. La médiane va de A au milieu de BC.'), 1], [Math.abs(A[0] - D[0]) + Math.abs(A[1] - D[1]), t('Do not add the horizontal and vertical changes: use the distance formula.', 'N\'additionne pas les variations horizontale et verticale : utilise la formule de distance.'), 1], [dist(A, B), t('That is the length of side AB. Find the midpoint of BC first, then measure from A to it.', 'C\'est la longueur du côté AB. Trouve d\'abord le milieu de BC, puis mesure de A à ce point.'), 0]]),
      steps: [bi((f) => f.t(`The midpoint of BC is D ${f.m(pt(f, D))}.`, `Le milieu de BC est D ${f.m(pt(f, D))}.`)), bi((f) => f.t(`${f.m(`AD = \\sqrt{${f.n(Math.abs(A[0] - D[0]))}^{2} + ${f.n(Math.abs(A[1] - D[1]))}^{2}}`)} = ${f.N(ans)}.`, `${f.m(`AD = \\sqrt{${f.n(Math.abs(A[0] - D[0]))}^{2} + ${f.n(Math.abs(A[1] - D[1]))}^{2}}`)} = ${f.N(ans)}.`))],
      nudge: t('Find the midpoint of BC, then use the distance formula from A to it.', 'Trouve le milieu de BC, puis utilise la formule de distance de A à ce point.'),
    };
  }
  let A: P, B: P, C: P;
  for (;;) {
    A = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; B = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)]; C = [randInt(r, 0, SIZE), randInt(r, 0, SIZE)];
    const cross = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
    if (cross !== 0 && (A[0] + B[0] + C[0]) % 3 === 0 && (A[1] + B[1] + C[1]) % 3 === 0) break;
  }
  const axisX = r() < 0.5, w = axisX ? 'x' : 'y', sum = axisX ? A[0] + B[0] + C[0] : A[1] + B[1] + C[1], ans = sum / 3;
  return {
    prompt: bi((f) => f.t(`The three medians of triangle ABC meet at the centroid G. A is ${f.m(pt(f, A))}, B is ${f.m(pt(f, B))} and C is ${f.m(pt(f, C))}. What is the ${w}-coordinate of G?`, `Les trois médianes du triangle ABC se rencontrent au centre de gravité G. A est ${f.m(pt(f, A))}, B est ${f.m(pt(f, B))} et C est ${f.m(pt(f, C))}. Quelle est la coordonnée ${w} de G ?`)),
    visual: plane([['A', A], ['B', B], ['C', C]]), answer: ans, category: 'TH',
    wrong: wr(ans, [[sum, t('That is the sum of the three coordinates. Divide by 3 to get the average.', 'C\'est la somme des trois coordonnées. Divise par 3 pour obtenir la moyenne.'), 0], [sum / 2 === Math.round(sum / 2) ? sum / 2 : Math.round(sum / 2), t('There are three vertices, so divide by 3, not 2.', 'Il y a trois sommets : divise par 3, pas par 2.'), 0], [(axisX ? (B[0] + C[0]) / 2 : (B[1] + C[1]) / 2), t('That is the midpoint of one side. The centroid averages all three vertices.', 'C\'est le milieu d\'un côté. Le centre de gravité est la moyenne des trois sommets.'), 0]]),
    steps: [bi((f) => f.t(`The centroid is the average of the three vertices: ${f.m(`(${f.n(axisX ? A[0] : A[1])} + ${f.n(axisX ? B[0] : B[1])} + ${f.n(axisX ? C[0] : C[1])}) \\div 3`)}.`, `Le centre de gravité est la moyenne des trois sommets : ${f.m(`(${f.n(axisX ? A[0] : A[1])} + ${f.n(axisX ? B[0] : B[1])} + ${f.n(axisX ? C[0] : C[1])}) \\div 3`)}.`)), bi((f) => f.t(`The ${w}-coordinate of G is ${f.N(ans)}.`, `La coordonnée ${w} de G est ${f.N(ans)}.`))],
    nudge: t('Add the three coordinates and divide by 3.', 'Additionne les trois coordonnées et divise par 3.'),
  };
});

// ── diagonals of a quadrilateral ───────────────────────────────────────

type Kind = 'parallelogram' | 'rectangle' | 'rhombus' | 'square';
/** Half-diagonals (u, v): the vertices are C0 + u, C0 + v, C0 − u and C0 − v, so the diagonals AC and BD always bisect each other. */
const SHAPES: Record<Kind, [P, P][]> = {
  parallelogram: [[[4, 1], [1, 3]], [[3, 1], [-1, 4]], [[4, 2], [0, 3]], [[3, 0], [1, 4]], [[2, 3], [4, -1]]],
  rectangle: [[[3, 4], [4, 3]], [[3, 4], [5, 0]], [[0, 5], [4, 3]], [[3, 4], [-3, 4]]],
  rhombus: [[[4, 2], [-1, 2]], [[2, 4], [-2, 1]], [[3, 0], [0, 2]], [[4, 0], [0, 2]], [[0, 4], [3, 0]]],
  square: [[[3, 4], [-4, 3]], [[2, 2], [-2, 2]], [[3, 0], [0, 3]], [[4, 0], [0, 4]], [[1, 3], [-3, 1]]],
};
const NAMES: Record<Kind | 'none', Text> = {
  parallelogram: t('A parallelogram that is not a rectangle or a rhombus', 'Un parallélogramme qui n\'est ni un rectangle ni un losange'),
  rectangle: t('A rectangle', 'Un rectangle'),
  rhombus: t('A rhombus', 'Un losange'),
  square: t('A square', 'Un carré'),
  none: t('Not a parallelogram', 'Pas un parallélogramme'),
};
const nice = (n: number): string => String(Math.round(n * 10) / 10);
/** The vertices A, B, C, D of a quadrilateral of the given kind (or one whose diagonals do not bisect each other). */
function quad(r: () => number, kind: Kind | 'none'): [P, P, P, P] {
  const base = kind === 'none' ? pick(r, SHAPES.parallelogram) : pick(r, SHAPES[kind]);
  for (let tries = 0; tries < 200; tries++) {
    let [u, v] = base;
    if (r() < 0.5) { u = [u[1], u[0]]; v = [v[1], v[0]]; }
    if (r() < 0.5) { u = [-u[0], u[1]]; v = [-v[0], v[1]]; }
    const C0: P = [randInt(r, 4, SIZE - 4), randInt(r, 4, SIZE - 4)];
    const A = add(C0, u), B = add(C0, v), C = sub(C0, u);
    let D = sub(C0, v);
    if (kind === 'none') D = add(D, pick(r, [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1]] as P[]));
    if ([A, B, C, D].every(inGrid)) return [A, B, C, D];
  }
  return [[8, 12], [11, 8], [3, 2], [0, 6]];
}
/** What the diagonals of A, B, C, D say: whether they bisect each other, are equal, and meet at a right angle. */
function diagonals(A: P, B: P, C: P, D: P) {
  const m1 = mid(A, C), m2 = mid(B, D), bisect = m1[0] === m2[0] && m1[1] === m2[1];
  const eq = Math.abs(dist(A, C) - dist(B, D)) < 1e-9;
  const perp = (C[0] - A[0]) * (D[0] - B[0]) + (C[1] - A[1]) * (D[1] - B[1]) === 0;
  const kind: Kind | 'none' = !bisect ? 'none' : eq && perp ? 'square' : eq ? 'rectangle' : perp ? 'rhombus' : 'parallelogram';
  return { m1, m2, bisect, eq, perp, kind, ac: dist(A, C), bd: dist(B, D) };
}
/** Why a wrong name does not fit: the property that fails. */
function whyNot(name: Kind | 'none', d: ReturnType<typeof diagonals>): Text {
  const lens = t(`The diagonals are ${nice(d.ac)} and ${nice(d.bd)} long, so they are not equal and it is not a rectangle.`, `Les diagonales mesurent ${nice(d.ac)} et ${nice(d.bd)} : elles ne sont pas égales, ce n'est donc pas un rectangle.`);
  if (name === 'none') return t('The diagonals do bisect each other (they share a midpoint), so it is a parallelogram.', 'Les diagonales se coupent en leur milieu (elles ont le même milieu) : c\'est un parallélogramme.');
  if (!d.bisect) return t('The diagonals have different midpoints, so they do not bisect each other and it is not a parallelogram at all.', 'Les diagonales n\'ont pas le même milieu : elles ne se coupent pas en leur milieu, ce n\'est donc pas un parallélogramme.');
  if (name === 'rectangle') return lens;
  if (name === 'rhombus') return t('The diagonals do not meet at a right angle (the product of their slopes is not −1), so it is not a rhombus.', 'Les diagonales ne se coupent pas à angle droit : ce n\'est pas un losange.');
  if (name === 'square') return d.eq ? t('The diagonals are equal but not perpendicular, so it is not a square.', 'Les diagonales sont égales mais pas perpendiculaires : ce n\'est pas un carré.') : d.perp ? t('The diagonals are perpendicular but not equal, so it is not a square.', 'Les diagonales sont perpendiculaires mais pas égales : ce n\'est pas un carré.') : t('The diagonals are neither equal nor perpendicular, so it is not a square.', 'Les diagonales ne sont ni égales ni perpendiculaires : ce n\'est pas un carré.');
  return t('The diagonals are neither equal nor perpendicular, so it is only a parallelogram.', 'Les diagonales ne sont ni égales ni perpendiculaires : c\'est seulement un parallélogramme.');
}

/** MPM2D.B3.3: the diagonals of a quadrilateral: find a vertex from the bisecting diagonals, then name the figure */
export const diagonals10 = (id: string): Generator => (tier, seed) => {
  if (tier === 1) {
    return numGen(id, (_tier, r) => {
      const [A, B, C, D] = quad(r, pick(r, ['parallelogram', 'rectangle', 'rhombus'] as Kind[]));
      const axisX = r() < 0.5, w = axisX ? 'x' : 'y', k = axisX ? 0 : 1, ans = D[k]!;
      return {
        prompt: bi((f) => f.t(`ABCD is a parallelogram with A ${f.m(pt(f, A))}, B ${f.m(pt(f, B))} and C ${f.m(pt(f, C))}. The diagonals AC and BD bisect each other. What is the ${w}-coordinate of D?`, `ABCD est un parallélogramme avec A ${f.m(pt(f, A))}, B ${f.m(pt(f, B))} et C ${f.m(pt(f, C))}. Les diagonales AC et BD se coupent en leur milieu. Quelle est la coordonnée ${w} de D ?`)),
        visual: plane([['A', A], ['B', B], ['C', C]]), answer: ans, category: 'AP',
        wrong: wr(ans, [[B[k]! + C[k]! - A[k]!, t('The diagonals are AC and BD, so D is found from the midpoint of AC and the point B, not from B and C.', 'Les diagonales sont AC et BD : D se trouve à partir du milieu de AC et du point B, pas de B et C.'), 1], [A[k]! + C[k]!, t('That is the sum for the midpoint of AC (before halving). The midpoint of BD is the same point.', 'C\'est la somme pour le milieu de AC (avant de diviser par 2). Le milieu de BD est le même point.'), 0], [(A[k]! + C[k]!) / 2, t('That is the midpoint of AC, which is also the midpoint of BD. D is as far from it as B, on the other side.', 'C\'est le milieu de AC, qui est aussi le milieu de BD. D est aussi loin de ce point que B, de l\'autre côté.'), 1]]),
        steps: [bi((f) => f.t(`The diagonals share a midpoint, so ${f.m(`\\frac{${f.n(A[k]!)} + ${f.n(C[k]!)}}{2} = \\frac{${f.n(B[k]!)} + ${w}_D}{2}`)}.`, `Les diagonales ont le même milieu : ${f.m(`\\frac{${f.n(A[k]!)} + ${f.n(C[k]!)}}{2} = \\frac{${f.n(B[k]!)} + ${w}_D}{2}`)}.`)), bi((f) => f.t(`So ${f.m(`${w}_D = ${f.n(A[k]!)} + ${f.n(C[k]!)} - ${f.n(B[k]!)}`)} = ${f.N(ans)}.`, `Donc ${f.m(`${w}_D = ${f.n(A[k]!)} + ${f.n(C[k]!)} - ${f.n(B[k]!)}`)} = ${f.N(ans)}.`))],
        nudge: t('Find the midpoint of AC. It is also the midpoint of BD.', 'Trouve le milieu de AC. C\'est aussi le milieu de BD.'),
      };
    })(tier, seed);
  }
  return choiceGen(id, (_tier, r) => {
    const kinds: (Kind | 'none')[] = tier === 2 ? ['parallelogram', 'rectangle', 'rhombus', 'square'] : ['parallelogram', 'rectangle', 'rhombus', 'none'];
    const right = pick(r, kinds), [A, B, C, D] = quad(r, right), d = diagonals(A, B, C, D);
    const wrongs = kinds.filter((k) => k !== right).map((k) => [bi((f) => f.t(NAMES[k].en, NAMES[k].fr)), whyNot(k, d)] as [Text, Text]);
    const m = mc(r, bi((f) => f.t(NAMES[right].en, NAMES[right].fr)), wrongs);
    return {
      prompt: bi((f) => f.t(`Quadrilateral ABCD has A ${f.m(pt(f, A))}, B ${f.m(pt(f, B))}, C ${f.m(pt(f, C))} and D ${f.m(pt(f, D))}. Use its diagonals AC and BD to decide which name fits best.`, `Le quadrilatère ABCD a A ${f.m(pt(f, A))}, B ${f.m(pt(f, B))}, C ${f.m(pt(f, C))} et D ${f.m(pt(f, D))}. Utilise ses diagonales AC et BD pour décider quel nom convient le mieux.`)),
      visual: plane([['A', A], ['B', B], ['C', C], ['D', D]]), options: m.options, correct: m.correct, why: m.why, category: tier === 2 ? 'AP' : 'TH',
      steps: [bi((f) => f.t(`Midpoint of AC: ${f.m(pt(f, d.m1))}. Midpoint of BD: ${f.m(pt(f, d.m2))}. ${d.bisect ? 'They are the same, so the diagonals bisect each other: a parallelogram.' : 'They are different, so it is not a parallelogram.'}`, `Milieu de AC : ${f.m(pt(f, d.m1))}. Milieu de BD : ${f.m(pt(f, d.m2))}. ${d.bisect ? 'C\'est le même : les diagonales se coupent en leur milieu, c\'est un parallélogramme.' : 'Ils sont différents : ce n\'est pas un parallélogramme.'}`)), bi((f) => f.t(d.bisect ? `Lengths: AC = ${nice(d.ac)}, BD = ${nice(d.bd)}${d.eq ? ' (equal)' : ''}. ${d.perp ? 'The diagonals are perpendicular.' : 'They are not perpendicular.'} So it is: ${NAMES[d.kind].en.toLowerCase()}.` : `So it is: ${NAMES.none.en.toLowerCase()}.`, d.bisect ? `Longueurs : AC = ${nice(d.ac)}, BD = ${nice(d.bd)}${d.eq ? ' (égales)' : ''}. ${d.perp ? 'Les diagonales sont perpendiculaires.' : 'Elles ne sont pas perpendiculaires.'} Donc : ${NAMES[d.kind].fr.toLowerCase()}.` : `Donc : ${NAMES.none.fr.toLowerCase()}.`))],
      nudge: t('Check three things: do the diagonals share a midpoint, are they equal, are they perpendicular?', 'Vérifie trois choses : les diagonales ont-elles le même milieu, sont-elles égales, sont-elles perpendiculaires ?'),
    };
  })(tier, seed);
};
