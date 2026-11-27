// Grades 5-6 Spatial Sense strand (E) and Financial Literacy strand (F): measurement, angles, area, surface area, coordinates, money.
import { randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, choiceGen, mc, money, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

const UNITS: { big: [string, string]; small: [string, string]; factor: number }[] = [
  { big: ['m', 'm'], small: ['cm', 'cm'], factor: 100 },
  { big: ['km', 'km'], small: ['m', 'm'], factor: 1000 },
  { big: ['kg', 'kg'], small: ['g', 'g'], factor: 1000 },
  { big: ['L', 'L'], small: ['mL', 'mL'], factor: 1000 },
  { big: ['cm', 'cm'], small: ['mm', 'mm'], factor: 10 },
];

/** MS.G5.E2.2.a: convert larger metric units to smaller ones */
export const metricDown5 = numGen('MS.G5.E2.2.a', (tier, r) => {
  const u = UNITS[randInt(r, 0, tier === 1 ? 1 : 4)]!;
  const x = tier === 3 ? randInt(r, 11, 99) / 10 : randInt(r, 2, 40);
  const ans = r6(x * u.factor);
  return {
    prompt: bi((f) => f.t(`How many ${u.small[0]} are in ${f.N(x)} ${u.big[0]}?`, `Combien y a-t-il de ${u.small[1]} dans ${f.N(x)} ${u.big[1]} ?`)),
    answer: ans,
    wrong: [[r6(x / u.factor), t('It looks like the number was divided. Changing to a smaller unit gives a bigger number, so multiply.', 'Il semble que le nombre a été divisé. Passer à une unité plus petite donne un plus grand nombre : multiplie.'), 1]],
    steps: [bi((f) => f.t(`1 ${u.big[0]} = ${f.N(u.factor)} ${u.small[0]}.`, `1 ${u.big[1]} = ${f.N(u.factor)} ${u.small[1]}.`)), bi((f) => f.t(`${f.N(x)} × ${f.N(u.factor)} = ${f.N(ans)} ${u.small[0]}.`, `${f.N(x)} × ${f.N(u.factor)} = ${f.N(ans)} ${u.small[1]}.`))],
    nudge: t('A smaller unit fits more times, so the number gets bigger. How many small units make one big unit?', 'Une unité plus petite entre plus de fois : le nombre augmente. Combien d\'unités plus petites font une grande unité ?'),
  };
});

/** MS.G6.E2.1.a: metric conversions in both directions */
export const metricBoth6 = numGen('MS.G6.E2.1.a', (tier, r) => {
  const u = UNITS[randInt(r, 0, 4)]!;
  if (tier === 1) {
    const k = randInt(r, 2, 30);
    const small = k * u.factor;
    return {
      prompt: bi((f) => f.t(`Convert ${f.N(small)} ${u.small[0]} to ${u.big[0]}.`, `Convertis ${f.N(small)} ${u.small[1]} en ${u.big[1]}.`)),
      answer: k,
      wrong: [[small * u.factor, t('It looks like the number was multiplied. Changing to a bigger unit gives a smaller number, so divide.', 'Il semble que le nombre a été multiplié. Passer à une unité plus grande donne un plus petit nombre : divise.'), 1]],
      steps: [bi((f) => f.t(`${f.N(u.factor)} ${u.small[0]} = 1 ${u.big[0]}, so divide by ${f.N(u.factor)}.`, `${f.N(u.factor)} ${u.small[1]} = 1 ${u.big[1]} : divise par ${f.N(u.factor)}.`)), bi((f) => `${f.N(small)} ÷ ${f.N(u.factor)} = ${f.N(k)} ${u.big[0]}.`)],
      nudge: t('A bigger unit is needed fewer times. Divide.', 'Il faut une unité plus grande moins de fois. Divise.'),
    };
  }
  if (tier === 2) {
    const x = r6(randInt(r, 11, 99) / 10);
    return {
      prompt: bi((f) => f.t(`Convert ${f.N(x)} ${u.big[0]} to ${u.small[0]}.`, `Convertis ${f.N(x)} ${u.big[1]} en ${u.small[1]}.`)),
      answer: r6(x * u.factor),
      wrong: [[r6(x / u.factor), t('It looks like the number was divided. Changing to a smaller unit gives a bigger number, so multiply.', 'Il semble que le nombre a été divisé. Passer à une unité plus petite donne un plus grand nombre : multiplie.'), 1]],
      steps: [bi((f) => f.t(`1 ${u.big[0]} = ${f.N(u.factor)} ${u.small[0]}.`, `1 ${u.big[1]} = ${f.N(u.factor)} ${u.small[1]}.`)), bi((f) => `${f.N(x)} × ${f.N(u.factor)} = ${f.N(r6(x * u.factor))} ${u.small[0]}.`)],
      nudge: t('Multiply when going to a smaller unit; the decimal point moves to the right.', 'Multiplie quand tu passes à une unité plus petite : la virgule se déplace vers la droite.'),
    };
  }
  const small = randInt(r, 150, 950);
  return {
    prompt: bi((f) => f.t(`Convert ${f.N(small)} ${u.small[0]} to ${u.big[0]}. (Use a decimal.)`, `Convertis ${f.N(small)} ${u.small[1]} en ${u.big[1]}. (Utilise un nombre décimal.)`)),
    answer: r6(small / u.factor),
    wrong: [[r6(small * u.factor), t('It looks like the number was multiplied. Changing to a bigger unit gives a smaller number, so divide.', 'Il semble que le nombre a été multiplié. Passer à une unité plus grande donne un plus petit nombre : divise.'), 1]],
    steps: [bi((f) => f.t(`${f.N(u.factor)} ${u.small[0]} = 1 ${u.big[0]}, so divide by ${f.N(u.factor)}.`, `${f.N(u.factor)} ${u.small[1]} = 1 ${u.big[1]} : divise par ${f.N(u.factor)}.`)), bi((f) => `${f.N(small)} ÷ ${f.N(u.factor)} = ${f.N(r6(small / u.factor))} ${u.big[0]}.`)],
    nudge: t('Divide, and move the decimal point to the left.', 'Divise et déplace la virgule vers la gauche.'),
    category: 'AP',
  };
});

/** MS.G5.E2.5.a: area of parallelograms and triangles */
export const areaParTri5 = numGen('MS.G5.E2.5.a', (tier, r) => {
  const b = randInt(r, 4, 14);
  const h = randInt(r, 3, 12);
  if (tier === 1) {
    const slant = h + randInt(r, 1, 4);
    return {
      prompt: bi((f) => f.t(`A parallelogram has a base of ${f.N(b)} cm, a height of ${f.N(h)} cm and a slanted side of ${f.N(slant)} cm. What is its area in square centimetres?`, `Un parallélogramme a une base de ${f.N(b)} cm, une hauteur de ${f.N(h)} cm et un côté oblique de ${f.N(slant)} cm. Quelle est son aire en centimètres carrés ?`)),
      answer: b * h,
      wrong: [[b * slant, t('It looks like the slanted side was used. The area uses the height, which meets the base at a right angle.', 'Il semble que le côté oblique a été utilisé. L\'aire utilise la hauteur, qui rencontre la base à angle droit.'), 1]],
      steps: [t('Area of a parallelogram = base × height.', 'Aire d\'un parallélogramme = base × hauteur.'), bi((f) => `${f.N(b)} × ${f.N(h)} = ${f.N(b * h)} cm².`)],
      nudge: t('Use the height (a right angle to the base), not the slanted side.', 'Utilise la hauteur (à angle droit avec la base), pas le côté oblique.'),
    };
  }
  if (tier === 2) {
    const bb = b % 2 ? b + 1 : b;
    return {
      prompt: bi((f) => f.t(`A triangle has a base of ${f.N(bb)} cm and a height of ${f.N(h)} cm. What is its area in square centimetres?`, `Un triangle a une base de ${f.N(bb)} cm et une hauteur de ${f.N(h)} cm. Quelle est son aire en centimètres carrés ?`)),
      answer: (bb * h) / 2,
      wrong: [[bb * h, t('It looks like the area was left as a full rectangle. A triangle is half of a rectangle with the same base and height.', 'Il semble que l\'aire est restée celle d\'un rectangle complet. Un triangle est la moitié d\'un rectangle de même base et de même hauteur.'), 1]],
      steps: [t('Area of a triangle = base × height ÷ 2.', 'Aire d\'un triangle = base × hauteur ÷ 2.'), bi((f) => `${f.N(bb)} × ${f.N(h)} ÷ 2 = ${f.N((bb * h) / 2)} cm².`)],
      nudge: t('A triangle is half of a rectangle with the same base and height.', 'Un triangle est la moitié d\'un rectangle de même base et de même hauteur.'),
    };
  }
  const hh = randInt(r, 3, 9);
  const bb = randInt(r, 4, 12);
  const area = bb * hh;
  return {
    prompt: bi((f) => f.t(`A parallelogram has an area of ${f.N(area)} cm² and a base of ${f.N(bb)} cm. What is its height in centimetres?`, `Un parallélogramme a une aire de ${f.N(area)} cm² et une base de ${f.N(bb)} cm. Quelle est sa hauteur en centimètres ?`)),
    answer: hh,
    wrong: [[area - bb, t('It looks like the base was subtracted. Area is base × height, so divide the area by the base.', 'Il semble que la base a été soustraite. L\'aire est base × hauteur : divise l\'aire par la base.'), 0]],
    steps: [t('Area = base × height, so height = area ÷ base.', 'Aire = base × hauteur, donc hauteur = aire ÷ base.'), bi((f) => `${f.N(area)} ÷ ${f.N(bb)} = ${f.N(hh)} cm.`)],
    nudge: t('Work backward: what do you multiply the base by to get the area?', 'Pars à reculons : par quoi multiplies-tu la base pour obtenir l\'aire ?'),
    category: 'AP',
  };
});

/** MS.G5.E2.6.a: same area, different perimeters */
export const samePerimeter5 = numGen('MS.G5.E2.6.a', (tier, r) => {
  if (tier === 1) {
    const l = randInt(r, 4, 15);
    const w = randInt(r, 2, l - 1);
    return {
      prompt: bi((f) => f.t(`A rectangle is ${f.N(l)} cm long and ${f.N(w)} cm wide. What is its perimeter in centimetres?`, `Un rectangle mesure ${f.N(l)} cm de long et ${f.N(w)} cm de large. Quel est son périmètre en centimètres ?`)),
      answer: 2 * (l + w),
      wrong: [[l * w, t('It looks like the area was found. The perimeter is the distance around the outside, so add the sides.', 'Il semble que l\'aire a été trouvée. Le périmètre est la distance autour de la figure : additionne les côtés.'), 0], [l + w, t('It looks like only two sides were added. A rectangle has four sides.', 'Il semble que seulement deux côtés ont été additionnés. Un rectangle a quatre côtés.'), 1]],
      steps: [bi((f) => f.t(`Add length and width: ${f.N(l)} + ${f.N(w)} = ${f.N(l + w)}.`, `Additionne la longueur et la largeur : ${f.N(l)} + ${f.N(w)} = ${f.N(l + w)}.`)), bi((f) => f.t(`Double it: 2 × ${f.N(l + w)} = ${f.N(2 * (l + w))} cm.`, `Double-le : 2 × ${f.N(l + w)} = ${f.N(2 * (l + w))} cm.`))],
      nudge: t('Perimeter is the distance all the way around.', 'Le périmètre est la distance tout autour.'),
    };
  }
  if (tier === 2) {
    const w = randInt(r, 2, 8);
    const l = randInt(r, w + 1, 14);
    const area = l * w;
    return {
      prompt: bi((f) => f.t(`A rectangle has an area of ${f.N(area)} cm² and a width of ${f.N(w)} cm. What is its perimeter in centimetres?`, `Un rectangle a une aire de ${f.N(area)} cm² et une largeur de ${f.N(w)} cm. Quel est son périmètre en centimètres ?`)),
      answer: 2 * (l + w),
      wrong: [[l + w, t('It looks like the sum of length and width was not doubled. The perimeter goes all the way around.', 'Il semble que la somme de la longueur et de la largeur n\'a pas été doublée. Le périmètre fait tout le tour.'), 2]],
      steps: [bi((f) => f.t(`Find the length: ${f.N(area)} ÷ ${f.N(w)} = ${f.N(l)} cm.`, `Trouve la longueur : ${f.N(area)} ÷ ${f.N(w)} = ${f.N(l)} cm.`)), bi((f) => f.t(`Add length and width: ${f.N(l)} + ${f.N(w)} = ${f.N(l + w)}.`, `Additionne la longueur et la largeur : ${f.N(l)} + ${f.N(w)} = ${f.N(l + w)}.`)), bi((f) => f.t(`Double it: 2 × ${f.N(l + w)} = ${f.N(2 * (l + w))} cm.`, `Double-le : 2 × ${f.N(l + w)} = ${f.N(2 * (l + w))} cm.`))],
      nudge: t('Use the area and the width to find the length first.', 'Utilise l\'aire et la largeur pour trouver d\'abord la longueur.'),
      category: 'AP',
    };
  }
  const pairs: [number, number, number][] = [[24, 1, 24], [24, 2, 12], [24, 3, 8], [24, 4, 6], [36, 2, 18], [36, 3, 12], [36, 4, 9], [36, 6, 6], [48, 3, 16], [48, 4, 12], [48, 6, 8], [30, 2, 15], [30, 3, 10], [30, 5, 6], [60, 3, 20], [60, 4, 15], [60, 5, 12], [60, 6, 10], [72, 4, 18], [72, 6, 12], [72, 8, 9], [40, 2, 20], [40, 4, 10], [40, 5, 8]];
  const area = [24, 36, 48, 30, 60, 72, 40][randInt(r, 0, 6)]!;
  const options = pairs.filter((p) => p[0] === area);
  const i1 = randInt(r, 0, options.length - 2);
  const i2 = randInt(r, i1 + 1, options.length - 1);
  const p1 = options[i1]!; // the longer, thinner rectangle comes first, so the difference is positive
  const p2 = options[i2]!;
  const per1 = 2 * (p1[1] + p1[2]);
  const per2 = 2 * (p2[1] + p2[2]);
  return {
    prompt: bi((f) => f.t(`Two rectangles each have an area of ${f.N(area)} cm². One is ${f.N(p1[2])} cm by ${f.N(p1[1])} cm. The other is ${f.N(p2[2])} cm by ${f.N(p2[1])} cm. How many centimetres longer is the perimeter of the first than the second?`, `Deux rectangles ont chacun une aire de ${f.N(area)} cm². L\'un mesure ${f.N(p1[2])} cm sur ${f.N(p1[1])} cm. L\'autre mesure ${f.N(p2[2])} cm sur ${f.N(p2[1])} cm. De combien de centimètres le périmètre du premier est-il plus long que celui du second ?`)),
    answer: per1 - per2,
    wrong: [[per1, t('It looks like only the first perimeter was found. Find both perimeters, then subtract.', 'Il semble que seul le premier périmètre a été trouvé. Trouve les deux périmètres, puis soustrais.'), 1]],
    steps: [bi((f) => f.t(`First: 2 × (${f.N(p1[2])} + ${f.N(p1[1])}) = ${f.N(per1)} cm.`, `Premier : 2 × (${f.N(p1[2])} + ${f.N(p1[1])}) = ${f.N(per1)} cm.`)), bi((f) => f.t(`Second: 2 × (${f.N(p2[2])} + ${f.N(p2[1])}) = ${f.N(per2)} cm.`, `Second : 2 × (${f.N(p2[2])} + ${f.N(p2[1])}) = ${f.N(per2)} cm.`)), bi((f) => `${f.N(per1)} − ${f.N(per2)} = ${f.N(per1 - per2)} cm.`)],
    nudge: t('Same area does not mean same perimeter. Find each perimeter.', 'Une même aire ne veut pas dire un même périmètre. Trouve chaque périmètre.'),
    category: 'TH',
  };
});

/** MS.G6.E2.3.a: complementary, supplementary and exterior angles */
export const angles6 = numGen('MS.G6.E2.3.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 10, 80);
    return {
      prompt: bi((f) => f.t(`Two angles are complementary. One is ${f.N(a)}°. What is the other angle in degrees?`, `Deux angles sont complémentaires. L\'un mesure ${f.N(a)}°. Combien mesure l\'autre angle, en degrés ?`)),
      answer: 90 - a,
      wrong: [[180 - a, t('It looks like 180° was used. Complementary angles add to 90°; supplementary angles add to 180°.', 'Il semble que 180° a été utilisé. Les angles complémentaires totalisent 90° ; les angles supplémentaires totalisent 180°.'), 0]],
      steps: [t('Complementary angles add to 90°.', 'Les angles complémentaires totalisent 90°.'), bi((f) => `90° − ${f.N(a)}° = ${f.N(90 - a)}°.`)],
      nudge: t('Complementary angles make a right angle.', 'Les angles complémentaires forment un angle droit.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 20, 160);
    return {
      prompt: bi((f) => f.t(`Two angles are supplementary. One is ${f.N(a)}°. What is the other angle in degrees?`, `Deux angles sont supplémentaires. L\'un mesure ${f.N(a)}°. Combien mesure l\'autre angle, en degrés ?`)),
      answer: 180 - a,
      wrong: [[90 - a > 0 ? 90 - a : a - 90, t('It looks like 90° was used. Supplementary angles add to 180° (a straight line).', 'Il semble que 90° a été utilisé. Les angles supplémentaires totalisent 180° (une ligne droite).'), 0]],
      steps: [t('Supplementary angles add to 180°.', 'Les angles supplémentaires totalisent 180°.'), bi((f) => `180° − ${f.N(a)}° = ${f.N(180 - a)}°.`)],
      nudge: t('Supplementary angles make a straight line.', 'Les angles supplémentaires forment une ligne droite.'),
    };
  }
  const a = randInt(r, 25, 85);
  const b = randInt(r, 25, 85);
  return {
    prompt: bi((f) => f.t(`In a triangle, two interior angles are ${f.N(a)}° and ${f.N(b)}°. What is the exterior angle next to the third angle, in degrees?`, `Dans un triangle, deux angles intérieurs mesurent ${f.N(a)}° et ${f.N(b)}°. Combien mesure l\'angle extérieur à côté du troisième angle, en degrés ?`)),
    answer: a + b,
    wrong: [[180 - a - b, t('It looks like the third interior angle was given. The exterior angle is next to it on a straight line, so it is 180° minus that.', 'Il semble que le troisième angle intérieur a été donné. L\'angle extérieur est à côté sur une ligne droite : il vaut 180° moins cet angle.'), 1]],
    steps: [bi((f) => f.t(`The third interior angle is 180° − ${f.N(a)}° − ${f.N(b)}° = ${f.N(180 - a - b)}°.`, `Le troisième angle intérieur est 180° − ${f.N(a)}° − ${f.N(b)}° = ${f.N(180 - a - b)}°.`)), bi((f) => f.t(`The exterior angle and that angle make a straight line: 180° − ${f.N(180 - a - b)}° = ${f.N(a + b)}°.`, `L\'angle extérieur et cet angle forment une ligne droite : 180° − ${f.N(180 - a - b)}° = ${f.N(a + b)}°.`))],
    nudge: t('Find the third interior angle first. Angles in a triangle add to 180°.', 'Trouve d\'abord le troisième angle intérieur. Les angles d\'un triangle totalisent 180°.'),
    category: 'AP',
  };
});

/** MS.G6.E2.4.a: area of trapezoids, rhombuses and composite polygons */
export const area6 = numGen('MS.G6.E2.4.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 3, 10);
    const b = a + randInt(r, 2, 8);
    const h = randInt(r, 2, 5) * 2;
    return {
      prompt: bi((f) => f.t(`A trapezoid has parallel sides of ${f.N(a)} cm and ${f.N(b)} cm and a height of ${f.N(h)} cm. What is its area in square centimetres?`, `Un trapèze a des côtés parallèles de ${f.N(a)} cm et ${f.N(b)} cm et une hauteur de ${f.N(h)} cm. Quelle est son aire en centimètres carrés ?`)),
      answer: ((a + b) * h) / 2,
      wrong: [[(a + b) * h, t('It looks like the area was left as a full rectangle. Halve it: the area is (sum of the parallel sides) × height ÷ 2.', 'Il semble que l\'aire est restée celle d\'un rectangle complet. Prends-en la moitié : l\'aire est (somme des côtés parallèles) × hauteur ÷ 2.'), 1]],
      steps: [bi((f) => f.t(`Add the parallel sides: ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}.`, `Additionne les côtés parallèles : ${f.N(a)} + ${f.N(b)} = ${f.N(a + b)}.`)), bi((f) => f.t(`${f.N(a + b)} × ${f.N(h)} ÷ 2 = ${f.N(((a + b) * h) / 2)} cm².`, `${f.N(a + b)} × ${f.N(h)} ÷ 2 = ${f.N(((a + b) * h) / 2)} cm².`))],
      nudge: t('A trapezoid is like half of a parallelogram made from two copies.', 'Un trapèze est comme la moitié d\'un parallélogramme fait de deux copies.'),
    };
  }
  if (tier === 2) {
    const d1 = randInt(r, 3, 12) * 2;
    const d2 = randInt(r, 3, 12);
    return {
      prompt: bi((f) => f.t(`A rhombus has diagonals of ${f.N(d1)} cm and ${f.N(d2)} cm. What is its area in square centimetres?`, `Un losange a des diagonales de ${f.N(d1)} cm et ${f.N(d2)} cm. Quelle est son aire en centimètres carrés ?`)),
      answer: (d1 * d2) / 2,
      wrong: [[d1 * d2, t('It looks like the diagonals were only multiplied. The rhombus is half of the rectangle around it, so halve the product.', 'Il semble que les diagonales ont seulement été multipliées. Le losange est la moitié du rectangle qui l\'entoure : prends la moitié du produit.'), 1]],
      steps: [t('Area of a rhombus = diagonal 1 × diagonal 2 ÷ 2.', 'Aire d\'un losange = diagonale 1 × diagonale 2 ÷ 2.'), bi((f) => `${f.N(d1)} × ${f.N(d2)} ÷ 2 = ${f.N((d1 * d2) / 2)} cm².`)],
      nudge: t('The rhombus fills half of the rectangle drawn around it.', 'Le losange remplit la moitié du rectangle dessiné autour de lui.'),
    };
  }
  const w = randInt(r, 4, 10);
  const l = randInt(r, 6, 14);
  const th = randInt(r, 2, 4) * 2;
  const total = w * l + (w * th) / 2;
  return {
    prompt: bi((f) => f.t(`A shape is a rectangle ${f.N(l)} cm by ${f.N(w)} cm with a triangle joined to a ${f.N(w)} cm side. The triangle's base is that ${f.N(w)} cm side and its height is ${f.N(th)} cm. What is the total area in square centimetres?`, `Une figure est un rectangle de ${f.N(l)} cm sur ${f.N(w)} cm auquel on a joint un triangle sur un côté de ${f.N(w)} cm. La base du triangle est ce côté de ${f.N(w)} cm et sa hauteur est de ${f.N(th)} cm. Quelle est l\'aire totale en centimètres carrés ?`)),
    answer: total,
    wrong: [[w * l, t('It looks like only the rectangle was counted. Add the triangle\'s area too.', 'Il semble que seul le rectangle a été compté. Ajoute aussi l\'aire du triangle.'), 2]],
    steps: [bi((f) => f.t(`Rectangle: ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} cm².`, `Rectangle : ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} cm².`)), bi((f) => f.t(`Triangle: ${f.N(w)} × ${f.N(th)} ÷ 2 = ${f.N((w * th) / 2)} cm².`, `Triangle : ${f.N(w)} × ${f.N(th)} ÷ 2 = ${f.N((w * th) / 2)} cm².`)), bi((f) => `${f.N(l * w)} + ${f.N((w * th) / 2)} = ${f.N(total)} cm².`)],
    nudge: t('Split the shape into a rectangle and a triangle, find each area, then add.', 'Sépare la figure en un rectangle et un triangle, trouve chaque aire, puis additionne.'),
    category: 'AP',
  };
});

