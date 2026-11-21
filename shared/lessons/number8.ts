// Lessons for the Grade 8 Number strand (B).
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });
const f = (n: number, dd: number): string => tex(frac(n, dd));

export const NUMBER8_LESSONS: Lesson[] = [
  {
    id: 'L.number8.sci-real-roots',
    skills: ['MS.G8.B1.1.a', 'MS.G8.B2.3.a', 'MS.G8.B1.2.a', 'MS.G8.B1.3.a', 'MS.G8.B2.2.a'],
    title: t('Scientific notation, real numbers and square roots', 'Notation scientifique, nombres réels et racines carrées'),
    intro: t('Powers of ten make huge and tiny numbers easy to write. Real numbers are rational or irrational, and square roots can be found exactly or estimated.', 'Les puissances de dix permettent d\'écrire facilement les nombres immenses et minuscules. Les nombres réels sont rationnels ou irrationnels, et les racines carrées se trouvent exactement ou s\'estiment.'),
    definitions: [
      d(['Scientific notation', 'Notation scientifique'], ['Write a number as a × 10 to a power n, with a at least 1 and less than 10. Big numbers have a positive n; numbers smaller than 1 have a negative n.', 'Écris un nombre sous la forme a × 10 à la puissance n, avec a d\'au moins 1 et de moins de 10. Les grands nombres ont un n positif ; les nombres plus petits que 1 ont un n négatif.']),
      d(['Powers of ten', 'Puissances de dix'], ['Multiplying by 10, 100 or 1000 moves the decimal point right by 1, 2 or 3 places. Dividing moves it left. The exponent tells how many places.', 'Multiplier par 10, 100 ou 1000 déplace la virgule vers la droite de 1, 2 ou 3 positions. Diviser la déplace vers la gauche. L\'exposant indique le nombre de positions.']),
      d(['Rational and irrational', 'Rationnel et irrationnel'], ['A rational number can be written as a fraction of integers (whole numbers, fractions, decimals that stop, roots of perfect squares). Irrational numbers cannot: pi and roots of numbers that are not perfect squares. Together they make the real numbers.', 'Un nombre rationnel peut s\'écrire comme une fraction d\'entiers (nombres entiers, fractions, nombres décimaux finis, racines de carrés parfaits). Un nombre irrationnel ne le peut pas : pi et les racines de nombres qui ne sont pas des carrés parfaits. Ensemble, ils forment les nombres réels.']),
      d(['Estimating a root', 'Estimer une racine'], ['Find the two perfect squares the number sits between. The root sits between their roots, closer to the nearer one.', 'Trouve les deux carrés parfaits entre lesquels se trouve le nombre. La racine est entre leurs racines, plus proche de la plus proche.']),
    ],
    examples: [
      ex(['Example 1: big and small', 'Exemple 1 : grand et petit'], ['45 000 = 4.5 × 10 to the power 4 (the decimal point moved 4 places left).', '45 000 = 4,5 × 10 à la puissance 4 (la virgule s\'est déplacée de 4 positions vers la gauche).'], ['0.00052 = 5.2 × 10 to the power −4 (it moved 4 places right, and the number is less than 1).', '0,00052 = 5,2 × 10 à la puissance −4 (elle s\'est déplacée de 4 positions vers la droite, et le nombre est inférieur à 1).']),
      ex(['Example 2: rational or not', 'Exemple 2 : rationnel ou non'], ['The square root of 49 is 7, a whole number, so it is rational.', 'La racine carrée de 49 est 7, un nombre entier : elle est rationnelle.'], ['The square root of 50 is not a whole number and its decimals never repeat or stop, so it is irrational.', 'La racine carrée de 50 n\'est pas un nombre entier et ses décimales ne se répètent ni ne s\'arrêtent : elle est irrationnelle.']),
      ex(['Example 3: estimate', 'Exemple 3 : estimer'], ['The square root of 50: 50 is between 49 and 64, so the root is between 7 and 8.', 'La racine carrée de 50 : 50 est entre 49 et 64, donc la racine est entre 7 et 8.'], ['50 is much closer to 49, so the root is about 7.1, and closest to 7.', '50 est bien plus proche de 49, donc la racine est environ 7,1, et la plus proche de 7.']),
    ],
    tryIt: { skill: 'MS.G8.B1.3.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number8.percents-proportions',
    skills: ['MS.G8.B1.4.a', 'MS.G8.B2.8.a'],
    title: t('Percents beyond 0 to 100, and proportions', 'Pourcentages au-delà de 0 à 100, et proportions'),
    intro: t('A percent can be more than 100 or less than 1. Equal ratios let you find unknown values and compare deals.', 'Un pourcentage peut dépasser 100 ou être inférieur à 1. Les rapports égaux permettent de trouver des valeurs inconnues et de comparer des offres.'),
    definitions: [
      d(['Percent as a decimal', 'Pourcentage en nombre décimal'], ['Divide the percent by 100. 150% is 1.5, which is more than the whole. 0.5% is 0.005, which is much less than 1% of the whole.', 'Divise le pourcentage par 100. 150 % égale 1,5, soit plus que le tout. 0,5 % égale 0,005, soit bien moins que 1 % du tout.']),
      d(['Unit rate', 'Taux unitaire'], ['Divide to find the amount for one. To compare two offers, compare the price of one.', 'Divise pour trouver la quantité pour un. Pour comparer deux offres, compare le prix d\'un.']),
    ],
    examples: [
      ex(['Example 1: more than 100%', 'Exemple 1 : plus de 100 %'], ['150% of 80 = 1.5 × 80.', '150 % de 80 = 1,5 × 80.'], ['That is 120, which is bigger than 80.', 'Cela fait 120, soit plus que 80.']),
      ex(['Example 2: less than 1%', 'Exemple 2 : moins de 1 %'], ['0.5% of 2000 = 0.005 × 2000.', '0,5 % de 2000 = 0,005 × 2000.'], ['That is 10.', 'Cela fait 10.']),
      ex(['Example 3: a proportion', 'Exemple 3 : une proportion'], ['3 over 5 equals x over 20. The bottom number was multiplied by 20 ÷ 5 = 4.', '3 sur 5 égale x sur 20. Le nombre du bas a été multiplié par 20 ÷ 5 = 4.'], ['Multiply the top the same way: 3 × 4 = 12, so x = 12.', 'Multiplie le haut de la même façon : 3 × 4 = 12, donc x = 12.']),
    ],
    tryIt: { skill: 'MS.G8.B1.4.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.number8.integers-order',
    skills: ['MS.G8.B2.4.a', 'MS.G8.B2.7.a', 'MS.G8.B2.1.a'],
    title: t('Integers and the order of operations', 'Les entiers et l\'ordre des opérations'),
    intro: t('Signs decide the answers when you add, subtract, multiply and divide integers. The order of operations keeps longer calculations in line.', 'Les signes décident des réponses quand on additionne, soustrait, multiplie et divise des entiers. L\'ordre des opérations garde en ordre les calculs plus longs.'),
    definitions: [
      d(['Add and subtract', 'Additionner et soustraire'], ['Subtracting a number is the same as adding its opposite: 5 − (−3) = 5 + 3. Work left to right.', 'Soustraire un nombre revient à additionner son opposé : 5 − (−3) = 5 + 3. Va de gauche à droite.']),
      d(['Multiply and divide', 'Multiplier et diviser'], ['Same signs give a positive answer; different signs give a negative answer. Multiply or divide the sizes first.', 'Des signes identiques donnent une réponse positive ; des signes différents donnent une réponse négative. Multiplie ou divise d\'abord les grandeurs.']),
      d(['Order of operations', 'Ordre des opérations'], ['Brackets, exponents, multiply and divide left to right, then add and subtract left to right. (−3)² = 9, but −3² means −(3²) = −9.', 'Parenthèses, exposants, multiplication et division de gauche à droite, puis addition et soustraction de gauche à droite. (−3)² = 9, mais −3² veut dire −(3²) = −9.']),
    ],
    examples: [
      ex(['Example 1: subtract a negative', 'Exemple 1 : soustraire un négatif'], ['−23 − (−17) = −23 + 17.', '−23 − (−17) = −23 + 17.'], ['Different signs: 23 − 17 = 6, and 23 is bigger and negative, so the answer is −6.', 'Signes différents : 23 − 17 = 6, et 23 est plus grand et négatif : la réponse est −6.']),
      ex(['Example 2: signs in a product', 'Exemple 2 : signes dans un produit'], ['(−6) × (−7): the signs are the same, so the answer is positive.', '(−6) × (−7) : les signes sont identiques, donc la réponse est positive.'], ['6 × 7 = 42, so the answer is 42.', '6 × 7 = 42, donc la réponse est 42.']),
      ex(['Example 3: order', 'Exemple 3 : l\'ordre'], ['(−3)² + 4 × (−5). Exponent first: 9. Then multiply: 4 × (−5) = −20.', '(−3)² + 4 × (−5). Exposant d\'abord : 9. Puis multiplie : 4 × (−5) = −20.'], ['9 + (−20) = −11.', '9 + (−20) = −11.']),
    ],
    tryIt: { skill: 'MS.G8.B2.7.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number8.fractions',
    skills: ['MS.G8.B2.5.a', 'MS.G8.B2.6.a'],
    title: t('Fractions and mixed numbers', 'Fractions et nombres fractionnaires'),
    intro: t('Common denominators let you add and subtract. To multiply or divide, change mixed numbers to improper fractions first.', 'Les dénominateurs communs permettent d\'additionner et de soustraire. Pour multiplier ou diviser, transforme d\'abord les nombres fractionnaires en fractions impropres.'),
    definitions: [
      d(['Add and subtract', 'Additionner et soustraire'], ['Rewrite every fraction over a common denominator, combine the numerators, then simplify.', 'Réécris chaque fraction sur un dénominateur commun, combine les numérateurs, puis simplifie.']),
      d(['Multiply and divide', 'Multiplier et diviser'], ['Change mixed numbers to improper fractions. To multiply, multiply across. To divide, flip the second fraction and multiply. A whole number is a fraction over 1.', 'Transforme les nombres fractionnaires en fractions impropres. Pour multiplier, multiplie en ligne. Pour diviser, retourne la deuxième fraction et multiplie. Un nombre entier est une fraction sur 1.']),
    ],
    examples: [
      ex(['Example 1: add and subtract', 'Exemple 1 : additionner et soustraire'], [`${f(1, 6)} + ${f(3, 4)} − ${f(1, 3)}. The common denominator is 12: ${f(2, 12)} + ${f(9, 12)} − ${f(4, 12)}.`, `${f(1, 6)} + ${f(3, 4)} − ${f(1, 3)}. Le dénominateur commun est 12 : ${f(2, 12)} + ${f(9, 12)} − ${f(4, 12)}.`], [`Combine: ${f(7, 12)}.`, `Combine : ${f(7, 12)}.`]),
      ex(['Example 2: mixed numbers', 'Exemple 2 : nombres fractionnaires'], [`Change to improper fractions and multiply: 2${f(1, 2)} × 1${f(1, 3)} = ${f(5, 2)} × ${f(4, 3)} = ${f(20, 6)}.`, `Transforme en fractions impropres et multiplie : 2${f(1, 2)} × 1${f(1, 3)} = ${f(5, 2)} × ${f(4, 3)} = ${f(20, 6)}.`], [`Simplify: ${f(10, 3)}.`, `Simplifie : ${f(10, 3)}.`]),
      ex(['Example 3: divide', 'Exemple 3 : diviser'], [`Flip the 6 (it is 6 over 1) and multiply: ${f(3, 4)} ÷ 6 = ${f(3, 4)} × ${f(1, 6)} = ${f(3, 24)}.`, `Retourne le 6 (c\'est 6 sur 1) et multiplie : ${f(3, 4)} ÷ 6 = ${f(3, 4)} × ${f(1, 6)} = ${f(3, 24)}.`], [`Simplify: ${f(1, 8)}.`, `Simplifie : ${f(1, 8)}.`]),
    ],
    tryIt: { skill: 'MS.G8.B2.5.a', tier: 1, seed: 4 },
  },
];
