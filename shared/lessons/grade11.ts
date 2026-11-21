// Lessons for Grade 11 (MCR3U): functions, quadratics and expressions, exponentials, sequences, and finance.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE11_LESSONS: Lesson[] = [
  {
    id: 'L.g11.functions',
    skills: ['MS.G11.MCR3U.A1.1.a', 'MS.G11.MCR3U.A1.2.a', 'MS.G11.MCR3U.A2.1.a', 'MS.G11.MCR3U.A3.1.a'],
    title: t('Functions: notation, domain, inverses and transformations', 'Fonctions : notation, domaine, réciproques et transformations'),
    intro: t('A function gives exactly one output for each input. Function notation f(x) names the rule, the domain lists the allowed inputs, the inverse undoes the rule, and transformations move and stretch a graph.', 'Une fonction donne exactement une sortie pour chaque entrée. La notation f(x) nomme la règle, le domaine liste les entrées permises, la réciproque annule la règle et les transformations déplacent et étirent un graphique.'),
    definitions: [
      d(['Function notation', 'Notation fonctionnelle'], ['f(a) means: put a in place of x everywhere in the rule. If f(x) = 2x² − 3, then f(4) = 2(16) − 3 = 29.', 'f(a) signifie : remplace x par a partout dans la règle. Si f(x) = 2x² − 3, alors f(4) = 2(16) − 3 = 29.']),
      d(['Domain', 'Domaine'], ['The domain is the set of allowed inputs. Never divide by 0 (so exclude values that make a denominator 0), and the expression under a square root must be 0 or more.', 'Le domaine est l\'ensemble des entrées permises. On ne divise jamais par 0 (on exclut donc les valeurs qui annulent un dénominateur) et l\'expression sous une racine carrée doit être 0 ou plus.']),
      d(['Inverse', 'Réciproque'], ['f⁻¹(y) is the x for which f(x) = y. To find it, solve y = f(x) for x: undo the steps in reverse order.', 'f⁻¹(y) est le x pour lequel f(x) = y. Pour le trouver, résous y = f(x) pour x : annule les étapes dans l\'ordre inverse.']),
      d(['Transformations', 'Transformations'], ['For y = a f(k(x − d)) + c, a point (x, y) on y = f(x) moves to (x ÷ k + d, a y + c). Do the stretch or compression first, then the shift.', 'Pour y = a f(k(x − d)) + c, un point (x, y) de y = f(x) devient (x ÷ k + d, a y + c). Fais d\'abord l\'étirement ou la compression, puis le déplacement.']),
    ],
    examples: [
      ex(['Example 1: a domain', 'Exemple 1 : un domaine'], ['Find the smallest whole number in the domain of √(x − 6). We need x − 6 ≥ 0.', 'Trouve le plus petit nombre entier du domaine de √(x − 6). Il faut x − 6 ≥ 0.'], ['So x ≥ 6, and the smallest whole number is 6.', 'Donc x ≥ 6 et le plus petit nombre entier est 6.']),
      ex(['Example 2: an inverse', 'Exemple 2 : une réciproque'], ['If f(x) = 3x − 5, find f⁻¹(10). Solve 3x − 5 = 10: 3x = 15.', 'Si f(x) = 3x − 5, trouve f⁻¹(10). Résous 3x − 5 = 10 : 3x = 15.'], ['So x = 5, and f⁻¹(10) = 5.', 'Donc x = 5 et f⁻¹(10) = 5.']),
      ex(['Example 3: a transformation', 'Exemple 3 : une transformation'], ['(4, 3) is on y = f(x). Where does it go on y = 2f(½(x − 1)) + 5? New x = 4 ÷ ½ + 1 = 9.', '(4, 3) est sur y = f(x). Où va-t-il sur y = 2f(½(x − 1)) + 5 ? Nouveau x = 4 ÷ ½ + 1 = 9.'], ['New y = 2(3) + 5 = 11, so the point is (9, 11).', 'Nouveau y = 2(3) + 5 = 11 : le point est (9, 11).']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.A1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.quadratic-expressions',
    skills: ['MS.G11.MCR3U.A4.1.a', 'MS.G11.MCR3U.A4.2.a', 'MS.G11.MCR3U.A4.3.a', 'MS.G11.MCR3U.A5.1.a', 'MS.G11.MCR3U.A5.2.a'],
    title: t('Quadratics, radicals and rational expressions', 'Polynômes du second degré, radicaux et expressions rationnelles'),
    intro: t('Quadratics meet lines at up to two points and have one highest or lowest value. Radicals and rational expressions are simplified by factoring.', 'Les polynômes du second degré rencontrent des droites en au plus deux points et ont une valeur maximale ou minimale. Les radicaux et les expressions rationnelles se simplifient par factorisation.'),
    definitions: [
      d(['Line and parabola', 'Droite et parabole'], ['Set the two expressions for y equal and move everything to one side. Solve the quadratic: its roots are the x-coordinates of the intersections. The discriminant b² − 4ac tells how many there are (two, one, or none).', 'Pose les deux expressions de y égales et ramène tout d\'un côté. Résous l\'équation du second degré : ses racines sont les abscisses des intersections. Le discriminant b² − 4ac indique combien il y en a (deux, une ou aucune).']),
      d(['Maximum and minimum', 'Maximum et minimum'], ['The vertex is at x = −b ÷ 2a. Put it back in the equation to get the extreme value. If a > 0 it is a minimum, and if a < 0 a maximum.', 'Le sommet est à x = −b ÷ 2a. Remplace-le dans l\'équation pour obtenir la valeur extrême. Si a > 0, c\'est un minimum ; si a < 0, un maximum.']),
      d(['Radicals', 'Radicaux'], ['√(ab) = √a × √b. Take out perfect squares: √72 = √(36 × 2) = 6√2. Only radicals with the same number under the root can be added.', '√(ab) = √a × √b. Sors les carrés parfaits : √72 = √(36 × 2) = 6√2. Seuls des radicaux ayant le même nombre sous la racine peuvent s\'additionner.']),
      d(['Rational expressions', 'Expressions rationnelles'], ['Factor the top and bottom, then cancel common factors. State the restrictions: any x that makes the original denominator 0 is excluded.', 'Factorise le numérateur et le dénominateur, puis simplifie les facteurs communs. Indique les restrictions : tout x qui annule le dénominateur de départ est exclu.']),
    ],
    examples: [
      ex(['Example 1: where they meet', 'Exemple 1 : où elles se rencontrent'], ['y = x² − 2x − 3 meets y = x + 1. Set equal: x² − 3x − 4 = 0, which factors as (x − 4)(x + 1).', 'y = x² − 2x − 3 rencontre y = x + 1. Pose égal : x² − 3x − 4 = 0, qui se factorise en (x − 4)(x + 1).'], ['So x = 4 or x = −1.', 'Donc x = 4 ou x = −1.']),
      ex(['Example 2: a maximum', 'Exemple 2 : un maximum'], ['y = −2x² + 12x − 5. The vertex is at x = −12 ÷ (−4) = 3.', 'y = −2x² + 12x − 5. Le sommet est à x = −12 ÷ (−4) = 3.'], ['y = −18 + 36 − 5 = 13, so the maximum value is 13.', 'y = −18 + 36 − 5 = 13 : la valeur maximale est 13.']),
      ex(['Example 3: a rational expression', 'Exemple 3 : une expression rationnelle'], ['(x² + 5x + 6) ÷ (x + 2): the top factors as (x + 2)(x + 3).', '(x² + 5x + 6) ÷ (x + 2) : le numérateur se factorise en (x + 2)(x + 3).'], ['Cancel (x + 2): the result is x + 3, with x ≠ −2.', 'Simplifie (x + 2) : le résultat est x + 3, avec x ≠ −2.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.A4.2.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.exponentials',
    skills: ['MS.G11.MCR3U.B1.1.a', 'MS.G11.MCR3U.B3.1.a', 'MS.G11.MCR3U.B5.1.a'],
    title: t('Rational exponents and exponential growth', 'Exposants rationnels et croissance exponentielle'),
    intro: t('Exponents can be fractions, and exponential relations grow or shrink by the same factor in equal steps.', 'Les exposants peuvent être des fractions, et les relations exponentielles croissent ou décroissent du même facteur par pas égaux.'),
    definitions: [
      d(['Rational exponents', 'Exposants rationnels'], ['A power of 1/n is the nth root, and a power of m/n is the nth root raised to the power m. A negative exponent means a reciprocal: 8 to the power −2/3 is 1 ÷ 4, because the cube root of 8 is 2 and 2 × 2 = 4.', 'Une puissance 1/n est la racine n-ième, et une puissance m/n est la racine n-ième élevée à la puissance m. Un exposant négatif signifie un inverse : 8 à la puissance −2/3 vaut 1 ÷ 4, parce que la racine cubique de 8 est 2 et 2 × 2 = 4.']),
      d(['Which kind of relation?', 'Quel type de relation ?'], ['Equal first differences mean linear. Equal second differences mean quadratic. Equal ratios of neighbouring y-values mean exponential.', 'Des premières différences égales signifient affine. Des secondes différences égales signifient quadratique. Des rapports égaux de valeurs de y voisines signifient exponentielle.']),
      d(['Growth and decay', 'Croissance et décroissance'], ['Amount = start × (factor raised to the number of periods). A rise of 20% per period has factor 1.2, and a fall of 20% has factor 0.8. Doubling has factor 2 and a half-life has factor ½.', 'Quantité = départ × (facteur élevé au nombre de périodes). Une hausse de 20 % par période a pour facteur 1,2 et une baisse de 20 % a pour facteur 0,8. Un doublement a pour facteur 2 et une demi-vie a pour facteur ½.']),
    ],
    examples: [
      ex(['Example 1: a rational exponent', 'Exemple 1 : un exposant rationnel'], ['Evaluate 16 to the power 3/4. The fourth root of 16 is 2.', 'Évalue 16 à la puissance 3/4. La racine quatrième de 16 est 2.'], ['Then 2³ = 8.', 'Puis 2³ = 8.']),
      ex(['Example 2: telling relations apart', 'Exemple 2 : distinguer les relations'], ['The table 3, 6, 12, 24, 48 has first differences 3, 6, 12, 24 (not equal) and ratios 2, 2, 2, 2.', 'Le tableau 3, 6, 12, 24, 48 a des premières différences 3, 6, 12, 24 (pas égales) et des rapports 2, 2, 2, 2.'], ['The ratios are equal, so it is exponential.', 'Les rapports sont égaux : elle est exponentielle.']),
      ex(['Example 3: decay', 'Exemple 3 : décroissance'], ['A value of 1000 loses 20% per year. After 2 years: 1000 × 0.8² = 640.', 'Une valeur de 1000 perd 20 % par année. Après 2 ans : 1000 × 0,8² = 640.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.B1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.sequences',
    skills: ['MS.G11.MCR3U.C1.1.a', 'MS.G11.MCR3U.C1.2.a', 'MS.G11.MCR3U.C2.1.a', 'MS.G11.MCR3U.C2.2.a'],
    title: t('Sequences, series and Pascal\'s triangle', 'Suites, séries et triangle de Pascal'),
    intro: t('A sequence is a list of numbers that follows a rule. A series is the sum of its terms. Pascal\'s triangle gives the coefficients of binomial expansions.', 'Une suite est une liste de nombres qui suit une règle. Une série est la somme de ses termes. Le triangle de Pascal donne les coefficients des développements de binômes.'),
    definitions: [
      d(['Recursive rule', 'Règle récursive'], ['A recursive rule gives each term from the one before: t_n = 2t_(n−1) + 1. Start from t₁ and work forward one term at a time.', 'Une règle récursive donne chaque terme à partir du précédent : t_n = 2t_(n−1) + 1. Pars de t₁ et avance un terme à la fois.']),
      d(['Arithmetic', 'Arithmétique'], ['Constant difference d. t_n = a + (n − 1)d and S_n = n(2a + (n − 1)d) ÷ 2, or S_n = n(a + t_n) ÷ 2.', 'Différence constante d. t_n = a + (n − 1)d et S_n = n(2a + (n − 1)d) ÷ 2, ou S_n = n(a + t_n) ÷ 2.']),
      d(['Geometric', 'Géométrique'], ['Constant ratio r. The term t_n is a times r raised to the power n − 1, and S_n = a(rⁿ − 1) ÷ (r − 1).', 'Raison constante r. Le terme t_n est a fois r élevé à la puissance n − 1, et S_n = a(rⁿ − 1) ÷ (r − 1).']),
      d(['Binomial expansion', 'Développement de binôme'], ['The coefficients of (x + a)ⁿ come from row n of Pascal\'s triangle. The term with xᵏ is (entry k) × xᵏ × a to the power n − k.', 'Les coefficients de (x + a)ⁿ viennent de la rangée n du triangle de Pascal. Le terme en xᵏ est (entrée k) × xᵏ × a à la puissance n − k.']),
    ],
    examples: [
      ex(['Example 1: arithmetic', 'Exemple 1 : arithmétique'], ['Take a = 5 and d = 3: t₁₀ = 5 + 9(3) = 32.', 'Prends a = 5 et d = 3 : t₁₀ = 5 + 9(3) = 32.'], ['The sum of the first 10 terms is 10(5 + 32) ÷ 2 = 185.', 'La somme des 10 premiers termes est 10(5 + 32) ÷ 2 = 185.']),
      ex(['Example 2: geometric', 'Exemple 2 : géométrique'], ['3, 6, 12, … has r = 2. t₆ = 3 × 2⁵ = 96.', '3, 6, 12, … a r = 2. t₆ = 3 × 2⁵ = 96.'], ['The sum is S₆ = 3(2⁶ − 1) ÷ 1 = 189.', 'La somme est S₆ = 3(2⁶ − 1) ÷ 1 = 189.']),
      ex(['Example 3: binomial', 'Exemple 3 : binôme'], ['The coefficient of x² in (x + 3)⁴: row 4 is 1, 4, 6, 4, 1, so the entry is 6.', 'Le coefficient de x² dans (x + 3)⁴ : la rangée 4 est 1, 4, 6, 4, 1, donc l\'entrée est 6.'], ['So the coefficient is 6 × 3² = 54.', 'Le coefficient est donc 6 × 3² = 54.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.C2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.finance',
    skills: ['MS.G11.MCR3U.C3.1.a', 'MS.G11.MCR3U.C4.1.a'],
    title: t('Compound interest and annuities', 'Intérêt composé et rentes'),
    intro: t('With compound interest, the interest earns interest. An annuity is a series of equal payments, which grows into a future value or is worth a present value today.', 'Avec l\'intérêt composé, les intérêts rapportent des intérêts. Une rente est une suite de versements égaux, qui devient une valeur future ou vaut une valeur actuelle aujourd\'hui.'),
    definitions: [
      d(['Compound interest', 'Intérêt composé'], ['A = P(1 + i)ⁿ, where i is the rate per period and n is the number of periods. For 12% a year compounded quarterly, i = 0.03 and n is 4 times the number of years.', 'A = P(1 + i)ⁿ, où i est le taux par période et n le nombre de périodes. Pour 12 % par an composé trimestriellement, i = 0,03 et n vaut 4 fois le nombre d\'années.']),
      d(['Future value of an annuity', 'Valeur future d\'une rente'], ['FV = R((1 + i)ⁿ − 1) ÷ i for payments R at the end of each period.', 'FV = R((1 + i)ⁿ − 1) ÷ i pour des versements R à la fin de chaque période.']),
      d(['Present value of an annuity', 'Valeur actuelle d\'une rente'], ['PV = R(1 − (1 + i)⁻ⁿ) ÷ i. It is the amount you would need today to fund all the payments.', 'PV = R(1 − (1 + i)⁻ⁿ) ÷ i. C\'est le montant nécessaire aujourd\'hui pour financer tous les versements.']),
    ],
    examples: [
      ex(['Example 1: compound interest', 'Exemple 1 : intérêt composé'], ['2000 dollars at 10% a year, compounded annually for 3 years: 2000 × 1.1³ = 2662.', '2000 dollars à 10 % par an, composé annuellement pendant 3 ans : 2000 × 1,1³ = 2662.'], ['The value is 2662 dollars.', 'La valeur est de 2662 dollars.']),
      ex(['Example 2: an annuity', 'Exemple 2 : une rente'], ['500 dollars a year for 3 years at 10%: the factor is (1.1³ − 1) ÷ 0.1 = 3.31.', '500 dollars par année pendant 3 ans à 10 % : le facteur est (1,1³ − 1) ÷ 0,1 = 3,31.'], ['FV = 500 × 3.31 = 1655 dollars.', 'FV = 500 × 3,31 = 1655 dollars.']),
    ],
    tryIt: { skill: 'MS.G11.MCR3U.C3.1.a', tier: 1, seed: 2 },
  },
];
