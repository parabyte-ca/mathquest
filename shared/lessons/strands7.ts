// Lessons for the Grade 7 Algebra, Data, Spatial Sense and Financial Literacy strands (C to F).
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });
const f = (n: number, dd: number): string => tex(frac(n, dd));

export const STRAND7_LESSONS: Lesson[] = [
  {
    id: 'L.algebra7.patterns-expressions',
    skills: ['MS.G7.C1.1.a', 'MS.G7.C1.3.a', 'MS.G7.C1.4.a', 'MS.G7.C2.1.a', 'MS.G7.C2.2.a'],
    title: t('Patterns, like terms and expressions', 'Suites, termes semblables et expressions'),
    intro: t('A rule such as 4n + 3 tells you every term of a pattern. Like terms can be combined, and an expression gets a value when you replace its letters.', 'Une règle comme 4n + 3 donne tous les termes d\'une suite. Les termes semblables se combinent, et une expression prend une valeur quand on remplace ses lettres.'),
    definitions: [
      d(['Rate and starting value', 'Taux et valeur de départ'], ['A growing pattern has a starting value and a constant rate: the amount added each time. The rule is start + rate × (term number − 1), or rate × n + a constant.', 'Une suite croissante a une valeur de départ et un taux constant : la quantité ajoutée chaque fois. La règle est départ + taux × (numéro du terme − 1), ou taux × n + une constante.']),
      d(['Like terms', 'Termes semblables'], ['Terms with the same letter can be combined by adding or subtracting the numbers in front: 3x + 5x = 8x. Plain numbers combine with plain numbers.', 'Les termes qui ont la même lettre se combinent en additionnant ou en soustrayant les nombres devant : 3x + 5x = 8x. Les nombres seuls se combinent avec les nombres seuls.']),
      d(['Evaluate', 'Évaluer'], ['Replace each letter with its value, multiply first, then add or subtract.', 'Remplace chaque lettre par sa valeur, multiplie d\'abord, puis additionne ou soustrais.']),
    ],
    examples: [
      ex(['Example 1: a pattern rule', 'Exemple 1 : une règle de suite'], ['The rule is t = 4n + 3. Term 10 is 4 × 10 + 3.', 'La règle est t = 4n + 3. Le terme 10 est 4 × 10 + 3.'], ['4 × 10 + 3 = 43.', '4 × 10 + 3 = 43.']),
      ex(['Example 2: when are two plans equal?', 'Exemple 2 : quand deux plans sont-ils égaux ?'], ['Plan A starts at 5 and adds 4 a week. Plan B starts at 17 and adds 1 a week. The gap is 12, and A gains 3 a week.', 'Le plan A commence à 5 et ajoute 4 par semaine. Le plan B commence à 17 et ajoute 1 par semaine. L\'écart est de 12 et A gagne 3 par semaine.'], ['12 ÷ 3 = 4, so they are equal after 4 weeks.', '12 ÷ 3 = 4, donc ils sont égaux après 4 semaines.']),
      ex(['Example 3: combine, then evaluate', 'Exemple 3 : combiner, puis évaluer'], ['Simplify 3x + 8 + 4x − 2 to 7x + 6.', 'Simplifie 3x + 8 + 4x − 2 pour obtenir 7x + 6.'], ['When x = 5: 7 × 5 + 6 = 41.', 'Quand x = 5 : 7 × 5 + 6 = 41.']),
    ],
    tryIt: { skill: 'MS.G7.C1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra7.equations-inequalities',
    skills: ['MS.G7.C2.3.a', 'MS.G7.C2.4.a'],
    title: t('Equations and inequalities', 'Équations et inéquations'),
    intro: t('Solve an equation by undoing the steps. An inequality has many solutions: solve it the same way, then decide which numbers fit.', 'Résous une équation en défaisant les étapes. Une inéquation a beaucoup de solutions : résous-la de la même façon, puis décide quels nombres conviennent.'),
    definitions: [
      d(['Balance', 'Équilibre'], ['Do the same thing to both sides of an equation. Gather the letter terms on one side, then undo adding, then undo multiplying.', 'Fais la même chose des deux côtés d\'une équation. Rassemble les termes en lettres d\'un côté, défais l\'addition, puis défais la multiplication.']),
      d(['Inequality', 'Inéquation'], ['Symbols like <, >, ≤ and ≥ compare two sides. x < 5 does not include 5, but x ≤ 5 does.', 'Les symboles comme <, >, ≤ et ≥ comparent deux côtés. x < 5 n\'inclut pas 5, mais x ≤ 5 l\'inclut.']),
    ],
    examples: [
      ex(['Example 1: letters on both sides', 'Exemple 1 : des lettres des deux côtés'], ['Solve 5x + 3 = 2x + 21. Subtract 2x from both sides: 3x + 3 = 21.', 'Résous 5x + 3 = 2x + 21. Soustrais 2x des deux côtés : 3x + 3 = 21.'], ['Subtract 3: 3x = 18. Divide by 3: x = 6. Check: 33 = 33.', 'Soustrais 3 : 3x = 18. Divise par 3 : x = 6. Vérifie : 33 = 33.']),
      ex(['Example 2: a decimal equation', 'Exemple 2 : une équation à décimales'], ['Solve 2x + 1.5 = 9.5. Subtract 1.5: 2x = 8.', 'Résous 2x + 1,5 = 9,5. Soustrais 1,5 : 2x = 8.'], ['Divide by 2: x = 4.', 'Divise par 2 : x = 4.']),
      ex(['Example 3: an inequality', 'Exemple 3 : une inéquation'], ['Solve 3x + 2 < 20. Subtract 2: 3x < 18. Divide by 3: x < 6.', 'Résous 3x + 2 < 20. Soustrais 2 : 3x < 18. Divise par 3 : x < 6.'], ['6 is not allowed, so the greatest whole number is 5.', '6 n\'est pas permis, donc le plus grand nombre entier est 5.']),
    ],
    tryIt: { skill: 'MS.G7.C2.3.a', tier: 1, seed: 4 },
  },
  {
    id: 'L.data7.percents-graphs-mean',
    skills: ['MS.G7.D1.2.a', 'MS.G7.D1.3.a', 'MS.G7.D1.5.a'],
    title: t('Percentages, circle graphs and the mean', 'Pourcentages, diagrammes circulaires et moyenne'),
    intro: t('Percentages make groups of different sizes easy to compare. A circle graph turns percents into angles. The mean changes when you add or remove data.', 'Les pourcentages permettent de comparer facilement des groupes de tailles différentes. Un diagramme circulaire transforme les pourcentages en angles. La moyenne change quand on ajoute ou retire des données.'),
    definitions: [
      d(['Percent of a group', 'Pourcentage d\'un groupe'], ['Divide the part by the whole and multiply by 100. To find a part, multiply the whole by the percent as a decimal.', 'Divise la partie par le tout et multiplie par 100. Pour trouver une partie, multiplie le tout par le pourcentage écrit en nombre décimal.']),
      d(['Circle graph', 'Diagramme circulaire'], ['The whole circle is 360° and 100%. A sector of 25% has an angle of 0.25 × 360 = 90°.', 'Le cercle entier fait 360° et 100 %. Un secteur de 25 % a un angle de 0,25 × 360 = 90°.']),
      d(['Mean and totals', 'Moyenne et totaux'], ['Mean = total ÷ count. To see what changes, work with totals: total = mean × count.', 'Moyenne = total ÷ nombre de valeurs. Pour voir ce qui change, travaille avec les totaux : total = moyenne × nombre de valeurs.']),
    ],
    examples: [
      ex(['Example 1: a percent', 'Exemple 1 : un pourcentage'], ['18 of 25 students walk. 18 ÷ 25 = 0.72.', '18 élèves sur 25 marchent. 18 ÷ 25 = 0,72.'], ['0.72 × 100 = 72%.', '0,72 × 100 = 72 %.']),
      ex(['Example 2: an angle', 'Exemple 2 : un angle'], ['A sector shows 35% of the data. Find 35% of 360°.', 'Un secteur représente 35 % des données. Trouve 35 % de 360°.'], ['0.35 × 360 = 126°.', '0,35 × 360 = 126°.']),
      ex(['Example 3: adding data', 'Exemple 3 : ajouter une donnée'], ['The mean of 4 numbers is 10, so the total is 40. Add the number 20: the total is 60 with 5 numbers.', 'La moyenne de 4 nombres est 10, donc le total est 40. Ajoute le nombre 20 : le total est 60 avec 5 nombres.'], ['The new mean is 60 ÷ 5 = 12.', 'La nouvelle moyenne est 60 ÷ 5 = 12.']),
    ],
    tryIt: { skill: 'MS.G7.D1.3.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.data7.probability',
    skills: ['MS.G7.D2.1.a', 'MS.G7.D2.2.a'],
    title: t('Probability of two events', 'Probabilité de deux événements'),
    intro: t('For two events in a row, multiply their probabilities. Whether the first draw changes the second decides how.', 'Pour deux événements de suite, multiplie leurs probabilités. Ce qui compte, c\'est de savoir si le premier tirage change le deuxième.'),
    definitions: [
      d(['Independent and dependent', 'Indépendants et dépendants'], ['Events are independent if the first does not change the chances of the second (the marble is put back). They are dependent if it does (the marble is kept).', 'Des événements sont indépendants si le premier ne change pas les chances du deuxième (la bille est remise). Ils sont dépendants s\'il les change (la bille est gardée).']),
      d(['Theoretical and experimental', 'Théorique et expérimentale'], ['Theoretical probability comes from counting equal outcomes. Experimental probability is what actually happened: successes ÷ trials.', 'La probabilité théorique vient du dénombrement de résultats également probables. La probabilité expérimentale est ce qui s\'est vraiment passé : succès ÷ essais.']),
    ],
    examples: [
      ex(['Example 1: independent', 'Exemple 1 : indépendants'], [`A bag has 2 red and 3 blue marbles. Draw, replace, draw: both red is ${f(2, 5)} × ${f(2, 5)}.`, `Un sac contient 2 billes rouges et 3 bleues. Tire, remets, tire : deux rouges, c'est ${f(2, 5)} × ${f(2, 5)}.`], [`${f(4, 25)}.`, `${f(4, 25)}.`]),
      ex(['Example 2: dependent', 'Exemple 2 : dépendants'], [`Now keep the first marble. The second draw is from 4 marbles with 1 red left: ${f(2, 5)} × ${f(1, 4)}.`, `Garde maintenant la première bille. Le deuxième tirage se fait parmi 4 billes dont 1 rouge : ${f(2, 5)} × ${f(1, 4)}.`], [`${f(2, 20)} simplifies to ${f(1, 10)}.`, `${f(2, 20)} se simplifie en ${f(1, 10)}.`]),
      ex(['Example 3: expected and experimental', 'Exemple 3 : attendu et expérimental'], ['A spinner is green on 3 of 8 equal sections. In 80 spins, expect 80 × 3 ÷ 8 = 30 greens.', 'Une roulette est verte sur 3 sections égales sur 8. En 80 tours, attends-toi à 80 × 3 ÷ 8 = 30 verts.'], ['If it landed on green 36 times, that is 6 more than expected.', 'Si elle s\'est arrêtée sur le vert 36 fois, c\'est 6 de plus que prévu.']),
    ],
    tryIt: { skill: 'MS.G7.D2.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.space7.solids-transformations',
    skills: ['MS.G7.E1.1.a', 'MS.G7.E1.3.a', 'MS.G7.E1.4.a'],
    title: t('Solids, dilations and transformations', 'Solides, dilatations et transformations'),
    intro: t('Counting faces, vertices and edges describes a solid. A dilation changes size by a scale factor. Transformations move points on the plane by rules.', 'Compter les faces, les sommets et les arêtes décrit un solide. Une dilatation change la taille selon un facteur d\'échelle. Les transformations déplacent des points du plan selon des règles.'),
    definitions: [
      d(['Prisms and pyramids', 'Prismes et pyramides'], ['A prism has two matching bases joined by rectangles. A pyramid has one base and triangles meeting at an apex. For a base with n sides, a prism has n + 2 faces, 2n vertices and 3n edges; a pyramid has n + 1 faces, n + 1 vertices and 2n edges.', 'Un prisme a deux bases identiques reliées par des rectangles. Une pyramide a une base et des triangles qui se rejoignent en un sommet. Pour une base à n côtés, un prisme a n + 2 faces, 2n sommets et 3n arêtes ; une pyramide a n + 1 faces, n + 1 sommets et 2n arêtes.']),
      d(['Scale factor', 'Facteur d\'échelle'], ['A dilation multiplies every length by the scale factor. Similar shapes have the same shape, with matching lengths in the same ratio.', 'Une dilatation multiplie chaque longueur par le facteur d\'échelle. Des figures semblables ont la même forme, avec des longueurs correspondantes dans le même rapport.']),
      d(['Transformations', 'Transformations'], ['A translation slides a point. A reflection in the y-axis changes x to −x; in the x-axis it changes y to −y. A 180° rotation about the origin sends (x, y) to (−x, −y).', 'Une translation fait glisser un point. Une réflexion par rapport à l\'axe des y change x en −x ; par rapport à l\'axe des x, elle change y en −y. Une rotation de 180° autour de l\'origine envoie (x, y) vers (−x, −y).']),
    ],
    examples: [
      ex(['Example 1: count edges', 'Exemple 1 : compter les arêtes'], ['A prism with a pentagon base (5 sides) has 5 + 5 + 5 edges.', 'Un prisme à base pentagonale (5 côtés) a 5 + 5 + 5 arêtes.'], ['That is 15 edges.', 'Cela fait 15 arêtes.']),
      ex(['Example 2: similar triangles', 'Exemple 2 : triangles semblables'], ['Sides 6 cm and 9 cm match, so the scale factor is 9 ÷ 6 = 1.5.', 'Les côtés de 6 cm et de 9 cm se correspondent : le facteur d\'échelle est 9 ÷ 6 = 1,5.'], ['A side of 8 cm becomes 8 × 1.5 = 12 cm.', 'Un côté de 8 cm devient 8 × 1,5 = 12 cm.']),
      ex(['Example 3: reflect a point', 'Exemple 3 : réfléchir un point'], ['Reflect (3, −2) in the y-axis. Only the x-coordinate changes sign.', 'Réfléchis (3, −2) par rapport à l\'axe des y. Seule la coordonnée x change de signe.'], ['The image is (−3, −2).', 'L\'image est (−3, −2).']),
    ],
    tryIt: { skill: 'MS.G7.E1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.space7.circles',
    skills: ['MS.G7.E2.3.a', 'MS.G7.E2.5.a'],
    title: t('Circumference and area of a circle', 'Circonférence et aire d\'un cercle'),
    intro: t('Pi (about 3.14) connects a circle\'s size to the distance around it and to the space inside it.', 'Pi (environ 3,14) relie la taille d\'un cercle à la distance autour de lui et à l\'espace à l\'intérieur.'),
    definitions: [
      d(['Circumference', 'Circonférence'], ['The distance around a circle: C = π × diameter, or C = 2 × π × radius. The diameter is twice the radius.', 'La distance autour d\'un cercle : C = π × diamètre, ou C = 2 × π × rayon. Le diamètre est le double du rayon.']),
      d(['Area', 'Aire'], ['The space inside: A = π × radius × radius. Square the radius first, then multiply by π.', 'L\'espace à l\'intérieur : A = π × rayon × rayon. Mets d\'abord le rayon au carré, puis multiplie par π.']),
    ],
    examples: [
      ex(['Example 1: circumference', 'Exemple 1 : circonférence'], ['A circle has a diameter of 10 cm. C = 3.14 × 10.', 'Un cercle a un diamètre de 10 cm. C = 3,14 × 10.'], ['C = 31.4 cm.', 'C = 31,4 cm.']),
      ex(['Example 2: area from a diameter', 'Exemple 2 : aire à partir du diamètre'], ['The diameter is 12 cm, so the radius is 6 cm. A = 3.14 × 6 × 6.', 'Le diamètre est de 12 cm, donc le rayon est de 6 cm. A = 3,14 × 6 × 6.'], ['A = 3.14 × 36 = 113.04 cm².', 'A = 3,14 × 36 = 113,04 cm².']),
      ex(['Example 3: a semicircle', 'Exemple 3 : un demi-cercle'], ['A semicircle with radius 4 cm. The whole circle has area 3.14 × 16 = 50.24 cm².', 'Un demi-cercle de rayon 4 cm. Le cercle entier a une aire de 3,14 × 16 = 50,24 cm².'], ['Half of that is 25.12 cm².', 'La moitié, c\'est 25,12 cm².']),
    ],
    tryIt: { skill: 'MS.G7.E2.5.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.space7.volume',
    skills: ['MS.G7.E2.1.a', 'MS.G7.E2.2.a', 'MS.G7.E2.6.a', 'MS.G7.E2.7.a', 'MS.G7.E2.7.b'],
    title: t('Volume, capacity and surface area', 'Volume, capacité et aire totale'),
    intro: t('Prisms and cylinders share one rule: volume is base area times height. Capacity, units and nets build on it.', 'Les prismes et les cylindres suivent la même règle : le volume est l\'aire de la base fois la hauteur. La capacité, les unités et les développements s\'appuient là-dessus.'),
    definitions: [
      d(['Volume and capacity', 'Volume et capacité'], ['Volume is the space a solid takes up, in cm³. Capacity is how much a container holds, in mL or L. 1 cm³ = 1 mL, and 1000 mL = 1 L.', 'Le volume est l\'espace qu\'occupe un solide, en cm³. La capacité est ce qu\'un contenant peut contenir, en mL ou en L. 1 cm³ = 1 mL, et 1000 mL = 1 L.']),
      d(['Units', 'Unités'], ['Area has two lengths, so 1 m² = 100 × 100 = 10 000 cm². Volume has three, so 1 m³ = 1 000 000 cm³.', 'L\'aire comporte deux longueurs : 1 m² = 100 × 100 = 10 000 cm². Le volume en comporte trois : 1 m³ = 1 000 000 cm³.']),
      d(['Cylinder net', 'Développement d\'un cylindre'], ['A cylinder net is two circles and a rectangle. The rectangle is as long as the circumference and as tall as the cylinder. Surface area = two circles + the rectangle.', 'Le développement d\'un cylindre comprend deux cercles et un rectangle. Le rectangle est aussi long que la circonférence et aussi haut que le cylindre. Aire totale = deux cercles + le rectangle.']),
    ],
    examples: [
      ex(['Example 1: a prism', 'Exemple 1 : un prisme'], ['A triangular prism: the base triangle has base 6 cm and height 4 cm, so its area is 6 × 4 ÷ 2 = 12 cm².', 'Un prisme triangulaire : le triangle de base a 6 cm de base et 4 cm de hauteur, donc son aire est 6 × 4 ÷ 2 = 12 cm².'], ['The prism is 10 cm long: volume = 12 × 10 = 120 cm³.', 'Le prisme mesure 10 cm de long : volume = 12 × 10 = 120 cm³.']),
      ex(['Example 2: a cylinder', 'Exemple 2 : un cylindre'], ['Radius 3 cm, height 10 cm. Base area = 3.14 × 3 × 3 = 28.26 cm².', 'Rayon de 3 cm, hauteur de 10 cm. Aire de la base = 3,14 × 3 × 3 = 28,26 cm².'], ['Volume = 28.26 × 10 = 282.6 cm³.', 'Volume = 28,26 × 10 = 282,6 cm³.']),
      ex(['Example 3: surface area', 'Exemple 3 : aire totale'], ['Same cylinder. Two circles: 2 × 28.26 = 56.52 cm². The rectangle: circumference 18.84 cm × height 10 cm = 188.4 cm².', 'Même cylindre. Deux cercles : 2 × 28,26 = 56,52 cm². Le rectangle : circonférence de 18,84 cm × hauteur de 10 cm = 188,4 cm².'], ['Total: 56.52 + 188.4 = 244.92 cm².', 'Total : 56,52 + 188,4 = 244,92 cm².']),
    ],
    tryIt: { skill: 'MS.G7.E2.7.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.finance7.money',
    skills: ['MS.G7.F1.1.a', 'MS.G7.F1.3.a', 'MS.G7.F1.5.a', 'MS.G7.F1.6.a'],
    title: t('Exchange rates, budgets and interest', 'Taux de change, budgets et intérêt'),
    intro: t('Money decisions use a few tools: convert with a rate, plan with a budget, and see how interest grows savings or adds to a loan.', 'Les décisions d\'argent reposent sur quelques outils : convertir avec un taux, planifier avec un budget, et voir comment l\'intérêt fait croître l\'épargne ou s\'ajoute à un prêt.'),
    definitions: [
      d(['Exchange rate', 'Taux de change'], ['The rate tells how much of one currency you get for one of another. Multiply when the rate is for the currency you start with; divide to go the other way.', 'Le taux indique combien d\'une monnaie tu obtiens pour une unité d\'une autre. Multiplie quand le taux est donné pour la monnaie de départ ; divise pour aller dans l\'autre sens.']),
      d(['Budget', 'Budget'], ['A budget compares income with planned spending. What is left = income − spending. When a cost changes, redo the budget.', 'Un budget compare le revenu et les dépenses prévues. Ce qui reste = revenu − dépenses. Quand un coût change, refais le budget.']),
      d(['Simple and compound interest', 'Intérêt simple et composé'], ['Simple interest is earned on the original amount only: I = P × rate × years. Compound interest is earned on the amount plus the interest already earned.', 'L\'intérêt simple est calculé sur le montant de départ seulement : I = P × taux × années. L\'intérêt composé est calculé sur le montant plus l\'intérêt déjà gagné.']),
    ],
    examples: [
      ex(['Example 1: exchange', 'Exemple 1 : change'], ['1 US dollar = 1.35 Canadian dollars. A 60 US dollar jacket costs 60 × 1.35.', '1 dollar américain = 1,35 dollar canadien. Un manteau de 60 dollars américains coûte 60 × 1,35.'], ['That is 81 Canadian dollars.', 'Cela fait 81 dollars canadiens.']),
      ex(['Example 2: simple interest', 'Exemple 2 : intérêt simple'], ['Save 500 dollars at 4% simple interest for 3 years. One year earns 20 dollars.', 'Épargne 500 dollars à 4 % d\'intérêt simple pendant 3 ans. Une année rapporte 20 dollars.'], ['3 years earn 3 × 20 = 60 dollars.', '3 ans rapportent 3 × 20 = 60 dollars.']),
      ex(['Example 3: compound interest', 'Exemple 3 : intérêt composé'], ['Save 500 dollars at 4% compounded yearly. After year 1: 500 × 1.04 = 520 dollars.', 'Épargne 500 dollars à 4 % composé annuellement. Après l\'année 1 : 500 × 1,04 = 520 dollars.'], ['After year 2: 520 × 1.04 = 540.80 dollars, which is more than simple interest gives (540).', 'Après l\'année 2 : 520 × 1,04 = 540,80 dollars, soit plus que ce que donne l\'intérêt simple (540).']),
    ],
    tryIt: { skill: 'MS.G7.F1.5.a', tier: 1, seed: 3 },
  },
];
