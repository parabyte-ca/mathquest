// Grade 12 (MCV4U) Geometry and Algebra of Vectors: magnitude, operations, the dot and cross products and their uses, lines and planes
// in 2-space and 3-space. Vectors use Pythagorean triples, so magnitudes and distances are whole numbers.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, type F } from './dsl.js';
import { t } from './kit.js';

const same = (en: string, fr: string): Text => t(en, fr);
const nz = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const sgn = (n: number): string => (n < 0 ? '-' : '+');
const TRIPLES2: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25]];
const TRIPLES3: [number, number, number, number][] = [[2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]];
const signs = (r: () => number, v: number[]): number[] => v.map((x) => (r() < 0.5 ? -x : x));
const shuffled = (r: () => number, v: number[]): number[] => [...v].sort(() => r() - 0.5);

/** A vector as TeX: (a, b, c). */
export const vec = (f: F, v: number[]): string => `\\left(${v.map((x) => f.n(x)).join(', ')}\\right)`;
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0);
const cross = (a: number[], b: number[]): number[] => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];

/** MCV4U.C1: magnitude of vectors in 2-space and 3-space */
export const magnitude12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const [p, q, h] = pick(r, TRIPLES2), v = signs(r, r() < 0.5 ? [p, q] : [q, p]);
    return {
      prompt: bi((f) => f.t(`Find the magnitude of ${f.m(`\\vec{v} = ${vec(f, v)}`)}.`, `Trouve la norme de ${f.m(`\\vec{v} = ${vec(f, v)}`)}.`)),
      answer: h, category: 'KU',
      wrong: wr(h, [[p + q, same('The magnitude is the square root of the sum of the squares, not the sum of the components.', 'La norme est la racine carrée de la somme des carrés, et non la somme des composantes.'), 0], [p * p + q * q, same('Take the square root of the sum of the squares.', 'Prends la racine carrée de la somme des carrés.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`|\\vec{v}| = \\sqrt{(${f.n(v[0]!)})^2 + (${f.n(v[1]!)})^2} = \\sqrt{${f.n(p * p + q * q)}}`)}.`, `${f.m(`|\\vec{v}| = \\sqrt{(${f.n(v[0]!)})^2 + (${f.n(v[1]!)})^2} = \\sqrt{${f.n(p * p + q * q)}}`)}.`)), bi((f) => f.t(`The magnitude is ${f.N(h)}.`, `La norme est ${f.N(h)}.`))],
      nudge: same('Square each component, add, and take the square root.', 'Élève chaque composante au carré, additionne et prends la racine carrée.'),
    };
  }
  if (tier === 2) {
    const [p, q, s, h] = pick(r, TRIPLES3), v = signs(r, shuffled(r, [p, q, s]));
    return {
      prompt: bi((f) => f.t(`Find the magnitude of ${f.m(`\\vec{v} = ${vec(f, v)}`)} in three dimensions.`, `Trouve la norme de ${f.m(`\\vec{v} = ${vec(f, v)}`)} en trois dimensions.`)),
      answer: h, category: 'AP',
      wrong: wr(h, [[p + q + s, same('Square the components, add them, and take the square root.', 'Élève les composantes au carré, additionne-les et prends la racine carrée.'), 0], [p * p + q * q + s * s, same('Take the square root of the sum of the squares.', 'Prends la racine carrée de la somme des carrés.'), 1], [Math.hypot(p, q), same('Include the third component too.', 'Inclus aussi la troisième composante.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`|\\vec{v}| = \\sqrt{${f.n(p * p)} + ${f.n(q * q)} + ${f.n(s * s)}} = \\sqrt{${f.n(h * h)}}`)}.`, `${f.m(`|\\vec{v}| = \\sqrt{${f.n(p * p)} + ${f.n(q * q)} + ${f.n(s * s)}} = \\sqrt{${f.n(h * h)}}`)}.`)), bi((f) => f.t(`The magnitude is ${f.N(h)}.`, `La norme est ${f.N(h)}.`))],
      nudge: same('Square the three components, add, and take the square root.', 'Élève les trois composantes au carré, additionne et prends la racine carrée.'),
    };
  }
  const [p, q, s, h] = pick(r, TRIPLES3), d = signs(r, shuffled(r, [p, q, s])), b = [randInt(r, -4, 4), randInt(r, -4, 4), randInt(r, -4, 4)], a = d.map((x, i) => x + b[i]!);
  return {
    prompt: bi((f) => f.t(`Given ${f.m(`\\vec{a} = ${vec(f, a)}`)} and ${f.m(`\\vec{b} = ${vec(f, b)}`)}, find ${f.m('|\\vec{a} - \\vec{b}|')}.`, `Sachant que ${f.m(`\\vec{a} = ${vec(f, a)}`)} et ${f.m(`\\vec{b} = ${vec(f, b)}`)}, trouve ${f.m('|\\vec{a} - \\vec{b}|')}.`)),
    answer: h, category: 'AP',
    wrong: wr(h, [[Math.round(Math.hypot(...a) - Math.hypot(...b)), same('Subtract the vectors first, then find the magnitude of the result. The magnitudes do not subtract.', 'Soustrais d\'abord les vecteurs, puis trouve la norme du résultat. Les normes ne se soustraient pas.'), 0], [Math.round(Math.hypot(...a.map((x, i) => x + b[i]!))), same('The question has a minus sign: subtract the components.', 'La question a un signe moins : soustrais les composantes.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`\\vec{a} - \\vec{b} = ${vec(f, d)}`)}.`, `${f.m(`\\vec{a} - \\vec{b} = ${vec(f, d)}`)}.`)), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(p * p)} + ${f.n(q * q)} + ${f.n(s * s)}}`)} = ${f.N(h)}.`, `${f.m(`\\sqrt{${f.n(p * p)} + ${f.n(q * q)} + ${f.n(s * s)}}`)} = ${f.N(h)}.`))],
    nudge: same('Subtract component by component, then find the magnitude.', 'Soustrais composante par composante, puis trouve la norme.'),
  };
});

/** MCV4U.C2: vector operations, the dot product and the cross product */
export const vecOps12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mk = (n: number): number[] => Array.from({ length: n }, () => nz(r, -5, 5));
  if (tier === 1) {
    const a = mk(3), b = mk(3), m = nz(r, -3, 4), n = nz(r, -3, 4), k = randInt(r, 0, 2), name = ['first', 'second', 'third'][k]!, nameFr = ['première', 'deuxième', 'troisième'][k]!;
    const ans = m * a[k]! + n * b[k]!;
    return {
      prompt: bi((f) => f.t(`Given ${f.m(`\\vec{a} = ${vec(f, a)}`)} and ${f.m(`\\vec{b} = ${vec(f, b)}`)}, what is the ${name} component of ${f.m(`${f.n(m)}\\vec{a} ${sgn(n)} ${f.n(Math.abs(n))}\\vec{b}`)}?`, `Sachant que ${f.m(`\\vec{a} = ${vec(f, a)}`)} et ${f.m(`\\vec{b} = ${vec(f, b)}`)}, quelle est la ${nameFr} composante de ${f.m(`${f.n(m)}\\vec{a} ${sgn(n)} ${f.n(Math.abs(n))}\\vec{b}`)} ?`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[m * a[k]! - n * b[k]!, same('Check the sign of the second scalar: it is added as written.', 'Vérifie le signe du deuxième scalaire : on l\'additionne tel qu\'il est écrit.'), 1], [m * a[k]! * n * b[k]!, same('Multiply each vector by its scalar, then add the components.', 'Multiplie chaque vecteur par son scalaire, puis additionne les composantes.'), 1]]),
      steps: [bi((f) => f.t(`Multiply each component by its scalar: ${f.m(`${f.n(m)}(${f.n(a[k]!)}) ${sgn(n)} ${f.n(Math.abs(n))}(${f.n(b[k]!)})`)}.`, `Multiplie chaque composante par son scalaire : ${f.m(`${f.n(m)}(${f.n(a[k]!)}) ${sgn(n)} ${f.n(Math.abs(n))}(${f.n(b[k]!)})`)}.`)), bi((f) => f.t(`That is ${f.N(ans)}.`, `Cela donne ${f.N(ans)}.`))],
      nudge: same('Work on one component at a time: scalar times the component, plus scalar times the other component.', 'Travaille une composante à la fois : scalaire fois la composante, plus scalaire fois l\'autre composante.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [2, 3]), a = mk(n), b = mk(n), ans = dot(a, b);
    return {
      prompt: bi((f) => f.t(`Find the dot product ${f.m(`\\vec{a} \\cdot \\vec{b}`)} for ${f.m(`\\vec{a} = ${vec(f, a)}`)} and ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`, `Trouve le produit scalaire ${f.m(`\\vec{a} \\cdot \\vec{b}`)} pour ${f.m(`\\vec{a} = ${vec(f, a)}`)} et ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[a.reduce((s, x, i) => s + x + b[i]!, 0), same('Multiply matching components, then add the products.', 'Multiplie les composantes correspondantes, puis additionne les produits.'), 0], [a.reduce((s, x, i) => s + Math.abs(x * b[i]!), 0), same('Keep the signs of the products.', 'Garde les signes des produits.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(a.map((x, i) => `(${f.n(x)})(${f.n(b[i]!)})`).join(' + '))}.`, `${f.m(a.map((x, i) => `(${f.n(x)})(${f.n(b[i]!)})`).join(' + '))}.`)), bi((f) => f.t(`The dot product is ${f.N(ans)}.`, `Le produit scalaire est ${f.N(ans)}.`))],
      nudge: same('Multiply the matching components and add.', 'Multiplie les composantes correspondantes et additionne.'),
    };
  }
  const a = mk(3), b = mk(3), cr = cross(a, b), k = randInt(r, 0, 2), name = ['x', 'y', 'z'][k]!;
  return {
    prompt: bi((f) => f.t(`Find the ${name}-component of ${f.m('\\vec{a} \\times \\vec{b}')} for ${f.m(`\\vec{a} = ${vec(f, a)}`)} and ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`, `Trouve la composante en ${name} de ${f.m('\\vec{a} \\times \\vec{b}')} pour ${f.m(`\\vec{a} = ${vec(f, a)}`)} et ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`)),
    answer: cr[k]!, category: 'TH',
    wrong: wr(cr[k]!, [[-cr[k]!, same('Check the order of the subtraction in the cross product formula.', 'Vérifie l\'ordre de la soustraction dans la formule du produit vectoriel.'), 1], [a[k]! * b[k]!, same('The cross product mixes the other two components: each term multiplies one from a and a different one from b.', 'Le produit vectoriel mélange les deux autres composantes : chaque terme multiplie une composante de a et une autre de b.'), 0]]),
    steps: [bi((f) => f.t(k === 0 ? 'The x-component is a2 b3 − a3 b2.' : k === 1 ? 'The y-component is a3 b1 − a1 b3.' : 'The z-component is a1 b2 − a2 b1.', k === 0 ? 'La composante en x est a2 b3 − a3 b2.' : k === 1 ? 'La composante en y est a3 b1 − a1 b3.' : 'La composante en z est a1 b2 − a2 b1.')), bi((f) => f.t(`Put in the values to get ${f.N(cr[k]!)}.`, `Remplace par les valeurs pour obtenir ${f.N(cr[k]!)}.`))],
    nudge: same('Use the cross product formula for that component: the two other components, cross-multiplied and subtracted.', 'Utilise la formule du produit vectoriel pour cette composante : les deux autres composantes, multipliées en croix et soustraites.'),
  };
});

/** MCV4U.C2: work, projections and perpendicular vectors */
export const vecApps12 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const F3 = [nz(r, -6, 8), nz(r, -6, 8), randInt(r, -4, 6)], d = [nz(r, 1, 7), randInt(r, 0, 6), randInt(r, 0, 5)], ans = dot(F3, d);
    return {
      prompt: bi((f) => f.t(`A force ${f.m(`\\vec{F} = ${vec(f, F3)}`)} newtons moves an object by ${f.m(`\\vec{d} = ${vec(f, d)}`)} metres. How much work is done, in joules?`, `Une force ${f.m(`\\vec{F} = ${vec(f, F3)}`)} newtons déplace un objet de ${f.m(`\\vec{d} = ${vec(f, d)}`)} mètres. Quel travail est effectué, en joules ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[Math.round(Math.hypot(...F3) * Math.hypot(...d)), same('Work is the dot product of force and displacement, not the product of their magnitudes.', 'Le travail est le produit scalaire de la force et du déplacement, et non le produit de leurs normes.'), 0], [F3.reduce((s, x, i) => s + x + d[i]!, 0), same('Multiply matching components, then add.', 'Multiplie les composantes correspondantes, puis additionne.'), 0]]),
      steps: [same('Work is the dot product of the force and the displacement.', 'Le travail est le produit scalaire de la force et du déplacement.'), bi((f) => f.t(`${f.m(F3.map((x, i) => `(${f.n(x)})(${f.n(d[i]!)})`).join(' + '))} = ${f.N(ans)} joules.`, `${f.m(F3.map((x, i) => `(${f.n(x)})(${f.n(d[i]!)})`).join(' + '))} = ${f.N(ans)} joules.`))],
      nudge: same('Work = force dot displacement.', 'Travail = force scalaire déplacement.'),
    };
  }
  if (tier === 2) {
    const u = nz(r, -3, 3), w = nz(r, -3, 3), b = [3, 4], bp = [-4, 3], a = [u * b[0]! + w * bp[0]!, u * b[1]! + w * bp[1]!], ans = 5 * u;
    return {
      prompt: bi((f) => f.t(`Find the scalar projection of ${f.m(`\\vec{a} = ${vec(f, a)}`)} on ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`, `Trouve la projection scalaire de ${f.m(`\\vec{a} = ${vec(f, a)}`)} sur ${f.m(`\\vec{b} = ${vec(f, b)}`)}.`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[dot(a, b), same('Divide the dot product by the magnitude of b.', 'Divise le produit scalaire par la norme de b.'), 1], [dot(a, b) / 25, same('Divide by the magnitude of b, which is the square root of the sum of squares, not the sum of squares.', 'Divise par la norme de b, qui est la racine carrée de la somme des carrés, et non la somme des carrés.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`\\vec{a} \\cdot \\vec{b} = ${f.n(dot(a, b))}`)} and ${f.m(`|\\vec{b}|`)} = 5.`, `${f.m(`\\vec{a} \\cdot \\vec{b} = ${f.n(dot(a, b))}`)} et ${f.m(`|\\vec{b}|`)} = 5.`)), bi((f) => f.t(`The scalar projection is ${f.m(`\\frac{${f.n(dot(a, b))}}{5}`)} = ${f.N(ans)}.`, `La projection scalaire est ${f.m(`\\frac{${f.n(dot(a, b))}}{5}`)} = ${f.N(ans)}.`))],
      nudge: same('Scalar projection = (a dot b) divided by the magnitude of b.', 'Projection scalaire = (a scalaire b) divisé par la norme de b.'),
    };
  }
  const [p, q] = pick(r, [[2, 3], [3, 4], [1, 2], [4, 3], [3, 2], [2, 5]] as [number, number][]), tt = nz(r, -3, 3), c = p * tt, k = -q * tt;
  return {
    prompt: bi((f) => f.t(`For what value of k are ${f.m(`\\vec{a} = (k, ${f.n(c)})`)} and ${f.m(`\\vec{b} = ${vec(f, [p, q])}`)} perpendicular?`, `Pour quelle valeur de k les vecteurs ${f.m(`\\vec{a} = (k, ${f.n(c)})`)} et ${f.m(`\\vec{b} = ${vec(f, [p, q])}`)} sont-ils perpendiculaires ?`)),
    answer: k, category: 'TH',
    wrong: wr(k, [[-k, same('Set the dot product to zero: kp plus the second product equals 0, then solve for k.', 'Pose le produit scalaire égal à zéro : kp plus le deuxième produit égale 0, puis résous pour k.'), 1], [c, same('Set the dot product to zero and solve for k.', 'Pose le produit scalaire égal à zéro et résous pour k.'), 0]]),
    steps: [bi((f) => f.t(`Perpendicular vectors have dot product 0: ${f.m(`${f.n(p)}k + ${f.n(q)}(${f.n(c)}) = 0`)}.`, `Des vecteurs perpendiculaires ont un produit scalaire nul : ${f.m(`${f.n(p)}k + ${f.n(q)}(${f.n(c)}) = 0`)}.`)), bi((f) => f.t(`${f.m(`${f.n(p)}k = ${f.n(-q * c)}`)}, so k = ${f.N(k)}.`, `${f.m(`${f.n(p)}k = ${f.n(-q * c)}`)}, donc k = ${f.N(k)}.`))],
    nudge: same('Set the dot product equal to zero and solve for k.', 'Pose le produit scalaire égal à zéro et résous pour k.'),
  };
});

/** MCV4U.C3: how lines and planes meet, from their equations */
export const configs12 = (id: string): Generator => choiceGen(id, (tier, r) => {
  const label = (en: string, fr: string): Text => t(en, fr);
  if (tier === 1) {
    const a = nz(r, -4, 4), b = nz(r, -4, 4), c = randInt(r, -6, 6), k = pick(r, [2, 3, -2]), kind = pick(r, ['point', 'parallel', 'same'] as const);
    const a2 = kind === 'point' ? a + pick(r, [1, 2]) : k * a, b2 = kind === 'point' ? b - pick(r, [0, 1]) : k * b, c2 = kind === 'same' ? k * c : kind === 'parallel' ? k * c + 3 : randInt(r, -6, 6);
    const det = a * b2 - a2 * b;
    const actual = det !== 0 ? 'point' : (a * c2 === a2 * c && b * c2 === b2 * c) ? 'same' : 'parallel';
    const opts: Record<string, Text> = { point: label('They meet at exactly one point', 'Elles se coupent en un seul point'), parallel: label('They are parallel and never meet', 'Elles sont parallèles et ne se coupent jamais'), same: label('They are the same line', 'Ce sont la même droite') };
    const m = mc(r, opts[actual]!, Object.keys(opts).filter((x) => x !== actual).map((x): [Text, Text] => [opts[x]!, label('Compare the coefficients: if a1 b2 is not a2 b1 the lines meet at a point; if the whole equations are multiples, they are the same line; otherwise they are parallel.', 'Compare les coefficients : si a1 b2 n\'égale pas a2 b1, les droites se coupent en un point ; si les équations sont multiples l\'une de l\'autre, ce sont la même droite ; sinon elles sont parallèles.')]));
    return {
      prompt: bi((f) => f.t(`How do the lines ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}y = ${f.n(c)}`)} and ${f.m(`${f.n(a2)}x ${sgn(b2)} ${f.n(Math.abs(b2))}y = ${f.n(c2)}`)} meet?`, `Comment les droites ${f.m(`${f.n(a)}x ${sgn(b)} ${f.n(Math.abs(b))}y = ${f.n(c)}`)} et ${f.m(`${f.n(a2)}x ${sgn(b2)} ${f.n(Math.abs(b2))}y = ${f.n(c2)}`)} se rencontrent-elles ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [bi((f) => f.t(`Compare ${f.m(`${f.n(a)} \\times ${f.n(b2)}`)} = ${f.N(a * b2)} with ${f.m(`${f.n(a2)} \\times ${f.n(b)}`)} = ${f.N(a2 * b)}.`, `Compare ${f.m(`${f.n(a)} \\times ${f.n(b2)}`)} = ${f.N(a * b2)} avec ${f.m(`${f.n(a2)} \\times ${f.n(b)}`)} = ${f.N(a2 * b)}.`)), same(actual === 'point' ? 'They are different, so the lines meet at one point.' : actual === 'same' ? 'They are equal, and the constants match too, so it is the same line.' : 'They are equal but the constants do not match, so the lines are parallel.', actual === 'point' ? 'Elles sont différentes : les droites se coupent en un point.' : actual === 'same' ? 'Elles sont égales et les constantes correspondent aussi : c\'est la même droite.' : 'Elles sont égales mais les constantes ne correspondent pas : les droites sont parallèles.')],
      nudge: same('Compare the ratios of the coefficients of x, y and the constants.', 'Compare les rapports des coefficients de x, de y et des constantes.'),
    };
  }
  const n = [nz(r, -4, 4), nz(r, -4, 4), nz(r, -4, 4)], d1 = randInt(r, -6, 6), k = pick(r, [2, 3, -2]), kind = pick(r, ['parallel', 'same', 'line'] as const);
  const n2 = kind === 'line' ? [n[0]! + 1, n[1]!, n[2]! + (tier === 3 ? 2 : 1)] : n.map((x) => k * x), d2 = kind === 'same' ? k * d1 : kind === 'parallel' ? k * d1 + 5 : randInt(r, -6, 6);
  const pro = n.every((x, i) => x * n2[1]! === n[1]! * n2[i]!) && n[0]! * n2[1]! === n[1]! * n2[0]!;
  const actual = pro ? (n[0]! * d2 === n2[0]! * d1 ? 'same' : 'parallel') : 'line';
  const opts: Record<string, Text> = { line: label('They intersect in a line', 'Ils se coupent selon une droite'), parallel: label('They are parallel and distinct', 'Ils sont parallèles et distincts'), same: label('They are the same plane', 'Ce sont le même plan') };
  const m = mc(r, opts[actual]!, Object.keys(opts).filter((x) => x !== actual).map((x): [Text, Text] => [opts[x]!, label('Compare the normal vectors: if they are not multiples the planes meet in a line; if they are multiples, check the constants for the same plane or parallel planes.', 'Compare les vecteurs normaux : s\'ils ne sont pas multiples, les plans se coupent selon une droite ; s\'ils sont multiples, vérifie les constantes pour savoir si ce sont le même plan ou des plans parallèles.')]));
  const eq = (f: F, v: number[], d: number): string => `${f.n(v[0]!)}x ${sgn(v[1]!)} ${f.n(Math.abs(v[1]!))}y ${sgn(v[2]!)} ${f.n(Math.abs(v[2]!))}z = ${f.n(d)}`;
  return {
    prompt: bi((f) => f.t(`How do the planes ${f.m(eq(f, n, d1))} and ${f.m(eq(f, n2, d2))} meet?`, `Comment les plans ${f.m(eq(f, n, d1))} et ${f.m(eq(f, n2, d2))} se rencontrent-ils ?`)),
    options: m.options, correct: m.correct, why: m.why, category: tier === 2 ? 'AP' : 'TH',
    steps: [same('The normal vectors are the coefficients of x, y and z. Check whether one is a multiple of the other.', 'Les vecteurs normaux sont les coefficients de x, de y et de z. Vérifie si l\'un est un multiple de l\'autre.'), same(actual === 'line' ? 'They are not multiples, so the planes cross in a line.' : actual === 'same' ? 'The whole equations are multiples, so it is the same plane.' : 'The normals are multiples but the constants do not match, so the planes are parallel.', actual === 'line' ? 'Ils ne sont pas multiples : les plans se coupent selon une droite.' : actual === 'same' ? 'Les équations sont multiples l\'une de l\'autre : c\'est le même plan.' : 'Les vecteurs normaux sont multiples mais les constantes ne correspondent pas : les plans sont parallèles.')],
    nudge: same('Compare the normal vectors, then the constants.', 'Compare les vecteurs normaux, puis les constantes.'),
  };
});

/** MCV4U.C4: equations of planes and lines */
export const lineplane12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mk = (): number[] => [nz(r, -4, 4), nz(r, -4, 4), nz(r, -4, 4)];
  if (tier === 1) {
    const n = mk(), P = [randInt(r, -4, 5), randInt(r, -4, 5), randInt(r, -4, 5)], D = dot(n, P);
    return {
      prompt: bi((f) => f.t(`A plane has normal vector ${f.m(`\\vec{n} = ${vec(f, n)}`)} and passes through ${f.m(`P${vec(f, P)}`)}. In its scalar equation ${f.m(`${f.n(n[0]!)}x ${sgn(n[1]!)} ${f.n(Math.abs(n[1]!))}y ${sgn(n[2]!)} ${f.n(Math.abs(n[2]!))}z = D`)}, what is D?`, `Un plan a pour vecteur normal ${f.m(`\\vec{n} = ${vec(f, n)}`)} et passe par ${f.m(`P${vec(f, P)}`)}. Dans son équation scalaire ${f.m(`${f.n(n[0]!)}x ${sgn(n[1]!)} ${f.n(Math.abs(n[1]!))}y ${sgn(n[2]!)} ${f.n(Math.abs(n[2]!))}z = D`)}, que vaut D ?`)),
      answer: D, category: 'KU',
      wrong: wr(D, [[-D, same('D is the dot product of the normal and the point, with its own sign.', 'D est le produit scalaire du vecteur normal et du point, avec son propre signe.'), 1], [n.reduce((s, x, i) => s + x + P[i]!, 0), same('Multiply matching components, then add.', 'Multiplie les composantes correspondantes, puis additionne.'), 0]]),
      steps: [same('Put the point into the left side of the equation: D = n dot P.', 'Remplace le point dans le membre de gauche de l\'équation : D = n scalaire P.'), bi((f) => f.t(`${f.m(n.map((x, i) => `(${f.n(x)})(${f.n(P[i]!)})`).join(' + '))} = ${f.N(D)}.`, `${f.m(n.map((x, i) => `(${f.n(x)})(${f.n(P[i]!)})`).join(' + '))} = ${f.N(D)}.`))],
      nudge: same('D is the dot product of the normal vector and a point on the plane.', 'D est le produit scalaire du vecteur normal et d\'un point du plan.'),
    };
  }
  if (tier === 2) {
    const P0 = [randInt(r, -5, 5), randInt(r, -5, 5), randInt(r, -5, 5)], d = mk(), tt = nz(r, -3, 4), k = randInt(r, 0, 2), name = ['x', 'y', 'z'][k]!, ans = P0[k]! + tt * d[k]!;
    return {
      prompt: bi((f) => f.t(`A line has vector equation ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)}. What is the ${name}-coordinate of the point on the line where t = ${f.N(tt)}?`, `Une droite a pour équation vectorielle ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)}. Quelle est la coordonnée ${name} du point de la droite où t = ${f.N(tt)} ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[P0[k]! + d[k]!, same('Multiply the direction by t before adding.', 'Multiplie le vecteur directeur par t avant d\'additionner.'), 1], [tt * d[k]!, same('Add the starting point.', 'Ajoute le point de départ.'), 1], [P0[k]! - tt * d[k]!, same('The parameter is added: starting point plus t times the direction.', 'Le paramètre s\'additionne : point de départ plus t fois le vecteur directeur.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(P0[k]!)} + (${f.n(tt)})(${f.n(d[k]!)})`)}.`, `${f.m(`${f.n(P0[k]!)} + (${f.n(tt)})(${f.n(d[k]!)})`)}.`)), bi((f) => f.t(`The ${name}-coordinate is ${f.N(ans)}.`, `La coordonnée ${name} est ${f.N(ans)}.`))],
      nudge: same('Point = starting point + t times the direction vector, one coordinate at a time.', 'Point = point de départ + t fois le vecteur directeur, une coordonnée à la fois.'),
    };
  }
  const [p, q, s, h] = pick(r, TRIPLES3), n = signs(r, shuffled(r, [p, q, s])), P = [randInt(r, -4, 5), randInt(r, -4, 5), randInt(r, -4, 5)], m = nz(r, -4, 4), D = dot(n, P) - h * m;
  return {
    prompt: bi((f) => f.t(`How far is the point ${f.m(`P${vec(f, P)}`)} from the plane ${f.m(`${f.n(n[0]!)}x ${sgn(n[1]!)} ${f.n(Math.abs(n[1]!))}y ${sgn(n[2]!)} ${f.n(Math.abs(n[2]!))}z = ${f.n(D)}`)}?`, `À quelle distance le point ${f.m(`P${vec(f, P)}`)} est-il du plan ${f.m(`${f.n(n[0]!)}x ${sgn(n[1]!)} ${f.n(Math.abs(n[1]!))}y ${sgn(n[2]!)} ${f.n(Math.abs(n[2]!))}z = ${f.n(D)}`)} ?`)),
    answer: Math.abs(m), category: 'TH',
    wrong: wr(Math.abs(m), [[Math.abs(m) * h, same('Divide by the magnitude of the normal vector.', 'Divise par la norme du vecteur normal.'), 1], [Math.abs(dot(n, P) - D) / (h * h), same('Divide by the magnitude of the normal (the square root), not by its square.', 'Divise par la norme du vecteur normal (la racine carrée), et non par son carré.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`|${n.map((x, i) => `(${f.n(x)})(${f.n(P[i]!)})`).join(' + ')} - (${f.n(D)})|`)} = ${f.N(Math.abs(m) * h)}, and ${f.m('|\\vec{n}|')} = ${f.N(h)}.`, `${f.m(`|${n.map((x, i) => `(${f.n(x)})(${f.n(P[i]!)})`).join(' + ')} - (${f.n(D)})|`)} = ${f.N(Math.abs(m) * h)}, et ${f.m('|\\vec{n}|')} = ${f.N(h)}.`)), bi((f) => f.t(`The distance is ${f.m(`\\frac{${f.n(Math.abs(m) * h)}}{${f.n(h)}}`)} = ${f.N(Math.abs(m))}.`, `La distance est ${f.m(`\\frac{${f.n(Math.abs(m) * h)}}{${f.n(h)}}`)} = ${f.N(Math.abs(m))}.`))],
    nudge: same('Distance = |a x0 + b y0 + c z0 − D| divided by the magnitude of the normal.', 'Distance = |a x0 + b y0 + c z0 − D| divisé par la norme du vecteur normal.'),
  };
});

