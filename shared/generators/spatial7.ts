// Grade 7 Spatial Sense (E) and Financial Literacy (F) strands: solids, dilations, transformations, volume and capacity,
// circles and cylinders, currency, budgets and interest. Circle work uses 3.14 for pi, as the prompt says.
import { pick, randInt } from '../rng.js';
import type { Text } from '../items/types.js';
import { bi, numGen, r6 } from './dsl.js';
import { t } from './kit.js';

type Wrong = [number, Text, number?][];
const PI = 3.14;

/** MS.G7.E1.1.a: classify prisms and pyramids by faces, vertices and edges */
export const solids7 = numGen('MS.G7.E1.1.a', (tier, r) => {
  const n = randInt(r, 3, 8);
  const prism = r() < 0.5;
  const name = (f: { t: (a: string, b: string) => string }): string => (prism ? f.t(`prism whose base has ${n} sides`, `prisme dont la base a ${n} côtés`) : f.t(`pyramid whose base has ${n} sides`, `pyramide dont la base a ${n} côtés`));
  if (tier === 1) {
    const ans = prism ? n + 2 : n + 1;
    return {
      prompt: bi((f) => f.t(`How many faces does a ${name(f)} have?`, `Combien de faces a un ${name(f)} ?`)),
      answer: ans,
      wrong: [[prism ? n + 1 : n + 2, t('It looks like the faces were counted wrongly. Count the base (or the two bases) and the side faces separately.', 'Il semble que les faces ont été mal comptées. Compte séparément la ou les bases et les faces latérales.'), 0]] as Wrong,
      steps: [bi((f) => (prism ? f.t(`A prism has ${f.N(n)} side faces (one for each side of the base) and 2 bases.`, `Un prisme a ${f.N(n)} faces latérales (une par côté de la base) et 2 bases.`) : f.t(`A pyramid has ${f.N(n)} triangular side faces (one for each side of the base) and 1 base.`, `Une pyramide a ${f.N(n)} faces latérales triangulaires (une par côté de la base) et 1 base.`))), bi((f) => f.t(`${f.N(n)} + ${prism ? 2 : 1} = ${f.N(ans)} faces.`, `${f.N(n)} + ${prism ? 2 : 1} = ${f.N(ans)} faces.`))],
      nudge: t('Count the side faces (one per side of the base) and then the bases.', 'Compte les faces latérales (une par côté de la base) puis les bases.'),
    };
  }
  if (tier === 2) {
    const ans = prism ? 2 * n : n + 1;
    return {
      prompt: bi((f) => f.t(`How many vertices does a ${name(f)} have?`, `Combien de sommets a un ${name(f)} ?`)),
      answer: ans,
      wrong: [[prism ? n : 2 * n, t('It looks like the vertices of only one base were counted (or the pyramid was treated like a prism). Count the corners of every base, plus the apex of a pyramid.', 'Il semble que les sommets d\'une seule base ont été comptés (ou que la pyramide a été traitée comme un prisme). Compte les coins de chaque base, plus le sommet d\'une pyramide.'), 0]] as Wrong,
      steps: [bi((f) => (prism ? f.t(`A prism has two bases, each with ${f.N(n)} corners.`, `Un prisme a deux bases, chacune avec ${f.N(n)} coins.`) : f.t(`A pyramid has ${f.N(n)} corners on its base and 1 apex.`, `Une pyramide a ${f.N(n)} coins à sa base et 1 sommet.`))), bi((f) => (prism ? f.t(`2 × ${f.N(n)} = ${f.N(ans)} vertices.`, `2 × ${f.N(n)} = ${f.N(ans)} sommets.`) : f.t(`${f.N(n)} + 1 = ${f.N(ans)} vertices.`, `${f.N(n)} + 1 = ${f.N(ans)} sommets.`)))],
      nudge: t('Count the corners of each base, and the apex if there is one.', 'Compte les coins de chaque base, et le sommet s\'il y en a un.'),
    };
  }
  const edges = prism ? 3 * n : 2 * n;
  const reverse = r() < 0.5;
  if (reverse) {
    return {
      prompt: bi((f) => (prism ? f.t(`A prism has ${f.N(edges)} edges. How many sides does its base have?`, `Un prisme a ${f.N(edges)} arêtes. Combien de côtés sa base a-t-elle ?`) : f.t(`A pyramid has ${f.N(edges)} edges. How many sides does its base have?`, `Une pyramide a ${f.N(edges)} arêtes. Combien de côtés sa base a-t-elle ?`))),
      answer: n, category: 'TH',
      wrong: [[edges, t('That is the number of edges. The base has fewer sides: each side of the base gives more than one edge on the solid.', 'C\'est le nombre d\'arêtes. La base a moins de côtés : chaque côté de la base donne plus d\'une arête sur le solide.'), 0]] as Wrong,
      steps: [bi((f) => (prism ? f.t('A prism has 3 edges for each side of the base: 2 on the bases and 1 joining them.', 'Un prisme a 3 arêtes par côté de la base : 2 sur les bases et 1 qui les relie.') : f.t('A pyramid has 2 edges for each side of the base: 1 on the base and 1 going up to the apex.', 'Une pyramide a 2 arêtes par côté de la base : 1 sur la base et 1 qui monte au sommet.'))), bi((f) => f.t(`${f.N(edges)} ÷ ${prism ? 3 : 2} = ${f.N(n)} sides.`, `${f.N(edges)} ÷ ${prism ? 3 : 2} = ${f.N(n)} côtés.`))],
      nudge: t('How many edges does each side of the base account for?', 'Combien d\'arêtes chaque côté de la base représente-t-il ?'),
    };
  }
  return {
    prompt: bi((f) => f.t(`How many edges does a ${name(f)} have?`, `Combien d'arêtes a un ${name(f)} ?`)),
    answer: edges, category: 'TH',
    wrong: [[prism ? 2 * n : n, t('It looks like only the edges of the bases (or of one base) were counted. Include the edges that join the bases or go up to the apex.', 'Il semble que seules les arêtes des bases (ou d\'une base) ont été comptées. Inclus les arêtes qui relient les bases ou qui montent au sommet.'), 0]] as Wrong,
    steps: [bi((f) => (prism ? f.t(`A prism has ${f.N(n)} edges on each of 2 bases and ${f.N(n)} edges joining them.`, `Un prisme a ${f.N(n)} arêtes sur chacune des 2 bases et ${f.N(n)} arêtes qui les relient.`) : f.t(`A pyramid has ${f.N(n)} edges on the base and ${f.N(n)} edges going up to the apex.`, `Une pyramide a ${f.N(n)} arêtes à la base et ${f.N(n)} arêtes qui montent au sommet.`))), bi((f) => (prism ? f.t(`${f.N(n)} + ${f.N(n)} + ${f.N(n)} = ${f.N(edges)} edges.`, `${f.N(n)} + ${f.N(n)} + ${f.N(n)} = ${f.N(edges)} arêtes.`) : f.t(`${f.N(n)} + ${f.N(n)} = ${f.N(edges)} edges.`, `${f.N(n)} + ${f.N(n)} = ${f.N(edges)} arêtes.`)))],
    nudge: t('Count the edges on the bases, then the edges that join them or go up to the apex.', 'Compte les arêtes des bases, puis celles qui les relient ou qui montent au sommet.'),
  };
});

