// Lessons for Grade 12 Mathematics for Work and Everyday Life (MEL4E): reasoning with data, personal finance, applications of measurement.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE12E_LESSONS: Lesson[] = [
  {
    id: 'L.g12.mel4-data',
    skills: ['MS.G12.MEL4E.A1.1.a', 'MS.G12.MEL4E.A1.2.a', 'MS.G12.MEL4E.A2.1.a', 'MS.G12.MEL4E.A2.2.a'],
    title: t('Reasoning with data and chance', 'Raisonner avec les données et le hasard'),
    intro: t('Averages and quartiles summarize data, and probability tells you what to expect from games, weather and insurance. Expected value shows whether a bet is worth it.', 'Les moyennes et les quartiles résument les données, et les probabilités indiquent à quoi s\'attendre dans les jeux, la météo et les assurances. La valeur espérée montre si un pari en vaut la peine.'),
    definitions: [
      d(['Mean and median', 'Moyenne et médiane'], ['Mean = sum ÷ number of values. Median = the middle value of the ordered list, or the mean of the two middle values when there is an even number of values. To reach a target average, find the total needed and subtract what you already have.', 'Moyenne = somme ÷ nombre de valeurs. Médiane = la valeur du milieu de la liste ordonnée, ou la moyenne des deux valeurs du milieu quand le nombre de valeurs est pair. Pour atteindre une moyenne cible, trouve le total nécessaire et soustrais ce que tu as déjà.']),
      d(['Quartiles and outliers', 'Quartiles et valeurs aberrantes'], ['Q1 and Q3 are the medians of the lower and upper halves, and IQR = Q3 − Q1. A value is an outlier if it is below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR.', 'Q1 et Q3 sont les médianes des moitiés inférieure et supérieure, et EIQ = Q3 − Q1. Une valeur est aberrante si elle est sous Q1 − 1,5 × EIQ ou au-dessus de Q3 + 1,5 × EIQ.']),
      d(['Probability rules', 'Règles de probabilité'], ['Probability = favourable outcomes ÷ all outcomes. P(not A) = 1 − P(A). P(A or B) = P(A) + P(B) − P(A and B). For independent events, P(A and B) = P(A) × P(B).', 'Probabilité = résultats favorables ÷ tous les résultats. P(non A) = 1 − P(A). P(A ou B) = P(A) + P(B) − P(A et B). Pour des événements indépendants, P(A et B) = P(A) × P(B).']),
      d(['Expected value', 'Valeur espérée'], ['Expected value = (chance of winning × prize) − cost. A negative expected value means you expect to lose money in the long run. An insurer breaks even when the premium equals the expected payout per customer.', 'Valeur espérée = (chance de gagner × prix) − coût. Une valeur espérée négative signifie qu\'on s\'attend à perdre de l\'argent à long terme. Un assureur couvre ses coûts quand la prime égale le versement espéré par client.']),
    ],
    examples: [
      ex(['Example 1: mean', 'Exemple 1 : moyenne'], ['Find the mean of 12, 15, 18, 20 and 25. The sum is 12 + 15 + 18 + 20 + 25 = 90.', 'Trouve la moyenne de 12, 15, 18, 20 et 25. La somme est 12 + 15 + 18 + 20 + 25 = 90.'], ['The mean is 90 ÷ 5 = 18.', 'La moyenne est 90 ÷ 5 = 18.']),
      ex(['Example 2: median', 'Exemple 2 : médiane'], ['Find the median of 7, 5, 9, 3, 8, 6. In order: 3, 5, 6, 7, 8, 9.', 'Trouve la médiane de 7, 5, 9, 3, 8, 6. En ordre : 3, 5, 6, 7, 8, 9.'], ['There are two middle values, 6 and 7, so the median is (6 + 7) ÷ 2 = 6.5.', 'Il y a deux valeurs au milieu, 6 et 7 : la médiane est (6 + 7) ÷ 2 = 6,5.']),
      ex(['Example 3: a raffle', 'Exemple 3 : une tombola'], ['200 tickets are sold at 2 dollars each, and there is one prize of 300 dollars. The expected prize per ticket is 300 ÷ 200 = 1.50 dollars.', '200 billets sont vendus 2 dollars chacun, et il y a un seul prix de 300 dollars. Le prix espéré par billet est de 300 ÷ 200 = 1,50 dollar.'], ['The expected value is 1.50 − 2 = −0.50 dollars: you expect to lose 50 cents per ticket.', 'La valeur espérée est de 1,50 − 2 = −0,50 dollar : on s\'attend à perdre 50 cents par billet.']),
    ],
    tryIt: { skill: 'MS.G12.MEL4E.A1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.mel4-finance',
    skills: ['MS.G12.MEL4E.B1.1.a', 'MS.G12.MEL4E.B2.1.a', 'MS.G12.MEL4E.B3.1.a'],
    title: t('Housing costs, budgets and income tax', 'Coûts de logement, budgets et impôt sur le revenu'),
    intro: t('Comparing the real costs of owning and renting, keeping a household budget in balance and filing an income tax return are everyday uses of money math.', 'Comparer les vrais coûts de la propriété et de la location, équilibrer un budget familial et produire une déclaration de revenus sont des usages quotidiens des mathématiques de l\'argent.'),
    definitions: [
      d(['Owning and renting', 'Propriété et location'], ['Renting costs rent × 12 plus tenant insurance. Owning costs the mortgage × 12 plus property tax, home insurance and maintenance (often about 1% of the home\'s value). Owning also builds equity.', 'Louer coûte le loyer × 12 plus l\'assurance locataire. Être propriétaire coûte l\'hypothèque × 12 plus les taxes foncières, l\'assurance habitation et l\'entretien (souvent environ 1 % de la valeur de la maison). La propriété bâtit aussi un avoir.']),
      d(['Budgets', 'Budgets'], ['Money left = income − expenses. To adjust a budget, change the expenses you can control, such as food, and recalculate. A percent cut is a percent of that expense.', 'Argent restant = revenu − dépenses. Pour ajuster un budget, change les dépenses que tu contrôles, comme la nourriture, et recalcule. Une réduction en pourcentage est un pourcentage de cette dépense.']),
      d(['Income tax return', 'Déclaration de revenus'], ['Taxable income = total income − deductions (such as RRSP and union dues). Tax is worked out on the taxable income, and credits are subtracted. Refund = tax already deducted − tax owed; a negative result means tax is still owing.', 'Revenu imposable = revenu total − déductions (comme le REER et les cotisations syndicales). L\'impôt est calculé sur le revenu imposable, et les crédits sont soustraits. Remboursement = impôt déjà retenu − impôt dû ; un résultat négatif signifie qu\'il reste de l\'impôt à payer.']),
    ],
    examples: [
      ex(['Example 1: own or rent', 'Exemple 1 : propriétaire ou locataire'], ['Renting costs 1200 × 12 + 300 = 14 700 dollars a year. Owning costs 1000 × 12 + 3000 + 800 + 2000 = 17 800 dollars.', 'Louer coûte 1200 × 12 + 300 = 14 700 dollars par année. Être propriétaire coûte 1000 × 12 + 3000 + 800 + 2000 = 17 800 dollars.'], ['Owning costs 17 800 − 14 700 = 3100 dollars more a year.', 'Être propriétaire coûte 17 800 − 14 700 = 3100 dollars de plus par année.']),
      ex(['Example 2: a budget', 'Exemple 2 : un budget'], ['A household has an income of 3200 dollars, with rent 1200, food 600 and other costs 1400, so nothing is left. Cutting the food cost by 20% saves 600 × 0.20 = 120 dollars.', 'Un ménage a un revenu de 3200 dollars, avec un loyer de 1200, de la nourriture à 600 et d\'autres coûts de 1400 : il ne reste rien. Réduire la nourriture de 20 % économise 600 × 0,20 = 120 dollars.'], ['Now 120 dollars is left each month.', 'Il reste maintenant 120 dollars par mois.']),
      ex(['Example 3: a tax return', 'Exemple 3 : une déclaration de revenus'], ['Total income is 50 000 dollars and the deductions are 2000 dollars, so the taxable income is 48 000 dollars.', 'Le revenu total est de 50 000 dollars et les déductions sont de 2000 dollars : le revenu imposable est de 48 000 dollars.'], ['If 6000 dollars was deducted from pay and the tax owed is 5500 dollars, the refund is 6000 − 5500 = 500 dollars.', 'Si 6000 dollars ont été retenus sur la paie et que l\'impôt dû est de 5500 dollars, le remboursement est de 6000 − 5500 = 500 dollars.']),
    ],
    tryIt: { skill: 'MS.G12.MEL4E.B3.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g12.mel4-measure',
    skills: ['MS.G12.MEL4E.C1.1.a', 'MS.G12.MEL4E.C1.2.a', 'MS.G12.MEL4E.C2.1.a', 'MS.G12.MEL4E.C3.1.a'],
    title: t('Units, scale and proportional reasoning', 'Unités, échelle et raisonnement proportionnel'),
    intro: t('Work and home projects mix metric and imperial units, scale drawings and recipes or jobs that must be scaled up or down. Proportional reasoning keeps the numbers in step.', 'Les projets de travail et de maison mélangent unités métriques et impériales, dessins à l\'échelle et recettes ou travaux à agrandir ou à réduire. Le raisonnement proportionnel garde les nombres en équilibre.'),
    definitions: [
      d(['Converting units', 'Convertir des unités'], ['Within imperial: 12 inches = 1 foot, 3 feet = 1 yard, 5280 feet = 1 mile. Between systems: 1 inch = 2.54 cm, 1 foot = 30.48 cm, 1 mile = 1.609 km, 1 kg = 2.205 lb. Multiply or divide by the conversion factor.', 'Dans le système impérial : 12 pouces = 1 pied, 3 pieds = 1 verge, 5280 pieds = 1 mille. Entre systèmes : 1 pouce = 2,54 cm, 1 pied = 30,48 cm, 1 mille = 1,609 km, 1 kg = 2,205 lb. Multiplie ou divise par le facteur de conversion.']),
      d(['Scale drawings', 'Dessins à l\'échelle'], ['A scale such as 1 cm = 2 m means real length = drawing length × 2. To find the drawing length, divide the real length by 2. Area problems use real lengths: area = length × width.', 'Une échelle comme 1 cm = 2 m signifie longueur réelle = longueur sur le dessin × 2. Pour trouver la longueur sur le dessin, divise la longueur réelle par 2. Les problèmes d\'aire utilisent les longueurs réelles : aire = longueur × largeur.']),
      d(['Direct proportion', 'Proportion directe'], ['Find the amount for one unit, then multiply. If you have 3 litres for 30 m², one litre covers 10 m², so 90 m² needs 9 litres.', 'Trouve la quantité pour une unité, puis multiplie. Si 3 litres couvrent 30 m², un litre couvre 10 m² : 90 m² demandent 9 litres.']),
      d(['Inverse proportion', 'Proportion inverse'], ['With a fixed job, workers × days stays the same, so more workers means fewer days. A common error is to treat it as a direct proportion.', 'Pour un travail fixe, travailleurs × jours reste constant : plus de travailleurs signifie moins de jours. Une erreur courante est de la traiter comme une proportion directe.']),
    ],
    examples: [
      ex(['Example 1: converting', 'Exemple 1 : convertir'], ['Change 5 feet to centimetres. Multiply by 30.48.', 'Convertis 5 pieds en centimètres. Multiplie par 30,48.'], ['5 × 30.48 = 152.4 cm.', '5 × 30,48 = 152,4 cm.']),
      ex(['Example 2: scale and cost', 'Exemple 2 : échelle et coût'], ['On a drawing 1 cm = 2 m, and a wall measures 7 cm, so the real wall is 7 × 2 = 14 m.', 'Sur un dessin, 1 cm = 2 m et un mur mesure 7 cm : le vrai mur mesure 7 × 2 = 14 m.'], ['A 4 m by 5 m floor is 20 m². With 10% extra tile it is 22 m², and at 35 dollars per m² the tile costs 22 × 35 = 770 dollars.', 'Un plancher de 4 m sur 5 m fait 20 m². Avec 10 % de carreaux de plus, c\'est 22 m², et à 35 dollars le m², les carreaux coûtent 22 × 35 = 770 dollars.']),
      ex(['Example 3: workers and days', 'Exemple 3 : travailleurs et jours'], ['3 workers finish a job in 12 days. The total work is 3 × 12 = 36 worker-days.', '3 travailleurs terminent un travail en 12 jours. Le travail total est de 3 × 12 = 36 jours-travailleurs.'], ['With 4 workers it takes 36 ÷ 4 = 9 days.', 'Avec 4 travailleurs, il faut 36 ÷ 4 = 9 jours.']),
    ],
    tryIt: { skill: 'MS.G12.MEL4E.C2.1.a', tier: 1, seed: 2 },
  },
];
