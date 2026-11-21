// Grade 9 (MTH1W) Geometry and Measurement (E): designs with circle and triangle properties, unit conversions, how scaling changes
// perimeter, area, surface area and volume, the Pythagorean relationship in composite shapes, and the pyramid and cone volume relationships.
import { pick, randInt } from '../rng.js';
import type { Generator } from '../items/types.js';
import { bi, keepWrong as wr, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);
const deg = (f: F, x: number): string => f.m(`${f.n(x)}^{\\circ}`);
const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25]];

/** MTH1W.E1.2: designs using circle and triangle properties */
export const circleTriangle9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const apex = randInt(r, 4, 16) * 10, base = (180 - apex) / 2;
    return {
      prompt: bi((f) => f.t(`A roof truss is an isosceles triangle. The angle at the top is ${deg(f, apex)}. What is each base angle, in degrees?`, `Une ferme de toit est un triangle isocèle. L'angle au sommet est de ${deg(f, apex)}. Quelle est la mesure de chaque angle à la base, en degrés ?`)),
      answer: base, category: 'KU',
      wrong: wr(base, [[180 - apex, t('That is the sum of the two base angles. Each base angle is half of it, because they are equal.', 'C\'est la somme des deux angles à la base. Chaque angle à la base en est la moitié, puisqu\'ils sont égaux.'), 1], [apex, t('The angles of a triangle add to 180°, and the two base angles are equal.', 'Les angles d\'un triangle totalisent 180° et les deux angles à la base sont égaux.'), 0], [r6((180 - apex) / 3), t('Divide the remaining angle by 2, not 3: there are two equal base angles.', 'Divise l\'angle restant par 2, pas par 3 : il y a deux angles à la base égaux.'), 1]]),
      steps: [bi((f) => f.t(`The three angles add to 180°, so the base angles share ${f.m(`180 - ${f.n(apex)}`)} = ${deg(f, 180 - apex)}.`, `Les trois angles totalisent 180° : les angles à la base se partagent ${f.m(`180 - ${f.n(apex)}`)} = ${deg(f, 180 - apex)}.`)), bi((f) => f.t(`They are equal, so each is ${deg(f, base)}.`, `Ils sont égaux : chacun mesure ${deg(f, base)}.`))],
      nudge: t('The angles add to 180° and the two base angles of an isosceles triangle are equal.', 'Les angles totalisent 180° et les deux angles à la base d\'un triangle isocèle sont égaux.'),
    };
  }
  if (tier === 2) {
    const rad = randInt(r, 3, 15);
    return {
      prompt: bi((f) => f.t(`A regular hexagon is drawn inside a circle of radius ${f.N(rad)} cm, with its corners on the circle. It is made of 6 equilateral triangles that meet at the centre. What is the perimeter of the hexagon, in cm?`, `Un hexagone régulier est tracé dans un cercle de rayon ${f.N(rad)} cm, avec ses sommets sur le cercle. Il est formé de 6 triangles équilatéraux qui se rejoignent au centre. Quel est le périmètre de l'hexagone, en cm ?`)),
      answer: 6 * rad, category: 'AP',
      wrong: wr(6 * rad, [[rad * 3, t('The hexagon has 6 sides, not 3.', 'L\'hexagone a 6 côtés, pas 3.'), 1], [r6(2 * Math.PI * rad), t('That is the circumference of the circle. The hexagon is made of straight sides, each as long as the radius.', 'C\'est la circonférence du cercle. L\'hexagone a des côtés droits, chacun aussi long que le rayon.'), 1], [rad * 12, t('Each side equals the radius, not the diameter.', 'Chaque côté est égal au rayon, pas au diamètre.'), 1]]),
      steps: [bi((f) => f.t(`Each triangle is equilateral and two of its sides are radii, so every side of the hexagon is ${f.N(rad)} cm.`, `Chaque triangle est équilatéral et deux de ses côtés sont des rayons : chaque côté de l'hexagone mesure ${f.N(rad)} cm.`)), bi((f) => f.t(`${f.m(`6 \\times ${f.n(rad)}`)} = ${f.N(6 * rad)} cm.`, `${f.m(`6 \\times ${f.n(rad)}`)} = ${f.N(6 * rad)} cm.`))],
      nudge: t('In each equilateral triangle, a side equals the radius. Count the sides.', 'Dans chaque triangle équilatéral, un côté est égal au rayon. Compte les côtés.'),
    };
  }
  const a = randInt(r, 20, 70);
  return {
    prompt: bi((f) => f.t(`A triangle is drawn in a circle so that one side is a diameter. One of the other angles is ${deg(f, a)}. What is the third angle, in degrees?`, `Un triangle est tracé dans un cercle de sorte qu'un côté est un diamètre. Un des autres angles mesure ${deg(f, a)}. Quelle est la mesure du troisième angle, en degrés ?`)),
    answer: 90 - a, category: 'TH',
    wrong: wr(90 - a, [[90, t('The angle opposite the diameter is 90°, so the other two angles share the remaining 90°.', 'L\'angle opposé au diamètre vaut 90° : les deux autres angles se partagent les 90° restants.'), 0], [180 - a, t('Take away the 90° angle as well: the three angles add to 180°.', 'Retire aussi l\'angle de 90° : les trois angles totalisent 180°.'), 1], [a, t('The two angles that are not 90° are not equal unless the triangle is isosceles.', 'Les deux angles qui ne valent pas 90° ne sont pas égaux, sauf si le triangle est isocèle.'), 1]]),
    steps: [t('An angle drawn in a semicircle (opposite a diameter) is a right angle.', 'Un angle inscrit dans un demi-cercle (opposé à un diamètre) est un angle droit.'), bi((f) => f.t(`${f.m(`180 - 90 - ${f.n(a)}`)} = ${deg(f, 90 - a)}.`, `${f.m(`180 - 90 - ${f.n(a)}`)} = ${deg(f, 90 - a)}.`))],
    nudge: t('The angle opposite a diameter is 90°. The angles of a triangle add to 180°.', 'L\'angle opposé à un diamètre vaut 90°. Les angles d\'un triangle totalisent 180°.'),
  };
});

