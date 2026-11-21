// Grade 5 Spatial Sense strand (E), the expectations that were not built before 2.8.2 and can be asked without a drawing:
// translations, reflections and rotations on a grid, choosing and estimating with metric units, and comparing angles.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G5.E1.5.a: translations, reflections and rotations up to 180 degrees on a grid */
const translate5 = numGen('MS.G5.E1.5.a', (_tier, r) => {
  const x = randInt(r, 1, 8), y = randInt(r, 1, 8), a = randInt(r, 1, 7), b = randInt(r, 1, 7);
  const askX = r() < 0.5;
  return {
    prompt: bi((f) => f.t(`On a grid, the point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is translated ${f.N(a)} units right and ${f.N(b)} units up. What is the ${askX ? 'x' : 'y'}-coordinate of the image?`, `Sur une grille, le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une translation de ${f.N(a)} unités vers la droite et de ${f.N(b)} unités vers le haut. Quelle est la coordonnée ${askX ? 'x' : 'y'} de l'image ?`)),
    answer: askX ? x + a : y + b, category: 'AP',
    wrong: wr(askX ? x + a : y + b, [[askX ? y + b : x + a, t('That is the other coordinate. Check which coordinate the question asks for.', 'C\'est l\'autre coordonnée. Vérifie quelle coordonnée la question demande.'), 0], [askX ? x + b : y + a, t('The moves were mixed up. Right changes the x-coordinate and up changes the y-coordinate.', 'Les déplacements ont été mélangés. La droite change la coordonnée x et le haut change la coordonnée y.'), 0]]),
    steps: [t('Moving right or left changes the x-coordinate. Moving up or down changes the y-coordinate.', 'Aller à droite ou à gauche change la coordonnée x. Aller en haut ou en bas change la coordonnée y.'), bi((f) => (askX ? `${f.N(x)} + ${f.N(a)} = ${f.N(x + a)}.` : `${f.N(y)} + ${f.N(b)} = ${f.N(y + b)}.`))],
    nudge: t('Right changes x and up changes y. Add the move to the right coordinate.', 'La droite change x et le haut change y. Ajoute le déplacement à la bonne coordonnée.'),
  };
});
const reflect5 = numGen('MS.G5.E1.5.a', (_tier, r) => {
  const vertical = r() < 0.5;
  const k = randInt(r, 5, 9), d = randInt(r, 1, 4), other = randInt(r, 1, 9);
  const pos = k - d; // point is d units left of (or below) the mirror line
  const image = k + d;
  return {
    prompt: bi((f) => vertical
      ? f.t(`The point ${f.m(`(${f.n(pos)},\\ ${f.n(other)})`)} is reflected in the vertical line ${f.m(`x = ${f.n(k)}`)}. What is the x-coordinate of the image?`, `Le point ${f.m(`(${f.n(pos)},\\ ${f.n(other)})`)} est réfléchi par rapport à la droite verticale ${f.m(`x = ${f.n(k)}`)}. Quelle est la coordonnée x de l'image ?`)
      : f.t(`The point ${f.m(`(${f.n(other)},\\ ${f.n(pos)})`)} is reflected in the horizontal line ${f.m(`y = ${f.n(k)}`)}. What is the y-coordinate of the image?`, `Le point ${f.m(`(${f.n(other)},\\ ${f.n(pos)})`)} est réfléchi par rapport à la droite horizontale ${f.m(`y = ${f.n(k)}`)}. Quelle est la coordonnée y de l'image ?`)),
    answer: image, category: 'AP',
    wrong: wr(image, [[pos, t('That is the original coordinate. A reflection moves the point to the other side of the line.', 'C\'est la coordonnée de départ. Une réflexion déplace le point de l\'autre côté de la droite.'), 1], [k + d + d, t('That moves the point too far. The image is as far from the line as the point is.', 'Cela déplace le point trop loin. L\'image est aussi loin de la droite que l\'est le point.'), 1]]),
    steps: [bi((f) => f.t(`The point is ${f.N(k)} − ${f.N(pos)} = ${f.N(d)} units from the line.`, `Le point est à ${f.N(k)} − ${f.N(pos)} = ${f.N(d)} unités de la droite.`)), bi((f) => f.t(`The image is ${f.N(d)} units on the other side: ${f.N(k)} + ${f.N(d)} = ${f.N(image)}.`, `L'image est à ${f.N(d)} unités de l'autre côté : ${f.N(k)} + ${f.N(d)} = ${f.N(image)}.`))],
    nudge: t('Find how far the point is from the mirror line, then go the same distance on the other side.', 'Trouve à quelle distance de la droite miroir se trouve le point, puis va à la même distance de l\'autre côté.'),
  };
});
const rotate5 = numGen('MS.G5.E1.5.a', (_tier, r) => {
  const cx = randInt(r, 4, 8), cy = randInt(r, 4, 8), x = randInt(r, 1, cx - 1), y = randInt(r, 1, cy - 1);
  const askX = r() < 0.5;
  const ix = 2 * cx - x, iy = 2 * cy - y;
  return {
    prompt: bi((f) => f.t(`The point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} is rotated 180° about the point ${f.m(`(${f.n(cx)},\\ ${f.n(cy)})`)}. What is the ${askX ? 'x' : 'y'}-coordinate of the image?`, `Le point ${f.m(`(${f.n(x)},\\ ${f.n(y)})`)} subit une rotation de 180° autour du point ${f.m(`(${f.n(cx)},\\ ${f.n(cy)})`)}. Quelle est la coordonnée ${askX ? 'x' : 'y'} de l'image ?`)),
    answer: askX ? ix : iy, category: 'TH',
    wrong: wr(askX ? ix : iy, [[askX ? iy : ix, t('That is the other coordinate. Check which coordinate the question asks for.', 'C\'est l\'autre coordonnée. Vérifie quelle coordonnée la question demande.'), 1], [askX ? cx - x : cy - y, t('That is how far the point is from the centre. A half turn puts the image that far on the other side of the centre.', 'C\'est la distance du point au centre. Un demi-tour place l\'image à cette distance de l\'autre côté du centre.'), 1]]),
    steps: [bi((f) => (askX ? f.t(`The point is ${f.N(cx)} − ${f.N(x)} = ${f.N(cx - x)} units left of the centre.`, `Le point est à ${f.N(cx)} − ${f.N(x)} = ${f.N(cx - x)} unités à gauche du centre.`) : f.t(`The point is ${f.N(cy)} − ${f.N(y)} = ${f.N(cy - y)} units below the centre.`, `Le point est à ${f.N(cy)} − ${f.N(y)} = ${f.N(cy - y)} unités sous le centre.`))), bi((f) => (askX ? f.t(`A half turn puts the image the same distance to the right: ${f.N(cx)} + ${f.N(cx - x)} = ${f.N(ix)}.`, `Un demi-tour place l'image à la même distance à droite : ${f.N(cx)} + ${f.N(cx - x)} = ${f.N(ix)}.`) : f.t(`A half turn puts the image the same distance above: ${f.N(cy)} + ${f.N(cy - y)} = ${f.N(iy)}.`, `Un demi-tour place l'image à la même distance au-dessus : ${f.N(cy)} + ${f.N(cy - y)} = ${f.N(iy)}.`)))],
    nudge: t('A 180° turn puts the image on the opposite side of the centre, the same distance away.', 'Une rotation de 180° place l\'image de l\'autre côté du centre, à la même distance.'),
  };
});
export const transformations5 = tierGen(translate5, reflect5, rotate5);

