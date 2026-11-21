// Lessons for Grade 9 (MTH1W) Number and Algebra.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE9_LESSONS: Lesson[] = [
  {
    id: 'L.number9.sets-density',
    skills: ['MS.G9.B1.2.a', 'MS.G9.B1.3.a'],
    title: t('Number sets, density and limits', 'Ensembles de nombres, densité et limites'),
    intro: t('The number system is built in layers, each inside the next. Between any two different rational numbers there is always another, and some lists of numbers get closer and closer to a limit.', 'Le système de nombres est construit en couches, chacune dans la suivante. Entre deux nombres rationnels différents, il y en a toujours un autre, et certaines suites de nombres se rapprochent d\'une limite.'),
    definitions: [
      d(['The sets', 'Les ensembles'], ['Natural numbers 1, 2, 3, ... sit inside the whole numbers (with 0), which sit inside the integers (with negatives), which sit inside the rational numbers (fractions and decimals that end or repeat). Irrational numbers, like the square root of 2 and pi, never end or repeat and are not in these sets.', 'Les nombres naturels 1, 2, 3, ... sont dans les entiers naturels (avec 0), qui sont dans les entiers relatifs (avec les négatifs), qui sont dans les nombres rationnels (fractions et décimales finies ou périodiques). Les nombres irrationnels, comme la racine carrée de 2 et pi, n\'ont ni fin ni période et ne sont pas dans ces ensembles.']),
      d(['Density', 'Densité'], ['Between two different rational numbers there is always another one, for example their average. So there are infinitely many in between.', 'Entre deux nombres rationnels différents, il y en a toujours un autre, par exemple leur moyenne. Il y en a donc une infinité entre les deux.']),
      d(['Limit', 'Limite'], ['The limit of a list is the number its terms get as close to as you like. The list 0.9, 0.99, 0.999, ... has limit 1.', 'La limite d\'une suite est le nombre dont ses termes se rapprochent autant qu\'on veut. La suite 0,9, 0,99, 0,999, ... a pour limite 1.']),
    ],
    examples: [
      ex(['Example 1: the smallest set', 'Exemple 1 : le plus petit ensemble'], ['The number −4 is negative, so it is not natural or whole. It is a whole step with no fraction.', 'Le nombre −4 est négatif : il n\'est ni naturel ni entier naturel. C\'est un pas entier sans fraction.'], ['The smallest set that holds it is the integers.', 'Le plus petit ensemble qui le contient est celui des entiers relatifs.']),
      ex(['Example 2: between two numbers', 'Exemple 2 : entre deux nombres'], ['Find a number between 0.3 and 0.4. Their average is (0.3 + 0.4) ÷ 2 = 0.35.', 'Trouve un nombre entre 0,3 et 0,4. Leur moyenne est (0,3 + 0,4) ÷ 2 = 0,35.'], ['You can do this again between 0.3 and 0.35, so there are infinitely many.', 'Tu peux recommencer entre 0,3 et 0,35 : il y en a donc une infinité.']),
      ex(['Example 3: a limit', 'Exemple 3 : une limite'], ['The terms 2.1, 2.01, 2.001, ... get closer and closer to 2.', 'Les termes 2,1, 2,01, 2,001, ... se rapprochent de plus en plus de 2.'], ['The limit is 2.', 'La limite est 2.']),
    ],
    tryIt: { skill: 'MS.G9.B1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number9.exponents',
    skills: ['MS.G9.B2.1.a', 'MS.G9.B2.2.a'],
    title: t('Exponents, scientific notation and exponent laws', 'Exposants, notation scientifique et lois des exposants'),
    intro: t('An exponent tells how many times to multiply a base. Negative exponents make reciprocals, and the exponent laws let you simplify without working out the powers.', 'Un exposant indique combien de fois multiplier une base. Les exposants négatifs donnent des inverses, et les lois des exposants permettent de simplifier sans calculer les puissances.'),
    definitions: [
      d(['Negative exponents', 'Exposants négatifs'], ['A negative exponent means a reciprocal: 2 to the power −3 is 1 ÷ 2³ = 1 ÷ 8 = 0.125. It does not make the number negative.', 'Un exposant négatif signifie un inverse : 2 à la puissance −3 vaut 1 ÷ 2³ = 1 ÷ 8 = 0,125. Il ne rend pas le nombre négatif.']),
      d(['Scientific notation', 'Notation scientifique'], ['Write a number as a × 10ⁿ with 1 ≤ a < 10. Large numbers have a positive n and numbers between 0 and 1 have a negative n. When you multiply, multiply the front numbers and add the exponents.', 'Écris un nombre sous la forme a × 10ⁿ avec 1 ≤ a < 10. Les grands nombres ont un n positif et les nombres entre 0 et 1 ont un n négatif. Quand tu multiplies, multiplie les nombres de devant et additionne les exposants.']),
      d(['Exponent laws', 'Lois des exposants'], ['Same base: multiply → add exponents; divide → subtract exponents; power of a power → multiply exponents.', 'Même base : multiplier → additionner les exposants ; diviser → soustraire les exposants ; puissance de puissance → multiplier les exposants.']),
    ],
    examples: [
      ex(['Example 1: scientific notation', 'Exemple 1 : notation scientifique'], ['Write 83 000 as a × 10ⁿ. The decimal point moves 4 places left to give 8.3.', 'Écris 83 000 sous la forme a × 10ⁿ. La virgule se déplace de 4 positions vers la gauche pour donner 8,3.'], ['So 83 000 = 8.3 × 10⁴.', 'Donc 83 000 = 8,3 × 10⁴.']),
      ex(['Example 2: product of powers', 'Exemple 2 : produit de puissances'], ['2³ × 2⁴: same base, so add the exponents 3 + 4 = 7.', '2³ × 2⁴ : même base, donc additionne les exposants 3 + 4 = 7.'], ['2³ × 2⁴ = 2⁷ = 128.', '2³ × 2⁴ = 2⁷ = 128.']),
      ex(['Example 3: power of a power', 'Exemple 3 : puissance de puissance'], ['(x²)³ ÷ x⁴. The top is x⁶, because the exponents multiply: 2 × 3 = 6.', '(x²)³ ÷ x⁴. Le haut est x⁶, parce que les exposants se multiplient : 2 × 3 = 6.'], ['Now divide: x⁶ ÷ x⁴ = x², because 6 − 4 = 2.', 'Maintenant, divise : x⁶ ÷ x⁴ = x², parce que 6 − 4 = 2.']),
    ],
    tryIt: { skill: 'MS.G9.B2.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number9.integers-fractions-rates',
    skills: ['MS.G9.B3.1.a', 'MS.G9.B3.2.a', 'MS.G9.B3.3.a', 'MS.G9.B3.4.a', 'MS.G9.B3.5.a'],
    title: t('Integers, fractions, signs, rates and proportions', 'Entiers, fractions, signes, taux et proportions'),
    intro: t('Positive and negative numbers show direction and change. The sign rules, fraction skills and proportional reasoning you know all work with them.', 'Les nombres positifs et négatifs montrent une direction et un changement. Les règles des signes, les habiletés avec les fractions et le raisonnement proportionnel que tu connais fonctionnent tous avec eux.'),
    definitions: [
      d(['Integers in context', 'Entiers en contexte'], ['Up or rising is positive and down or falling is negative. To find the distance between two positions, subtract the lower from the higher.', 'Monter est positif et descendre est négatif. Pour trouver la distance entre deux positions, soustrais la plus basse de la plus haute.']),
      d(['Signs in rates', 'Signes dans les taux'], ['Rate = change ÷ time. A negative change over a positive time is a negative rate. The same signs give a positive answer when dividing, different signs give a negative answer.', 'Taux = changement ÷ temps. Un changement négatif sur un temps positif donne un taux négatif. Des signes pareils donnent un résultat positif à la division, des signes différents un résultat négatif.']),
      d(['Signed fractions', 'Fractions signées'], ['Use a common denominator and keep the signs on the numerators, then simplify. Change mixed numbers to improper fractions first.', 'Utilise un dénominateur commun et garde les signes sur les numérateurs, puis simplifie. Transforme d\'abord les nombres fractionnaires en fractions impropres.']),
      d(['Rates, percents, proportions', 'Taux, pourcentages, proportions'], ['A unit rate is the amount for 1. Percent change = change ÷ original × 100. In a proportion, scale both parts by the same factor.', 'Un taux unitaire est la quantité pour 1. Pourcentage de variation = changement ÷ valeur de départ × 100. Dans une proportion, multiplie les deux parties par le même facteur.']),
    ],
    examples: [
      ex(['Example 1: a rate with a sign', 'Exemple 1 : un taux avec un signe'], ['A glacier shrinks 24 m in 6 years: −24 ÷ 6.', 'Un glacier recule de 24 m en 6 ans : −24 ÷ 6.'], ['The rate is −4 m per year.', 'Le taux est de −4 m par année.']),
      ex(['Example 2: signed fractions', 'Exemple 2 : fractions signées'], ['−1/2 + 1/3 uses the denominator 6: −3/6 + 2/6.', '−1/2 + 1/3 utilise le dénominateur 6 : −3/6 + 2/6.'], ['The sum is −1/6.', 'La somme est −1/6.']),
      ex(['Example 3: percent change', 'Exemple 3 : pourcentage de variation'], ['A price goes from 80 dollars to 92 dollars. The change is 12 dollars.', 'Un prix passe de 80 dollars à 92 dollars. Le changement est de 12 dollars.'], ['12 ÷ 80 × 100 = 15%, a 15% increase.', '12 ÷ 80 × 100 = 15 %, une hausse de 15 %.']),
    ],
    tryIt: { skill: 'MS.G9.B3.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra9.expressions-equations',
    skills: ['MS.G9.C1.2.a', 'MS.G9.C1.3.a', 'MS.G9.C1.4.a', 'MS.G9.C1.5.a'],
    title: t('Creating, simplifying and solving with expressions', 'Créer, simplifier et résoudre avec des expressions'),
    intro: t('A letter can stand for any number in a pattern, and expressions that always give the same value are equivalent. You can use that to simplify and to solve.', 'Une lettre peut représenter n\'importe quel nombre dans une suite, et des expressions qui donnent toujours la même valeur sont équivalentes. Tu peux t\'en servir pour simplifier et pour résoudre.'),
    definitions: [
      d(['Creating expressions', 'Créer des expressions'], ['Amounts that repeat multiply the letter, and amounts that happen once are added or subtracted. A taxi that charges 4 dollars plus 3 dollars per km costs 3n + 4 dollars for n km.', 'Les montants qui se répètent multiplient la lettre, et ceux qui arrivent une fois s\'ajoutent ou se retranchent. Un taxi qui charge 4 dollars plus 3 dollars par km coûte 3n + 4 dollars pour n km.']),
      d(['Equivalent expressions', 'Expressions équivalentes'], ['Expressions are equivalent when they give the same value for every x. Use the distributive property and combine like terms, or test a value of x.', 'Des expressions sont équivalentes quand elles donnent la même valeur pour tout x. Utilise la distributivité et regroupe les termes semblables, ou teste une valeur de x.']),
      d(['Solving equations', 'Résoudre des équations'], ['Do the same operation to both sides. With letters on both sides, move the x terms to one side first. Check by putting the answer back in.', 'Fais la même opération des deux côtés. Avec des lettres des deux côtés, regroupe d\'abord les termes en x d\'un côté. Vérifie en remettant la réponse dans l\'équation.']),
    ],
    examples: [
      ex(['Example 1: expand and combine', 'Exemple 1 : développer et regrouper'], ['2(x + 3) + 4x expands to 2x + 6 + 4x.', '2(x + 3) + 4x se développe en 2x + 6 + 4x.'], ['Combine: 6x + 6.', 'Regroupe : 6x + 6.']),
      ex(['Example 2: a word equation', 'Exemple 2 : une équation en mots'], ['A plumber charges 40 dollars plus 30 dollars an hour and the bill is 130 dollars: 30h + 40 = 130.', 'Un plombier charge 40 dollars plus 30 dollars l\'heure et la facture est de 130 dollars : 30h + 40 = 130.'], ['30h = 90, so h = 3 hours.', '30h = 90, donc h = 3 heures.']),
      ex(['Example 3: both sides', 'Exemple 3 : des deux côtés'], ['Solve 5x + 3 = 2x + 15. Subtract 2x: 3x + 3 = 15.', 'Résous 5x + 3 = 2x + 15. Soustrais 2x : 3x + 3 = 15.'], ['3x = 12, so x = 4. Check: 23 = 23.', '3x = 12, donc x = 4. Vérifie : 23 = 23.']),
    ],
    tryIt: { skill: 'MS.G9.C1.5.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.algebra9.linear-relations',
    skills: ['MS.G9.C3.1.a', 'MS.G9.C3.2.a', 'MS.G9.C3.3.a', 'MS.G9.C4.2.a', 'MS.G9.C4.3.a', 'MS.G9.C4.4.a'],
    title: t('Linear relations and lines', 'Relations linéaires et droites'),
    intro: t('A linear relation changes by the same amount each step. Its equation y = mx + b shows the rate of change m and the initial value b.', 'Une relation linéaire change du même montant à chaque pas. Son équation y = mx + b montre le taux de variation m et la valeur initiale b.'),
    definitions: [
      d(['Linear or not', 'Linéaire ou non'], ['In a table, when x goes up by the same step, a linear relation has the same change in y every time. Slope = change in y ÷ change in x.', 'Dans un tableau, quand x augmente du même pas, une relation linéaire a le même changement de y à chaque fois. Pente = changement de y ÷ changement de x.']),
      d(['Rate and initial value', 'Taux et valeur initiale'], ['In y = mx + b, m is the rate of change and b is the value when x = 0 (the initial value, or y-intercept).', 'Dans y = mx + b, m est le taux de variation et b est la valeur quand x = 0 (la valeur initiale, ou ordonnée à l\'origine).']),
      d(['Two lines', 'Deux droites'], ['Two lines cross where their y values are equal. Set the expressions equal and solve for x, then find y.', 'Deux droites se croisent là où leurs valeurs de y sont égales. Pose les expressions égales et résous pour x, puis trouve y.']),
      d(['Special lines and transformations', 'Droites particulières et transformations'], ['x = k is vertical and y = k is horizontal. For ax + by = k, set one variable to 0 to find an intercept. Reflecting y = ax in an axis changes the slope to −a. Rotating by 90° gives slope −1/a.', 'x = k est verticale et y = k est horizontale. Pour ax + by = k, pose une variable égale à 0 pour trouver un point d\'intersection avec un axe. Réfléchir y = ax par rapport à un axe donne une pente de −a. Une rotation de 90° donne une pente de −1/a.']),
    ],
    examples: [
      ex(['Example 1: rate and initial value', 'Exemple 1 : taux et valeur initiale'], ['After 2 months a gym member has paid 130 dollars and after 4 months 210 dollars. The rate is (210 − 130) ÷ 2 = 40 dollars a month.', 'Après 2 mois, un membre d\'un gym a payé 130 dollars et après 4 mois 210 dollars. Le taux est de (210 − 130) ÷ 2 = 40 dollars par mois.'], ['The sign-up fee is 130 − 2 × 40 = 50 dollars.', 'Les frais d\'inscription sont de 130 − 2 × 40 = 50 dollars.']),
      ex(['Example 2: where two lines meet', 'Exemple 2 : là où deux droites se rencontrent'], ['y = 3x + 2 and y = x + 8: set 3x + 2 = x + 8.', 'y = 3x + 2 et y = x + 8 : pose 3x + 2 = x + 8.'], ['2x = 6, so x = 3 and y = 11.', '2x = 6, donc x = 3 et y = 11.']),
      ex(['Example 3: an intercept', 'Exemple 3 : un point d\'intersection avec un axe'], ['The line 2x + 5y = 20: set y = 0 to find the x-intercept.', 'La droite 2x + 5y = 20 : pose y = 0 pour trouver l\'abscisse à l\'origine.'], ['2x = 20, so x = 10.', '2x = 20, donc x = 10.']),
    ],
    tryIt: { skill: 'MS.G9.C3.2.a', tier: 1, seed: 3 },
  },
];
