// Grade 5 Spatial Sense (E) and Data (D1.4), asked in words and numbers without a drawing: congruent shapes, views of block
// structures, reading and drawing angles with a protractor, and choosing the parts of an infographic.
import { pick, randInt } from '../rng.js';
import type { Generator, Text } from '../items/types.js';
import { bi, choiceGen, keepWrong as wr, mc, numGen } from './dsl.js';
import { t } from './kit.js';

const tierGen = (g1: Generator, g2: Generator, g3: Generator): Generator => (tier, seed) => (tier === 1 ? g1 : tier === 2 ? g2 : g3)(tier, seed);

/** MS.G5.E1.2.a: congruent triangles, rectangles and parallelograms */
const congruentSide = numGen('MS.G5.E1.2.a', (_tier, r) => {
  const ab = randInt(r, 3, 9), bc = randInt(r, 3, 9) + 10, ac = randInt(r, 3, 9) + 20;
  const which = pick(r, ['DE', 'EF', 'DF'] as const);
  const [src, ans] = which === 'DE' ? ['AB', ab] : which === 'EF' ? ['BC', bc] : ['AC', ac];
  return {
    prompt: bi((f) => f.t(`Triangle ABC is congruent to triangle DEF, with A matching D, B matching E and C matching F. In triangle ABC, AB is ${f.N(ab)} cm, BC is ${f.N(bc)} cm and AC is ${f.N(ac)} cm. How long is side ${which} in triangle DEF, in cm?`, `Le triangle ABC est congru au triangle DEF, avec A qui correspond à D, B à E et C à F. Dans le triangle ABC, AB mesure ${f.N(ab)} cm, BC mesure ${f.N(bc)} cm et AC mesure ${f.N(ac)} cm. Quelle est la longueur du côté ${which} dans le triangle DEF, en cm ?`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[ab + bc + ac, t('That is the perimeter. The question asks for one side.', 'C\'est le périmètre. La question demande un seul côté.'), 1], [which === 'DE' ? bc : ab, t('That is a side that does not match. Match the letters: D with A, E with B, F with C.', 'C\'est un côté qui ne correspond pas. Associe les lettres : D avec A, E avec B, F avec C.'), 0]]),
    steps: [t('Congruent shapes have matching sides that are equal. Match the letters in order.', 'Les figures congrues ont des côtés correspondants égaux. Associe les lettres dans l\'ordre.'), bi((f) => f.t(`Side ${which} matches side ${src}, so it is ${f.N(ans)} cm.`, `Le côté ${which} correspond au côté ${src} : il mesure ${f.N(ans)} cm.`))],
    nudge: t('Which side of triangle ABC matches this side? Use the order of the letters.', 'Quel côté du triangle ABC correspond à ce côté ? Utilise l\'ordre des lettres.'),
  };
});
const congruentRect = numGen('MS.G5.E1.2.a', (_tier, r) => {
  const l = randInt(r, 4, 12), w = randInt(r, 2, l - 1);
  const ask = pick(r, ['area', 'perimeter'] as const);
  const ans = ask === 'area' ? l * w : 2 * (l + w);
  return {
    prompt: bi((f) => f.t(`Rectangle P is ${f.N(l)} cm long and ${f.N(w)} cm wide. Rectangle Q is congruent to rectangle P. What is the ${ask} of rectangle Q, in ${ask === 'area' ? 'square cm' : 'cm'}?`, `Le rectangle P mesure ${f.N(l)} cm de long et ${f.N(w)} cm de large. Le rectangle Q est congru au rectangle P. Quel est ${ask === 'area' ? 'l\'aire' : 'le périmètre'} du rectangle Q, en ${ask === 'area' ? 'cm carrés' : 'cm'} ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[ask === 'area' ? 2 * (l + w) : l * w, t('That uses the wrong measure. Check whether the question asks for area or perimeter.', 'Cela utilise la mauvaise mesure. Vérifie si la question demande l\'aire ou le périmètre.'), 1], [l + w, t('That is only half of the way around. A rectangle has two lengths and two widths.', 'C\'est seulement la moitié du tour. Un rectangle a deux longueurs et deux largeurs.'), 1]]),
    steps: [t('Congruent rectangles have the same length and width, so rectangle Q is also the same size as P.', 'Des rectangles congrus ont la même longueur et la même largeur : le rectangle Q a donc la même grandeur que P.'), bi((f) => (ask === 'area' ? `${f.N(l)} × ${f.N(w)} = ${f.N(ans)}.` : `${f.N(2)} × (${f.N(l)} + ${f.N(w)}) = ${f.N(ans)}.`))],
    nudge: t('Rectangle Q has the same dimensions as P. Find the measure the question asks for.', 'Le rectangle Q a les mêmes dimensions que P. Trouve la mesure demandée.'),
  };
});
const congruentPara = numGen('MS.G5.E1.2.a', (_tier, r) => {
  const a = randInt(r, 5, 17) * 5;
  const ask = pick(r, ['opposite', 'adjacent'] as const);
  const ans = ask === 'opposite' ? a : 180 - a;
  return {
    prompt: bi((f) => f.t(`Parallelogram S has an angle of ${f.N(a)}°. Parallelogram T is congruent to S. In parallelogram T, what is the measure of the ${ask === 'opposite' ? 'angle opposite the matching angle' : 'angle next to the matching angle'}, in degrees?`, `Le parallélogramme S a un angle de ${f.N(a)}°. Le parallélogramme T est congru à S. Dans le parallélogramme T, quelle est la mesure de ${ask === 'opposite' ? 'l\'angle opposé à l\'angle correspondant' : 'l\'angle voisin de l\'angle correspondant'}, en degrés ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[ask === 'opposite' ? 180 - a : a, t('The two kinds of angle were swapped. Opposite angles of a parallelogram are equal, and angles next to each other add to 180°.', 'Les deux sortes d\'angles ont été échangées. Les angles opposés d\'un parallélogramme sont égaux, et les angles voisins totalisent 180°.'), 1], [360 - a, t('That is too large. Angles next to each other add to 180°, not 360°.', 'C\'est trop grand. Les angles voisins totalisent 180°, pas 360°.'), 1]]),
    steps: [t('Congruent parallelograms have equal matching angles. In one parallelogram, opposite angles are equal and angles next to each other add to 180°.', 'Des parallélogrammes congrus ont des angles correspondants égaux. Dans un parallélogramme, les angles opposés sont égaux et les angles voisins totalisent 180°.'), bi((f) => (ask === 'opposite' ? f.t(`The opposite angle equals the matching angle: ${f.N(a)}°.`, `L'angle opposé est égal à l'angle correspondant : ${f.N(a)}°.`) : `${f.N(180)} − ${f.N(a)} = ${f.N(ans)}°.`))],
    nudge: t('Use the facts about a parallelogram\'s angles: opposite equal, neighbours add to 180°.', 'Utilise les faits sur les angles d\'un parallélogramme : opposés égaux, voisins totalisant 180°.'),
  };
});
export const congruent5 = tierGen(congruentSide, congruentRect, congruentPara);

