// Questions answered by moving a control: reading and drawing angles on a protractor, and placing a value with a slider.
// Each answer is a number checked with the item's tolerance, so these items grade, give feedback and work offline like typed ones.
import { pick, randInt } from '../rng.js';
import type { Generator, Visual } from '../items/types.js';
import { bi, keepWrong as wr, numGen } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** The angle sizes for a tier: tens, then fives, then any whole number of degrees. */
const sizeFor = (tier: number, r: () => number): number => (tier === 1 ? randInt(r, 1, 17) * 10 : tier === 2 ? randInt(r, 2, 34) * 5 : randInt(r, 8, 172));

/** MS.G5.E2.4.b: read the measure of an angle shown on a protractor */
export const readAngle5 = numGen('MS.G5.E2.4.b', (tier, r) => {
  const a = sizeFor(tier, r);
  const flip = tier > 1 && r() < 0.5;
  const visual: Visual = { type: 'protractor', angle: a, flip };
  return {
    prompt: bi((f) => f.t(`What is the measure of the angle shown on the protractor, in degrees?${flip ? ' The base arm is on the left, so start from the 0 on that side.' : ''}`, `Quelle est la mesure de l'angle montré sur le rapporteur, en degrés ?${flip ? ' Le côté de base est à gauche : pars du 0 de ce côté.' : ''}`)),
    visual, answer: a, category: 'AP', absTolerance: tier === 3 ? 2 : undefined,
    wrong: wr(a, [[180 - a, t('That is the reading on the other scale. Start from the 0 that the base arm points to.', 'C\'est la lecture sur l\'autre échelle. Pars du 0 vers lequel pointe le côté de base.'), 1]]),
    steps: [t('Put your eye on the base arm and find the 0 it points to. Use the scale that starts at that 0.', 'Place ton regard sur le côté de base et trouve le 0 vers lequel il pointe. Utilise l\'échelle qui commence à ce 0.'), bi((f) => f.t(`The other arm crosses ${f.N(a)}° on that scale.`, `L'autre côté coupe ${f.N(a)}° sur cette échelle.`))],
    nudge: t('Which 0 is the base arm pointing to? Read the scale that starts there.', 'Vers quel 0 pointe le côté de base ? Lis l\'échelle qui commence là.'),
    stepHint: t('Use the scale that starts at the 0 the base arm points to.', 'Utilise l\'échelle qui commence au 0 vers lequel pointe le côté de base.'),
  };
});

/** MS.G5.E2.4.c: draw an angle of a given size with a protractor */
export const drawAngle5 = numGen('MS.G5.E2.4.c', (tier, r) => {
  const a = sizeFor(tier, r);
  const flip = tier > 1 && r() < 0.5;
  const visual: Visual = { type: 'protractor', flip };
  return {
    prompt: bi((f) => f.t(`Draw an angle that measures ${f.N(a)}°. Drag the arm on the protractor to the right place.${flip ? ' The base arm is on the left.' : ''}`, `Trace un angle qui mesure ${f.N(a)}°. Glisse le bras sur le rapporteur au bon endroit.${flip ? ' Le côté de base est à gauche.' : ''}`)),
    visual, format: 'angle', answer: a, category: 'AP', absTolerance: tier === 3 ? 3 : 2,
    wrong: wr(a, [[180 - a, t('That is on the other scale. Start from the 0 that the base arm points to.', 'C\'est sur l\'autre échelle. Pars du 0 vers lequel pointe le côté de base.'), 1]]),
    steps: [t('Find the 0 the base arm points to. Count up the scale that starts at that 0.', 'Trouve le 0 vers lequel pointe le côté de base. Monte sur l\'échelle qui commence à ce 0.'), bi((f) => f.t(`Put the arm at ${f.N(a)}° on that scale.`, `Place le bras à ${f.N(a)}° sur cette échelle.`))],
    nudge: t('Which 0 does the base arm point to? Use the scale that starts there.', 'Vers quel 0 pointe le côté de base ? Utilise l\'échelle qui commence là.'),
    stepHint: t('Use the scale that starts at the 0 the base arm points to.', 'Utilise l\'échelle qui commence au 0 vers lequel pointe le côté de base.'),
  };
});