/** MCV4U.C4: where a line meets a plane */
export const lineMeetsPlane12 = (id: string): Generator => numGen(id, (tier, r) => {
  const mk = (): number[] => [nz(r, -3, 3), nz(r, -3, 3), nz(r, -3, 3)];
  if (tier === 1) {
    const d = mk(), tt = nz(r, -4, 4), P0 = [randInt(r, -4, 4), randInt(r, -4, 4), -tt * d[2]!];
    return {
      prompt: bi((f) => f.t(`A line has vector equation ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)}. For what value of t does it cross the xy-plane (z = 0)?`, `Une droite a pour équation vectorielle ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)}. Pour quelle valeur de t coupe-t-elle le plan xy (z = 0) ?`)),
      answer: tt, category: 'KU',
      wrong: wr(tt, [[-tt, same('Set the z-coordinate to zero: z0 plus t times dz equals 0, then solve for t.', 'Pose la coordonnée z égale à zéro : z0 plus t fois dz égale 0, puis résous pour t.'), 1], [P0[2]!, same('That is the starting z. Solve for t.', 'C\'est le z de départ. Résous pour t.'), 0]]),
      steps: [bi((f) => f.t(`The z-coordinate is ${f.m(`${f.n(P0[2]!)} + ${f.n(d[2]!)}t`)}. Set it to 0.`, `La coordonnée z est ${f.m(`${f.n(P0[2]!)} + ${f.n(d[2]!)}t`)}. Pose-la égale à 0.`)), bi((f) => f.t(`${f.m(`t = \\frac{${f.n(-P0[2]!)}}{${f.n(d[2]!)}}`)} = ${f.N(tt)}.`, `${f.m(`t = \\frac{${f.n(-P0[2]!)}}{${f.n(d[2]!)}}`)} = ${f.N(tt)}.`))],
      nudge: same('Set the z-coordinate of the line equal to zero and solve for t.', 'Pose la coordonnée z de la droite égale à zéro et résous pour t.'),
    };
  }
  const n = mk(), d = mk();
  let dn = dot(n, d); while (dn === 0) { d[0] = nz(r, -3, 3); dn = dot(n, d); }
  const tt = nz(r, -3, 3), P0 = [randInt(r, -4, 4), randInt(r, -4, 4), randInt(r, -4, 4)], hit = P0.map((x, i) => x + tt * d[i]!), D = dot(n, hit);
  const k = randInt(r, 0, 2), name = ['x', 'y', 'z'][k]!;
  const plane = (f: F): string => `${f.n(n[0]!)}x ${sgn(n[1]!)} ${f.n(Math.abs(n[1]!))}y ${sgn(n[2]!)} ${f.n(Math.abs(n[2]!))}z = ${f.n(D)}`;
  const ans = tier === 2 ? tt : hit[k]!;
  return {
    prompt: bi((f) => f.t(`The line ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)} meets the plane ${f.m(plane(f))}. What is ${tier === 2 ? 'the value of t' : `the ${name}-coordinate of the point where they meet`}?`, `La droite ${f.m(`\\vec{r} = ${vec(f, P0)} + t${vec(f, d)}`)} rencontre le plan ${f.m(plane(f))}. Quelle est ${tier === 2 ? 'la valeur de t' : `la coordonnée ${name} du point de rencontre`} ?`)),
    answer: ans, category: tier === 2 ? 'AP' : 'TH',
    wrong: wr(ans, [[tier === 2 ? -tt : hit[k]! - tt * d[k]!, same(tier === 2 ? 'Put the line into the plane equation: the coefficient of t is n dot d and the constant is n dot P0 minus D.' : 'First find t, then put it into that coordinate of the line.', tier === 2 ? 'Remplace la droite dans l\'équation du plan : le coefficient de t est n scalaire d et la constante est n scalaire P0 moins D.' : 'Trouve d\'abord t, puis remplace-le dans cette coordonnée de la droite.'), 1], [tier === 2 ? tt + 1 : P0[k]!, same(tier === 2 ? 'Check the arithmetic when you put the line into the plane equation.' : 'That is the starting point. Add t times the direction.', tier === 2 ? 'Vérifie le calcul quand tu remplaces la droite dans l\'équation du plan.' : 'C\'est le point de départ. Ajoute t fois le vecteur directeur.'), 1]]),
    steps: [bi((f) => f.t(`Put the line into the plane: ${f.m(`${f.n(dot(n, P0))} + ${f.n(dn)}t = ${f.n(D)}`)}.`, `Remplace la droite dans le plan : ${f.m(`${f.n(dot(n, P0))} + ${f.n(dn)}t = ${f.n(D)}`)}.`)), bi((f) => f.t(tier === 2 ? `So t = ${f.N(tt)}.` : `So t = ${f.N(tt)}, and the ${name}-coordinate is ${f.m(`${f.n(P0[k]!)} + (${f.n(tt)})(${f.n(d[k]!)})`)} = ${f.N(ans)}.`, tier === 2 ? `Donc t = ${f.N(tt)}.` : `Donc t = ${f.N(tt)}, et la coordonnée ${name} est ${f.m(`${f.n(P0[k]!)} + (${f.n(tt)})(${f.n(d[k]!)})`)} = ${f.N(ans)}.`))],
    nudge: same(`Put x, y and z from the line into the plane equation, solve for t${tier === 3 ? ', then find the coordinate' : ''}.`, `Remplace x, y et z de la droite dans l'équation du plan, résous pour t${tier === 3 ? ', puis trouve la coordonnée' : ''}.`),
  };
});
