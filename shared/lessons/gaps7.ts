// Lessons for the Grade 7 completion skills: number, patterns and code, data, views and circles, and financial decisions.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GAPS7_LESSONS: Lesson[] = [
  {
    id: 'L.gaps7.number',
    skills: ['MS.G7.B1.1.a', 'MS.G7.B1.5.a', 'MS.G7.B1.6.a', 'MS.G7.B2.2.a', 'MS.G7.B2.2.b'],
    title: t('Big numbers, rounding and equivalents', 'Grands nombres, arrondis et équivalents'),
    intro: t('Place value works the same way in every size of number. These skills help you read, round and compare numbers, and move between fractions, decimals and percents.', 'La valeur de position fonctionne de la même façon pour tous les nombres. Ces habiletés t\'aident à lire, arrondir et comparer des nombres, et à passer entre fractions, nombres décimaux et pourcentages.'),
    definitions: [
      d(['Place value and powers of ten', 'Valeur de position et puissances de dix'], ['In 482 305 160, the 8 is worth 8 × 10 000 000. A digit is worth the digit times 10 to the number of digits to its right.', 'Dans 482 305 160, le 8 vaut 8 × 10 000 000. Un chiffre vaut le chiffre fois 10 à la puissance du nombre de chiffres à sa droite.']),
      d(['Rounding', 'Arrondir'], ['Look at the digit just after the place you are rounding to. If it is 5 or more, round up; if it is 4 or less, keep the digit.', 'Regarde le chiffre juste après la position d\'arrondi. S\'il est 5 ou plus, arrondis vers le haut ; s\'il est 4 ou moins, garde le chiffre.']),
      d(['Between two numbers', 'Entre deux nombres'], ['There are always numbers between two different numbers. Halfway is their average; for fractions with the same denominator, double the denominator to find one.', 'Il y a toujours des nombres entre deux nombres différents. À mi-chemin se trouve leur moyenne ; pour des fractions de même dénominateur, double le dénominateur pour en trouver une.']),
      d(['Equivalents', 'Équivalents'], ['Fraction to percent: divide the top by the bottom, then multiply by 100. For example, 3/8 = 0.375 = 37.5%. Percent to decimal: divide by 100.', 'De la fraction au pourcentage : divise le numérateur par le dénominateur, puis multiplie par 100. Par exemple, 3/8 = 0,375 = 37,5 %. Du pourcentage au nombre décimal : divise par 100.']),
    ],
    examples: [
      ex(['Example 1: expanded form', 'Exemple 1 : forme développée'], ['What is 3 × 10⁸ + 5 × 10⁶ + 2 × 10³?', 'Que vaut 3 × 10⁸ + 5 × 10⁶ + 2 × 10³ ?'], ['That is 300 000 000 + 5 000 000 + 2 000 = 305 002 000.', 'C\'est 300 000 000 + 5 000 000 + 2 000, soit 305 002 000.']),
      ex(['Example 2: rounding', 'Exemple 2 : arrondir'], ['Round 3.947 to the nearest hundredth. The next digit after the hundredths place is 7, so round up.', 'Arrondis 3,947 au centième près. Le chiffre après les centièmes est 7 : arrondis vers le haut.'], ['The answer is 3.95.', 'La réponse est 3,95.']),
      ex(['Example 3: a percent', 'Exemple 3 : un pourcentage'], ['Write 7/8 as a percent. 7 ÷ 8 = 0.875.', 'Écris 7/8 en pourcentage. 7 ÷ 8 = 0,875.'], ['0.875 × 100 = 87.5, so it is 87.5%.', '0,875 × 100 = 87,5 : c\'est donc 87,5 %.']),
    ],
    tryIt: { skill: 'MS.G7.B1.6.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.gaps7.patterns-code',
    skills: ['MS.G7.C1.2.a', 'MS.G7.C3.1.a', 'MS.G7.C3.2.a'],
    title: t('Patterns, rules and simple programs', 'Suites, règles et programmes simples'),
    intro: t('A rule such as C = 2.5n + 4 describes a whole pattern. A program does the same job step by step, with a count for how many times to repeat and sub-programs for jobs it uses again.', 'Une règle comme C = 2,5n + 4 décrit toute une suite. Un programme fait le même travail étape par étape, avec un compteur pour le nombre de répétitions et des sous-programmes pour les tâches réutilisées.'),
    definitions: [
      d(['Rule of a pattern', 'Règle d\'une suite'], ['In C = 2.5n + 4, n is the term number. Multiply n by 2.5, then add 4. To find n from C, undo the steps in reverse: subtract 4, then divide by 2.5.', 'Dans C = 2,5n + 4, n est le numéro du terme. Multiplie n par 2,5, puis ajoute 4. Pour trouver n à partir de C, annule les étapes dans l\'ordre inverse : soustrais 4, puis divise par 2,5.']),
      d(['Sub-program', 'Sous-programme'], ['A sub-program is a named set of steps that takes a number and gives one back. The main program can call it again and again.', 'Un sous-programme est un ensemble d\'étapes nommé qui prend un nombre et en retourne un. Le programme principal peut l\'appeler plusieurs fois.']),
      d(['Altering a program', 'Modifier un programme'], ['When you change a count or a number in a program, rerun it step by step with the new value. Do not assume the output changes by the same amount.', 'Quand tu changes un compteur ou un nombre dans un programme, relis-le étape par étape avec la nouvelle valeur. Ne suppose pas que la sortie change du même montant.']),
    ],
    examples: [
      ex(['Example 1: a rule', 'Exemple 1 : une règle'], ['Use C = 1.5n + 3 for n = 8. Multiply: 1.5 × 8 = 12.', 'Utilise C = 1,5n + 3 pour n = 8. Multiplie : 1,5 × 8 = 12.'], ['Add 3: C = 15.', 'Ajoute 3 : C = 15.']),
      ex(['Example 2: a sub-program', 'Exemple 2 : un sous-programme'], ['double(x) gives x × 2. The program starts with x = 3 and calls double on x three times.', 'double(x) retourne x × 2. Le programme commence avec x = 3 et appelle double sur x trois fois.'], ['x becomes 6, then 12, then 24. The answer is 24.', 'x devient 6, puis 12, puis 24. La réponse est 24.']),
      ex(['Example 3: how many repeats', 'Exemple 3 : combien de répétitions'], ['Start at 5 and add 7 each time. How many repeats to reach at least 60? The growth needed is 55.', 'Pars de 5 et ajoute 7 chaque fois. Combien de répétitions pour atteindre au moins 60 ? La croissance nécessaire est 55.'], ['55 ÷ 7 is about 7.9, so round up: 8 repeats.', '55 ÷ 7 donne environ 7,9 : arrondis vers le haut : 8 répétitions.']),
    ],
    tryIt: { skill: 'MS.G7.C1.2.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.gaps7.data',
    skills: ['MS.G7.D1.1.a', 'MS.G7.D1.4.a', 'MS.G7.D1.6.a'],
    title: t('Percents, infographics and misleading data', 'Pourcentages, infographies et données trompeuses'),
    intro: t('Percents let you compare groups of different sizes. A good infographic gives the full picture, and a misleading one can change how big a difference looks.', 'Les pourcentages permettent de comparer des groupes de tailles différentes. Une bonne infographie donne le tableau complet, et une infographie trompeuse peut changer l\'apparence d\'un écart.'),
    definitions: [
      d(['Why percents', 'Pourquoi des pourcentages'], ['A percent is out of 100, so it puts every group on the same scale. 45 of 90 and 90 of 200 are both 50% and 45%, so the shares can be compared fairly.', 'Un pourcentage est sur 100 : il place tous les groupes sur la même échelle. 45 sur 90 et 90 sur 200 donnent 50 % et 45 %, et les parts peuvent être comparées équitablement.']),
      d(['A good infographic', 'Une bonne infographie'], ['It has a title, labelled axes with units, the source and date of the data, and a key for colours. Headlines must match the data: percent increase = increase ÷ starting amount × 100.', 'Elle a un titre, des axes étiquetés avec des unités, la source et la date des données, et une légende. Les titres doivent correspondre aux données : pourcentage d\'augmentation = augmentation ÷ valeur de départ × 100.']),
      d(['Misleading graphs and statistics', 'Graphiques et statistiques trompeurs'], ['Watch for a vertical axis that does not start at 0, uneven scales, pictures that grow in two directions, and leaving out data. A very large value pulls the mean up, so the median can describe a typical value better.', 'Méfie-toi d\'un axe vertical qui ne commence pas à 0, d\'échelles inégales, d\'images qui grandissent dans deux directions et de données omises. Une très grande valeur tire la moyenne vers le haut : la médiane décrit parfois mieux une valeur typique.']),
    ],
    examples: [
      ex(['Example 1: a percent', 'Exemple 1 : un pourcentage'], ['60 of 250 students chose art. 60 ÷ 250 = 0.24.', '60 élèves sur 250 ont choisi les arts. 60 ÷ 250 = 0,24.'], ['0.24 × 100 = 24, so 24% chose art.', '0,24 × 100 = 24 : 24 % ont choisi les arts.']),
      ex(['Example 2: a truncated axis', 'Exemple 2 : un axe tronqué'], ['An axis starts at 40. Bars show 45 and 60. The visible heights are 5 and 20.', 'Un axe commence à 40. Les barres montrent 45 et 60. Les hauteurs visibles sont 5 et 20.'], ['The second bar looks 4 times as tall, but 60 ÷ 45 is only about 1.3.', 'La deuxième barre paraît 4 fois plus haute, mais 60 ÷ 45 ne vaut qu\'environ 1,3.']),
    ],
    tryIt: { skill: 'MS.G7.D1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.gaps7.views-circles',
    skills: ['MS.G7.E1.2.a', 'MS.G7.E2.4.a'],
    title: t('Views of a model and constructing circles', 'Vues d\'un modèle et construction de cercles'),
    intro: t('Architects and designers use top, front and side views drawn to scale. A compass draws a circle, and its opening is the radius.', 'Les architectes et les concepteurs utilisent des vues de dessus, de face et de côté dessinées à l\'échelle. Un compas trace un cercle, et son ouverture est le rayon.'),
    definitions: [
      d(['Top and front views', 'Vues de dessus et de face'], ['From the top, every stack that has at least one cube is one square. From the front, each column shows its tallest stack, because shorter stacks behind it are hidden.', 'De dessus, chaque pile d\'au moins un cube est un carré. De face, chaque colonne montre sa pile la plus haute, parce que les piles plus basses derrière elle sont cachées.']),
      d(['Scale', 'Échelle'], ['If 1 cm on the drawing stands for 5 m, then a length on the drawing is multiplied by 5 to get the real length in metres.', 'Si 1 cm sur le dessin représente 5 m, on multiplie une longueur du dessin par 5 pour obtenir la longueur réelle en mètres.']),
      d(['Radius and diameter', 'Rayon et diamètre'], ['The compass opening is the radius, half of the diameter. Two circles share 2 points if the distance between their centres is between the difference and the sum of their radii; 1 if it equals either; 0 otherwise.', 'L\'ouverture du compas est le rayon, la moitié du diamètre. Deux cercles ont 2 points communs si la distance entre leurs centres est entre la différence et la somme de leurs rayons ; 1 si elle est égale à l\'une des deux ; 0 sinon.']),
    ],
    examples: [
      ex(['Example 1: a front view', 'Exemple 1 : une vue de face'], ['Column heights from the front row 2, 0, 3 and the back row 1, 2, 3. Take the taller stack in each column.', 'Hauteurs de colonne : rangée avant 2, 0, 3 et rangée arrière 1, 2, 3. Prends la pile la plus haute de chaque colonne.'], ['The columns show 2, 2 and 3, so there are 7 squares.', 'Les colonnes montrent 2, 2 et 3 : il y a 7 carrés.']),
      ex(['Example 2: a compass', 'Exemple 2 : un compas'], ['A circle 14 cm across needs a compass opening of half that.', 'Un cercle de 14 cm de diamètre demande une ouverture de compas égale à la moitié.'], ['The opening is 7 cm.', 'L\'ouverture est de 7 cm.']),
    ],
    tryIt: { skill: 'MS.G7.E2.4.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.gaps7.money-decisions',
    skills: ['MS.G7.F1.2.a', 'MS.G7.F1.4.a'],
    title: t('Reliable sources and smart choices', 'Sources fiables et choix éclairés'),
    intro: t('Good money decisions start with good information, and then with comparing the true cost, not just the price on the tag.', 'Les bonnes décisions d\'argent commencent par une bonne information, puis par la comparaison du vrai coût, pas seulement du prix sur l\'étiquette.'),
    definitions: [
      d(['Reliable sources', 'Sources fiables'], ['Ask who made it, whether they gain from your choice, and whether they show their evidence. Independent testing and official statistics are usually more reliable than ads or posts with no source.', 'Demande qui l\'a produite, si elle gagne quelque chose de ton choix, et si elle montre ses preuves. Les essais indépendants et les statistiques officielles sont généralement plus fiables que des publicités ou des messages sans source.']),
      d(['Compare the true cost', 'Comparer le vrai coût'], ['Compare unit prices (price ÷ amount), include delivery and discounts, and spread the price over how long it lasts. The lowest price tag is not always the lowest cost.', 'Compare les prix unitaires (prix ÷ quantité), inclus la livraison et les rabais, et répartis le prix sur la durée de vie. Le prix le plus bas n\'est pas toujours le coût le plus bas.']),
    ],
    examples: [
      ex(['Example 1: unit price', 'Exemple 1 : prix unitaire'], ['A pack of 12 costs 9 dollars and a pack of 20 costs 14 dollars. Per item: 9 ÷ 12 = 0.75 and 14 ÷ 20 = 0.70.', 'Un paquet de 12 coûte 9 dollars et un paquet de 20 coûte 14 dollars. Par article : 9 ÷ 12 = 0,75 et 14 ÷ 20 = 0,70.'], ['The pack of 20 is the better buy at 0.70 dollars per item.', 'Le paquet de 20 est la meilleure affaire à 0,70 dollar par article.']),
      ex(['Example 2: cost per year', 'Exemple 2 : coût par année'], ['Boots A cost 120 dollars and last 4 years; boots B cost 75 dollars and last 2 years.', 'Les bottes A coûtent 120 dollars et durent 4 ans ; les bottes B coûtent 75 dollars et durent 2 ans.'], ['A costs 30 dollars a year and B costs 37.50 dollars a year, so A costs less.', 'A coûtent 30 dollars par an et B 37,50 dollars par an : A coûtent moins.']),
    ],
    tryIt: { skill: 'MS.G7.F1.4.a', tier: 1, seed: 2 },
  },
];
