// Lessons for the Grade 5-6 Algebra, Data, Spatial Sense and Financial Literacy strands (C to F).
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const STRAND_LESSONS: Lesson[] = [
  {
    id: 'L.algebra.patterns',
    skills: ['MS.G5.C1.3.a', 'MS.G5.C1.4.a', 'MS.G6.C1.3.a'],
    title: t('Growing patterns and their rules', 'Les suites croissantes et leurs règles'),
    intro: t('A growing pattern changes by the same amount each time. Find the jump and you can find any term.', 'Une suite croissante change de la même quantité chaque fois. Trouve l\'écart et tu peux trouver n\'importe quel terme.'),
    definitions: [
      d(['Term', 'Terme'], ['Each number in a pattern is a term. Term 1 is the first one.', 'Chaque nombre d\'une suite est un terme. Le terme 1 est le premier.']),
      d(['Pattern rule', 'Règle de la suite'], ['The rule says how to get from one term to the next, for example "start at 3 and add 4". For term n the value is the start plus (n − 1) jumps.', 'La règle dit comment passer d\'un terme au suivant, par exemple « pars de 3 et ajoute 4 ». Pour le terme n, la valeur est le départ plus (n − 1) écarts.']),
    ],
    examples: [
      ex(['Example 1: the next term', 'Exemple 1 : le terme suivant'], ['Pattern 3, 7, 11, 15. The jump is 7 − 3 = 4.', 'Suite 3, 7, 11, 15. L\'écart est 7 − 3 = 4.'], ['The next term is 15 + 4 = 19.', 'Le terme suivant est 15 + 4 = 19.']),
      ex(['Example 2: a far term', 'Exemple 2 : un terme éloigné'], ['Start at 3 and add 4. Term 10 has 9 jumps after the start.', 'Pars de 3 et ajoute 4. Le terme 10 a 9 écarts après le départ.'], ['3 + 9 × 4 = 39.', '3 + 9 × 4 = 39.']),
      ex(['Example 3: from two terms', 'Exemple 3 : à partir de deux termes'], ['Term 2 is 10 and term 5 is 25. Three terms apart, so the jump is (25 − 10) ÷ 3 = 5.', 'Le terme 2 vaut 10 et le terme 5 vaut 25. Trois termes d\'écart : l\'écart est (25 − 10) ÷ 3 = 5.'], ['Term 8 is 25 + 3 × 5 = 40.', 'Le terme 8 vaut 25 + 3 × 5 = 40.']),
    ],
    tryIt: { skill: 'MS.G5.C1.3.a', tier: 2, seed: 4 },
  },
  {
    id: 'L.algebra.expressions-equations',
    skills: ['MS.G5.C2.2.a', 'MS.G6.C2.2.a', 'MS.G5.C2.3.a', 'MS.G6.C2.3.a'],
    title: t('Expressions and equations', 'Expressions et équations'),
    intro: t('A letter stands for a number. You can evaluate an expression, or undo the steps of an equation to find the number.', 'Une lettre représente un nombre. Tu peux évaluer une expression ou défaire les étapes d\'une équation pour trouver le nombre.'),
    definitions: [
      d(['Expression', 'Expression'], ['A number beside a letter means multiply, so 3n means 3 × n. Replace the letter with its value, then calculate.', 'Un nombre collé à une lettre signifie multiplier : 3n veut dire 3 × n. Remplace la lettre par sa valeur, puis calcule.']),
      d(['Equation', 'Équation'], ['An equation says two sides are equal. To solve it, do the same thing to both sides, undoing the last step first.', 'Une équation dit que deux côtés sont égaux. Pour la résoudre, fais la même chose des deux côtés en défaisant d\'abord la dernière étape.']),
    ],
    examples: [
      ex(['Example 1: evaluate', 'Exemple 1 : évaluer'], ['Find 4n + 3 when n = 5. 4n means 4 × 5 = 20.', 'Trouve 4n + 3 quand n = 5. 4n veut dire 4 × 5 = 20.'], ['20 + 3 = 23.', '20 + 3 = 23.']),
      ex(['Example 2: one step', 'Exemple 2 : une étape'], ['Solve x + 8 = 20. Undo adding 8 by subtracting 8 from both sides.', 'Résous x + 8 = 20. Défais l\'addition de 8 en soustrayant 8 des deux côtés.'], ['x = 12. Check: 12 + 8 = 20.', 'x = 12. Vérifie : 12 + 8 = 20.']),
      ex(['Example 3: two steps', 'Exemple 3 : deux étapes'], ['Solve 3x + 5 = 29. Subtract 5 from both sides: 3x = 24.', 'Résous 3x + 5 = 29. Soustrais 5 des deux côtés : 3x = 24.'], ['Divide by 3: x = 8. Check: 3 × 8 + 5 = 29.', 'Divise par 3 : x = 8. Vérifie : 3 × 8 + 5 = 29.']),
    ],
    tryIt: { skill: 'MS.G5.C2.3.a', tier: 2, seed: 5 },
  },
  {
    id: 'L.algebra.inequalities',
    skills: ['MS.G5.C2.4.a', 'MS.G6.C2.4.a'],
    title: t('Inequalities', 'Les inégalités'),
    intro: t('An inequality says one side is greater or less than the other, so many numbers can work.', 'Une inégalité dit qu\'un côté est plus grand ou plus petit que l\'autre : plusieurs nombres peuvent convenir.'),
    definitions: [
      d(['Solve like an equation', 'Résoudre comme une équation'], ['Do the same steps as for an equation. The answer is a boundary, and every number on one side of it works.', 'Fais les mêmes étapes que pour une équation. La réponse est une limite, et tous les nombres d\'un côté de celle-ci conviennent.']),
      d(['Strict and not strict', 'Strict et non strict'], ['With < or > the boundary itself does not work. With ≤ or ≥ it does.', 'Avec < ou >, la limite elle-même ne convient pas. Avec ≤ ou ≥, elle convient.']),
    ],
    examples: [
      ex(['Example 1: less than', 'Exemple 1 : plus petit que'], ['x + 4 < 10. Subtract 4: x < 6.', 'x + 4 < 10. Soustrais 4 : x < 6.'], ['6 itself is not allowed, so the greatest whole number is 5.', '6 lui-même n\'est pas permis : le plus grand nombre entier est 5.']),
      ex(['Example 2: not strict', 'Exemple 2 : non strict'], ['3x ≤ 20. Divide by 3: x ≤ 6.67 (about).', '3x ≤ 20. Divise par 3 : x ≤ 6,67 (environ).'], ['The greatest whole number that does not go over is 6.', 'Le plus grand nombre entier qui ne dépasse pas est 6.']),
      ex(['Example 3: test a value', 'Exemple 3 : essayer une valeur'], ['2x + 1 > 9 means x > 4. Test 5: 2 × 5 + 1 = 11, which is greater than 9.', '2x + 1 > 9 veut dire x > 4. Essaie 5 : 2 × 5 + 1 = 11, ce qui est plus grand que 9.'], ['Test 4: 2 × 4 + 1 = 9, which is not greater than 9, so 4 does not work.', 'Essaie 4 : 2 × 4 + 1 = 9, ce qui n\'est pas plus grand que 9 : 4 ne convient pas.']),
    ],
    tryIt: { skill: 'MS.G5.C2.4.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.data.central-tendency',
    skills: ['MS.G5.D1.5.a', 'MS.G6.D1.5.a'],
    title: t('Mean, median, mode and range', 'Moyenne, médiane, mode et étendue'),
    intro: t('These numbers describe a whole data set in one value.', 'Ces nombres décrivent tout un ensemble de données avec une seule valeur.'),
    definitions: [
      d(['Mean', 'Moyenne'], ['Add all the values, then divide by how many there are. It is the total shared equally.', 'Additionne toutes les valeurs, puis divise par leur nombre. C\'est le total partagé également.']),
      d(['Median and mode', 'Médiane et mode'], ['The median is the middle value once the data is in order (halfway between the two middle ones when there is an even number). The mode is the value that appears most often.', 'La médiane est la valeur du milieu une fois les données en ordre (à mi-chemin entre les deux du milieu quand il y en a un nombre pair). Le mode est la valeur qui apparaît le plus souvent.']),
      d(['Range', 'Étendue'], ['The range is the greatest value minus the least value. It shows how spread out the data is.', 'L\'étendue est la plus grande valeur moins la plus petite. Elle montre à quel point les données sont dispersées.']),
    ],
    examples: [
      ex(['Example 1: mean', 'Exemple 1 : moyenne'], ['Data 4, 6, 8, 10. The total is 28 and there are 4 values.', 'Données 4, 6, 8, 10. Le total est 28 et il y a 4 valeurs.'], ['28 ÷ 4 = 7, so the mean is 7.', '28 ÷ 4 = 7 : la moyenne est 7.']),
      ex(['Example 2: median', 'Exemple 2 : médiane'], ['Data 9, 3, 7, 5. In order: 3, 5, 7, 9.', 'Données 9, 3, 7, 5. En ordre : 3, 5, 7, 9.'], ['The two middle values are 5 and 7. Halfway between them is 6, so the median is 6.', 'Les deux valeurs du milieu sont 5 et 7. À mi-chemin, c\'est 6 : la médiane est 6.']),
      ex(['Example 3: a missing value', 'Exemple 3 : une valeur manquante'], ['Four scores are 6, 8, 9, 5 and the mean of five scores should be 8. Five scores need a total of 40.', 'Quatre résultats sont 6, 8, 9, 5 et la moyenne de cinq résultats doit être 8. Cinq résultats ont besoin d\'un total de 40.'], ['The four scores total 28, so the fifth is 40 − 28 = 12.', 'Les quatre résultats totalisent 28 : le cinquième est 40 − 28 = 12.']),
    ],
    tryIt: { skill: 'MS.G5.D1.5.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.data.probability',
    skills: ['MS.G5.D2.1.a', 'MS.G6.D2.1.a', 'MS.G5.D2.2.a', 'MS.G6.D2.2.a'],
    title: t('Probability', 'Les probabilités'),
    intro: t('Probability measures how likely something is, from 0 (impossible) to 1 (certain).', 'La probabilité mesure la vraisemblance d\'un événement, de 0 (impossible) à 1 (certain).'),
    definitions: [
      d(['Theoretical probability', 'Probabilité théorique'], ['Favourable outcomes divided by all possible outcomes. It can be written as a fraction, a decimal or a percent.', 'Les résultats favorables divisés par tous les résultats possibles. On peut l\'écrire sous forme de fraction, de nombre décimal ou de pourcentage.']),
      d(['Experimental probability', 'Probabilité expérimentale'], ['What really happened: the number of times the event occurred divided by the number of trials. It can differ from the theory.', 'Ce qui s\'est vraiment passé : le nombre de fois que l\'événement s\'est produit divisé par le nombre d\'essais. Elle peut différer de la théorie.']),
      d(['Independent events', 'Événements indépendants'], ['One event does not change the other. The probability of both is the product of their probabilities.', 'Un événement ne change pas l\'autre. La probabilité des deux est le produit de leurs probabilités.']),
    ],
    examples: [
      ex(['Example 1: a fraction', 'Exemple 1 : une fraction'], [`A bag has 3 red and 5 blue marbles. There are 8 marbles in all.`, `Un sac contient 3 billes rouges et 5 bleues. Il y a 8 billes en tout.`], [`P(red) = ${tex(frac(3, 8))}.`, `P(rouge) = ${tex(frac(3, 8))}.`]),
      ex(['Example 2: a percent', 'Exemple 2 : un pourcentage'], ['A spinner has 5 equal sections and 2 are shaded. P(shaded) = 2 ÷ 5 = 0.4.', 'Une roulette a 5 sections égales et 2 sont ombrées. P(ombrée) = 2 ÷ 5 = 0,4.'], ['0.4 × 100 = 40, so the probability is 40%.', '0,4 × 100 = 40 : la probabilité est de 40 %.']),
      ex(['Example 3: two events', 'Exemple 3 : deux événements'], [`P(heads) = ${tex(frac(1, 2))} and P(a 1 on a 4-section spinner) = ${tex(frac(1, 4))}.`, `P(pile) = ${tex(frac(1, 2))} et P(un 1 sur une roulette à 4 sections) = ${tex(frac(1, 4))}.`], [`Both: ${tex(`${frac(1, 2)} \\times ${frac(1, 4)} = ${frac(1, 8)}`)}.`, `Les deux : ${tex(`${frac(1, 2)} \\times ${frac(1, 4)} = ${frac(1, 8)}`)}.`]),
    ],
    tryIt: { skill: 'MS.G5.D2.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.measure.metric-conversions',
    skills: ['MS.G5.E2.2.a', 'MS.G6.E2.1.a'],
    title: t('Metric conversions', 'Conversions métriques'),
    intro: t('Metric units are linked by powers of ten, so converting means moving the decimal point.', 'Les unités métriques sont liées par des puissances de dix : convertir revient à déplacer la virgule.'),
    definitions: [
      d(['Bigger to smaller', 'Du plus grand au plus petit'], ['A smaller unit fits more times, so the number gets bigger: multiply. 1 m = 100 cm, 1 km = 1 000 m, 1 kg = 1 000 g, 1 L = 1 000 mL.', 'Une unité plus petite entre plus de fois : le nombre augmente, donc multiplie. 1 m = 100 cm, 1 km = 1 000 m, 1 kg = 1 000 g, 1 L = 1 000 mL.']),
      d(['Smaller to bigger', 'Du plus petit au plus grand'], ['A bigger unit is needed fewer times, so the number gets smaller: divide.', 'Il faut une unité plus grande moins de fois : le nombre diminue, donc divise.']),
    ],
    examples: [
      ex(['Example 1: multiply', 'Exemple 1 : multiplier'], ['How many cm in 7 m? 1 m = 100 cm.', 'Combien de cm dans 7 m ? 1 m = 100 cm.'], ['7 × 100 = 700 cm.', '7 × 100 = 700 cm.']),
      ex(['Example 2: a decimal', 'Exemple 2 : un nombre décimal'], ['How many g in 2.5 kg? 1 kg = 1 000 g.', 'Combien de g dans 2,5 kg ? 1 kg = 1 000 g.'], ['2.5 × 1 000 = 2 500 g.', '2,5 × 1 000 = 2 500 g.']),
      ex(['Example 3: divide', 'Exemple 3 : diviser'], ['Convert 450 mL to L. 1 000 mL = 1 L, so divide by 1 000.', 'Convertis 450 mL en L. 1 000 mL = 1 L : divise par 1 000.'], ['450 ÷ 1 000 = 0.45 L.', '450 ÷ 1 000 = 0,45 L.']),
    ],
    tryIt: { skill: 'MS.G5.E2.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.measure.area-perimeter',
    skills: ['MS.G5.E2.5.a', 'MS.G5.E2.6.a', 'MS.G6.E2.4.a', 'MS.G6.E2.6.a'],
    title: t('Area, perimeter and surface area', 'Aire, périmètre et aire totale'),
    intro: t('Perimeter is the distance around a shape. Area is the space inside. Surface area is the area of all the faces of a solid.', 'Le périmètre est la distance autour d\'une figure. L\'aire est l\'espace à l\'intérieur. L\'aire totale est l\'aire de toutes les faces d\'un solide.'),
    definitions: [
      d(['Area formulas', 'Formules d\'aire'], ['Parallelogram: base × height. Triangle: base × height ÷ 2. Trapezoid: (sum of parallel sides) × height ÷ 2. Rhombus: diagonal 1 × diagonal 2 ÷ 2.', 'Parallélogramme : base × hauteur. Triangle : base × hauteur ÷ 2. Trapèze : (somme des côtés parallèles) × hauteur ÷ 2. Losange : diagonale 1 × diagonale 2 ÷ 2.']),
      d(['Height', 'Hauteur'], ['The height meets the base at a right angle. It is not the slanted side.', 'La hauteur rencontre la base à angle droit. Ce n\'est pas le côté oblique.']),
      d(['Surface area of a box', 'Aire totale d\'une boîte'], ['A rectangular prism has 3 pairs of matching faces: add the three face areas and double the sum.', 'Un prisme rectangulaire a 3 paires de faces identiques : additionne les aires de trois faces et double la somme.']),
    ],
    examples: [
      ex(['Example 1: a triangle', 'Exemple 1 : un triangle'], ['Base 10 cm, height 6 cm. 10 × 6 = 60.', 'Base de 10 cm, hauteur de 6 cm. 10 × 6 = 60.'], ['Half of that: 60 ÷ 2 = 30 cm².', 'La moitié : 60 ÷ 2 = 30 cm².']),
      ex(['Example 2: same area, different perimeter', 'Exemple 2 : même aire, périmètre différent'], ['A 2 cm by 12 cm rectangle and a 4 cm by 6 cm rectangle both have area 24 cm².', 'Un rectangle de 2 cm sur 12 cm et un rectangle de 4 cm sur 6 cm ont tous deux une aire de 24 cm².'], ['Perimeters: 2 × (2 + 12) = 28 cm and 2 × (4 + 6) = 20 cm. The area is the same but the perimeters differ.', 'Périmètres : 2 × (2 + 12) = 28 cm et 2 × (4 + 6) = 20 cm. L\'aire est la même, mais pas les périmètres.']),
      ex(['Example 3: surface area', 'Exemple 3 : aire totale'], ['A box is 5 cm by 3 cm by 2 cm. Faces: 5 × 3 = 15, 5 × 2 = 10, 3 × 2 = 6. Add: 31.', 'Une boîte mesure 5 cm sur 3 cm sur 2 cm. Faces : 5 × 3 = 15, 5 × 2 = 10, 3 × 2 = 6. Additionne : 31.'], ['Double it: 2 × 31 = 62 cm².', 'Double-le : 2 × 31 = 62 cm².']),
    ],
    tryIt: { skill: 'MS.G5.E2.5.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.geometry.angles-shapes',
    skills: ['MS.G5.E1.1.a', 'MS.G6.E1.1.a', 'MS.G6.E2.3.a'],
    title: t('Angles in triangles and quadrilaterals', 'Angles des triangles et des quadrilatères'),
    intro: t('Angles in a shape always add to the same total, so you can find a missing one.', 'Les angles d\'une figure totalisent toujours la même somme : tu peux donc trouver un angle manquant.'),
    definitions: [
      d(['Angle totals', 'Totaux des angles'], ['The angles of a triangle add to 180°. The angles of a quadrilateral add to 360°. Complementary angles add to 90°. Supplementary angles add to 180° (a straight line).', 'Les angles d\'un triangle totalisent 180°. Ceux d\'un quadrilatère totalisent 360°. Les angles complémentaires totalisent 90°. Les angles supplémentaires totalisent 180° (une ligne droite).']),
      d(['Exterior angle', 'Angle extérieur'], ['An exterior angle of a triangle is next to an interior angle on a straight line, so it equals the sum of the two other interior angles.', 'Un angle extérieur d\'un triangle est à côté d\'un angle intérieur sur une ligne droite : il égale la somme des deux autres angles intérieurs.']),
    ],
    examples: [
      ex(['Example 1: a triangle', 'Exemple 1 : un triangle'], ['Two angles are 50° and 60°. Together 110°.', 'Deux angles mesurent 50° et 60°. Ensemble : 110°.'], ['The third is 180° − 110° = 70°.', 'Le troisième mesure 180° − 110° = 70°.']),
      ex(['Example 2: a quadrilateral', 'Exemple 2 : un quadrilatère'], ['Three angles are 90°, 100° and 80°. Together 270°.', 'Trois angles mesurent 90°, 100° et 80°. Ensemble : 270°.'], ['The fourth is 360° − 270° = 90°.', 'Le quatrième mesure 360° − 270° = 90°.']),
      ex(['Example 3: an exterior angle', 'Exemple 3 : un angle extérieur'], ['A triangle has interior angles 40° and 65° and a third angle of 75°.', 'Un triangle a des angles intérieurs de 40° et 65° et un troisième angle de 75°.'], ['The exterior angle next to the 75° angle is 180° − 75° = 105°, which is also 40° + 65°.', 'L\'angle extérieur à côté de l\'angle de 75° mesure 180° − 75° = 105°, ce qui est aussi 40° + 65°.']),
    ],
    tryIt: { skill: 'MS.G5.E1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.geometry.four-quadrants',
    skills: ['MS.G6.E1.3.a'],
    title: t('Coordinates in four quadrants', 'Coordonnées dans les quatre quadrants'),
    intro: t('The x-axis and y-axis split the plane into four quadrants. The signs of the coordinates tell you where a point is.', 'L\'axe des x et l\'axe des y séparent le plan en quatre quadrants. Les signes des coordonnées indiquent où se trouve un point.'),
    definitions: [
      d(['Quadrants', 'Quadrants'], ['Quadrant I is (+, +), II is (−, +), III is (−, −) and IV is (+, −). They go counterclockwise from the top right.', 'Le quadrant I est (+, +), le II (−, +), le III (−, −) et le IV (+, −). Ils vont dans le sens antihoraire à partir du haut à droite.']),
      d(['Reflections and translations', 'Réflexions et translations'], ['Reflecting in the x-axis changes the sign of y. Reflecting in the y-axis changes the sign of x. A translation adds the move to x (right is +) and to y (up is +).', 'Une réflexion par rapport à l\'axe des x change le signe de y. Par rapport à l\'axe des y, elle change le signe de x. Une translation ajoute le déplacement à x (la droite est +) et à y (le haut est +).']),
    ],
    examples: [
      ex(['Example 1: a quadrant', 'Exemple 1 : un quadrant'], ['The point (−3, 4) has a negative x and a positive y.', 'Le point (−3, 4) a un x négatif et un y positif.'], ['That is quadrant II.', 'C\'est le quadrant II.']),
      ex(['Example 2: a reflection', 'Exemple 2 : une réflexion'], ['Reflect (5, −2) in the x-axis. Only y changes sign.', 'Réfléchis (5, −2) par rapport à l\'axe des x. Seul y change de signe.'], ['The image is (5, 2).', 'L\'image est (5, 2).']),
      ex(['Example 3: a translation', 'Exemple 3 : une translation'], ['Move (−2, 3) 4 right and 5 down. x: −2 + 4 = 2.', 'Déplace (−2, 3) de 4 vers la droite et de 5 vers le bas. x : −2 + 4 = 2.'], ['y: 3 − 5 = −2, so the image is (2, −2).', 'y : 3 − 5 = −2 : l\'image est (2, −2).']),
    ],
    tryIt: { skill: 'MS.G6.E1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.finance.money',
    skills: ['MS.G5.F1.2.a', 'MS.G5.F1.5.a', 'MS.G6.F1.4.a'],
    title: t('Spending, best value and interest', 'Dépenses, meilleur achat et intérêt'),
    intro: t('Money skills help you compare prices, work out the total cost and understand what saving and borrowing cost.', 'Les habiletés financières aident à comparer les prix, à calculer le coût total et à comprendre ce que coûtent l\'épargne et l\'emprunt.'),
    definitions: [
      d(['Sales tax', 'Taxe de vente'], ['In Ontario the sales tax is 13%. Find 13% of the subtotal and add it to get the total.', 'En Ontario, la taxe de vente est de 13 %. Trouve 13 % du sous-total et ajoute-le pour obtenir le total.']),
      d(['Unit rate and best value', 'Taux unitaire et meilleur achat'], ['A unit rate is the price for one item. The lower the price per item, the better the buy.', 'Un taux unitaire est le prix pour un article. Plus le prix par article est bas, meilleur est l\'achat.']),
      d(['Simple interest', 'Intérêt simple'], ['Simple interest = amount × rate × years. It is the same amount every year.', 'Intérêt simple = montant × taux × années. C\'est le même montant chaque année.']),
    ],
    examples: [
      ex(['Example 1: tax', 'Exemple 1 : la taxe'], ['Items cost 20 dollars. Tax is 13% of 20 = 2.60 dollars.', 'Des articles coûtent 20 dollars. La taxe est de 13 % de 20 = 2,60 dollars.'], ['Total: 20 + 2.60 = 22.60 dollars.', 'Total : 20 + 2,60 = 22,60 dollars.']),
      ex(['Example 2: best value', 'Exemple 2 : meilleur achat'], ['Pack A: 4 for 6 dollars is 1.50 dollars each. Pack B: 10 for 12 dollars is 1.20 dollars each.', 'Emballage A : 4 pour 6 dollars, soit 1,50 dollar chacun. Emballage B : 10 pour 12 dollars, soit 1,20 dollar chacun.'], ['Pack B has the lower price for one, so it is the better buy.', 'L\'emballage B a le prix le plus bas pour un : c\'est le meilleur achat.']),
      ex(['Example 3: interest', 'Exemple 3 : l\'intérêt'], ['500 dollars at 4% simple interest for 3 years. One year: 500 × 0.04 = 20 dollars.', '500 dollars à 4 % d\'intérêt simple pendant 3 ans. Un an : 500 × 0,04 = 20 dollars.'], ['Three years: 3 × 20 = 60 dollars of interest.', 'Trois ans : 3 × 20 = 60 dollars d\'intérêt.']),
    ],
    tryIt: { skill: 'MS.G5.F1.2.a', tier: 2, seed: 3 },
  },
  {
    id: 'L.finance6.goals',
    skills: ['MS.G6.F1.1.a', 'MS.G6.F1.2.a', 'MS.G6.F1.3.a', 'MS.G6.F1.5.a'],
    title: t('Paying, saving for goals, borrowing and giving', 'Payer, économiser pour un objectif, emprunter et donner'),
    intro: t('Money choices have effects. How you pay, how fast you save, and what you spend, lend or give all change how soon you reach a goal.', 'Les choix d\'argent ont des effets. La façon de payer, la vitesse d\'épargne et ce que tu dépenses, prêtes ou donnes changent le temps qu\'il faut pour atteindre un objectif.'),
    definitions: [
      d(['Payment methods', 'Modes de paiement'], ['Cash gives change: bill minus price. A debit card takes money straight from your account. A credit card lends you money, and a fee or interest may be added. Compare the fees in dollars.', 'Le comptant donne de la monnaie : billet moins prix. Une carte de débit retire l\'argent directement de ton compte. Une carte de crédit te prête de l\'argent, et des frais ou de l\'intérêt peuvent s\'ajouter. Compare les frais en dollars.']),
      d(['Financial goals', 'Objectifs financiers'], ['Weeks to a goal = (cost − what you already have) ÷ what you save each week.', 'Semaines pour atteindre un objectif = (coût − ce que tu as déjà) ÷ ce que tu économises chaque semaine.']),
      d(['Factors that help or interfere', 'Facteurs qui aident ou nuisent'], ['Extra income helps: it raises the weekly saving. A new expense interferes: it lowers the weekly saving. Find the weeks before and after, then subtract.', 'Un revenu de plus aide : il augmente l\'économie hebdomadaire. Une nouvelle dépense nuit : elle diminue l\'économie hebdomadaire. Trouve les semaines avant et après, puis soustrais.']),
      d(['Trading, lending, borrowing, donating', 'Échanger, prêter, emprunter, donner'], ['A fair trade swaps equal total values. When you lend or borrow, what is still owed is the amount minus what has been paid back. A donation of a percent is that percent of what you earn.', 'Un échange équitable échange des valeurs totales égales. Quand on prête ou emprunte, ce qui reste dû est le montant moins ce qui a été remboursé. Un don d\'un pourcentage est ce pourcentage de ce que tu gagnes.']),
    ],
    examples: [
      ex(['Example 1: a goal', 'Exemple 1 : un objectif'], ['A game costs 60 dollars. You have 15 dollars and save 5 dollars a week. Still needed: 60 − 15 = 45 dollars.', 'Un jeu coûte 60 dollars. Tu as 15 dollars et tu économises 5 dollars par semaine. Il manque : 60 − 15 = 45 dollars.'], ['45 ÷ 5 = 9, so it takes 9 weeks.', '45 ÷ 5 = 9 : il faut 9 semaines.']),
      ex(['Example 2: a factor', 'Exemple 2 : un facteur'], ['A 60 dollar goal at 10 dollars a week takes 6 weeks. A new expense of 5 dollars a week leaves 5 dollars a week.', 'Un objectif de 60 dollars à 10 dollars par semaine prend 6 semaines. Une nouvelle dépense de 5 dollars par semaine laisse 5 dollars par semaine.'], ['Now it takes 12 weeks, which is 6 more weeks.', 'Maintenant, il faut 12 semaines, soit 6 semaines de plus.']),
      ex(['Example 3: a loan', 'Exemple 3 : un prêt'], ['You lend 80 dollars and are paid back 10 dollars a week. After 3 weeks you have been paid 3 × 10 = 30 dollars.', 'Tu prêtes 80 dollars et on te rembourse 10 dollars par semaine. Après 3 semaines, on t\'a remboursé 3 × 10 = 30 dollars.'], ['Still owed: 80 − 30 = 50 dollars.', 'Reste dû : 80 − 30 = 50 dollars.']),
    ],
    tryIt: { skill: 'MS.G6.F1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra6.patterns-monomials',
    skills: ['MS.G6.C1.1.a', 'MS.G6.C1.2.a', 'MS.G6.C1.4.a', 'MS.G6.C2.1.a'],
    title: t('Kinds of patterns, tables and rules, and adding like terms', 'Types de suites, tableaux et règles, et addition de termes semblables'),
    intro: t('Patterns can repeat, grow or shrink. A table, a rule and a pattern are three ways to show the same thing, and terms with the same letter can be added.', 'Les suites peuvent se répéter, croître ou décroître. Un tableau, une règle et une suite sont trois façons de montrer la même chose, et les termes avec la même lettre peuvent s\'additionner.'),
    definitions: [
      d(['Kinds of patterns', 'Types de suites'], ['A repeating pattern has a core that repeats. A growing pattern goes up and a shrinking pattern goes down. A growing pattern is linear when it jumps by the same amount every term.', 'Une suite répétitive a un motif de base qui se répète. Une suite croissante monte et une suite décroissante descend. Une suite croissante est linéaire quand elle fait le même écart à chaque terme.']),
      d(['Tables and rules', 'Tableaux et règles'], ['In a table, the jump between values is the number beside n in the rule. Put term 1 in the rule to find the number that is added.', 'Dans un tableau, l\'écart entre les valeurs est le nombre à côté de n dans la règle. Mets le terme 1 dans la règle pour trouver le nombre ajouté.']),
      d(['Adding monomials', 'Additionner des monômes'], ['Terms with the same letter are like terms. Add the numbers in front: 3x + 5x = 8x. Plain numbers are added with plain numbers.', 'Les termes avec la même lettre sont des termes semblables. Additionne les nombres devant : 3x + 5x = 8x. Les nombres seuls s\'additionnent avec les nombres seuls.']),
    ],
    examples: [
      ex(['Example 1: a repeating pattern', 'Exemple 1 : une suite répétitive'], ['The core 4, 7, 2 repeats. Divide the term number 20 by 3 (the length of the core): the remainder is 2.', 'Le motif de base 4, 7, 2 se répète. Divise le numéro du terme 20 par 3 (la longueur du motif) : le reste est 2.'], ['The remainder 2 means the 2nd number of the core, so term 20 is 7.', 'Le reste 2 signifie le 2e nombre du motif : le terme 20 est 7.']),
      ex(['Example 2: from a table to a rule', 'Exemple 2 : du tableau à la règle'], ['Values 5, 8, 11, 14 for terms 1 to 4 jump by 3. Term 1 gives 3 × 1 + c = 5, so c = 2.', 'Les valeurs 5, 8, 11, 14 pour les termes 1 à 4 font un écart de 3. Le terme 1 donne 3 × 1 + c = 5 : c = 2.'], ['The rule is 3n + 2, so term 10 is 32.', 'La règle est 3n + 2 : le terme 10 est 32.']),
      ex(['Example 3: like terms', 'Exemple 3 : termes semblables'], ['Add (2x + 3) + (4x + 5). The x terms: 2 + 4 = 6. The plain numbers: 3 + 5 = 8.', 'Additionne (2x + 3) + (4x + 5). Les termes en x : 2 + 4 = 6. Les nombres seuls : 3 + 5 = 8.'], ['The sum is 6x + 8. When x = 3 it is 18 + 8 = 26.', 'La somme est 6x + 8. Quand x = 3, elle vaut 18 + 8 = 26.']),
    ],
    tryIt: { skill: 'MS.G6.C1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.data6.kinds-intervals-graphs',
    skills: ['MS.G6.D1.1.a', 'MS.G6.D1.2.a', 'MS.G6.D1.3.a', 'MS.G6.D1.6.a'],
    title: t('Kinds of data, intervals, choosing a graph and misleading graphs', 'Types de données, intervalles, choix d\'un graphique et graphiques trompeurs'),
    intro: t('The kind of data tells you how to organize it, and the purpose tells you which graph to draw. A graph can also give the wrong idea if it is drawn in a tricky way.', 'Le type de données te dit comment les organiser, et le but te dit quel graphique tracer. Un graphique peut aussi donner une fausse idée s\'il est tracé de façon trompeuse.'),
    definitions: [
      d(['Discrete and continuous', 'Discret et continu'], ['Discrete data is counted in whole steps, like goals or pets. Continuous data is measured and can be any value in a range, like height or time.', 'Les données discrètes se comptent par pas entiers, comme des buts ou des animaux. Les données continues se mesurent et peuvent prendre n\'importe quelle valeur dans un intervalle, comme la taille ou le temps.']),
      d(['Intervals', 'Intervalles'], ['Intervals group data into equal steps, like 40 to 49, 50 to 59, and so on. Every value belongs to exactly one interval, and both ends count.', 'Les intervalles regroupent des données en pas égaux, comme 40 à 49, 50 à 59, et ainsi de suite. Chaque valeur appartient à un seul intervalle, et les deux extrémités comptent.']),
      d(['Choosing a graph', 'Choisir un graphique'], ['Bar graph: compare categories. Circle graph: parts of a whole. Histogram: how measurements spread across equal intervals. Broken-line graph: change over time.', 'Diagramme à bandes : comparer des catégories. Diagramme circulaire : parties d\'un tout. Histogramme : répartition de mesures dans des intervalles égaux. Graphique à ligne brisée : changement dans le temps.']),
      d(['Misleading graphs', 'Graphiques trompeurs'], ['If a bar graph\'s axis does not start at zero, small differences look big. Compare the real values, not just the heights.', 'Si l\'axe d\'un diagramme à bandes ne commence pas à zéro, de petits écarts paraissent grands. Compare les vraies valeurs, pas seulement les hauteurs.']),
    ],
    examples: [
      ex(['Example 1: discrete or continuous', 'Exemple 1 : discret ou continu'], ['The number of pets in a family is counted in whole steps.', 'Le nombre d\'animaux dans une famille se compte par pas entiers.'], ['It is discrete. The mass of a backpack is measured, so it is continuous.', 'Il est discret. La masse d\'un sac à dos se mesure : elle est continue.']),
      ex(['Example 2: a percent from intervals', 'Exemple 2 : un pourcentage à partir d\'intervalles'], ['Of 40 values, 10 are in the interval 20 to 29.', 'Sur 40 données, 10 sont dans l\'intervalle de 20 à 29.'], ['10 ÷ 40 × 100 = 25%.', '10 ÷ 40 × 100 = 25 %.']),
      ex(['Example 3: a misleading axis', 'Exemple 3 : un axe trompeur'], ['An axis starts at 90. Bars show 92 and 98. The drawn heights are 92 − 90 = 2 and 98 − 90 = 8.', 'Un axe commence à 90. Les bandes montrent 92 et 98. Les hauteurs tracées sont 92 − 90 = 2 et 98 − 90 = 8.'], ['The second bar looks 8 ÷ 2 = 4 times as tall, but the real increase is only about 6.5%.', 'La deuxième bande paraît 8 ÷ 2 = 4 fois plus haute, mais la vraie augmentation n\'est que d\'environ 6,5 %.']),
    ],
    tryIt: { skill: 'MS.G6.D1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.geometry.combined-transformations',
    skills: ['MS.G6.E1.4.a'],
    title: t('Combining translations, reflections and rotations', 'Combiner des translations, des réflexions et des rotations'),
    intro: t('A combination is just several moves in a row. Do one move at a time, write the new point, and then do the next move on that new point.', 'Une combinaison, ce sont simplement plusieurs déplacements à la suite. Fais un déplacement à la fois, écris le nouveau point, puis fais le déplacement suivant sur ce nouveau point.'),
    definitions: [
      d(['Rotation about the origin', 'Rotation autour de l\'origine'], ['Counterclockwise: 90° turns (x, y) into (−y, x). 180° turns it into (−x, −y). 270° turns it into (y, −x). 360° is a full turn and changes nothing.', 'Dans le sens antihoraire : 90° transforme (x, y) en (−y, x). 180° le transforme en (−x, −y). 270° le transforme en (y, −x). 360° est un tour complet et ne change rien.']),
      d(['The order matters', 'L\'ordre compte'], ['Doing the same moves in a different order can end at a different point. Follow the order in the question.', 'Faire les mêmes déplacements dans un ordre différent peut mener à un autre point. Suis l\'ordre de l\'énoncé.']),
    ],
    examples: [
      ex(['Example 1: translate, then reflect', 'Exemple 1 : translater, puis réfléchir'], ['Move (2, 3) 4 right and 1 down to get (6, 2).', 'Déplace (2, 3) de 4 vers la droite et de 1 vers le bas pour obtenir (6, 2).'], ['Reflect in the x-axis: the sign of y changes, so the image is (6, −2).', 'Réfléchis par rapport à l\'axe des x : le signe de y change, l\'image est (6, −2).']),
      ex(['Example 2: reflect, then rotate', 'Exemple 2 : réfléchir, puis tourner'], ['Reflect (−3, 5) in the y-axis to get (3, 5).', 'Réfléchis (−3, 5) par rapport à l\'axe des y pour obtenir (3, 5).'], ['Rotate 90° counterclockwise: (x, y) becomes (−y, x), so the image is (−5, 3).', 'Tourne de 90° dans le sens antihoraire : (x, y) devient (−y, x), l\'image est (−5, 3).']),
      ex(['Example 3: a full turn', 'Exemple 3 : un tour complet'], ['A rotation of 360° brings the point back where it was.', 'Une rotation de 360° ramène le point où il était.'], ['So (4, −2) rotated 360° is still (4, −2).', 'Donc (4, −2) tourné de 360° est toujours (4, −2).']),
    ],
    tryIt: { skill: 'MS.G6.E1.4.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.finance5.transfers-budgets-credit-taxes',
    skills: ['MS.G5.F1.1.a', 'MS.G5.F1.3.a', 'MS.G5.F1.4.a', 'MS.G5.F1.6.a'],
    title: t('Sending money, budgets, credit and taxes', 'Envoyer de l\'argent, budgets, crédit et taxes'),
    intro: t('Money moves between people and businesses in several ways, a budget plans what comes in and goes out, credit lets you borrow, and taxes pay for services.', 'L\'argent circule entre les gens et les entreprises de plusieurs façons, un budget planifie ce qui entre et ce qui sort, le crédit permet d\'emprunter et les taxes paient des services.'),
    definitions: [
      d(['Transferring money', 'Transférer de l\'argent'], ['Cash is handed over. Debit, credit and e-transfers move money electronically, and some charge a fee. Add the fee to what you send.', 'Le comptant se remet en main propre. Les cartes de débit et de crédit et les virements électroniques déplacent l\'argent électroniquement, et certains ont des frais. Ajoute les frais à ce que tu envoies.']),
      d(['Budget', 'Budget'], ['A budget lists income and planned spending. Money left to save = income − needs − wants.', 'Un budget énumère le revenu et les dépenses prévues. Argent qui reste à épargner = revenu − besoins − désirs.']),
      d(['Credit and debt', 'Crédit et dette'], ['Credit lets you buy now and pay later. What you owe is debt. A payment lowers it, a new purchase raises it, and interest adds more.', 'Le crédit te permet d\'acheter maintenant et de payer plus tard. Ce que tu dois est une dette. Un paiement la diminue, un nouvel achat l\'augmente et l\'intérêt en ajoute.']),
      d(['Taxes', 'Taxes'], ['Federal taxes (like income tax and GST) pay for national services. Provincial taxes pay for schools and hospitals. Municipal property tax pays for local services like garbage pickup and libraries.', 'Les taxes fédérales (comme l\'impôt sur le revenu et la TPS) paient les services nationaux. Les taxes provinciales paient les écoles et les hôpitaux. L\'impôt foncier municipal paie les services locaux comme la collecte des ordures et les bibliothèques.']),
    ],
    examples: [
      ex(['Example 1: a transfer fee', 'Exemple 1 : des frais de virement'], ['You e-transfer 40 dollars and the fee is 1.50 dollars.', 'Tu fais un virement de 40 dollars et les frais sont de 1,50 dollar.'], ['Your account goes down 40 + 1.50 = 41.50 dollars.', 'Ton compte diminue de 40 + 1,50 = 41,50 dollars.']),
      ex(['Example 2: a budget', 'Exemple 2 : un budget'], ['Income 300 dollars, needs 150 dollars, wants 60 dollars. Spending is 150 + 60 = 210 dollars.', 'Revenu de 300 dollars, besoins de 150 dollars, désirs de 60 dollars. Les dépenses sont de 150 + 60 = 210 dollars.'], ['Left to save: 300 − 210 = 90 dollars.', 'Reste à épargner : 300 − 210 = 90 dollars.']),
      ex(['Example 3: debt with interest', 'Exemple 3 : une dette avec intérêt'], ['You owe 200 dollars and the card charges 10% a month. The interest is 10% of 200 = 20 dollars.', 'Tu dois 200 dollars et la carte charge 10 % par mois. L\'intérêt est de 10 % de 200 = 20 dollars.'], ['If you pay nothing, you owe 200 + 20 = 220 dollars.', 'Si tu ne paies rien, tu dois 200 + 20 = 220 dollars.']),
    ],
    tryIt: { skill: 'MS.G5.F1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra5.patterns-expressions',
    skills: ['MS.G5.C1.1.a', 'MS.G5.C1.2.a', 'MS.G5.C2.1.a'],
    title: t('Kinds of patterns, tables of values and expressions', 'Types de suites, tableaux de valeurs et expressions'),
    intro: t('Patterns repeat, grow or shrink. A table lists the terms, and a letter in an expression stands for a number.', 'Les suites se répètent, croissent ou décroissent. Un tableau énumère les termes, et une lettre dans une expression représente un nombre.'),
    definitions: [
      d(['Kinds of patterns', 'Types de suites'], ['A repeating pattern has a core that comes back. A growing pattern goes up and a shrinking pattern goes down by the same amount each term.', 'Une suite répétitive a un motif de base qui revient. Une suite croissante monte et une suite décroissante descend du même montant à chaque terme.']),
      d(['Tables of values', 'Tableaux de valeurs'], ['A table pairs each term number with its value. Find the jump between values, then use it to fill gaps and go further.', 'Un tableau associe chaque numéro de terme à sa valeur. Trouve l\'écart entre les valeurs, puis sers-t\'en pour remplir les trous et aller plus loin.']),
      d(['Expressions', 'Expressions'], ['"n more than" is n + a number. "n less than" is n − a number. "times" is multiplying. n + n + n is 3 × n.', '« De plus que » donne n + un nombre. « De moins que » donne n − un nombre. « Fois » veut dire multiplier. n + n + n égale 3 × n.']),
    ],
    examples: [
      ex(['Example 1: a repeating pattern', 'Exemple 1 : une suite répétitive'], ['The core 2, 5, 9 repeats. Term 14: 14 ÷ 3 leaves a remainder of 2.', 'Le motif de base 2, 5, 9 se répète. Terme 14 : 14 ÷ 3 donne un reste de 2.'], ['Remainder 2 means the 2nd number, so term 14 is 5.', 'Un reste de 2 signifie le 2e nombre : le terme 14 est 5.']),
      ex(['Example 2: a table', 'Exemple 2 : un tableau'], ['Values 4, 7, 10, 13 jump by 3. For term 8 take 7 jumps from the start.', 'Les valeurs 4, 7, 10, 13 font un écart de 3. Pour le terme 8, fais 7 écarts à partir du départ.'], ['4 + 7 × 3 = 25.', '4 + 7 × 3 = 25.']),
      ex(['Example 3: an expression', 'Exemple 3 : une expression'], ['3 boxes hold n pencils each, and there are 4 loose pencils.', '3 boîtes contiennent n crayons chacune, et il y a 4 crayons seuls.'], ['The total is 3 × n + 4.', 'Le total est 3 × n + 4.']),
    ],
    tryIt: { skill: 'MS.G5.C1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.data5.sampling-relative-graphs',
    skills: ['MS.G5.D1.1.a', 'MS.G5.D1.2.a', 'MS.G5.D1.3.a', 'MS.G5.D1.6.a'],
    title: t('Sampling, relative frequency, choosing graphs and reading them', 'Échantillonnage, fréquence relative, choix de graphiques et lecture'),
    intro: t('A fair sample, an honest table and the right graph help you tell the truth with data.', 'Un échantillon juste, un tableau honnête et le bon graphique t\'aident à dire la vérité avec des données.'),
    definitions: [
      d(['Sampling', 'Échantillonnage'], ['A representative sample looks like the whole group. Choosing at random from everyone is fair, and a larger random sample is usually better. Asking only one special part of the group gives a biased sample.', 'Un échantillon représentatif ressemble à tout le groupe. Choisir au hasard parmi tous est juste, et un plus grand échantillon au hasard est généralement meilleur. Interroger seulement une partie particulière du groupe donne un échantillon biaisé.']),
      d(['Relative frequency', 'Fréquence relative'], ['Relative frequency = count ÷ total. Multiply by 100 for a percent. The percents of all categories add to 100.', 'Fréquence relative = effectif ÷ total. Multiplie par 100 pour obtenir un pourcentage. Les pourcentages de toutes les catégories totalisent 100.']),
      d(['Choosing a graph', 'Choisir un graphique'], ['Bar graph: compare categories. Stacked-bar graph: show the parts inside each total. Circle graph: parts of one whole. Broken-line graph: change over time.', 'Diagramme à bandes : comparer des catégories. Diagramme à bandes superposées : montrer les parties dans chaque total. Diagramme circulaire : parties d\'un seul tout. Graphique à ligne brisée : changement dans le temps.']),
      d(['Misleading graphs', 'Graphiques trompeurs'], ['If an axis does not start at zero, small differences look big. In a stacked bar, a part is the total minus the other parts.', 'Si un axe ne commence pas à zéro, de petites différences paraissent grandes. Dans une bande superposée, une partie est le total moins les autres parties.']),
    ],
    examples: [
      ex(['Example 1: relative frequency', 'Exemple 1 : fréquence relative'], ['12 of 40 students walk to school. 12 ÷ 40 = 0.3.', '12 élèves sur 40 marchent pour aller à l\'école. 12 ÷ 40 = 0,3.'], ['As a percent, 0.3 × 100 = 30%.', 'En pourcentage, 0,3 × 100 = 30 %.']),
      ex(['Example 2: a stacked bar', 'Exemple 2 : une bande superposée'], ['A bar totals 28 and its girls part is 11.', 'Une bande totalise 28 et sa partie des filles est de 11.'], ['The boys part is 28 − 11 = 17.', 'La partie des garçons est de 28 − 11 = 17.']),
      ex(['Example 3: a misleading axis', 'Exemple 3 : un axe trompeur'], ['An axis starts at 50. Bars show 52 and 58, so the drawn heights are 2 and 8.', 'Un axe commence à 50. Les bandes montrent 52 et 58 : les hauteurs tracées sont 2 et 8.'], ['Bar B looks 8 ÷ 2 = 4 times as tall, but 58 is not 4 times 52.', 'La bande B paraît 8 ÷ 2 = 4 fois plus haute, mais 58 n\'est pas 4 fois 52.']),
    ],
    tryIt: { skill: 'MS.G5.D1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.geometry5.transformations-units-angles',
    skills: ['MS.G5.E1.5.a', 'MS.G5.E2.1.a', 'MS.G5.E2.3.a'],
    title: t('Moving shapes on a grid, metric units and comparing angles', 'Déplacer des figures sur une grille, unités métriques et comparaison d\'angles'),
    intro: t('Shapes can slide, flip and turn on a grid. Metric units fit different sizes, and angles can be compared with a unit you choose.', 'Les figures peuvent glisser, se retourner et tourner sur une grille. Les unités métriques conviennent à différentes grandeurs, et on peut comparer des angles avec une unité de son choix.'),
    definitions: [
      d(['Translation, reflection, rotation', 'Translation, réflexion, rotation'], ['A translation slides: right or left changes x, up or down changes y. A reflection flips over a line: the image is the same distance from the line on the other side. A 180° rotation about a centre puts the image the same distance on the opposite side of the centre.', 'Une translation glisse : la droite ou la gauche change x, le haut ou le bas change y. Une réflexion retourne par rapport à une droite : l\'image est à la même distance de la droite, de l\'autre côté. Une rotation de 180° autour d\'un centre place l\'image à la même distance, du côté opposé du centre.']),
      d(['Metric units', 'Unités métriques'], ['Use millimetres and centimetres for small lengths, metres and kilometres for long ones, grams and kilograms for mass, and millilitres and litres for capacity. Use benchmarks like a metre stick or a litre carton to estimate.', 'Utilise les millimètres et les centimètres pour les petites longueurs, les mètres et les kilomètres pour les longues, les grammes et les kilogrammes pour la masse, et les millilitres et les litres pour la capacité. Utilise des repères comme un mètre ou un carton d\'un litre pour estimer.']),
      d(['Comparing angles', 'Comparer des angles'], ['Measure two angles with the same unit and compare the numbers. If a right angle is made of 6 wedges, one wedge is 90 ÷ 6 = 15°.', 'Mesure deux angles avec la même unité et compare les nombres. Si un angle droit est fait de 6 coins, un coin vaut 90 ÷ 6 = 15°.']),
    ],
    examples: [
      ex(['Example 1: a reflection', 'Exemple 1 : une réflexion'], ['The point (7, 3) is 2 units left of the line x = 9.', 'Le point (7, 3) est à 2 unités à gauche de la droite x = 9.'], ['Its image is 2 units right of the line: x = 11, so (11, 3).', 'Son image est à 2 unités à droite de la droite : x = 11, donc (11, 3).']),
      ex(['Example 2: a unit', 'Exemple 2 : une unité'], ['The mass of a school bag is a few kilograms, not a few grams.', 'La masse d\'un sac d\'école est de quelques kilogrammes, pas de quelques grammes.'], ['The best unit is kilograms.', 'La meilleure unité est le kilogramme.']),
      ex(['Example 3: an angle', 'Exemple 3 : un angle'], ['A right angle is 6 wedges. One wedge is 90 ÷ 6 = 15°.', 'Un angle droit fait 6 coins. Un coin vaut 90 ÷ 6 = 15°.'], ['An angle of 4 wedges is 4 × 15 = 60°.', 'Un angle de 4 coins mesure 4 × 15 = 60°.']),
    ],
    tryIt: { skill: 'MS.G5.E1.5.a', tier: 1, seed: 3 },
  },
];
