// Grade 10 geometry (MPM2D B2, C1 to C3 and MFM2P A1 to A3): midpoint, distance and circles, similar triangles, right-triangle
// trigonometry, the sine and cosine laws, and the imperial system. Trigonometric answers are rounded to one decimal.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const nonzero = (r: () => number, lo: number, hi: number): number => { let v = 0; while (v === 0) v = randInt(r, lo, hi); return v; };
const pt = (f: F, x: number, y: number): string => `(${f.n(x)},\\ ${f.n(y)})`;
const deg = (f: F, x: number): string => f.m(`${f.n(x)}^{\\circ}`);
const rad = (d: number): number => (d * Math.PI) / 180;
const toDeg = (x: number): number => (x * 180) / Math.PI;
const r1 = (x: number): number => Math.round(x * 10) / 10;
/** Wrong answers for rounded answers: far enough from the right one that rounding cannot make them correct. */
const far = (ans: number, list: [number, Text, number?][]): [number, Text, number?][] => wr(ans, list.filter(([v]) => Math.abs(v - ans) > 0.3).map(([v, w, s]) => [r1(v), w, s] as [number, Text, number?]));
const TOL = 0.05;
const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]];

// ── analytic geometry ───────────────────────────────────────────────────────────

export const midpointGen = (id: string): Generator => numGen(id, (tier, r) => {
  const lo = tier === 1 ? 0 : -9;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  do { x1 = randInt(r, lo, 10); x2 = randInt(r, lo, 10); y1 = randInt(r, lo, 10); y2 = randInt(r, lo, 10); } while ((x1 + x2) % 2 !== 0 || (y1 + y2) % 2 !== 0 || x1 === x2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  if (tier < 3) {
    return {
      prompt: bi((f) => f.t(`What is the x-coordinate of the midpoint of ${f.m(pt(f, x1, y1))} and ${f.m(pt(f, x2, y2))}?`, `Quelle est l'abscisse du milieu de ${f.m(pt(f, x1, y1))} et ${f.m(pt(f, x2, y2))} ?`)),
      answer: mx, category: 'KU',
      wrong: wr(mx, [[x1 + x2, t('That is the sum. Divide it by 2 to find the middle.', 'C\'est la somme. Divise-la par 2 pour trouver le milieu.'), 1], [Math.abs(x2 - x1) / 2, t('That is half the distance between the x-values. The midpoint is the average of the x-values.', 'C\'est la moitié de l\'écart entre les valeurs de x. Le milieu est la moyenne des valeurs de x.'), 0], [(y1 + y2) / 2, t('That is the y-coordinate of the midpoint. The question asks for x.', 'C\'est l\'ordonnée du milieu. La question demande l\'abscisse.'), 0]]),
      steps: [t('The midpoint\'s x-coordinate is the average of the two x-values.', 'L\'abscisse du milieu est la moyenne des deux valeurs de x.'), bi((f) => f.t(`${f.m(`\\frac{${f.n(x1)} + ${x2 < 0 ? `(${f.n(x2)})` : f.n(x2)}}{2}`)} = ${f.N(mx)}.`, `${f.m(`\\frac{${f.n(x1)} + ${x2 < 0 ? `(${f.n(x2)})` : f.n(x2)}}{2}`)} = ${f.N(mx)}.`))],
      nudge: t('Add the two x-values and divide by 2.', 'Additionne les deux valeurs de x et divise par 2.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`The midpoint of segment AB is ${f.m(pt(f, mx, my))}. A is ${f.m(pt(f, x1, y1))}. What is the x-coordinate of B?`, `Le milieu du segment AB est ${f.m(pt(f, mx, my))}. A est ${f.m(pt(f, x1, y1))}. Quelle est l'abscisse de B ?`)),
    answer: x2, category: 'AP',
    wrong: wr(x2, [[mx, t('That is the midpoint. B is as far beyond the midpoint as A is before it.', 'C\'est le milieu. B est aussi loin après le milieu que A l\'est avant.'), 0], [mx - x1, t('That is the step from A to the midpoint. B is one more step beyond it.', 'C\'est le pas de A au milieu. B est un pas de plus après.'), 0], [mx + x1, t('Use the average formula backwards: x₂ = 2 × (midpoint) − x₁.', 'Utilise la formule de la moyenne à l\'envers : x₂ = 2 × (milieu) − x₁.'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`\\frac{x_1 + x_2}{2} = ${f.n(mx)}`)}, so ${f.m(`x_1 + x_2 = ${f.n(2 * mx)}`)}.`, `${f.m(`\\frac{x_1 + x_2}{2} = ${f.n(mx)}`)}, donc ${f.m(`x_1 + x_2 = ${f.n(2 * mx)}`)}.`)), bi((f) => f.t(`${f.m(`x_2 = ${f.n(2 * mx)} - ${x1 < 0 ? `(${f.n(x1)})` : f.n(x1)}`)} = ${f.N(x2)}.`, `${f.m(`x_2 = ${f.n(2 * mx)} - ${x1 < 0 ? `(${f.n(x1)})` : f.n(x1)}`)} = ${f.N(x2)}.`))],
    nudge: t('The midpoint is the average, so x₁ + x₂ is twice the midpoint\'s x.', 'Le milieu est la moyenne : x₁ + x₂ vaut le double de l\'abscisse du milieu.'),
  };
});