/** MS.G7.E1.3.a: dilations and similarity */
export const dilation7 = numGen('MS.G7.E1.3.a', (tier, r) => {
  if (tier === 1) {
    const side = randInt(r, 2, 9), k = pick(r, [2, 3, 4, 5]);
    return {
      prompt: bi((f) => f.t(`A shape is enlarged. A side of ${f.N(side)} cm becomes ${f.N(side * k)} cm. What is the scale factor?`, `Une figure est agrandie. Un côté de ${f.N(side)} cm devient ${f.N(side * k)} cm. Quel est le facteur d'échelle ?`)),
      answer: k,
      wrong: [[side * k - side, t('It looks like the lengths were subtracted. The scale factor is how many times bigger: divide the new length by the old.', 'Il semble que les longueurs ont été soustraites. Le facteur d\'échelle indique combien de fois plus grand : divise la nouvelle longueur par l\'ancienne.'), 0]] as Wrong,
      steps: [t('Scale factor = new length ÷ original length.', 'Facteur d\'échelle = nouvelle longueur ÷ longueur de départ.'), bi((f) => f.t(`${f.N(side * k)} ÷ ${f.N(side)} = ${f.N(k)}.`, `${f.N(side * k)} ÷ ${f.N(side)} = ${f.N(k)}.`))],
      nudge: t('How many times as long is the new side?', 'Combien de fois le nouveau côté est-il plus long ?'),
    };
  }
  if (tier === 2) {
    const side = randInt(r, 2, 12) * 2, k = pick(r, [0.5, 1.5, 2.5, 3.5]);
    return {
      prompt: bi((f) => f.t(`A rectangle with a side of ${f.N(side)} cm is dilated by a scale factor of ${f.N(k)}. How long is the matching side of the image, in cm?`, `Un rectangle ayant un côté de ${f.N(side)} cm subit une dilatation de facteur d'échelle ${f.N(k)}. Quelle est la longueur du côté correspondant de l'image, en cm ?`)),
      answer: r6(side * k),
      wrong: [[r6(side + k), t('It looks like the scale factor was added. A dilation multiplies every length by the scale factor.', 'Il semble que le facteur d\'échelle a été additionné. Une dilatation multiplie chaque longueur par le facteur d\'échelle.'), 0]] as Wrong,
      steps: [t('Multiply the original length by the scale factor.', 'Multiplie la longueur de départ par le facteur d\'échelle.'), bi((f) => f.t(`${f.N(side)} × ${f.N(k)} = ${f.N(r6(side * k))} cm.`, `${f.N(side)} × ${f.N(k)} = ${f.N(r6(side * k))} cm.`))],
      nudge: t('Multiply, do not add.', 'Multiplie, n\'additionne pas.'),
    };
  }
  const k = pick(r, [1.5, 2, 2.5, 3, 4]);
  const a = randInt(r, 2, 6) * 2, other = randInt(r, 2, 9) * 2;
  const b = a * k;
  return {
    prompt: bi((f) => f.t(`Two triangles are similar. A side of ${f.N(a)} cm in the small triangle matches a side of ${f.N(b)} cm in the large one. Another side of the small triangle is ${f.N(other)} cm. How long is the matching side of the large triangle, in cm?`, `Deux triangles sont semblables. Un côté de ${f.N(a)} cm du petit triangle correspond à un côté de ${f.N(b)} cm du grand. Un autre côté du petit triangle mesure ${f.N(other)} cm. Quelle est la longueur du côté correspondant du grand triangle, en cm ?`)),
    answer: r6(other * k), category: 'TH',
    wrong: [[r6(other + (b - a)), t('It looks like the difference in lengths was added. Similar shapes keep the same ratio: multiply by the scale factor.', 'Il semble que la différence des longueurs a été ajoutée. Les figures semblables gardent le même rapport : multiplie par le facteur d\'échelle.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Scale factor: ${f.N(b)} ÷ ${f.N(a)} = ${f.N(k)}.`, `Facteur d\'échelle : ${f.N(b)} ÷ ${f.N(a)} = ${f.N(k)}.`)), bi((f) => f.t(`${f.N(other)} × ${f.N(k)} = ${f.N(r6(other * k))} cm.`, `${f.N(other)} × ${f.N(k)} = ${f.N(r6(other * k))} cm.`))],
    nudge: t('Find the scale factor from the pair of matching sides you know.', 'Trouve le facteur d\'échelle à partir de la paire de côtés correspondants que tu connais.'),
  };
});

/** MS.G7.E1.4.a: transformations on the Cartesian plane */
export const transform7 = numGen('MS.G7.E1.4.a', (tier, r) => {
  const x = randInt(r, -8, 8), y = randInt(r, -8, 8);
  const askX = r() < 0.5;
  const axis = askX ? 'x' : 'y';
  const pt = (f: { n: (v: number) => string }): string => `(${f.n(x)},\\ ${f.n(y)})`;
  if (tier === 1) {
    const a = randInt(r, 1, 7) * (r() < 0.5 ? -1 : 1), b = randInt(r, 1, 7) * (r() < 0.5 ? -1 : 1);
    const dirX = a > 0 ? ['right', 'droite'] : ['left', 'gauche'];
    const dirY = b > 0 ? ['up', 'haut'] : ['down', 'bas'];
    return {
      prompt: bi((f) => f.t(`The point ${f.m(pt(f))} is translated ${f.N(Math.abs(a))} units ${dirX[0]} and ${f.N(Math.abs(b))} units ${dirY[0]}. What is the ${axis}-coordinate of the image?`, `Le point ${f.m(pt(f))} subit une translation de ${f.N(Math.abs(a))} unités vers la ${dirX[1]} et de ${f.N(Math.abs(b))} unités vers le ${dirY[1]}. Quelle est la coordonnée ${axis} de l'image ?`)),
      answer: askX ? x + a : y + b,
      wrong: [[askX ? y + b : x + a, t('It looks like the other coordinate was given. Check which coordinate the question asks for.', 'Il semble que l\'autre coordonnée a été donnée. Vérifie quelle coordonnée la question demande.'), 0]] as Wrong,
      steps: [t('Right and left change the x-coordinate; up and down change the y-coordinate. Right and up are positive; left and down are negative.', 'La droite et la gauche changent la coordonnée x ; le haut et le bas changent la coordonnée y. Droite et haut sont positifs ; gauche et bas sont négatifs.'), bi((f) => f.t(`${axis}-coordinate: ${f.N(askX ? x : y)} + ${f.N(askX ? a : b)} = ${f.N(askX ? x + a : y + b)}.`, `Coordonnée ${axis} : ${f.N(askX ? x : y)} + ${f.N(askX ? a : b)} = ${f.N(askX ? x + a : y + b)}.`))],
      nudge: t('Moving left or down means subtracting; moving right or up means adding.', 'Aller à gauche ou vers le bas, c\'est soustraire ; aller à droite ou vers le haut, c\'est additionner.'),
    };
  }
  if (tier === 2) {
    const overY = r() < 0.5;
    const nx = overY ? -x : x, ny = overY ? y : -y;
    return {
      prompt: bi((f) => f.t(`The point ${f.m(pt(f))} is reflected in the ${overY ? 'y' : 'x'}-axis. What is the ${axis}-coordinate of the image?`, `Le point ${f.m(pt(f))} est réfléchi par rapport à l'axe des ${overY ? 'y' : 'x'}. Quelle est la coordonnée ${axis} de l'image ?`)),
      answer: askX ? nx : ny,
      wrong: [[askX ? -nx : -ny, t('It looks like the wrong coordinate changed sign. A reflection in the y-axis flips the x-coordinate; a reflection in the x-axis flips the y-coordinate.', 'Il semble que la mauvaise coordonnée a changé de signe. Une réflexion par rapport à l\'axe des y change le signe de x ; par rapport à l\'axe des x, elle change le signe de y.'), 0]] as Wrong,
      steps: [bi((f) => (overY ? f.t('A reflection in the y-axis changes the sign of the x-coordinate and keeps y.', 'Une réflexion par rapport à l\'axe des y change le signe de x et garde y.') : f.t('A reflection in the x-axis changes the sign of the y-coordinate and keeps x.', 'Une réflexion par rapport à l\'axe des x change le signe de y et garde x.'))), bi((f) => f.t(`The image is ${f.m(`(${f.n(nx)},\\ ${f.n(ny)})`)}, so the ${axis}-coordinate is ${f.N(askX ? nx : ny)}.`, `L\'image est ${f.m(`(${f.n(nx)},\\ ${f.n(ny)})`)}, donc la coordonnée ${axis} est ${f.N(askX ? nx : ny)}.`))],
      nudge: t('Which coordinate changes sign when you reflect in that axis?', 'Quelle coordonnée change de signe quand tu réfléchis par rapport à cet axe ?'),
    };
  }
  const quarter = r() < 0.5;
  const nx = quarter ? -y : -x, ny = quarter ? x : -y;
  return {
    prompt: bi((f) => f.t(`The point ${f.m(pt(f))} is rotated ${quarter ? '90° counterclockwise' : '180°'} about the origin. What is the ${axis}-coordinate of the image?`, `Le point ${f.m(pt(f))} subit une rotation de ${quarter ? '90° dans le sens antihoraire' : '180°'} autour de l'origine. Quelle est la coordonnée ${axis} de l'image ?`)),
    answer: askX ? nx : ny, category: 'TH',
    wrong: [[askX ? ny : nx, t('It looks like the coordinates were mixed up. Check the rule for this rotation.', 'Il semble que les coordonnées ont été mélangées. Vérifie la règle de cette rotation.'), 0]] as Wrong,
    steps: [bi((f) => (quarter ? f.t('A 90° counterclockwise rotation about the origin sends (x, y) to (−y, x).', 'Une rotation de 90° dans le sens antihoraire autour de l\'origine envoie (x, y) vers (−y, x).') : f.t('A 180° rotation about the origin sends (x, y) to (−x, −y).', 'Une rotation de 180° autour de l\'origine envoie (x, y) vers (−x, −y).'))), bi((f) => f.t(`The image is ${f.m(`(${f.n(nx)},\\ ${f.n(ny)})`)}, so the ${axis}-coordinate is ${f.N(askX ? nx : ny)}.`, `L\'image est ${f.m(`(${f.n(nx)},\\ ${f.n(ny)})`)}, donc la coordonnée ${axis} est ${f.N(askX ? nx : ny)}.`))],
    nudge: t('Use the rule for this rotation about the origin.', 'Utilise la règle de cette rotation autour de l\'origine.'),
  };
});

/** MS.G7.E2.1.a: volume vs capacity (1 mL = 1 cm³) */
export const capacity7 = numGen('MS.G7.E2.1.a', (tier, r) => {
  if (tier === 1) {
    const l = randInt(r, 10, 40), w = randInt(r, 5, 25), h = randInt(r, 5, 20);
    return {
      prompt: bi((f) => f.t(`A fish tank is ${f.N(l)} cm long, ${f.N(w)} cm wide and ${f.N(h)} cm high. What is its capacity, in mL? (1 mL = 1 cm³)`, `Un aquarium mesure ${f.N(l)} cm de long, ${f.N(w)} cm de large et ${f.N(h)} cm de haut. Quelle est sa capacité, en mL ? (1 mL = 1 cm³)`)),
      answer: l * w * h, category: 'AP',
      wrong: [[2 * (l * w + l * h + w * h), t('That is the surface area. Capacity comes from the volume: length × width × height.', 'C\'est l\'aire totale. La capacité vient du volume : longueur × largeur × hauteur.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Volume = ${f.N(l)} × ${f.N(w)} × ${f.N(h)} = ${f.N(l * w * h)} cm³.`, `Volume = ${f.N(l)} × ${f.N(w)} × ${f.N(h)} = ${f.N(l * w * h)} cm³.`)), bi((f) => f.t(`1 cm³ holds 1 mL, so the capacity is ${f.N(l * w * h)} mL.`, `1 cm³ contient 1 mL, donc la capacité est ${f.N(l * w * h)} mL.`))],
      nudge: t('Find the volume in cm³ first. Each cm³ holds 1 mL.', 'Trouve d\'abord le volume en cm³. Chaque cm³ contient 1 mL.'),
    };
  }
  if (tier === 2) {
    const l = pick(r, [20, 25, 40, 50]), w = pick(r, [10, 20, 25, 40]), h = pick(r, [10, 20, 30, 40]);
    const mL = l * w * h;
    return {
      prompt: bi((f) => f.t(`A box is ${f.N(l)} cm by ${f.N(w)} cm by ${f.N(h)} cm. How many litres of water can it hold? (1 L = 1000 mL = 1000 cm³)`, `Une boîte mesure ${f.N(l)} cm sur ${f.N(w)} cm sur ${f.N(h)} cm. Combien de litres d'eau peut-elle contenir ? (1 L = 1000 mL = 1000 cm³)`)),
      answer: r6(mL / 1000), category: 'AP',
      wrong: [[mL, t('That is the capacity in mL. Divide by 1000 to change mL into litres.', 'C\'est la capacité en mL. Divise par 1000 pour passer des mL aux litres.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Volume = ${f.N(l)} × ${f.N(w)} × ${f.N(h)} = ${f.N(mL)} cm³ = ${f.N(mL)} mL.`, `Volume = ${f.N(l)} × ${f.N(w)} × ${f.N(h)} = ${f.N(mL)} cm³ = ${f.N(mL)} mL.`)), bi((f) => f.t(`${f.N(mL)} ÷ 1000 = ${f.N(r6(mL / 1000))} L.`, `${f.N(mL)} ÷ 1000 = ${f.N(r6(mL / 1000))} L.`))],
      nudge: t('Volume in cm³ is capacity in mL. Then change mL to litres.', 'Le volume en cm³ est la capacité en mL. Ensuite, passe des mL aux litres.'),
    };
  }
  const A = pick(r, [20, 25, 40, 50, 100]), h = randInt(r, 4, 30), mL = A * h;
  return {
    prompt: bi((f) => f.t(`A container with a base area of ${f.N(A)} cm² holds ${f.N(mL)} mL when full. How tall is it, in cm?`, `Un contenant dont la base a une aire de ${f.N(A)} cm² contient ${f.N(mL)} mL lorsqu'il est plein. Quelle est sa hauteur, en cm ?`)),
    answer: h, category: 'TH',
    wrong: [[mL * A, t('It looks like the numbers were multiplied. Volume = base area × height, so divide the volume by the base area to find the height.', 'Il semble que les nombres ont été multipliés. Volume = aire de la base × hauteur : divise le volume par l\'aire de la base pour trouver la hauteur.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`${f.N(mL)} mL is ${f.N(mL)} cm³ of volume.`, `${f.N(mL)} mL correspondent à un volume de ${f.N(mL)} cm³.`)), bi((f) => f.t(`Height = volume ÷ base area = ${f.N(mL)} ÷ ${f.N(A)} = ${f.N(h)} cm.`, `Hauteur = volume ÷ aire de la base = ${f.N(mL)} ÷ ${f.N(A)} = ${f.N(h)} cm.`))],
    nudge: t('Change mL to cm³, then divide by the base area.', 'Passe des mL aux cm³, puis divise par l\'aire de la base.'),
  };
});

/** MS.G7.E2.2.a: unit conversions in area and volume problems */
export const units7 = numGen('MS.G7.E2.2.a', (tier, r) => {
  if (tier === 1) {
    const m2 = randInt(r, 2, 40) / 2;
    return {
      prompt: bi((f) => f.t(`A rug has an area of ${f.N(m2)} m². What is its area in cm²? (1 m = 100 cm)`, `Un tapis a une aire de ${f.N(m2)} m². Quelle est son aire en cm² ? (1 m = 100 cm)`)),
      answer: r6(m2 * 10000), category: 'AP',
      wrong: [[r6(m2 * 100), t('It looks like only one length was converted. Area has two lengths, so 1 m² = 100 × 100 = 10 000 cm².', 'Il semble qu\'une seule longueur a été convertie. L\'aire comporte deux longueurs : 1 m² = 100 × 100 = 10 000 cm².'), 0]] as Wrong,
      steps: [t('1 m² is a square 100 cm by 100 cm, so 1 m² = 10 000 cm².', '1 m² est un carré de 100 cm sur 100 cm, donc 1 m² = 10 000 cm².'), bi((f) => f.t(`${f.N(m2)} × ${f.N(10000)} = ${f.N(r6(m2 * 10000))} cm².`, `${f.N(m2)} × ${f.N(10000)} = ${f.N(r6(m2 * 10000))} cm².`))],
      nudge: t('Area uses two lengths, so convert twice: multiply by 100 × 100.', 'L\'aire utilise deux longueurs : convertis deux fois, multiplie par 100 × 100.'),
    };
  }
  if (tier === 2) {
    const m3 = randInt(r, 1, 9);
    return {
      prompt: bi((f) => f.t(`A shipping crate has a volume of ${f.N(m3)} m³. What is its volume in cm³? (1 m = 100 cm)`, `Une caisse d'expédition a un volume de ${f.N(m3)} m³. Quel est son volume en cm³ ? (1 m = 100 cm)`)),
      answer: m3 * 1000000, category: 'AP',
      wrong: [[m3 * 10000, t('It looks like only two lengths were converted. Volume has three lengths, so 1 m³ = 100 × 100 × 100 = 1 000 000 cm³.', 'Il semble que seulement deux longueurs ont été converties. Le volume comporte trois longueurs : 1 m³ = 100 × 100 × 100 = 1 000 000 cm³.'), 0]] as Wrong,
      steps: [t('1 m³ is a cube 100 cm on each edge: 100 × 100 × 100 = 1 000 000 cm³.', '1 m³ est un cube de 100 cm d\'arête : 100 × 100 × 100 = 1 000 000 cm³.'), bi((f) => f.t(`${f.N(m3)} × ${f.N(1000000)} = ${f.N(m3 * 1000000)} cm³.`, `${f.N(m3)} × ${f.N(1000000)} = ${f.N(m3 * 1000000)} cm³.`))],
      nudge: t('Volume uses three lengths, so convert three times.', 'Le volume utilise trois longueurs : convertis trois fois.'),
    };
  }
  const L = randInt(r, 2, 9), W = randInt(r, 2, 9), tile = pick(r, [10, 20, 25, 50]);
  const count = ((100 * L) / tile) * ((100 * W) / tile);
  return {
    prompt: bi((f) => f.t(`A floor is ${f.N(L)} m by ${f.N(W)} m. It is covered with square tiles that are ${f.N(tile)} cm on each side. How many tiles are needed?`, `Un plancher mesure ${f.N(L)} m sur ${f.N(W)} m. Il est couvert de tuiles carrées de ${f.N(tile)} cm de côté. Combien de tuiles faut-il ?`)),
    answer: count, category: 'AP',
    wrong: [[(L * W) / ((tile / 100) * tile), t('It looks like the units were mixed. Use the same unit for the floor and the tiles before dividing the areas.', 'Il semble que les unités ont été mélangées. Utilise la même unité pour le plancher et les tuiles avant de diviser les aires.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Change the floor to centimetres: ${f.N(L * 100)} cm by ${f.N(W * 100)} cm.`, `Convertis le plancher en centimètres : ${f.N(L * 100)} cm sur ${f.N(W * 100)} cm.`)), bi((f) => f.t(`Tiles along each side: ${f.N(L * 100)} ÷ ${f.N(tile)} = ${f.N((100 * L) / tile)} and ${f.N(W * 100)} ÷ ${f.N(tile)} = ${f.N((100 * W) / tile)}. Total: ${f.N((100 * L) / tile)} × ${f.N((100 * W) / tile)} = ${f.N(count)}.`, `Tuiles le long de chaque côté : ${f.N(L * 100)} ÷ ${f.N(tile)} = ${f.N((100 * L) / tile)} et ${f.N(W * 100)} ÷ ${f.N(tile)} = ${f.N((100 * W) / tile)}. Total : ${f.N((100 * L) / tile)} × ${f.N((100 * W) / tile)} = ${f.N(count)}.`))],
    nudge: t('Use the same unit for the floor and the tiles, then see how many fit along each side.', 'Utilise la même unité pour le plancher et les tuiles, puis vois combien en tiennent le long de chaque côté.'),
  };
});

const PI_NOTE = (f: { t: (a: string, b: string) => string }): string => f.t('Use 3.14 for pi.', 'Utilise 3,14 pour pi.');

/** MS.G7.E2.3.a: circumference */
export const circumference7 = numGen('MS.G7.E2.3.a', (tier, r) => {
  if (tier === 1) {
    const d = randInt(r, 2, 40);
    return {
      prompt: bi((f) => f.t(`A circle has a diameter of ${f.N(d)} cm. What is its circumference, in cm? ${PI_NOTE(f)}`, `Un cercle a un diamètre de ${f.N(d)} cm. Quelle est sa circonférence, en cm ? ${PI_NOTE(f)}`)),
      answer: r6(PI * d),
      wrong: [[r6(PI * d * d), t('It looks like the diameter was squared, which is for area. Circumference is pi times the diameter.', 'Il semble que le diamètre a été mis au carré, ce qui sert pour l\'aire. La circonférence est pi fois le diamètre.'), 0]] as Wrong,
      steps: [t('Circumference = π × diameter.', 'Circonférence = π × diamètre.'), bi((f) => f.t(`${f.N(PI)} × ${f.N(d)} = ${f.N(r6(PI * d))} cm.`, `${f.N(PI)} × ${f.N(d)} = ${f.N(r6(PI * d))} cm.`))],
      nudge: t('Multiply pi by the diameter.', 'Multiplie pi par le diamètre.'),
    };
  }
  if (tier === 2) {
    const rad = randInt(r, 2, 25);
    return {
      prompt: bi((f) => f.t(`A circle has a radius of ${f.N(rad)} cm. What is its circumference, in cm? ${PI_NOTE(f)}`, `Un cercle a un rayon de ${f.N(rad)} cm. Quelle est sa circonférence, en cm ? ${PI_NOTE(f)}`)),
      answer: r6(PI * 2 * rad),
      wrong: [[r6(PI * rad), t('It looks like the radius was used as the diameter. The diameter is twice the radius.', 'Il semble que le rayon a été utilisé comme diamètre. Le diamètre est le double du rayon.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The diameter is 2 × ${f.N(rad)} = ${f.N(2 * rad)} cm.`, `Le diamètre est 2 × ${f.N(rad)} = ${f.N(2 * rad)} cm.`)), bi((f) => f.t(`Circumference = ${f.N(PI)} × ${f.N(2 * rad)} = ${f.N(r6(PI * 2 * rad))} cm.`, `Circonférence = ${f.N(PI)} × ${f.N(2 * rad)} = ${f.N(r6(PI * 2 * rad))} cm.`))],
      nudge: t('Double the radius to get the diameter first.', 'Double d\'abord le rayon pour obtenir le diamètre.'),
    };
  }
  const d = randInt(r, 5, 60);
  const C = r6(PI * d);
  return {
    prompt: bi((f) => f.t(`A bicycle wheel has a circumference of ${f.N(C)} cm. What is its diameter, in cm? ${PI_NOTE(f)}`, `Une roue de bicyclette a une circonférence de ${f.N(C)} cm. Quel est son diamètre, en cm ? ${PI_NOTE(f)}`)),
    answer: d, category: 'AP',
    wrong: [[r6(C * PI), t('It looks like the circumference was multiplied by pi. To find the diameter, divide the circumference by pi.', 'Il semble que la circonférence a été multipliée par pi. Pour trouver le diamètre, divise la circonférence par pi.'), 0]] as Wrong,
    steps: [t('Circumference = π × diameter, so diameter = circumference ÷ π.', 'Circonférence = π × diamètre, donc diamètre = circonférence ÷ π.'), bi((f) => f.t(`${f.N(C)} ÷ ${f.N(PI)} = ${f.N(d)} cm.`, `${f.N(C)} ÷ ${f.N(PI)} = ${f.N(d)} cm.`))],
    nudge: t('Divide the circumference by pi.', 'Divise la circonférence par pi.'),
  };
});

/** MS.G7.E2.5.a: area of a circle */
export const circleArea7 = numGen('MS.G7.E2.5.a', (tier, r) => {
  if (tier === 1) {
    const rad = randInt(r, 2, 20);
    return {
      prompt: bi((f) => f.t(`A circle has a radius of ${f.N(rad)} cm. What is its area, in cm²? ${PI_NOTE(f)}`, `Un cercle a un rayon de ${f.N(rad)} cm. Quelle est son aire, en cm² ? ${PI_NOTE(f)}`)),
      answer: r6(PI * rad * rad),
      wrong: [[r6(PI * rad * 2), t('It looks like the radius was doubled instead of squared. Area = π × radius × radius.', 'Il semble que le rayon a été doublé au lieu d\'être mis au carré. Aire = π × rayon × rayon.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Area = π × r² = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)}.`, `Aire = π × r² = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)}.`)), bi((f) => f.t(`${f.N(rad * rad)} × ${f.N(PI)} = ${f.N(r6(PI * rad * rad))} cm².`, `${f.N(rad * rad)} × ${f.N(PI)} = ${f.N(r6(PI * rad * rad))} cm².`))],
      nudge: t('Square the radius first, then multiply by pi.', 'Mets d\'abord le rayon au carré, puis multiplie par pi.'),
    };
  }
  if (tier === 2) {
    const rad = randInt(r, 2, 15);
    const d = 2 * rad;
    return {
      prompt: bi((f) => f.t(`A round table has a diameter of ${f.N(d)} cm. What is the area of its top, in cm²? ${PI_NOTE(f)}`, `Une table ronde a un diamètre de ${f.N(d)} cm. Quelle est l'aire de son dessus, en cm² ? ${PI_NOTE(f)}`)),
      answer: r6(PI * rad * rad), category: 'AP',
      wrong: [[r6(PI * d * d), t('It looks like the diameter was used as the radius. Halve the diameter to get the radius first.', 'Il semble que le diamètre a été utilisé comme rayon. Prends d\'abord la moitié du diamètre pour obtenir le rayon.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The radius is ${f.N(d)} ÷ 2 = ${f.N(rad)} cm.`, `Le rayon est ${f.N(d)} ÷ 2 = ${f.N(rad)} cm.`)), bi((f) => f.t(`Area = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`, `Aire = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`))],
      nudge: t('Halve the diameter to find the radius.', 'Prends la moitié du diamètre pour trouver le rayon.'),
    };
  }
  const rad = randInt(r, 2, 14);
  return {
    prompt: bi((f) => f.t(`A semicircle (half a circle) has a radius of ${f.N(rad)} cm. What is its area, in cm²? ${PI_NOTE(f)}`, `Un demi-cercle a un rayon de ${f.N(rad)} cm. Quelle est son aire, en cm² ? ${PI_NOTE(f)}`)),
    answer: r6((PI * rad * rad) / 2), category: 'TH',
    wrong: [[r6(PI * rad * rad), t('That is the area of the whole circle. A semicircle is half of it.', 'C\'est l\'aire du cercle entier. Un demi-cercle en est la moitié.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Whole circle: ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`, `Cercle entier : ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`)), bi((f) => f.t(`Half of it: ${f.N(r6(PI * rad * rad))} ÷ 2 = ${f.N(r6((PI * rad * rad) / 2))} cm².`, `La moitié : ${f.N(r6(PI * rad * rad))} ÷ 2 = ${f.N(r6((PI * rad * rad) / 2))} cm².`))],
    nudge: t('Find the area of the whole circle, then take half.', 'Trouve l\'aire du cercle entier, puis prends-en la moitié.'),
  };
});

/** MS.G7.E2.6.a: cylinder nets and surface area */
export const cylinderSA7 = numGen('MS.G7.E2.6.a', (tier, r) => {
  const rad = randInt(r, 2, 10), h = randInt(r, 3, 20);
  if (tier === 1) {
    const d = 2 * rad;
    return {
      prompt: bi((f) => f.t(`The net of a can is two circles and a rectangle. The can has a diameter of ${f.N(d)} cm and a height of ${f.N(h)} cm. What is the area of the rectangle, in cm²? ${PI_NOTE(f)}`, `Le développement d'une boîte de conserve est formé de deux cercles et d'un rectangle. La boîte a un diamètre de ${f.N(d)} cm et une hauteur de ${f.N(h)} cm. Quelle est l'aire du rectangle, en cm² ? ${PI_NOTE(f)}`)),
      answer: r6(PI * d * h), category: 'AP',
      wrong: [[d * h, t('It looks like the width of the rectangle was the diameter. The rectangle wraps around the can, so its length is the circumference.', 'Il semble que la largeur du rectangle était le diamètre. Le rectangle fait le tour de la boîte : sa longueur est la circonférence.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The rectangle is as long as the circumference: ${f.N(PI)} × ${f.N(d)} = ${f.N(r6(PI * d))} cm, and as tall as the can: ${f.N(h)} cm.`, `Le rectangle est aussi long que la circonférence : ${f.N(PI)} × ${f.N(d)} = ${f.N(r6(PI * d))} cm, et aussi haut que la boîte : ${f.N(h)} cm.`)), bi((f) => f.t(`Area = ${f.N(r6(PI * d))} × ${f.N(h)} = ${f.N(r6(PI * d * h))} cm².`, `Aire = ${f.N(r6(PI * d))} × ${f.N(h)} = ${f.N(r6(PI * d * h))} cm².`))],
      nudge: t('The rectangle wraps around the can, so one side is the circumference.', 'Le rectangle fait le tour de la boîte : un de ses côtés est la circonférence.'),
    };
  }
  const total = r6(PI * 2 * rad * rad + PI * 2 * rad * h);
  if (tier === 2) {
    return {
      prompt: bi((f) => f.t(`A cylinder has a radius of ${f.N(rad)} cm and a height of ${f.N(h)} cm. What is its total surface area, in cm²? ${PI_NOTE(f)}`, `Un cylindre a un rayon de ${f.N(rad)} cm et une hauteur de ${f.N(h)} cm. Quelle est son aire totale, en cm² ? ${PI_NOTE(f)}`)),
      answer: total,
      wrong: [[r6(PI * 2 * rad * h), t('That is only the curved part. Add the areas of the two circular ends.', 'C\'est seulement la partie courbe. Ajoute les aires des deux bases circulaires.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Two circles: 2 × ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * 2 * rad * rad))}. Curved part: ${f.N(PI)} × ${f.N(2 * rad)} × ${f.N(h)} = ${f.N(r6(PI * 2 * rad * h))}.`, `Deux cercles : 2 × ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * 2 * rad * rad))}. Partie courbe : ${f.N(PI)} × ${f.N(2 * rad)} × ${f.N(h)} = ${f.N(r6(PI * 2 * rad * h))}.`)), bi((f) => f.t(`Total: ${f.N(r6(PI * 2 * rad * rad))} + ${f.N(r6(PI * 2 * rad * h))} = ${f.N(total)} cm².`, `Total : ${f.N(r6(PI * 2 * rad * rad))} + ${f.N(r6(PI * 2 * rad * h))} = ${f.N(total)} cm².`))],
      nudge: t('Add the two circles and the rectangle from the net.', 'Additionne les deux cercles et le rectangle du développement.'),
    };
  }
  const d = 2 * rad;
  return {
    prompt: bi((f) => f.t(`A closed cylindrical tank has a diameter of ${f.N(d)} m and a height of ${f.N(h)} m. How many square metres of metal cover it, including both ends? ${PI_NOTE(f)}`, `Un réservoir cylindrique fermé a un diamètre de ${f.N(d)} m et une hauteur de ${f.N(h)} m. Combien de mètres carrés de métal le recouvrent, bases comprises ? ${PI_NOTE(f)}`)),
    answer: total, category: 'AP',
    wrong: [[r6(PI * d * d * 2 + PI * d * h), t('It looks like the diameter was used as the radius for the circles. Halve the diameter first.', 'Il semble que le diamètre a été utilisé comme rayon pour les cercles. Prends d\'abord la moitié du diamètre.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`The radius is ${f.N(d)} ÷ 2 = ${f.N(rad)} m. Two ends: 2 × ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * 2 * rad * rad))}. Curved part: ${f.N(PI)} × ${f.N(d)} × ${f.N(h)} = ${f.N(r6(PI * d * h))}.`, `Le rayon est ${f.N(d)} ÷ 2 = ${f.N(rad)} m. Deux bases : 2 × ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * 2 * rad * rad))}. Partie courbe : ${f.N(PI)} × ${f.N(d)} × ${f.N(h)} = ${f.N(r6(PI * d * h))}.`)), bi((f) => f.t(`Total: ${f.N(r6(PI * 2 * rad * rad))} + ${f.N(r6(PI * d * h))} = ${f.N(total)} m².`, `Total : ${f.N(r6(PI * 2 * rad * rad))} + ${f.N(r6(PI * d * h))} = ${f.N(total)} m².`))],
    nudge: t('Halve the diameter to get the radius, then add the two ends and the curved part.', 'Prends la moitié du diamètre pour obtenir le rayon, puis ajoute les deux bases et la partie courbe.'),
  };
});

/** MS.G7.E2.7.a: volume of prisms (base area × height) */
export const prismVolume7 = numGen('MS.G7.E2.7.a', (tier, r) => {
  if (tier === 1) {
    const l = randInt(r, 2, 15), w = randInt(r, 2, 12), h = randInt(r, 2, 12);
    return {
      prompt: bi((f) => f.t(`A rectangular prism is ${f.N(l)} cm long, ${f.N(w)} cm wide and ${f.N(h)} cm high. What is its volume, in cm³?`, `Un prisme rectangulaire mesure ${f.N(l)} cm de long, ${f.N(w)} cm de large et ${f.N(h)} cm de haut. Quel est son volume, en cm³ ?`)),
      answer: l * w * h,
      wrong: [[l + w + h, t('It looks like the lengths were added. Volume = base area × height, so multiply.', 'Il semble que les longueurs ont été additionnées. Volume = aire de la base × hauteur : multiplie.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Base area = ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} cm².`, `Aire de la base = ${f.N(l)} × ${f.N(w)} = ${f.N(l * w)} cm².`)), bi((f) => f.t(`Volume = ${f.N(l * w)} × ${f.N(h)} = ${f.N(l * w * h)} cm³.`, `Volume = ${f.N(l * w)} × ${f.N(h)} = ${f.N(l * w * h)} cm³.`))],
      nudge: t('Multiply the base area by the height.', 'Multiplie l\'aire de la base par la hauteur.'),
    };
  }
  if (tier === 2) {
    const b = randInt(r, 2, 10) * 2, ht = randInt(r, 2, 10), len = randInt(r, 3, 15);
    const area = (b * ht) / 2;
    return {
      prompt: bi((f) => f.t(`A triangular prism has a triangular base with a base of ${f.N(b)} cm and a height of ${f.N(ht)} cm. The prism is ${f.N(len)} cm long. What is its volume, in cm³?`, `Un prisme triangulaire a une base triangulaire de ${f.N(b)} cm de base et de ${f.N(ht)} cm de hauteur. Le prisme mesure ${f.N(len)} cm de long. Quel est son volume, en cm³ ?`)),
      answer: area * len,
      wrong: [[b * ht * len, t('It looks like the triangle was treated as a rectangle. The area of a triangle is half of base × height.', 'Il semble que le triangle a été traité comme un rectangle. L\'aire d\'un triangle est la moitié de base × hauteur.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Area of the triangular base = ${f.N(b)} × ${f.N(ht)} ÷ 2 = ${f.N(area)} cm².`, `Aire de la base triangulaire = ${f.N(b)} × ${f.N(ht)} ÷ 2 = ${f.N(area)} cm².`)), bi((f) => f.t(`Volume = ${f.N(area)} × ${f.N(len)} = ${f.N(area * len)} cm³.`, `Volume = ${f.N(area)} × ${f.N(len)} = ${f.N(area * len)} cm³.`))],
      nudge: t('Find the area of the triangle first, then multiply by the length of the prism.', 'Trouve d\'abord l\'aire du triangle, puis multiplie par la longueur du prisme.'),
    };
  }
  const A = pick(r, [12, 15, 18, 20, 24, 25, 30, 36]), h = randInt(r, 3, 15), V = A * h;
  return {
    prompt: bi((f) => f.t(`A prism has a volume of ${f.N(V)} cm³ and a base area of ${f.N(A)} cm². What is its height, in cm?`, `Un prisme a un volume de ${f.N(V)} cm³ et une aire de base de ${f.N(A)} cm². Quelle est sa hauteur, en cm ?`)),
    answer: h, category: 'TH',
    wrong: [[V * A, t('It looks like the numbers were multiplied. Volume = base area × height, so divide the volume by the base area.', 'Il semble que les nombres ont été multipliés. Volume = aire de la base × hauteur : divise le volume par l\'aire de la base.'), 0]] as Wrong,
    steps: [t('Volume = base area × height, so height = volume ÷ base area.', 'Volume = aire de la base × hauteur, donc hauteur = volume ÷ aire de la base.'), bi((f) => f.t(`${f.N(V)} ÷ ${f.N(A)} = ${f.N(h)} cm.`, `${f.N(V)} ÷ ${f.N(A)} = ${f.N(h)} cm.`))],
    nudge: t('Divide the volume by the base area.', 'Divise le volume par l\'aire de la base.'),
  };
});

/** MS.G7.E2.7.b: volume of cylinders */
export const cylinderVolume7 = numGen('MS.G7.E2.7.b', (tier, r) => {
  const rad = randInt(r, 2, 10), h = randInt(r, 3, 20);
  if (tier === 1) {
    return {
      prompt: bi((f) => f.t(`A cylinder has a radius of ${f.N(rad)} cm and a height of ${f.N(h)} cm. What is its volume, in cm³? ${PI_NOTE(f)}`, `Un cylindre a un rayon de ${f.N(rad)} cm et une hauteur de ${f.N(h)} cm. Quel est son volume, en cm³ ? ${PI_NOTE(f)}`)),
      answer: r6(PI * rad * rad * h),
      wrong: [[r6(PI * rad * h), t('It looks like the radius was not squared. The base is a circle, so its area uses the radius squared.', 'Il semble que le rayon n\'a pas été mis au carré. La base est un cercle : son aire utilise le rayon au carré.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`Base area = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`, `Aire de la base = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`)), bi((f) => f.t(`Volume = ${f.N(r6(PI * rad * rad))} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))} cm³.`, `Volume = ${f.N(r6(PI * rad * rad))} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))} cm³.`))],
      nudge: t('Find the area of the circular base, then multiply by the height.', 'Trouve l\'aire de la base circulaire, puis multiplie par la hauteur.'),
    };
  }
  if (tier === 2) {
    const d = 2 * rad;
    return {
      prompt: bi((f) => f.t(`A water barrel is a cylinder with a diameter of ${f.N(d)} cm and a height of ${f.N(h)} cm. What is its volume, in cm³? ${PI_NOTE(f)}`, `Un baril d'eau est un cylindre de ${f.N(d)} cm de diamètre et de ${f.N(h)} cm de hauteur. Quel est son volume, en cm³ ? ${PI_NOTE(f)}`)),
      answer: r6(PI * rad * rad * h), category: 'AP',
      wrong: [[r6(PI * d * d * h), t('It looks like the diameter was used as the radius. Halve the diameter first.', 'Il semble que le diamètre a été utilisé comme rayon. Prends d\'abord la moitié du diamètre.'), 0]] as Wrong,
      steps: [bi((f) => f.t(`The radius is ${f.N(d)} ÷ 2 = ${f.N(rad)} cm, so the base area is ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`, `Le rayon est ${f.N(d)} ÷ 2 = ${f.N(rad)} cm, donc l\'aire de la base est ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`)), bi((f) => f.t(`Volume = ${f.N(r6(PI * rad * rad))} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))} cm³.`, `Volume = ${f.N(r6(PI * rad * rad))} × ${f.N(h)} = ${f.N(r6(PI * rad * rad * h))} cm³.`))],
      nudge: t('Halve the diameter to get the radius, then find the base area.', 'Prends la moitié du diamètre pour obtenir le rayon, puis trouve l\'aire de la base.'),
    };
  }
  const V = r6(PI * rad * rad * h);
  return {
    prompt: bi((f) => f.t(`A cylinder with a radius of ${f.N(rad)} cm has a volume of ${f.N(V)} cm³. What is its height, in cm? ${PI_NOTE(f)}`, `Un cylindre dont le rayon est de ${f.N(rad)} cm a un volume de ${f.N(V)} cm³. Quelle est sa hauteur, en cm ? ${PI_NOTE(f)}`)),
    answer: h, category: 'TH',
    wrong: [[r6(V / (PI * rad)), t('It looks like the radius was not squared. The base area is π × r × r.', 'Il semble que le rayon n\'a pas été mis au carré. L\'aire de la base est π × r × r.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`Base area = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`, `Aire de la base = ${f.N(PI)} × ${f.N(rad)} × ${f.N(rad)} = ${f.N(r6(PI * rad * rad))} cm².`)), bi((f) => f.t(`Height = volume ÷ base area = ${f.N(V)} ÷ ${f.N(r6(PI * rad * rad))} = ${f.N(h)} cm.`, `Hauteur = volume ÷ aire de la base = ${f.N(V)} ÷ ${f.N(r6(PI * rad * rad))} = ${f.N(h)} cm.`))],
    nudge: t('Find the base area, then divide the volume by it.', 'Trouve l\'aire de la base, puis divise le volume par celle-ci.'),
  };
});

/** MS.G7.F1.1.a: exchange rates and currency conversion */
export const exchange7 = numGen('MS.G7.F1.1.a', (tier, r) => {
  if (tier === 1) {
    const rate = pick(r, [0.5, 0.6, 0.7, 0.75, 0.8]);
    const c = randInt(r, 2, 40) * 20;
    return {
      prompt: bi((f) => f.t(`The exchange rate is 1 Canadian dollar = ${f.N(rate)} US dollars. How many US dollars is ${f.N(c)} Canadian dollars worth?`, `Le taux de change est de 1 dollar canadien = ${f.N(rate)} dollar américain. Combien de dollars américains valent ${f.N(c)} dollars canadiens ?`)),
      answer: r6(c * rate), category: 'AP',
      wrong: [[r6(c / rate), t('It looks like the amount was divided by the rate. Each Canadian dollar is worth the rate in US dollars, so multiply.', 'Il semble que le montant a été divisé par le taux. Chaque dollar canadien vaut le taux en dollars américains : multiplie.'), 0]] as Wrong,
      steps: [t('Each Canadian dollar is worth the rate in US dollars, so multiply.', 'Chaque dollar canadien vaut le taux en dollars américains : multiplie.'), bi((f) => f.t(`${f.N(c)} × ${f.N(rate)} = ${f.N(r6(c * rate))} US dollars.`, `${f.N(c)} × ${f.N(rate)} = ${f.N(r6(c * rate))} dollars américains.`))],
      nudge: t('Multiply the amount by the exchange rate.', 'Multiplie le montant par le taux de change.'),
    };
  }
  if (tier === 2) {
    const rate = pick(r, [0.5, 0.6, 0.75, 0.8]);
    const us = randInt(r, 2, 40) * 15;
    const c = r6(us / rate);
    return {
      prompt: bi((f) => f.t(`The exchange rate is 1 Canadian dollar = ${f.N(rate)} US dollars. How many Canadian dollars do you need to get ${f.N(us)} US dollars?`, `Le taux de change est de 1 dollar canadien = ${f.N(rate)} dollar américain. De combien de dollars canadiens as-tu besoin pour obtenir ${f.N(us)} dollars américains ?`)),
      answer: c, category: 'AP',
      wrong: [[r6(us * rate), t('It looks like the amount was multiplied by the rate. You are going from US dollars to Canadian dollars, so divide by the rate.', 'Il semble que le montant a été multiplié par le taux. Tu passes des dollars américains aux dollars canadiens : divise par le taux.'), 0]] as Wrong,
      steps: [t('Each Canadian dollar gives the rate in US dollars, so divide the US amount by the rate.', 'Chaque dollar canadien donne le taux en dollars américains : divise le montant américain par le taux.'), bi((f) => f.t(`${f.N(us)} ÷ ${f.N(rate)} = ${f.N(c)} Canadian dollars.`, `${f.N(us)} ÷ ${f.N(rate)} = ${f.N(c)} dollars canadiens.`))],
      nudge: t('Is the amount you want smaller or bigger than what you pay? Divide by the rate.', 'Le montant voulu est-il plus petit ou plus grand que ce que tu paies ? Divise par le taux.'),
    };
  }
  const rate = pick(r, [1.25, 1.3, 1.35, 1.4, 1.45]);
  const us = randInt(r, 1, 15) * 20;
  return {
    prompt: bi((f) => f.t(`A jacket costs ${f.N(us)} US dollars. The exchange rate is 1 US dollar = ${f.N(rate)} Canadian dollars. What does the jacket cost in Canadian dollars?`, `Un manteau coûte ${f.N(us)} dollars américains. Le taux de change est de 1 dollar américain = ${f.N(rate)} dollar canadien. Combien le manteau coûte-t-il en dollars canadiens ?`)),
    answer: r6(us * rate), category: 'AP',
    wrong: [[r6(us / rate), t('It looks like the price was divided by the rate. Each US dollar costs the rate in Canadian dollars, so multiply.', 'Il semble que le prix a été divisé par le taux. Chaque dollar américain coûte le taux en dollars canadiens : multiplie.'), 0]] as Wrong,
    steps: [t('Each US dollar costs the rate in Canadian dollars, so multiply.', 'Chaque dollar américain coûte le taux en dollars canadiens : multiplie.'), bi((f) => f.t(`${f.N(us)} × ${f.N(rate)} = ${f.N(r6(us * rate))} Canadian dollars.`, `${f.N(us)} × ${f.N(rate)} = ${f.N(r6(us * rate))} dollars canadiens.`))],
    nudge: t('Multiply the price by the number of Canadian dollars in one US dollar.', 'Multiplie le prix par le nombre de dollars canadiens dans un dollar américain.'),
  };
});

/** MS.G7.F1.3.a: create, track and adjust budgets */
export const budget7 = numGen('MS.G7.F1.3.a', (tier, r) => {
  if (tier === 1) {
    const income = randInt(r, 20, 40) * 100, rent = randInt(r, 6, 12) * 100, food = randInt(r, 3, 6) * 100, other = randInt(r, 1, 4) * 100;
    return {
      prompt: bi((f) => f.t(`Sam earns ${f.N(income)} dollars a month. Rent is ${f.N(rent)}, food is ${f.N(food)} and other costs are ${f.N(other)}. How much is left each month, in dollars?`, `Sam gagne ${f.N(income)} dollars par mois. Le loyer est de ${f.N(rent)}, la nourriture de ${f.N(food)} et les autres frais de ${f.N(other)}. Combien reste-t-il chaque mois, en dollars ?`)),
      answer: income - rent - food - other, category: 'AP',
      wrong: [[rent + food + other, t('That is the total spent. The amount left is the income minus the total spent.', 'C\'est le total dépensé. Ce qui reste, c\'est le revenu moins le total dépensé.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Total spent: ${f.N(rent)} + ${f.N(food)} + ${f.N(other)} = ${f.N(rent + food + other)}.`, `Total dépensé : ${f.N(rent)} + ${f.N(food)} + ${f.N(other)} = ${f.N(rent + food + other)}.`)), bi((f) => f.t(`Left over: ${f.N(income)} − ${f.N(rent + food + other)} = ${f.N(income - rent - food - other)} dollars.`, `Reste : ${f.N(income)} − ${f.N(rent + food + other)} = ${f.N(income - rent - food - other)} dollars.`))],
      nudge: t('Add up everything spent, then subtract from the income.', 'Additionne toutes les dépenses, puis soustrais-les du revenu.'),
    };
  }
  if (tier === 2) {
    const income = randInt(r, 10, 30) * 100;
    const needs = pick(r, [50, 55, 60]), wants = pick(r, [20, 25, 30]);
    const save = 100 - needs - wants;
    return {
      prompt: bi((f) => f.t(`Alex earns ${f.N(income)} dollars a month and budgets ${f.N(needs)}% for needs and ${f.N(wants)}% for wants. The rest goes to savings. How many dollars are saved each month?`, `Alex gagne ${f.N(income)} dollars par mois et prévoit ${f.N(needs)} % pour les besoins et ${f.N(wants)} % pour les désirs. Le reste va à l'épargne. Combien de dollars sont épargnés chaque mois ?`)),
      answer: (income * save) / 100, category: 'AP',
      wrong: [[save, t('That is the percent saved, not the dollars. Find that percent of the income.', 'C\'est le pourcentage épargné, pas les dollars. Trouve ce pourcentage du revenu.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Savings percent: 100 − ${f.N(needs)} − ${f.N(wants)} = ${f.N(save)}%.`, `Pourcentage d\'épargne : 100 − ${f.N(needs)} − ${f.N(wants)} = ${f.N(save)} %.`)), bi((f) => f.t(`${f.N(save)}% of ${f.N(income)} = ${f.N((income * save) / 100)} dollars.`, `${f.N(save)} % de ${f.N(income)} = ${f.N((income * save) / 100)} dollars.`))],
      nudge: t('Find the percent left for savings first, then that percent of the income.', 'Trouve d\'abord le pourcentage qui reste pour l\'épargne, puis ce pourcentage du revenu.'),
    };
  }
  const income = randInt(r, 20, 36) * 100, rent = randInt(r, 6, 10) * 100, other = randInt(r, 5, 12) * 100;
  const pct = pick(r, [10, 20, 25, 50]);
  const newRent = rent + (rent * pct) / 100;
  return {
    prompt: bi((f) => f.t(`A budget has an income of ${f.N(income)} dollars, rent of ${f.N(rent)} and other costs of ${f.N(other)}. The rent goes up by ${f.N(pct)}%. How much is left each month after the increase, in dollars?`, `Un budget comporte un revenu de ${f.N(income)} dollars, un loyer de ${f.N(rent)} et d'autres frais de ${f.N(other)}. Le loyer augmente de ${f.N(pct)} %. Combien reste-t-il chaque mois après l'augmentation, en dollars ?`)),
    answer: income - newRent - other, category: 'TH',
    wrong: [[income - rent - other, t('It looks like the old rent was used. The budget has to be adjusted for the increase.', 'Il semble que l\'ancien loyer a été utilisé. Le budget doit être ajusté pour tenir compte de l\'augmentation.'), 0]] as Wrong,
    steps: [bi((f) => f.t(`New rent: ${f.N(rent)} + ${f.N(pct)}% of ${f.N(rent)} = ${f.N(rent)} + ${f.N((rent * pct) / 100)} = ${f.N(newRent)}.`, `Nouveau loyer : ${f.N(rent)} + ${f.N(pct)} % de ${f.N(rent)} = ${f.N(rent)} + ${f.N((rent * pct) / 100)} = ${f.N(newRent)}.`)), bi((f) => f.t(`Left: ${f.N(income)} − ${f.N(newRent)} − ${f.N(other)} = ${f.N(income - newRent - other)} dollars.`, `Reste : ${f.N(income)} − ${f.N(newRent)} − ${f.N(other)} = ${f.N(income - newRent - other)} dollars.`))],
    nudge: t('Work out the new rent first, then redo the budget.', 'Calcule d\'abord le nouveau loyer, puis refais le budget.'),
  };
});

/** MS.G7.F1.5.a: how interest affects savings and borrowing */
export const interest7 = numGen('MS.G7.F1.5.a', (tier, r) => {
  const P = randInt(r, 2, 20) * 100;
  if (tier === 1) {
    const rate = randInt(r, 2, 6), years = randInt(r, 1, 5);
    const I = (P * rate * years) / 100;
    return {
      prompt: bi((f) => f.t(`You save ${f.N(P)} dollars at ${f.N(rate)}% simple interest per year for ${f.N(years)} years. How much interest do you earn, in dollars?`, `Tu épargnes ${f.N(P)} dollars à un taux d'intérêt simple de ${f.N(rate)} % par année pendant ${f.N(years)} ans. Combien d'intérêt gagnes-tu, en dollars ?`)),
      answer: I, category: 'AP',
      wrong: [[(P * rate) / 100, t('That is the interest for one year only. Simple interest is the same each year, so multiply by the number of years.', 'C\'est l\'intérêt d\'une seule année. L\'intérêt simple est le même chaque année : multiplie par le nombre d\'années.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`One year: ${f.N(rate)}% of ${f.N(P)} = ${f.N((P * rate) / 100)} dollars.`, `Une année : ${f.N(rate)} % de ${f.N(P)} = ${f.N((P * rate) / 100)} dollars.`)), bi((f) => f.t(`${f.N(years)} years: ${f.N((P * rate) / 100)} × ${f.N(years)} = ${f.N(I)} dollars.`, `${f.N(years)} ans : ${f.N((P * rate) / 100)} × ${f.N(years)} = ${f.N(I)} dollars.`))],
      nudge: t('Find one year of interest, then multiply by the number of years.', 'Trouve l\'intérêt d\'une année, puis multiplie par le nombre d\'années.'),
    };
  }
  if (tier === 2) {
    const rate = randInt(r, 3, 12), years = randInt(r, 2, 5);
    const I = (P * rate * years) / 100;
    return {
      prompt: bi((f) => f.t(`You borrow ${f.N(P)} dollars at ${f.N(rate)}% simple interest per year and pay it all back after ${f.N(years)} years. How much do you pay back in total, in dollars?`, `Tu empruntes ${f.N(P)} dollars à un taux d'intérêt simple de ${f.N(rate)} % par année et tu rembourses le tout après ${f.N(years)} ans. Combien rembourses-tu au total, en dollars ?`)),
      answer: P + I, category: 'AP',
      wrong: [[I, t('That is only the interest. You pay back the amount you borrowed as well.', 'C\'est seulement l\'intérêt. Tu rembourses aussi le montant emprunté.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Interest: ${f.N(P)} × ${f.N(rate)}% × ${f.N(years)} = ${f.N(I)} dollars.`, `Intérêt : ${f.N(P)} × ${f.N(rate)} % × ${f.N(years)} = ${f.N(I)} dollars.`)), bi((f) => f.t(`Total: ${f.N(P)} + ${f.N(I)} = ${f.N(P + I)} dollars.`, `Total : ${f.N(P)} + ${f.N(I)} = ${f.N(P + I)} dollars.`))],
      nudge: t('Find the interest, then add it to the amount borrowed.', 'Trouve l\'intérêt, puis ajoute-le au montant emprunté.'),
    };
  }
  const rate = pick(r, [2, 4, 5, 10]);
  const total = r6((P / 100) * ((100 + rate) ** 2 / 100));
  return {
    prompt: bi((f) => f.t(`You save ${f.N(P)} dollars at ${f.N(rate)}% interest compounded once a year. How much is in the account after 2 years, in dollars?`, `Tu épargnes ${f.N(P)} dollars à un taux d'intérêt de ${f.N(rate)} % composé une fois par année. Combien y a-t-il dans le compte après 2 ans, en dollars ?`)),
    answer: total, category: 'TH',
    wrong: [[r6(P + (P * rate * 2) / 100), t('That is simple interest. With compound interest, the second year\'s interest is worked out on the new, larger amount.', 'C\'est de l\'intérêt simple. Avec l\'intérêt composé, l\'intérêt de la deuxième année est calculé sur le nouveau montant, plus grand.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`After year 1: ${f.N(P)} × ${f.N(1 + rate / 100)} = ${f.N(r6(P * (1 + rate / 100)))} dollars.`, `Après l\'année 1 : ${f.N(P)} × ${f.N(1 + rate / 100)} = ${f.N(r6(P * (1 + rate / 100)))} dollars.`)), bi((f) => f.t(`After year 2: ${f.N(r6(P * (1 + rate / 100)))} × ${f.N(1 + rate / 100)} = ${f.N(total)} dollars.`, `Après l\'année 2 : ${f.N(r6(P * (1 + rate / 100)))} × ${f.N(1 + rate / 100)} = ${f.N(total)} dollars.`))],
    nudge: t('Work out the first year, then earn interest on the new amount.', 'Calcule la première année, puis gagne de l\'intérêt sur le nouveau montant.'),
  };
});

/** MS.G7.F1.6.a: compare accounts and loans */
export const compareAccounts7 = numGen('MS.G7.F1.6.a', (tier, r) => {
  const P = randInt(r, 2, 15) * 100;
  if (tier === 1) {
    const a = randInt(r, 2, 4), b = a + randInt(r, 1, 3), years = randInt(r, 2, 5);
    const diff = (P * (b - a) * years) / 100;
    return {
      prompt: bi((f) => f.t(`Account A pays ${f.N(a)}% simple interest per year and Account B pays ${f.N(b)}%. You save ${f.N(P)} dollars for ${f.N(years)} years. How many more dollars of interest does Account B pay?`, `Le compte A verse un intérêt simple de ${f.N(a)} % par année et le compte B, ${f.N(b)} %. Tu épargnes ${f.N(P)} dollars pendant ${f.N(years)} ans. Combien de dollars d'intérêt de plus le compte B verse-t-il ?`)),
      answer: diff, category: 'AP',
      wrong: [[b - a, t('That is the difference in the rates. Find the difference in dollars: apply the rate difference to the amount and the years.', 'C\'est la différence des taux. Trouve la différence en dollars : applique la différence des taux au montant et aux années.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`Interest A: ${f.N(P)} × ${f.N(a)}% × ${f.N(years)} = ${f.N((P * a * years) / 100)}. Interest B: ${f.N(P)} × ${f.N(b)}% × ${f.N(years)} = ${f.N((P * b * years) / 100)}.`, `Intérêt A : ${f.N(P)} × ${f.N(a)} % × ${f.N(years)} = ${f.N((P * a * years) / 100)}. Intérêt B : ${f.N(P)} × ${f.N(b)} % × ${f.N(years)} = ${f.N((P * b * years) / 100)}.`)), bi((f) => f.t(`Difference: ${f.N((P * b * years) / 100)} − ${f.N((P * a * years) / 100)} = ${f.N(diff)} dollars.`, `Différence : ${f.N((P * b * years) / 100)} − ${f.N((P * a * years) / 100)} = ${f.N(diff)} dollars.`))],
      nudge: t('Work out the interest each account pays, then subtract.', 'Calcule l\'intérêt que verse chaque compte, puis soustrais.'),
    };
  }
  if (tier === 2) {
    const a = randInt(r, 4, 8), b = a + randInt(r, 2, 6), years = randInt(r, 2, 4);
    const diff = (P * (b - a) * years) / 100;
    return {
      prompt: bi((f) => f.t(`You borrow ${f.N(P)} dollars for ${f.N(years)} years. Loan A charges ${f.N(a)}% simple interest per year and Loan B charges ${f.N(b)}%. How many more dollars does Loan B cost in interest?`, `Tu empruntes ${f.N(P)} dollars pendant ${f.N(years)} ans. Le prêt A porte un intérêt simple de ${f.N(a)} % par année et le prêt B, ${f.N(b)} %. Combien de dollars d'intérêt de plus le prêt B coûte-t-il ?`)),
      answer: diff, category: 'AP',
      wrong: [[(P * b * years) / 100, t('That is the whole interest on Loan B. The question asks how much more it costs than Loan A.', 'C\'est tout l\'intérêt du prêt B. La question demande combien il coûte de plus que le prêt A.'), 1]] as Wrong,
      steps: [bi((f) => f.t(`The rates differ by ${f.N(b)} − ${f.N(a)} = ${f.N(b - a)}%.`, `Les taux diffèrent de ${f.N(b)} − ${f.N(a)} = ${f.N(b - a)} %.`)), bi((f) => f.t(`${f.N(b - a)}% of ${f.N(P)} for ${f.N(years)} years: ${f.N(P)} × ${f.N(b - a)}% × ${f.N(years)} = ${f.N(diff)} dollars.`, `${f.N(b - a)} % de ${f.N(P)} pendant ${f.N(years)} ans : ${f.N(P)} × ${f.N(b - a)} % × ${f.N(years)} = ${f.N(diff)} dollars.`))],
      nudge: t('You can work with the difference in the rates, or find both interests and subtract.', 'Tu peux utiliser la différence des taux, ou trouver les deux intérêts et soustraire.'),
    };
  }
  const rate = pick(r, [5, 10, 20]);
  const P2 = randInt(r, 1, 10) * 100;
  const simple = (P2 * rate * 2) / 100;
  const comp = r6((P2 / 100) * ((100 + rate) ** 2 / 100) - P2);
  return {
    prompt: bi((f) => f.t(`Two accounts each start with ${f.N(P2)} dollars and pay ${f.N(rate)}% a year. Account A pays simple interest and Account B compounds once a year. How many more dollars of interest does Account B pay after 2 years?`, `Deux comptes commencent chacun avec ${f.N(P2)} dollars et versent ${f.N(rate)} % par année. Le compte A verse un intérêt simple et le compte B, un intérêt composé une fois par année. Combien de dollars d'intérêt de plus le compte B verse-t-il après 2 ans ?`)),
    answer: r6(comp - simple), category: 'TH',
    wrong: [[comp, t('That is all the interest Account B pays. The question asks how much more it pays than Account A.', 'C\'est tout l\'intérêt que verse le compte B. La question demande combien il verse de plus que le compte A.'), 1]] as Wrong,
    steps: [bi((f) => f.t(`Account A: ${f.N(P2)} × ${f.N(rate)}% × 2 = ${f.N(simple)}. Account B: year 1 interest ${f.N((P2 * rate) / 100)}, then ${f.N(rate)}% of ${f.N(P2 + (P2 * rate) / 100)} the next year, which gives ${f.N(comp)} in total.`, `Compte A : ${f.N(P2)} × ${f.N(rate)} % × 2 = ${f.N(simple)}. Compte B : intérêt de l\'année 1 ${f.N((P2 * rate) / 100)}, puis ${f.N(rate)} % de ${f.N(P2 + (P2 * rate) / 100)} l\'année suivante, ce qui donne ${f.N(comp)} au total.`)), bi((f) => f.t(`Difference: ${f.N(comp)} − ${f.N(simple)} = ${f.N(r6(comp - simple))} dollars.`, `Différence : ${f.N(comp)} − ${f.N(simple)} = ${f.N(r6(comp - simple))} dollars.`))],
    nudge: t('Find the total interest in each account after 2 years, then subtract.', 'Trouve l\'intérêt total de chaque compte après 2 ans, puis soustrais.'),
  };
});
