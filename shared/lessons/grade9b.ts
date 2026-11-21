// Lessons for Grade 9 (MTH1W) coding and relations, data and modelling, geometry and measurement, and financial literacy.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE9B_LESSONS: Lesson[] = [
  {
    id: 'L.g9.code-relations',
    skills: ['MS.G9.C2.1.a', 'MS.G9.C2.2.a', 'MS.G9.C2.3.a', 'MS.G9.C4.1.a'],
    title: t('Coding with equations, and linear against non-linear', 'Programmer avec des équations, et linéaire contre non linéaire'),
    intro: t('A program is a list of steps. You can read it, run it by hand, change it, and break a real situation into steps. Relations also come in two kinds: linear (a constant rate of change) and non-linear.', 'Un programme est une liste d\'étapes. On peut le lire, l\'exécuter à la main, le modifier et découper une situation réelle en étapes. Les relations sont aussi de deux sortes : linéaires (taux de variation constant) et non linéaires.'),
    definitions: [
      d(['Running code by hand', 'Exécuter un programme à la main'], ['Put the given number in for the variable, follow the order of operations, and check any "if" test to see which branch runs.', 'Remplace la variable par le nombre donné, suis l\'ordre des opérations et vérifie chaque test « si » pour voir quelle branche s\'exécute.']),
      d(['Breaking a problem into steps', 'Découper un problème en étapes'], ['List what is known, what repeats, and in what order the calculations must happen. Use each result in the next step. For a loop that stops at a goal, divide what is still needed by what is added each time, and round up.', 'Liste ce qui est connu, ce qui se répète et dans quel ordre faire les calculs. Utilise chaque résultat dans l\'étape suivante. Pour une boucle qui s\'arrête à un objectif, divise ce qu\'il manque par ce qui s\'ajoute chaque fois, et arrondis vers le haut.']),
      d(['Altering code', 'Modifier un programme'], ['After a change, run the program again with the new value. Compare with the old result instead of guessing.', 'Après une modification, exécute de nouveau le programme avec la nouvelle valeur. Compare avec l\'ancien résultat au lieu de deviner.']),
      d(['Linear or not?', 'Linéaire ou non ?'], ['A linear relation changes by the same amount for each equal step: its first differences are equal and its graph is a straight line. Squares, powers of 2, and xy = k are non-linear: their differences change.', 'Une relation linéaire change du même montant à chaque pas égal : ses premières différences sont égales et son graphique est une droite. Les carrés, les puissances de 2 et xy = k sont non linéaires : leurs différences changent.']),
    ],
    examples: [
      ex(['Example 1: an if test', 'Exemple 1 : un test si'], ['y = 3x + 4 with x = 6 gives y = 22. If y is more than 20 the program returns y − 20.', 'y = 3x + 4 avec x = 6 donne y = 22. Si y est plus grand que 20, le programme retourne y − 20.'], ['22 is more than 20, so it returns 2.', '22 est plus grand que 20 : il retourne 2.']),
      ex(['Example 2: a loop that stops', 'Exemple 2 : une boucle qui s\'arrête'], ['Start at 10 and add 7 each time until the total is at least 60. The total must grow by 50.', 'Pars de 10 et ajoute 7 chaque fois jusqu\'à ce que le total soit au moins 60. Le total doit augmenter de 50.'], ['50 ÷ 7 is about 7.1, so the loop runs 8 times.', '50 ÷ 7 donne environ 7,1 : la boucle s\'exécute 8 fois.']),
      ex(['Example 3: a table', 'Exemple 3 : un tableau'], ['The y-values 5, 8, 11, 14 change by 3 each time.', 'Les valeurs de y 5, 8, 11, 14 changent de 3 chaque fois.'], ['The differences are equal, so the relation is linear.', 'Les différences sont égales : la relation est linéaire.']),
    ],
    tryIt: { skill: 'MS.G9.C2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g9.data-modelling',
    skills: ['MS.G9.D1.1.a', 'MS.G9.D1.2.a', 'MS.G9.D1.3.a', 'MS.G9.D2.1.a', 'MS.G9.D2.2.a', 'MS.G9.D2.3.a', 'MS.G9.D2.4.a', 'MS.G9.D2.5.a'],
    title: t('Data, scatter plots and the modelling cycle', 'Données, nuages de points et cycle de modélisation'),
    intro: t('Good conclusions need good data. A model goes through a cycle: ask a clear question, plan and state assumptions, analyse, check the fit, and report the limits honestly.', 'De bonnes conclusions demandent de bonnes données. Un modèle suit un cycle : poser une question claire, planifier et énoncer des hypothèses, analyser, vérifier l\'ajustement et rapporter honnêtement les limites.'),
    definitions: [
      d(['Large data sets', 'Grands ensembles de données'], ['More data from a fair, random sample gives a steadier picture. A big data set from one narrow group is still biased. Remove names to protect privacy and say who is missing.', 'Plus de données issues d\'un échantillon juste et aléatoire donnent un portrait plus stable. Un grand ensemble venant d\'un seul groupe restreint est quand même biaisé. Retire les noms pour protéger la vie privée et dis qui manque.']),
      d(['Quartiles', 'Quartiles'], ['Order the data. Q2 is the median. Q1 is the median of the lower half and Q3 the median of the upper half. The interquartile range is Q3 − Q1. A value more than 1.5 × IQR below Q1 or above Q3 is an outlier.', 'Range les données. Q2 est la médiane. Q1 est la médiane de la moitié inférieure et Q3 celle de la moitié supérieure. L\'écart interquartile est Q3 − Q1. Une valeur à plus de 1,5 × EIQ sous Q1 ou au-dessus de Q3 est une valeur aberrante.']),
      d(['Scatter plots', 'Nuages de points'], ['Points rising left to right show a positive correlation; falling, a negative one; no direction, little or none. A line of best fit gives predictions: put x in the equation. The residual is actual − predicted.', 'Des points qui montent de gauche à droite montrent une corrélation positive ; qui descendent, une négative ; sans direction, peu ou pas de corrélation. Une droite de meilleur ajustement donne des prédictions : remplace x dans l\'équation. Le résidu est réel − prédit.']),
      d(['The modelling cycle', 'Le cycle de modélisation'], ['Question of interest (specific and measurable), plan and assumptions, analysis (scatter plot, median, IQR), fit (small residuals with no pattern), and limits (do not predict far outside the data; a relationship is not proof of a cause).', 'Question d\'intérêt (précise et mesurable), plan et hypothèses, analyse (nuage de points, médiane, EIQ), ajustement (petits résidus sans tendance) et limites (ne pas prédire loin des données ; une relation n\'est pas la preuve d\'une cause).']),
    ],
    examples: [
      ex(['Example 1: quartiles', 'Exemple 1 : quartiles'], ['Data 3, 5, 7, 8, 12, 14, 18, 21. The lower half is 3, 5, 7, 8, so Q1 = 6. The upper half is 12, 14, 18, 21, so Q3 = 16.', 'Données 3, 5, 7, 8, 12, 14, 18, 21. La moitié inférieure est 3, 5, 7, 8 : Q1 = 6. La moitié supérieure est 12, 14, 18, 21 : Q3 = 16.'], ['The interquartile range is 16 − 6 = 10.', 'L\'écart interquartile est 16 − 6 = 10.']),
      ex(['Example 2: a residual', 'Exemple 2 : un résidu'], ['The line is y = 2x + 10. At x = 8 it predicts 26, but the data value is 31.', 'La droite est y = 2x + 10. À x = 8, elle prédit 26, mais la valeur des données est 31.'], ['The residual is 31 − 26 = 5.', 'Le résidu est 31 − 26 = 5.']),
    ],
    tryIt: { skill: 'MS.G9.D1.2.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g9.measurement',
    skills: ['MS.G9.E1.2.a', 'MS.G9.E1.3.a', 'MS.G9.E1.4.a', 'MS.G9.E1.5.a', 'MS.G9.E1.6.a'],
    title: t('Designing, converting, scaling and volume', 'Concevoir, convertir, agrandir et calculer des volumes'),
    intro: t('Designers use triangle and circle properties, change units, scale a model up or down, and use the Pythagorean theorem and volume relationships.', 'Les concepteurs utilisent les propriétés des triangles et des cercles, changent d\'unités, agrandissent ou réduisent un modèle, et utilisent le théorème de Pythagore et les relations entre volumes.'),
    definitions: [
      d(['Triangle and circle properties', 'Propriétés des triangles et des cercles'], ['Angles in a triangle add to 180°. The base angles of an isosceles triangle are equal. An angle drawn in a semicircle is 90°. Six equilateral triangles around a centre make a regular hexagon whose sides equal the radius.', 'Les angles d\'un triangle totalisent 180°. Les angles à la base d\'un triangle isocèle sont égaux. Un angle inscrit dans un demi-cercle vaut 90°. Six triangles équilatéraux autour d\'un centre forment un hexagone régulier dont les côtés égalent le rayon.']),
      d(['Units', 'Unités'], ['Going to a smaller unit, multiply; to a larger unit, divide. For area the factor is squared (1 m² = 10 000 cm²) and for volume it is cubed (1 m³ = 1 000 000 cm³ = 1000 litres). 1 inch = 2.54 cm.', 'Pour passer à une plus petite unité, on multiplie ; à une plus grande, on divise. Pour l\'aire, le facteur est mis au carré (1 m² = 10 000 cm²) et pour le volume, au cube (1 m³ = 1 000 000 cm³ = 1000 litres). 1 pouce = 2,54 cm.']),
      d(['Scaling', 'Mise à l\'échelle'], ['If every length is multiplied by k, perimeters (lengths) are multiplied by k, areas and surface areas by k², and volumes by k³.', 'Si chaque longueur est multipliée par k, les périmètres (longueurs) sont multipliés par k, les aires par k² et les volumes par k³.']),
      d(['Pythagoras and volumes', 'Pythagore et volumes'], ['In a composite shape, split it into right triangles and rectangles. The diagonal of a box is the square root of l² + w² + h². A pyramid is one third of a prism with the same base and height, and a cone is one third of a cylinder.', 'Dans une figure composée, découpe-la en triangles rectangles et en rectangles. La diagonale d\'une boîte est la racine carrée de l² + w² + h². Une pyramide est le tiers d\'un prisme de même base et de même hauteur, et un cône est le tiers d\'un cylindre.']),
    ],
    examples: [
      ex(['Example 1: scaling', 'Exemple 1 : mise à l\'échelle'], ['A model has a volume of 6 cm³. The real object is 4 times as long in every direction.', 'Une maquette a un volume de 6 cm³. L\'objet réel est 4 fois plus long dans toutes les directions.'], ['Volume scales by 4³ = 64, so the real volume is 384 cm³.', 'Le volume est multiplié par 4³ = 64 : le volume réel est de 384 cm³.']),
      ex(['Example 2: a trapezoid', 'Exemple 2 : un trapèze'], ['An isosceles trapezoid has bases 8 and 14 and slanted sides 5. Each end sticks out (14 − 8) ÷ 2 = 3.', 'Un trapèze isocèle a des bases de 8 et 14 et des côtés obliques de 5. Chaque extrémité dépasse de (14 − 8) ÷ 2 = 3.'], ['The height is √(25 − 9) = 4, so the area is (8 + 14) × 4 ÷ 2 = 44.', 'La hauteur est √(25 − 9) = 4 : l\'aire est (8 + 14) × 4 ÷ 2 = 44.']),
    ],
    tryIt: { skill: 'MS.G9.E1.4.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g9.finance',
    skills: ['MS.G9.F1.1.a', 'MS.G9.F1.2.a', 'MS.G9.F1.3.a', 'MS.G9.F1.4.a'],
    title: t('Prices over time, borrowing and budgets', 'Les prix dans le temps, l\'emprunt et les budgets'),
    intro: t('Money changes over time: prices rise, things lose or gain value, borrowing has a cost, and a budget can be adjusted to reach a goal.', 'L\'argent change dans le temps : les prix montent, les choses perdent ou gagnent de la valeur, emprunter a un coût, et un budget peut être ajusté pour atteindre un objectif.'),
    definitions: [
      d(['Then and now', 'Alors et maintenant'], ['Percent change = change ÷ original × 100. Compare earning and cost in hours of work: hours = cost ÷ hourly wage. A rise of 10% a year multiplies by 1.1 each year.', 'Variation en pourcentage = variation ÷ départ × 100. Compare gain et coût en heures de travail : heures = coût ÷ salaire horaire. Une hausse de 10 % par an multiplie par 1,1 chaque année.']),
      d(['Appreciation and depreciation', 'Appréciation et dépréciation'], ['The same amount each year gives a straight line. The same percent each year gives a curve: multiply by 1 + rate for a gain, or 1 − rate for a loss, once for each year.', 'Le même montant chaque année donne une droite. Le même pourcentage chaque année donne une courbe : multiplie par 1 + taux pour un gain, ou 1 − taux pour une perte, une fois par année.']),
      d(['The cost of borrowing', 'Le coût de l\'emprunt'], ['Simple interest is principal × rate × time. A larger down payment means less is borrowed and less interest is paid. A higher rate or a longer time costs more.', 'L\'intérêt simple est capital × taux × temps. Un acompte plus grand signifie qu\'on emprunte moins et qu\'on paie moins d\'intérêt. Un taux plus élevé ou une durée plus longue coûte plus cher.']),
      d(['Budgets', 'Budgets'], ['Savings = income − expenses. To cut a cost by a percent, multiply it by the percent; that amount is added to savings. To find the percent needed, divide the extra savings required by the cost being cut.', 'Épargne = revenu − dépenses. Pour réduire un coût d\'un pourcentage, multiplie-le par le pourcentage ; ce montant s\'ajoute à l\'épargne. Pour trouver le pourcentage nécessaire, divise l\'épargne supplémentaire requise par le coût réduit.']),
    ],
    examples: [
      ex(['Example 1: depreciation', 'Exemple 1 : dépréciation'], ['A car worth 10 000 dollars loses 20% of its value each year. The factor is 0.8.', 'Une voiture de 10 000 dollars perd 20 % de sa valeur chaque année. Le facteur est 0,8.'], ['After 2 years it is worth 10 000 × 0.8² = 6400 dollars.', 'Après 2 ans, elle vaut 10 000 × 0,8² = 6400 dollars.']),
      ex(['Example 2: a loan', 'Exemple 2 : un prêt'], ['A 2000 dollar sofa has a 500 dollar down payment, so 1500 dollars is borrowed for 3 years at 6% simple interest.', 'Un canapé de 2000 dollars a un acompte de 500 dollars : on emprunte 1500 dollars pour 3 ans à 6 % d\'intérêt simple.'], ['The interest is 1500 × 0.06 × 3 = 270, so the total cost is 500 + 1500 + 270 = 2270 dollars.', 'L\'intérêt est 1500 × 0,06 × 3 = 270 : le coût total est 500 + 1500 + 270 = 2270 dollars.']),
    ],
    tryIt: { skill: 'MS.G9.F1.2.a', tier: 1, seed: 2 },
  },
];
