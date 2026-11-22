// Lessons for Grade 12 (MHF4U, Advanced Functions): logarithms, trigonometric functions in radians, polynomial and rational functions,
// and characteristics of functions.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE12_LESSONS: Lesson[] = [
  {
    id: 'L.g12.logs',
    skills: ['MS.G12.MHF4U.A1.1.a', 'MS.G12.MHF4U.A1.2.a', 'MS.G12.MHF4U.A2.1.a', 'MS.G12.MHF4U.A3.1.a', 'MS.G12.MHF4U.A3.2.a'],
    title: t('Logarithms: evaluate, graph and solve', 'Logarithmes : évaluer, représenter et résoudre'),
    intro: t('A logarithm is an exponent. The logarithm of a number, in a base, answers the question: the base to what power gives this number?', 'Un logarithme est un exposant. Le logarithme d\'un nombre, dans une base, répond à la question : la base à quelle puissance donne ce nombre ?'),
    definitions: [
      d(['Logarithm', 'Logarithme'], ['log₂ 32 = 5 because 2⁵ = 32. The two forms say the same thing: y = log_b x means b to the power y is x.', 'log₂ 32 = 5 parce que 2⁵ = 32. Les deux formes disent la même chose : y = log_b x signifie que b à la puissance y égale x.']),
      d(['Laws of logarithms', 'Lois des logarithmes'], ['A sum of logarithms is the logarithm of a product, a difference is the logarithm of a quotient, and a power comes down as a coefficient: log(xⁿ) = n log x.', 'Une somme de logarithmes est le logarithme d\'un produit, une différence est le logarithme d\'un quotient, et une puissance descend comme coefficient : log(xⁿ) = n log x.']),
      d(['Graph of a logarithmic function', 'Graphique d\'une fonction logarithmique'], ['In y = log_b(x − h) + k, the vertical asymptote is x = h, because the inside must be positive. Set y = 0 to find the x-intercept.', 'Dans y = log_b(x − h) + k, l\'asymptote verticale est x = h, parce que l\'intérieur doit être positif. Pose y = 0 pour trouver l\'abscisse à l\'origine.']),
      d(['Solving equations', 'Résoudre des équations'], ['For b to the power x equal to a number, write both sides with the same base, or take logarithms of both sides. For a logarithmic equation, combine the logarithms, rewrite as a power, and reject any root that makes an inside negative.', 'Pour b à la puissance x égal à un nombre, écris les deux côtés avec la même base, ou prends les logarithmes des deux côtés. Pour une équation logarithmique, combine les logarithmes, écris sous forme de puissance, et rejette toute racine qui rend un intérieur négatif.']),
    ],
    examples: [
      ex(['Example 1: laws', 'Exemple 1 : les lois'], ['Evaluate log₂ 8 + log₂ 4. Each is an exponent: 3 and 2.', 'Évalue log₂ 8 + log₂ 4. Chacun est un exposant : 3 et 2.'], ['The sum is 5, which is log₂ 32.', 'La somme est 5, ce qui égale log₂ 32.']),
      ex(['Example 2: an exponential equation', 'Exemple 2 : une équation exponentielle'], ['Solve 4ˣ = 32. Write both as powers of 2: 2²ˣ = 2⁵.', 'Résous 4ˣ = 32. Écris les deux comme des puissances de 2 : 2²ˣ = 2⁵.'], ['Equate the exponents: 2x = 5, so x = 2.5.', 'Égale les exposants : 2x = 5, donc x = 2,5.']),
      ex(['Example 3: reject a root', 'Exemple 3 : rejeter une racine'], ['Solve log₂ x + log₂ (x − 2) = 3. Combine: x(x − 2) = 8, so x² − 2x − 8 = 0.', 'Résous log₂ x + log₂ (x − 2) = 3. Combine : x(x − 2) = 8, donc x² − 2x − 8 = 0.'], ['The roots are 4 and −2. Only 4 keeps both insides positive.', 'Les racines sont 4 et −2. Seule 4 garde les deux intérieurs positifs.']),
    ],
    tryIt: { skill: 'MS.G12.MHF4U.A1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.trig',
    skills: ['MS.G12.MHF4U.B1.1.a', 'MS.G12.MHF4U.B1.2.a', 'MS.G12.MHF4U.B2.1.a', 'MS.G12.MHF4U.B3.1.a'],
    title: t('Radians, sinusoidal functions and trigonometric equations', 'Radians, fonctions sinusoïdales et équations trigonométriques'),
    intro: t('Radians measure an angle by the length of the arc it cuts off on a circle of radius 1. A half turn is π radians, which is 180 degrees.', 'Les radians mesurent un angle par la longueur de l\'arc qu\'il découpe sur un cercle de rayon 1. Un demi-tour égale π radians, soit 180 degrés.'),
    definitions: [
      d(['Convert', 'Convertir'], ['Degrees to radians: multiply by π ÷ 180. Radians to degrees: replace π by 180. For example 150° is 5π/6, and 7π/6 is 210°. Arc length is the radius times the angle in radians.', 'Des degrés aux radians : multiplie par π ÷ 180. Des radians aux degrés : remplace π par 180. Par exemple, 150° égale 5π/6, et 7π/6 égale 210°. La longueur d\'arc est le rayon fois l\'angle en radians.']),
      d(['Exact values', 'Valeurs exactes'], ['Use the reference angle for the size and the quadrant (CAST) for the sign. For example sin(5π/6) = sin(π/6) = 1/2, and cos(5π/6) = −√3/2.', 'Utilise l\'angle de référence pour la valeur et le quadrant (CAST) pour le signe. Par exemple, sin(5π/6) = sin(π/6) = 1/2, et cos(5π/6) = −√3/2.']),
      d(['Sinusoidal functions', 'Fonctions sinusoïdales'], ['In y = a sin(kx) + c, the amplitude is |a|, the midline is y = c, and the period is 2π ÷ k. The maximum is c + |a| and the minimum is c − |a|.', 'Dans y = a sin(kx) + c, l\'amplitude est |a|, la ligne médiane est y = c, et la période est 2π ÷ k. Le maximum est c + |a| et le minimum est c − |a|.']),
      d(['Trigonometric equations', 'Équations trigonométriques'], ['Find the reference angle, then use the quadrants where the ratio has that sign. In one turn, sin x = 1 or −1 has one solution, and any value in between has two.', 'Trouve l\'angle de référence, puis utilise les quadrants où le rapport a ce signe. En un tour, sin x = 1 ou −1 a une solution, et toute valeur entre les deux en a deux.']),
    ],
    examples: [
      ex(['Example 1: degrees to radians', 'Exemple 1 : des degrés aux radians'], ['Convert 135°. Multiply: 135 × π/180.', 'Convertis 135°. Multiplie : 135 × π/180.'], ['Reduce: 3π/4.', 'Réduis : 3π/4.']),
      ex(['Example 2: a period', 'Exemple 2 : une période'], ['For y = 3 sin(4x) + 1, the period is 2π ÷ 4.', 'Pour y = 3 sin(4x) + 1, la période est 2π ÷ 4.'], ['That is π/2. The maximum is 1 + 3 = 4 and the minimum is 1 − 3 = −2.', 'C\'est π/2. Le maximum est 1 + 3 = 4 et le minimum est 1 − 3 = −2.']),
      ex(['Example 3: solve sin x = 1/2', 'Exemple 3 : résoudre sin x = 1/2'], ['The reference angle is 30°, and sine is positive in quadrants I and II.', 'L\'angle de référence est 30°, et le sinus est positif dans les quadrants I et II.'], ['The solutions in one turn are 30° and 150°.', 'Les solutions en un tour sont 30° et 150°.']),
    ],
    tryIt: { skill: 'MS.G12.MHF4U.B1.1.a', tier: 2, seed: 3 },
  },
  {
    id: 'L.g12.poly',
    skills: ['MS.G12.MHF4U.C1.1.a', 'MS.G12.MHF4U.C2.1.a', 'MS.G12.MHF4U.C3.1.a', 'MS.G12.MHF4U.C3.2.a', 'MS.G12.MHF4U.C4.1.a'],
    title: t('Polynomial and rational functions', 'Fonctions polynomiales et rationnelles'),
    intro: t('Polynomials are built from powers of x. Their degree and leading coefficient tell how the graph ends, and their factors tell where it crosses the axis.', 'Les polynômes sont faits de puissances de x. Leur degré et leur coefficient dominant indiquent comment le graphique se termine, et leurs facteurs indiquent où il coupe l\'axe.'),
    definitions: [
      d(['Features of a polynomial', 'Caractéristiques d\'un polynôme'], ['Even degree: both ends go the same way. Odd degree: opposite ways. The sign of the leading coefficient gives the right end. A polynomial of degree n has at most n − 1 turning points. The y-intercept is the value at x = 0.', 'Degré pair : les deux extrémités vont dans le même sens. Degré impair : en sens contraire. Le signe du coefficient dominant donne l\'extrémité droite. Un polynôme de degré n a au plus n − 1 points de rebroussement. L\'ordonnée à l\'origine est la valeur en x = 0.']),
      d(['Rational function features', 'Caractéristiques d\'une fonction rationnelle'], ['A vertical asymptote is where the denominator is zero. A factor that cancels leaves a hole. If the numerator and denominator have the same degree, the horizontal asymptote is the ratio of the leading coefficients.', 'Une asymptote verticale est là où le dénominateur est nul. Un facteur qui se simplifie laisse un trou. Si le numérateur et le dénominateur ont le même degré, l\'asymptote horizontale est le rapport des coefficients dominants.']),
      d(['Remainder and factor theorems', 'Théorèmes du reste et du facteur'], ['The remainder on dividing P(x) by x − k is P(k). If P(k) = 0, then x − k is a factor.', 'Le reste de la division de P(x) par x − k est P(k). Si P(k) = 0, alors x − k est un facteur.']),
      d(['Inequalities', 'Inéquations'], ['Find the zeros (and where a denominator is zero), put them on a number line, and test a number in each interval. A strict inequality leaves out the zeros, and a denominator\'s zero is always left out.', 'Trouve les zéros (et où un dénominateur est nul), place-les sur une droite numérique, et teste un nombre dans chaque intervalle. Une inégalité stricte exclut les zéros, et le zéro d\'un dénominateur est toujours exclu.']),
    ],
    examples: [
      ex(['Example 1: the factor theorem', 'Exemple 1 : le théorème du facteur'], ['Is x − 2 a factor of x³ − 3x² + 4? Find P(2) = 8 − 12 + 4.', 'Est-ce que x − 2 est un facteur de x³ − 3x² + 4 ? Trouve P(2) = 8 − 12 + 4.'], ['P(2) = 0, so yes, x − 2 is a factor.', 'P(2) = 0, donc oui, x − 2 est un facteur.']),
      ex(['Example 2: a hole', 'Exemple 2 : un trou'], ['In (x − 3)(x − 1) ÷ ((x − 3)(x + 2)), the factor x − 3 cancels, so there is a hole at x = 3.', 'Dans (x − 3)(x − 1) ÷ ((x − 3)(x + 2)), le facteur x − 3 se simplifie : il y a un trou en x = 3.'], ['The simplified function is (x − 1) ÷ (x + 2). At x = 3 it is 2/5, so the hole is at (3, 0.4).', 'La fonction simplifiée est (x − 1) ÷ (x + 2). En x = 3, elle vaut 2/5 : le trou est en (3 ; 0,4).']),
      ex(['Example 3: an inequality', 'Exemple 3 : une inéquation'], ['Solve (x − 1)(x − 4) ≤ 0. The zeros are 1 and 4.', 'Résous (x − 1)(x − 4) ≤ 0. Les zéros sont 1 et 4.'], ['The product is negative between them, and zero at the ends, so 1 ≤ x ≤ 4.', 'Le produit est négatif entre eux, et nul aux extrémités : 1 ≤ x ≤ 4.']),
    ],
    tryIt: { skill: 'MS.G12.MHF4U.C3.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.functions',
    skills: ['MS.G12.MHF4U.D1.1.a', 'MS.G12.MHF4U.D2.1.a', 'MS.G12.MHF4U.D3.1.a'],
    title: t('Rates of change, combining functions and symmetry', 'Taux de variation, combinaison de fonctions et symétrie'),
    intro: t('A rate of change tells how fast a function changes. Functions can be added, multiplied and composed, and some have a symmetry you can test.', 'Un taux de variation indique à quelle vitesse une fonction change. Les fonctions peuvent être additionnées, multipliées et composées, et certaines ont une symétrie qu\'on peut tester.'),
    definitions: [
      d(['Average rate of change', 'Taux de variation moyen'], ['Over an interval it is (f(end) − f(start)) ÷ (end − start): the slope of the secant line. For a very short interval it estimates the instantaneous rate, the slope of the tangent.', 'Sur un intervalle, c\'est (f(fin) − f(début)) ÷ (fin − début) : la pente de la sécante. Sur un intervalle très court, il estime le taux instantané, la pente de la tangente.']),
      d(['Combining functions', 'Combiner des fonctions'], ['(f + g)(x) = f(x) + g(x), and (f × g)(x) = f(x) × g(x). A composition (f ∘ g)(x) = f(g(x)) puts g inside f: work from the inside out.', '(f + g)(x) = f(x) + g(x), et (f × g)(x) = f(x) × g(x). Une composition (f ∘ g)(x) = f(g(x)) place g à l\'intérieur de f : travaille de l\'intérieur vers l\'extérieur.']),
      d(['Even and odd', 'Paire et impaire'], ['Replace x with −x. If f(−x) = f(x), the function is even (symmetric about the y-axis). If f(−x) = −f(x), it is odd (symmetric about the origin). Otherwise it is neither.', 'Remplace x par −x. Si f(−x) = f(x), la fonction est paire (symétrique par rapport à l\'axe des y). Si f(−x) = −f(x), elle est impaire (symétrique par rapport à l\'origine). Sinon, elle n\'est ni l\'une ni l\'autre.']),
    ],
    examples: [
      ex(['Example 1: average rate of change', 'Exemple 1 : taux de variation moyen'], ['For f(x) = x², from x = 1 to x = 4: f(1) = 1 and f(4) = 16.', 'Pour f(x) = x², de x = 1 à x = 4 : f(1) = 1 et f(4) = 16.'], ['The rate is (16 − 1) ÷ (4 − 1) = 5.', 'Le taux est (16 − 1) ÷ (4 − 1) = 5.']),
      ex(['Example 2: a composition', 'Exemple 2 : une composition'], ['If f(x) = 2x + 1 and g(x) = x², then (f ∘ g)(3) = f(g(3)). First g(3) = 9.', 'Si f(x) = 2x + 1 et g(x) = x², alors (f ∘ g)(3) = f(g(3)). D\'abord g(3) = 9.'], ['Then f(9) = 19.', 'Puis f(9) = 19.']),
      ex(['Example 3: odd or even', 'Exemple 3 : paire ou impaire'], ['For f(x) = x³ + x, f(−x) = −x³ − x.', 'Pour f(x) = x³ + x, f(−x) = −x³ − x.'], ['That equals −f(x), so the function is odd.', 'C\'est égal à −f(x) : la fonction est impaire.']),
    ],
    tryIt: { skill: 'MS.G12.MHF4U.D1.1.a', tier: 1, seed: 3 },
  },
];
