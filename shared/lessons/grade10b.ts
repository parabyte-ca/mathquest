// Lessons for the Grade 10 expectations added late: verifying properties of figures with coordinates (MPM2D B3) and reading graphs (MFM2P C3).
import type { Lesson } from './types.js';
import type { Visual } from '../items/types.js';
import { t } from '../generators/kit.js';
import { graphVisual } from '../generators/graphs10.js';

const d = (term: [string, string], text: [string, string], visual?: Visual) => ({ term: t(...term), text: t(...text), ...(visual ? { visual } : {}) });
const ex = (title: [string, string], ...steps: ([string, string] | [string, string, Visual])[]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(s[0], s[1]), ...(s[2] ? { visual: s[2] } : {}) })) });
const grid = (pts: [string, number, number][]): Visual => ({ type: 'plane', size: 10, points: pts.map(([label, x, y]) => ({ x, y, label })) });

export const GRADE10B_LESSONS: Lesson[] = [
  {
    id: 'L.g10.verify-figures',
    skills: ['MS.G10.MPM2D.B3.1.a', 'MS.G10.MPM2D.B3.2.a', 'MS.G10.MPM2D.B3.3.a'],
    title: t('Verifying properties of triangles and quadrilaterals', 'Vérifier des propriétés de triangles et de quadrilatères'),
    intro: t('Coordinates let you check a geometry fact with numbers. The midpoint formula, the distance formula and slopes are all you need to test midsegments, medians and diagonals.', 'Les coordonnées permettent de vérifier un fait de géométrie avec des nombres. La formule du milieu, la formule de distance et les pentes suffisent pour tester des segments joignant des milieux, des médianes et des diagonales.'),
    definitions: [
      d(['Midsegment', 'Segment joignant les milieux'], ['A midsegment joins the midpoints of two sides of a triangle. It is parallel to the third side and half as long.', 'Un segment joignant les milieux de deux côtés d\'un triangle est parallèle au troisième côté et deux fois plus court.'], grid([['A', 0, 0], ['B', 6, 8], ['C', 4, 2]])),
      d(['Median and centroid', 'Médiane et centre de gravité'], ['A median joins a vertex to the midpoint of the opposite side. The three medians meet at the centroid, whose coordinates are the averages of the three vertices.', 'Une médiane joint un sommet au milieu du côté opposé. Les trois médianes se rencontrent au centre de gravité, dont les coordonnées sont les moyennes de celles des trois sommets.']),
      d(['Diagonals of a quadrilateral', 'Diagonales d\'un quadrilatère'], ['If the diagonals bisect each other it is a parallelogram. Add equal diagonals for a rectangle, perpendicular diagonals for a rhombus, and both for a square.', 'Si les diagonales se coupent en leur milieu, c\'est un parallélogramme. Avec des diagonales égales, c\'est un rectangle ; perpendiculaires, un losange ; les deux, un carré.']),
      d(['The three tools', 'Les trois outils'], ['Midpoint: average the coordinates. Length: the distance formula. Parallel or perpendicular: compare slopes (equal for parallel, product −1 for perpendicular).', 'Milieu : moyenne des coordonnées. Longueur : formule de distance. Parallèle ou perpendiculaire : compare les pentes (égales si parallèles, produit −1 si perpendiculaires).']),
    ],
    examples: [
      ex(['Example 1: a midsegment', 'Exemple 1 : un segment joignant les milieux'], ['Triangle A(0, 0), B(6, 8), C(4, 2). The midpoint of AC is M(2, 1) and the midpoint of BC is N(5, 5).', 'Triangle A(0, 0), B(6, 8), C(4, 2). Le milieu de AC est M(2, 1) et le milieu de BC est N(5, 5).', grid([['A', 0, 0], ['B', 6, 8], ['C', 4, 2], ['M', 2, 1], ['N', 5, 5]])], ['MN = √(3² + 4²) = 5 and AB = √(6² + 8²) = 10, so MN is half of AB. Both slopes are 4/3, so MN is parallel to AB.', 'MN = √(3² + 4²) = 5 et AB = √(6² + 8²) = 10 : MN est la moitié de AB. Les deux pentes valent 4/3 : MN est parallèle à AB.']),
      ex(['Example 2: a median and the centroid', 'Exemple 2 : une médiane et le centre de gravité'], ['Triangle A(1, 1), B(6, 2), C(2, 8). The midpoint of BC is D(4, 5). The median AD has length √(3² + 4²) = 5.', 'Triangle A(1, 1), B(6, 2), C(2, 8). Le milieu de BC est D(4, 5). La médiane AD mesure √(3² + 4²) = 5.'], ['The centroid G has x-coordinate (1 + 6 + 2) ÷ 3 = 3 and y-coordinate (1 + 2 + 8) ÷ 3 = 11/3.', 'Le centre de gravité G a pour abscisse (1 + 6 + 2) ÷ 3 = 3 et pour ordonnée (1 + 2 + 8) ÷ 3 = 11/3.']),
      ex(['Example 3: naming a quadrilateral', 'Exemple 3 : nommer un quadrilatère'], ['A(8, 9), B(10, 5), C(2, 1), D(0, 5). The midpoint of AC is (5, 5) and the midpoint of BD is (5, 5), so the diagonals bisect each other: a parallelogram.', 'A(8, 9), B(10, 5), C(2, 1), D(0, 5). Le milieu de AC est (5, 5) et le milieu de BD est (5, 5) : les diagonales se coupent en leur milieu, c\'est un parallélogramme.', grid([['A', 8, 9], ['B', 10, 5], ['C', 2, 1], ['D', 0, 5]])], ['AC = √(6² + 8²) = 10 and BD = 10, so the diagonals are equal. The slope of AC is 4/3 and BD is flat, so they are not perpendicular. It is a rectangle, not a rhombus.', 'AC = √(6² + 8²) = 10 et BD = 10 : les diagonales sont égales. La pente de AC est 4/3 et BD est horizontale : elles ne sont pas perpendiculaires. C\'est un rectangle, pas un losange.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.B3.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.read-graphs',
    skills: ['MS.G10.MFM2P.C3.1.a', 'MS.G10.MFM2P.C3.2.a'],
    title: t('Reading and interpreting graphs of a quadratic relation', 'Lire et interpréter des graphiques d\'une relation du second degré'),
    intro: t('A graph shows how one quantity changes with another. For a ball thrown into the air, the curve tells you how high it goes, when it gets there and when it lands, without any algebra.', 'Un graphique montre comment une quantité change avec une autre. Pour une balle lancée en l\'air, la courbe indique la hauteur atteinte, quand, et quand elle retombe, sans algèbre.'),
    definitions: [
      d(['Reading the axes', 'Lire les axes'], ['The horizontal axis is time t and the vertical axis is height h. A point on the curve pairs a time with a height.', 'L\'axe horizontal est le temps t et l\'axe vertical est la hauteur h. Un point de la courbe associe un temps à une hauteur.'], graphVisual(5, 2, 3)),
      d(['Key points', 'Points clés'], ['The top of the curve is the greatest height, and the time straight below it is when it is reached. Where the curve meets the vertical axis is the starting height. Where it meets the time axis the height is 0.', 'Le sommet de la courbe est la plus grande hauteur, et le temps juste en dessous est le moment où elle est atteinte. Là où la courbe rencontre l\'axe vertical, c\'est la hauteur de départ. Là où elle rencontre l\'axe du temps, la hauteur est 0.']),
      d(['A value at a time', 'Une valeur à un moment donné'], ['Find the time on the bottom axis, go straight up to the curve, then across to the height.', 'Trouve le temps sur l\'axe du bas, monte jusqu\'à la courbe, puis lis la hauteur sur l\'axe vertical.']),
      d(['How long above a height', 'Combien de temps au-dessus d\'une hauteur'], ['Draw across at that height. The curve crosses it twice, so the time between the two crossings is how long the height is at least that much.', 'Trace une ligne à cette hauteur. La courbe la croise deux fois : le temps entre les deux croisements est la durée pendant laquelle la hauteur est au moins celle-là.']),
    ],
    examples: [
      ex(['Example 1: key points', 'Exemple 1 : points clés'], ['This curve is the height of a ball. The top is at h = 45 m, at t = 2 s.', 'Cette courbe est la hauteur d\'une balle. Le sommet est à h = 45 m, à t = 2 s.', graphVisual(5, 2, 3)], ['The ball started at h = 25 m (where the curve meets the vertical axis) and lands at t = 5 s (where it meets the time axis).', 'La balle est partie de h = 25 m (là où la courbe rencontre l\'axe vertical) et retombe à t = 5 s (là où elle rencontre l\'axe du temps).']),
      ex(['Example 2: a height at a time', 'Exemple 2 : une hauteur à un moment donné'], ['What is the height after 1 second? Find t = 1 on the bottom axis and go up to the curve.', 'Quelle est la hauteur après 1 seconde ? Trouve t = 1 sur l\'axe du bas et monte jusqu\'à la courbe.'], ['Reading across, h = 40 m.', 'En lisant vers l\'axe vertical, h = 40 m.']),
      ex(['Example 3: how long above a height', 'Exemple 3 : combien de temps au-dessus d\'une hauteur'], ['For how long is the ball at least 40 m high? Draw across at h = 40: the curve crosses it at t = 1 and t = 3.', 'Pendant combien de temps la balle est-elle à au moins 40 m ? Trace une ligne à h = 40 : la courbe la croise à t = 1 et à t = 3.'], ['The time between is 3 − 1 = 2 seconds.', 'Le temps entre les deux est de 3 − 1 = 2 secondes.']),
    ],
    tryIt: { skill: 'MS.G10.MFM2P.C3.1.a', tier: 1, seed: 2 },
  },
];
