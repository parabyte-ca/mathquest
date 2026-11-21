// Grade 6 Data (D1.4) and Spatial Sense (E1.2, E2.2, E2.5), asked in words and numbers without a drawing: infographics, views of
// block structures, the protractor up to 360 degrees, and nets.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen, r6, type F } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G6.D1.4.a: infographics (parts, the right graph, and an accurate headline) */
const PARTS: [string, string][] = [['a title', 'un titre'], ['labelled axes with units', 'des axes étiquetés avec des unités'], ['the source of the data', 'la source des données']];
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const missingPart = choiceGen('MS.G6.D1.4.a', (_tier, r) => {
  const miss = pick(r, PARTS), have = PARTS.filter((p) => p !== miss);
  const m = mc(r, t(cap(miss[0]), cap(miss[1])), have.map((p): [Text, Text] => [t(cap(p[0]), cap(p[1])), t('The infographic already has this. Look for the part that is missing.', 'L\'infographie a déjà cela. Cherche la partie qui manque.')]));
  return {
    prompt: t(`A student made an infographic with a histogram and a broken-line graph. It has ${have.map((h) => h[0]).join(' and ')}. What is it missing?`, `Une élève a fait une infographie avec un histogramme et un graphique à ligne brisée. Elle a ${have.map((h) => h[1]).join(' et ')}. Que manque-t-il ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('A good infographic has a title, labelled axes with units and the source of the data, so a reader can trust and understand it.', 'Une bonne infographie a un titre, des axes étiquetés avec des unités et la source des données, pour qu\'un lecteur puisse lui faire confiance et la comprendre.'), t(`Here, ${miss[0]} is missing.`, `Ici, ${miss[1]} manque.`)],
    nudge: t('Check the list: title, axes with units, source. Which one is not there?', 'Vérifie la liste : titre, axes avec unités, source. Laquelle manque ?'),
  };
});
const headlinePercent = numGen('MS.G6.D1.4.a', (_tier, r) => {
  const total = pick(r, [20, 25, 40, 50]), lo = randInt(r, 1, 3);
  const counts = [randInt(r, 2, total / 2 - 1), 0, 0] as number[];
  counts[1] = randInt(r, 2, total - counts[0]! - 3);
  counts[2] = total - counts[0]! - counts[1]!;
  const k = lo - 1;
  const ans = r6((counts[k]! * 100) / total);
  const names = ['0 to 9 minutes', '10 to 19 minutes', '20 minutes or more'];
  const fr = ['0 à 9 minutes', '10 à 19 minutes', '20 minutes ou plus'];
  return {
    prompt: bi((f) => f.t(`A table for an infographic shows how long ${f.N(total)} students take to get to school: ${names.map((n, i) => `${n}: ${f.N(counts[i]!)}`).join('; ')}. What percent should the headline number show for "${names[k]}"?`, `Un tableau pour une infographie montre combien de temps ${f.N(total)} élèves mettent pour aller à l'école : ${fr.map((n, i) => `${n} : ${f.N(counts[i]!)}`).join(' ; ')}. Quel pourcentage le grand titre devrait-il montrer pour « ${fr[k]} » ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[counts[k]!, t('That is the count, not the percent. Divide by the total and multiply by 100.', 'C\'est l\'effectif, pas le pourcentage. Divise par le total et multiplie par 100.'), 0], [r6((counts[k]! * 100) / (total - counts[k]!)), t('Divide by the total number of students, not by the others.', 'Divise par le nombre total d\'élèves, pas par les autres.'), 0]]),
    steps: [bi((f) => `${f.N(counts[k]!)} ÷ ${f.N(total)} = ${f.N(r6(counts[k]! / total))}.`), bi((f) => `${f.N(r6(counts[k]! / total))} × ${f.N(100)} = ${f.N(ans)}%.`)],
    nudge: t('Divide the count in that row by the total, then multiply by 100.', 'Divise l\'effectif de cette ligne par le total, puis multiplie par 100.'),
  };
});
const accurateHeadline = choiceGen('MS.G6.D1.4.a', (_tier, r) => {
  const pct = randInt(r, 2, 8) * 10;
  const m = mc(r, bi((f) => f.t(`About ${f.N(pct)}% of students surveyed ride the bus`, `Environ ${f.N(pct)} % des élèves sondés prennent l'autobus`)), [
    [t('Nearly all students ride the bus', 'Presque tous les élèves prennent l\'autobus'), t('That exaggerates. The data do not say nearly everyone rides.', 'C\'est exagéré. Les données ne disent pas que presque tout le monde le prend.')],
    [bi((f) => f.t(`Only ${f.N(pct / 10)} students ride the bus`, `Seulement ${f.N(pct / 10)} élèves prennent l'autobus`)), t('That uses the wrong number. The table gives a percent, not a count of students.', 'Cela utilise le mauvais nombre. Le tableau donne un pourcentage, pas un effectif d\'élèves.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A survey table shows that ${f.N(pct)}% of the students surveyed ride the bus. Which headline for the infographic is accurate?`, `Un tableau de sondage montre que ${f.N(pct)} % des élèves sondés prennent l'autobus. Quel grand titre est exact pour l'infographie ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('A headline must match the data: use the real percent and do not exaggerate.', 'Un grand titre doit correspondre aux données : utilise le vrai pourcentage et n\'exagère pas.'), bi((f) => f.t(`${f.N(pct)}% means ${f.N(pct)} out of every ${f.N(100)}.`, `${f.N(pct)} % veut dire ${f.N(pct)} sur ${f.N(100)}.`))],
    nudge: t('Which headline says exactly what the percent says?', 'Quel grand titre dit exactement ce que dit le pourcentage ?'),
  };
});
export const infographic6 = tierGen(missingPart, headlinePercent, accurateHeadline);

/** MS.G6.E1.2.a: build 3-D objects from top, front and side views */
const grid = (r: () => number): number[][] => [0, 1].map(() => [0, 1, 2].map(() => randInt(r, 1, 4)));
const gridProse = (f: F, g: number[][]): string => g.map((row, i) => `${i === 0 ? f.t('front row', 'rangée avant') : f.t('back row', 'rangée arrière')} ${f.m(row.map((h) => f.n(h)).join(',\\ '))}`).join(f.t(' and ', ' et '));
const totalCubes = numGen('MS.G6.E1.2.a', (_tier, r) => {
  const g = grid(r), ans = g.flat().reduce((a, b) => a + b, 0);
  return {
    prompt: bi((f) => f.t(`A structure is built from stacks of cubes in two rows of three. The number of cubes in each stack is: ${gridProse(f, g)}. How many cubes are in the structure?`, `Une structure est faite de piles de cubes en deux rangées de trois. Le nombre de cubes de chaque pile est : ${gridProse(f, g)}. Combien de cubes y a-t-il dans la structure ?`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[6, t('That is the number of stacks. Add the cubes in every stack.', 'C\'est le nombre de piles. Additionne les cubes de chaque pile.'), 0], [Math.max(...g.flat()) * 6, t('That treats every stack as the tallest one. Add the height of each stack.', 'Cela traite chaque pile comme la plus haute. Additionne la hauteur de chaque pile.'), 1]]),
    steps: [t('Add the cubes in all six stacks.', 'Additionne les cubes des six piles.'), bi((f) => `${g.flat().map((h) => f.N(h)).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('Add the number of cubes in each stack.', 'Additionne le nombre de cubes de chaque pile.'),
  };
});
const frontSquares = numGen('MS.G6.E1.2.a', (_tier, r) => {
  const g = grid(r), cols = [0, 1, 2].map((c) => Math.max(g[0]![c]!, g[1]![c]!)), ans = cols.reduce((a, b) => a + b, 0);
  return {
    prompt: bi((f) => f.t(`Stacks of cubes stand in two rows of three. The number of cubes in each stack is: ${gridProse(f, g)}. The back row is directly behind the front row. How many squares do you see in the front view?`, `Des piles de cubes sont placées en deux rangées de trois. Le nombre de cubes de chaque pile est : ${gridProse(f, g)}. La rangée arrière est juste derrière la rangée avant. Combien de carrés vois-tu dans la vue de face ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[g[0]!.reduce((a, b) => a + b, 0), t('That only counts the front row. A taller stack behind sticks up above it.', 'Cela ne compte que la rangée avant. Une pile plus haute derrière dépasse au-dessus.'), 1], [g.flat().reduce((a, b) => a + b, 0), t('That counts every cube. A stack hides the shorter one behind it.', 'Cela compte tous les cubes. Une pile cache la plus basse derrière elle.'), 1]]),
    steps: [bi((f) => f.t(`In each column, the view shows the taller stack: ${cols.map((c) => f.N(c)).join(', ')}.`, `Dans chaque colonne, la vue montre la pile la plus haute : ${cols.map((c) => f.N(c)).join(', ')}.`)), bi((f) => `${cols.map((c) => f.N(c)).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('In each column keep the taller of the two stacks, then add.', 'Dans chaque colonne, garde la plus haute des deux piles, puis additionne.'),
  };
});
const sideSquares = numGen('MS.G6.E1.2.a', (_tier, r) => {
  const g = grid(r), rows = g.map((row) => Math.max(...row)), ans = rows.reduce((a, b) => a + b, 0);
  return {
    prompt: bi((f) => f.t(`Stacks of cubes stand in two rows of three. The number of cubes in each stack is: ${gridProse(f, g)}. You look at the structure from the side, along the rows. How many squares do you see in the side view?`, `Des piles de cubes sont placées en deux rangées de trois. Le nombre de cubes de chaque pile est : ${gridProse(f, g)}. Tu regardes la structure de côté, dans le sens des rangées. Combien de carrés vois-tu dans la vue de côté ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[g.flat().reduce((a, b) => a + b, 0), t('That counts every cube. From the side, a taller stack hides the shorter stacks in the same row.', 'Cela compte tous les cubes. De côté, une pile plus haute cache les piles plus basses de la même rangée.'), 1], [Math.max(...g.flat()) * 2, t('That treats each row as if its tallest stack were the tallest of both rows. Use each row\'s own tallest stack.', 'Cela traite chaque rangée comme si sa pile la plus haute était la plus haute des deux rangées. Utilise la pile la plus haute de chaque rangée.'), 1]]),
    steps: [bi((f) => f.t(`From the side you see the tallest stack in each row: ${rows.map((c) => f.N(c)).join(' and ')}.`, `De côté, tu vois la pile la plus haute de chaque rangée : ${rows.map((c) => f.N(c)).join(' et ')}.`)), bi((f) => `${rows.map((c) => f.N(c)).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('Find the tallest stack in each row, then add the two heights.', 'Trouve la pile la plus haute de chaque rangée, puis additionne les deux hauteurs.'),
  };
});
export const views6 = tierGen(totalCubes, frontSquares, sideSquares);

/** MS.G6.E2.2.a: protractor use up to 360 degrees */
const readAngle = numGen('MS.G6.E2.2.a', (_tier, r) => {
  const a = randInt(r, 1, 7) * 10, b = a + randInt(r, 3, 10) * 10;
  return {
    prompt: bi((f) => f.t(`One arm of an angle is at ${f.N(a)}° on a protractor scale and the other arm is at ${f.N(b)}° on the same scale. What is the angle, in degrees?`, `Un côté d'un angle est à ${f.N(a)}° sur l'échelle d'un rapporteur et l'autre côté est à ${f.N(b)}° sur la même échelle. Quelle est la mesure de l'angle, en degrés ?`)),
    answer: b - a, category: 'AP',
    wrong: wr(b - a, [[b, t('That only reads one arm. If the first arm is not at 0, subtract its reading.', 'Cela ne lit qu\'un côté. Si le premier côté n\'est pas à 0, soustrais sa lecture.'), 1], [a + b, t('The readings are subtracted, not added.', 'Les lectures se soustraient, elles ne s\'additionnent pas.'), 1]]),
    steps: [t('The angle is the gap between the two arms on the same scale.', 'L\'angle est l\'écart entre les deux côtés sur la même échelle.'), bi((f) => `${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}.`)],
    nudge: t('Subtract the smaller reading from the larger one.', 'Soustrais la plus petite lecture de la plus grande.'),
  };
});
const reflexAngle = numGen('MS.G6.E2.2.a', (_tier, r) => {
  const a = randInt(r, 3, 17) * 10;
  return {
    prompt: bi((f) => f.t(`A protractor measures the smaller angle between two arms as ${f.N(a)}°. What is the reflex angle on the other side of the arms (the larger angle), in degrees?`, `Un rapporteur mesure le plus petit angle entre deux côtés à ${f.N(a)}°. Quelle est la mesure de l'angle rentrant de l'autre côté des côtés (le plus grand angle), en degrés ?`)),
    answer: 360 - a, category: 'AP',
    wrong: wr(360 - a, [[180 - a, t('A reflex angle goes all the way around: the two angles together make a full turn of 360°, not a straight angle of 180°.', 'Un angle rentrant fait tout le tour : les deux angles ensemble font un tour complet de 360°, pas un angle plat de 180°.'), 1], [360 + a, t('The reflex angle is smaller than a full turn: subtract the smaller angle from 360°.', 'L\'angle rentrant est plus petit qu\'un tour complet : soustrais le plus petit angle de 360°.'), 1]]),
    steps: [t('The two angles around a point add to a full turn, 360°.', 'Les deux angles autour d\'un point totalisent un tour complet, 360°.'), bi((f) => `${f.N(360)} − ${f.N(a)} = ${f.N(360 - a)}.`)],
    nudge: t('A full turn is 360°. Take the smaller angle away from it.', 'Un tour complet fait 360°. Retire-lui le plus petit angle.'),
  };
});
const buildReflex = numGen('MS.G6.E2.2.a', (_tier, r) => {
  const target = randInt(r, 19, 35) * 10;
  return {
    prompt: bi((f) => f.t(`You need to draw a ${f.N(target)}° angle with a protractor that only goes up to ${f.N(180)}°. You draw the angle on the other side and measure it. What angle should you measure, in degrees?`, `Tu dois tracer un angle de ${f.N(target)}° avec un rapporteur qui ne va que jusqu'à ${f.N(180)}°. Tu traces l'angle de l'autre côté et tu le mesures. Quel angle dois-tu mesurer, en degrés ?`)),
    answer: 360 - target, category: 'TH',
    wrong: wr(360 - target, [[target - 180, t('That is how far the angle goes past a straight angle. Measure the smaller angle on the other side instead: the two together make 360°.', 'C\'est de combien l\'angle dépasse un angle plat. Mesure plutôt le plus petit angle de l\'autre côté : les deux ensemble font 360°.'), 1], [target, t('A 180° protractor cannot show that angle. Measure the leftover angle of the full turn instead.', 'Un rapporteur de 180° ne peut pas montrer cet angle. Mesure plutôt l\'angle qui reste du tour complet.'), 0]]),
    steps: [t('Angles around a point add to 360°. The angle you can measure is what is left of a full turn.', 'Les angles autour d\'un point totalisent 360°. L\'angle que tu peux mesurer est ce qui reste d\'un tour complet.'), bi((f) => `${f.N(360)} − ${f.N(target)} = ${f.N(360 - target)}.`)],
    nudge: t('The angle you measure and the angle you want add to 360°.', 'L\'angle que tu mesures et l\'angle que tu veux totalisent 360°.'),
  };
});
export const protractor6 = tierGen(readAngle, reflexAngle, buildReflex);

/** MS.G6.E2.5.a: nets */
const NETS: { en: string; fr: string; faces: number }[] = [
  { en: 'a cube', fr: 'un cube', faces: 6 }, { en: 'a rectangular prism', fr: 'un prisme à base rectangulaire', faces: 6 },
  { en: 'a triangular prism', fr: 'un prisme à base triangulaire', faces: 5 }, { en: 'a square pyramid', fr: 'une pyramide à base carrée', faces: 5 },
  { en: 'a triangular pyramid', fr: 'une pyramide à base triangulaire', faces: 4 }, { en: 'a pentagonal prism', fr: 'un prisme à base pentagonale', faces: 7 },
  { en: 'a hexagonal pyramid', fr: 'une pyramide à base hexagonale', faces: 7 },
];
const netFaces = numGen('MS.G6.E2.5.a', (_tier, r) => {
  const n = pick(r, NETS);
  return {
    prompt: bi((f) => f.t(`How many faces (shapes) are in the net of ${n.en}?`, `Combien de faces (figures) y a-t-il dans le patron de ${n.fr} ?`)),
    answer: n.faces, category: 'KU',
    wrong: wr(n.faces, [[n.faces + 1, t('Count the faces carefully: a net has one shape for every face of the solid.', 'Compte bien les faces : un patron a une figure pour chaque face du solide.'), 1], [n.faces - 1, t('A net shows every face, including the base or bases.', 'Un patron montre toutes les faces, y compris la ou les bases.'), 1]]),
    steps: [t('A net unfolds the solid, so it has one shape for each face.', 'Un patron déplie le solide : il a une figure pour chaque face.'), bi((f) => f.t(`The net of ${n.en} has ${f.N(n.faces)} faces.`, `Le patron de ${n.fr} a ${f.N(n.faces)} faces.`))],
    nudge: t('Picture the solid unfolded: count its bases and its side faces.', 'Imagine le solide déplié : compte ses bases et ses faces latérales.'),
  };
});
const cubeNet = numGen('MS.G6.E2.5.a', (_tier, r) => {
  const s = randInt(r, 2, 12);
  return {
    prompt: bi((f) => f.t(`A net for a cube is made of 6 squares, each with a side of ${f.N(s)} cm. What is the total area of the net, in square cm?`, `Un patron de cube est fait de 6 carrés, chacun avec un côté de ${f.N(s)} cm. Quelle est l'aire totale du patron, en cm carrés ?`)),
    answer: 6 * s * s, category: 'AP',
    wrong: wr(6 * s * s, [[s * s, t('That is the area of one square. The net has six of them.', 'C\'est l\'aire d\'un carré. Le patron en a six.'), 1], [6 * s, t('Each square has area side × side, not just the side.', 'Chaque carré a une aire de côté × côté, pas seulement le côté.'), 0]]),
    steps: [bi((f) => f.t(`One square: ${f.N(s)} × ${f.N(s)} = ${f.N(s * s)} square cm.`, `Un carré : ${f.N(s)} × ${f.N(s)} = ${f.N(s * s)} cm carrés.`)), bi((f) => `${f.N(6)} × ${f.N(s * s)} = ${f.N(6 * s * s)}.`)],
    nudge: t('Find the area of one square, then multiply by 6.', 'Trouve l\'aire d\'un carré, puis multiplie par 6.'),
  };
});
const pyramidNet = numGen('MS.G6.E2.5.a', (_tier, r) => {
  const b = randInt(r, 2, 5) * 2, sl = randInt(r, 3, 12);
  const ans = b * b + 2 * b * sl;
  return {
    prompt: bi((f) => f.t(`The net of a square pyramid has a square base with side ${f.N(b)} cm and four identical triangles, each with base ${f.N(b)} cm and height ${f.N(sl)} cm. What is the total area of the net, in square cm?`, `Le patron d'une pyramide à base carrée a une base carrée de côté ${f.N(b)} cm et quatre triangles identiques, chacun de base ${f.N(b)} cm et de hauteur ${f.N(sl)} cm. Quelle est l'aire totale du patron, en cm carrés ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[b * b + 4 * b * sl, t('A triangle has half the area of base × height. Divide by 2 for each triangle.', 'Un triangle a la moitié de l\'aire de base × hauteur. Divise par 2 pour chaque triangle.'), 1], [b * b + (b * sl) / 2, t('There are four triangles, not one.', 'Il y a quatre triangles, pas un seul.'), 1]]),
    steps: [bi((f) => f.t(`Base: ${f.N(b)} × ${f.N(b)} = ${f.N(b * b)}. One triangle: ${f.N(b)} × ${f.N(sl)} ÷ ${f.N(2)} = ${f.N((b * sl) / 2)}, so four triangles: ${f.N(2 * b * sl)}.`, `Base : ${f.N(b)} × ${f.N(b)} = ${f.N(b * b)}. Un triangle : ${f.N(b)} × ${f.N(sl)} ÷ ${f.N(2)} = ${f.N((b * sl) / 2)}, donc quatre triangles : ${f.N(2 * b * sl)}.`)), bi((f) => `${f.N(b * b)} + ${f.N(2 * b * sl)} = ${f.N(ans)}.`)],
    nudge: t('Add the area of the square and of the four triangles (each half of base × height).', 'Additionne l\'aire du carré et celle des quatre triangles (chacun la moitié de base × hauteur).'),
  };
});
export const nets6 = tierGen(netFaces, cubeNet, pyramidNet);
