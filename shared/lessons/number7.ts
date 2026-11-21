// Lessons for the Grade 7 Number strand (B).
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const d = (term: [string, string], text: [string, string]) => ({ term: t(...term), text: t(...text) });
const ex = (title: [string, string], ...steps: [string, string][]) => ({ title: t(...title), steps: steps.map((s) => ({ text: t(...s) })) });
const f = (n: number, dd: number): string => tex(frac(n, dd));

export const NUMBER7_LESSONS: Lesson[] = [
  {
    id: 'L.number7.integers',
    skills: ['MS.G7.B2.4.a', 'MS.G7.B1.3.a'],
    title: t('Integers and negative numbers', 'Les entiers et les nombres négatifs'),
    intro: t('Negative numbers sit to the left of zero. A number line shows how to add, subtract and compare them.', 'Les nombres négatifs sont à gauche de zéro. Une droite numérique montre comment les additionner, les soustraire et les comparer.'),
    definitions: [
      d(['Opposites', 'Opposés'], ['Two numbers the same distance from zero on opposite sides, like 4 and −4. Adding opposites gives 0.', 'Deux nombres à la même distance de zéro, de chaque côté, comme 4 et −4. Additionner des opposés donne 0.']),
      d(['Subtracting a negative', 'Soustraire un nombre négatif'], ['Subtracting a negative number is the same as adding its opposite: 5 − (−3) = 5 + 3.', 'Soustraire un nombre négatif revient à additionner son opposé : 5 − (−3) = 5 + 3.']),
      d(['Comparing negatives', 'Comparer des nombres négatifs'], ['The number farther left on the number line is smaller. So −0.8 is less than −0.3.', 'Le nombre le plus à gauche sur la droite numérique est le plus petit. Donc −0,8 est plus petit que −0,3.']),
    ],
    examples: [
      ex(['Example 1: different signs', 'Exemple 1 : signes différents'], ['Find −7 + 3. The signs are different, so subtract the sizes: 7 − 3 = 4.', 'Trouve −7 + 3. Les signes sont différents : soustrais les grandeurs, 7 − 3 = 4.'], ['The larger size is 7 and it is negative, so the answer is −4.', 'La plus grande grandeur est 7 et elle est négative : la réponse est −4.']),
      ex(['Example 2: subtract a negative', 'Exemple 2 : soustraire un négatif'], ['Find 2 − (−6). Subtracting −6 is the same as adding 6.', 'Trouve 2 − (−6). Soustraire −6 revient à additionner 6.'], ['2 + 6 = 8.', '2 + 6 = 8.']),
      ex(['Example 3: compare', 'Exemple 3 : comparer'], [`Compare ${tex('-\\frac{3}{4}')} and ${tex('-0.8')}. Write both as decimals: −0.75 and −0.8.`, `Compare ${tex('-\\frac{3}{4}')} et ${tex('-0{,}8')}. Écris les deux en décimales : −0,75 et −0,8.`], ['−0.8 is farther left, so it is smaller. −0.75 is greater.', '−0,8 est plus à gauche, donc plus petit. −0,75 est plus grand.']),
    ],
    tryIt: { skill: 'MS.G7.B2.4.a', tier: 2, seed: 3 },
  },
  {
    id: 'L.number7.powers-roots',
    skills: ['MS.G7.B2.7.a', 'MS.G7.B1.2.a', 'MS.G7.B2.1.a'],
    title: t('Powers, square roots and order of operations', 'Les puissances, les racines carrées et l\'ordre des opérations'),
    intro: t('A power is repeated multiplication. A square root undoes a square. Order of operations tells you what to do first.', 'Une puissance est une multiplication répétée. Une racine carrée défait un carré. L\'ordre des opérations dit quoi faire en premier.'),
    definitions: [
      d(['Power', 'Puissance'], ['In 2³ the base is 2 and the exponent is 3. It means 2 × 2 × 2 = 8, not 2 × 3.', 'Dans 2³, la base est 2 et l\'exposant est 3. Cela veut dire 2 × 2 × 2 = 8, et non 2 × 3.']),
      d(['Square and square root', 'Carré et racine carrée'], ['A perfect square is a number times itself, like 49 = 7 × 7. The square root of 49 is 7.', 'Un carré parfait est un nombre multiplié par lui-même, comme 49 = 7 × 7. La racine carrée de 49 est 7.']),
      d(['Order of operations', 'Ordre des opérations'], ['Brackets, then exponents, then multiply and divide from left to right, then add and subtract from left to right.', 'Parenthèses, puis exposants, puis multiplication et division de gauche à droite, puis addition et soustraction de gauche à droite.']),
    ],
    examples: [
      ex(['Example 1: a power', 'Exemple 1 : une puissance'], ['Find 3⁴. Use 3 four times as a factor: 3 × 3 × 3 × 3.', 'Trouve 3⁴. Utilise 3 quatre fois comme facteur : 3 × 3 × 3 × 3.'], ['9 × 9 = 81.', '9 × 9 = 81.']),
      ex(['Example 2: a negative base', 'Exemple 2 : une base négative'], ['Find (−2)³. That is (−2) × (−2) × (−2). The first two make +4.', 'Trouve (−2)³. C\'est (−2) × (−2) × (−2). Les deux premiers donnent +4.'], ['4 × (−2) = −8. An odd number of negative factors gives a negative answer.', '4 × (−2) = −8. Un nombre impair de facteurs négatifs donne une réponse négative.']),
      ex(['Example 3: order of operations', 'Exemple 3 : l\'ordre des opérations'], ['Find (2 + 3)² − 4 × 5. Brackets first: 5, then the exponent: 25.', 'Trouve (2 + 3)² − 4 × 5. Parenthèses d\'abord : 5, puis l\'exposant : 25.'], ['Multiply: 4 × 5 = 20. Then subtract: 25 − 20 = 5.', 'Multiplie : 4 × 5 = 20. Puis soustrais : 25 − 20 = 5.']),
    ],
    tryIt: { skill: 'MS.G7.B2.7.a', tier: 1, seed: 5 },
  },
  {
    id: 'L.number7.factors-fractions',
    skills: ['MS.G7.B1.4.a', 'MS.G7.B2.6.a', 'MS.G7.B2.6.b', 'MS.G7.B2.5.a', 'MS.G7.B2.8.a', 'MS.G7.B2.8.b'],
    title: t('Factors, multiples and fraction operations', 'Facteurs, multiples et opérations sur les fractions'),
    intro: t('Common factors simplify fractions, and common multiples help you add them. Multiplying and dividing fractions have simple rules.', 'Les facteurs communs simplifient les fractions et les multiples communs aident à les additionner. Multiplier et diviser des fractions suit des règles simples.'),
    definitions: [
      d(['GCF and LCM', 'PGFC et PPMC'], ['The greatest common factor (GCF) is the largest number that divides both numbers. The least common multiple (LCM) is the smallest number both divide into.', 'Le plus grand facteur commun (PGFC) est le plus grand nombre qui divise les deux nombres. Le plus petit multiple commun (PPMC) est le plus petit nombre que les deux divisent.']),
      d(['Simplest form', 'Forme irréductible'], ['Divide the numerator and the denominator by their GCF. Then only 1 divides both.', 'Divise le numérateur et le dénominateur par leur PGFC. Alors seul 1 divise les deux.']),
      d(['Multiply and divide', 'Multiplier et diviser'], ['To multiply fractions, multiply the numerators and multiply the denominators. To divide, flip the second fraction and multiply.', 'Pour multiplier des fractions, multiplie les numérateurs et multiplie les dénominateurs. Pour diviser, retourne la deuxième fraction et multiplie.']),
    ],
    examples: [
      ex(['Example 1: simplest form', 'Exemple 1 : forme irréductible'], ['Simplify 18 over 24. The GCF of 18 and 24 is 6.', 'Simplifie 18 sur 24. Le PGFC de 18 et 24 est 6.'], [`Divide both by 6: ${f(3, 4)}.`, `Divise les deux par 6 : ${f(3, 4)}.`]),
      ex(['Example 2: add with unlike denominators', 'Exemple 2 : additionner avec des dénominateurs différents'], [`Add ${f(1, 4)} + ${f(1, 6)}. The LCM of 4 and 6 is 12.`, `Additionne ${f(1, 4)} + ${f(1, 6)}. Le PPMC de 4 et 6 est 12.`], [`Rewrite and add: ${f(3, 12)} + ${f(2, 12)} = ${f(5, 12)}.`, `Réécris et additionne : ${f(3, 12)} + ${f(2, 12)} = ${f(5, 12)}.`]),
      ex(['Example 3: divide fractions', 'Exemple 3 : diviser des fractions'], [`Divide ${f(2, 3)} ÷ ${f(4, 5)}. Flip the second fraction: ${f(2, 3)} × ${f(5, 4)}.`, `Divise ${f(2, 3)} ÷ ${f(4, 5)}. Retourne la deuxième fraction : ${f(2, 3)} × ${f(5, 4)}.`], [`${f(10, 12)} simplifies to ${f(5, 6)}.`, `${f(10, 12)} se simplifie en ${f(5, 6)}.`]),
    ],
    tryIt: { skill: 'MS.G7.B1.4.a', tier: 2, seed: 4 },
  },
  {
    id: 'L.number7.percents-decimals-rates',
    skills: ['MS.G7.B1.7.a', 'MS.G7.B2.3.a', 'MS.G7.B2.9.a', 'MS.G7.B2.10.a'],
    title: t('Percents, decimals and rates', 'Pourcentages, nombres décimaux et taux'),
    intro: t('Percents are fractions out of 100. Moving between fractions, decimals and percents, and finding a unit rate, makes many problems quick.', 'Un pourcentage est une fraction sur 100. Passer des fractions aux nombres décimaux et aux pourcentages, et trouver un taux unitaire, rend bien des problèmes rapides.'),
    definitions: [
      d(['Percent', 'Pourcentage'], ['Percent means per hundred. To change a decimal to a percent, multiply by 100. To change a fraction, divide the numerator by the denominator, then multiply by 100.', 'Pour cent veut dire sur cent. Pour transformer un nombre décimal en pourcentage, multiplie par 100. Pour une fraction, divise le numérateur par le dénominateur, puis multiplie par 100.']),
      d(['Mental percents', 'Pourcentages de tête'], ['10% is one tenth. 5% is half of 10%. 25% is half of 50%. 1% is one hundredth.', '10 % est un dixième. 5 % est la moitié de 10 %. 25 % est la moitié de 50 %. 1 % est un centième.']),
      d(['Unit rate', 'Taux unitaire'], ['A unit rate is the amount for one, like the price of one notebook. Find it by dividing, then multiply to scale up.', 'Un taux unitaire est la quantité pour un, comme le prix d\'un cahier. Trouve-le en divisant, puis multiplie pour passer à plus grand.']),
    ],
    examples: [
      ex(['Example 1: fraction to percent', 'Exemple 1 : fraction en pourcentage'], [`Write ${f(3, 8)} as a percent. 3 ÷ 8 = 0.375.`, `Écris ${f(3, 8)} en pourcentage. 3 ÷ 8 = 0,375.`], ['0.375 × 100 = 37.5, so 37.5%.', '0,375 × 100 = 37,5, donc 37,5 %.']),
      ex(['Example 2: increase by 25%', 'Exemple 2 : augmenter de 25 %'], ['Increase 80 by 25%. 25% of 80 is half of half: 40, then 20.', 'Augmente 80 de 25 %. 25 % de 80, c\'est la moitié de la moitié : 40, puis 20.'], ['80 + 20 = 100.', '80 + 20 = 100.']),
      ex(['Example 3: a unit rate', 'Exemple 3 : un taux unitaire'], ['5 notebooks cost 12.50 dollars. One notebook costs 12.50 ÷ 5 = 2.50 dollars.', '5 cahiers coûtent 12,50 dollars. Un cahier coûte 12,50 ÷ 5 = 2,50 dollars.'], ['8 notebooks cost 8 × 2.50 = 20 dollars.', '8 cahiers coûtent 8 × 2,50 = 20 dollars.']),
    ],
    tryIt: { skill: 'MS.G7.B2.3.a', tier: 1, seed: 2 },
  },
];