/** MTH1W.E1.3: unit conversions within and between measurement systems */
export const convert9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const [x, from, to, k, fr1, fr2] = pick(r, [[randInt(r, 2, 90) / 10, 'kilometres', 'metres', 1000, 'kilomètres', 'mètres'], [randInt(r, 2, 90) / 10, 'litres', 'millilitres', 1000, 'litres', 'millilitres'], [randInt(r, 2, 90) / 10, 'kilograms', 'grams', 1000, 'kilogrammes', 'grammes'], [randInt(r, 20, 900), 'centimetres', 'metres', 0.01, 'centimètres', 'mètres']] as [number, string, string, number, string, string][]);
    const ans = r6(x * k);
    return {
      prompt: bi((f) => f.t(`Convert ${f.N(x)} ${from} to ${to}.`, `Convertis ${f.N(x)} ${fr1} en ${fr2}.`)),
      answer: ans, category: 'KU',
      wrong: wr(ans, [[r6(x / k), t('Check the direction: to go to a smaller unit, multiply; to go to a larger unit, divide.', 'Vérifie le sens : pour aller vers une plus petite unité, on multiplie ; vers une plus grande, on divise.'), 0], [r6(x * k * 10), t('Check how many of the smaller unit fit in the larger one.', 'Vérifie combien de petites unités entrent dans la grande.'), 0], [r6(x * k / 10), t('Check how many of the smaller unit fit in the larger one.', 'Vérifie combien de petites unités entrent dans la grande.'), 0]]),
      steps: [bi((f) => f.t(`${k >= 1 ? 'Going to a smaller unit' : 'Going to a larger unit'}, ${k >= 1 ? 'multiply' : 'divide'} by ${f.N(k >= 1 ? k : 1 / k)}.`, `${k >= 1 ? 'Vers une plus petite unité' : 'Vers une plus grande unité'}, ${k >= 1 ? 'multiplie' : 'divise'} par ${f.N(k >= 1 ? k : 1 / k)}.`)), bi((f) => f.t(`${f.N(x)} ${from} = ${f.N(ans)} ${to}.`, `${f.N(x)} ${fr1} = ${f.N(ans)} ${fr2}.`))],
      nudge: t('Decide whether the new unit is smaller or larger, then multiply or divide.', 'Décide si la nouvelle unité est plus petite ou plus grande, puis multiplie ou divise.'),
    };
  }
  if (tier === 2) {
    const ft = randInt(r, 2, 12), cm = r6(ft * 30.48), inch = randInt(r, 4, 60);
    const toMetric = r() < 0.5;
    return toMetric ? {
      prompt: bi((f) => f.t(`A board is ${f.N(inch)} inches long. How long is it in centimetres? (1 inch = 2.54 cm.)`, `Une planche mesure ${f.N(inch)} pouces de long. Quelle est sa longueur en centimètres ? (1 pouce = 2,54 cm.)`)),
      answer: r6(inch * 2.54), category: 'AP',
      wrong: wr(r6(inch * 2.54), [[r6(inch / 2.54), t('A centimetre is smaller than an inch, so the number of centimetres is bigger: multiply.', 'Un centimètre est plus petit qu\'un pouce : le nombre de centimètres est plus grand : multiplie.'), 0], [r6(inch * 25.4), t('1 inch is 2.54 cm, not 25.4 cm.', '1 pouce vaut 2,54 cm, pas 25,4 cm.'), 0], [r6(inch * 2.5), t('Use the exact conversion 2.54.', 'Utilise la conversion exacte 2,54.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(inch)} \\times 2.54`)} = ${f.N(r6(inch * 2.54))} cm.`, `${f.m(`${f.n(inch)} \\times 2.54`)} = ${f.N(r6(inch * 2.54))} cm.`)), t('Multiply when changing to the smaller unit.', 'Multiplie quand on passe à la plus petite unité.')],
      nudge: t('Multiply the inches by 2.54.', 'Multiplie les pouces par 2,54.'),
    } : {
      prompt: bi((f) => f.t(`A room is ${f.N(cm)} cm wide. How many feet is that? (1 foot = 30.48 cm.)`, `Une pièce mesure ${f.N(cm)} cm de large. Combien de pieds cela fait-il ? (1 pied = 30,48 cm.)`)),
      answer: ft, category: 'AP',
      wrong: wr(ft, [[r6(cm * 30.48), t('A foot is bigger than a centimetre, so there are fewer feet: divide.', 'Un pied est plus grand qu\'un centimètre : il y a moins de pieds : divise.'), 0], [r6(cm / 2.54), t('That converts to inches. Divide by 30.48 for feet.', 'Cela convertit en pouces. Divise par 30,48 pour obtenir des pieds.'), 0], [r6(cm / 3.048), t('Divide by 30.48.', 'Divise par 30,48.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(cm)} \\div 30.48`)} = ${f.N(ft)} feet.`, `${f.m(`${f.n(cm)} \\div 30.48`)} = ${f.N(ft)} pieds.`)), t('Divide when changing to the larger unit.', 'Divise quand on passe à la plus grande unité.')],
      nudge: t('Divide the centimetres by 30.48.', 'Divise les centimètres par 30,48.'),
    };
  }
  const kind = pick(r, [0, 1, 2]);
  if (kind === 0) {
    const m2 = randInt(r, 2, 40) / 2, ans = r6(m2 * 10000);
    return {
      prompt: bi((f) => f.t(`A rug has an area of ${f.N(m2)} square metres. What is its area in square centimetres?`, `Un tapis a une aire de ${f.N(m2)} mètres carrés. Quelle est son aire en centimètres carrés ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[m2 * 100, t('Area is in square units: 1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm².', 'L\'aire est en unités carrées : 1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm².'), 0], [m2 * 1000000, t('1 m² is 10 000 cm², not 1 000 000 cm².', '1 m² vaut 10 000 cm², pas 1 000 000 cm².'), 0], [r6(m2 / 10000), t('Going to a smaller unit makes the number bigger: multiply.', 'Passer à une plus petite unité agrandit le nombre : multiplie.'), 0]]),
      steps: [t('1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm².', '1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm².'), bi((f) => f.t(`${f.m(`${f.n(m2)} \\times 10\\,000`)} = ${f.N(ans)} cm².`, `${f.m(`${f.n(m2)} \\times 10\\,000`)} = ${f.N(ans)} cm².`))],
      nudge: t('For area, the conversion factor is squared.', 'Pour l\'aire, le facteur de conversion est mis au carré.'),
    };
  }
  if (kind === 1) {
    const L = randInt(r, 2, 40) / 2, ans = r6(L * 1000);
    return {
      prompt: bi((f) => f.t(`A tank holds ${f.N(L)} litres. How many cubic centimetres is that? (1 litre = 1000 cm³.)`, `Un réservoir contient ${f.N(L)} litres. Combien de centimètres cubes cela fait-il ? (1 litre = 1000 cm³.)`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, [[r6(L / 1000), t('Going to the smaller unit makes the number bigger: multiply.', 'Passer à la plus petite unité agrandit le nombre : multiplie.'), 0], [r6(L * 100), t('1 litre is 1000 cm³.', '1 litre vaut 1000 cm³.'), 0], [r6(L * 10000), t('1 litre is 1000 cm³, not 10 000.', '1 litre vaut 1000 cm³, pas 10 000.'), 0]]),
      steps: [bi((f) => f.t(`${f.m(`${f.n(L)} \\times 1000`)} = ${f.N(ans)} cm³.`, `${f.m(`${f.n(L)} \\times 1000`)} = ${f.N(ans)} cm³.`)), t('Multiply by 1000 for each litre.', 'Multiplie par 1000 pour chaque litre.')],
      nudge: t('Each litre is 1000 cm³.', 'Chaque litre vaut 1000 cm³.'),
    };
  }
  const m3 = randInt(r, 1, 12) / 2, ans = r6(m3 * 1000);
  return {
    prompt: bi((f) => f.t(`A pool holds ${f.N(m3)} cubic metres of water. How many litres is that? (1 m³ = 1000 litres.)`, `Une piscine contient ${f.N(m3)} mètres cubes d'eau. Combien de litres cela fait-il ? (1 m³ = 1000 litres.)`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[r6(m3 / 1000), t('A litre is much smaller than a cubic metre, so there are many more litres: multiply.', 'Un litre est beaucoup plus petit qu\'un mètre cube : il y a beaucoup plus de litres : multiplie.'), 0], [r6(m3 * 100), t('1 m³ is 1000 litres.', '1 m³ vaut 1000 litres.'), 0], [r6(m3 * 1000000), t('1 m³ is 1000 litres, not 1 000 000 (that is cm³).', '1 m³ vaut 1000 litres, pas 1 000 000 (ce sont des cm³).'), 0]]),
    steps: [bi((f) => f.t(`${f.m(`${f.n(m3)} \\times 1000`)} = ${f.N(ans)} litres.`, `${f.m(`${f.n(m3)} \\times 1000`)} = ${f.N(ans)} litres.`)), t('Multiply by 1000 for each cubic metre.', 'Multiplie par 1000 pour chaque mètre cube.')],
    nudge: t('Each cubic metre is 1000 litres.', 'Chaque mètre cube vaut 1000 litres.'),
  };
});

/** MTH1W.E1.4: how scaling changes perimeter, area, surface area and volume */
export const scaling9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const w = randInt(r, 2, 9), h = randInt(r, 2, 9), k = pick(r, [2, 3, 4]);
    return {
      prompt: bi((f) => f.t(`A rectangle is ${f.N(w)} cm by ${f.N(h)} cm. Each side is multiplied by ${f.N(k)}. What is the area of the new rectangle, in cm²?`, `Un rectangle mesure ${f.N(w)} cm sur ${f.N(h)} cm. Chaque côté est multiplié par ${f.N(k)}. Quelle est l'aire du nouveau rectangle, en cm² ?`)),
      answer: w * h * k * k, category: 'AP',
      wrong: wr(w * h * k * k, [[w * h * k, t('Area grows by the scale factor squared, because both length and width are scaled.', 'L\'aire est multipliée par le carré du facteur d\'échelle, parce que la longueur et la largeur sont toutes deux multipliées.'), 1], [w * h, t('That is the original area. Multiply it by k × k.', 'C\'est l\'aire de départ. Multiplie-la par k × k.'), 0], [(w + h) * 2 * k, t('That is the new perimeter, not the area.', 'C\'est le nouveau périmètre, pas l\'aire.'), 1]]),
      steps: [bi((f) => f.t(`The new sides are ${f.N(w * k)} cm and ${f.N(h * k)} cm.`, `Les nouveaux côtés mesurent ${f.N(w * k)} cm et ${f.N(h * k)} cm.`)), bi((f) => f.t(`${f.m(`${f.n(w * k)} \\times ${f.n(h * k)}`)} = ${f.N(w * h * k * k)} cm².`, `${f.m(`${f.n(w * k)} \\times ${f.n(h * k)}`)} = ${f.N(w * h * k * k)} cm².`))],
      nudge: t('Multiply each side by the scale factor, then find the area. Or multiply the old area by k².', 'Multiplie chaque côté par le facteur d\'échelle, puis trouve l\'aire. Ou multiplie l\'ancienne aire par k².'),
    };
  }
  if (tier === 2) {
    const s = randInt(r, 2, 8), k = pick(r, [2, 3, 4]), askVol = r() < 0.5;
    const ans = askVol ? s ** 3 * k ** 3 : 6 * s * s * k * k;
    return {
      prompt: bi((f) => f.t(`A cube has edges of ${f.N(s)} cm. Each edge is multiplied by ${f.N(k)}. What is the ${askVol ? 'volume, in cm³' : 'surface area, in cm²'}, of the new cube?`, `Un cube a des arêtes de ${f.N(s)} cm. Chaque arête est multipliée par ${f.N(k)}. Quel est ${askVol ? 'le volume, en cm³' : 'l\'aire totale, en cm²'}, du nouveau cube ?`)),
      answer: ans, category: 'AP',
      wrong: wr(ans, askVol ? [[s ** 3 * k * k, t('Volume grows by the scale factor cubed, because three lengths are scaled.', 'Le volume est multiplié par le cube du facteur d\'échelle, parce que trois longueurs sont multipliées.'), 1], [s ** 3 * k, t('Volume grows by the scale factor cubed.', 'Le volume est multiplié par le cube du facteur d\'échelle.'), 1], [6 * s * s * k * k, t('That is the surface area, not the volume.', 'C\'est l\'aire totale, pas le volume.'), 1]] : [[6 * s * s * k, t('Surface area grows by the scale factor squared, because two lengths are scaled.', 'L\'aire totale est multipliée par le carré du facteur d\'échelle, parce que deux longueurs sont multipliées.'), 1], [s ** 3 * k ** 3, t('That is the volume, not the surface area.', 'C\'est le volume, pas l\'aire totale.'), 1], [6 * s * s, t('That is the original surface area. Multiply it by k².', 'C\'est l\'aire totale de départ. Multiplie-la par k².'), 0]]),
      steps: [bi((f) => f.t(`The new edge is ${f.m(`${f.n(s)} \\times ${f.n(k)}`)} = ${f.N(s * k)} cm.`, `La nouvelle arête mesure ${f.m(`${f.n(s)} \\times ${f.n(k)}`)} = ${f.N(s * k)} cm.`)), bi((f) => f.t(askVol ? `Volume: ${f.m(`${f.n(s * k)}^{3}`)} = ${f.N(ans)} cm³.` : `Surface area: ${f.m(`6 \\times ${f.n(s * k)}^{2}`)} = ${f.N(ans)} cm².`, askVol ? `Volume : ${f.m(`${f.n(s * k)}^{3}`)} = ${f.N(ans)} cm³.` : `Aire totale : ${f.m(`6 \\times ${f.n(s * k)}^{2}`)} = ${f.N(ans)} cm².`))],
      nudge: t('Scale the edge first, then find the volume (edge cubed) or surface area (6 × edge squared).', 'Multiplie d\'abord l\'arête, puis trouve le volume (arête au cube) ou l\'aire totale (6 × arête au carré).'),
    };
  }
  const k = pick(r, [2, 3, 4, 5]), a0 = randInt(r, 2, 12), v0 = randInt(r, 2, 12);
  const askVol = r() < 0.5, ans = askVol ? v0 * k ** 3 : a0 * k * k;
  return {
    prompt: bi((f) => f.t(`A model has a surface area of ${f.N(a0)} cm² and a volume of ${f.N(v0)} cm³. A larger version has ${f.N(k)} times the length in every direction. What is the larger version's ${askVol ? 'volume, in cm³' : 'surface area, in cm²'}?`, `Une maquette a une aire totale de ${f.N(a0)} cm² et un volume de ${f.N(v0)} cm³. Une version plus grande a ${f.N(k)} fois la longueur dans toutes les directions. Quel est ${askVol ? 'le volume, en cm³' : 'l\'aire totale, en cm²'} de la version plus grande ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, askVol ? [[v0 * k * k, t('Volume scales by k³ (three lengths), not k².', 'Le volume est multiplié par k³ (trois longueurs), pas par k².'), 1], [v0 * k, t('Volume scales by k³.', 'Le volume est multiplié par k³.'), 1], [a0 * k ** 3, t('Use the volume of the model, and multiply it by k³.', 'Utilise le volume de la maquette et multiplie-le par k³.'), 0]] : [[a0 * k ** 3, t('Surface area scales by k² (two lengths), not k³.', 'L\'aire totale est multipliée par k² (deux longueurs), pas par k³.'), 1], [a0 * k, t('Surface area scales by k².', 'L\'aire totale est multipliée par k².'), 1], [v0 * k * k, t('Use the surface area of the model, and multiply it by k².', 'Utilise l\'aire totale de la maquette et multiplie-la par k².'), 0]]),
    steps: [t('Lengths scale by k, areas by k², and volumes by k³.', 'Les longueurs sont multipliées par k, les aires par k² et les volumes par k³.'), bi((f) => f.t(askVol ? `${f.m(`${f.n(v0)} \\times ${f.n(k)}^{3}`)} = ${f.N(ans)} cm³.` : `${f.m(`${f.n(a0)} \\times ${f.n(k)}^{2}`)} = ${f.N(ans)} cm².`, askVol ? `${f.m(`${f.n(v0)} \\times ${f.n(k)}^{3}`)} = ${f.N(ans)} cm³.` : `${f.m(`${f.n(a0)} \\times ${f.n(k)}^{2}`)} = ${f.N(ans)} cm².`))],
    nudge: t('Area scales by the factor squared and volume by the factor cubed.', 'L\'aire est multipliée par le carré du facteur et le volume par son cube.'),
  };
});

/** MTH1W.E1.5: the Pythagorean relationship in composite shapes */
export const composite9 = (id: string): Generator => numGen(id, (tier, r) => {
  const [a, b, c] = pick(r, TRIPLES.slice(0, 5));
  if (tier === 1) {
    const top = randInt(r, 4, 14);
    return {
      prompt: bi((f) => f.t(`An isosceles trapezoid has a top of ${f.N(top)} cm, a bottom of ${f.N(top + 2 * a)} cm and slanted sides of ${f.N(c)} cm. What is its height, in cm?`, `Un trapèze isocèle a un haut de ${f.N(top)} cm, un bas de ${f.N(top + 2 * a)} cm et des côtés obliques de ${f.N(c)} cm. Quelle est sa hauteur, en cm ?`)),
      answer: b, category: 'AP',
      wrong: wr(b, [[a, t('That is the horizontal part of each slanted side. The height is the other leg of the right triangle.', 'C\'est la partie horizontale de chaque côté oblique. La hauteur est l\'autre côté de l\'angle droit du triangle rectangle.'), 1], [c, t('That is the slanted side, which is the hypotenuse of the triangle.', 'C\'est le côté oblique, l\'hypoténuse du triangle.'), 1], [r6(Math.sqrt(c * c + a * a)), t('The slanted side is the hypotenuse: subtract the squares, do not add them.', 'Le côté oblique est l\'hypoténuse : soustrais les carrés, ne les additionne pas.'), 1]]),
      steps: [bi((f) => f.t(`Each end sticks out ${f.m(`(${f.n(top + 2 * a)} - ${f.n(top)}) \\div 2`)} = ${f.N(a)} cm, forming a right triangle with hypotenuse ${f.N(c)} cm.`, `Chaque extrémité dépasse de ${f.m(`(${f.n(top + 2 * a)} - ${f.n(top)}) \\div 2`)} = ${f.N(a)} cm et forme un triangle rectangle d'hypoténuse ${f.N(c)} cm.`)), bi((f) => f.t(`${f.m(`h = \\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`, `${f.m(`h = \\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`))],
      nudge: t('Drop a vertical line from each top corner to make a right triangle, and use the Pythagorean theorem.', 'Trace une verticale depuis chaque coin du haut pour former un triangle rectangle, et utilise le théorème de Pythagore.'),
    };
  }
  if (tier === 2) {
    const top = randInt(r, 4, 14), area = ((top + top + 2 * a) * b) / 2;
    return {
      prompt: bi((f) => f.t(`An isosceles trapezoid has a top of ${f.N(top)} cm, a bottom of ${f.N(top + 2 * a)} cm and slanted sides of ${f.N(c)} cm. What is its area, in cm²?`, `Un trapèze isocèle a un haut de ${f.N(top)} cm, un bas de ${f.N(top + 2 * a)} cm et des côtés obliques de ${f.N(c)} cm. Quelle est son aire, en cm² ?`)),
      answer: area, category: 'AP',
      wrong: wr(area, [[((top + top + 2 * a) * c) / 2, t('Use the height (perpendicular to the bases), not the slanted side.', 'Utilise la hauteur (perpendiculaire aux bases), pas le côté oblique.'), 1], [(top + top + 2 * a) * b, t('Divide by 2: the area of a trapezoid is (sum of the bases) × height ÷ 2.', 'Divise par 2 : l\'aire d\'un trapèze est (somme des bases) × hauteur ÷ 2.'), 1], [(top * b), t('Use both bases: average them, then multiply by the height.', 'Utilise les deux bases : fais-en la moyenne, puis multiplie par la hauteur.'), 1]]),
      steps: [bi((f) => f.t(`The height is ${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`, `La hauteur est ${f.m(`\\sqrt{${f.n(c)}^{2} - ${f.n(a)}^{2}}`)} = ${f.N(b)} cm.`)), bi((f) => f.t(`${f.m(`\\frac{(${f.n(top)} + ${f.n(top + 2 * a)}) \\times ${f.n(b)}}{2}`)} = ${f.N(area)} cm².`, `${f.m(`\\frac{(${f.n(top)} + ${f.n(top + 2 * a)}) \\times ${f.n(b)}}{2}`)} = ${f.N(area)} cm².`))],
      nudge: t('Find the height with the Pythagorean theorem first, then use the trapezoid area formula.', 'Trouve d\'abord la hauteur avec le théorème de Pythagore, puis utilise la formule de l\'aire du trapèze.'),
    };
  }
  const [l, w, h, d] = pick(r, [[2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11]] as [number, number, number, number][]);
  return {
    prompt: bi((f) => f.t(`A box is ${f.N(l)} cm long, ${f.N(w)} cm wide and ${f.N(h)} cm tall. What is the length of the longest straight line that fits inside it, from one corner to the opposite corner, in cm?`, `Une boîte mesure ${f.N(l)} cm de long, ${f.N(w)} cm de large et ${f.N(h)} cm de haut. Quelle est la longueur du plus long segment droit qui entre dedans, d'un coin au coin opposé, en cm ?`)),
    answer: d, category: 'TH',
    wrong: wr(d, [[l + w + h, t('That adds the three edges. The straight line across the box is shorter: use the Pythagorean theorem twice.', 'Cela additionne les trois arêtes. Le segment droit à travers la boîte est plus court : utilise deux fois le théorème de Pythagore.'), 1], [r6(Math.sqrt(l * l + w * w)), t('That is the diagonal of the base only. Include the height too.', 'C\'est seulement la diagonale de la base. Inclus aussi la hauteur.'), 1], [r6(Math.sqrt(l * l + w * w + h * h) ** 2), t('That is the square of the length. Take the square root.', 'C\'est le carré de la longueur. Prends la racine carrée.'), 1]]),
    steps: [bi((f) => f.t(`The diagonal is ${f.m(`d = \\sqrt{l^{2} + w^{2} + h^{2}}`)}.`, `La diagonale est ${f.m(`d = \\sqrt{l^{2} + w^{2} + h^{2}}`)}.`)), bi((f) => f.t(`${f.m(`\\sqrt{${f.n(l * l)} + ${f.n(w * w)} + ${f.n(h * h)}} = \\sqrt{${f.n(d * d)}}`)} = ${f.N(d)} cm.`, `${f.m(`\\sqrt{${f.n(l * l)} + ${f.n(w * w)} + ${f.n(h * h)}} = \\sqrt{${f.n(d * d)}}`)} = ${f.N(d)} cm.`))],
    nudge: t('Find the diagonal of the base, then use it with the height in a second right triangle.', 'Trouve la diagonale de la base, puis utilise-la avec la hauteur dans un second triangle rectangle.'),
  };
});

/** MTH1W.E1.6: prism-pyramid and cylinder-cone volume relationships */
export const volumeRelations9 = (id: string): Generator => numGen(id, (tier, r) => {
  if (tier === 1) {
    const V = randInt(r, 4, 40) * 3, pyramid = r() < 0.5;
    return {
      prompt: bi((f) => f.t(`A prism and a pyramid have the same base and the same height. The ${pyramid ? 'prism' : 'pyramid'} has a volume of ${f.N(pyramid ? V : V / 3)} cm³. What is the volume of the ${pyramid ? 'pyramid' : 'prism'}, in cm³?`, `Un prisme et une pyramide ont la même base et la même hauteur. ${pyramid ? 'Le prisme' : 'La pyramide'} a un volume de ${f.N(pyramid ? V : V / 3)} cm³. Quel est le volume ${pyramid ? 'de la pyramide' : 'du prisme'}, en cm³ ?`)),
      answer: pyramid ? V / 3 : V, category: 'KU',
      wrong: wr(pyramid ? V / 3 : V, pyramid ? [[V / 2, t('A pyramid is one third of the prism with the same base and height, not one half.', 'Une pyramide est le tiers du prisme de même base et de même hauteur, pas la moitié.'), 0], [V * 3, t('The pyramid is smaller than the prism: divide by 3.', 'La pyramide est plus petite que le prisme : divise par 3.'), 0], [V, t('The pyramid holds only one third of the prism.', 'La pyramide ne contient que le tiers du prisme.'), 0]] : [[V / 3 * 2, t('The prism is three times the pyramid, not twice.', 'Le prisme est trois fois la pyramide, pas deux fois.'), 0], [V / 9, t('The prism is bigger than the pyramid: multiply by 3.', 'Le prisme est plus grand que la pyramide : multiplie par 3.'), 0], [V / 3, t('The prism holds three times as much as the pyramid.', 'Le prisme contient trois fois plus que la pyramide.'), 0]]),
      steps: [t('A pyramid has one third of the volume of a prism with the same base and height.', 'Une pyramide a le tiers du volume d\'un prisme de même base et de même hauteur.'), bi((f) => f.t(pyramid ? `${f.m(`${f.n(V)} \\div 3`)} = ${f.N(V / 3)} cm³.` : `${f.m(`${f.n(V / 3)} \\times 3`)} = ${f.N(V)} cm³.`, pyramid ? `${f.m(`${f.n(V)} \\div 3`)} = ${f.N(V / 3)} cm³.` : `${f.m(`${f.n(V / 3)} \\times 3`)} = ${f.N(V)} cm³.`))],
      nudge: t('The pyramid is one third of the prism.', 'La pyramide est le tiers du prisme.'),
    };
  }
  if (tier === 2) {
    const V = randInt(r, 4, 40) * 3, cone = r() < 0.5;
    return {
      prompt: bi((f) => f.t(`A cone and a cylinder have the same base and the same height. The ${cone ? 'cylinder' : 'cone'} holds ${f.N(cone ? V : V / 3)} mL. How many mL does the ${cone ? 'cone' : 'cylinder'} hold?`, `Un cône et un cylindre ont la même base et la même hauteur. ${cone ? 'Le cylindre' : 'Le cône'} contient ${f.N(cone ? V : V / 3)} mL. Combien de mL contient ${cone ? 'le cône' : 'le cylindre'} ?`)),
      answer: cone ? V / 3 : V, category: 'KU',
      wrong: wr(cone ? V / 3 : V, cone ? [[V / 2, t('A cone is one third of the cylinder, not one half.', 'Un cône est le tiers du cylindre, pas la moitié.'), 0], [V * 3, t('The cone holds less than the cylinder: divide by 3.', 'Le cône contient moins que le cylindre : divise par 3.'), 0], [V, t('The cone holds only one third of the cylinder.', 'Le cône ne contient que le tiers du cylindre.'), 0]] : [[V / 3 * 2, t('The cylinder holds three times the cone.', 'Le cylindre contient trois fois le cône.'), 0], [V / 9, t('The cylinder holds more: multiply by 3.', 'Le cylindre contient plus : multiplie par 3.'), 0], [V / 3, t('The cylinder holds three times as much as the cone.', 'Le cylindre contient trois fois plus que le cône.'), 0]]),
      steps: [t('A cone has one third of the volume of a cylinder with the same base and height.', 'Un cône a le tiers du volume d\'un cylindre de même base et de même hauteur.'), bi((f) => f.t(cone ? `${f.m(`${f.n(V)} \\div 3`)} = ${f.N(V / 3)} mL.` : `${f.m(`${f.n(V / 3)} \\times 3`)} = ${f.N(V)} mL.`, cone ? `${f.m(`${f.n(V)} \\div 3`)} = ${f.N(V / 3)} mL.` : `${f.m(`${f.n(V / 3)} \\times 3`)} = ${f.N(V)} mL.`))],
      nudge: t('The cone is one third of the cylinder.', 'Le cône est le tiers du cylindre.'),
    };
  }
  const rr = randInt(r, 2, 9), h = randInt(r, 3, 12), V = Math.round(((3.14 * rr * rr * h) / 3) * 100) / 100;
  return {
    prompt: bi((f) => f.t(`A cone has a radius of ${f.N(rr)} cm and a height of ${f.N(h)} cm. What is its volume, in cm³? Use ${f.m('\\pi \\approx 3.14')} and give the answer to two decimals.`, `Un cône a un rayon de ${f.N(rr)} cm et une hauteur de ${f.N(h)} cm. Quel est son volume, en cm³ ? Utilise ${f.m('\\pi \\approx 3{,}14')} et donne la réponse à deux décimales.`)),
    answer: V, tolerance: 0.011, category: 'AP',
    wrong: wr(V, [[r6(3.14 * rr * rr * h), t('That is the volume of the cylinder. A cone is one third of it.', 'C\'est le volume du cylindre. Un cône en est le tiers.'), 1], [r6((3.14 * rr * h) / 3), t('The radius is squared in the base area: π r².', 'Le rayon est mis au carré dans l\'aire de la base : π r².'), 0], [r6((3.14 * rr * rr * h) / 2), t('The cone is one third of the cylinder, not one half.', 'Le cône est le tiers du cylindre, pas la moitié.'), 1]]),
    steps: [bi((f) => f.t(`Base area: ${f.m(`\\pi r^{2} = 3.14 \\times ${f.n(rr)}^{2}`)} = ${f.N(r6(3.14 * rr * rr))} cm².`, `Aire de la base : ${f.m(`\\pi r^{2} = 3{,}14 \\times ${f.n(rr)}^{2}`)} = ${f.N(r6(3.14 * rr * rr))} cm².`)), bi((f) => f.t(`${f.m(`V = \\frac{1}{3} \\times ${f.n(r6(3.14 * rr * rr))} \\times ${f.n(h)}`)} ≈ ${f.N(V)} cm³.`, `${f.m(`V = \\frac{1}{3} \\times ${f.n(r6(3.14 * rr * rr))} \\times ${f.n(h)}`)} ≈ ${f.N(V)} cm³.`))],
    nudge: t('Volume of a cone = one third of π r² times the height.', 'Volume d\'un cône = le tiers de π r² fois la hauteur.'),
  };
});

void tierGen;
