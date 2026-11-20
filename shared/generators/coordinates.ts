// Grade 5 coordinates in the first quadrant: plot a point, read a point.
import { makeRng, randInt, shuffle } from '../rng.js';
import type { Generator } from '../items/types.js';
import { build, t, tex } from './kit.js';

/** MS.G5.E1.4.a: plot and read points in the first quadrant */
export const plotPoints: Generator = (tier, seed) => {
  const r = makeRng(seed);
  const max = tier === 1 ? 5 : 8;
  const size = max + 1;
  let x = randInt(r, 1, max);
  let y = randInt(r, 1, max);
  if (x === y) y = y === max ? 1 : y + 1;

  if (tier === 3) {
    const real = `(${x}, ${y})`;
    const swapped = `(${y}, ${x})`;
    const options = shuffle(r, [real, swapped, `(${x}, ${Math.min(max, y + 1) === y ? y - 1 : y + 1})`, `(${x + 1 > max ? x - 1 : x + 1}, ${y})`]);
    return build({
      skill: 'MS.G5.E1.4.a', tier, seed, category: 'KU', format: 'choice',
      prompt: t('Which ordered pair names the point shown?', 'Quelle paire ordonnée désigne le point montré ?'),
      visual: { type: 'plane', size, points: [{ x, y }] },
      options: options.map((o) => t(tex(o), tex(o))),
      answer: { kind: 'choice', index: options.indexOf(real) },
      steps: [
        t(`Start at the origin. Go across ${x} (the first number).`, `Pars de l'origine. Avance de ${x} vers la droite (le premier nombre).`),
        t(`Then go up ${y} (the second number).`, `Puis monte de ${y} (le deuxième nombre).`),
        t(`The point is ${tex(real)}.`, `Le point est ${tex(real)}.`),
      ],
      nudge: t('The first number tells how far across, the second how far up.', 'Le premier nombre indique de combien aller vers la droite, le deuxième de combien monter.'),
      stepHint: t(`Count across from the origin to the point: ${x}.`, `Compte vers la droite à partir de l'origine jusqu'au point : ${x}.`),
      wrong: [{ answer: { kind: 'choice', index: options.indexOf(swapped) }, stepIndex: 0, why: t('It looks like the coordinates were swapped. Go across first, then up.', 'Il semble que les coordonnées ont été inversées. Va d\'abord vers la droite, puis monte.') }],
      praise: t('Nice, you went across first and then up.', 'Bravo, tu as d\'abord avancé vers la droite, puis monté.'),
    });
  }

  return build({
    skill: 'MS.G5.E1.4.a', tier, seed, category: 'KU', format: 'point',
    prompt: t(`Plot the point ${tex(`(${x}, ${y})`)} by tapping the grid.`, `Place le point ${tex(`(${x}, ${y})`)} en touchant la grille.`),
    visual: { type: 'plane', size, click: true },
    answer: { kind: 'point', x, y, tol: 0.45 },
    steps: [
      t(`Start at the origin ${tex('(0, 0)')}. Go across ${x}.`, `Pars de l'origine ${tex('(0, 0)')}. Avance de ${x} vers la droite.`),
      t(`Then go up ${y}.`, `Puis monte de ${y}.`),
      t(`Mark the point there.`, `Marque le point à cet endroit.`),
    ],
    nudge: t('The first number tells how far across, the second how far up.', 'Le premier nombre indique de combien aller vers la droite, le deuxième de combien monter.'),
    stepHint: t(`Count ${x} steps across from the origin, then ${y} steps up.`, `Compte ${x} pas vers la droite à partir de l'origine, puis ${y} pas vers le haut.`),
    wrong: [{ answer: { kind: 'point', x: y, y: x, tol: 0.45 }, stepIndex: 0, why: t('It looks like the coordinates were swapped. The first number tells how far across, the second how far up.', 'Il semble que les coordonnées ont été inversées. Le premier nombre indique de combien aller vers la droite, le deuxième de combien monter.') }],
    praise: t('Nice, you went across first and then up.', 'Bravo, tu as d\'abord avancé vers la droite, puis monté.'),
  });
};