/** MS.G5.E2.1.a: using metric units to estimate and measure length, area, mass and capacity */
type Unit = [string, string];
const UNITS = { len: [['millimetres', 'millimètres'], ['centimetres', 'centimètres'], ['metres', 'mètres'], ['kilometres', 'kilomètres']] as Unit[], mass: [['grams', 'grammes'], ['kilograms', 'kilogrammes'], ['tonnes', 'tonnes']] as Unit[], cap: [['millilitres', 'millilitres'], ['litres', 'litres']] as Unit[] };
const UNIT_SC: { kind: keyof typeof UNITS; right: number; en: string; fr: string; tier: number }[] = [
  { kind: 'len', right: 1, en: 'the length of a pencil', fr: 'la longueur d\'un crayon', tier: 1 },
  { kind: 'len', right: 3, en: 'the distance between two towns', fr: 'la distance entre deux villes', tier: 1 },
  { kind: 'len', right: 2, en: 'the length of a classroom', fr: 'la longueur d\'une salle de classe', tier: 1 },
  { kind: 'mass', right: 0, en: 'the mass of a paper clip', fr: 'la masse d\'un trombone', tier: 1 },
  { kind: 'mass', right: 1, en: 'the mass of a school bag', fr: 'la masse d\'un sac d\'école', tier: 2 },
  { kind: 'cap', right: 0, en: 'the amount of medicine in a spoon', fr: 'la quantité de médicament dans une cuillère', tier: 2 },
  { kind: 'cap', right: 1, en: 'the water in a bathtub', fr: 'l\'eau dans une baignoire', tier: 2 },
  { kind: 'len', right: 0, en: 'the thickness of a coin', fr: 'l\'épaisseur d\'une pièce de monnaie', tier: 2 },
  { kind: 'mass', right: 2, en: 'the mass of a truck', fr: 'la masse d\'un camion', tier: 2 },
];
const unitChoice = choiceGen('MS.G5.E2.1.a', (tier, r) => {
  const sc = pick(r, UNIT_SC.filter((s) => s.tier === tier));
  const us = UNITS[sc.kind];
  const m = mc(r, t(...us[sc.right]!), us.filter((_, i) => i !== sc.right).map((u): [Text, Text] => [t(...u), t('That unit would give a number that is far too big or too small to be useful for this measurement.', 'Cette unité donnerait un nombre beaucoup trop grand ou trop petit pour être utile pour cette mesure.')]));
  return {
    prompt: t(`Which metric unit is best for measuring ${sc.en}?`, `Quelle unité métrique est la meilleure pour mesurer ${sc.fr} ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('Pick a unit that gives a sensible number: small things in small units, large things in large units.', 'Choisis une unité qui donne un nombre raisonnable : les petites choses en petites unités, les grandes choses en grandes unités.'), t(`For ${sc.en}, the best unit is ${us[sc.right]![0]}.`, `Pour ${sc.fr}, la meilleure unité est ${us[sc.right]![1]}.`)],
    nudge: t('Think of how big the thing is. Would the number be small and easy to read?', 'Pense à la grosseur de la chose. Le nombre serait-il petit et facile à lire ?'),
  };
});
const ESTIMATES: { en: string; fr: string; right: [number, string, string]; wrong: [number, string, string][] }[] = [
  { en: 'the mass of an apple', fr: 'la masse d\'une pomme', right: [150, 'grams', 'grammes'], wrong: [[15, 'grams', 'grammes'], [15, 'kilograms', 'kilogrammes'], [1500, 'grams', 'grammes']] },
  { en: 'the height of a door', fr: 'la hauteur d\'une porte', right: [2, 'metres', 'mètres'], wrong: [[20, 'centimetres', 'centimètres'], [20, 'metres', 'mètres'], [200, 'metres', 'mètres']] },
  { en: 'the amount of water in a big bottle', fr: 'la quantité d\'eau dans une grande bouteille', right: [2, 'litres', 'litres'], wrong: [[20, 'litres', 'litres'], [2, 'millilitres', 'millilitres'], [200, 'litres', 'litres']] },
  { en: 'the length of a pencil', fr: 'la longueur d\'un crayon', right: [18, 'centimetres', 'centimètres'], wrong: [[18, 'metres', 'mètres'], [180, 'centimetres', 'centimètres'], [1.8, 'centimetres', 'centimètres']] },
];
const estimate5 = choiceGen('MS.G5.E2.1.a', (_tier, r) => {
  const s = pick(r, ESTIMATES);
  const opt = (x: [number, string, string]): Text => bi((f) => f.t(`${f.N(x[0])} ${x[1]}`, `${f.N(x[0])} ${x[2]}`));
  const m = mc(r, opt(s.right), s.wrong.slice(0, 3).map((w): [Text, Text] => [opt(w), t('That amount is much too big or much too small for this object. Compare it with things you know, like a litre bottle or a metre stick.', 'Cette quantité est beaucoup trop grande ou beaucoup trop petite pour cet objet. Compare-la avec des choses que tu connais, comme une bouteille d\'un litre ou un mètre.')]));
  return {
    prompt: t(`Which is the best estimate for ${s.en}?`, `Quelle est la meilleure estimation pour ${s.fr} ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'AP',
    steps: [t('Use a benchmark you know: about 1 g is a paper clip, 1 kg a bag of sugar, 1 L a milk carton, 1 m a big step.', 'Utilise un repère que tu connais : environ 1 g est un trombone, 1 kg un sac de sucre, 1 L un carton de lait, 1 m un grand pas.'), t('Choose the estimate that is close to what you would expect.', 'Choisis l\'estimation qui est proche de ce à quoi tu t\'attends.')],
    nudge: t('Compare the object with a benchmark like a litre carton or a metre stick.', 'Compare l\'objet avec un repère comme un carton d\'un litre ou un mètre.'),
  };
});
export const metricUnits5 = tierGen(unitChoice, unitChoice, estimate5);

/** MS.G5.E2.3.a: comparing angles by matching and with non-standard units */
const angleDiff = numGen('MS.G5.E2.3.a', (_tier, r) => {
  const a = randInt(r, 2, 6), b = a + randInt(r, 2, 7);
  return {
    prompt: bi((f) => f.t(`Angle A is measured with a paper wedge as a unit and is ${f.N(a)} wedges wide. Angle B is ${f.N(b)} wedges wide. How many more wedges wide is angle B than angle A?`, `L'angle A est mesuré avec un coin de papier comme unité et mesure ${f.N(a)} coins de large. L'angle B mesure ${f.N(b)} coins de large. Combien de coins de plus mesure l'angle B par rapport à l'angle A ?`)),
    answer: b - a, category: 'AP',
    wrong: wr(b - a, [[a + b, t('That adds the two angles. To compare, take the smaller from the larger.', 'Cela additionne les deux angles. Pour comparer, retire le plus petit du plus grand.'), 1], [b, t('That is the size of angle B. The question asks how much larger it is.', 'C\'est la mesure de l\'angle B. La question demande de combien il est plus grand.'), 1]]),
    steps: [t('The same wedge is used for both angles, so the numbers can be compared directly.', 'Le même coin est utilisé pour les deux angles : les nombres peuvent être comparés directement.'), bi((f) => `${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}.`)],
    nudge: t('Subtract the smaller number of wedges from the larger.', 'Soustrais le plus petit nombre de coins du plus grand.'),
  };
});
const angleDouble = numGen('MS.G5.E2.3.a', (_tier, r) => {
  const a = randInt(r, 2, 8), k = randInt(r, 2, 4);
  return {
    prompt: bi((f) => f.t(`Angle A is ${f.N(a)} wedges wide. Angle B is ${f.N(k)} times as wide as angle A. How many wedges wide are the two angles together?`, `L'angle A mesure ${f.N(a)} coins de large. L'angle B est ${f.N(k)} fois plus large que l'angle A. Combien de coins de large mesurent les deux angles ensemble ?`)),
    answer: a + k * a, category: 'AP',
    wrong: wr(a + k * a, [[k * a, t('That is only angle B. The question asks for both angles together.', 'C\'est seulement l\'angle B. La question demande les deux angles ensemble.'), 1], [a + k, t('That adds the number of times instead of multiplying. Angle B is k times as wide as angle A.', 'Cela additionne le nombre de fois au lieu de multiplier. L\'angle B est k fois plus large que l\'angle A.'), 0]]),
    steps: [bi((f) => f.t(`Angle B: ${f.N(k)} × ${f.N(a)} = ${f.N(k * a)} wedges.`, `Angle B : ${f.N(k)} × ${f.N(a)} = ${f.N(k * a)} coins.`)), bi((f) => `${f.N(a)} + ${f.N(k * a)} = ${f.N(a + k * a)}.`)],
    nudge: t('Find the size of angle B first, then add the two.', 'Trouve d\'abord la mesure de l\'angle B, puis additionne les deux.'),
  };
});
const angleDegrees = numGen('MS.G5.E2.3.a', (_tier, r) => {
  const per = pick(r, [3, 5, 6, 9, 10, 15]);
  const mine = randInt(r, 2, per - 1);
  const deg = (90 / per) * mine;
  return {
    prompt: bi((f) => f.t(`A right angle (${f.N(90)}°) is exactly ${f.N(per)} paper wedges wide. An angle is ${f.N(mine)} wedges wide. How many degrees is that angle?`, `Un angle droit (${f.N(90)}°) mesure exactement ${f.N(per)} coins de papier de large. Un angle mesure ${f.N(mine)} coins de large. Combien de degrés mesure cet angle ?`)),
    answer: deg, category: 'TH',
    wrong: wr(deg, [[mine, t('That is the number of wedges, not degrees. Find how many degrees one wedge is worth.', 'C\'est le nombre de coins, pas de degrés. Trouve combien de degrés vaut un coin.'), 0], [90 * mine, t('That multiplies by 90. One wedge is only a part of the right angle.', 'Cela multiplie par 90. Un coin n\'est qu\'une partie de l\'angle droit.'), 1]]),
    steps: [bi((f) => f.t(`One wedge is ${f.N(90)} ÷ ${f.N(per)} = ${f.N(90 / per)} degrees.`, `Un coin vaut ${f.N(90)} ÷ ${f.N(per)} = ${f.N(90 / per)} degrés.`)), bi((f) => `${f.N(mine)} × ${f.N(90 / per)} = ${f.N(deg)}.`)],
    nudge: t('Find the degrees in one wedge, then multiply by the number of wedges.', 'Trouve les degrés dans un coin, puis multiplie par le nombre de coins.'),
  };
});
export const compareAngles5 = tierGen(angleDiff, angleDouble, angleDegrees);