/** MS.G6.B1.2.b: place an integer on a number line with a slider */
const slideDirect = numGen('MS.G6.B1.2.b', (tier, r) => {
  const max = tier === 1 ? 6 : 10;
  const k = randInt(r, 1, max) * (r() < 0.5 ? -1 : 1);
  const visual: Visual = { type: 'numberLine', min: -max, max, ticks: tier === 1 ? 2 * max : max };
  return {
    prompt: bi((f) => f.t(`Slide the marker to ${f.N(k)} on the number line.`, `Glisse le point jusqu'à ${f.N(k)} sur la droite numérique.`)),
    visual, format: 'slider', slider: { min: -max, max, step: 1 }, answer: k, category: 'AP',
    wrong: wr(k, [[-k, t('It looks like the sign is mixed up. Negative numbers are to the left of zero.', 'Il semble que le signe est inversé. Les nombres négatifs sont à gauche de zéro.'), 1]]),
    steps: [t('Find 0. Positive numbers are to its right and negative numbers to its left.', 'Trouve 0. Les nombres positifs sont à sa droite et les négatifs à sa gauche.'), bi((f) => f.t(`Move ${f.N(Math.abs(k))} units ${k < 0 ? 'left' : 'right'} from 0 to land on ${f.N(k)}.`, `Déplace-toi de ${f.N(Math.abs(k))} unités vers la ${k < 0 ? 'gauche' : 'droite'} depuis 0 pour arriver à ${f.N(k)}.`))],
    nudge: t('Is the number positive or negative? That tells you which side of zero.', 'Le nombre est-il positif ou négatif ? Cela indique de quel côté de zéro.'),
  };
});
const slideMove = numGen('MS.G6.B1.2.b', (_tier, r) => {
  const max = 10;
  const start = randInt(r, -6, 6);
  const dir = pick(r, ['left', 'right'] as const);
  const d = randInt(r, 2, 4);
  const ans = dir === 'left' ? start - d : start + d;
  const visual: Visual = { type: 'numberLine', min: -max, max, ticks: max };
  return {
    prompt: bi((f) => f.t(`Start at ${f.N(start)} and move ${d} units to the ${dir}. Slide the marker to where you land.`, `Pars de ${f.N(start)} et déplace-toi de ${d} unités vers la ${dir === 'left' ? 'gauche' : 'droite'}. Glisse le point là où tu arrives.`)),
    visual, format: 'slider', slider: { min: -max, max, step: 1 }, answer: ans, category: 'AP',
    wrong: wr(ans, [[dir === 'left' ? start + d : start - d, t('It looks like you moved the other way. Left makes a number smaller and right makes it greater.', 'Il semble que tu es allé dans l\'autre sens. Aller à gauche rend un nombre plus petit, et à droite plus grand.'), 1]]),
    steps: [t('Left means smaller and right means greater.', 'Gauche veut dire plus petit et droite veut dire plus grand.'), bi((f) => f.t(`${f.N(start)} ${dir === 'left' ? '−' : '+'} ${d} = ${f.N(ans)}.`, `${f.N(start)} ${dir === 'left' ? '−' : '+'} ${d} = ${f.N(ans)}.`))],
    nudge: t('Which way do you move, and does the number get smaller or greater?', 'Dans quel sens te déplaces-tu, et le nombre devient-il plus petit ou plus grand ?'),
  };
});
export const slideInteger6 = tierGen(slideDirect, slideDirect, slideMove);

/** MS.G7.B2.2.b: show a fraction or a decimal as a percent with a slider */
const FRACS: [number, number][][] = [
  [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]],
  [[1, 20], [3, 20], [7, 20], [13, 20], [1, 25], [4, 25], [9, 25], [17, 25], [1, 8], [3, 8], [5, 8], [7, 8]],
];
const slideFraction = numGen('MS.G7.B2.2.b', (tier, r) => {
  const [n, d] = pick(r, FRACS[tier === 1 ? 0 : 1]!);
  const ans = (n * 100) / d;
  const visual: Visual = { type: 'fractionBar', n: 0, d };
  return {
    prompt: bi((f) => f.t(`Slide the marker to the percent that is equal to the fraction ${f.m(`\\frac{${n}}{${d}}`)}.`, `Glisse le point jusqu'au pourcentage égal à la fraction ${f.m(`\\frac{${n}}{${d}}`)}.`)),
    visual, format: 'slider', slider: { min: 0, max: 100, step: 0.5, unit: '%' }, answer: ans, category: 'AP',
    wrong: wr(ans, [[n, t('That is only the numerator. Change the denominator to 100 first, or divide and multiply by 100.', 'C\'est seulement le numérateur. Change d\'abord le dénominateur en 100, ou divise puis multiplie par 100.'), 1], [100 - ans, t('That is the part left over. The fraction names the part you have.', 'C\'est la partie qui reste. La fraction nomme la partie que tu as.'), 1]]),
    steps: [bi((f) => f.t(`A percent is a fraction with denominator 100. Divide ${f.N(n)} by ${f.N(d)}, then multiply by 100.`, `Un pourcentage est une fraction de dénominateur 100. Divise ${f.N(n)} par ${f.N(d)}, puis multiplie par 100.`)), bi((f) => f.t(`${f.N(n)} ÷ ${f.N(d)} × 100 = ${f.N(ans)}%.`, `${f.N(n)} ÷ ${f.N(d)} × 100 = ${f.N(ans)} %.`))],
    nudge: t('How many hundredths is this fraction? Divide, then multiply by 100.', 'Combien de centièmes cette fraction vaut-elle ? Divise, puis multiplie par 100.'),
  };
});
const slideDecimal = numGen('MS.G7.B2.2.b', (_tier, r) => {
  const ans = pick(r, [5, 12.5, 15, 25, 35, 37.5, 45, 62.5, 65, 75, 85, 87.5, 95]);
  const dec = ans / 100;
  return {
    prompt: bi((f) => f.t(`Slide the marker to the percent that is equal to the decimal ${f.N(dec)}.`, `Glisse le point jusqu'au pourcentage égal au nombre décimal ${f.N(dec)}.`)),
    visual: { type: 'fractionBar', n: 0, d: 10 }, format: 'slider', slider: { min: 0, max: 100, step: 0.5, unit: '%' }, answer: ans, category: 'AP',
    wrong: wr(ans, [[dec, t('That is the decimal itself. Multiply by 100 to get the percent.', 'C\'est le nombre décimal lui-même. Multiplie par 100 pour obtenir le pourcentage.'), 1], [ans / 10, t('It looks like you multiplied by 10. A percent is out of 100, so multiply by 100.', 'Il semble que tu as multiplié par 10. Un pourcentage est sur 100 : multiplie par 100.'), 1]]),
    steps: [t('To change a decimal to a percent, multiply by 100. The decimal point moves two places to the right.', 'Pour changer un nombre décimal en pourcentage, multiplie par 100. La virgule se déplace de deux rangs vers la droite.'), bi((f) => f.t(`${f.N(dec)} × 100 = ${f.N(ans)}%.`, `${f.N(dec)} × 100 = ${f.N(ans)} %.`))],
    nudge: t('Multiply the decimal by 100.', 'Multiplie le nombre décimal par 100.'),
  };
});
export const slidePercent7 = tierGen(slideFraction, slideFraction, slideDecimal);
