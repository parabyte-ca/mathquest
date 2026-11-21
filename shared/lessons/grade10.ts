// Lessons for Grade 10 (MPM2D and MFM2P) algebra: expanding and factoring, quadratic equations, systems, formulas, and lines.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE10_LESSONS: Lesson[] = [
  {
    id: 'L.g10.expand-common',
    skills: ['MS.G10.MPM2D.A3.1.a', 'MS.G10.MPM2D.A3.2.a', 'MS.G10.MFM2P.C1.1.a', 'MS.G10.MFM2P.C1.2.a'],
    title: t('Expanding and taking out a common factor', 'Développer et mettre en évidence un facteur commun'),
    intro: t('Expanding multiplies brackets out. Factoring is the reverse: it writes a sum as a product. You can always check a factoring by expanding it.', 'Développer, c\'est multiplier des parenthèses. Factoriser est l\'opération inverse : on écrit une somme sous forme de produit. On peut toujours vérifier une factorisation en la développant.'),
    definitions: [
      d(['Expanding two brackets', 'Développer deux parenthèses'], ['Multiply each term of the first bracket by each term of the second, then collect like terms. (x + 2)(x + 5) = x² + 5x + 2x + 10 = x² + 7x + 10.', 'Multiplie chaque terme de la première parenthèse par chaque terme de la seconde, puis regroupe les termes semblables. (x + 2)(x + 5) = x² + 5x + 2x + 10 = x² + 7x + 10.']),
      d(['Common factor', 'Facteur commun'], ['A common factor divides every term. Take out the greatest one: 6x² + 9x has the common factor 3x, so it is 3x(2x + 3).', 'Un facteur commun divise chaque terme. Mets en évidence le plus grand : 6x² + 9x a pour facteur commun 3x, donc c\'est 3x(2x + 3).']),
      d(['Check by expanding', 'Vérifier en développant'], ['Multiply your answer out. If you get the original expression back, the factoring is right.', 'Développe ta réponse. Si tu retrouves l\'expression de départ, la factorisation est bonne.']),
    ],
    examples: [
      ex(['Example 1: expand', 'Exemple 1 : développer'], ['Expand (x + 3)(x − 4).', 'Développe (x + 3)(x − 4).'], ['x² − 4x + 3x − 12', 'x² − 4x + 3x − 12'], ['Collect: x² − x − 12.', 'Regroupe : x² − x − 12.']),
      ex(['Example 2: a common factor', 'Exemple 2 : un facteur commun'], ['Factor 12x + 18. The greatest number dividing both is 6.', 'Factorise 12x + 18. Le plus grand nombre qui divise les deux est 6.'], ['Divide each term by 6: 2x + 3.', 'Divise chaque terme par 6 : 2x + 3.'], ['The answer is 6(2x + 3).', 'La réponse est 6(2x + 3).']),
      ex(['Example 3: a letter too', 'Exemple 3 : une lettre aussi'], ['Factor 8x² + 12x. Both terms have 4 and x in common: 4x.', 'Factorise 8x² + 12x. Les deux termes ont 4 et x en commun : 4x.'], ['Divide: 8x² ÷ 4x = 2x and 12x ÷ 4x = 3.', 'Divise : 8x² ÷ 4x = 2x et 12x ÷ 4x = 3.'], ['The answer is 4x(2x + 3).', 'La réponse est 4x(2x + 3).']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.A3.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g10.factor-trinomials',
    skills: ['MS.G10.MPM2D.A3.3.a', 'MS.G10.MPM2D.A3.4.a', 'MS.G10.MPM2D.A3.5.a', 'MS.G10.MFM2P.C1.3.a'],
    title: t('Factoring trinomials and differences of squares', 'Factoriser des trinômes et des différences de carrés'),
    intro: t('A trinomial such as x² + 7x + 10 often factors into two brackets. A difference of squares factors in one special way.', 'Un trinôme comme x² + 7x + 10 se factorise souvent en deux parenthèses. Une différence de carrés se factorise d\'une façon particulière.'),
    definitions: [
      d(['x² + bx + c', 'x² + bx + c'], ['Find two numbers that multiply to c and add to b. Then x² + bx + c = (x + p)(x + q) with those numbers p and q.', 'Trouve deux nombres de produit c et de somme b. Alors x² + bx + c = (x + p)(x + q) avec ces nombres p et q.']),
      d(['ax² + bx + c (a is not 1)', 'ax² + bx + c (a différent de 1)'], ['Multiply a × c. Find two numbers with that product that add to b. Split the middle term with them, then group in pairs.', 'Multiplie a × c. Trouve deux nombres de ce produit dont la somme est b. Sépare le terme du milieu avec eux, puis regroupe deux par deux.']),
      d(['Difference of squares', 'Différence de carrés'], ['a² − b² = (a − b)(a + b). Take the square root of each term. A sum of squares, a² + b², does not factor using integers.', 'a² − b² = (a − b)(a + b). Prends la racine carrée de chaque terme. Une somme de carrés, a² + b², ne se factorise pas avec des entiers.']),
    ],
    examples: [
      ex(['Example 1: x² + bx + c', 'Exemple 1 : x² + bx + c'], ['Factor x² + 2x − 15. Two numbers that multiply to −15 and add to 2: 5 and −3.', 'Factorise x² + 2x − 15. Deux nombres de produit −15 et de somme 2 : 5 et −3.'], ['The answer is (x − 3)(x + 5).', 'La réponse est (x − 3)(x + 5).']),
      ex(['Example 2: a is not 1', 'Exemple 2 : a différent de 1'], ['Factor 2x² + 7x + 3. a × c = 6. Two numbers that multiply to 6 and add to 7: 6 and 1.', 'Factorise 2x² + 7x + 3. a × c = 6. Deux nombres de produit 6 et de somme 7 : 6 et 1.'], ['Split: 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3).', 'Sépare : 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3).'], ['The answer is (2x + 1)(x + 3).', 'La réponse est (2x + 1)(x + 3).']),
      ex(['Example 3: difference of squares', 'Exemple 3 : différence de carrés'], ['Factor 9x² − 25. 9x² = (3x)² and 25 = 5².', 'Factorise 9x² − 25. 9x² = (3x)² et 25 = 5².'], ['The answer is (3x − 5)(3x + 5).', 'La réponse est (3x − 5)(3x + 5).']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.A3.3.a', tier: 1, seed: 4 },
  },
  {
    id: 'L.g10.solve-quadratics',
    skills: ['MS.G10.MPM2D.A3.6.a', 'MS.G10.MPM2D.A3.7.a', 'MS.G10.MPM2D.A3.8.a'],
    title: t('Solving quadratic equations', 'Résoudre des équations quadratiques'),
    intro: t('The solutions of a quadratic equation are its roots, the x-values where the graph crosses the x-axis. You can find them by factoring or with the quadratic formula, and the discriminant tells you how many there are.', 'Les solutions d\'une équation quadratique sont ses racines, les valeurs de x où le graphique coupe l\'axe des x. On peut les trouver par factorisation ou avec la formule quadratique, et le discriminant indique combien il y en a.'),
    definitions: [
      d(['Solving by factoring', 'Résoudre par factorisation'], ['Move every term to one side so the other side is 0. Factor. If a product is 0, one of the factors is 0, so set each factor equal to 0.', 'Ramène tous les termes d\'un côté pour que l\'autre soit 0. Factorise. Si un produit est nul, l\'un des facteurs est nul : pose chaque facteur égal à 0.']),
      d(['The quadratic formula', 'La formule quadratique'], ['For ax² + bx + c = 0: x = (−b ± √(b² − 4ac)) ÷ 2a. Read a, b and c with their signs.', 'Pour ax² + bx + c = 0 : x = (−b ± √(b² − 4ac)) ÷ 2a. Lis a, b et c avec leurs signes.']),
      d(['The discriminant', 'Le discriminant'], ['D = b² − 4ac. If D > 0 there are two real roots. If D = 0 there is one. If D < 0 there are none.', 'D = b² − 4ac. Si D > 0, il y a deux racines réelles. Si D = 0, il y en a une. Si D < 0, il n\'y en a aucune.']),
    ],
    examples: [
      ex(['Example 1: factoring', 'Exemple 1 : factorisation'], ['Solve x² − 5x + 6 = 0. Factor: (x − 2)(x − 3) = 0.', 'Résous x² − 5x + 6 = 0. Factorise : (x − 2)(x − 3) = 0.'], ['x − 2 = 0 or x − 3 = 0, so x = 2 or x = 3.', 'x − 2 = 0 ou x − 3 = 0, donc x = 2 ou x = 3.']),
      ex(['Example 2: the formula', 'Exemple 2 : la formule'], ['Solve 2x² − 3x − 5 = 0: a = 2, b = −3, c = −5. D = 9 + 40 = 49, and √49 = 7.', 'Résous 2x² − 3x − 5 = 0 : a = 2, b = −3, c = −5. D = 9 + 40 = 49, et √49 = 7.'], ['x = (3 ± 7) ÷ 4, so x = 2.5 or x = −1.', 'x = (3 ± 7) ÷ 4, donc x = 2,5 ou x = −1.']),
      ex(['Example 3: how many roots', 'Exemple 3 : combien de racines'], ['How many real roots does x² + 2x + 5 = 0 have? D = 4 − 20 = −16.', 'Combien de racines réelles a x² + 2x + 5 = 0 ? D = 4 − 20 = −16.'], ['D is negative, so there are no real roots.', 'D est négatif : il n\'y a aucune racine réelle.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.A3.6.a', tier: 1, seed: 5 },
  },
  {
    id: 'L.g10.complete-square',
    skills: ['MS.G10.MPM2D.A3.9.a'],
    title: t('Completing the square', 'Compléter le carré'),
    intro: t('Completing the square rewrites x² + bx + c as (x + h)² + k. It shows the lowest (or highest) point of the parabola.', 'Compléter le carré réécrit x² + bx + c sous la forme (x + h)² + k. On voit alors le point le plus bas (ou le plus haut) de la parabole.'),
    definitions: [
      d(['The number to add', 'Le nombre à ajouter'], ['Take half of the x coefficient and square it. For x² + 6x, half of 6 is 3 and 3² = 9, so x² + 6x + 9 = (x + 3)².', 'Prends la moitié du coefficient de x et élève-la au carré. Pour x² + 6x, la moitié de 6 est 3 et 3² = 9, donc x² + 6x + 9 = (x + 3)².']),
      d(['Keep it balanced', 'Garder l\'équilibre'], ['Adding a number changes the expression, so take the same number away again: x² + 6x + 4 = (x² + 6x + 9) − 9 + 4 = (x + 3)² − 5.', 'Ajouter un nombre change l\'expression : retire le même nombre : x² + 6x + 4 = (x² + 6x + 9) − 9 + 4 = (x + 3)² − 5.']),
      d(['The minimum value', 'La valeur minimale'], ['In y = (x + h)² + k the square is never negative, so the lowest value of y is k.', 'Dans y = (x + h)² + k, le carré n\'est jamais négatif : la plus petite valeur de y est k.']),
    ],
    examples: [
      ex(['Example 1: the number to add', 'Exemple 1 : le nombre à ajouter'], ['What completes x² + 10x? Half of 10 is 5, and 5² = 25.', 'Qu\'est-ce qui complète x² + 10x ? La moitié de 10 est 5, et 5² = 25.'], ['Add 25: x² + 10x + 25 = (x + 5)².', 'Ajoute 25 : x² + 10x + 25 = (x + 5)².']),
      ex(['Example 2: vertex form', 'Exemple 2 : forme canonique'], ['Write x² − 8x + 3 as (x − h)² + k. Half of −8 is −4 and (−4)² = 16.', 'Écris x² − 8x + 3 sous la forme (x − h)² + k. La moitié de −8 est −4 et (−4)² = 16.'], ['x² − 8x + 16 − 16 + 3 = (x − 4)² − 13.', 'x² − 8x + 16 − 16 + 3 = (x − 4)² − 13.'], ['So k = −13, and the minimum value of y is −13.', 'Donc k = −13, et la valeur minimale de y est −13.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.A3.9.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.systems',
    skills: ['MS.G10.MPM2D.B1.1.a', 'MS.G10.MPM2D.B1.2.a', 'MS.G10.MPM2D.B1.3.a', 'MS.G10.MFM2P.B3.1.a'],
    title: t('Solving systems of equations', 'Résoudre des systèmes d\'équations'),
    intro: t('A system is two equations with two unknowns. Its solution is the pair of numbers that makes both true, which is the point where the two lines cross.', 'Un système est formé de deux équations à deux inconnues. Sa solution est le couple de nombres qui rend les deux vraies : c\'est le point où les deux droites se croisent.'),
    definitions: [
      d(['Substitution', 'Substitution'], ['Solve one equation for a variable, such as y = 2x − 1, then put that expression in place of the variable in the other equation.', 'Isole une variable dans une équation, par exemple y = 2x − 1, puis remplace cette variable par l\'expression dans l\'autre équation.']),
      d(['Elimination', 'Élimination'], ['Make the coefficients of one variable equal or opposite (multiply an equation if needed), then add or subtract the equations to remove that variable.', 'Rends les coefficients d\'une variable égaux ou opposés (multiplie une équation au besoin), puis additionne ou soustrais les équations pour éliminer cette variable.']),
      d(['Check', 'Vérification'], ['Put both values in the original equations. Both must be true.', 'Remplace les deux valeurs dans les équations de départ. Les deux doivent être vraies.']),
    ],
    examples: [
      ex(['Example 1: substitution', 'Exemple 1 : substitution'], ['Solve y = 2x − 1 and x + y = 8. Replace y: x + (2x − 1) = 8.', 'Résous y = 2x − 1 et x + y = 8. Remplace y : x + (2x − 1) = 8.'], ['3x − 1 = 8, so x = 3 and y = 2(3) − 1 = 5.', '3x − 1 = 8, donc x = 3 et y = 2(3) − 1 = 5.']),
      ex(['Example 2: elimination', 'Exemple 2 : élimination'], ['Solve 3x + 2y = 16 and 5x − 2y = 8. The y terms are opposites, so add: 8x = 24.', 'Résous 3x + 2y = 16 et 5x − 2y = 8. Les termes en y sont opposés : additionne : 8x = 24.'], ['x = 3. Then 9 + 2y = 16, so y = 3.5.', 'x = 3. Alors 9 + 2y = 16, donc y = 3,5.']),
      ex(['Example 3: a word problem', 'Exemple 3 : un problème écrit'], ['40 tickets cost 5 dollars and 3 dollars, total 150 dollars. Let x be the 5 dollar tickets and y the 3 dollar tickets: x + y = 40 and 5x + 3y = 150.', '40 billets à 5 dollars et à 3 dollars, total 150 dollars. Soit x les billets à 5 dollars et y ceux à 3 dollars : x + y = 40 et 5x + 3y = 150.'], ['Multiply the first by 3: 3x + 3y = 120. Subtract: 2x = 30, so x = 15 and y = 25.', 'Multiplie la première par 3 : 3x + 3y = 120. Soustrais : 2x = 30, donc x = 15 et y = 25.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.B1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g10.equations-formulas',
    skills: ['MS.G10.MFM2P.B1.1.a', 'MS.G10.MFM2P.B1.2.a'],
    title: t('Equations with fractions and rearranging formulas', 'Équations avec fractions et isoler dans une formule'),
    intro: t('To solve an equation, undo the operations in reverse order. The same steps rearrange a formula to get one variable alone.', 'Pour résoudre une équation, on annule les opérations dans l\'ordre inverse. Les mêmes étapes permettent d\'isoler une variable dans une formule.'),
    definitions: [
      d(['Clear the fractions', 'Éliminer les fractions'], ['Multiply every term by a common denominator. For x/2 + x/3 = 10, multiply by 6: 3x + 2x = 60.', 'Multiplie chaque terme par un dénominateur commun. Pour x/2 + x/3 = 10, multiplie par 6 : 3x + 2x = 60.']),
      d(['Reciprocal', 'Inverse'], ['To undo multiplying by a fraction, multiply by its reciprocal: if (2/3)x = 8, then x = 8 × 3/2 = 12.', 'Pour annuler la multiplication par une fraction, multiplie par son inverse : si (2/3)x = 8, alors x = 8 × 3/2 = 12.']),
      d(['Rearranging a formula', 'Isoler dans une formule'], ['Treat the other letters like numbers. From P = 2l + 2w, subtract 2l and divide by 2: w = (P − 2l) ÷ 2.', 'Traite les autres lettres comme des nombres. De P = 2l + 2w, soustrais 2l et divise par 2 : w = (P − 2l) ÷ 2.']),
    ],
    examples: [
      ex(['Example 1: a fraction', 'Exemple 1 : une fraction'], ['Solve x/4 + 3 = 8. Subtract 3: x/4 = 5.', 'Résous x/4 + 3 = 8. Soustrais 3 : x/4 = 5.'], ['Multiply by 4: x = 20.', 'Multiplie par 4 : x = 20.']),
      ex(['Example 2: a formula', 'Exemple 2 : une formule'], ['Use d = vt to find t when d = 60 and v = 12. Divide both sides by v: t = d ÷ v.', 'Utilise d = vt pour trouver t quand d = 60 et v = 12. Divise les deux membres par v : t = d ÷ v.'], ['t = 60 ÷ 12 = 5.', 't = 60 ÷ 12 = 5.']),
    ],
    tryIt: { skill: 'MS.G10.MFM2P.B1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g10.slope-lines',
    skills: ['MS.G10.MFM2P.B2.1.a', 'MS.G10.MFM2P.B2.2.a', 'MS.G10.MFM2P.B2.3.a'],
    title: t('Slope and the equation of a line', 'La pente et l\'équation d\'une droite'),
    intro: t('The slope tells how steep a line is. In y = mx + b, m is the slope and b is the y-intercept, where the line crosses the y-axis.', 'La pente indique l\'inclinaison d\'une droite. Dans y = mx + b, m est la pente et b est l\'ordonnée à l\'origine, là où la droite coupe l\'axe des y.'),
    definitions: [
      d(['Slope', 'Pente'], ['Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁). Subtract the coordinates in the same order. Lines that go down have a negative slope.', 'Pente = montée ÷ course = (y₂ − y₁) ÷ (x₂ − x₁). Soustrais les coordonnées dans le même ordre. Les droites qui descendent ont une pente négative.']),
      d(['In a story', 'Dans une situation'], ['In C = 12n + 40, the 12 is the cost for each unit (the slope). The 40 is the amount paid once, at the start (the y-intercept).', 'Dans C = 12n + 40, le 12 est le coût pour chaque unité (la pente). Le 40 est le montant payé une seule fois, au départ (l\'ordonnée à l\'origine).']),
      d(['Horizontal and vertical lines', 'Droites horizontales et verticales'], ['A horizontal line has the same y everywhere: y = 3. A vertical line has the same x everywhere: x = 3.', 'Une droite horizontale a le même y partout : y = 3. Une droite verticale a le même x partout : x = 3.']),
    ],
    examples: [
      ex(['Example 1: slope', 'Exemple 1 : pente'], ['Find the slope through (1, 2) and (4, 11). Rise = 11 − 2 = 9 and run = 4 − 1 = 3.', 'Trouve la pente de la droite passant par (1, 2) et (4, 11). Montée = 11 − 2 = 9 et course = 4 − 1 = 3.'], ['Slope = 9 ÷ 3 = 3.', 'Pente = 9 ÷ 3 = 3.']),
      ex(['Example 2: the equation', 'Exemple 2 : l\'équation'], ['Use the slope 3 and the point (1, 2) in y = mx + b: 2 = 3(1) + b.', 'Utilise la pente 3 et le point (1, 2) dans y = mx + b : 2 = 3(1) + b.'], ['b = −1, so the equation is y = 3x − 1.', 'b = −1, donc l\'équation est y = 3x − 1.']),
    ],
    tryIt: { skill: 'MS.G10.MFM2P.B2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.parabolas',
    skills: ['MS.G10.MPM2D.A1.1.a', 'MS.G10.MPM2D.A2.1.a', 'MS.G10.MPM2D.A2.2.a', 'MS.G10.MPM2D.A2.3.a', 'MS.G10.MPM2D.A4.1.a', 'MS.G10.MPM2D.A4.2.a', 'MS.G10.MFM2P.C2.1.a', 'MS.G10.MFM2P.C2.2.a'],
    title: t('Parabolas: vertex, zeros and maximum values', 'Paraboles : sommet, racines et valeurs maximales'),
    intro: t('The graph of a quadratic relation is a parabola. Its equation can be written in different forms, and each form shows something different at a glance.', 'Le graphique d\'une relation quadratique est une parabole. Son équation peut s\'écrire sous différentes formes, et chaque forme montre quelque chose de différent au premier coup d\'œil.'),
    definitions: [
      d(['Second differences', 'Secondes différences'], ['In a table with equal steps in x, subtract neighbouring y-values to get the first differences, then subtract those. If the second differences are constant (and not 0), the relation is quadratic.', 'Dans un tableau où x avance par pas égaux, soustrais les valeurs de y voisines pour obtenir les premières différences, puis soustrais celles-ci. Si les secondes différences sont constantes (et non nulles), la relation est quadratique.']),
      d(['Vertex form', 'Forme canonique'], ['y = a(x − h)² + k. The vertex is (h, k) and the axis of symmetry is x = h. If a > 0 the parabola opens up and k is the minimum; if a < 0 it opens down and k is the maximum. The larger |a| is, the narrower the parabola.', 'y = a(x − h)² + k. Le sommet est (h, k) et l\'axe de symétrie est x = h. Si a > 0, la parabole s\'ouvre vers le haut et k est le minimum ; si a < 0, elle s\'ouvre vers le bas et k est le maximum. Plus |a| est grand, plus la parabole est étroite.']),
      d(['Factored form', 'Forme factorisée'], ['y = a(x − p)(x − q). The zeros are p and q, and the axis of symmetry is halfway between them: x = (p + q) ÷ 2. The y-intercept is the value at x = 0.', 'y = a(x − p)(x − q). Les racines sont p et q, et l\'axe de symétrie est à mi-chemin entre elles : x = (p + q) ÷ 2. L\'ordonnée à l\'origine est la valeur à x = 0.']),
    ],
    examples: [
      ex(['Example 1: vertex form', 'Exemple 1 : forme canonique'], ['y = −2(x + 3)² + 5. The bracket is (x − (−3)), so h = −3 and k = 5.', 'y = −2(x + 3)² + 5. La parenthèse est (x − (−3)), donc h = −3 et k = 5.'], ['The vertex is (−3, 5). Since a = −2 is negative, it opens down and 5 is the maximum.', 'Le sommet est (−3, 5). Comme a = −2 est négatif, elle s\'ouvre vers le bas et 5 est le maximum.']),
      ex(['Example 2: a projectile', 'Exemple 2 : un projectile'], ['A ball has height h = −5(t − 3)(t + 1). It lands when h = 0.', 'Une balle a pour hauteur h = −5(t − 3)(t + 1). Elle atterrit quand h = 0.'], ['t = 3 or t = −1. Time cannot be negative, so it lands after 3 seconds.', 't = 3 ou t = −1. Le temps ne peut pas être négatif : elle atterrit après 3 secondes.']),
      ex(['Example 3: maximum from standard form', 'Exemple 3 : maximum en forme standard'], ['R = −2x² + 24x. The vertex is at x = −b ÷ 2a = −24 ÷ (−4) = 6.', 'R = −2x² + 24x. Le sommet est à x = −b ÷ 2a = −24 ÷ (−4) = 6.'], ['R(6) = −2(36) + 144 = 72, so the greatest revenue is 72.', 'R(6) = −2(36) + 144 = 72 : le plus grand revenu est 72.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.A2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.analytic',
    skills: ['MS.G10.MPM2D.B2.1.a', 'MS.G10.MPM2D.B2.2.a', 'MS.G10.MPM2D.B2.3.a'],
    title: t('Midpoint, distance and circles', 'Milieu, distance et cercles'),
    intro: t('Coordinates let you measure and locate with numbers: the middle of a segment, the length of a segment, and a circle as an equation.', 'Les coordonnées permettent de mesurer et de situer avec des nombres : le milieu d\'un segment, sa longueur, et un cercle sous forme d\'équation.'),
    definitions: [
      d(['Midpoint', 'Milieu'], ['Average the coordinates: M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).', 'Fais la moyenne des coordonnées : M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).']),
      d(['Distance', 'Distance'], ['d = √((x₂ − x₁)² + (y₂ − y₁)²). It is the Pythagorean theorem on the horizontal and vertical changes.', 'd = √((x₂ − x₁)² + (y₂ − y₁)²). C\'est le théorème de Pythagore appliqué aux variations horizontale et verticale.']),
      d(['Circle at the origin', 'Cercle centré à l\'origine'], ['x² + y² = r². Every point on the circle is the distance r from the origin.', 'x² + y² = r². Chaque point du cercle est à la distance r de l\'origine.']),
    ],
    examples: [
      ex(['Example 1: midpoint', 'Exemple 1 : milieu'], ['The midpoint of (2, 7) and (10, 3): x = (2 + 10) ÷ 2 = 6 and y = (7 + 3) ÷ 2 = 5.', 'Le milieu de (2, 7) et (10, 3) : x = (2 + 10) ÷ 2 = 6 et y = (7 + 3) ÷ 2 = 5.'], ['The midpoint is (6, 5).', 'Le milieu est (6, 5).']),
      ex(['Example 2: distance', 'Exemple 2 : distance'], ['From (1, 2) to (6, 14): the changes are 5 and 12.', 'De (1, 2) à (6, 14) : les variations sont 5 et 12.'], ['d = √(25 + 144) = √169 = 13 units.', 'd = √(25 + 144) = √169 = 13 unités.']),
      ex(['Example 3: a circle', 'Exemple 3 : un cercle'], ['Is (3, 4) on x² + y² = 25? 9 + 16 = 25, so yes.', '(3, 4) est-il sur x² + y² = 25 ? 9 + 16 = 25, donc oui.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.B2.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g10.similar-trig',
    skills: ['MS.G10.MPM2D.C1.1.a', 'MS.G10.MPM2D.C2.1.a', 'MS.G10.MPM2D.C2.2.a', 'MS.G10.MPM2D.C2.3.a', 'MS.G10.MFM2P.A1.1.a', 'MS.G10.MFM2P.A2.1.a', 'MS.G10.MFM2P.A2.2.a'],
    title: t('Similar triangles and right-triangle trigonometry', 'Triangles semblables et trigonométrie du triangle rectangle'),
    intro: t('Similar triangles have the same shape, so their matching sides are in proportion. In a right triangle the ratios of the sides depend only on the angle, which gives sine, cosine and tangent.', 'Des triangles semblables ont la même forme : leurs côtés correspondants sont proportionnels. Dans un triangle rectangle, les rapports des côtés ne dépendent que de l\'angle, ce qui donne le sinus, le cosinus et la tangente.'),
    definitions: [
      d(['Similar triangles', 'Triangles semblables'], ['Matching sides share one scale factor. Find it from a pair of matching sides, then use it on the others.', 'Les côtés correspondants ont un même facteur d\'échelle. Trouve-le avec une paire de côtés correspondants, puis applique-le aux autres.']),
      d(['SOH CAH TOA', 'SOH CAH TOA'], ['sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, tan θ = opposite ÷ adjacent. Opposite and adjacent are named from the angle you are using.', 'sin θ = opposé ÷ hypoténuse, cos θ = adjacent ÷ hypoténuse, tan θ = opposé ÷ adjacent. L\'opposé et l\'adjacent se nomment à partir de l\'angle utilisé.']),
      d(['Finding an angle', 'Trouver un angle'], ['Use the inverse button on your calculator: if sin A = 0.6, then A = sin⁻¹(0.6) ≈ 36.9°. Keep the calculator in degree mode.', 'Utilise la touche inverse de ta calculatrice : si sin A = 0,6, alors A = sin⁻¹(0,6) ≈ 36,9°. Garde la calculatrice en mode degrés.']),
    ],
    examples: [
      ex(['Example 1: a side', 'Exemple 1 : un côté'], ['The hypotenuse is 10 cm and the angle is 30°. The opposite side: sin 30° = opp ÷ 10.', 'L\'hypoténuse mesure 10 cm et l\'angle est de 30°. Le côté opposé : sin 30° = opp ÷ 10.'], ['opp = 10 × sin 30° = 5 cm.', 'opposé = 10 × sin 30° = 5 cm.']),
      ex(['Example 2: an angle', 'Exemple 2 : un angle'], ['The opposite side is 7 and the adjacent side is 10: tan A = 7 ÷ 10.', 'Le côté opposé mesure 7 et l\'adjacent 10 : tan A = 7 ÷ 10.'], ['A = tan⁻¹(0.7) ≈ 35.0°.', 'A = tan⁻¹(0,7) ≈ 35,0°.']),
      ex(['Example 3: a height', 'Exemple 3 : une hauteur'], ['From 20 m away, the angle of elevation to a tower top is 40°. The ground distance is adjacent and the height is opposite: use tangent.', 'À 20 m de distance, l\'angle d\'élévation du sommet d\'une tour est de 40°. La distance au sol est l\'adjacent et la hauteur est l\'opposé : utilise la tangente.'], ['h = 20 × tan 40° ≈ 16.8 m.', 'h = 20 × tan 40° ≈ 16,8 m.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.C2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.laws',
    skills: ['MS.G10.MPM2D.C3.1.a', 'MS.G10.MPM2D.C3.2.a'],
    title: t('The sine law and the cosine law', 'La loi des sinus et la loi des cosinus'),
    intro: t('For triangles without a right angle, two laws connect the sides and angles. Name each side with the angle opposite it: a with A, b with B, c with C.', 'Pour les triangles sans angle droit, deux lois relient les côtés et les angles. Nomme chaque côté d\'après l\'angle qui lui est opposé : a avec A, b avec B, c avec C.'),
    definitions: [
      d(['The sine law', 'La loi des sinus'], ['a ÷ sin A = b ÷ sin B = c ÷ sin C. Use it when you know a side and its opposite angle, plus one more side or angle.', 'a ÷ sin A = b ÷ sin B = c ÷ sin C. Utilise-la quand tu connais un côté et son angle opposé, plus un autre côté ou un autre angle.']),
      d(['The cosine law', 'La loi des cosinus'], ['c² = a² + b² − 2ab cos C. Use it for two sides and the angle between them, or for all three sides. For an angle: cos C = (a² + b² − c²) ÷ 2ab.', 'c² = a² + b² − 2ab cos C. Utilise-la pour deux côtés et l\'angle entre eux, ou pour les trois côtés. Pour un angle : cos C = (a² + b² − c²) ÷ 2ab.']),
      d(['Angles of a triangle', 'Angles d\'un triangle'], ['The three angles add to 180°, so two angles give the third.', 'Les trois angles totalisent 180° : deux angles donnent le troisième.']),
    ],
    examples: [
      ex(['Example 1: the sine law', 'Exemple 1 : la loi des sinus'], ['A = 40°, B = 60°, a = 8. Then b ÷ sin 60° = 8 ÷ sin 40°.', 'A = 40°, B = 60°, a = 8. Alors b ÷ sin 60° = 8 ÷ sin 40°.'], ['b = 8 × sin 60° ÷ sin 40° ≈ 10.8.', 'b = 8 × sin 60° ÷ sin 40° ≈ 10,8.']),
      ex(['Example 2: the cosine law', 'Exemple 2 : la loi des cosinus'], ['a = 6, b = 9, C = 50°: c² = 36 + 81 − 2(6)(9)cos 50° ≈ 47.6.', 'a = 6, b = 9, C = 50° : c² = 36 + 81 − 2(6)(9)cos 50° ≈ 47,6.'], ['c ≈ 6.9.', 'c ≈ 6,9.']),
    ],
    tryIt: { skill: 'MS.G10.MPM2D.C3.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g10.imperial',
    skills: ['MS.G10.MFM2P.A3.1.a', 'MS.G10.MFM2P.A3.2.a'],
    title: t('The imperial system and converting to metric', 'Le système impérial et la conversion en métrique'),
    intro: t('Lumber, carpet and concrete are still sold in imperial units in Canada, so it helps to move between feet, inches and yards, and to convert to and from metric.', 'Le bois d\'œuvre, les tapis et le béton se vendent encore en unités impériales au Canada : il est utile de passer entre pieds, pouces et verges, et de convertir en métrique.'),
    definitions: [
      d(['Imperial lengths', 'Longueurs impériales'], ['1 foot = 12 inches and 1 yard = 3 feet. For volume, 1 cubic yard = 27 cubic feet, because 3 × 3 × 3 = 27.', '1 pied = 12 pouces et 1 verge = 3 pieds. Pour le volume, 1 verge cube = 27 pieds cubes, parce que 3 × 3 × 3 = 27.']),
      d(['Imperial and metric', 'Impérial et métrique'], ['1 inch = 2.54 cm and 1 foot = 30.48 cm. To go to a smaller unit, multiply; to go to a larger unit, divide.', '1 pouce = 2,54 cm et 1 pied = 30,48 cm. Pour aller vers une plus petite unité, multiplie ; vers une plus grande, divise.']),
    ],
    examples: [
      ex(['Example 1: feet and inches', 'Exemple 1 : pieds et pouces'], ['5 feet 3 inches in inches: 5 × 12 + 3 = 63.', '5 pieds 3 pouces en pouces : 5 × 12 + 3 = 63.']),
      ex(['Example 2: to metric', 'Exemple 2 : en métrique'], ['A 24 inch board in centimetres: 24 × 2.54 = 60.96 cm.', 'Une planche de 24 pouces en centimètres : 24 × 2,54 = 60,96 cm.']),
      ex(['Example 3: concrete', 'Exemple 3 : béton'], ['A slab 18 ft by 9 ft by 0.5 ft is 81 cubic feet.', 'Une dalle de 18 pi sur 9 pi sur 0,5 pi fait 81 pieds cubes.'], ['81 ÷ 27 = 3 cubic yards.', '81 ÷ 27 = 3 verges cubes.']),
    ],
    tryIt: { skill: 'MS.G10.MFM2P.A3.1.a', tier: 1, seed: 2 },
  },
];
