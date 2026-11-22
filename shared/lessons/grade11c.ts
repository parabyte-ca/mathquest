// Lessons for Grade 11 Foundations for College Mathematics (MBF3C): quadratics, exponents, finance, design and trigonometry, data.
import type { Lesson } from './types.js';
import { t } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });

export const GRADE11C_LESSONS: Lesson[] = [
  {
    id: 'L.g11.mbf-quadratics',
    skills: ['MS.G11.MBF3C.A1.1.a', 'MS.G11.MBF3C.A1.2.a', 'MS.G11.MBF3C.A1.3.a', 'MS.G11.MBF3C.A1.4.a'],
    title: t('Expanding, factoring and the vertex of a quadratic', 'Développer, factoriser et sommet d\'un polynôme du second degré'),
    intro: t('A quadratic can be written as a product of brackets or as a sum of terms. Expanding goes one way, factoring goes back, and factoring is how you solve a quadratic equation.', 'Un polynôme du second degré peut s\'écrire comme un produit de parenthèses ou comme une somme de termes. Développer va dans un sens, factoriser revient en arrière, et factoriser permet de résoudre une équation du second degré.'),
    definitions: [
      d(['Expanding', 'Développer'], ['Multiply each term of one bracket by each term of the other, then collect like terms: (x + p)(x + q) = x² + (p + q)x + pq.', 'Multiplie chaque terme d\'une parenthèse par chaque terme de l\'autre, puis regroupe les termes semblables : (x + p)(x + q) = x² + (p + q)x + pq.']),
      d(['Factoring x² + bx + c', 'Factoriser x² + bx + c'], ['Find two numbers that multiply to c and add to b. Then x² + bx + c = (x + p)(x + q). If every term shares a factor, take it out first.', 'Trouve deux nombres dont le produit est c et la somme est b. Alors x² + bx + c = (x + p)(x + q). Si tous les termes ont un facteur commun, mets-le d\'abord en évidence.']),
      d(['Solving by factoring', 'Résoudre par factorisation'], ['Move everything to one side so it equals zero, factor, then set each bracket equal to zero. If a product is zero, one of its factors is zero.', 'Mets tout d\'un côté pour que l\'expression soit égale à zéro, factorise, puis pose chaque parenthèse égale à zéro. Si un produit est nul, un de ses facteurs est nul.']),
      d(['Vertex form', 'Forme canonique'], ['y = a(x − h)² + k has its vertex at (h, k). Expanding it gives the standard form y = ax² + bx + c, with b = −2ah and c = ah² + k.', 'y = a(x − h)² + k a son sommet en (h, k). En la développant, on obtient la forme standard y = ax² + bx + c, avec b = −2ah et c = ah² + k.']),
    ],
    examples: [
      ex(['Example 1: expand', 'Exemple 1 : développer'], ['Expand (x + 3)(x + 5). The four products are x², 5x, 3x and 15.', 'Développe (x + 3)(x + 5). Les quatre produits sont x², 5x, 3x et 15.'], ['Collect the like terms: x² + 8x + 15.', 'Regroupe les termes semblables : x² + 8x + 15.']),
      ex(['Example 2: factor and solve', 'Exemple 2 : factoriser et résoudre'], ['Solve x² − 5x − 14 = 0. Look for two numbers that multiply to −14 and add to −5: they are −7 and 2.', 'Résous x² − 5x − 14 = 0. Cherche deux nombres dont le produit est −14 et la somme est −5 : ce sont −7 et 2.'], ['So (x − 7)(x + 2) = 0, and x = 7 or x = −2.', 'Donc (x − 7)(x + 2) = 0, et x = 7 ou x = −2.']),
      ex(['Example 3: vertex to standard', 'Exemple 3 : de la forme canonique à la forme standard'], ['y = 2(x − 3)² + 1 has its vertex at (3, 1). Expand (x − 3)² = x² − 6x + 9.', 'y = 2(x − 3)² + 1 a son sommet en (3, 1). Développe (x − 3)² = x² − 6x + 9.'], ['Multiply by 2 and add 1: y = 2x² − 12x + 19.', 'Multiplie par 2 et ajoute 1 : y = 2x² − 12x + 19.']),
    ],
    tryIt: { skill: 'MS.G11.MBF3C.A1.2.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mbf-exponents',
    skills: ['MS.G11.MBF3C.A2.1.a', 'MS.G11.MBF3C.A2.2.a', 'MS.G11.MBF3C.A2.3.a'],
    title: t('Zero and negative exponents, and exponential growth', 'Exposants nuls et négatifs, et croissance exponentielle'),
    intro: t('An exponent counts repeated multiplication. Zero and negative exponents extend the idea, and the same powers describe things that double, halve, grow or shrink by a fixed percent.', 'Un exposant compte une multiplication répétée. Les exposants nuls et négatifs prolongent l\'idée, et les mêmes puissances décrivent ce qui double, diminue de moitié, augmente ou diminue d\'un pourcentage fixe.'),
    definitions: [
      d(['Zero exponent', 'Exposant nul'], ['Any non-zero number to the power 0 equals 1. For example 7⁰ = 1.', 'Tout nombre non nul puissance 0 vaut 1. Par exemple, 7⁰ = 1.']),
      d(['Negative exponent', 'Exposant négatif'], ['A negative exponent means the reciprocal: a⁻ⁿ = 1 ÷ aⁿ. It makes a small positive number, never a negative one.', 'Un exposant négatif signifie l\'inverse : a⁻ⁿ = 1 ÷ aⁿ. Cela donne un petit nombre positif, jamais un nombre négatif.']),
      d(['Exponent rules', 'Règles des exposants'], ['With the same base, add the exponents when you multiply and subtract them when you divide. A power of a power multiplies the exponents.', 'Avec la même base, on additionne les exposants en multipliant et on les soustrait en divisant. Une puissance de puissance multiplie les exposants.']),
      d(['Growth and decay', 'Croissance et décroissance'], ['Final amount = start × factor to the power of the number of periods. A rise of 10% a period has the factor 1.1; a fall of 10% has the factor 0.9.', 'Montant final = départ × facteur puissance le nombre de périodes. Une hausse de 10 % par période a pour facteur 1,1 ; une baisse de 10 % a pour facteur 0,9.']),
    ],
    examples: [
      ex(['Example 1: a zero exponent', 'Exemple 1 : un exposant nul'], ['Evaluate 7⁰ + 2³. The first term is 1 and the second is 8.', 'Évalue 7⁰ + 2³. Le premier terme vaut 1 et le second vaut 8.'], ['The sum is 9.', 'La somme est 9.']),
      ex(['Example 2: negative exponents', 'Exemple 2 : exposants négatifs'], ['10⁻² = 1 ÷ 10² = 1 ÷ 100 = 0.01.', '10⁻² = 1 ÷ 10² = 1 ÷ 100 = 0,01.'], ['2⁻³ = 1 ÷ 8 = 0.125.', '2⁻³ = 1 ÷ 8 = 0,125.']),
      ex(['Example 3: growth', 'Exemple 3 : croissance'], ['A culture of 50 bacteria doubles every 3 hours. In 12 hours it doubles 12 ÷ 3 = 4 times.', 'Une culture de 50 bactéries double toutes les 3 heures. En 12 heures, elle double 12 ÷ 3 = 4 fois.'], ['50 × 2⁴ = 50 × 16 = 800 bacteria.', '50 × 2⁴ = 50 × 16 = 800 bactéries.']),
    ],
    tryIt: { skill: 'MS.G11.MBF3C.A2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mbf-finance',
    skills: ['MS.G11.MBF3C.B1.1.a', 'MS.G11.MBF3C.B1.2.a', 'MS.G11.MBF3C.B2.1.a', 'MS.G11.MBF3C.B3.1.a'],
    title: t('Interest, credit and the cost of a vehicle', 'Intérêt, crédit et coût d\'un véhicule'),
    intro: t('Money that is borrowed or invested earns interest, and owning a car has costs you can add up. Knowing the true cost lets you compare choices before you commit.', 'L\'argent emprunté ou placé rapporte de l\'intérêt, et posséder une voiture entraîne des coûts qu\'on peut additionner. Connaître le vrai coût permet de comparer les choix avant de s\'engager.'),
    definitions: [
      d(['Simple interest', 'Intérêt simple'], ['I = P × r × t. The interest is the same every year because it is always charged on the original amount P.', 'I = P × r × t. L\'intérêt est le même chaque année, car il est toujours calculé sur le montant de départ P.']),
      d(['Compound interest', 'Intérêt composé'], ['A = P(1 + i)ⁿ, where i is the rate for one period and n is the number of periods. The interest is I = A − P. Interest is earned on earlier interest, so it grows faster than simple interest.', 'A = P(1 + i)ⁿ, où i est le taux pour une période et n le nombre de périodes. L\'intérêt est I = A − P. L\'intérêt rapporte sur l\'intérêt déjà gagné : il croît plus vite que l\'intérêt simple.']),
      d(['The cost of borrowing', 'Le coût d\'un emprunt'], ['Total cost = down payment + amount borrowed + interest. Interest is charged only on the amount borrowed, not on the down payment.', 'Coût total = acompte + montant emprunté + intérêt. L\'intérêt ne porte que sur le montant emprunté, pas sur l\'acompte.']),
      d(['Vehicle costs', 'Coûts d\'un véhicule'], ['Fixed costs (loan or lease payments, insurance, licence) are paid whatever you drive. Operating costs (fuel, maintenance) grow with the distance. Fuel cost = distance ÷ 100 × litres per 100 km × price per litre.', 'Les coûts fixes (paiements de prêt ou de location, assurance, immatriculation) sont payés peu importe la distance. Les coûts d\'utilisation (carburant, entretien) augmentent avec la distance. Coût du carburant = distance ÷ 100 × litres aux 100 km × prix du litre.']),
    ],
    examples: [
      ex(['Example 1: simple against compound', 'Exemple 1 : simple et composé'], ['Invest 2000 dollars at 5% a year for 3 years. Simple interest: 2000 × 0.05 × 3 = 300 dollars.', 'Place 2000 dollars à 5 % par année pendant 3 ans. Intérêt simple : 2000 × 0,05 × 3 = 300 dollars.'], ['Compound: 2000 × 1.05³ = 2315.25, so the interest is 315.25 dollars, which is 15.25 dollars more.', 'Composé : 2000 × 1,05³ = 2315,25, donc l\'intérêt est de 315,25 dollars, soit 15,25 dollars de plus.']),
      ex(['Example 2: borrowing', 'Exemple 2 : emprunter'], ['Borrow 600 dollars for 2 years at 8% simple interest. The interest is 600 × 0.08 × 2 = 96 dollars.', 'Emprunte 600 dollars pendant 2 ans à 8 % d\'intérêt simple. L\'intérêt est de 600 × 0,08 × 2 = 96 dollars.'], ['You repay 600 + 96 = 696 dollars.', 'Tu rembourses 600 + 96 = 696 dollars.']),
      ex(['Example 3: fuel', 'Exemple 3 : carburant'], ['A car uses 9 litres per 100 km. A 400 km trip uses 400 ÷ 100 × 9 = 36 litres.', 'Une voiture consomme 9 litres aux 100 km. Un trajet de 400 km consomme 400 ÷ 100 × 9 = 36 litres.'], ['At 1.50 dollars per litre the fuel costs 36 × 1.50 = 54 dollars.', 'À 1,50 dollar le litre, le carburant coûte 36 × 1,50 = 54 dollars.']),
    ],
    tryIt: { skill: 'MS.G11.MBF3C.B1.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mbf-geometry',
    skills: ['MS.G11.MBF3C.C1.1.a', 'MS.G11.MBF3C.C2.1.a', 'MS.G11.MBF3C.C2.2.a'],
    title: t('Design measurements and the sine and cosine laws', 'Mesures de conception et lois des sinus et des cosinus'),
    intro: t('Designs are often made of right triangles, rectangles and boxes. When a triangle has no right angle, the sine law and the cosine law find the missing sides and angles.', 'Les conceptions sont souvent faites de triangles rectangles, de rectangles et de boîtes. Quand un triangle n\'a pas d\'angle droit, la loi des sinus et la loi des cosinus trouvent les côtés et les angles manquants.'),
    definitions: [
      d(['Composite designs', 'Conceptions composées'], ['Split a shape into pieces you know, such as right triangles and rectangles. Use the Pythagorean theorem for a missing side, then add or subtract areas or volumes.', 'Divise une forme en pièces connues, comme des triangles rectangles et des rectangles. Utilise le théorème de Pythagore pour un côté manquant, puis additionne ou soustrais des aires ou des volumes.']),
      d(['The sine law', 'La loi des sinus'], ['a ÷ sin A = b ÷ sin B. Use it when you know a side and its opposite angle, plus one more side or angle.', 'a ÷ sin A = b ÷ sin B. Utilise-la quand tu connais un côté et son angle opposé, plus un autre côté ou angle.']),
      d(['The cosine law', 'La loi des cosinus'], ['c² = a² + b² − 2ab cos C. Use it when you know two sides and the angle between them, or all three sides.', 'c² = a² + b² − 2ab cos C. Utilise-la quand tu connais deux côtés et l\'angle compris, ou les trois côtés.']),
      d(['Which law?', 'Quelle loi ?'], ['If the known angle is opposite a known side, try the sine law. If the known angle sits between two known sides, use the cosine law.', 'Si l\'angle connu est opposé à un côté connu, essaie la loi des sinus. Si l\'angle connu est entre deux côtés connus, utilise la loi des cosinus.']),
    ],
    examples: [
      ex(['Example 1: a trapezoid', 'Exemple 1 : un trapèze'], ['An isosceles trapezoid has a top of 6 cm, a bottom of 14 cm and slanted sides of 5 cm. Each end sticks out (14 − 6) ÷ 2 = 4 cm, so the height is the square root of 25 − 16 = 3 cm.', 'Un trapèze isocèle a un haut de 6 cm, un bas de 14 cm et des côtés obliques de 5 cm. Chaque extrémité dépasse de (14 − 6) ÷ 2 = 4 cm : la hauteur est la racine carrée de 25 − 16 = 3 cm.'], ['The area is (6 + 14) ÷ 2 × 3 = 30 cm².', 'L\'aire est (6 + 14) ÷ 2 × 3 = 30 cm².']),
      ex(['Example 2: the sine law', 'Exemple 2 : la loi des sinus'], ['In a triangle A = 40°, B = 60° and a = 10. Then b = 10 × sin 60° ÷ sin 40°.', 'Dans un triangle, A = 40°, B = 60° et a = 10. Alors b = 10 × sin 60° ÷ sin 40°.'], ['That is 10 × 0.8660 ÷ 0.6428, so b is about 13.5.', 'Cela donne 10 × 0,8660 ÷ 0,6428 : b vaut environ 13,5.']),
      ex(['Example 3: the cosine law', 'Exemple 3 : la loi des cosinus'], ['Two sides are 7 and 9, with 50° between them. Then c² = 49 + 81 − 2(7)(9)cos 50° = 130 − 126 × 0.6428 = 49.0.', 'Deux côtés mesurent 7 et 9, avec 50° entre eux. Alors c² = 49 + 81 − 2(7)(9)cos 50° = 130 − 126 × 0,6428 = 49,0.'], ['So c is about 7.0.', 'Donc c vaut environ 7,0.']),
    ],
    tryIt: { skill: 'MS.G11.MBF3C.C2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.g11.mbf-data',
    skills: ['MS.G11.MBF3C.D1.1.a', 'MS.G11.MBF3C.D2.1.a'],
    title: t('Spread of data and the rules of probability', 'Étalement des données et règles de probabilité'),
    intro: t('Quartiles show how data is spread around the middle, and a few rules let you combine probabilities of events without listing every outcome.', 'Les quartiles montrent comment les données s\'étalent autour du milieu, et quelques règles permettent de combiner les probabilités d\'événements sans lister tous les résultats.'),
    definitions: [
      d(['Quartiles', 'Quartiles'], ['Order the data. The median splits it in two halves. Q1 is the median of the lower half, Q3 is the median of the upper half, and the interquartile range is IQR = Q3 − Q1.', 'Ordonne les données. La médiane les sépare en deux moitiés. Q1 est la médiane de la moitié inférieure, Q3 est la médiane de la moitié supérieure, et l\'écart interquartile est EIQ = Q3 − Q1.']),
      d(['Outliers', 'Valeurs aberrantes'], ['A value is an outlier if it is below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR.', 'Une valeur est aberrante si elle est sous Q1 − 1,5 × EIQ ou au-dessus de Q3 + 1,5 × EIQ.']),
      d(['Complement and union', 'Complément et réunion'], ['P(not A) = 1 − P(A). P(A or B) = P(A) + P(B) − P(A and B), so the overlap is not counted twice.', 'P(non A) = 1 − P(A). P(A ou B) = P(A) + P(B) − P(A et B) : le chevauchement n\'est pas compté deux fois.']),
      d(['Independent events', 'Événements indépendants'], ['If one event does not change the chance of the other, then P(A and B) = P(A) × P(B).', 'Si un événement ne change pas la chance de l\'autre, alors P(A et B) = P(A) × P(B).']),
    ],
    examples: [
      ex(['Example 1: quartiles', 'Exemple 1 : quartiles'], ['Data: 3, 5, 6, 8, 9, 12, 14. The median is 8. The lower half 3, 5, 6 has median 5, and the upper half 9, 12, 14 has median 12.', 'Données : 3, 5, 6, 8, 9, 12, 14. La médiane est 8. La moitié inférieure 3, 5, 6 a pour médiane 5, et la moitié supérieure 9, 12, 14 a pour médiane 12.'], ['IQR = 12 − 5 = 7. The fences are −5.5 and 22.5, so there are no outliers.', 'EIQ = 12 − 5 = 7. Les barrières sont −5,5 et 22,5 : il n\'y a pas de valeur aberrante.']),
      ex(['Example 2: or', 'Exemple 2 : ou'], ['P(A) = 0.5, P(B) = 0.3 and P(A and B) = 0.1.', 'P(A) = 0,5, P(B) = 0,3 et P(A et B) = 0,1.'], ['P(A or B) = 0.5 + 0.3 − 0.1 = 0.7.', 'P(A ou B) = 0,5 + 0,3 − 0,1 = 0,7.']),
      ex(['Example 3: independent events', 'Exemple 3 : événements indépendants'], ['Two independent events have P(A) = 0.4 and P(B) = 0.5, so P(A and B) = 0.2.', 'Deux événements indépendants ont P(A) = 0,4 et P(B) = 0,5 : P(A et B) = 0,2.'], ['The chance that at least one happens is 0.4 + 0.5 − 0.2 = 0.7.', 'La chance qu\'au moins un se produise est 0,4 + 0,5 − 0,2 = 0,7.']),
    ],
    tryIt: { skill: 'MS.G11.MBF3C.D1.1.a', tier: 1, seed: 2 },
  },
];
