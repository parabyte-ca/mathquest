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
  {
    id: 'L.g12.derivatives',
    skills: ['MS.G12.MCV4U.A1.1.a', 'MS.G12.MCV4U.A1.2.a', 'MS.G12.MCV4U.A2.1.a', 'MS.G12.MCV4U.A3.1.a', 'MS.G12.MCV4U.A3.2.a', 'MS.G12.MCV4U.A3.3.a'],
    title: t('Limits and derivatives', 'Limites et dérivées'),
    intro: t('A derivative measures how fast a function is changing at one point. It is the slope of the tangent line, and it is found as a limit.', 'Une dérivée mesure la vitesse à laquelle une fonction change en un point. C\'est la pente de la tangente, et on la trouve comme une limite.'),
    definitions: [
      d(['Limit', 'Limite'], ['The limit of f(x) as x approaches a is the value f(x) gets close to. If putting x = a in gives 0 ÷ 0, factor and cancel first.', 'La limite de f(x) quand x tend vers a est la valeur dont f(x) se rapproche. Si remplacer x = a donne 0 ÷ 0, factorise et simplifie d\'abord.']),
      d(['First principles', 'Définition de la dérivée'], ['f′(x) is the limit as h goes to 0 of (f(x + h) − f(x)) ÷ h. Expand, simplify, divide by h, then let h go to 0.', 'f′(x) est la limite, quand h tend vers 0, de (f(x + h) − f(x)) ÷ h. Développe, simplifie, divise par h, puis laisse h tendre vers 0.']),
      d(['Derivative rules', 'Règles de dérivation'], ['Power rule: the derivative of xⁿ is n xⁿ⁻¹. Product rule: (fg)′ = f′g + fg′. Quotient rule: (f ÷ g)′ = (f′g − fg′) ÷ g². Chain rule: differentiate the outside, keep the inside, and multiply by the derivative of the inside.', 'Règle de la puissance : la dérivée de xⁿ est n xⁿ⁻¹. Règle du produit : (fg)′ = f′g + fg′. Règle du quotient : (f ÷ g)′ = (f′g − fg′) ÷ g². Règle en chaîne : dérive l\'extérieur, garde l\'intérieur, et multiplie par la dérivée de l\'intérieur.']),
      d(['Sine, cosine and the exponential', 'Sinus, cosinus et exponentielle'], ['The derivative of sin x is cos x, the derivative of cos x is −sin x, and the derivative of eˣ is eˣ.', 'La dérivée de sin x est cos x, la dérivée de cos x est −sin x, et la dérivée de eˣ est eˣ.']),
    ],
    examples: [
      ex(['Example 1: a limit', 'Exemple 1 : une limite'], ['Find the limit as x approaches 3 of (x² − 9) ÷ (x − 3). Factor: (x − 3)(x + 3) ÷ (x − 3).', 'Trouve la limite quand x tend vers 3 de (x² − 9) ÷ (x − 3). Factorise : (x − 3)(x + 3) ÷ (x − 3).'], ['Cancel to get x + 3, and put in x = 3: the limit is 6.', 'Simplifie pour obtenir x + 3, et remplace x = 3 : la limite est 6.']),
      ex(['Example 2: product rule', 'Exemple 2 : règle du produit'], ['For f(x) = (x + 2)(x − 5), f′(x) = (1)(x − 5) + (x + 2)(1).', 'Pour f(x) = (x + 2)(x − 5), f′(x) = (1)(x − 5) + (x + 2)(1).'], ['At x = 4 that is (−1) + 6 = 5.', 'En x = 4, cela donne (−1) + 6 = 5.']),
      ex(['Example 3: chain rule', 'Exemple 3 : règle en chaîne'], ['For f(x) = (2x + 1)³, f′(x) = 3(2x + 1)² × 2.', 'Pour f(x) = (2x + 1)³, f′(x) = 3(2x + 1)² × 2.'], ['At x = 1 that is 3 × 9 × 2 = 54.', 'En x = 1, cela donne 3 × 9 × 2 = 54.']),
    ],
    tryIt: { skill: 'MS.G12.MCV4U.A3.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.applications',
    skills: ['MS.G12.MCV4U.B1.1.a', 'MS.G12.MCV4U.B2.1.a'],
    title: t('Using derivatives: curves and optimization', 'Utiliser les dérivées : courbes et optimisation'),
    intro: t('The first derivative tells where a function rises or falls, and the second derivative tells how it bends. Together they find the highest and lowest values.', 'La dérivée première indique où une fonction monte ou descend, et la dérivée seconde indique comment elle se courbe. Ensemble, elles trouvent les valeurs les plus hautes et les plus basses.'),
    definitions: [
      d(['Critical points', 'Points critiques'], ['Set f′(x) = 0. A local maximum is where f′ changes from positive to negative, and a local minimum is where it changes from negative to positive.', 'Pose f′(x) = 0. Un maximum local est là où f′ passe de positive à négative, et un minimum local est là où elle passe de négative à positive.']),
      d(['Concavity and inflection', 'Concavité et inflexion'], ['Where f″ is positive the graph bends upward, and where f″ is negative it bends downward. A point of inflection is where the concavity changes, so f″ = 0 there.', 'Là où f″ est positive, le graphique se courbe vers le haut, et là où f″ est négative, il se courbe vers le bas. Un point d\'inflexion est là où la concavité change : f″ = 0 en ce point.']),
      d(['Optimization', 'Optimisation'], ['Write what you want to maximize or minimize as a function of one variable, differentiate, set the derivative to 0, solve, and check that it is the largest or smallest value that makes sense.', 'Écris ce que tu veux maximiser ou minimiser comme une fonction d\'une seule variable, dérive, pose la dérivée égale à 0, résous, et vérifie que c\'est la plus grande ou la plus petite valeur qui a du sens.']),
    ],
    examples: [
      ex(['Example 1: a critical point', 'Exemple 1 : un point critique'], ['For f(x) = x² − 6x + 1, f′(x) = 2x − 6. Set it to 0.', 'Pour f(x) = x² − 6x + 1, f′(x) = 2x − 6. Pose-la égale à 0.'], ['x = 3. The parabola opens upward, so this is the minimum.', 'x = 3. La parabole est ouverte vers le haut : c\'est le minimum.']),
      ex(['Example 2: inflection', 'Exemple 2 : inflexion'], ['For f(x) = x³ − 6x² + 2, f″(x) = 6x − 12.', 'Pour f(x) = x³ − 6x² + 2, f″(x) = 6x − 12.'], ['It is 0 at x = 2, where the concavity changes: the point of inflection.', 'Elle est nulle en x = 2, où la concavité change : le point d\'inflexion.']),
      ex(['Example 3: the largest area', 'Exemple 3 : la plus grande aire'], ['A rectangle has perimeter 40 m. With width w, the length is 20 − w and the area is A = w(20 − w).', 'Un rectangle a un périmètre de 40 m. Avec une largeur w, la longueur est 20 − w et l\'aire est A = w(20 − w).'], ['A′ = 20 − 2w = 0 gives w = 10, so the greatest area is 10 × 10 = 100 square metres.', 'A′ = 20 − 2w = 0 donne w = 10 : l\'aire maximale est 10 × 10 = 100 mètres carrés.']),
    ],
    tryIt: { skill: 'MS.G12.MCV4U.B1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.vectors',
    skills: ['MS.G12.MCV4U.C1.1.a', 'MS.G12.MCV4U.C2.1.a', 'MS.G12.MCV4U.C2.2.a', 'MS.G12.MCV4U.C3.1.a', 'MS.G12.MCV4U.C4.1.a', 'MS.G12.MCV4U.C4.2.a'],
    title: t('Vectors, lines and planes', 'Vecteurs, droites et plans'),
    intro: t('A vector has a size and a direction. In coordinates it is a list of components, and the dot and cross products turn two vectors into a number or a new vector.', 'Un vecteur a une grandeur et une direction. En coordonnées, c\'est une liste de composantes, et les produits scalaire et vectoriel transforment deux vecteurs en un nombre ou en un nouveau vecteur.'),
    definitions: [
      d(['Magnitude and operations', 'Norme et opérations'], ['The magnitude of (a, b, c) is the square root of a² + b² + c². Add and subtract vectors component by component, and multiply every component by a scalar.', 'La norme de (a, b, c) est la racine carrée de a² + b² + c². Additionne et soustrais les vecteurs composante par composante, et multiplie chaque composante par un scalaire.']),
      d(['Dot product', 'Produit scalaire'], ['a · b = a₁b₁ + a₂b₂ + a₃b₃. It is 0 when the vectors are perpendicular. Work is force · displacement, and the scalar projection of a on b is (a · b) ÷ |b|.', 'a · b = a₁b₁ + a₂b₂ + a₃b₃. Il égale 0 quand les vecteurs sont perpendiculaires. Le travail est force · déplacement, et la projection scalaire de a sur b est (a · b) ÷ |b|.']),
      d(['Cross product', 'Produit vectoriel'], ['a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁). It is perpendicular to both vectors.', 'a × b = (a₂b₃ − a₃b₂, a₃b₁ − a₁b₃, a₁b₂ − a₂b₁). Il est perpendiculaire aux deux vecteurs.']),
      d(['Lines and planes', 'Droites et plans'], ['A plane with normal (a, b, c) through a point P has equation ax + by + cz = D, where D = n · P. A line is r = P + t d. To find where a line meets a plane, put the line into the plane equation and solve for t.', 'Un plan de vecteur normal (a, b, c) passant par un point P a pour équation ax + by + cz = D, où D = n · P. Une droite est r = P + t d. Pour trouver où une droite rencontre un plan, remplace la droite dans l\'équation du plan et résous pour t.']),
    ],
    examples: [
      ex(['Example 1: magnitude', 'Exemple 1 : norme'], ['For v = (2, 3, 6), the magnitude is the square root of 4 + 9 + 36.', 'Pour v = (2, 3, 6), la norme est la racine carrée de 4 + 9 + 36.'], ['That is the square root of 49, which is 7.', 'C\'est la racine carrée de 49, soit 7.']),
      ex(['Example 2: perpendicular', 'Exemple 2 : perpendiculaires'], ['For (k, 6) and (3, 2) to be perpendicular, the dot product is 3k + 12 = 0.', 'Pour que (k, 6) et (3, 2) soient perpendiculaires, le produit scalaire est 3k + 12 = 0.'], ['So k = −4.', 'Donc k = −4.']),
      ex(['Example 3: a line meets a plane', 'Exemple 3 : une droite rencontre un plan'], ['The line (1, 0, 2) + t(1, 1, 1) and the plane x + y + z = 9: put in 1 + t, t and 2 + t.', 'La droite (1, 0, 2) + t(1, 1, 1) et le plan x + y + z = 9 : remplace par 1 + t, t et 2 + t.'], ['3 + 3t = 9, so t = 2 and the point is (3, 2, 4).', '3 + 3t = 9, donc t = 2 et le point est (3, 2, 4).']),
    ],
    tryIt: { skill: 'MS.G12.MCV4U.C1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.counting-probability',
    skills: ['MS.G12.MDM4U.A1.1.a', 'MS.G12.MDM4U.A1.2.a', 'MS.G12.MDM4U.A2.1.a', 'MS.G12.MDM4U.A2.2.a'],
    title: t('Probability rules and counting', 'Règles de probabilité et dénombrement'),
    intro: t('Probability measures how likely an event is, from 0 to 1. Counting methods tell you how many outcomes there are, so you can find probabilities without listing them all.', 'La probabilité mesure la vraisemblance d\'un événement, de 0 à 1. Les méthodes de dénombrement indiquent combien il y a d\'issues, ce qui permet de trouver des probabilités sans toutes les énumérer.'),
    definitions: [
      d(['Rules of probability', 'Règles de probabilité'], ['The complement: P(not A) = 1 − P(A). For two events: P(A or B) = P(A) + P(B) − P(A and B). For independent events: P(A and B) = P(A) × P(B).', 'Le complément : P(non A) = 1 − P(A). Pour deux événements : P(A ou B) = P(A) + P(B) − P(A et B). Pour des événements indépendants : P(A et B) = P(A) × P(B).']),
      d(['Conditional probability', 'Probabilité conditionnelle'], ['P(A | B) = P(A and B) ÷ P(B), the probability of A once B is known. When objects are drawn without replacement, the second probability changes: it is a conditional probability.', 'P(A | B) = P(A et B) ÷ P(B), la probabilité de A quand on sait que B s\'est produit. Quand on tire des objets sans remise, la deuxième probabilité change : c\'est une probabilité conditionnelle.']),
      d(['Permutations and combinations', 'Arrangements et combinaisons'], ['A permutation counts ordered selections: P(n, k) = n! ÷ (n − k)!. A combination ignores order: C(n, k) = n! ÷ (k! (n − k)!). Letters with repeats: divide n! by the factorial of each repeat.', 'Un arrangement compte les choix ordonnés : P(n, k) = n! ÷ (n − k)!. Une combinaison ignore l\'ordre : C(n, k) = n! ÷ (k! (n − k)!). Lettres répétées : divise n! par la factorielle de chaque répétition.']),
      d(['Pascal\'s triangle', 'Triangle de Pascal'], ['Row n lists C(n, 0), C(n, 1), ... C(n, n). Each entry is the sum of the two above it, and row n adds to 2ⁿ.', 'La rangée n liste C(n, 0), C(n, 1), ... C(n, n). Chaque terme est la somme des deux termes au-dessus, et la rangée n a pour somme 2ⁿ.']),
    ],
    examples: [
      ex(['Example 1: either event', 'Exemple 1 : l\'un ou l\'autre'], ['P(A) = 0.5, P(B) = 0.4, P(A and B) = 0.2. Then P(A or B) = 0.5 + 0.4 − 0.2.', 'P(A) = 0,5, P(B) = 0,4, P(A et B) = 0,2. Alors P(A ou B) = 0,5 + 0,4 − 0,2.'], ['That is 0.7.', 'Cela donne 0,7.']),
      ex(['Example 2: without replacement', 'Exemple 2 : sans remise'], ['A bag has 3 red and 2 blue marbles. Two are drawn. The first is red with probability 3/5.', 'Un sac contient 3 billes rouges et 2 bleues. On en tire deux. La première est rouge avec une probabilité de 3/5.'], ['Then 2 reds are left among 4, so both are red with probability 3/5 × 2/4 = 0.3.', 'Il reste alors 2 rouges parmi 4 : les deux sont rouges avec une probabilité de 3/5 × 2/4 = 0,3.']),
      ex(['Example 3: committees', 'Exemple 3 : comités'], ['Choose a committee of 3 from 6 people. Order does not matter, so use C(6, 3).', 'Choisis un comité de 3 personnes parmi 6. L\'ordre ne compte pas : utilise C(6, 3).'], ['6! ÷ (3! 3!) = 20.', '6! ÷ (3! 3!) = 20.']),
    ],
    tryIt: { skill: 'MS.G12.MDM4U.A1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.distributions',
    skills: ['MS.G12.MDM4U.B1.1.a', 'MS.G12.MDM4U.B1.2.a', 'MS.G12.MDM4U.B1.3.a', 'MS.G12.MDM4U.B2.1.a', 'MS.G12.MDM4U.B2.2.a'],
    title: t('Probability distributions', 'Lois de probabilité'),
    intro: t('A probability distribution lists every value a random variable can take with its probability. Its expected value is the long-run average.', 'Une loi de probabilité liste chaque valeur qu\'une variable aléatoire peut prendre avec sa probabilité. Son espérance est la moyenne à long terme.'),
    definitions: [
      d(['Expected value', 'Espérance'], ['E(X) = the sum of each value times its probability. A game is fair when the entry fee equals the expected winnings.', 'E(X) = la somme de chaque valeur fois sa probabilité. Un jeu est équitable quand le droit d\'entrée égale les gains espérés.']),
      d(['Binomial distribution', 'Loi binomiale'], ['n independent trials, each with success probability p: P(X = k) = C(n, k) pᵏ qⁿ⁻ᵏ, with mean np and standard deviation the square root of npq.', 'n essais indépendants, chacun avec une probabilité de succès p : P(X = k) = C(n, k) pᵏ qⁿ⁻ᵏ, de moyenne np et d\'écart-type la racine carrée de npq.']),
      d(['Hypergeometric distribution', 'Loi hypergéométrique'], ['Drawing n items without replacement from N items, K of which are special: P(X = k) = C(K, k) C(N − K, n − k) ÷ C(N, n), and the mean is nK ÷ N.', 'On tire n articles sans remise parmi N articles, dont K sont spéciaux : P(X = k) = C(K, k) C(N − K, n − k) ÷ C(N, n), et la moyenne est nK ÷ N.']),
      d(['Normal distribution', 'Loi normale'], ['z = (x − mean) ÷ standard deviation. About 68% of values are within 1 standard deviation, 95% within 2 and 99.7% within 3. A binomial with large n can be approximated by a normal with mean np and standard deviation √(npq), using a continuity correction of 0.5.', 'z = (x − moyenne) ÷ écart-type. Environ 68 % des valeurs sont à moins de 1 écart-type, 95 % à moins de 2 et 99,7 % à moins de 3. Une loi binomiale avec un grand n peut être approximée par une loi normale de moyenne np et d\'écart-type √(npq), avec une correction de continuité de 0,5.']),
    ],
    examples: [
      ex(['Example 1: expected value', 'Exemple 1 : espérance'], ['A game pays 20 dollars with probability 0.25 and nothing otherwise.', 'Un jeu verse 20 dollars avec une probabilité de 0,25, et rien sinon.'], ['E = 20 × 0.25 = 5 dollars, so 5 dollars is the fair entry fee.', 'E = 20 × 0,25 = 5 dollars : 5 dollars est le droit d\'entrée équitable.']),
      ex(['Example 2: binomial', 'Exemple 2 : binomiale'], ['Toss a fair coin 4 times. P(exactly 2 heads) = C(4, 2) × (1/2)⁴.', 'On lance une pièce équilibrée 4 fois. P(exactement 2 faces) = C(4, 2) × (1/2)⁴.'], ['6 ÷ 16 = 0.375.', '6 ÷ 16 = 0,375.']),
      ex(['Example 3: z-score', 'Exemple 3 : cote z'], ['Scores have mean 70 and standard deviation 8. A score of 86 has z = (86 − 70) ÷ 8.', 'Les notes ont une moyenne de 70 et un écart-type de 8. Une note de 86 a z = (86 − 70) ÷ 8.'], ['z = 2, which is two standard deviations above the mean.', 'z = 2, soit deux écarts-types au-dessus de la moyenne.']),
    ],
    tryIt: { skill: 'MS.G12.MDM4U.B1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.g12.data-analysis',
    skills: ['MS.G12.MDM4U.C1.1.a', 'MS.G12.MDM4U.C2.1.a', 'MS.G12.MDM4U.D1.1.a', 'MS.G12.MDM4U.D1.2.a', 'MS.G12.MDM4U.D2.1.a', 'MS.G12.MDM4U.D2.2.a', 'MS.G12.MDM4U.D3.1.a'],
    title: t('Collecting and analysing data', 'Recueillir et analyser des données'),
    intro: t('Good conclusions need good data. How a sample is chosen decides whether it can be trusted, and spread and correlation describe what the data show.', 'De bonnes conclusions demandent de bonnes données. La façon de choisir un échantillon décide si on peut s\'y fier, et l\'étalement et la corrélation décrivent ce que les données montrent.'),
    definitions: [
      d(['Sampling and bias', 'Échantillonnage et biais'], ['Simple random, systematic (every kth), stratified (random from each group), cluster (whole randomly chosen groups) and multi-stage samples aim to represent the population. A convenience or voluntary sample usually does not. Bias comes from who is chosen, who answers, how a question is worded and how things are measured.', 'Les échantillons aléatoire simple, systématique (un sur k), stratifié (au hasard dans chaque groupe), par grappes (groupes entiers choisis au hasard) et à plusieurs degrés visent à représenter la population. Un échantillon de commodité ou volontaire ne le fait généralement pas. Le biais vient de qui est choisi, de qui répond, de la formulation d\'une question et de la façon de mesurer.']),
      d(['Spread', 'Étalement'], ['Variance is the mean of the squared deviations (divide by n for a population, n − 1 for a sample), and standard deviation is its square root. The IQR is Q3 − Q1, and a value is an outlier if it is beyond Q1 − 1.5 × IQR or Q3 + 1.5 × IQR.', 'La variance est la moyenne des carrés des écarts (divise par n pour une population, n − 1 pour un échantillon), et l\'écart-type en est la racine carrée. L\'EIQ est Q3 − Q1, et une valeur est aberrante si elle dépasse Q1 − 1,5 × EIQ ou Q3 + 1,5 × EIQ.']),
      d(['Regression and residuals', 'Régression et résidus'], ['The least-squares line has slope r × s_y ÷ s_x. r² is the fraction of the variation in y explained by the line. A residual is actual y minus predicted y, and the residuals of a least-squares line add to zero.', 'La droite des moindres carrés a pour pente r × s_y ÷ s_x. r² est la fraction de la variation de y expliquée par la droite. Un résidu est le y réel moins le y prédit, et les résidus d\'une droite des moindres carrés ont pour somme zéro.']),
      d(['Margin of error', 'Marge d\'erreur'], ['For a poll of n people the margin of error is about 1 ÷ √n. The true percent is likely to be within that many percentage points of the poll result.', 'Pour un sondage auprès de n personnes, la marge d\'erreur est d\'environ 1 ÷ √n. Le vrai pourcentage se trouve probablement à ce nombre de points de pourcentage du résultat du sondage.']),
    ],
    examples: [
      ex(['Example 1: stratified or cluster', 'Exemple 1 : stratifié ou par grappes'], ['A sample takes some students at random from each grade.', 'Un échantillon prend des élèves au hasard dans chaque niveau.'], ['That is stratified. If whole classes were chosen instead, it would be a cluster sample.', 'C\'est stratifié. Si on avait choisi des classes entières, ce serait un échantillon par grappes.']),
      ex(['Example 2: outlier fence', 'Exemple 2 : clôture des valeurs aberrantes'], ['If Q1 = 12 and Q3 = 20, then IQR = 8.', 'Si Q1 = 12 et Q3 = 20, alors EIQ = 8.'], ['The upper fence is 20 + 1.5 × 8 = 32, so a value of 40 is an outlier.', 'La clôture supérieure est 20 + 1,5 × 8 = 32 : une valeur de 40 est aberrante.']),
      ex(['Example 3: margin of error', 'Exemple 3 : marge d\'erreur'], ['A poll of 400 people finds 55% support.', 'Un sondage auprès de 400 personnes révèle 55 % d\'appui.'], ['The margin of error is 100 ÷ 20 = 5 points, so the support is likely between 50% and 60%.', 'La marge d\'erreur est de 100 ÷ 20 = 5 points : l\'appui se situe probablement entre 50 % et 60 %.']),
    ],
    tryIt: { skill: 'MS.G12.MDM4U.C2.1.a', tier: 1, seed: 3 },
  },
];