/** MS.G6.E2.6.a: surface area of rectangular prisms */
export const surfaceArea6 = numGen('MS.G6.E2.6.a', (tier, r) => {
  const l = randInt(r, 3, 10);
  const w = randInt(r, 2, 8);
  const h = randInt(r, 2, 8);
  if (tier === 3) {
    const open = l * w + 2 * l * h + 2 * w * h;
    return {
      prompt: bi((f) => f.t(`An open box (no lid) is ${f.N(l)} cm long, ${f.N(w)} cm wide and ${f.N(h)} cm tall. How many square centimetres of cardboard does it use?`, `Une boîte ouverte (sans couvercle) mesure ${f.N(l)} cm de long, ${f.N(w)} cm de large et ${f.N(h)} cm de haut. Combien de centimètres carrés de carton utilise-t-elle ?`)),
      answer: open,
      wrong: [[2 * (l * w + l * h + w * h), t('It looks like the lid was counted. This box has no lid, so leave out the top face.', 'Il semble que le couvercle a été compté. Cette boîte n\'a pas de couvercle : laisse de côté la face du dessus.'), 2]],
      steps: [bi((f) => f.t(`Bottom: ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)}. Two long sides: 2 × ${f.N(l)} × ${f.N(h)} = ${f.N(2 * l * h)}.`, `Fond : ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)}. Deux grands côtés : 2 × ${f.N(l)} × ${f.N(h)} = ${f.N(2 * l * h)}.`)), bi((f) => f.t(`Two short sides: 2 × ${f.N(w)} × ${f.N(h)} = ${f.N(2 * w * h)}.`, `Deux petits côtés : 2 × ${f.N(w)} × ${f.N(h)} = ${f.N(2 * w * h)}.`)), bi((f) => `${f.N(l * w)} + ${f.N(2 * l * h)} + ${f.N(2 * w * h)} = ${f.N(open)} cm².`)],
      nudge: t('Count only the faces the box really has.', 'Compte seulement les faces que la boîte a vraiment.'),
      category: 'AP',
    };
  }
  const total = 2 * (l * w + l * h + w * h);
  return {
    prompt: bi((f) => f.t(`A rectangular prism is ${f.N(l)} cm long, ${f.N(w)} cm wide and ${f.N(h)} cm tall. What is its surface area in square centimetres?`, `Un prisme rectangulaire mesure ${f.N(l)} cm de long, ${f.N(w)} cm de large et ${f.N(h)} cm de haut. Quelle est son aire totale en centimètres carrés ?`)),
    answer: total,
    wrong: [[l * w * h, t('It looks like the volume was found. Surface area adds the areas of the faces.', 'Il semble que le volume a été trouvé. L\'aire totale additionne les aires des faces.'), 0], [l * w + l * h + w * h, t('It looks like only three faces were added. A prism has six faces: each shape comes in a pair.', 'Il semble que seulement trois faces ont été additionnées. Un prisme a six faces : chaque forme est en double.'), 2]],
    steps: [bi((f) => f.t(`The faces come in three pairs: ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)}, ${f.N(l)} × ${f.N(h)} = ${f.N(l * h)}, ${f.N(w)} × ${f.N(h)} = ${f.N(w * h)}.`, `Les faces vont par paires : ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)}, ${f.N(l)} × ${f.N(h)} = ${f.N(l * h)}, ${f.N(w)} × ${f.N(h)} = ${f.N(w * h)}.`)), bi((f) => f.t(`Add them: ${f.N(l * w + l * h + w * h)}.`, `Additionne-les : ${f.N(l * w + l * h + w * h)}.`)), bi((f) => f.t(`Double it: 2 × ${f.N(l * w + l * h + w * h)} = ${f.N(total)} cm².`, `Double-le : 2 × ${f.N(l * w + l * h + w * h)} = ${f.N(total)} cm².`))],
    nudge: t('A prism has 6 faces in 3 matching pairs. Find the area of one face from each pair.', 'Un prisme a 6 faces en 3 paires identiques. Trouve l\'aire d\'une face de chaque paire.'),
  };
});

