// Lessons for Grade 12 Data Management and Applications for College (MAP4C): models, personal finance, geometry and trigonometry, data.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE12D_LESSONS: Lesson[] = [
  {
    id: 'L.g12.map-models',
    skills: ['MS.G12.MAP4C.A1.1.a', 'MS.G12.MAP4C.A1.2.a', 'MS.G12.MAP4C.A1.3.a', 'MS.G12.MAP4C.A2.1.a', 'MS.G12.MAP4C.A3.1.a'],
    title: t('Exponents, comparing models and using formulas', 'Exposants, comparaison de modèles et utilisation de formules'),
    intro: t('Exponents describe growth and decay, and a straight-line model compares two options by a starting amount and a rate. Formulas let you find a missing value once you rearrange them.', 'Les exposants décrivent la croissance et la décroissance, et un modèle linéaire compare deux options par un montant de départ et un taux. Les formules permettent de trouver une valeur manquante une fois réarrangées.'),
    definitions: [
      d(['Rational exponents', 'Exposants rationnels'], ['a to the power 1/n is the nth root of a. a to the power m/n is the nth root of a, raised to the power m. For example 16 to the power 3/4 = (the 4th root of 16)³ = 2³ = 8.', 'a puissance 1/n est la racine n-ième de a. a puissance m/n est la racine n-ième de a, élevée à la puissance m. Par exemple, 16 puissance 3/4 = (la racine quatrième de 16)³ = 2³ = 8.']),
      d(['Exponent rules and equations', 'Règles des exposants et équations'], ['With the same base, add exponents when you multiply and subtract when you divide. To solve an exponential equation, write both sides with the same base and equate the exponents; otherwise use logarithms.', 'Avec la même base, on additionne les exposants en multipliant et on les soustrait en divisant. Pour résoudre une équation exponentielle, écris les deux membres avec la même base et égale les exposants ; sinon, utilise les logarithmes.']),
      d(['Comparing linear models', 'Comparer des modèles linéaires'], ['Cost = starting amount + rate × time. The two options cost the same when the costs are equal: set the two expressions equal and solve for the time.', 'Coût = montant de départ + taux × temps. Les deux options coûtent la même chose quand les coûts sont égaux : pose les deux expressions égales et résous pour le temps.']),
      d(['Formulas', 'Formules'], ['Undo the operations in reverse order, doing the same to both sides. To isolate a squared variable, divide first, then take the square root.', 'Défais les opérations dans l\'ordre inverse, en faisant la même chose aux deux membres. Pour isoler une variable au carré, divise d\'abord, puis prends la racine carrée.']),
    ],
    examples: [
      ex(['Example 1: rational exponents', 'Exemple 1 : exposants rationnels'], ['Evaluate 16 to the power 3/4. The 4th root of 16 is 2.', 'Évalue 16 puissance 3/4. La racine quatrième de 16 est 2.'], ['Then 2³ = 8.', 'Alors 2³ = 8.']),
      ex(['Example 2: an exponential equation', 'Exemple 2 : une équation exponentielle'], ['Solve 4ˣ = 64. Write 64 as 4³.', 'Résous 4ˣ = 64. Écris 64 sous la forme 4³.'], ['The exponents match, so x = 3.', 'Les exposants sont égaux : x = 3.']),
      ex(['Example 3: when are two plans equal?', 'Exemple 3 : quand deux forfaits sont-ils égaux ?'], ['Plan A costs 30 dollars to join plus 5 dollars a month. Plan B costs 10 dollars plus 9 dollars a month. Set 30 + 5m = 10 + 9m.', 'Le forfait A coûte 30 dollars pour s\'inscrire plus 5 dollars par mois. Le forfait B coûte 10 dollars plus 9 dollars par mois. Pose 30 + 5m = 10 + 9m.'], ['Then 20 = 4m, so m = 5 months.', 'Alors 20 = 4m, donc m = 5 mois.']),
    ],
    tryIt: { skill: 'MS.G12.MAP4C.A1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.map-finance',
    skills: ['MS.G12.MAP4C.B1.1.a', 'MS.G12.MAP4C.B1.2.a', 'MS.G12.MAP4C.B2.1.a', 'MS.G12.MAP4C.B3.1.a'],
    title: t('Annuities, mortgages, renting and budgets', 'Rentes, hypothèques, location et budgets'),
    intro: t('Regular payments grow in a savings plan or pay down a loan. Comparing the real yearly costs of owning and renting a home, and keeping a budget, helps you plan a big decision.', 'Des paiements réguliers font croître un plan d\'épargne ou remboursent un prêt. Comparer les vrais coûts annuels de propriété et de location d\'un logement, et tenir un budget, aide à planifier une grande décision.'),
    definitions: [
      d(['Annuities', 'Rentes'], ['An annuity is a series of equal payments. Its future value is the total each payment grows to, found by adding each payment multiplied by (1 + i) for the periods it has earned interest.', 'Une rente est une série de paiements égaux. Sa valeur future est le total auquel chaque paiement grandit, obtenu en additionnant chaque paiement multiplié par (1 + i) pour les périodes pendant lesquelles il a rapporté de l\'intérêt.']),
      d(['Mortgages', 'Hypothèques'], ['Each month, interest = balance × monthly rate. Part of the payment covers the interest and the rest pays down the principal. New balance = old balance + interest − payment. Total interest = all payments − amount borrowed.', 'Chaque mois, intérêt = solde × taux mensuel. Une partie du paiement couvre l\'intérêt et le reste rembourse le capital. Nouveau solde = ancien solde + intérêt − paiement. Intérêt total = tous les paiements − montant emprunté.']),
      d(['Owning and renting', 'Propriété et location'], ['Add up the yearly costs of each: renting is rent × 12 plus insurance; owning is the mortgage × 12 plus property tax, insurance and maintenance. Owning also builds equity, which renting does not.', 'Additionne les coûts annuels de chacun : la location est le loyer × 12 plus l\'assurance ; la propriété est l\'hypothèque × 12 plus les taxes foncières, l\'assurance et l\'entretien. La propriété bâtit aussi un avoir, ce que la location ne fait pas.']),
      d(['Budgets', 'Budgets'], ['Savings = income − expenses. To balance a budget, cut the expenses you can control and recalculate what is left.', 'Épargne = revenu − dépenses. Pour équilibrer un budget, réduis les dépenses que tu contrôles et recalcule ce qui reste.']),
    ],
    examples: [
      ex(['Example 1: an annuity', 'Exemple 1 : une rente'], ['900 dollars is deposited at the end of each year for 2 years at 10% a year. The first payment earns one year of interest: 900 × 1.1 = 990.', '900 dollars sont déposés à la fin de chaque année pendant 2 ans à 10 % par année. Le premier paiement rapporte une année d\'intérêt : 900 × 1,1 = 990.'], ['The last payment earns none, so the future value is 990 + 900 = 1890 dollars.', 'Le dernier paiement ne rapporte rien : la valeur future est de 990 + 900 = 1890 dollars.']),
      ex(['Example 2: a mortgage', 'Exemple 2 : une hypothèque'], ['A 100 000 dollar mortgage has a monthly rate of 0.5% and a payment of 600 dollars. The first month\'s interest is 100 000 × 0.005 = 500 dollars.', 'Une hypothèque de 100 000 dollars a un taux mensuel de 0,5 % et un paiement de 600 dollars. L\'intérêt du premier mois est de 100 000 × 0,005 = 500 dollars.'], ['So 100 dollars pays down the principal, and the balance is 100 000 + 500 − 600 = 99 900 dollars.', 'Donc 100 dollars remboursent le capital, et le solde est de 100 000 + 500 − 600 = 99 900 dollars.']),
      ex(['Example 3: own or rent', 'Exemple 3 : propriétaire ou locataire'], ['Renting costs 1200 × 12 + 300 = 14 700 dollars a year. Owning costs 1000 × 12 + 3000 tax + 800 insurance + 2000 maintenance = 17 800 dollars.', 'Louer coûte 1200 × 12 + 300 = 14 700 dollars par année. Être propriétaire coûte 1000 × 12 + 3000 de taxes + 800 d\'assurance + 2000 d\'entretien = 17 800 dollars.'], ['Owning costs 17 800 − 14 700 = 3100 dollars more a year.', 'Être propriétaire coûte 17 800 − 14 700 = 3100 dollars de plus par année.']),
    ],
    tryIt: { skill: 'MS.G12.MAP4C.B1.2.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.map-geometry',
    skills: ['MS.G12.MAP4C.C1.1.a', 'MS.G12.MAP4C.C2.1.a', 'MS.G12.MAP4C.C3.1.a', 'MS.G12.MAP4C.C3.2.a'],
    title: t('Measurement, best dimensions and trigonometry at work', 'Mesure, meilleures dimensions et trigonométrie au travail'),
    intro: t('Trades and design use right triangles and the sine and cosine laws to find lengths and angles, and use the best dimensions to save fence, material or space.', 'Les métiers et la conception utilisent les triangles rectangles et les lois des sinus et des cosinus pour trouver des longueurs et des angles, et utilisent les meilleures dimensions pour économiser de la clôture, du matériel ou de l\'espace.'),
    definitions: [
      d(['Measurement problems', 'Problèmes de mesure'], ['Split a figure into rectangles and right triangles, find missing lengths with the Pythagorean theorem, then add or subtract areas or volumes.', 'Divise une figure en rectangles et en triangles rectangles, trouve les longueurs manquantes avec le théorème de Pythagore, puis additionne ou soustrais des aires ou des volumes.']),
      d(['Best dimensions', 'Meilleures dimensions'], ['For a fixed perimeter, a square has the greatest area. For a fixed area, a square needs the least perimeter. With one side on a wall, the best length is twice the width.', 'Pour un périmètre fixe, un carré a la plus grande aire. Pour une aire fixe, un carré demande le plus petit périmètre. Avec un côté sur un mur, la meilleure longueur est le double de la largeur.']),
      d(['Right triangles', 'Triangles rectangles'], ['sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, tan θ = opposite ÷ adjacent. Use them for heights, slopes and ramps.', 'sin θ = opposé ÷ hypoténuse, cos θ = adjacent ÷ hypoténuse, tan θ = opposé ÷ adjacent. Utilise-les pour des hauteurs, des pentes et des rampes.']),
      d(['Obtuse angles', 'Angles obtus'], ['The sine law and the cosine law also work with obtuse angles. The cosine of an obtuse angle is negative, so the term −2ab cos C adds to the sum of squares.', 'La loi des sinus et la loi des cosinus valent aussi pour les angles obtus. Le cosinus d\'un angle obtus est négatif : le terme −2ab cos C s\'ajoute à la somme des carrés.']),
    ],
    examples: [
      ex(['Example 1: best dimensions', 'Exemple 1 : meilleures dimensions'], ['With 40 m of fence on all four sides, the best shape is a square of side 10 m, so the greatest area is 100 m².', 'Avec 40 m de clôture sur les quatre côtés, la meilleure forme est un carré de 10 m de côté : la plus grande aire est de 100 m².'], ['With a wall for one side, the width is 40 ÷ 4 = 10 m and the length is 20 m, so the greatest area is 200 m².', 'Avec un mur pour un côté, la largeur est de 40 ÷ 4 = 10 m et la longueur de 20 m : la plus grande aire est de 200 m².']),
      ex(['Example 2: a ladder', 'Exemple 2 : une échelle'], ['An 8 m ladder leans at 70° to the ground. The height it reaches is 8 × sin 70°.', 'Une échelle de 8 m est appuyée à 70° du sol. La hauteur atteinte est 8 × sin 70°.'], ['That is 8 × 0.9397, so about 7.5 m.', 'Cela donne 8 × 0,9397, soit environ 7,5 m.']),
      ex(['Example 3: an obtuse angle', 'Exemple 3 : un angle obtus'], ['Two sides are 6 and 8 with 120° between them. Then c² = 36 + 64 − 2(6)(8)cos 120° = 100 + 48 = 148.', 'Deux côtés mesurent 6 et 8 avec 120° entre eux. Alors c² = 36 + 64 − 2(6)(8)cos 120° = 100 + 48 = 148.'], ['So c is about 12.2.', 'Donc c vaut environ 12,2.']),
    ],
    tryIt: { skill: 'MS.G12.MAP4C.C2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.map-data',
    skills: ['MS.G12.MAP4C.D1.1.a', 'MS.G12.MAP4C.D1.2.a', 'MS.G12.MAP4C.D2.1.a'],
    title: t('Two-variable data, spread and bias', 'Données à deux variables, étalement et biais'),
    intro: t('A line of best fit lets you predict, quartiles show how data spreads, and knowing where bias comes from helps you judge claims in the media and advertising.', 'Une droite de régression permet de prédire, les quartiles montrent comment les données s\'étalent, et savoir d\'où vient le biais aide à juger les affirmations des médias et de la publicité.'),
    definitions: [
      d(['Line of best fit', 'Droite de régression'], ['The line ŷ = a + bx fits two-variable data. Put an x-value in to predict y. The correlation coefficient r (from −1 to 1) says how strong the linear relationship is, and r² is the share of the variation in y that the line explains.', 'La droite ŷ = a + bx ajuste des données à deux variables. Remplace x par une valeur pour prédire y. Le coefficient de corrélation r (de −1 à 1) indique la force de la relation linéaire, et r² est la part de la variation de y qu\'explique la droite.']),
      d(['Quartiles and outliers', 'Quartiles et valeurs aberrantes'], ['Order the data. Q1 and Q3 are the medians of the lower and upper halves, IQR = Q3 − Q1. A value is an outlier if it is below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR.', 'Ordonne les données. Q1 et Q3 sont les médianes des moitiés inférieure et supérieure, EIQ = Q3 − Q1. Une valeur est aberrante si elle est sous Q1 − 1,5 × EIQ ou au-dessus de Q3 + 1,5 × EIQ.']),
      d(['Bias', 'Biais'], ['A sample is biased when some people are more likely to be chosen than others, for example a convenience sample, a voluntary response, or leaving out a group. Leading questions and misleading graphs can also give a false picture.', 'Un échantillon est biaisé quand certaines personnes ont plus de chances d\'être choisies que d\'autres, par exemple un échantillon de commodité, une réponse volontaire ou l\'exclusion d\'un groupe. Les questions suggestives et les graphiques trompeurs peuvent aussi donner une fausse image.']),
    ],
    examples: [
      ex(['Example 1: predicting', 'Exemple 1 : prédire'], ['The line of best fit is ŷ = 2 + 3x. To predict y when x = 4, put in x = 4.', 'La droite de régression est ŷ = 2 + 3x. Pour prédire y quand x = 4, remplace x par 4.'], ['ŷ = 2 + 3(4) = 14.', 'ŷ = 2 + 3(4) = 14.']),
      ex(['Example 2: outliers', 'Exemple 2 : valeurs aberrantes'], ['Data: 4, 6, 7, 9, 10, 12, 15. The median is 9, Q1 = 6 and Q3 = 12, so IQR = 6.', 'Données : 4, 6, 7, 9, 10, 12, 15. La médiane est 9, Q1 = 6 et Q3 = 12 : EIQ = 6.'], ['The upper fence is 12 + 1.5 × 6 = 21 and the lower fence is 6 − 9 = −3, so there are no outliers.', 'La barrière supérieure est de 12 + 1,5 × 6 = 21 et la barrière inférieure est de 6 − 9 = −3 : il n\'y a pas de valeur aberrante.']),
      ex(['Example 3: spotting bias', 'Exemple 3 : repérer le biais'], ['A gym surveys only its own members about how often people exercise. People who exercise are more likely to be members.', 'Un gym sonde seulement ses propres membres sur la fréquence à laquelle les gens font de l\'exercice. Les gens qui font de l\'exercice sont plus susceptibles d\'être membres.'], ['This convenience sample is biased: it does not represent everyone.', 'Cet échantillon de commodité est biaisé : il ne représente pas tout le monde.']),
    ],
    tryIt: { skill: 'MS.G12.MAP4C.D1.1.a', tier: 1, seed: 2 },
  },
];
