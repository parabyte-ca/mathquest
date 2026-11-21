// Lessons for Grade 11 trigonometry (MCR3U D and MCF3M C) and the MCF3M quadratics, exponents and finance skills.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE11B_LESSONS: Lesson[] = [
  {
    id: 'L.g11.trig-ratios',
    skills: ['MS.G11.MCR3U.D1.1.a', 'MS.G11.MCR3U.D2.1.a', 'MS.G11.MCR3U.D3.1.a'],
    title: t('Exact values, reciprocal ratios and identities', 'Valeurs exactes, rapports inverses et identités'),
    intro: t('For the special angles 30°, 45° and 60° the trigonometric ratios have exact values you can write without a calculator. Reciprocal ratios and identities let you rewrite and simplify.', 'Pour les angles spéciaux 30°, 45° et 60°, les rapports trigonométriques ont des valeurs exactes qu\'on peut écrire sans calculatrice. Les rapports inverses et les identités permettent de réécrire et de simplifier.'),
    definitions: [
      d(['Exact values', 'Valeurs exactes'], ['Sine of 30°, 45°, 60° is 1/2, √2/2, √3/2. Cosine of the same angles goes the other way round. Tangent is 1/√3, 1, √3. For other angles up to 360°, use the reference angle and the sign of the quadrant.', 'Le sinus de 30°, 45°, 60° vaut 1/2, √2/2, √3/2. Le cosinus des mêmes angles va dans l\'autre sens. La tangente vaut 1/√3, 1, √3. Pour les autres angles jusqu\'à 360°, utilise l\'angle de référence et le signe du quadrant.']),
      d(['Signs by quadrant', 'Signes selon le quadrant'], ['Sine is positive in quadrants I and II. Cosine is positive in I and IV. Tangent is positive in I and III. All three are positive in quadrant I.', 'Le sinus est positif aux quadrants I et II. Le cosinus est positif aux quadrants I et IV. La tangente est positive aux quadrants I et III. Les trois sont positifs au quadrant I.']),
      d(['Reciprocal ratios', 'Rapports inverses'], ['The reciprocal ratios are csc θ = 1 ÷ sin θ, sec θ = 1 ÷ cos θ, and cot θ = 1 ÷ tan θ = cos θ ÷ sin θ.', 'Les rapports inverses sont csc θ = 1 ÷ sin θ, sec θ = 1 ÷ cos θ et cot θ = 1 ÷ tan θ = cos θ ÷ sin θ.']),
      d(['Identities', 'Identités'], ['tan x = sin x ÷ cos x, and sin²x + cos²x = 1. From the second: sin²x = 1 − cos²x and cos²x = 1 − sin²x.', 'tan x = sin x ÷ cos x, et sin²x + cos²x = 1. De la seconde : sin²x = 1 − cos²x et cos²x = 1 − sin²x.']),
    ],
    examples: [
      ex(['Example 1: exact value', 'Exemple 1 : valeur exacte'], ['Find the exact value of cos 150°. The reference angle is 30°, and cos 30° = √3/2.', 'Trouve la valeur exacte de cos 150°. L\'angle de référence est 30° et cos 30° = √3/2.'], ['150° is in quadrant II, where cosine is negative, so the answer is −√3/2.', '150° est au quadrant II, où le cosinus est négatif : la réponse est −√3/2.']),
      ex(['Example 2: a reciprocal', 'Exemple 2 : un inverse'], ['If sin θ = 3/5 and θ is acute, then cos θ = 4/5 (a 3-4-5 triangle).', 'Si sin θ = 3/5 et que θ est aigu, alors cos θ = 4/5 (triangle 3-4-5).'], ['So sec θ = 5/4 = 1.25.', 'Donc sec θ = 5/4 = 1,25.']),
      ex(['Example 3: an identity', 'Exemple 3 : une identité'], ['Simplify tan x cos x. Replace tan x by sin x ÷ cos x.', 'Simplifie tan x cos x. Remplace tan x par sin x ÷ cos x.'], ['The cos x cancels, leaving sin x.', 'Le cos x se simplifie : il reste sin x.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.D1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.trig-laws',
    skills: ['MS.G11.MCR3U.D4.1.a', 'MS.G11.MCR3U.D4.2.a', 'MS.G11.MCR3U.D5.1.a', 'MS.G11.MCF3M.C1.1.a', 'MS.G11.MCF3M.C1.2.a', 'MS.G11.MCF3M.C1.3.a', 'MS.G11.MCF3M.C2.1.a'],
    title: t('Triangles, the sine and cosine laws, and sine waves', 'Triangles, lois des sinus et des cosinus, et ondes sinusoïdales'),
    intro: t('The sine law and the cosine law solve any triangle. A sine wave y = a sin(k(x − d)) + c repeats, and its numbers tell you how high, how low, how long a cycle is, and where it starts.', 'La loi des sinus et la loi des cosinus résolvent n\'importe quel triangle. Une onde sinusoïdale y = a sin(k(x − d)) + c se répète, et ses nombres indiquent sa hauteur, sa profondeur, la durée d\'un cycle et son point de départ.'),
    definitions: [
      d(['The laws', 'Les lois'], ['Sine law: a ÷ sin A = b ÷ sin B. Cosine law: c² = a² + b² − 2ab cos C. Both work for obtuse angles; the cosine of an obtuse angle is negative.', 'Loi des sinus : a ÷ sin A = b ÷ sin B. Loi des cosinus : c² = a² + b² − 2ab cos C. Les deux valent pour des angles obtus ; le cosinus d\'un angle obtus est négatif.']),
      d(['The ambiguous case', 'Le cas ambigu'], ['Given angle A and sides a and b (side a opposite A), find the height h = b sin A. If a < h there is no triangle. If a = h, or a ≥ b, there is one. If h < a < b there are two. If A is obtuse there is one triangle only when a > b.', 'Avec l\'angle A et les côtés a et b (le côté a opposé à A), trouve la hauteur h = b sin A. Si a < h, il n\'y a pas de triangle. Si a = h, ou a ≥ b, il y en a un. Si h < a < b, il y en a deux. Si A est obtus, il y a un triangle seulement quand a > b.']),
      d(['Two right triangles', 'Deux triangles rectangles'], ['When you see a height from two points in line with it, write each ground distance as h ÷ tan θ. The two distances differ by the gap between the points.', 'Quand on voit une hauteur depuis deux points alignés avec elle, écris chaque distance au sol sous la forme h ÷ tan θ. Les deux distances diffèrent de l\'écart entre les points.']),
      d(['Sine waves', 'Ondes sinusoïdales'], ['In y = a sin(k(x − d)) + c: amplitude |a|, midline y = c, maximum c + |a|, minimum c − |a|, period 360° ÷ k, and a shift of d to the right.', 'Dans y = a sin(k(x − d)) + c : amplitude |a|, axe médian y = c, maximum c + |a|, minimum c − |a|, période 360° ÷ k et déplacement de d vers la droite.']),
    ],
    examples: [
      ex(['Example 1: how many triangles', 'Exemple 1 : combien de triangles'], ['A = 30°, a = 7, b = 10. The height is 10 sin 30° = 5.', 'A = 30°, a = 7, b = 10. La hauteur est 10 sin 30° = 5.'], ['Since 5 < 7 < 10, there are two triangles.', 'Comme 5 < 7 < 10, il y a deux triangles.']),
      ex(['Example 2: an obtuse angle', 'Exemple 2 : un angle obtus'], ['Take a = 6, b = 8 and C = 120°. Then c² = 36 + 64 − 2(6)(8)cos 120° = 100 + 48 = 148.', 'Prends a = 6, b = 8 et C = 120°. Alors c² = 36 + 64 − 2(6)(8)cos 120° = 100 + 48 = 148.'], ['So c is about 12.2.', 'Donc c vaut environ 12,2.']),
      ex(['Example 3: a sine wave', 'Exemple 3 : une onde sinusoïdale'], ['y = 4 sin(3(x − 20°)) + 6. The amplitude is 4 and the midline is 6.', 'y = 4 sin(3(x − 20°)) + 6. L\'amplitude est 4 et l\'axe médian est 6.'], ['The maximum is 10, the minimum is 2 and the period is 360° ÷ 3 = 120°.', 'Le maximum est 10, le minimum est 2 et la période est 360° ÷ 3 = 120°.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.D4.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mcf-quadratics',
    skills: ['MS.G11.MCF3M.A1.1.a', 'MS.G11.MCF3M.A1.2.a', 'MS.G11.MCF3M.A1.3.a', 'MS.G11.MCF3M.A2.1.a', 'MS.G11.MCF3M.A2.2.a', 'MS.G11.MCF3M.A3.1.a', 'MS.G11.MCF3M.A3.2.a', 'MS.G11.MCF3M.A4.1.a'],
    title: t('Factoring, solving and the forms of a quadratic', 'Factorisation, résolution et formes d\'un polynôme du second degré'),
    intro: t('A quadratic function can be written in standard, factored or vertex form. Each form shows something at a glance, and you can move between them by expanding, factoring and completing the square.', 'Une fonction du second degré peut s\'écrire sous forme standard, factorisée ou canonique. Chaque forme montre quelque chose au premier coup d\'œil, et on passe de l\'une à l\'autre en développant, en factorisant et en complétant le carré.'),
    definitions: [
      d(['Factoring patterns', 'Modèles de factorisation'], ['Difference of squares: a² − b² = (a − b)(a + b). Perfect square: a² + 2ab + b² = (a + b)². With a leading coefficient other than 1, multiply a × c, find two numbers that multiply to it and add to b, split the middle term, and group.', 'Différence de carrés : a² − b² = (a − b)(a + b). Carré parfait : a² + 2ab + b² = (a + b)². Avec un premier coefficient différent de 1, multiplie a × c, trouve deux nombres de ce produit et de somme b, sépare le terme du milieu et regroupe.']),
      d(['Quadratic formula', 'Formule quadratique'], ['x = (−b ± √(b² − 4ac)) ÷ 2a. The discriminant b² − 4ac tells how many roots: two if positive, one if zero, none if negative.', 'x = (−b ± √(b² − 4ac)) ÷ 2a. Le discriminant b² − 4ac indique le nombre de racines : deux s\'il est positif, une s\'il est nul, aucune s\'il est négatif.']),
      d(['Domain and range', 'Domaine et codomaine'], ['The domain of a quadratic is all real numbers. For y = a(x − h)² + k the range is y ≥ k if a is positive, and y ≤ k if a is negative. On a closed interval, check the vertex and both ends.', 'Le domaine d\'une fonction du second degré est l\'ensemble des réels. Pour y = a(x − h)² + k, le codomaine est y ≥ k si a est positif, et y ≤ k si a est négatif. Sur un intervalle fermé, vérifie le sommet et les deux extrémités.']),
      d(['Vertex and standard form', 'Forme canonique et forme standard'], ['Expand a(x − h)² + k to get b = −2ah and c = ah² + k. To go back, the vertex is at x = −b ÷ 2a, or complete the square: factor a from the x terms, add and subtract the square of half of b ÷ a.', 'Développe a(x − h)² + k pour obtenir b = −2ah et c = ah² + k. Pour revenir, le sommet est à x = −b ÷ 2a, ou complète le carré : mets a en facteur dans les termes en x, ajoute et retire le carré de la moitié de b ÷ a.']),
    ],
    examples: [
      ex(['Example 1: a perfect square', 'Exemple 1 : un carré parfait'], ['Factor 4x² + 12x + 9. The first term is (2x)² and the last is 3². The middle term 12x is 2 × 2x × 3.', 'Factorise 4x² + 12x + 9. Le premier terme est (2x)² et le dernier est 3². Le terme du milieu 12x vaut 2 × 2x × 3.'], ['So it is (2x + 3)².', 'C\'est donc (2x + 3)².']),
      ex(['Example 2: completing the square', 'Exemple 2 : compléter le carré'], ['Write y = 2x² + 12x + 5 in vertex form. Factor 2 from the x terms: 2(x² + 6x) + 5. Half of 6 is 3.', 'Écris y = 2x² + 12x + 5 sous forme canonique. Mets 2 en facteur dans les termes en x : 2(x² + 6x) + 5. La moitié de 6 est 3.'], ['2(x + 3)² − 18 + 5 = 2(x + 3)² − 13, so the vertex is (−3, −13).', '2(x + 3)² − 18 + 5 = 2(x + 3)² − 13 : le sommet est (−3, −13).']),
    ],
    tryIt: { skill: 'MS.G11.MCF3M.A4.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mcf-exponents-finance',
    skills: ['MS.G11.MCF3M.B1.1.a', 'MS.G11.MCF3M.B1.2.a', 'MS.G11.MCF3M.B2.1.a', 'MS.G11.MCF3M.B2.2.a', 'MS.G11.MCF3M.B2.3.a'],
    title: t('Exponent rules, interest and annuities', 'Règles des exposants, intérêt et rentes'),
    intro: t('Exponent rules make big calculations short, and the same powers drive compound interest and annuities.', 'Les règles des exposants raccourcissent les gros calculs, et les mêmes puissances pilotent l\'intérêt composé et les rentes.'),
    definitions: [
      d(['Exponent rules', 'Règles des exposants'], ['Same base: add exponents when multiplying, subtract when dividing, multiply exponents for a power of a power. A power of 1/n is the nth root. A negative exponent means a reciprocal.', 'Même base : additionne les exposants en multipliant, soustrais-les en divisant, multiplie-les pour une puissance de puissance. Une puissance 1/n est la racine n-ième. Un exposant négatif signifie un inverse.']),
      d(['Simple and compound interest', 'Intérêt simple et intérêt composé'], ['Simple interest is P × i × n. Compound interest is P(1 + i)ⁿ − P, because each period\'s interest also earns interest, so it grows faster.', 'L\'intérêt simple est P × i × n. L\'intérêt composé est P(1 + i)ⁿ − P, parce que l\'intérêt de chaque période rapporte aussi des intérêts : il croît plus vite.']),
      d(['Annuities', 'Rentes'], ['For equal payments R at the end of each period, FV = R((1 + i)ⁿ − 1) ÷ i. To find R from FV, divide by the annuity factor ((1 + i)ⁿ − 1) ÷ i.', 'Pour des versements égaux R à la fin de chaque période, FV = R((1 + i)ⁿ − 1) ÷ i. Pour trouver R à partir de FV, divise par le facteur de rente ((1 + i)ⁿ − 1) ÷ i.']),
    ],
    examples: [
      ex(['Example 1: exponent rules', 'Exemple 1 : règles des exposants'], ['Evaluate 2 to the 5, times 2 to the 3, divided by 2 to the 4. Add the top exponents: 8. Subtract 4: 4.', 'Évalue 2 à la 5, fois 2 à la 3, divisé par 2 à la 4. Additionne les exposants du haut : 8. Soustrais 4 : 4.'], ['So the answer is 2 to the 4, which is 16.', 'La réponse est donc 2 à la 4, soit 16.']),
      ex(['Example 2: compared', 'Exemple 2 : comparaison'], ['1000 dollars at 10% for 3 years. Simple interest: 1000 × 0.1 × 3 = 300.', '1000 dollars à 10 % pendant 3 ans. Intérêt simple : 1000 × 0,1 × 3 = 300.'], ['Compound interest: 1000 × 1.1³ − 1000 = 331, which is 31 dollars more.', 'Intérêt composé : 1000 × 1,1³ − 1000 = 331, soit 31 dollars de plus.']),
    ],
    tryIt: { skill: 'MS.G11.MCF3M.B1.2.a', tier: 1, seed: 2 },
  },
];