const QUADS = [
  { n: 1, en: 'I', xy: [1, 1] }, { n: 2, en: 'II', xy: [-1, 1] }, { n: 3, en: 'III', xy: [-1, -1] }, { n: 4, en: 'IV', xy: [1, -1] },
] as const;

/** MS.G6.E1.3.a: coordinates in all four quadrants */
export const fourQuadrants6 = choiceGen('MS.G6.E1.3.a', (tier, r) => {
  const q = QUADS[randInt(r, 0, 3)]!;
  const x = randInt(r, 1, 9) * q.xy[0];
  const y = randInt(r, 1, 9) * q.xy[1];
  const pt = (a: number, b: number): Text => bi((f) => f.m(`(${f.n(a)},\\ ${f.n(b)})`));
  if (tier === 1) {
    const roman = (n: number): Text => t(`Quadrant ${QUADS[n - 1]!.en}`, `Quadrant ${QUADS[n - 1]!.en}`);
    const m = mc(r, roman(q.n), QUADS.filter((o) => o.n !== q.n).map((o): [Text, Text] => [roman(o.n), t('It looks like the signs of x and y were mixed up. Quadrant I is (+, +), II is (−, +), III is (−, −) and IV is (+, −).', 'Il semble que les signes de x et de y ont été mélangés. Le quadrant I est (+, +), le II (−, +), le III (−, −) et le IV (+, −).')]));
    return {
      prompt: bi((f) => f.t(`In which quadrant is the point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)}?`, `Dans quel quadrant se trouve le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} ?`)),
      options: m.options, correct: m.correct, why: m.why,
      steps: [bi((f) => f.t(`x = ${f.N(x)} is ${x > 0 ? 'positive (right of the y-axis)' : 'negative (left of the y-axis)'}.`, `x = ${f.N(x)} est ${x > 0 ? 'positif (à droite de l\'axe des y)' : 'négatif (à gauche de l\'axe des y)'}.`)), bi((f) => f.t(`y = ${f.N(y)} is ${y > 0 ? 'positive (above the x-axis)' : 'negative (below the x-axis)'}, so it is in quadrant ${q.en}.`, `y = ${f.N(y)} est ${y > 0 ? 'positif (au-dessus de l\'axe des x)' : 'négatif (au-dessous de l\'axe des x)'} : c\'est le quadrant ${q.en}.`))],
      nudge: t('Look at the sign of each coordinate: right or left, then up or down.', 'Regarde le signe de chaque coordonnée : à droite ou à gauche, puis en haut ou en bas.'),
    };
  }
  if (tier === 2) {
    const overX = randInt(r, 0, 1) === 0;
    const right = overX ? pt(x, -y) : pt(-x, y);
    const m = mc(r, right, [
      [overX ? pt(-x, y) : pt(x, -y), t('It looks like the wrong axis was used. Reflecting in the x-axis changes the sign of y; reflecting in the y-axis changes the sign of x.', 'Il semble que l\'autre axe a été utilisé. Une réflexion par rapport à l\'axe des x change le signe de y ; par rapport à l\'axe des y, elle change le signe de x.')],
      [pt(-x, -y), t('It looks like both signs were changed. A reflection in one axis changes only one coordinate.', 'Il semble que les deux signes ont été changés. Une réflexion par rapport à un axe ne change qu\'une coordonnée.')],
      [pt(y, x), t('It looks like the coordinates were swapped. A reflection in an axis keeps their order.', 'Il semble que les coordonnées ont été inversées. Une réflexion par rapport à un axe garde leur ordre.')],
    ].filter(([o]) => (o as Text).en !== right.en) as [Text, Text][]);
    return {
      prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is reflected in the ${overX ? 'x-axis' : 'y-axis'}. What are the coordinates of its image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une réflexion par rapport à l\'axe des ${overX ? 'x' : 'y'}. Quelles sont les coordonnées de son image ?`)),
      options: m.options, correct: m.correct, why: m.why,
      steps: [t(`The ${overX ? 'x' : 'y'}-axis is the mirror, so the point flips to the other side of it.`, `L\'axe des ${overX ? 'x' : 'y'} est le miroir : le point passe de l\'autre côté.`), t(`Only the ${overX ? 'y' : 'x'}-coordinate changes sign.`, `Seule la coordonnée ${overX ? 'y' : 'x'} change de signe.`)],
      nudge: t('A reflection keeps the distance to the mirror line. Which coordinate measures that distance?', 'Une réflexion garde la distance à la ligne miroir. Quelle coordonnée mesure cette distance ?'),
      category: 'AP',
    };
  }
  const dx = randInt(r, -6, 6) || 3;
  const dy = randInt(r, -6, 6) || -2;
  const right = pt(x + dx, y + dy);
  const m = mc(r, right, [
    [pt(x + dy, y + dx), t('It looks like the two moves were swapped. The first number moves right or left (x); the second moves up or down (y).', 'Il semble que les deux déplacements ont été inversés. Le premier nombre déplace à droite ou à gauche (x) ; le second déplace en haut ou en bas (y).')],
    [pt(x - dx, y - dy), t('It looks like the translation was applied backwards.', 'Il semble que la translation a été appliquée à l\'envers.')],
    [pt(x + dx, y - dy), t('It looks like the vertical move went the wrong direction. Positive y moves up.', 'Il semble que le déplacement vertical est allé dans l\'autre direction. Un y positif déplace vers le haut.')],
  ].filter(([o]) => (o as Text).en !== right.en) as [Text, Text][]);
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is translated ${f.N(Math.abs(dx))} units ${dx > 0 ? 'right' : 'left'} and ${f.N(Math.abs(dy))} units ${dy > 0 ? 'up' : 'down'}. What are the coordinates of its image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une translation de ${f.N(Math.abs(dx))} unités vers la ${dx > 0 ? 'droite' : 'gauche'} et de ${f.N(Math.abs(dy))} unités vers le ${dy > 0 ? 'haut' : 'bas'}. Quelles sont les coordonnées de son image ?`)),
    options: m.options, correct: m.correct, why: m.why,
    steps: [bi((f) => f.t(`Moving ${dx > 0 ? 'right' : 'left'} changes x: ${f.N(x)} ${dx > 0 ? '+' : '−'} ${f.N(Math.abs(dx))} = ${f.N(x + dx)}.`, `Aller vers la ${dx > 0 ? 'droite' : 'gauche'} change x : ${f.N(x)} ${dx > 0 ? '+' : '−'} ${f.N(Math.abs(dx))} = ${f.N(x + dx)}.`)), bi((f) => f.t(`Moving ${dy > 0 ? 'up' : 'down'} changes y: ${f.N(y)} ${dy > 0 ? '+' : '−'} ${f.N(Math.abs(dy))} = ${f.N(y + dy)}.`, `Aller vers le ${dy > 0 ? 'haut' : 'bas'} change y : ${f.N(y)} ${dy > 0 ? '+' : '−'} ${f.N(Math.abs(dy))} = ${f.N(y + dy)}.`))],
    nudge: t('Right and left change x. Up and down change y.', 'La droite et la gauche changent x. Le haut et le bas changent y.'),
    category: 'AP',
  };
});

/** MS.G5.E1.1.a: properties of triangles */
export const triangles5 = numGen('MS.G5.E1.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 25, 85);
    const b = randInt(r, 25, 85);
    return {
      prompt: bi((f) => f.t(`Two angles of a triangle are ${f.N(a)}° and ${f.N(b)}°. What is the third angle in degrees?`, `Deux angles d\'un triangle mesurent ${f.N(a)}° et ${f.N(b)}°. Combien mesure le troisième angle, en degrés ?`)),
      answer: 180 - a - b,
      wrong: [[a + b, t('It looks like the two angles were added and stopped. The three angles add to 180°, so subtract that sum from 180°.', 'Il semble que les deux angles ont été additionnés, sans plus. Les trois angles totalisent 180° : soustrais cette somme de 180°.'), 1]],
      steps: [bi((f) => f.t(`The angles of a triangle add to 180°. ${f.N(a)}° + ${f.N(b)}° = ${f.N(a + b)}°.`, `Les angles d\'un triangle totalisent 180°. ${f.N(a)}° + ${f.N(b)}° = ${f.N(a + b)}°.`)), bi((f) => `180° − ${f.N(a + b)}° = ${f.N(180 - a - b)}°.`)],
      nudge: t('The three angles of a triangle always add to 180°.', 'Les trois angles d\'un triangle totalisent toujours 180°.'),
    };
  }
  if (tier === 2) {
    const apex = randInt(r, 5, 40) * 2;
    return {
      prompt: bi((f) => f.t(`An isosceles triangle has an angle of ${f.N(apex)}° between its two equal sides. What is each of the other two angles in degrees?`, `Un triangle isocèle a un angle de ${f.N(apex)}° entre ses deux côtés égaux. Combien mesure chacun des deux autres angles, en degrés ?`)),
      answer: (180 - apex) / 2,
      wrong: [[180 - apex, t('It looks like the total of the two angles was given. They are equal, so share it between them.', 'Il semble que le total des deux angles a été donné. Ils sont égaux : partage-le entre eux.'), 1]],
      steps: [bi((f) => f.t(`The other two angles share 180° − ${f.N(apex)}° = ${f.N(180 - apex)}°.`, `Les deux autres angles se partagent 180° − ${f.N(apex)}° = ${f.N(180 - apex)}°.`)), bi((f) => f.t(`They are equal, so each is ${f.N(180 - apex)}° ÷ 2 = ${f.N((180 - apex) / 2)}°.`, `Ils sont égaux : chacun mesure ${f.N(180 - apex)}° ÷ 2 = ${f.N((180 - apex) / 2)}°.`))],
      nudge: t('Equal sides mean equal angles opposite them.', 'Des côtés égaux veulent dire des angles égaux qui leur sont opposés.'),
    };
  }
  const s = randInt(r, 5, 14);
  const third = randInt(r, 3, s - 1);
  return {
    prompt: bi((f) => f.t(`An isosceles triangle has two equal sides of ${f.N(s)} cm and a perimeter of ${f.N(2 * s + third)} cm. How long is the third side in centimetres?`, `Un triangle isocèle a deux côtés égaux de ${f.N(s)} cm et un périmètre de ${f.N(2 * s + third)} cm. Quelle est la longueur du troisième côté, en centimètres ?`)),
    answer: third,
    wrong: [[2 * s + third - s, t('It looks like only one equal side was subtracted. Subtract both equal sides from the perimeter.', 'Il semble qu\'un seul des côtés égaux a été soustrait. Soustrais les deux côtés égaux du périmètre.'), 1]],
    steps: [bi((f) => f.t(`The two equal sides total ${f.N(s)} + ${f.N(s)} = ${f.N(2 * s)} cm.`, `Les deux côtés égaux totalisent ${f.N(s)} + ${f.N(s)} = ${f.N(2 * s)} cm.`)), bi((f) => f.t(`${f.N(2 * s + third)} − ${f.N(2 * s)} = ${f.N(third)} cm.`, `${f.N(2 * s + third)} − ${f.N(2 * s)} = ${f.N(third)} cm.`))],
    nudge: t('The perimeter is the sum of all three sides.', 'Le périmètre est la somme des trois côtés.'),
    category: 'AP',
  };
});

