// Grade 8 Spatial Sense strand (E): tessellations, scale drawings, transformations with dilations, units in exponential notation,
// angle properties, composite shapes and the Pythagorean theorem. Circle work uses 3.14 for pi, as the prompt says.
import { pick, randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

type Wrong = [number, Text, number?][];
const PI = 3.14;
const PI_NOTE = (f: { t: (a: string, b: string) => string }): string => f.t('Use 3.14 for pi.', 'Utilise 3,14 pour pi.');
const interior = (n: number): number => ((n - 2) * 180) / n;
/** Regular polygons whose interior angle is a whole number of degrees. */
const NGONS = [3, 4, 5, 6, 8, 9, 10, 12];

/** MS.G8.E1.1.a: tessellations */
export const tessellations8 = numGen('MS.G8.E1.1.a', (tier, r) => {
  if (tier === 1) {
    const n = pick(r, NGONS);
    return {
      prompt: bi((f) => f.t(`What is the size of one interior angle of a regular polygon with ${f.N(n)} sides, in degrees?`, `Quelle est la mesure d'un angle intérieur d'un polygone régulier à ${f.N(n)} côtés, en degrés ?`)),
      answer: interior(n),
      wrong: [[180 / n, t('That is closer to the exterior angle idea. The interior angles of an n-sided polygon add to (n − 2) × 180°; share that equally.', 'C\'est plus proche de l\'idée d\'angle extérieur. Les angles intérieurs d\'un polygone à n côtés totalisent (n − 2) × 180° ; partage ce total également.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The interior angles add to (${f.N(n)} − 2) × 180° = ${f.N((n - 2) * 180)}°.`, `Les angles intérieurs totalisent (${f.N(n)} − 2) × 180° = ${f.N((n - 2) * 180)}°.`)), bi((f) => f.t(`A regular polygon has equal angles: ${f.N((n - 2) * 180)} ÷ ${f.N(n)} = ${f.N(interior(n))}°.`, `Un polygone régulier a des angles égaux : ${f.N((n - 2) * 180)} ÷ ${f.N(n)} = ${f.N(interior(n))}°.`))],
      nudge: t('Find the sum of the interior angles first, then share it equally among the angles.', 'Trouve d\'abord la somme des angles intérieurs, puis partage-la également entre les angles.'),
    };
  }
  if (tier === 2) {
    type V = { en: string; fr: string; ans: number; why: Text; step: string; stepFr: string };
    const simple = (n: number, en: string, fr: string): V => ({ en: `Regular ${en} tessellate. How many of them meet at each vertex?`, fr: `Les ${fr} réguliers pavent le plan. Combien s'en rencontrent à chaque sommet ?`, ans: 360 / interior(n), why: t('That is the size of one angle. The question asks how many angles fit around the point.', 'C\'est la mesure d\'un angle. La question demande combien d\'angles tiennent autour du point.'), step: `Each interior angle is ${interior(n)}°, and the angles around a vertex make 360°: 360 ÷ ${interior(n)} = ${360 / interior(n)}.`, stepFr: `Chaque angle intérieur mesure ${interior(n)}° et les angles autour d\'un sommet font 360° : 360 ÷ ${interior(n)} = ${360 / interior(n)}.` });
    const fill = (n: number, k: number, en: string, fr: string): V => ({ en: `At a vertex, ${k} regular ${en} meet and the gap is filled with regular triangles. How many triangles are needed?`, fr: `À un sommet, ${k} ${fr} réguliers se rencontrent et l'espace est comblé par des triangles équilatéraux. Combien de triangles faut-il ?`, ans: (360 - k * interior(n)) / 60, why: t('It looks like the angle left was not divided by 60°. Each regular triangle fills 60° of the angle around the point.', 'Il semble que l\'angle restant n\'a pas été divisé par 60°. Chaque triangle équilatéral comble 60° de l\'angle autour du point.'), step: `The ${k} polygons use ${k * interior(n)}°, so ${360 - k * interior(n)}° is left, and each triangle takes 60°: ${(360 - k * interior(n)) / 60}.`, stepFr: `Les ${k} polygones utilisent ${k * interior(n)}°, il reste donc ${360 - k * interior(n)}°, et chaque triangle en prend 60° : ${(360 - k * interior(n)) / 60}.` });
    const v = pick(r, [simple(3, 'triangles', 'triangles'), simple(4, 'squares', 'carrés'), simple(6, 'hexagons', 'hexagones'), fill(6, 1, 'hexagon', 'hexagone'), fill(6, 2, 'hexagons', 'hexagones'), fill(4, 2, 'squares', 'carrés'), fill(12, 2, 'dodecagons', 'dodécagones')]);
    return {
      prompt: bi((f) => f.t(v.en, v.fr)),
      answer: v.ans, category: 'TH',
      wrong: [[v.ans * 2, v.why, 1]] as Wrong,
      steps: [t(v.step, v.stepFr), t(`So the answer is ${v.ans}.`, `Donc la réponse est ${v.ans}.`)],
      nudge: t('The angles around a point add to 360°. How many of these angles make 360°, or fill the gap?', 'Les angles autour d\'un point totalisent 360°. Combien de ces angles font 360°, ou comblent l\'espace ?'),
    };
  }
  const [p, q] = pick(r, [[8, 8], [10, 10], [12, 12], [12, 6], [12, 4], [8, 4], [5, 5], [9, 9], [6, 6]] as [number, number][]);
  return {
    prompt: bi((f) => f.t(`A regular polygon with ${f.N(p)} sides and a regular polygon with ${f.N(q)} sides meet at a vertex. What angle is left, in degrees, for a third polygon to fill the gap?`, `Un polygone régulier à ${f.N(p)} côtés et un polygone régulier à ${f.N(q)} côtés se rencontrent à un sommet. Quel angle reste-t-il, en degrés, pour qu'un troisième polygone comble l'espace ?`)),
    answer: 360 - interior(p) - interior(q), category: 'TH',
    wrong: [[360 - interior(p), t('It looks like only one polygon was taken away. Two polygons meet, so take away both angles.', 'Il semble qu\'un seul polygone a été retiré. Deux polygones se rencontrent : retire les deux angles.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`The interior angles are ${f.N(interior(p))}° and ${f.N(interior(q))}°, which take ${f.N(interior(p) + interior(q))}°.`, `Les angles intérieurs sont de ${f.N(interior(p))}° et de ${f.N(interior(q))}°, ce qui en prend ${f.N(interior(p) + interior(q))}°.`)), bi((f) => f.t(`${f.N(360)} − ${f.N(interior(p) + interior(q))} = ${f.N(360 - interior(p) - interior(q))}°.`, `${f.N(360)} − ${f.N(interior(p) + interior(q))} = ${f.N(360 - interior(p) - interior(q))}°.`))],
    nudge: t('The angles around the vertex add to 360°. Take away the two you know.', 'Les angles autour du sommet totalisent 360°. Retire les deux que tu connais.'),
  };
});

/** MS.G8.E1.3.a: scale drawings */
export const scale8 = numGen('MS.G8.E1.3.a', (tier, r) => {
  if (tier === 1) {
    const k = pick(r, [20, 25, 50, 100, 200]), d = randInt(r, 2, 19) / 2;
    return {
      prompt: bi((f) => f.t(`On a map, 1 cm represents ${f.N(k)} km. Two towns are ${f.N(d)} cm apart on the map. How far apart are they really, in km?`, `Sur une carte, 1 cm représente ${f.N(k)} km. Deux villes sont à ${f.N(d)} cm l'une de l'autre sur la carte. Quelle est la distance réelle, en km ?`)),
      answer: r6(d * k), category: 'AP',
      wrong: [[r6(d + k), t('It looks like the numbers were added. Each centimetre on the map is worth the scale amount, so multiply.', 'Il semble que les nombres ont été additionnés. Chaque centimètre sur la carte vaut la quantité de l\'échelle : multiplie.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Each centimetre is ${f.N(k)} km, and there are ${f.N(d)} cm.`, `Chaque centimètre vaut ${f.N(k)} km et il y a ${f.N(d)} cm.`)), bi((f) => f.t(`${f.N(d)} × ${f.N(k)} = ${f.N(r6(d * k))} km.`, `${f.N(d)} × ${f.N(k)} = ${f.N(r6(d * k))} km.`))],
      nudge: t('Multiply the length on the map by what one centimetre stands for.', 'Multiplie la longueur sur la carte par ce que représente un centimètre.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [50, 100, 200, 250, 500]), cm = randInt(r, 2, 20) * n;
    return {
      prompt: bi((f) => f.t(`A scale drawing uses the scale 1 : ${f.N(n)}. A real length is ${f.N(cm)} cm. How long is it in the drawing, in cm?`, `Un dessin à l'échelle utilise l'échelle 1 : ${f.N(n)}. Une longueur réelle est de ${f.N(cm)} cm. Quelle est sa longueur sur le dessin, en cm ?`)),
      answer: cm / n, category: 'AP',
      wrong: [[cm * n, t('It looks like the real length was multiplied. The drawing is smaller than the real thing, so divide.', 'Il semble que la longueur réelle a été multipliée. Le dessin est plus petit que la réalité : divise.'), 0]] as Wrong,
      steps: [t('A scale of 1 : n means the drawing is n times smaller than the real object.', 'Une échelle de 1 : n signifie que le dessin est n fois plus petit que l\'objet réel.'), bi((f) => f.t(`${f.N(cm)} ÷ ${f.N(n)} = ${f.N(cm / n)} cm.`, `${f.N(cm)} ÷ ${f.N(n)} = ${f.N(cm / n)} cm.`))],
      nudge: t('The drawing is smaller than the real length, so divide by the scale number.', 'Le dessin est plus petit que la longueur réelle : divise par le nombre de l\'échelle.'),
    };
  }
  const n = pick(r, [20, 25, 40, 50, 75, 100]), d = randInt(r, 2, 16);
  return {
    prompt: bi((f) => f.t(`A drawing length of ${f.N(d)} cm stands for a real length of ${f.N(d * n)} cm. The scale is 1 : n. What is n?`, `Une longueur de ${f.N(d)} cm sur le dessin représente une longueur réelle de ${f.N(d * n)} cm. L'échelle est 1 : n. Quelle est la valeur de n ?`)),
    answer: n, category: 'TH',
    wrong: [[d * n - d, t('It looks like the lengths were subtracted. A scale is a ratio, so divide the real length by the drawing length.', 'Il semble que les longueurs ont été soustraites. Une échelle est un rapport : divise la longueur réelle par la longueur sur le dessin.'), 0]] as Wrong,
    steps: [t('A scale of 1 : n means real length ÷ drawing length = n.', 'Une échelle de 1 : n signifie longueur réelle ÷ longueur sur le dessin = n.'), bi((f) => f.t(`${f.N(d * n)} ÷ ${f.N(d)} = ${f.N(n)}.`, `${f.N(d * n)} ÷ ${f.N(d)} = ${f.N(n)}.`))],
    nudge: t('Divide the real length by the length on the drawing.', 'Divise la longueur réelle par la longueur sur le dessin.'),
  };
});

/** MS.G8.E1.4.a: transformations on the Cartesian plane, including dilations */
export const transform8 = numGen('MS.G8.E1.4.a', (tier, r) => {
  const askX = r() < 0.5;
  const axis = askX ? 'x' : 'y';
  if (tier === 1) {
    const k = pick(r, [2, 3, 4]), x = randInt(r, -6, 6), y = randInt(r, -6, 6);
    return {
      prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is dilated by a scale factor of ${f.N(k)} about the origin. What is the ${axis}-coordinate of the image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une dilatation de facteur ${f.N(k)} par rapport à l'origine. Quelle est la coordonnée ${axis} de l'image ?`)),
      answer: (askX ? x : y) * k,
      wrong: [[(askX ? x : y) + k, t('It looks like the scale factor was added. A dilation about the origin multiplies each coordinate by the scale factor.', 'Il semble que le facteur d\'échelle a été additionné. Une dilatation par rapport à l\'origine multiplie chaque coordonnée par le facteur d\'échelle.'), 0]] as Wrong,
      steps: [t('A dilation about the origin multiplies both coordinates by the scale factor.', 'Une dilatation par rapport à l\'origine multiplie les deux coordonnées par le facteur d\'échelle.'), bi((f) => f.t(`${axis}-coordinate: ${f.N(askX ? x : y)} × ${f.N(k)} = ${f.N((askX ? x : y) * k)}.`, `Coordonnée ${axis} : ${f.N(askX ? x : y)} × ${f.N(k)} = ${f.N((askX ? x : y) * k)}.`))],
      nudge: t('Multiply the coordinate by the scale factor.', 'Multiplie la coordonnée par le facteur d\'échelle.'),
    };
  }
  if (tier === 2) {
    const x = randInt(r, -8, 8), y = randInt(r, -8, 8), a = randInt(r, 1, 7), b = randInt(r, 1, 7);
    const ix = -x + a, iy = y + b; // reflect in the y-axis, then translate a right and b up
    return {
      prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is reflected in the y-axis, then translated ${f.N(a)} units right and ${f.N(b)} units up. What is the ${axis}-coordinate of the final image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} est réfléchi par rapport à l'axe des y, puis translaté de ${f.N(a)} unités vers la droite et de ${f.N(b)} unités vers le haut. Quelle est la coordonnée ${axis} de l'image finale ?`)),
      answer: askX ? ix : iy, category: 'TH',
      wrong: [[askX ? x + a : y + b, t('It looks like the reflection was skipped. Do the reflection first, then the translation.', 'Il semble que la réflexion a été omise. Fais d\'abord la réflexion, puis la translation.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Reflecting in the y-axis gives ${f.m(`(${f.n(-x)},\\ ${f.n(y)})`)}.`, `La réflexion par rapport à l\'axe des y donne ${f.m(`(${f.n(-x)},\\ ${f.n(y)})`)}.`)), bi((f) => f.t(`Translating gives ${f.m(`(${f.n(ix)},\\ ${f.n(iy)})`)}, so the ${axis}-coordinate is ${f.N(askX ? ix : iy)}.`, `La translation donne ${f.m(`(${f.n(ix)},\\ ${f.n(iy)})`)}, donc la coordonnée ${axis} est ${f.N(askX ? ix : iy)}.`))],
      nudge: t('Do the transformations in the order given, one at a time.', 'Fais les transformations dans l\'ordre donné, une à la fois.'),
    };
  }
  const x = randInt(r, -5, 5) * 2, y = randInt(r, -5, 5) * 2;
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is dilated by a scale factor of ${f.m(`\\frac{1}{2}`)} about the origin, then rotated 180° about the origin. What is the ${axis}-coordinate of the final image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une dilatation de facteur ${f.m(`\\frac{1}{2}`)} par rapport à l'origine, puis une rotation de 180° autour de l'origine. Quelle est la coordonnée ${axis} de l'image finale ?`)),
    answer: -(askX ? x : y) / 2, category: 'TH',
    wrong: [[(askX ? x : y) / 2, t('It looks like the rotation was skipped. A 180° rotation about the origin changes the sign of both coordinates.', 'Il semble que la rotation a été omise. Une rotation de 180° autour de l\'origine change le signe des deux coordonnées.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Dilating by one half gives ${f.m(`(${f.n(x / 2)},\\ ${f.n(y / 2)})`)}.`, `La dilatation de facteur un demi donne ${f.m(`(${f.n(x / 2)},\\ ${f.n(y / 2)})`)}.`)), bi((f) => f.t(`Rotating 180° changes both signs: ${f.m(`(${f.n(-x / 2)},\\ ${f.n(-y / 2)})`)}, so the ${axis}-coordinate is ${f.N(-(askX ? x : y) / 2)}.`, `Une rotation de 180° change les deux signes : ${f.m(`(${f.n(-x / 2)},\\ ${f.n(-y / 2)})`)}, donc la coordonnée ${axis} est ${f.N(-(askX ? x : y) / 2)}.`))],
    nudge: t('A dilation scales, a 180° rotation flips both signs. Do them in order.', 'Une dilatation change l\'échelle, une rotation de 180° change les deux signes. Fais-les dans l\'ordre.'),
  };
});

const PREFIX: Record<string, [string, string, number]> = {
  mega: ['mega', 'méga', 6], giga: ['giga', 'giga', 9], tera: ['tera', 'téra', 12],
  micro: ['micro', 'micro', -6], nano: ['nano', 'nano', -9], pico: ['pico', 'pico', -12],
};

/** MS.G8.E2.1.a: mega, giga, tera, micro, nano and pico units in exponential notation */
export const unitsExp8 = numGen('MS.G8.E2.1.a', (tier, r) => {
  if (tier <= 2) {
    const key = pick(r, tier === 1 ? ['mega', 'giga', 'tera'] : ['micro', 'nano', 'pico']);
    const [en, fr, e] = PREFIX[key]!;
    const units: [string, string, string, string, string][] = tier === 1
      ? [['metre', 'mètre', 'Un', 'mètres', 'metres'], ['gram', 'gramme', 'Un', 'grammes', 'grams'], ['second', 'seconde', 'Une', 'secondes', 'seconds'], ['litre', 'litre', 'Un', 'litres', 'litres'], ['byte', 'octet', 'Un', 'octets', 'bytes']]
      : [['metre', 'mètre', 'Un', 'mètres', 'metres'], ['gram', 'gramme', 'Un', 'grammes', 'grams'], ['second', 'seconde', 'Une', 'secondes', 'seconds'], ['litre', 'litre', 'Un', 'litres', 'litres']];
    const [ue, uf, art, pf, pe] = pick(r, units);
    return {
      prompt: bi((f) => f.t(`One ${en}${ue} is ${f.m(`10^{n}`)} ${pe}. What is n?`, `${art} ${fr}${uf} vaut ${f.m(`10^{n}`)} ${pf}. Quelle est la valeur de n ?`)),
      answer: e, category: 'KU',
      wrong: [[-e, t(tier === 1 ? 'It looks like the sign is wrong. Mega, giga and tera are big units, so the exponent is positive.' : 'It looks like the sign is wrong. Micro, nano and pico are tiny units, so the exponent is negative.', tier === 1 ? 'Il semble que le signe est erroné. Méga, giga et téra sont de grandes unités : l\'exposant est positif.' : 'Il semble que le signe est erroné. Micro, nano et pico sont de minuscules unités : l\'exposant est négatif.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${en} means ${f.m(`10^{${f.n(e)}}`)}: mega is 6, giga is 9, tera is 12, micro is −6, nano is −9 and pico is −12.`, `${fr} signifie ${f.m(`10^{${f.n(e)}}`)} : méga 6, giga 9, téra 12, micro −6, nano −9 et pico −12.`)), bi((f) => f.t(`So n = ${f.N(e)}.`, `Donc n = ${f.N(e)}.`))],
      nudge: t('Big prefixes (mega, giga, tera) have positive exponents; tiny ones (micro, nano, pico) have negative exponents.', 'Les grands préfixes (méga, giga, téra) ont des exposants positifs ; les minuscules (micro, nano, pico) ont des exposants négatifs.'),
    };
  }
  const pairs: [string, string, number][] = [['giga', 'mega', 3], ['tera', 'giga', 3], ['tera', 'mega', 6], ['mega', 'micro', 12], ['micro', 'nano', 3], ['nano', 'pico', 3]];
  const [from, to] = pick(r, pairs);
  const x = randInt(r, 11, 99) / 10;
  const diff = PREFIX[from]![2] - PREFIX[to]![2];
  return {
    prompt: bi((f) => f.t(`A measurement is ${f.N(x)} ${PREFIX[from]![0]}metres. How many ${PREFIX[to]![0]}metres is that?`, `Une mesure est de ${f.N(x)} ${PREFIX[from]![1]}mètres. Cela fait combien de ${PREFIX[to]![1]}mètres ?`)),
    answer: r6(x * 10 ** diff), category: 'AP',
    wrong: [[r6(x / 10 ** diff), t('It looks like the conversion went the wrong way. A bigger unit means more of the smaller unit, so multiply.', 'Il semble que la conversion est allée dans le mauvais sens. Une plus grande unité donne plus de la plus petite : multiplie.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`${PREFIX[from]![0]} is ${f.m(`10^{${f.n(PREFIX[from]![2])}}`)} and ${PREFIX[to]![0]} is ${f.m(`10^{${f.n(PREFIX[to]![2])}}`)}, so one ${PREFIX[from]![0]}metre is ${f.m(`10^{${f.n(diff)}}`)} ${PREFIX[to]![0]}metres.`, `${PREFIX[from]![1]} vaut ${f.m(`10^{${f.n(PREFIX[from]![2])}}`)} et ${PREFIX[to]![1]} vaut ${f.m(`10^{${f.n(PREFIX[to]![2])}}`)} : un ${PREFIX[from]![1]}mètre vaut ${f.m(`10^{${f.n(diff)}}`)} ${PREFIX[to]![1]}mètres.`)), bi((f) => f.t(`${f.N(x)} × ${f.m(`10^{${f.n(diff)}}`)} = ${f.N(r6(x * 10 ** diff))}.`, `${f.N(x)} × ${f.m(`10^{${f.n(diff)}}`)} = ${f.N(r6(x * 10 ** diff))}.`))],
    nudge: t('Find the exponent of each prefix and subtract to get how many times bigger one unit is.', 'Trouve l\'exposant de chaque préfixe et soustrais pour savoir combien de fois une unité est plus grande.'),
  };
});

/** MS.G8.E2.2.a: angle properties of intersecting and parallel lines */
export const lineAngles8 = numGen('MS.G8.E2.2.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 25, 155);
    const adjacent = r() < 0.5;
    return {
      prompt: bi((f) => f.t(`Two lines cross. One angle is ${f.N(a)}°. What is the ${adjacent ? 'angle next to it (adjacent) on a straight line' : 'angle opposite to it (vertically opposite)'}, in degrees?`, `Deux droites se croisent. Un angle mesure ${f.N(a)}°. Quelle est la mesure de ${adjacent ? 'l\'angle à côté (adjacent) sur une droite' : 'l\'angle opposé par le sommet'}, en degrés ?`)),
      answer: adjacent ? 180 - a : a,
      wrong: [[adjacent ? a : 180 - a, t(adjacent ? 'It looks like the opposite angle was given. Angles next to each other on a straight line add to 180°.' : 'It looks like the adjacent angle was given. Vertically opposite angles are equal.', adjacent ? 'Il semble que l\'angle opposé a été donné. Des angles adjacents sur une droite totalisent 180°.' : 'Il semble que l\'angle adjacent a été donné. Les angles opposés par le sommet sont égaux.'), 0]] as Wrong,
      steps: [bi((f) => (adjacent ? f.t('Angles next to each other on a straight line add to 180°.', 'Des angles adjacents sur une droite totalisent 180°.') : f.t('Vertically opposite angles are equal.', 'Les angles opposés par le sommet sont égaux.'))), bi((f) => (adjacent ? f.t(`${f.N(180)} − ${f.N(a)} = ${f.N(180 - a)}°.`, `${f.N(180)} − ${f.N(a)} = ${f.N(180 - a)}°.`) : f.t(`The angle is ${f.N(a)}°.`, `L\'angle mesure ${f.N(a)}°.`)))],
      nudge: t('Picture the two lines crossing. Which angles are equal, and which add to 180°?', 'Imagine les deux droites qui se croisent. Quels angles sont égaux, et lesquels totalisent 180° ?'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 35, 145);
    const kind = pick(r, ['corresponding', 'alternate interior', 'co-interior'] as const);
    const FR = { corresponding: 'correspondant', 'alternate interior': 'alterne-interne', 'co-interior': 'co-interne (du même côté)' } as const;
    const ans = kind === 'co-interior' ? 180 - a : a;
    return {
      prompt: bi((f) => f.t(`Two parallel lines are cut by a transversal. One angle is ${f.N(a)}°. What is the ${kind} angle, in degrees?`, `Deux droites parallèles sont coupées par une sécante. Un angle mesure ${f.N(a)}°. Quelle est la mesure de l'angle ${FR[kind]}, en degrés ?`)),
      answer: ans, category: 'KU',
      wrong: [[kind === 'co-interior' ? a : 180 - a, t(kind === 'co-interior' ? 'It looks like the angles were taken as equal. Co-interior (same-side interior) angles between parallel lines add to 180°.' : 'It looks like the angles were taken as adding to 180°. Corresponding and alternate interior angles between parallel lines are equal.', kind === 'co-interior' ? 'Il semble que les angles ont été pris comme égaux. Les angles co-internes entre des droites parallèles totalisent 180°.' : 'Il semble que les angles ont été pris comme totalisant 180°. Les angles correspondants et alternes-internes entre des droites parallèles sont égaux.'), 0]] as Wrong,
      steps: [bi((f) => (kind === 'co-interior' ? f.t('Co-interior angles between parallel lines add to 180°.', 'Les angles co-internes entre des droites parallèles totalisent 180°.') : f.t('Corresponding and alternate interior angles between parallel lines are equal.', 'Les angles correspondants et alternes-internes entre des droites parallèles sont égaux.'))), bi((f) => (kind === 'co-interior' ? f.t(`${f.N(180)} − ${f.N(a)} = ${f.N(180 - a)}°.`, `${f.N(180)} − ${f.N(a)} = ${f.N(180 - a)}°.`) : f.t(`The angle is ${f.N(a)}°.`, `L\'angle mesure ${f.N(a)}°.`)))],
      nudge: t('Look for an F shape (corresponding), a Z shape (alternate interior) or a C shape (co-interior).', 'Cherche une forme en F (correspondants), en Z (alternes-internes) ou en C (co-internes).'),
    };
  }
  const ext = randInt(r, 100, 150), a = randInt(r, 30, ext - 30);
  return {
    prompt: bi((f) => f.t(`An exterior angle of a triangle is ${f.N(ext)}°. One of the two opposite interior angles is ${f.N(a)}°. What is the other opposite interior angle, in degrees?`, `Un angle extérieur d'un triangle mesure ${f.N(ext)}°. Un des deux angles intérieurs opposés mesure ${f.N(a)}°. Quelle est la mesure de l'autre angle intérieur opposé, en degrés ?`)),
    answer: ext - a, category: 'TH',
    wrong: [[180 - ext - a, t('It looks like the exterior angle was treated as an interior angle. An exterior angle equals the sum of the two opposite interior angles.', 'Il semble que l\'angle extérieur a été traité comme un angle intérieur. Un angle extérieur égale la somme des deux angles intérieurs opposés.'), 0]] as Wrong,
    steps: [t('An exterior angle of a triangle equals the sum of the two opposite interior angles.', 'Un angle extérieur d\'un triangle égale la somme des deux angles intérieurs opposés.'), bi((f) => f.t(`${f.N(ext)} − ${f.N(a)} = ${f.N(ext - a)}°.`, `${f.N(ext)} − ${f.N(a)} = ${f.N(ext - a)}°.`))],
    nudge: t('Use the exterior angle property: it equals the two opposite interior angles added together.', 'Utilise la propriété de l\'angle extérieur : il égale les deux angles intérieurs opposés additionnés.'),
  };
});

/** MS.G8.E2.2.b: angle properties of polygons */
export const polygonAngles8 = numGen('MS.G8.E2.2.b', (tier, r) => {
  if (tier === 1) {
    const n = randInt(r, 5, 12);
    return {
      prompt: bi((f) => f.t(`What is the sum of the interior angles of a polygon with ${f.N(n)} sides, in degrees?`, `Quelle est la somme des angles intérieurs d'un polygone à ${f.N(n)} côtés, en degrés ?`)),
      answer: (n - 2) * 180,
      wrong: [[n * 180, t('It looks like the number of sides was multiplied by 180. Split the polygon into triangles from one corner: there are 2 fewer triangles than sides.', 'Il semble que le nombre de côtés a été multiplié par 180. Divise le polygone en triangles à partir d\'un coin : il y a 2 triangles de moins que de côtés.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`A polygon with ${f.N(n)} sides splits into ${f.N(n)} − 2 = ${f.N(n - 2)} triangles.`, `Un polygone à ${f.N(n)} côtés se divise en ${f.N(n)} − 2 = ${f.N(n - 2)} triangles.`)), bi((f) => f.t(`${f.N(n - 2)} × 180° = ${f.N((n - 2) * 180)}°.`, `${f.N(n - 2)} × 180° = ${f.N((n - 2) * 180)}°.`))],
      nudge: t('Count the triangles you get by drawing lines from one corner.', 'Compte les triangles obtenus en traçant des droites à partir d\'un coin.'),
    };
  }
  if (tier === 2) {
    const n = pick(r, [4, 5, 6]);
    const total = (n - 2) * 180;
    const known: number[] = [];
    let left = total;
    for (let i = 0; i < n - 1; i++) { const lo = 70, hi = Math.min(170, left - 60 * (n - 1 - i)); const v = randInt(r, lo, Math.max(lo, hi)); known.push(v); left -= v; }
    return {
      prompt: bi((f) => f.t(`${n === 4 ? 'A quadrilateral' : n === 5 ? 'A pentagon' : 'A hexagon'} has angles ${known.map((k) => f.N(k)).join(', ')} degrees and one more angle. What is the missing angle, in degrees?`, `${n === 4 ? 'Un quadrilatère' : n === 5 ? 'Un pentagone' : 'Un hexagone'} a des angles de ${known.map((k) => f.N(k)).join(', ')} degrés et un angle de plus. Quelle est la mesure de l'angle manquant, en degrés ?`)),
      answer: left, category: 'AP',
      wrong: [[360 - known.reduce((a, b) => a + b, 0), t('It looks like 360° was used for every polygon. The total depends on the number of sides: (n − 2) × 180°.', 'Il semble que 360° a été utilisé pour tous les polygones. Le total dépend du nombre de côtés : (n − 2) × 180°.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The angles of a polygon with ${f.N(n)} sides add to ${f.N(total)}°.`, `Les angles d\'un polygone à ${f.N(n)} côtés totalisent ${f.N(total)}°.`)), bi((f) => f.t(`${f.N(total)} − (${known.map((k) => f.n(k)).join(' + ')}) = ${f.N(left)}°.`, `${f.N(total)} − (${known.map((k) => f.n(k)).join(' + ')}) = ${f.N(left)}°.`))],
      nudge: t('Find the total for this polygon, then subtract the angles you know.', 'Trouve le total pour ce polygone, puis soustrais les angles que tu connais.'),
    };
  }
  const n = pick(r, [5, 6, 8, 9, 10, 12]);
  const angle = interior(n);
  return {
    prompt: bi((f) => f.t(`Each interior angle of a regular polygon is ${f.N(angle)}°. How many sides does the polygon have?`, `Chaque angle intérieur d'un polygone régulier mesure ${f.N(angle)}°. Combien de côtés le polygone a-t-il ?`)),
    answer: n, category: 'TH',
    wrong: [[Math.round(360 / angle), t('It looks like 360° was divided by the interior angle. Divide 360° by the exterior angle (180° minus the interior angle) instead.', 'Il semble que 360° a été divisé par l\'angle intérieur. Divise plutôt 360° par l\'angle extérieur (180° moins l\'angle intérieur).'), 0]] as Wrong,
    steps: [bi((f) => f.t(`The exterior angle is ${f.N(180)} − ${f.N(angle)} = ${f.N(180 - angle)}°.`, `L\'angle extérieur est ${f.N(180)} − ${f.N(angle)} = ${f.N(180 - angle)}°.`)), bi((f) => f.t(`The exterior angles add to 360°: ${f.N(360)} ÷ ${f.N(180 - angle)} = ${f.N(n)} sides.`, `Les angles extérieurs totalisent 360° : ${f.N(360)} ÷ ${f.N(180 - angle)} = ${f.N(n)} côtés.`))],
    nudge: t('Find the exterior angle, then see how many fit in 360°.', 'Trouve l\'angle extérieur, puis vois combien tiennent dans 360°.'),
  };
});

/** MS.G8.E2.3.a: area of composite shapes */
export const compositeArea8 = numGen('MS.G8.E2.3.a', (tier, r) => {
  if (tier === 1) {
    const L = randInt(r, 8, 20), W = randInt(r, 6, 14), l = randInt(r, 2, L - 3), w = randInt(r, 2, W - 3);
    return {
      prompt: bi((f) => f.t(`An L-shaped floor is a rectangle ${f.N(L)} m by ${f.N(W)} m with a rectangle ${f.N(l)} m by ${f.N(w)} m cut out of one corner. What is its area, in m²?`, `Un plancher en forme de L est un rectangle de ${f.N(L)} m sur ${f.N(W)} m dont un coin est retiré : un rectangle de ${f.N(l)} m sur ${f.N(w)} m. Quelle est son aire, en m² ?`)),
      answer: L * W - l * w, category: 'AP',
      wrong: [[L * W + l * w, t('It looks like the cut-out was added. It was taken away, so subtract its area.', 'Il semble que la partie retirée a été ajoutée. Elle a été enlevée : soustrais son aire.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Big rectangle: ${f.N(L)} × ${f.N(W)} = ${f.N(L * W)} m². Cut-out: ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} m².`, `Grand rectangle : ${f.N(L)} × ${f.N(W)} = ${f.N(L * W)} m². Partie retirée : ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} m².`)), bi((f) => f.t(`${f.N(L * W)} − ${f.N(l * w)} = ${f.N(L * W - l * w)} m².`, `${f.N(L * W)} − ${f.N(l * w)} = ${f.N(L * W - l * w)} m².`))],
      nudge: t('Find the area of the whole rectangle, then take away the piece that was cut out.', 'Trouve l\'aire du rectangle entier, puis retire la partie qui a été enlevée.'),
    };
  }
  if (tier === 2) {
    const W = randInt(r, 4, 14) * 2, H = randInt(r, 4, 14), rad = W / 2;
    return {
      prompt: bi((f) => f.t(`A window is a rectangle ${f.N(W)} cm wide and ${f.N(H)} cm tall with a semicircle on top whose diameter is the width. What is its area, in cm²? ${PI_NOTE(f)}`, `Une fenêtre est un rectangle de ${f.N(W)} cm de large et de ${f.N(H)} cm de haut, surmonté d'un demi-cercle dont le diamètre est la largeur. Quelle est son aire, en cm² ? ${PI_NOTE(f)}`)),
      answer: r6(W * H + (PI * rad * rad) / 2), category: 'AP',
      wrong: [[r6(W * H + PI * rad * rad), t('It looks like a whole circle was used. The top is a semicircle, which is half the circle.', 'Il semble qu\'un cercle entier a été utilisé. Le dessus est un demi-cercle, soit la moitié du cercle.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Rectangle: ${f.N(W)} × ${f.N(H)} = ${f.N(W * H)}. The radius is ${f.N(W)} ÷ 2 = ${f.N(rad)}, so the semicircle is ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} ÷ 2 = ${f.N(r6((PI * rad * rad) / 2))}.`, `Rectangle : ${f.N(W)} × ${f.N(H)} = ${f.N(W * H)}. Le rayon est ${f.N(W)} ÷ 2 = ${f.N(rad)}, donc le demi-cercle vaut ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} ÷ 2 = ${f.N(r6((PI * rad * rad) / 2))}.`)), bi((f) => f.t(`Total: ${f.N(W * H)} + ${f.N(r6((PI * rad * rad) / 2))} = ${f.N(r6(W * H + (PI * rad * rad) / 2))} cm².`, `Total : ${f.N(W * H)} + ${f.N(r6((PI * rad * rad) / 2))} = ${f.N(r6(W * H + (PI * rad * rad) / 2))} cm².`))],
      nudge: t('Split the shape into a rectangle and a semicircle, find each area, and add.', 'Divise la figure en un rectangle et un demi-cercle, trouve chaque aire et additionne.'),
    };
  }
  const W = randInt(r, 6, 20), H = randInt(r, 5, 15), b = W, h = randInt(r, 2, 6) * 2;
  return {
    prompt: bi((f) => f.t(`A house front is a rectangle ${f.N(W)} m wide and ${f.N(H)} m tall with a triangular roof on top. The triangle has a base of ${f.N(b)} m and a height of ${f.N(h)} m. What is the total area, in m²?`, `La façade d'une maison est un rectangle de ${f.N(W)} m de large et de ${f.N(H)} m de haut, surmonté d'un toit triangulaire. Le triangle a une base de ${f.N(b)} m et une hauteur de ${f.N(h)} m. Quelle est l'aire totale, en m² ?`)),
    answer: W * H + (b * h) / 2, category: 'AP',
    wrong: [[W * H + b * h, t('It looks like the triangle was treated as a rectangle. The area of a triangle is half of base times height.', 'Il semble que le triangle a été traité comme un rectangle. L\'aire d\'un triangle est la moitié de base fois hauteur.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Rectangle: ${f.N(W)} × ${f.N(H)} = ${f.N(W * H)}. Triangle: ${f.N(b)} × ${f.N(h)} ÷ 2 = ${f.N((b * h) / 2)}.`, `Rectangle : ${f.N(W)} × ${f.N(H)} = ${f.N(W * H)}. Triangle : ${f.N(b)} × ${f.N(h)} ÷ 2 = ${f.N((b * h) / 2)}.`)), bi((f) => f.t(`Total: ${f.N(W * H)} + ${f.N((b * h) / 2)} = ${f.N(W * H + (b * h) / 2)} m².`, `Total : ${f.N(W * H)} + ${f.N((b * h) / 2)} = ${f.N(W * H + (b * h) / 2)} m².`))],
    nudge: t('Find the rectangle and the triangle separately, then add them.', 'Trouve séparément le rectangle et le triangle, puis additionne-les.'),
  };
});

/** MS.G8.E2.3.b: volume and surface area of composite shapes */
export const compositeVolume8 = numGen('MS.G8.E2.3.b', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 3, 8), b = randInt(r, 3, 8), h1 = randInt(r, 3, 8), c = randInt(r, 2, a - 1), d = randInt(r, 2, 6), h2 = randInt(r, 2, 6);
    return {
      prompt: bi((f) => f.t(`A solid is two boxes joined together. Box 1 is ${f.N(a)} cm by ${f.N(b)} cm by ${f.N(h1)} cm. Box 2 is ${f.N(c)} cm by ${f.N(d)} cm by ${f.N(h2)} cm. What is the total volume, in cm³?`, `Un solide est formé de deux boîtes jointes. La boîte 1 mesure ${f.N(a)} cm sur ${f.N(b)} cm sur ${f.N(h1)} cm. La boîte 2 mesure ${f.N(c)} cm sur ${f.N(d)} cm sur ${f.N(h2)} cm. Quel est le volume total, en cm³ ?`)),
      answer: a * b * h1 + c * d * h2, category: 'AP',
      wrong: [[a * b * h1 * c * d * h2, t('It looks like the volumes were multiplied. Joined solids have their volumes added.', 'Il semble que les volumes ont été multipliés. Pour des solides joints, on additionne les volumes.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Box 1: ${f.N(a)} × ${f.N(b)} × ${f.N(h1)} = ${f.N(a * b * h1)}. Box 2: ${f.N(c)} × ${f.N(d)} × ${f.N(h2)} = ${f.N(c * d * h2)}.`, `Boîte 1 : ${f.N(a)} × ${f.N(b)} × ${f.N(h1)} = ${f.N(a * b * h1)}. Boîte 2 : ${f.N(c)} × ${f.N(d)} × ${f.N(h2)} = ${f.N(c * d * h2)}.`)), bi((f) => f.t(`Total: ${f.N(a * b * h1)} + ${f.N(c * d * h2)} = ${f.N(a * b * h1 + c * d * h2)} cm³.`, `Total : ${f.N(a * b * h1)} + ${f.N(c * d * h2)} = ${f.N(a * b * h1 + c * d * h2)} cm³.`))],
      nudge: t('Find the volume of each box, then add.', 'Trouve le volume de chaque boîte, puis additionne.'),
    };
  }
  if (tier === 2) {
    const s = randInt(r, 4, 12), c = randInt(r, 1, Math.floor(s / 2));
    return {
      prompt: bi((f) => f.t(`A cube with edges of ${f.N(s)} cm has a small cube with edges of ${f.N(c)} cm cut from one corner. What is the surface area of the new solid, in cm²?`, `Un cube d'arêtes de ${f.N(s)} cm a un petit cube d'arêtes de ${f.N(c)} cm retiré d'un coin. Quelle est l'aire totale du nouveau solide, en cm² ?`)),
      answer: 6 * s * s, category: 'TH',
      wrong: [[6 * s * s - 3 * c * c, t('It looks like the three removed faces were taken away without adding the three new faces. The new faces are exactly as big as the ones removed.', 'Il semble que les trois faces retirées ont été enlevées sans ajouter les trois nouvelles faces. Les nouvelles faces sont exactement aussi grandes que celles retirées.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Cutting away the corner removes three small squares of surface (${f.N(c)} × ${f.N(c)} each)...`, `Retirer le coin enlève trois petits carrés de surface (${f.N(c)} × ${f.N(c)} chacun)...`)), bi((f) => f.t(`...but exposes three new squares of the same size, so the surface area does not change: 6 × ${f.N(s)} × ${f.N(s)} = ${f.N(6 * s * s)} cm².`, `...mais expose trois nouveaux carrés de la même taille : l\'aire totale ne change donc pas : 6 × ${f.N(s)} × ${f.N(s)} = ${f.N(6 * s * s)} cm².`))],
      nudge: t('Count the faces lost and the new faces uncovered when the corner is cut away.', 'Compte les faces perdues et les nouvelles faces découvertes quand le coin est retiré.'),
    };
  }
  const L = randInt(r, 6, 12), W = randInt(r, 6, 12), H = randInt(r, 3, 6), rad = randInt(r, 2, 4), h = randInt(r, 3, 8);
  return {
    prompt: bi((f) => f.t(`A box ${f.N(L)} cm by ${f.N(W)} cm by ${f.N(H)} cm has a cylinder with a radius of ${f.N(rad)} cm and a height of ${f.N(h)} cm standing on top. What is the total volume, in cm³? ${PI_NOTE(f)}`, `Une boîte de ${f.N(L)} cm sur ${f.N(W)} cm sur ${f.N(H)} cm porte un cylindre de ${f.N(rad)} cm de rayon et de ${f.N(h)} cm de hauteur posé dessus. Quel est le volume total, en cm³ ? ${PI_NOTE(f)}`)),
    answer: r6(L * W * H + PI * rad * rad * h), category: 'AP',
    wrong: [[r6(L * W * H + PI * rad * h), t('It looks like the radius was not squared. The base of the cylinder is a circle, so its area uses the radius squared.', 'Il semble que le rayon n\'a pas été mis au carré. La base du cylindre est un cercle : son aire utilise le rayon au carré.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Box: ${f.N(L)} × ${f.N(W)} × ${f.N(H)} = ${f.N(L * W * H)}. Cylinder: ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))}.`, `Boîte : ${f.N(L)} × ${f.N(W)} × ${f.N(H)} = ${f.N(L * W * H)}. Cylindre : ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))}.`)), bi((f) => f.t(`Total: ${f.N(L * W * H)} + ${f.N(r6(PI * rad * rad * h))} = ${f.N(r6(L * W * H + PI * rad * rad * h))} cm³.`, `Total : ${f.N(L * W * H)} + ${f.N(r6(PI * rad * rad * h))} = ${f.N(r6(L * W * H + PI * rad * rad * h))} cm³.`))],
    nudge: t('Find the volume of the box and of the cylinder, then add.', 'Trouve le volume de la boîte et celui du cylindre, puis additionne.'),
  };
});

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];

/** MS.G8.E2.4.a: Pythagorean theorem, finding the hypotenuse */
export const hypotenuse8 = numGen('MS.G8.E2.4.a', (tier, r) => {
  const [a0, b0, c0] = pick(r, TRIPLES);
  const k = tier === 1 ? randInt(r, 1, 3) : randInt(r, 1, 4);
  const a = a0 * k, b = b0 * k, c = c0 * k;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A right triangle has legs of ${f.N(a)} cm and ${f.N(b)} cm. How long is the hypotenuse, in cm?`, `Un triangle rectangle a des côtés de l'angle droit de ${f.N(a)} cm et de ${f.N(b)} cm. Quelle est la longueur de l'hypoténuse, en cm ?`)),
      answer: c,
      wrong: [[a + b, t('It looks like the legs were added. The Pythagorean theorem says a² + b² = c².', 'Il semble que les côtés ont été additionnés. Le théorème de Pythagore dit que a² + b² = c².'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a)} + ${f.N(b * b)} = ${f.N(a * a + b * b)}.`, `${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a)} + ${f.N(b * b)} = ${f.N(a * a + b * b)}.`)), bi((f) => f.t(`The hypotenuse is the square root of ${f.N(a * a + b * b)}, which is ${f.N(c)} cm.`, `L\'hypoténuse est la racine carrée de ${f.N(a * a + b * b)}, soit ${f.N(c)} cm.`))],
      nudge: t('Square both legs, add them, then take the square root.', 'Mets les deux côtés au carré, additionne-les, puis prends la racine carrée.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A ladder leans against a wall. Its foot is ${f.N(a)} m from the wall and it reaches ${f.N(b)} m up the wall. How long is the ladder, in metres?`, `Une échelle est appuyée contre un mur. Son pied est à ${f.N(a)} m du mur et elle atteint ${f.N(b)} m de hauteur sur le mur. Quelle est la longueur de l'échelle, en mètres ?`)),
      answer: c, category: 'AP',
      wrong: [[a + b, t('It looks like the two distances were added. The ladder is the hypotenuse of a right triangle.', 'Il semble que les deux distances ont été additionnées. L\'échelle est l\'hypoténuse d\'un triangle rectangle.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The wall, the ground and the ladder make a right triangle. ${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a + b * b)}.`, `Le mur, le sol et l\'échelle forment un triangle rectangle. ${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a + b * b)}.`)), bi((f) => f.t(`The ladder is ${f.N(c)} m long.`, `L\'échelle mesure ${f.N(c)} m.`))],
      nudge: t('Draw the right triangle. The ladder is the longest side.', 'Dessine le triangle rectangle. L\'échelle est le plus long côté.'),
    };
  }
  const x1 = randInt(r, -5, 5), y1 = randInt(r, -5, 5);
  return {
    prompt: bi((f) => f.t(`On a grid, point P is ${f.m(`(${f.n(x1)},\\ ${f.n(y1)})`)} and point Q is ${f.m(`(${f.n(x1 + a)},\\ ${f.n(y1 + b)})`)}. What is the distance from P to Q?`, `Sur une grille, le point P est ${f.m(`(${f.n(x1)},\\ ${f.n(y1)})`)} et le point Q est ${f.m(`(${f.n(x1 + a)},\\ ${f.n(y1 + b)})`)}. Quelle est la distance de P à Q ?`)),
    answer: c, category: 'TH',
    wrong: [[a + b, t('It looks like the horizontal and vertical distances were added. The straight line from P to Q is the hypotenuse of a right triangle.', 'Il semble que les distances horizontale et verticale ont été additionnées. La droite de P à Q est l\'hypoténuse d\'un triangle rectangle.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Across: ${f.N(a)} units. Up: ${f.N(b)} units. ${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a + b * b)}.`, `Horizontalement : ${f.N(a)} unités. Verticalement : ${f.N(b)} unités. ${f.N(a)}² + ${f.N(b)}² = ${f.N(a * a + b * b)}.`)), bi((f) => f.t(`The distance is the square root of ${f.N(a * a + b * b)}, which is ${f.N(c)}.`, `La distance est la racine carrée de ${f.N(a * a + b * b)}, soit ${f.N(c)}.`))],
    nudge: t('Find how far across and how far up, then use the Pythagorean theorem.', 'Trouve la distance horizontale et la distance verticale, puis utilise le théorème de Pythagore.'),
  };
});

/** MS.G8.E2.4.b: Pythagorean theorem, finding a leg */
export const leg8 = numGen('MS.G8.E2.4.b', (tier, r) => {
  const [a0, b0, c0] = pick(r, TRIPLES);
  const k = randInt(r, 1, tier === 1 ? 3 : 4);
  const a = a0 * k, b = b0 * k, c = c0 * k;
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A right triangle has a hypotenuse of ${f.N(c)} cm and one leg of ${f.N(a)} cm. How long is the other leg, in cm?`, `Un triangle rectangle a une hypoténuse de ${f.N(c)} cm et un côté de l'angle droit de ${f.N(a)} cm. Quelle est la longueur de l'autre côté de l'angle droit, en cm ?`)),
      answer: b,
      wrong: [[c - a, t('It looks like the lengths were subtracted. Use a² + b² = c² and subtract the squares.', 'Il semble que les longueurs ont été soustraites. Utilise a² + b² = c² et soustrais les carrés.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`, `${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`)), bi((f) => f.t(`The other leg is the square root of ${f.N(b * b)}, which is ${f.N(b)} cm.`, `L\'autre côté est la racine carrée de ${f.N(b * b)}, soit ${f.N(b)} cm.`))],
      nudge: t('Square the two sides you know, subtract the smaller square from the hypotenuse squared, then take the root.', 'Mets au carré les deux côtés connus, soustrais le plus petit carré du carré de l\'hypoténuse, puis prends la racine.'),
    };
  }
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A ${f.N(c)} m ladder leans against a wall with its foot ${f.N(a)} m from the wall. How high up the wall does it reach, in metres?`, `Une échelle de ${f.N(c)} m est appuyée contre un mur, son pied à ${f.N(a)} m du mur. À quelle hauteur sur le mur arrive-t-elle, en mètres ?`)),
      answer: b, category: 'AP',
      wrong: [[c - a, t('It looks like the lengths were subtracted. The ladder is the hypotenuse, so subtract the squares.', 'Il semble que les longueurs ont été soustraites. L\'échelle est l\'hypoténuse : soustrais les carrés.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The ladder is the hypotenuse: ${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`, `L\'échelle est l\'hypoténuse : ${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`)), bi((f) => f.t(`It reaches the square root of ${f.N(b * b)}, which is ${f.N(b)} m.`, `Elle atteint la racine carrée de ${f.N(b * b)}, soit ${f.N(b)} m.`))],
      nudge: t('The ladder is the longest side. Subtract the squares.', 'L\'échelle est le plus long côté. Soustrais les carrés.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`A rectangular screen is ${f.N(a)} cm wide and its diagonal is ${f.N(c)} cm. How tall is the screen, in cm?`, `Un écran rectangulaire mesure ${f.N(a)} cm de large et sa diagonale mesure ${f.N(c)} cm. Quelle est sa hauteur, en cm ?`)),
    answer: b, category: 'TH',
    wrong: [[c - a, t('It looks like the lengths were subtracted. The diagonal is the hypotenuse of a right triangle with the width and the height.', 'Il semble que les longueurs ont été soustraites. La diagonale est l\'hypoténuse d\'un triangle rectangle formé par la largeur et la hauteur.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`The diagonal is the hypotenuse: ${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`, `La diagonale est l\'hypoténuse : ${f.N(c)}² − ${f.N(a)}² = ${f.N(c * c)} − ${f.N(a * a)} = ${f.N(b * b)}.`)), bi((f) => f.t(`The height is the square root of ${f.N(b * b)}, which is ${f.N(b)} cm.`, `La hauteur est la racine carrée de ${f.N(b * b)}, soit ${f.N(b)} cm.`))],
    nudge: t('Draw the screen with its diagonal to see the right triangle.', 'Dessine l\'écran avec sa diagonale pour voir le triangle rectangle.'),
  };
});