export const distanceGen = (id: string): Generator => numGen(id, (tier, r) => {
  const [a, b, c] = pick(r, tier === 1 ? TRIPLES.slice(0, 2) : TRIPLES);
  const sx = pick(r, [1, -1]), sy = pick(r, [1, -1]);
  const x1 = randInt(r, -6, 6), y1 = randInt(r, -6, 6), x2 = x1 + sx * a, y2 = y1 + sy * b;
  if (tier < 3) {
    return {
      prompt: bi((f) => f.t(`What is the distance between ${f.m(pt(f, x1, y1))} and ${f.m(pt(f, x2, y2))}?`, `Quelle est la distance entre ${f.m(pt(f, x1, y1))} et ${f.m(pt(f, x2, y2))} ?`)),
      answer: c, category: 'KU',
      wrong: wr(c, [[a + b, t('That adds the horizontal and vertical distances. The straight line between the points is shorter: use the distance formula.', 'Cela additionne les distances horizontale et verticale. La ligne droite entre les points est plus courte : utilise la formule de distance.'), 1], [c * c, t('That is the distance squared. Take the square root.', 'C\'est la distance au carré. Prends la racine carrée.'), 1], [Math.abs(a - b), t('Add the squares of the differences, then take the square root.', 'Additionne les carrés des différences, puis prends la racine carrée.'), 1]]),
      steps: [bi((f) => f.t(`Horizontal change ${f.N(a)}, vertical change ${f.N(b)}.`, `Variation horizontale ${f.N(a)}, variation verticale ${f.N(b)}.`)), bi((f) => f.t(`${f.m(`d = \\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}} = \\sqrt{${f.n(c * c)}}`)} = ${f.N(c)}.`, `${f.m(`d = \\sqrt{${f.n(a)}^{2} + ${f.n(b)}^{2}} = \\sqrt{${f.n(c * c)}}`)} = ${f.N(c)}.`))],
      nudge: t('Find the horizontal and vertical changes, square them, add, and take the square root.', 'Trouve les variations horizontale et verticale, élève-les au carré, additionne et prends la racine carrée.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`The distance from ${f.m('(0,\\ 0)')} to ${f.m(`(k,\\ ${f.n(b)})`)} is ${f.N(c)}, and k is positive. What is k?`, `La distance de ${f.m('(0,\\ 0)')} à ${f.m(`(k,\\ ${f.n(b)})`)} est ${f.N(c)}, et k est positif. Que vaut k ?`)),
    answer: a, category: 'AP',
    wrong: wr(a, [[c - b, t('Distances do not subtract like that. Square the distance and subtract the squares.', 'Les distances ne se soustraient pas ainsi. Élève la distance au carré et soustrais les carrés.'), 1], [c * c - b * b, t('That is k². Take the square root.', 'C\'est k². Prends la racine carrée.'), 1], [b, t('That is the y-coordinate. Solve k² + y² = d² for k.', 'C\'est l\'ordonnée. Résous k² + y² = d² pour k.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`k^{2} + ${f.n(b)}^{2} = ${f.n(c)}^{2}`)}, so ${f.m(`k^{2} = ${f.n(c * c - b * b)}`)}.`, `${f.m(`k^{2} + ${f.n(b)}^{2} = ${f.n(c)}^{2}`)}, donc ${f.m(`k^{2} = ${f.n(c * c - b * b)}`)}.`)), bi((f) => f.t(`k is positive, so k = ${f.N(a)}.`, `k est positif : k = ${f.N(a)}.`))],
    nudge: t('Use the distance formula and square both sides.', 'Utilise la formule de distance et élève les deux membres au carré.'),
  };
});

export const circleGen = (id: string): Generator => {
  const radius = numGen(id, (_tier, r) => {
    const n = randInt(r, 2, 15);
    return {
      prompt: bi((f) => f.t(`A circle has equation ${f.m(`x^{2} + y^{2} = ${f.n(n * n)}`)}. What is its radius?`, `Un cercle a pour équation ${f.m(`x^{2} + y^{2} = ${f.n(n * n)}`)}. Quel est son rayon ?`)),
      answer: n, category: 'KU',
      wrong: wr(n, [[n * n, t('That is r². Take the square root to get the radius.', 'C\'est r². Prends la racine carrée pour obtenir le rayon.'), 0], [(n * n) / 2, t('Do not halve it. The number on the right is r², so take its square root.', 'Ne le divise pas par 2. Le nombre de droite est r² : prends sa racine carrée.'), 0]]),
      steps: [t('A circle centred at the origin is x² + y² = r².', 'Un cercle centré à l\'origine est x² + y² = r².'), bi((f) => f.t(`${f.m(`r^{2} = ${f.n(n * n)}`)}, so r = ${f.N(n)}.`, `${f.m(`r^{2} = ${f.n(n * n)}`)}, donc r = ${f.N(n)}.`))],
      nudge: t('The number on the right side is r². Take its square root.', 'Le nombre de droite est r². Prends sa racine carrée.'),
    };
  });
  const onCircle = choiceGen(id, (_tier, r) => {
    const [a, b, c] = pick(r, TRIPLES);
    const sa = pick(r, [1, -1]), sb = pick(r, [1, -1]);
    const m = mc(r, bi((f) => f.m(pt(f, sa * a, sb * b))), [[bi((f) => f.m(pt(f, sa * a, sb * (b + 1)))), t('Check: x² + y² must equal r². This point gives something different.', 'Vérifie : x² + y² doit égaler r². Ce point donne autre chose.')], [bi((f) => f.m(pt(f, sa * (a + 1), sb * b))), t('Check: x² + y² must equal r². This point gives something different.', 'Vérifie : x² + y² doit égaler r². Ce point donne autre chose.')], [bi((f) => f.m(pt(f, sa * (a - 1), sb * (b + 1)))), t('Check: x² + y² must equal r². This point gives something different.', 'Vérifie : x² + y² doit égaler r². Ce point donne autre chose.')]]);
    return {
      prompt: bi((f) => f.t(`Which point is on the circle ${f.m(`x^{2} + y^{2} = ${f.n(c * c)}`)}?`, `Quel point est sur le cercle ${f.m(`x^{2} + y^{2} = ${f.n(c * c)}`)} ?`)),
      options: m.options, correct: m.correct, why: m.why, category: 'KU',
      steps: [t('A point is on the circle when its coordinates make the equation true.', 'Un point est sur le cercle quand ses coordonnées rendent l\'équation vraie.'), bi((f) => f.t(`${f.m(`${f.n(a)}^{2} + ${f.n(b)}^{2} = ${f.n(a * a)} + ${f.n(b * b)} = ${f.n(c * c)}`)}.`, `${f.m(`${f.n(a)}^{2} + ${f.n(b)}^{2} = ${f.n(a * a)} + ${f.n(b * b)} = ${f.n(c * c)}`)}.`))],
      nudge: t('Put each point\'s x and y in x² + y² and compare with the right side.', 'Remplace le x et le y de chaque point dans x² + y² et compare avec le membre de droite.'),
    };
  });
  const findY = numGen(id, (_tier, r) => {
    const [a0, b0, c] = pick(r, TRIPLES), flip = r() < 0.5, sg = pick(r, [1, -1]);
    const a = flip ? b0 : a0, b = flip ? a0 : b0, xs = sg * a;
    return {
      prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(xs)},\\ y)`)} is on the circle ${f.m(`x^{2} + y^{2} = ${f.n(c * c)}`)}, and y is positive. What is y?`, `Le point ${f.m(`(${f.n(xs)},\\ y)`)} est sur le cercle ${f.m(`x^{2} + y^{2} = ${f.n(c * c)}`)}, et y est positif. Que vaut y ?`)),
      answer: b, category: 'AP',
      wrong: wr(b, [[c - a, t('Do not subtract the numbers. Square x, subtract from r², then take the square root.', 'Ne soustrais pas les nombres. Élève x au carré, soustrais de r², puis prends la racine carrée.'), 1], [c * c - a * a, t('That is y². Take the square root.', 'C\'est y². Prends la racine carrée.'), 1], [a, t('Solve y² = r² − x² for y.', 'Résous y² = r² − x² pour y.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(a)}^{2} + y^{2} = ${f.n(c * c)}`)}, so ${f.m(`y^{2} = ${f.n(c * c - a * a)}`)}.`, `${f.m(`${f.n(a)}^{2} + y^{2} = ${f.n(c * c)}`)}, donc ${f.m(`y^{2} = ${f.n(c * c - a * a)}`)}.`)), bi((f) => f.t(`y is positive, so y = ${f.N(b)}.`, `y est positif : y = ${f.N(b)}.`))],
      nudge: t('Put x in the equation and solve for y².', 'Remplace x dans l\'équation et résous pour y².'),
    };
  });
  return (tier, seed) => (tier === 1 ? radius : tier === 2 ? onCircle : findY)(tier, seed);
};

// ── similar triangles ───────────────────────────────────────────────────────────

export const similarGen = (id: string): Generator => numGen(id, (tier, r) => {
  const a = randInt(r, 3, 9), b = randInt(r, a + 1, 14);
  if (tier === 3) {
    const [p, sp] = pick(r, [[2, 3], [3, 4], [4, 5], [3, 2], [6, 5]] as [number, number][]), m = randInt(r, 3, 8);
    const tree = p * m, ts = sp * m;
    return {
      prompt: bi((f) => f.t(`A ${f.N(p)} m post casts a shadow ${f.N(sp)} m long. At the same time a tree casts a shadow ${f.N(ts)} m long. How tall is the tree, in metres?`, `Un poteau de ${f.N(p)} m projette une ombre de ${f.N(sp)} m. Au même moment, un arbre projette une ombre de ${f.N(ts)} m. Quelle est la hauteur de l'arbre, en mètres ?`)),
      answer: tree, category: 'AP',
      wrong: wr(tree, [[ts, t('That is the length of the tree\'s shadow. The height uses the same ratio as the post.', 'C\'est la longueur de l\'ombre de l\'arbre. La hauteur suit le même rapport que celui du poteau.'), 1], [p + (ts - sp), t('The triangles are similar, so the sides are in proportion, not shifted by adding.', 'Les triangles sont semblables : les côtés sont proportionnels, pas décalés par addition.'), 1], [(sp * ts) / p, t('The ratio is upside down: height ÷ shadow is the same for both.', 'Le rapport est à l\'envers : hauteur ÷ ombre est le même pour les deux.'), 1]]),
      steps: [bi((f) => f.t(`The triangles are similar, so height ÷ shadow is the same: ${f.m(`\\frac{${f.n(p)}}{${f.n(sp)}} = \\frac{h}{${f.n(ts)}}`)}.`, `Les triangles sont semblables : hauteur ÷ ombre est le même rapport : ${f.m(`\\frac{${f.n(p)}}{${f.n(sp)}} = \\frac{h}{${f.n(ts)}}`)}.`)), bi((f) => f.t(`The tree's shadow is ${f.N(m)} times as long, so the tree is ${f.N(m)} times as tall: h = ${f.N(tree)}.`, `L'ombre de l'arbre est ${f.N(m)} fois plus longue : l'arbre est ${f.N(m)} fois plus haut : h = ${f.N(tree)}.`))],
      nudge: t('Similar triangles have equal ratios. Write height ÷ shadow for both.', 'Les triangles semblables ont des rapports égaux. Écris hauteur ÷ ombre pour les deux.'),
    };
  }
  const k = tier === 1 ? randInt(r, 2, 5) : pick(r, [1.5, 2.5, 3.5, 0.5]);
  const sa = tier === 1 ? a : a * 2, sb = tier === 1 ? b : b * 2;
  const x = sb * k, c1 = sa * k;
  return {
    prompt: bi((f) => f.t(`Two triangles are similar. In the smaller one two sides are ${f.N(sa)} cm and ${f.N(sb)} cm. In the larger one the side matching ${f.N(sa)} cm is ${f.N(c1)} cm. What is the side matching ${f.N(sb)} cm, in cm?`, `Deux triangles sont semblables. Dans le plus petit, deux côtés mesurent ${f.N(sa)} cm et ${f.N(sb)} cm. Dans le plus grand, le côté qui correspond à ${f.N(sa)} cm mesure ${f.N(c1)} cm. Quelle est la longueur du côté qui correspond à ${f.N(sb)} cm, en cm ?`)),
    answer: x, category: 'AP',
    wrong: wr(x, [[sb + (c1 - sa), t('Similar triangles scale by multiplying, not by adding the same amount.', 'Les triangles semblables changent d\'échelle par multiplication, pas en ajoutant le même montant.'), 1], [(sb * sa) / c1, t('The ratio was turned upside down. The larger triangle has the larger sides.', 'Le rapport est à l\'envers. Le plus grand triangle a les plus grands côtés.'), 1], [c1 + sb, t('Find the scale factor first, then multiply.', 'Trouve d\'abord le facteur d\'échelle, puis multiplie.'), 1]]),
    steps: [bi((f) => f.t(`Scale factor = ${f.m(`${f.n(c1)} \\div ${f.n(sa)}`)} = ${f.N(k)}.`, `Facteur d'échelle = ${f.m(`${f.n(c1)} \\div ${f.n(sa)}`)} = ${f.N(k)}.`)), bi((f) => f.t(`${f.m(`${f.n(sb)} \\times ${f.n(k)}`)} = ${f.N(x)} cm.`, `${f.m(`${f.n(sb)} \\times ${f.n(k)}`)} = ${f.N(x)} cm.`))],
    nudge: t('Find the scale factor from the pair of matching sides, then use it on the other side.', 'Trouve le facteur d\'échelle avec la paire de côtés correspondants, puis applique-le à l\'autre côté.'),
  };
});

// ── right-triangle trigonometry ─────────────────────────────────────────────────

const RATIO = { sin: { f: Math.sin, known: 'hypotenuse', ask: 'opposite' }, cos: { f: Math.cos, known: 'hypotenuse', ask: 'adjacent' }, tan: { f: Math.tan, known: 'adjacent', ask: 'opposite' } } as const;
const FR: Record<string, string> = { hypotenuse: 'l\'hypoténuse', opposite: 'le côté opposé', adjacent: 'le côté adjacent' };
export const trigSideGen = (id: string): Generator => numGen(id, (tier, r) => {
  const th = randInt(r, 4, 14) * 5, s = (tier === 1 ? 6 : 12) + 0, k = randInt(r, 2, 9);
  const which = tier === 1 ? 'sin' : pick(r, ['sin', 'cos', 'tan'] as const);
  const RT = RATIO[which];
  if (tier === 3) {
    const opp = randInt(r, 4, 20), ans = r1(opp / Math.sin(rad(th)));
    return {
      prompt: bi((f) => f.t(`In a right triangle, the angle ${deg(f, th)} is opposite a side of ${f.N(opp)} cm. What is the length of the hypotenuse, in cm? Round to one decimal.`, `Dans un triangle rectangle, l'angle ${deg(f, th)} est opposé à un côté de ${f.N(opp)} cm. Quelle est la longueur de l'hypoténuse, en cm ? Arrondis à une décimale.`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[opp * Math.sin(rad(th)), t('The unknown is in the denominator: hypotenuse = opposite ÷ sin θ, not times.', 'L\'inconnue est au dénominateur : hypoténuse = opposé ÷ sin θ, pas fois.'), 1], [opp / Math.cos(rad(th)), t('Opposite and hypotenuse go with sine, not cosine.', 'L\'opposé et l\'hypoténuse vont avec le sinus, pas le cosinus.'), 0], [opp / Math.tan(rad(th)), t('Opposite and hypotenuse go with sine, not tangent.', 'L\'opposé et l\'hypoténuse vont avec le sinus, pas la tangente.'), 0]]),
      steps: [bi((f) => f.t(`Opposite and hypotenuse: use sine. ${f.m(`\\sin ${f.n(th)}^{\\circ} = \\frac{${f.n(opp)}}{h}`)}.`, `Opposé et hypoténuse : utilise le sinus. ${f.m(`\\sin ${f.n(th)}^{\\circ} = \\frac{${f.n(opp)}}{h}`)}.`)), bi((f) => f.t(`${f.m(`h = \\frac{${f.n(opp)}}{\\sin ${f.n(th)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`, `${f.m(`h = \\frac{${f.n(opp)}}{\\sin ${f.n(th)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`))],
      nudge: t('Which sides are involved? Choose sin, cos or tan, then solve for the unknown.', 'Quels côtés sont en cause ? Choisis sin, cos ou tan, puis résous pour l\'inconnue.'),
    };
  }
  const known = which === 'tan' ? 'adjacent' : 'hypotenuse', ask = RT.ask;
  const given = tier === 1 ? s : s + k, ans = r1(given * RT.f(rad(th)));
  const other = (['sin', 'cos', 'tan'] as const).filter((w) => w !== which);
  return {
    prompt: bi((f) => f.t(`In a right triangle, one acute angle is ${deg(f, th)} and the ${known} is ${f.N(given)} cm. What is the length of the ${ask} side, in cm? Round to one decimal.`, `Dans un triangle rectangle, un angle aigu mesure ${deg(f, th)} et ${FR[known]} mesure ${f.N(given)} cm. Quelle est la longueur de ${FR[ask]}, en cm ? Arrondis à une décimale.`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[given * RATIO[other[0]!].f(rad(th)), t(`That uses ${other[0]} instead of ${which}. Match the two sides in the problem to sin, cos or tan.`, `Cela utilise ${other[0]} au lieu de ${which}. Associe les deux côtés du problème à sin, cos ou tan.`), 0], [given * RATIO[other[1]!].f(rad(th)), t(`That uses ${other[1]} instead of ${which}. Match the two sides in the problem to sin, cos or tan.`, `Cela utilise ${other[1]} au lieu de ${which}. Associe les deux côtés du problème à sin, cos ou tan.`), 0], [given / RT.f(rad(th)), t('The known side is multiplied by the ratio, not divided.', 'Le côté connu est multiplié par le rapport, pas divisé.'), 1], [given * RT.f(th), t('The calculator must be in degree mode.', 'La calculatrice doit être en mode degrés.'), 1]]),
    steps: [bi((f) => f.t(`The ${known} and the ${ask} side go with ${which}: ${f.m(`${which === 'sin' ? '\\sin' : which === 'cos' ? '\\cos' : '\\tan'} ${f.n(th)}^{\\circ}`)} = ${ask} ÷ ${known}.`, `${FR[known]!.replace(/^l'/, 'L\'').replace(/^le /, 'Le ')} et ${FR[ask]} vont avec ${which} : ${f.m(`${which === 'sin' ? '\\sin' : which === 'cos' ? '\\cos' : '\\tan'} ${f.n(th)}^{\\circ}`)} = ${ask === 'opposite' ? 'opposé' : 'adjacent'} ÷ ${known === 'hypotenuse' ? 'hypoténuse' : 'adjacent'}.`)), bi((f) => f.t(`${f.m(`${f.n(given)} \\times ${which === 'sin' ? '\\sin' : which === 'cos' ? '\\cos' : '\\tan'} ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} cm.`, `${f.m(`${f.n(given)} \\times ${which === 'sin' ? '\\sin' : which === 'cos' ? '\\cos' : '\\tan'} ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} cm.`))],
    nudge: t('Name the two sides involved (opposite, adjacent, hypotenuse), then pick sin, cos or tan.', 'Nomme les deux côtés en cause (opposé, adjacent, hypoténuse), puis choisis sin, cos ou tan.'),
  };
});

export const trigAngleGen = (id: string): Generator => numGen(id, (tier, r) => {
  const pairs = tier === 1 ? [[3, 5], [4, 5], [3, 4]] : [[7, 10], [5, 9], [6, 11], [8, 13], [9, 14], [4, 7]];
  const [p, q] = pick(r, pairs) as [number, number];
  const which = tier === 1 ? pick(r, ['sin', 'cos'] as const) : pick(r, ['sin', 'cos', 'tan'] as const);
  const ratio = which === 'tan' ? p / q : p / q;
  const ans = r1(which === 'sin' ? toDeg(Math.asin(ratio)) : which === 'cos' ? toDeg(Math.acos(ratio)) : toDeg(Math.atan(ratio)));
  const [n1, n2] = which === 'sin' ? ['opposite', 'hypotenuse'] : which === 'cos' ? ['adjacent', 'hypotenuse'] : ['opposite', 'adjacent'];
  const name = which === 'sin' ? '\\sin' : which === 'cos' ? '\\cos' : '\\tan';
  return {
    prompt: bi((f) => f.t(`In a right triangle the side ${n1} to angle A is ${f.N(p)} cm and the ${n2} side is ${f.N(q)} cm. Find angle A to one decimal.`, `Dans un triangle rectangle, le côté ${n1 === 'opposite' ? 'opposé' : 'adjacent'} à l'angle A mesure ${f.N(p)} cm et le côté ${n2 === 'hypotenuse' ? 'hypoténuse' : 'adjacent'} mesure ${f.N(q)} cm. Trouve l'angle A à une décimale près.`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[90 - ans, t('That is the other acute angle. Check which side is opposite A.', 'C\'est l\'autre angle aigu. Vérifie quel côté est opposé à A.'), 1], [ratio, t('That is the ratio. Use the inverse function to get the angle.', 'C\'est le rapport. Utilise la fonction inverse pour obtenir l\'angle.'), 1], [toDeg(Math.atan(q / p)), t('The ratio was inverted: it must be the side named first over the side named second.', 'Le rapport est inversé : c\'est le côté nommé en premier sur celui nommé en second.'), 1]]),
    steps: [bi((f) => f.t(`${n1} and ${n2} go with ${which}: ${f.m(`${name} A = \\frac{${f.n(p)}}{${f.n(q)}}`)}.`, `${n1 === 'opposite' ? 'Opposé' : 'Adjacent'} et ${n2 === 'hypotenuse' ? 'hypoténuse' : 'adjacent'} vont avec ${which} : ${f.m(`${name} A = \\frac{${f.n(p)}}{${f.n(q)}}`)}.`)), bi((f) => f.t(`${f.m(`A = ${name}^{-1}\\left(\\frac{${f.n(p)}}{${f.n(q)}}\\right)`)} ≈ ${deg(f, ans)}.`, `${f.m(`A = ${name}^{-1}\\left(\\frac{${f.n(p)}}{${f.n(q)}}\\right)`)} ≈ ${deg(f, ans)}.`))],
    nudge: t('Choose sin, cos or tan from the two sides, then use its inverse on your calculator.', 'Choisis sin, cos ou tan avec les deux côtés, puis utilise sa fonction inverse sur ta calculatrice.'),
  };
});

export const trigProblemGen = (id: string): Generator => numGen(id, (tier, r) => {
  const ctx = pick(r, [0, 1, 2]);
  const th = randInt(r, 5, 14) * 5, d = randInt(r, 5, 40);
  if (ctx === 0) {
    const ans = r1(d * Math.tan(rad(th)));
    return {
      prompt: bi((f) => f.t(`Standing ${f.N(d)} m from the base of a tree, the angle of elevation to its top is ${deg(f, th)}. How tall is the tree, in metres, to one decimal?`, `À ${f.N(d)} m de la base d'un arbre, l'angle d'élévation jusqu'à son sommet est de ${deg(f, th)}. Quelle est la hauteur de l'arbre, en mètres, à une décimale près ?`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[d / Math.tan(rad(th)), t('The height is the opposite side, so multiply by tan θ; do not divide.', 'La hauteur est le côté opposé : multiplie par tan θ, ne divise pas.'), 1], [d * Math.sin(rad(th)), t('The distance on the ground is the adjacent side, and the height is the opposite side, so use tangent.', 'La distance au sol est le côté adjacent et la hauteur est le côté opposé : utilise la tangente.'), 0], [d * Math.cos(rad(th)), t('Adjacent and opposite go with tangent.', 'L\'adjacent et l\'opposé vont avec la tangente.'), 0]]),
      steps: [t('Draw the right triangle: ground distance is adjacent, height is opposite. Use tangent.', 'Dessine le triangle rectangle : la distance au sol est l\'adjacent, la hauteur est l\'opposé. Utilise la tangente.'), bi((f) => f.t(`${f.m(`h = ${f.n(d)} \\tan ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} m.`, `${f.m(`h = ${f.n(d)} \\tan ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} m.`))],
      nudge: t('Which side is the height and which is the ground distance? Pick the matching ratio.', 'Quel côté est la hauteur et lequel est la distance au sol ? Choisis le rapport qui correspond.'),
    };
  }
  if (ctx === 1) {
    const L = randInt(r, 4, 12), ans = r1(L * Math.sin(rad(th)));
    return {
      prompt: bi((f) => f.t(`A ${f.N(L)} m ladder leans against a wall and makes an angle of ${deg(f, th)} with the ground. How high up the wall does it reach, in metres, to one decimal?`, `Une échelle de ${f.N(L)} m s'appuie contre un mur et forme un angle de ${deg(f, th)} avec le sol. À quelle hauteur sur le mur arrive-t-elle, en mètres, à une décimale près ?`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[L * Math.cos(rad(th)), t('That is how far the base is from the wall. The height up the wall is opposite the angle at the ground.', 'C\'est la distance entre le pied de l\'échelle et le mur. La hauteur sur le mur est opposée à l\'angle au sol.'), 0], [L / Math.sin(rad(th)), t('The ladder is the hypotenuse, so multiply by sin θ.', 'L\'échelle est l\'hypoténuse : multiplie par sin θ.'), 1], [L * Math.tan(rad(th)), t('The ladder is the hypotenuse, so use sine.', 'L\'échelle est l\'hypoténuse : utilise le sinus.'), 0]]),
      steps: [t('The ladder is the hypotenuse. The height is opposite the angle at the ground, so use sine.', 'L\'échelle est l\'hypoténuse. La hauteur est opposée à l\'angle au sol : utilise le sinus.'), bi((f) => f.t(`${f.m(`h = ${f.n(L)} \\sin ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} m.`, `${f.m(`h = ${f.n(L)} \\sin ${f.n(th)}^{\\circ}`)} ≈ ${f.N(ans)} m.`))],
      nudge: t('Draw the triangle and name the sides before choosing sin, cos or tan.', 'Dessine le triangle et nomme les côtés avant de choisir sin, cos ou tan.'),
    };
  }
  const h = randInt(r, 3, 15), ans = r1(h / Math.tan(rad(th)));
  return {
    prompt: bi((f) => f.t(`From the top of a ${f.N(h)} m cliff, the angle of depression to a boat is ${deg(f, th)}. How far is the boat from the base of the cliff, in metres, to one decimal?`, `Du sommet d'une falaise de ${f.N(h)} m, l'angle de dépression jusqu'à un bateau est de ${deg(f, th)}. À quelle distance de la base de la falaise est le bateau, en mètres, à une décimale près ?`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[h * Math.tan(rad(th)), t('The unknown is the adjacent side, so divide the height by tan θ.', 'L\'inconnue est le côté adjacent : divise la hauteur par tan θ.'), 1], [h / Math.sin(rad(th)), t('Opposite and adjacent go with tangent, not sine.', 'L\'opposé et l\'adjacent vont avec la tangente, pas le sinus.'), 0], [h * Math.cos(rad(th)), t('Opposite and adjacent go with tangent.', 'L\'opposé et l\'adjacent vont avec la tangente.'), 0]]),
    steps: [t('The angle of depression equals the angle of elevation from the boat. The cliff height is opposite and the distance is adjacent: use tangent.', 'L\'angle de dépression égale l\'angle d\'élévation depuis le bateau. La hauteur de la falaise est l\'opposé et la distance est l\'adjacent : utilise la tangente.'), bi((f) => f.t(`${f.m(`d = \\frac{${f.n(h)}}{\\tan ${f.n(th)}^{\\circ}}`)} ≈ ${f.N(ans)} m.`, `${f.m(`d = \\frac{${f.n(h)}}{\\tan ${f.n(th)}^{\\circ}}`)} ≈ ${f.N(ans)} m.`))],
    nudge: t('Draw the right triangle. The angle of depression is equal to the angle of elevation from below.', 'Dessine le triangle rectangle. L\'angle de dépression est égal à l\'angle d\'élévation vu d\'en bas.'),
  };
});

// ── sine and cosine laws ────────────────────────────────────────────────────────

export const sineLawGen = (id: string): Generator => numGen(id, (tier, r) => {
  const A = randInt(r, 3, 8) * 10, B = randInt(r, 3, 8) * 10, a = randInt(r, 5, 25);
  if (tier === 2) {
    const C = randInt(r, 3, 8) * 10, Bn = 180 - A - C, ans = r1((a * Math.sin(rad(Bn))) / Math.sin(rad(A)));
    return {
      prompt: bi((f) => f.t(`In triangle ABC, angle A = ${deg(f, A)}, angle C = ${deg(f, C)} and side a = ${f.N(a)} cm (opposite A). Find side b (opposite B) to one decimal.`, `Dans le triangle ABC, l'angle A = ${deg(f, A)}, l'angle C = ${deg(f, C)} et le côté a = ${f.N(a)} cm (opposé à A). Trouve le côté b (opposé à B) à une décimale près.`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[(a * Math.sin(rad(C))) / Math.sin(rad(A)), t('That is side c. First find angle B = 180° − A − C, then use B.', 'C\'est le côté c. Trouve d\'abord l\'angle B = 180° − A − C, puis utilise B.'), 0], [(a * Math.sin(rad(A))) / Math.sin(rad(Bn)), t('The sine law ratio is flipped. Put the unknown side on top.', 'Le rapport de la loi des sinus est inversé. Mets le côté inconnu au numérateur.'), 1], [(a * Math.sin(rad(180 - A - C))) / Math.sin(rad(C)), t('Pair each side with the angle opposite it: a with A.', 'Associe chaque côté à l\'angle qui lui est opposé : a avec A.'), 1]]),
      steps: [bi((f) => f.t(`Angle B = 180° − ${f.N(A)}° − ${f.N(C)}° = ${deg(f, Bn)}.`, `Angle B = 180° − ${f.N(A)}° − ${f.N(C)}° = ${deg(f, Bn)}.`)), bi((f) => f.t(`${f.m(`\\frac{b}{\\sin ${f.n(Bn)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}, so b ≈ ${f.N(ans)} cm.`, `${f.m(`\\frac{b}{\\sin ${f.n(Bn)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}, donc b ≈ ${f.N(ans)} cm.`))],
      nudge: t('Find the third angle first. Then set up the sine law with one known side-and-opposite-angle pair.', 'Trouve d\'abord le troisième angle. Puis écris la loi des sinus avec une paire côté-angle opposé connue.'),
    };
  }
  if (tier === 3) {
    const Bs = randInt(r, 3, 6) * 10, A2 = randInt(r, 3, 8) * 10, bb = randInt(r, 8, 25);
    const a2 = r1((bb * Math.sin(rad(A2))) / Math.sin(rad(Bs))), ans2 = r1(toDeg(Math.asin((bb * Math.sin(rad(A2))) / a2)));
    return {
      prompt: bi((f) => f.t(`In triangle ABC, side a = ${f.N(a2)} cm, side b = ${f.N(bb)} cm and angle A = ${deg(f, A2)}. Angle B is acute. Find angle B to one decimal.`, `Dans le triangle ABC, le côté a = ${f.N(a2)} cm, le côté b = ${f.N(bb)} cm et l'angle A = ${deg(f, A2)}. L'angle B est aigu. Trouve l'angle B à une décimale près.`)),
      answer: ans2, tolerance: TOL, category: 'AP',
      wrong: far(ans2, [[180 - ans2, t('That is the obtuse angle with the same sine. The question says B is acute.', 'C\'est l\'angle obtus de même sinus. La question dit que B est aigu.'), 1], [toDeg(Math.asin((a2 * Math.sin(rad(A2))) / bb)), t('Put b on top: sin B ÷ b = sin A ÷ a, so sin B = b sin A ÷ a.', 'Mets b au numérateur : sin B ÷ b = sin A ÷ a, donc sin B = b sin A ÷ a.'), 1], [(bb * Math.sin(rad(A2))) / a2, t('That is sin B. Use the inverse sine to get the angle.', 'C\'est sin B. Utilise le sinus inverse pour obtenir l\'angle.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`\\frac{\\sin B}{${f.n(bb)}} = \\frac{\\sin ${f.n(A2)}^{\\circ}}{${f.n(a2)}}`)}.`, `${f.m(`\\frac{\\sin B}{${f.n(bb)}} = \\frac{\\sin ${f.n(A2)}^{\\circ}}{${f.n(a2)}}`)}.`)), bi((f) => f.t(`${f.m(`\\sin B = \\frac{${f.n(bb)} \\sin ${f.n(A2)}^{\\circ}}{${f.n(a2)}}`)}, so B ≈ ${deg(f, ans2)}.`, `${f.m(`\\sin B = \\frac{${f.n(bb)} \\sin ${f.n(A2)}^{\\circ}}{${f.n(a2)}}`)}, donc B ≈ ${deg(f, ans2)}.`))],
      nudge: t('Write the sine law with the angle on top, solve for sin B, then use the inverse sine.', 'Écris la loi des sinus avec l\'angle au numérateur, résous pour sin B, puis utilise le sinus inverse.'),
    };
  }
  const ans = r1((a * Math.sin(rad(B))) / Math.sin(rad(A)));
  return {
    prompt: bi((f) => f.t(`In triangle ABC, angle A = ${deg(f, A)}, angle B = ${deg(f, B)} and side a = ${f.N(a)} cm. Find side b to one decimal.`, `Dans le triangle ABC, l'angle A = ${deg(f, A)}, l'angle B = ${deg(f, B)} et le côté a = ${f.N(a)} cm. Trouve le côté b à une décimale près.`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[(a * Math.sin(rad(A))) / Math.sin(rad(B)), t('The sine law ratio is flipped. The unknown side b goes with sin B on top.', 'Le rapport de la loi des sinus est inversé. Le côté inconnu b va avec sin B au numérateur.'), 1], [a * Math.sin(rad(B)), t('Divide by sin A as well.', 'Divise aussi par sin A.'), 1], [(a * B) / A, t('Sides are proportional to the sines of the angles, not to the angles.', 'Les côtés sont proportionnels aux sinus des angles, pas aux angles.'), 1]]),
    steps: [bi((f) => f.t(`${f.m(`\\frac{b}{\\sin ${f.n(B)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}.`, `${f.m(`\\frac{b}{\\sin ${f.n(B)}^{\\circ}} = \\frac{${f.n(a)}}{\\sin ${f.n(A)}^{\\circ}}`)}.`)), bi((f) => f.t(`${f.m(`b = \\frac{${f.n(a)} \\sin ${f.n(B)}^{\\circ}}{\\sin ${f.n(A)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`, `${f.m(`b = \\frac{${f.n(a)} \\sin ${f.n(B)}^{\\circ}}{\\sin ${f.n(A)}^{\\circ}}`)} ≈ ${f.N(ans)} cm.`))],
    nudge: t('Each side divided by the sine of its opposite angle gives the same number.', 'Chaque côté divisé par le sinus de son angle opposé donne le même nombre.'),
  };
});

export const cosineLawGen = (id: string): Generator => numGen(id, (tier, r) => {
  const a = randInt(r, 5, 15), b = randInt(r, 5, 15);
  if (tier < 3) {
    const C = randInt(r, 3, tier === 1 ? 8 : 11) * 10 + (tier === 2 ? 5 : 0), c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C))), ans = r1(c);
    return {
      prompt: bi((f) => f.t(`In triangle ABC, a = ${f.N(a)} cm, b = ${f.N(b)} cm and angle C = ${deg(f, C)}. Find side c to one decimal.`, `Dans le triangle ABC, a = ${f.N(a)} cm, b = ${f.N(b)} cm et l'angle C = ${deg(f, C)}. Trouve le côté c à une décimale près.`)),
      answer: ans, tolerance: TOL, category: 'AP',
      wrong: far(ans, [[Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(rad(C))), t('The cosine law has a minus: c² = a² + b² − 2ab cos C.', 'La loi des cosinus a un moins : c² = a² + b² − 2ab cos C.'), 1], [a * a + b * b - 2 * a * b * Math.cos(rad(C)), t('That is c². Take the square root.', 'C\'est c². Prends la racine carrée.'), 1], [Math.sqrt(a * a + b * b - 2 * a * b) * Math.abs(Math.cos(rad(C))) + (a + b) / 3, t('Multiply 2ab by cos C first, then subtract from a² + b².', 'Multiplie d\'abord 2ab par cos C, puis soustrais de a² + b².'), 1], [Math.sqrt(a * a + b * b), t('That is the Pythagorean theorem, which only works for a 90° angle. Include the −2ab cos C term.', 'C\'est le théorème de Pythagore, qui ne vaut que pour un angle de 90°. Inclus le terme −2ab cos C.'), 1]]),
      steps: [bi((f) => f.t(`${f.m(`c^{2} = ${f.n(a)}^{2} + ${f.n(b)}^{2} - 2(${f.n(a)})(${f.n(b)})\\cos ${f.n(C)}^{\\circ}`)}.`, `${f.m(`c^{2} = ${f.n(a)}^{2} + ${f.n(b)}^{2} - 2(${f.n(a)})(${f.n(b)})\\cos ${f.n(C)}^{\\circ}`)}.`)), bi((f) => f.t(`${f.m(`c^{2} ≈ ${f.n(r1(c * c))}`)}, so c ≈ ${f.N(ans)} cm.`, `${f.m(`c^{2} ≈ ${f.n(r1(c * c))}`)}, donc c ≈ ${f.N(ans)} cm.`))],
      nudge: t('Use c² = a² + b² − 2ab cos C, then take the square root.', 'Utilise c² = a² + b² − 2ab cos C, puis prends la racine carrée.'),
    };
  }
  let c = 0;
  do { c = randInt(r, Math.abs(a - b) + 2, a + b - 2); } while ((a * a + b * b - c * c) / (2 * a * b) <= 0.05);
  const ans = r1(toDeg(Math.acos((a * a + b * b - c * c) / (2 * a * b))));
  return {
    prompt: bi((f) => f.t(`A triangle has sides ${f.N(a)} cm, ${f.N(b)} cm and ${f.N(c)} cm. Find the angle between the sides of ${f.N(a)} cm and ${f.N(b)} cm, to one decimal.`, `Un triangle a des côtés de ${f.N(a)} cm, ${f.N(b)} cm et ${f.N(c)} cm. Trouve l'angle entre les côtés de ${f.N(a)} cm et ${f.N(b)} cm, à une décimale près.`)),
    answer: ans, tolerance: TOL, category: 'AP',
    wrong: far(ans, [[toDeg(Math.acos((c * c - a * a - b * b) / (2 * a * b))), t('The signs are reversed. cos C = (a² + b² − c²) ÷ 2ab.', 'Les signes sont inversés. cos C = (a² + b² − c²) ÷ 2ab.'), 1], [(a * a + b * b - c * c) / (2 * a * b), t('That is cos C. Use the inverse cosine to get the angle.', 'C\'est cos C. Utilise le cosinus inverse pour obtenir l\'angle.'), 1], [toDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c))), t('Make sure c is the side opposite the angle you want.', 'Assure-toi que c est le côté opposé à l\'angle cherché.'), 0]]),
    steps: [bi((f) => f.t(`The angle is opposite the ${f.N(c)} cm side: ${f.m(`\\cos C = \\frac{${f.n(a)}^{2} + ${f.n(b)}^{2} - ${f.n(c)}^{2}}{2(${f.n(a)})(${f.n(b)})}`)}.`, `L'angle est opposé au côté de ${f.N(c)} cm : ${f.m(`\\cos C = \\frac{${f.n(a)}^{2} + ${f.n(b)}^{2} - ${f.n(c)}^{2}}{2(${f.n(a)})(${f.n(b)})}`)}.`)), bi((f) => f.t(`${f.m(`C = \\cos^{-1}(\\ldots)`)} ≈ ${deg(f, ans)}.`, `${f.m(`C = \\cos^{-1}(\\ldots)`)} ≈ ${deg(f, ans)}.`))],
    nudge: t('Rearrange c² = a² + b² − 2ab cos C to get cos C, then use the inverse cosine.', 'Réarrange c² = a² + b² − 2ab cos C pour obtenir cos C, puis utilise le cosinus inverse.'),
  };
});

// ── the imperial system (MFM2P) ─────────────────────────────────────────────────

export const imperialGen = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const ft = randInt(r, 2, 9), inch = randInt(r, 1, 11), tot = ft * 12 + inch;
    return {
      prompt: bi((f) => f.t(`A board is ${f.N(ft)} feet ${f.N(inch)} inches long. How long is it in inches?`, `Une planche mesure ${f.N(ft)} pieds ${f.N(inch)} pouces. Quelle est sa longueur en pouces ?`)),
      answer: tot, category: 'KU',
      wrong: wr(tot, [[ft * 10 + inch, t('There are 12 inches in a foot, not 10.', 'Il y a 12 pouces dans un pied, pas 10.'), 0], [ft + inch, t('Convert the feet to inches first: multiply by 12.', 'Convertis d\'abord les pieds en pouces : multiplie par 12.'), 0], [ft * 12, t('Add the extra inches too.', 'Ajoute aussi les pouces en plus.'), 1]]),
      steps: [bi((f) => f.t(`${f.N(ft)} feet = ${f.m(`${f.n(ft)} \\times 12`)} = ${f.N(ft * 12)} inches.`, `${f.N(ft)} pieds = ${f.m(`${f.n(ft)} \\times 12`)} = ${f.N(ft * 12)} pouces.`)), bi((f) => f.t(`${f.m(`${f.n(ft * 12)} + ${f.n(inch)}`)} = ${f.N(tot)} inches.`, `${f.m(`${f.n(ft * 12)} + ${f.n(inch)}`)} = ${f.N(tot)} pouces.`))],
      nudge: t('There are 12 inches in 1 foot.', 'Il y a 12 pouces dans 1 pied.'),
    };
  }
  if (tier === 2) {
    const inches = randInt(r, 5, 20) * 6, ft = inches / 12;
    return {
      prompt: bi((f) => f.t(`A piece of lumber is ${f.N(inches)} inches long. How many feet is that? Give a decimal if needed.`, `Un morceau de bois mesure ${f.N(inches)} pouces. Combien de pieds cela fait-il ? Donne un nombre décimal au besoin.`)),
      answer: ft, category: 'KU',
      wrong: wr(ft, [[inches * 12, t('To change inches to feet, divide by 12; do not multiply.', 'Pour passer des pouces aux pieds, divise par 12 ; ne multiplie pas.'), 0], [inches / 10, t('There are 12 inches in a foot, not 10.', 'Il y a 12 pouces dans un pied, pas 10.'), 0], [Math.floor(ft), t('Keep the leftover inches as a decimal part of a foot.', 'Garde les pouces restants comme partie décimale d\'un pied.'), 0]]),
      steps: [t('There are 12 inches in a foot, so divide by 12.', 'Il y a 12 pouces dans un pied : divise par 12.'), bi((f) => f.t(`${f.m(`${f.n(inches)} \\div 12`)} = ${f.N(ft)} feet.`, `${f.m(`${f.n(inches)} \\div 12`)} = ${f.N(ft)} pieds.`))],
      nudge: t('Going from small units to big units: divide.', 'Pour passer d\'une petite unité à une grande : divise.'),
    };
  }
  const L = pick(r, [9, 18, 27, 36]), W = pick(r, [3, 6, 9]), D = pick(r, [0.5, 1, 1.5]);
  const cf = L * W * D, ans = r6(cf / 27);
  if (!Number.isFinite(ans)) return imperialGen(id)(1, 1) as never;
  return {
    prompt: bi((f) => f.t(`A concrete slab is ${f.N(L)} ft long, ${f.N(W)} ft wide and ${f.N(D)} ft thick. How many cubic yards of concrete are needed? (1 cubic yard = 27 cubic feet.)`, `Une dalle de béton mesure ${f.N(L)} pi de long, ${f.N(W)} pi de large et ${f.N(D)} pi d'épaisseur. Combien de verges cubes de béton faut-il ? (1 verge cube = 27 pieds cubes.)`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[cf, t('That is in cubic feet. Divide by 27 to get cubic yards.', 'C\'est en pieds cubes. Divise par 27 pour obtenir des verges cubes.'), 1], [cf / 3, t('A cubic yard is 3 × 3 × 3 = 27 cubic feet, not 3.', 'Une verge cube vaut 3 × 3 × 3 = 27 pieds cubes, pas 3.'), 1], [cf * 27, t('Divide by 27; do not multiply.', 'Divise par 27 ; ne multiplie pas.'), 1]]),
    steps: [bi((f) => f.t(`Volume = ${f.m(`${f.n(L)} \\times ${f.n(W)} \\times ${f.n(D)}`)} = ${f.N(cf)} cubic feet.`, `Volume = ${f.m(`${f.n(L)} \\times ${f.n(W)} \\times ${f.n(D)}`)} = ${f.N(cf)} pieds cubes.`)), bi((f) => f.t(`${f.m(`${f.n(cf)} \\div 27`)} = ${f.N(ans)} cubic yards.`, `${f.m(`${f.n(cf)} \\div 27`)} = ${f.N(ans)} verges cubes.`))],
    nudge: t('Find the volume in cubic feet, then divide by 27.', 'Trouve le volume en pieds cubes, puis divise par 27.'),
  };
});

export const imperialMetricGen = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 2, 20) * 5, ans = r6(n * 2.54);
    return {
      prompt: bi((f) => f.t(`A screen is ${f.N(n)} inches across. How many centimetres is that? (1 inch = 2.54 cm.)`, `Un écran mesure ${f.N(n)} pouces de large. Combien cela fait-il de centimètres ? (1 pouce = 2,54 cm.)`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[n / 2.54, t('To change inches to centimetres, multiply by 2.54. A centimetre is the smaller unit, so the number gets bigger.', 'Pour passer des pouces aux centimètres, multiplie par 2,54. Le centimètre est la plus petite unité : le nombre grandit.'), 0], [n * 25.4, t('1 inch is 2.54 cm, not 25.4 (that is millimetres).', '1 pouce vaut 2,54 cm, pas 25,4 (ce sont des millimètres).'), 0], [n * 2.5, t('Use the exact conversion 2.54.', 'Utilise la conversion exacte 2,54.'), 0]]),
      steps: [t('Multiply by the number of centimetres in one inch.', 'Multiplie par le nombre de centimètres dans un pouce.'), bi((f) => f.t(`${f.m(`${f.n(n)} \\times 2.54`)} = ${f.N(ans)} cm.`, `${f.m(`${f.n(n)} \\times 2.54`)} = ${f.N(ans)} cm.`))],
      nudge: t('Multiply by 2.54 to go from inches to centimetres.', 'Multiplie par 2,54 pour passer des pouces aux centimètres.'),
    };
  }
  if (tier === 2) {
    const ft = randInt(r, 2, 12), ans = r6(ft * 30.48);
    return {
      prompt: bi((f) => f.t(`A room is ${f.N(ft)} feet long. How many centimetres is that? (1 foot = 30.48 cm.)`, `Une pièce mesure ${f.N(ft)} pieds de long. Combien cela fait-il de centimètres ? (1 pied = 30,48 cm.)`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[ft / 30.48, t('Multiply: a centimetre is smaller than a foot, so there are more of them.', 'Multiplie : le centimètre est plus petit que le pied, il y en a donc plus.'), 0], [ft * 12 * 2.54 / 10, t('That divides by 10 by mistake. 12 × 2.54 = 30.48 cm in a foot.', 'Cela divise par 10 par erreur. 12 × 2,54 = 30,48 cm dans un pied.'), 0], [ft * 3.048, t('That is metres per 10 feet, not centimetres. Use 30.48.', 'Cela ne correspond pas aux centimètres. Utilise 30,48.'), 0]]),
      steps: [t('Multiply by the number of centimetres in one foot.', 'Multiplie par le nombre de centimètres dans un pied.'), bi((f) => f.t(`${f.m(`${f.n(ft)} \\times 30.48`)} = ${f.N(ans)} cm.`, `${f.m(`${f.n(ft)} \\times 30.48`)} = ${f.N(ans)} cm.`))],
      nudge: t('Multiply the feet by 30.48.', 'Multiplie les pieds par 30,48.'),
    };
  }
  const inch = randInt(r, 2, 40), cm = r6(inch * 2.54);
  return {
    prompt: bi((f) => f.t(`A plank is ${f.N(cm)} cm long. How many inches is that? (1 inch = 2.54 cm.)`, `Une planche mesure ${f.N(cm)} cm de long. Combien cela fait-il de pouces ? (1 pouce = 2,54 cm.)`)),
    answer: inch, category: 'KU',
    wrong: wr(inch, [[r6(cm * 2.54), t('Going from centimetres to inches, divide by 2.54: an inch is the larger unit.', 'Pour passer des centimètres aux pouces, divise par 2,54 : le pouce est la plus grande unité.'), 0], [r6(cm / 25.4), t('1 inch is 2.54 cm. Divide by 2.54.', '1 pouce vaut 2,54 cm. Divise par 2,54.'), 0], [r6(cm / 2.5), t('Use the exact conversion 2.54.', 'Utilise la conversion exacte 2,54.'), 0]]),
    steps: [t('An inch is the larger unit, so there are fewer inches than centimetres: divide.', 'Le pouce est la plus grande unité : il y a moins de pouces que de centimètres : divise.'), bi((f) => f.t(`${f.m(`${f.n(cm)} \\div 2.54`)} = ${f.N(inch)} inches.`, `${f.m(`${f.n(cm)} \\div 2.54`)} = ${f.N(inch)} pouces.`))],
    nudge: t('Divide the centimetres by 2.54.', 'Divise les centimètres par 2,54.'),
  };
});