/** MS.G5.E1.3.a: top, front and side views of block structures */
const topView = numGen('MS.G5.E1.3.a', (_tier, r) => {
  const n = randInt(r, 3, 6);
  const heights = Array.from({ length: n }, () => randInt(r, 1, 4));
  const ans = n;
  return {
    prompt: bi((f) => f.t(`A row of ${f.N(n)} stacks of cubes has these heights, in cubes: ${f.m(heights.map((h) => f.n(h)).join(',\\ '))}. How many squares do you see in the top view?`, `Une rangée de ${f.N(n)} piles de cubes a ces hauteurs, en cubes : ${f.m(heights.map((h) => f.n(h)).join(',\\ '))}. Combien de carrés vois-tu dans la vue de dessus ?`)),
    answer: ans, category: 'KU',
    wrong: wr(ans, [[heights.reduce((a, b) => a + b, 0), t('That counts every cube. From above you see only the top of each stack.', 'Cela compte tous les cubes. Vu de dessus, tu ne vois que le dessus de chaque pile.'), 0], [Math.max(...heights), t('That is the height of the tallest stack. The top view shows one square for each stack.', 'C\'est la hauteur de la pile la plus haute. La vue de dessus montre un carré par pile.'), 0]]),
    steps: [t('From above you see the top of each stack, one square per stack.', 'Vu de dessus, tu vois le dessus de chaque pile, un carré par pile.'), bi((f) => f.t(`There are ${f.N(n)} stacks, so ${f.N(n)} squares.`, `Il y a ${f.N(n)} piles : ${f.N(n)} carrés.`))],
    nudge: t('Count the stacks, not the cubes.', 'Compte les piles, pas les cubes.'),
  };
});
const frontView = numGen('MS.G5.E1.3.a', (_tier, r) => {
  const n = randInt(r, 3, 5);
  const heights = Array.from({ length: n }, () => randInt(r, 1, 4));
  const ans = heights.reduce((a, b) => a + b, 0);
  return {
    prompt: bi((f) => f.t(`A row of ${f.N(n)} stacks of cubes, side by side, has these heights, in cubes: ${f.m(heights.map((h) => f.n(h)).join(',\\ '))}. How many squares do you see in the front view?`, `Une rangée de ${f.N(n)} piles de cubes, côte à côte, a ces hauteurs, en cubes : ${f.m(heights.map((h) => f.n(h)).join(',\\ '))}. Combien de carrés vois-tu dans la vue de face ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[n, t('That is the number of stacks, which is the top view. The front view shows the height of each stack.', 'C\'est le nombre de piles, ce qui correspond à la vue de dessus. La vue de face montre la hauteur de chaque pile.'), 0], [Math.max(...heights) * n, t('That treats every stack as the tallest one. Each stack shows only its own height.', 'Cela traite chaque pile comme la plus haute. Chaque pile ne montre que sa propre hauteur.'), 1]]),
    steps: [t('From the front you see the height of each stack, with one square for each cube.', 'De face, tu vois la hauteur de chaque pile, avec un carré par cube.'), bi((f) => `${heights.map((h) => f.N(h)).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('Add up the heights of all the stacks.', 'Additionne les hauteurs de toutes les piles.'),
  };
});
const frontMax = numGen('MS.G5.E1.3.a', (_tier, r) => {
  const front = Array.from({ length: 3 }, () => randInt(r, 1, 4)), back = Array.from({ length: 3 }, () => randInt(r, 1, 4));
  const ans = front.reduce((a, v, i) => a + Math.max(v, back[i]!), 0);
  return {
    prompt: bi((f) => f.t(`Stacks of cubes stand in two rows of three. The front row has heights ${f.m(front.map((h) => f.n(h)).join(',\\ '))} and the back row, directly behind it, has heights ${f.m(back.map((h) => f.n(h)).join(',\\ '))}. How many squares do you see in the front view? (A taller stack behind shows above a shorter one in front.)`, `Des piles de cubes sont placées en deux rangées de trois. La rangée avant a des hauteurs ${f.m(front.map((h) => f.n(h)).join(',\\ '))} et la rangée arrière, juste derrière, a des hauteurs ${f.m(back.map((h) => f.n(h)).join(',\\ '))}. Combien de carrés vois-tu dans la vue de face ? (Une pile plus haute derrière dépasse au-dessus d'une pile plus basse devant.)`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[front.reduce((a, b) => a + b, 0), t('That only counts the front row. A taller stack behind sticks up above it.', 'Cela ne compte que la rangée avant. Une pile plus haute derrière dépasse au-dessus.'), 1], [front.reduce((a, b) => a + b, 0) + back.reduce((a, b) => a + b, 0), t('That counts every cube. A stack hides the shorter one behind it, so you only see the taller of each pair.', 'Cela compte tous les cubes. Une pile cache la plus basse derrière elle : tu ne vois que la plus haute de chaque paire.'), 1]]),
    steps: [bi((f) => f.t(`For each column, the view shows the taller stack: ${front.map((h, i) => f.N(Math.max(h, back[i]!))).join(', ')}.`, `Pour chaque colonne, la vue montre la pile la plus haute : ${front.map((h, i) => f.N(Math.max(h, back[i]!))).join(', ')}.`)), bi((f) => `${front.map((h, i) => f.N(Math.max(h, back[i]!))).join(' + ')} = ${f.N(ans)}.`)],
    nudge: t('In each column, keep only the taller of the two stacks, then add.', 'Dans chaque colonne, garde seulement la plus haute des deux piles, puis additionne.'),
  };
});
export const views5 = tierGen(topView, frontView, frontMax);

/** MS.G5.E2.4.a: how protractors work; measuring and constructing angles up to 180 degrees; benchmark angles */
const readProtractor = numGen('MS.G5.E2.4.a', (_tier, r) => {
  const a = randInt(r, 1, 8) * 10, b = a + randInt(r, 2, 12) * 10;
  return {
    prompt: bi((f) => f.t(`A protractor is lined up so that one arm of an angle is at ${f.N(a)}° on the scale. The other arm is at ${f.N(b)}° on the same scale. What is the measure of the angle, in degrees?`, `Un rapporteur est placé de sorte qu'un côté d'un angle est à ${f.N(a)}° sur l'échelle. L'autre côté est à ${f.N(b)}° sur la même échelle. Quelle est la mesure de l'angle, en degrés ?`)),
    answer: b - a, category: 'AP',
    wrong: wr(b - a, [[b, t('That only reads one arm. If the first arm is not at zero, subtract its reading.', 'Cela ne lit qu\'un côté. Si le premier côté n\'est pas à zéro, soustrais sa lecture.'), 1], [a + b, t('The readings are subtracted, not added: the angle is the gap between the two arms.', 'Les lectures se soustraient, elles ne s\'additionnent pas : l\'angle est l\'écart entre les deux côtés.'), 1]]),
    steps: [t('The angle is the gap between the two arms on the same scale.', 'L\'angle est l\'écart entre les deux côtés sur la même échelle.'), bi((f) => `${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}.`)],
    nudge: t('Subtract the smaller reading from the larger one.', 'Soustrais la plus petite lecture de la plus grande.'),
  };
});
const chooseScale = numGen('MS.G5.E2.4.a', (_tier, r) => {
  const small = randInt(r, 2, 8) * 10;
  return {
    prompt: bi((f) => f.t(`An angle is smaller than a right angle. One arm lines up with ${f.N(small)}° on the inner scale and ${f.N(180 - small)}° on the outer scale. What is the measure of the angle, in degrees?`, `Un angle est plus petit qu'un angle droit. Un côté s'aligne avec ${f.N(small)}° sur l'échelle intérieure et ${f.N(180 - small)}° sur l'échelle extérieure. Quelle est la mesure de l'angle, en degrés ?`)),
    answer: small, category: 'AP',
    wrong: wr(small, [[180 - small, t('That is the reading of an obtuse angle. This angle is smaller than a right angle, so it is less than 90°.', 'C\'est la lecture d\'un angle obtus. Cet angle est plus petit qu\'un angle droit : il mesure moins de 90°.'), 1]]),
    steps: [t('A right angle is 90°. An angle smaller than a right angle must be less than 90°.', 'Un angle droit mesure 90°. Un angle plus petit qu\'un angle droit mesure moins de 90°.'), bi((f) => f.t(`Only ${f.N(small)}° is less than ${f.N(90)}°.`, `Seulement ${f.N(small)}° est inférieur à ${f.N(90)}°.`))],
    nudge: t('Which of the two readings is less than 90°?', 'Laquelle des deux lectures est inférieure à 90° ?'),
  };
});
const benchmark5 = numGen('MS.G5.E2.4.a', (_tier, r) => {
  const d = randInt(r, 1, 7) * 5;
  const kind = pick(r, ['straight', 'right'] as const);
  const ans = kind === 'straight' ? 180 - d : 90 + d;
  return {
    prompt: bi((f) => f.t(`You want to draw an angle that is ${f.N(d)}° ${kind === 'straight' ? 'less than a straight angle' : 'more than a right angle'}. What reading on the protractor do you draw to?`, `Tu veux tracer un angle qui mesure ${f.N(d)}° ${kind === 'straight' ? 'de moins qu\'un angle plat' : 'de plus qu\'un angle droit'}. Jusqu'à quelle lecture du rapporteur traces-tu ?`)),
    answer: ans, category: 'TH',
    wrong: wr(ans, [[kind === 'straight' ? 90 - d : 180 + d, t('That uses the wrong benchmark. A straight angle is 180° and a right angle is 90°.', 'Cela utilise le mauvais repère. Un angle plat mesure 180° et un angle droit mesure 90°.'), 1], [d, t('That is the difference only. Start from the benchmark angle and add or take away the difference.', 'C\'est seulement la différence. Pars de l\'angle repère et ajoute ou retire la différence.'), 1]]),
    steps: [t(kind === 'straight' ? 'A straight angle is 180°. "Less than" means taking away.' : 'A right angle is 90°. "More than" means adding.', kind === 'straight' ? 'Un angle plat mesure 180°. « De moins que » veut dire retirer.' : 'Un angle droit mesure 90°. « De plus que » veut dire ajouter.'), bi((f) => (kind === 'straight' ? `${f.N(180)} − ${f.N(d)} = ${f.N(ans)}°.` : `${f.N(90)} + ${f.N(d)} = ${f.N(ans)}°.`))],
    nudge: t('Start from the benchmark angle, then add or take away.', 'Pars de l\'angle repère, puis ajoute ou retire.'),
  };
});
export const protractor5 = tierGen(readProtractor, chooseScale, benchmark5);

/** MS.G5.D1.4.a: creating an infographic from relative-frequency tables and stacked-bar graphs */
const PARTS: [string, string, string][] = [['a title', 'un titre', 'title'], ['labels on the axes', 'des étiquettes sur les axes', 'labels'], ['the source of the data', 'la source des données', 'source']];
const missingPart = choiceGen('MS.G5.D1.4.a', (_tier, r) => {
  const miss = pick(r, PARTS);
  const have = PARTS.filter((p) => p !== miss);
  const m = mc(r, t(miss[0].charAt(0).toUpperCase() + miss[0].slice(1), miss[1].charAt(0).toUpperCase() + miss[1].slice(1)), have.map((p): [Text, Text] => [t(p[0].charAt(0).toUpperCase() + p[0].slice(1), p[1].charAt(0).toUpperCase() + p[1].slice(1)), t('The infographic already has this. Look for the part that is not there.', 'L\'infographie a déjà cela. Cherche la partie qui manque.')]));
  return {
    prompt: t(`A student made an infographic with a stacked-bar graph and a relative-frequency table. It has ${have.map((h) => h[0]).join(' and ')}. What is it missing?`, `Une élève a fait une infographie avec un diagramme à bandes superposées et un tableau de fréquences relatives. Elle a ${have.map((h) => h[1]).join(' et ')}. Que manque-t-il ?`),
    options: m.options, correct: m.correct, why: m.why, category: 'KU',
    steps: [t('A good infographic has a title, labels on the axes and the source of the data.', 'Une bonne infographie a un titre, des étiquettes sur les axes et la source des données.'), t(`Here, ${miss[0]} is missing.`, `Ici, ${miss[1]} manque.`)],
    nudge: t('Check the list: title, labels, source. Which one is not there?', 'Vérifie la liste : titre, étiquettes, source. Laquelle manque ?'),
  };
});
const headlinePercent = numGen('MS.G5.D1.4.a', (_tier, r) => {
  const total = pick(r, [20, 25, 40, 50]);
  const count = randInt(r, 2, total - 2);
  const ans = (count * 100) / total;
  return {
    prompt: bi((f) => f.t(`For an infographic, a relative-frequency table shows that ${f.N(count)} of ${f.N(total)} students ride the bus. What percent should the headline number show?`, `Pour une infographie, un tableau de fréquences relatives montre que ${f.N(count)} élèves sur ${f.N(total)} prennent l'autobus. Quel pourcentage le grand titre devrait-il montrer ?`)),
    answer: ans, category: 'AP',
    wrong: wr(ans, [[count, t('That is the count, not the percent. Divide by the total and multiply by 100.', 'C\'est l\'effectif, pas le pourcentage. Divise par le total et multiplie par 100.'), 0], [(count / total) * 10, t('Check the multiplying: a percent is out of 100.', 'Vérifie la multiplication : un pourcentage est sur 100.'), 1]]),
    steps: [bi((f) => `${f.N(count)} ÷ ${f.N(total)} = ${f.N(count / total)}.`), bi((f) => `${f.N(count / total)} × ${f.N(100)} = ${f.N(ans)}%.`)],
    nudge: t('Divide the count by the total, then multiply by 100.', 'Divise l\'effectif par le total, puis multiplie par 100.'),
  };
});
const bestHeadline = choiceGen('MS.G5.D1.4.a', (_tier, r) => {
  const tenths = randInt(r, 2, 8), total = 100;
  const pct = tenths * 10;
  const m = mc(r, bi((f) => f.t(`${f.N(pct)} out of every ${f.N(total)} students walk to school`, `${f.N(pct)} élèves sur ${f.N(total)} marchent pour aller à l'école`)), [
    [t('Almost all students walk to school', 'Presque tous les élèves marchent pour aller à l\'école'), t('That exaggerates. The data do not say almost everyone walks.', 'C\'est exagéré. Les données ne disent pas que presque tout le monde marche.')],
    [bi((f) => f.t(`${f.N(tenths)} students walk to school`, `${f.N(tenths)} élèves marchent pour aller à l'école`)), t('That uses the wrong number. The data are percents out of 100, not a count of students.', 'Cela utilise le mauvais nombre. Les données sont des pourcentages sur 100, pas un effectif d\'élèves.')],
  ]);
  return {
    prompt: bi((f) => f.t(`A relative-frequency table shows that ${f.N(pct)}% of the students surveyed walk to school. Which headline for the infographic is accurate?`, `Un tableau de fréquences relatives montre que ${f.N(pct)} % des élèves sondés marchent pour aller à l'école. Quel grand titre est exact pour l'infographie ?`)),
    options: m.options, correct: m.correct, why: m.why, category: 'TH',
    steps: [t('A headline must match the data: use the real percent and do not exaggerate.', 'Un grand titre doit correspondre aux données : utilise le vrai pourcentage et n\'exagère pas.'), bi((f) => f.t(`${f.N(pct)}% means ${f.N(pct)} out of every ${f.N(100)}.`, `${f.N(pct)} % veut dire ${f.N(pct)} sur ${f.N(100)}.`))],
    nudge: t('Which headline says exactly what the percent says?', 'Quel grand titre dit exactement ce que dit le pourcentage ?'),
  };
});
export const infographic5 = tierGen(missingPart, headlinePercent, bestHeadline);
