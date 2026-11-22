// Lessons for Grade 12 College Technology (MCT4C): exponential and polynomial functions, trigonometry, and applications of geometry.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE12C_LESSONS: Lesson[] = [
  {
    id: 'L.g12.mct-exponents',
    skills: ['MS.G12.MCT4C.A1.1.a', 'MS.G12.MCT4C.A2.1.a', 'MS.G12.MCT4C.A2.2.a'],
    title: t('Exponential models, equations and logarithms', 'Modèles exponentiels, équations et logarithmes'),
    intro: t('Things that double, halve or change by a fixed percent follow an exponential model. To find an unknown exponent you can match bases, or use a logarithm.', 'Ce qui double, diminue de moitié ou change d\'un pourcentage fixe suit un modèle exponentiel. Pour trouver un exposant inconnu, on peut égaler les bases ou utiliser un logarithme.'),
    definitions: [
      d(['Growth and decay', 'Croissance et décroissance'], ['Final amount = start × factor to the power of the number of periods. A doubling time of d means the amount is multiplied by 2 every d units of time.', 'Montant final = départ × facteur puissance le nombre de périodes. Un temps de doublement d signifie que le montant est multiplié par 2 toutes les d unités de temps.']),
      d(['Common bases', 'Bases communes'], ['If both sides can be written as powers of the same base, the exponents are equal: 3ˣ = 3⁴ means x = 4.', 'Si les deux membres s\'écrivent comme des puissances de la même base, les exposants sont égaux : 3ˣ = 3⁴ signifie x = 4.']),
      d(['Logarithms', 'Logarithmes'], ['log_b N is the exponent you put on b to get N, so log₂ 32 = 5. To solve bˣ = N, use x = log N ÷ log b on a calculator.', 'log_b N est l\'exposant à mettre sur b pour obtenir N, donc log₂ 32 = 5. Pour résoudre bˣ = N, utilise x = log N ÷ log b à la calculatrice.']),
    ],
    examples: [
      ex(['Example 1: doubling', 'Exemple 1 : doublement'], ['200 bacteria double every 4 hours. In 12 hours there are 12 ÷ 4 = 3 doublings.', '200 bactéries doublent toutes les 4 heures. En 12 heures, il y a 12 ÷ 4 = 3 doublements.'], ['200 × 2³ = 200 × 8 = 1600 bacteria.', '200 × 2³ = 200 × 8 = 1600 bactéries.']),
      ex(['Example 2: common bases', 'Exemple 2 : bases communes'], ['Solve 2ˣ⁺¹ = 32. Write 32 as 2⁵.', 'Résous 2ˣ⁺¹ = 32. Écris 32 sous la forme 2⁵.'], ['The exponents match: x + 1 = 5, so x = 4.', 'Les exposants sont égaux : x + 1 = 5, donc x = 4.']),
      ex(['Example 3: a logarithm', 'Exemple 3 : un logarithme'], ['Solve 5ˣ = 8. The bases cannot be matched, so x = log 8 ÷ log 5.', 'Résous 5ˣ = 8. On ne peut pas égaler les bases : x = log 8 ÷ log 5.'], ['That is 0.9031 ÷ 0.6990, so x is about 1.29.', 'Cela donne 0,9031 ÷ 0,6990 : x vaut environ 1,29.']),
    ],
    tryIt: { skill: 'MS.G12.MCT4C.A1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.mct-polynomials',
    skills: ['MS.G12.MCT4C.B1.1.a', 'MS.G12.MCT4C.B1.2.a', 'MS.G12.MCT4C.B3.1.a', 'MS.G12.MCT4C.B3.2.a', 'MS.G12.MCT4C.B3.3.a'],
    title: t('Polynomial functions and technology formulas', 'Fonctions polynomiales et formules technologiques'),
    intro: t('Polynomial functions model shapes, volumes and costs. You can evaluate them, read their graphs, solve them by factoring, and rearrange the formulas used in technology.', 'Les fonctions polynomiales modélisent des formes, des volumes et des coûts. On peut les évaluer, lire leurs graphiques, les résoudre par factorisation et réarranger les formules utilisées en technologie.'),
    definitions: [
      d(['Evaluating', 'Évaluer'], ['Replace x by the number in every term, put a negative number in brackets, work out the powers, then multiply and add.', 'Remplace x par le nombre dans chaque terme, mets un nombre négatif entre parenthèses, calcule les puissances, puis multiplie et additionne.']),
      d(['Features of the graph', 'Caractéristiques du graphique'], ['The degree tells you the end behaviour and that there are at most degree − 1 turning points. The zeros are the x-intercepts; a factor (x − r) gives the zero r. The y-intercept is f(0).', 'Le degré indique le comportement aux extrémités et qu\'il y a au plus degré − 1 points de rebroussement. Les zéros sont les abscisses à l\'origine ; un facteur (x − r) donne le zéro r. L\'ordonnée à l\'origine est f(0).']),
      d(['Solving by factoring', 'Résoudre par factorisation'], ['Move everything to one side so it equals zero, take out common factors, factor, and set each factor equal to zero.', 'Mets tout d\'un côté pour que l\'expression soit égale à zéro, mets en évidence les facteurs communs, factorise et pose chaque facteur égal à zéro.']),
      d(['Rearranging formulas', 'Réarranger des formules'], ['Undo the operations in reverse order, doing the same to both sides. To isolate a squared variable, divide first and then take the square root.', 'Défais les opérations dans l\'ordre inverse, en faisant la même chose aux deux membres. Pour isoler une variable au carré, divise d\'abord puis prends la racine carrée.']),
    ],
    examples: [
      ex(['Example 1: evaluate', 'Exemple 1 : évaluer'], ['Evaluate f(x) = x³ − 2x² + 3x − 4 at x = −2. The terms are (−2)³ = −8, −2(−2)² = −8, 3(−2) = −6 and −4.', 'Évalue f(x) = x³ − 2x² + 3x − 4 en x = −2. Les termes sont (−2)³ = −8, −2(−2)² = −8, 3(−2) = −6 et −4.'], ['The sum is −8 − 8 − 6 − 4 = −26.', 'La somme est −8 − 8 − 6 − 4 = −26.']),
      ex(['Example 2: solve by factoring', 'Exemple 2 : résoudre par factorisation'], ['Solve x³ − 4x = 0. Take out x: x(x² − 4) = 0, then x(x − 2)(x + 2) = 0.', 'Résous x³ − 4x = 0. Mets x en évidence : x(x² − 4) = 0, puis x(x − 2)(x + 2) = 0.'], ['The solutions are x = 0, x = 2 and x = −2.', 'Les solutions sont x = 0, x = 2 et x = −2.']),
      ex(['Example 3: rearrange', 'Exemple 3 : réarranger'], ['The power formula P = I²R gives I² = P ÷ R, so I = √(P ÷ R).', 'La formule de puissance P = I²R donne I² = P ÷ R, donc I = √(P ÷ R).'], ['With P = 45 watts and R = 5 ohms, I = √9 = 3 amps.', 'Avec P = 45 watts et R = 5 ohms, I = √9 = 3 ampères.']),
    ],
    tryIt: { skill: 'MS.G12.MCT4C.B1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.mct-trig',
    skills: ['MS.G12.MCT4C.C1.1.a', 'MS.G12.MCT4C.C1.2.a', 'MS.G12.MCT4C.C1.3.a', 'MS.G12.MCT4C.C2.1.a', 'MS.G12.MCT4C.C3.1.a'],
    title: t('Triangles, the sine and cosine laws, and sine waves', 'Triangles, lois des sinus et des cosinus, et ondes sinusoïdales'),
    intro: t('Right-triangle ratios, the sine law and the cosine law find sides and angles for surveying and design. A sine wave describes anything that repeats, such as a wheel, a tide or an alternating current.', 'Les rapports du triangle rectangle, la loi des sinus et la loi des cosinus trouvent des côtés et des angles pour l\'arpentage et la conception. Une onde sinusoïdale décrit tout ce qui se répète, comme une roue, une marée ou un courant alternatif.'),
    definitions: [
      d(['Right triangles', 'Triangles rectangles'], ['sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, tan θ = opposite ÷ adjacent.', 'sin θ = opposé ÷ hypoténuse, cos θ = adjacent ÷ hypoténuse, tan θ = opposé ÷ adjacent.']),
      d(['The laws', 'Les lois'], ['Sine law: a ÷ sin A = b ÷ sin B, when a side and its opposite angle are known. Cosine law: c² = a² + b² − 2ab cos C, when two sides and the angle between them are known.', 'Loi des sinus : a ÷ sin A = b ÷ sin B, quand on connaît un côté et son angle opposé. Loi des cosinus : c² = a² + b² − 2ab cos C, quand on connaît deux côtés et l\'angle compris.']),
      d(['Sine waves', 'Ondes sinusoïdales'], ['In y = a sin(kx) + c: amplitude |a|, midline y = c, maximum c + |a|, minimum c − |a|, and period 360° ÷ k.', 'Dans y = a sin(kx) + c : amplitude |a|, axe médian y = c, maximum c + |a|, minimum c − |a| et période 360° ÷ k.']),
      d(['Models', 'Modèles'], ['To use a sine model, replace x by the given angle or time, then work out the sine on a calculator in degree mode.', 'Pour utiliser un modèle sinusoïdal, remplace x par l\'angle ou le temps donné, puis calcule le sinus à la calculatrice en mode degrés.']),
    ],
    examples: [
      ex(['Example 1: a right triangle', 'Exemple 1 : un triangle rectangle'], ['An angle is 35° and the hypotenuse is 10 cm. The opposite side is 10 × sin 35°.', 'Un angle est de 35° et l\'hypoténuse est de 10 cm. Le côté opposé est 10 × sin 35°.'], ['That is 10 × 0.5736, so the side is about 5.7 cm.', 'Cela donne 10 × 0,5736 : le côté mesure environ 5,7 cm.']),
      ex(['Example 2: the cosine law', 'Exemple 2 : la loi des cosinus'], ['Two sides are 7 and 9, with 50° between them. Then c² = 49 + 81 − 2(7)(9)cos 50° = 130 − 126 × 0.6428 = 49.0.', 'Deux côtés mesurent 7 et 9, avec 50° entre eux. Alors c² = 49 + 81 − 2(7)(9)cos 50° = 130 − 126 × 0,6428 = 49,0.'], ['So c is about 7.0.', 'Donc c vaut environ 7,0.']),
      ex(['Example 3: a sine wave', 'Exemple 3 : une onde sinusoïdale'], ['y = 3 sin(2x) + 1 has amplitude 3 and midline y = 1, so the maximum is 4 and the minimum is −2.', 'y = 3 sin(2x) + 1 a une amplitude de 3 et un axe médian y = 1 : le maximum est 4 et le minimum est −2.'], ['The period is 360° ÷ 2 = 180°.', 'La période est de 360° ÷ 2 = 180°.']),
    ],
    tryIt: { skill: 'MS.G12.MCT4C.C1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.mct-geometry',
    skills: ['MS.G12.MCT4C.D1.1.a', 'MS.G12.MCT4C.D2.1.a', 'MS.G12.MCT4C.D3.1.a', 'MS.G12.MCT4C.D3.2.a'],
    title: t('Forces, design problems and circle properties', 'Forces, problèmes de conception et propriétés du cercle'),
    intro: t('Vectors describe forces and travel. Right triangles solve design problems. A circle has rules about angles, chords and tangents, and arcs and sectors are fractions of the whole circle.', 'Les vecteurs décrivent des forces et des déplacements. Les triangles rectangles résolvent des problèmes de conception. Un cercle obéit à des règles sur les angles, les cordes et les tangentes, et les arcs et les secteurs sont des fractions du cercle entier.'),
    definitions: [
      d(['Forces and navigation', 'Forces et navigation'], ['Add vectors by adding their components. Two forces at right angles have a resultant R = √(a² + b²). A wind at right angles to a plane\'s heading gives the ground speed the same way.', 'Additionne les vecteurs en additionnant leurs composantes. Deux forces à angle droit ont pour résultante R = √(a² + b²). Un vent perpendiculaire au cap d\'un avion donne la vitesse au sol de la même façon.']),
      d(['Design problems', 'Problèmes de conception'], ['Split a figure into right triangles and rectangles, find missing lengths with the Pythagorean theorem, then add or subtract areas or volumes.', 'Divise une figure en triangles rectangles et en rectangles, trouve les longueurs manquantes avec le théorème de Pythagore, puis additionne ou soustrais des aires ou des volumes.']),
      d(['Circle properties', 'Propriétés du cercle'], ['A central angle is twice the inscribed angle on the same arc. A perpendicular from the centre bisects a chord. A tangent is perpendicular to the radius at the point where it touches.', 'Un angle au centre est le double de l\'angle inscrit sur le même arc. Une perpendiculaire du centre coupe une corde en deux. Une tangente est perpendiculaire au rayon au point de tangence.']),
      d(['Arcs and sectors', 'Arcs et secteurs'], ['For a central angle θ, take the fraction θ ÷ 360. Arc length = fraction × 2πr. Sector area = fraction × πr². Sector perimeter = arc + 2r.', 'Pour un angle au centre θ, prends la fraction θ ÷ 360. Longueur de l\'arc = fraction × 2πr. Aire du secteur = fraction × πr². Périmètre du secteur = arc + 2r.']),
    ],
    examples: [
      ex(['Example 1: forces', 'Exemple 1 : forces'], ['Forces of 30 N and 40 N act at right angles. The resultant is √(30² + 40²) = √2500.', 'Des forces de 30 N et 40 N agissent à angle droit. La résultante est √(30² + 40²) = √2500.'], ['The resultant force is 50 N.', 'La force résultante est de 50 N.']),
      ex(['Example 2: chord and tangent', 'Exemple 2 : corde et tangente'], ['A circle has radius 13 cm and a chord 5 cm from the centre. Half the chord is √(13² − 5²) = 12, so the chord is 24 cm.', 'Un cercle a un rayon de 13 cm et une corde à 5 cm du centre. La moitié de la corde est √(13² − 5²) = 12 : la corde mesure 24 cm.'], ['A point 13 cm from the centre of a circle of radius 5 cm has a tangent of length √(13² − 5²) = 12 cm.', 'Un point à 13 cm du centre d\'un cercle de rayon 5 cm a une tangente de longueur √(13² − 5²) = 12 cm.']),
      ex(['Example 3: arc and sector', 'Exemple 3 : arc et secteur'], ['A sector has radius 10 cm and a central angle of 90°, which is 1/4 of the circle. The arc is 1/4 × 2π × 10 = 15.7 cm.', 'Un secteur a un rayon de 10 cm et un angle au centre de 90°, soit 1/4 du cercle. L\'arc mesure 1/4 × 2π × 10 = 15,7 cm.'], ['The sector area is 1/4 × π × 10² = 78.5 cm².', 'L\'aire du secteur est de 1/4 × π × 10² = 78,5 cm².']),
    ],
    tryIt: { skill: 'MS.G12.MCT4C.D1.1.a', tier: 1, seed: 2 },
  },
];