/** MS.G6.E1.1.a: properties of quadrilaterals */
export const quads6 = numGen('MS.G6.E1.1.a', (tier, r) => {
  if (tier === 1) {
    const a = randInt(r, 60, 110);
    const b = randInt(r, 60, 110);
    const c = randInt(r, 50, 110);
    return {
      prompt: bi((f) => f.t(`Three angles of a quadrilateral are ${f.N(a)}°, ${f.N(b)}° and ${f.N(c)}°. What is the fourth angle in degrees?`, `Trois angles d\'un quadrilatère mesurent ${f.N(a)}°, ${f.N(b)}° et ${f.N(c)}°. Combien mesure le quatrième angle, en degrés ?`)),
      answer: 360 - a - b - c,
      wrong: [[180 - a - b - c > 0 ? 180 - a - b - c : a + b + c - 180, t('It looks like 180° was used. The four angles of a quadrilateral add to 360°.', 'Il semble que 180° a été utilisé. Les quatre angles d\'un quadrilatère totalisent 360°.'), 1]],
      steps: [bi((f) => f.t(`The angles of a quadrilateral add to 360°. ${f.N(a)}° + ${f.N(b)}° + ${f.N(c)}° = ${f.N(a + b + c)}°.`, `Les angles d\'un quadrilatère totalisent 360°. ${f.N(a)}° + ${f.N(b)}° + ${f.N(c)}° = ${f.N(a + b + c)}°.`)), bi((f) => `360° − ${f.N(a + b + c)}° = ${f.N(360 - a - b - c)}°.`)],
      nudge: t('Split a quadrilateral into two triangles: that makes 2 × 180°.', 'Sépare un quadrilatère en deux triangles : cela fait 2 × 180°.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 50, 130);
    return {
      prompt: bi((f) => f.t(`In a parallelogram, one angle is ${f.N(a)}°. What is the angle right next to it, in degrees?`, `Dans un parallélogramme, un angle mesure ${f.N(a)}°. Combien mesure l\'angle juste à côté, en degrés ?`)),
      answer: 180 - a,
      wrong: [[a, t('It looks like the opposite angle was given. Angles next to each other in a parallelogram add to 180°.', 'Il semble que l\'angle opposé a été donné. Les angles côte à côte dans un parallélogramme totalisent 180°.'), 0]].filter(([v]) => v !== 180 - a) as [number, Text, number][],
      steps: [t('Neighbouring angles of a parallelogram are supplementary: they add to 180°.', 'Les angles voisins d\'un parallélogramme sont supplémentaires : ils totalisent 180°.'), bi((f) => `180° − ${f.N(a)}° = ${f.N(180 - a)}°.`)],
      nudge: t('Neighbouring angles of a parallelogram add to 180°.', 'Les angles voisins d\'un parallélogramme totalisent 180°.'),
    };
  }
  const side = randInt(r, 3, 15);
  return {
    prompt: bi((f) => f.t(`A rhombus has a perimeter of ${f.N(4 * side)} cm. How long is each side in centimetres?`, `Un losange a un périmètre de ${f.N(4 * side)} cm. Quelle est la longueur de chaque côté, en centimètres ?`)),
    answer: side,
    wrong: [[(4 * side) / 2, t('It looks like the perimeter was shared between two sides. A rhombus has four equal sides.', 'Il semble que le périmètre a été partagé entre deux côtés. Un losange a quatre côtés égaux.'), 0]],
    steps: [t('A rhombus has four equal sides.', 'Un losange a quatre côtés égaux.'), bi((f) => `${f.N(4 * side)} ÷ 4 = ${f.N(side)} cm.`)],
    nudge: t('All four sides of a rhombus are equal.', 'Les quatre côtés d\'un losange sont égaux.'),
    category: 'AP',
  };
});

/** MS.G5.F1.2.a: cost of transactions with multiple items, including sales tax */
export const salesTax5 = numGen('MS.G5.F1.2.a', (tier, r) => {
  const price = (): number => randInt(r, 2, 15);
  if (tier === 1) {
    const a = r6(price() + randInt(r, 0, 3) * 0.25);
    const b = r6(price() + randInt(r, 0, 3) * 0.25);
    return {
      prompt: bi((f) => f.t(`A notebook costs ${f.D(a, true)} and a pen costs ${f.D(b, true)}. What is the total cost before tax, in dollars?`, `Un cahier coûte ${f.D(a, true)} et un stylo coûte ${f.D(b, true)}. Quel est le coût total avant les taxes, en dollars ?`)),
      answer: r6(a + b),
      steps: [t('Add the prices of the items.', 'Additionne les prix des articles.'), bi((f) => `${money(f, a)} + ${money(f, b)} = ${money(f, a + b)}.`)],
      nudge: t('Add the two prices, lining up the decimal points.', 'Additionne les deux prix en alignant les virgules.'),
      tolerance: 0.005,
    };
  }
  if (tier === 2) {
    const sub = randInt(r, 5, 60);
    const tax = r6(sub * 0.13);
    return {
      prompt: bi((f) => f.t(`Items cost ${f.D(sub, true)} before tax. The sales tax is 13%. What is the total cost including tax, in dollars?`, `Des articles coûtent ${f.D(sub, true)} avant les taxes. La taxe de vente est de 13 %. Quel est le coût total, taxes comprises, en dollars ?`)),
      answer: r6(sub + tax),
      wrong: [[tax, t('It looks like only the tax was given. The total is the price plus the tax.', 'Il semble que seule la taxe a été donnée. Le total est le prix plus la taxe.'), 1]],
      steps: [bi((f) => f.t(`Tax: 13% of ${money(f, sub)} = ${f.N(sub)} × 0.13 = ${f.D(tax, true)}.`, `Taxe : 13 % de ${money(f, sub)} = ${f.N(sub)} × 0,13 = ${f.D(tax, true)}.`)), bi((f) => `${money(f, sub)} + ${money(f, tax)} = ${money(f, sub + tax)}.`)],
      nudge: t('Find 13% of the price, then add it to the price.', 'Trouve 13 % du prix, puis ajoute-le au prix.'),
      tolerance: 0.005,
    };
  }
  const qa = randInt(r, 2, 5);
  const pa = price();
  const qb = randInt(r, 1, 4);
  const pb = price();
  const sub = qa * pa + qb * pb;
  const total = r6(sub * 1.13);
  return {
    prompt: bi((f) => f.t(`Sam buys ${f.N(qa)} items at ${f.D(pa, true)} each and ${f.N(qb)} items at ${f.D(pb, true)} each. The sales tax is 13%. What is the total cost, in dollars?`, `Sam achète ${f.N(qa)} articles à ${f.D(pa, true)} chacun et ${f.N(qb)} articles à ${f.D(pb, true)} chacun. La taxe de vente est de 13 %. Quel est le coût total, en dollars ?`)),
    answer: total,
    wrong: [[sub, t('It looks like the tax was left out. Add 13% of the subtotal.', 'Il semble que la taxe a été oubliée. Ajoute 13 % du sous-total.'), 2]],
    steps: [bi((f) => f.t(`Subtotal: ${f.N(qa)} × ${money(f, pa)} + ${f.N(qb)} × ${money(f, pb)} = ${f.D(sub, true)}.`, `Sous-total : ${f.N(qa)} × ${money(f, pa)} + ${f.N(qb)} × ${money(f, pb)} = ${f.D(sub, true)}.`)), bi((f) => f.t(`Tax: ${f.N(sub)} × 0.13 = ${f.D(sub * 0.13, true)}.`, `Taxe : ${f.N(sub)} × 0,13 = ${f.D(sub * 0.13, true)}.`)), bi((f) => `${money(f, sub)} + ${money(f, sub * 0.13)} = ${money(f, total)}.`)],
    nudge: t('Find the subtotal first, then the tax, then add them.', 'Trouve d\'abord le sous-total, puis la taxe, puis additionne-les.'),
    category: 'AP',
    tolerance: 0.005,
  };
});

/** MS.G5.F1.5.a: unit rates and best value */
export const bestValue5 = choiceGen('MS.G5.F1.5.a', (tier, r) => {
  const u1 = randInt(r, 2, 9) * 25 / 100 + (tier === 1 ? 0.5 : 0);
  const delta = [0.25, 0.5][randInt(r, 0, 1)]!;
  const u2 = r6(u1 + (randInt(r, 0, 1) ? delta : -delta));
  const q1 = [2, 3, 4, 5][randInt(r, 0, 3)]!;
  let q2 = [6, 8, 10, 12][randInt(r, 0, 3)]!;
  if (tier === 1) q2 = q1 * 2;
  const p1 = r6(q1 * u1);
  const p2 = r6(q2 * u2);
  const better = u1 < u2 ? 0 : 1;
  const m = mc(r, bi((f) => f.t(better === 0 ? `Pack A (${f.N(q1)} for ${f.D(p1, true)})` : `Pack B (${f.N(q2)} for ${f.D(p2, true)})`, better === 0 ? `Emballage A (${f.N(q1)} pour ${f.D(p1, true)})` : `Emballage B (${f.N(q2)} pour ${f.D(p2, true)})`)), [[bi((f) => f.t(better === 0 ? `Pack B (${f.N(q2)} for ${f.D(p2, true)})` : `Pack A (${f.N(q1)} for ${f.D(p1, true)})`, better === 0 ? `Emballage B (${f.N(q2)} pour ${f.D(p2, true)})` : `Emballage A (${f.N(q1)} pour ${f.D(p1, true)})`)), t('It looks like the packs were compared by total price. Compare the price for ONE item (the unit rate) instead.', 'Il semble que les emballages ont été comparés selon le prix total. Compare plutôt le prix pour UN article (le taux unitaire).')]]);
  return {
    prompt: bi((f) => f.t(`Pack A has ${f.N(q1)} juice boxes for ${f.D(p1, true)}. Pack B has ${f.N(q2)} juice boxes for ${f.D(p2, true)}. Which is the better buy?`, `L\'emballage A contient ${f.N(q1)} boîtes de jus pour ${f.D(p1, true)}. L\'emballage B contient ${f.N(q2)} boîtes de jus pour ${f.D(p2, true)}. Lequel est le meilleur achat ?`)),
    options: m.options, correct: m.correct, why: m.why,
    steps: [bi((f) => f.t(`Pack A: ${money(f, p1)} ÷ ${f.N(q1)} = ${f.D(u1, true)} per box.`, `Emballage A : ${money(f, p1)} ÷ ${f.N(q1)} = ${f.D(u1, true)} par boîte.`)), bi((f) => f.t(`Pack B: ${money(f, p2)} ÷ ${f.N(q2)} = ${f.D(u2, true)} per box.`, `Emballage B : ${money(f, p2)} ÷ ${f.N(q2)} = ${f.D(u2, true)} par boîte.`)), bi((f) => f.t(`The lower price per box is the better buy: ${better === 0 ? 'Pack A' : 'Pack B'}.`, `Le prix le plus bas par boîte est le meilleur achat : ${better === 0 ? 'emballage A' : 'emballage B'}.`))],
    nudge: t('Find the price for one box in each pack, then compare.', 'Trouve le prix d\'une boîte dans chaque emballage, puis compare.'),
    category: 'AP',
  };
});

/** MS.G6.F1.4.a: simple interest on accounts and loans */
export const simpleInterest6 = numGen('MS.G6.F1.4.a', (tier, r) => {
  const P = randInt(r, 2, 20) * 100;
  const rate = randInt(r, 2, 8);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`You put ${f.D(P)} in an account that pays ${f.m(`${f.n(rate)}\\%`)} simple interest per year. How many dollars of interest do you earn in 1 year?`, `Tu déposes ${f.D(P)} dans un compte qui verse ${f.m(`${f.n(rate)}\\%`)} d\'intérêt simple par année. Combien de dollars d\'intérêt gagnes-tu en 1 an ?`)),
      answer: (P * rate) / 100,
      wrong: [[rate, t('It looks like the rate was given as dollars. Find the percent of the amount.', 'Il semble que le taux a été donné en dollars. Trouve le pourcentage du montant.'), 0]],
      steps: [bi((f) => f.t(`Interest = ${f.m(`${f.n(rate)}\\%`)} of ${f.N(P)}.`, `Intérêt = ${f.m(`${f.n(rate)}\\%`)} de ${f.N(P)}.`)), bi((f) => `${f.N(P)} × ${f.N(rate / 100)} = ${f.N((P * rate) / 100)}.`)],
      nudge: t('Find the percent of the amount in the account.', 'Trouve le pourcentage du montant dans le compte.'),
    };
  }
  const yrs = randInt(r, 2, 5);
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`You put ${f.D(P)} in an account that pays ${f.m(`${f.n(rate)}\\%`)} simple interest per year. How many dollars of interest do you earn in ${f.N(yrs)} years?`, `Tu déposes ${f.D(P)} dans un compte qui verse ${f.m(`${f.n(rate)}\\%`)} d\'intérêt simple par année. Combien de dollars d\'intérêt gagnes-tu en ${f.N(yrs)} ans ?`)),
      answer: (P * rate * yrs) / 100,
      wrong: [[(P * rate) / 100, t('It looks like only one year of interest was counted. Simple interest is the same amount every year, so multiply by the number of years.', 'Il semble que seulement un an d\'intérêt a été compté. L\'intérêt simple est le même chaque année : multiplie par le nombre d\'années.'), 1]],
      steps: [bi((f) => f.t(`One year: ${f.m(`${f.n(rate)}\\%`)} of ${f.N(P)} = ${f.D((P * rate) / 100)}.`, `Un an : ${f.m(`${f.n(rate)}\\%`)} de ${f.N(P)} = ${f.D((P * rate) / 100)}.`)), bi((f) => `${f.N((P * rate) / 100)} × ${f.N(yrs)} = ${f.N((P * rate * yrs) / 100)}.`)],
      nudge: t('Find one year of interest, then multiply by the number of years.', 'Trouve l\'intérêt d\'un an, puis multiplie par le nombre d\'années.'),
    };
  }
  return {
    prompt: bi((f) => f.t(`You borrow ${f.D(P)} at ${f.m(`${f.n(rate)}\\%`)} simple interest per year and repay it all after ${f.N(yrs)} years. How many dollars do you repay in total?`, `Tu empruntes ${f.D(P)} à ${f.m(`${f.n(rate)}\\%`)} d\'intérêt simple par année et tu rembourses le tout après ${f.N(yrs)} ans. Combien de dollars rembourses-tu au total ?`)),
    answer: P + (P * rate * yrs) / 100,
    wrong: [[(P * rate * yrs) / 100, t('It looks like only the interest was given. You repay the amount borrowed plus the interest.', 'Il semble que seul l\'intérêt a été donné. Tu rembourses le montant emprunté plus l\'intérêt.'), 1]],
    steps: [bi((f) => f.t(`Interest: ${f.N(P)} × ${f.N(rate / 100)} × ${f.N(yrs)} = ${f.D((P * rate * yrs) / 100)}.`, `Intérêt : ${f.N(P)} × ${f.N(rate / 100)} × ${f.N(yrs)} = ${f.D((P * rate * yrs) / 100)}.`)), bi((f) => f.t(`Total repaid: ${f.N(P)} + ${f.N((P * rate * yrs) / 100)} = ${f.D(P + (P * rate * yrs) / 100)}.`, `Total remboursé : ${f.N(P)} + ${f.N((P * rate * yrs) / 100)} = ${f.D(P + (P * rate * yrs) / 100)}.`))],
    nudge: t('Find the interest first, then add it to the amount borrowed.', 'Trouve d\'abord l\'intérêt, puis ajoute-le au montant emprunté.'),
    category: 'AP',
  };
});
