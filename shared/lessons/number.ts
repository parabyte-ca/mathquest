// Lessons for the Grade 5-6 Number strand (B). Each has definitions, three worked examples that build, and a guided try-it.
import type { Lesson } from './types.js';
import { frac, t, tex } from '../generators/kit.js';

const m = tex;

export const NUMBER_LESSONS: Lesson[] = [
  {
    id: 'L.number.place-value',
    skills: ['MS.G5.B1.1.a', 'MS.G5.B1.2.a', 'MS.G6.B1.1.a'],
    title: t('Place value: reading, writing and comparing whole numbers', 'Valeur de position : lire, écrire et comparer des nombres entiers'),
    intro: t('Every digit has a value that depends on its place.', 'Chaque chiffre a une valeur qui dépend de sa position.'),
    definitions: [
      { term: t('Place value', 'Valeur de position'), text: t('Each place is ten times the one to its right: ones, tens, hundreds, thousands, ten-thousands, hundred-thousands.', 'Chaque position vaut dix fois celle à sa droite : unités, dizaines, centaines, milliers, dizaines de mille, centaines de mille.') },
      { term: t('Zero as a placeholder', 'Le zéro comme espace réservé'), text: t('A 0 holds a place that has nothing in it, so 3 thousands and 7 ones is 3 007, not 37.', 'Un 0 tient une position vide : 3 milliers et 7 unités, c\'est 3 007, pas 37.') },
    ],
    examples: [
      { title: t('Example 1: build a number', 'Exemple 1 : construire un nombre'), steps: [{ text: t('4 thousands + 6 hundreds + 3 ones: there are no tens, so put a 0 there.', '4 milliers + 6 centaines + 3 unités : il n\'y a pas de dizaines, alors mets un 0.') }, { text: t('The number is 4 603.', 'Le nombre est 4 603.') }] },
      { title: t('Example 2: the value of a digit', 'Exemple 2 : la valeur d\'un chiffre'), steps: [{ text: t('In 58 240, the 8 is in the thousands place.', 'Dans 58 240, le 8 est à la position des milliers.') }, { text: t('Its value is 8 × 1 000 = 8 000.', 'Sa valeur est 8 × 1 000 = 8 000.') }] },
      { title: t('Example 3: compare', 'Exemple 3 : comparer'), steps: [{ text: t('Compare 45 372 and 45 389. The first three digits match.', 'Compare 45 372 et 45 389. Les trois premiers chiffres sont pareils.') }, { text: t('The tens differ: 7 < 8, so 45 372 < 45 389.', 'Les dizaines diffèrent : 7 < 8, donc 45 372 < 45 389.') }] },
    ],
    tryIt: { skill: 'MS.G5.B1.1.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number.rounding',
    skills: ['MS.G5.B1.6.a', 'MS.G5.B2.3.a', 'MS.G6.B1.5.a'],
    title: t('Rounding and estimating', 'Arrondir et estimer'),
    intro: t('Rounding swaps a number for a nearby, friendlier one.', 'Arrondir remplace un nombre par un autre, proche et plus simple.'),
    definitions: [
      { term: t('The rounding rule', 'La règle d\'arrondissement'), text: t('Look at the digit just right of the place you round to. 5 or more: round up. Less than 5: stay the same.', 'Regarde le chiffre juste à droite de la position visée. 5 ou plus : arrondis vers le haut. Moins de 5 : reste pareil.') },
      { term: t('Estimating', 'Estimer'), text: t('Round each number first, then calculate. The answer tells you roughly what to expect.', 'Arrondis d\'abord chaque nombre, puis calcule. La réponse indique à peu près ce à quoi s\'attendre.') },
    ],
    examples: [
      { title: t('Example 1: nearest tenth', 'Exemple 1 : au dixième près'), steps: [{ text: t('Round 4.36 to the nearest tenth. The hundredths digit is 6.', 'Arrondis 4,36 au dixième près. Le chiffre des centièmes est 6.') }, { text: t('6 is 5 or more, so 4.36 rounds up to 4.4.', '6 est 5 ou plus, donc 4,36 s\'arrondit à 4,4.') }] },
      { title: t('Example 2: a carry', 'Exemple 2 : une retenue'), steps: [{ text: t('Round 3.96 to the nearest tenth. 9 tenths and 1 more tenth makes 1 whole.', 'Arrondis 3,96 au dixième près. 9 dixièmes et 1 dixième de plus font 1 entier.') }, { text: t('So 3.96 rounds to 4.0.', 'Donc 3,96 s\'arrondit à 4,0.') }] },
      { title: t('Example 3: estimate a sum', 'Exemple 3 : estimer une somme'), steps: [{ text: t('Estimate 4.87 + 3.12: round to 5 and 3.', 'Estime 4,87 + 3,12 : arrondis à 5 et à 3.') }, { text: t('5 + 3 = 8, so the sum is about 8.', '5 + 3 = 8, donc la somme est d\'environ 8.') }] },
    ],
    tryIt: { skill: 'MS.G5.B1.6.a', tier: 1, seed: 4 },
  },
  {
    id: 'L.number.add-subtract',
    skills: ['MS.G5.B2.4.a', 'MS.G6.B2.4.a'],
    title: t('Adding and subtracting whole numbers and decimals', 'Additionner et soustraire des nombres entiers et décimaux'),
    intro: t('Line up the places, then work column by column.', 'Aligne les positions, puis travaille colonne par colonne.'),
    definitions: [
      { term: t('Line up', 'Aligner'), text: t('Whole numbers line up on the right. Decimals line up on the decimal point; add zeros so every number has the same number of decimal places.', 'Les nombres entiers s\'alignent à droite. Les nombres décimaux s\'alignent sur la virgule ; ajoute des zéros pour que chaque nombre ait le même nombre de décimales.') },
      { term: t('Regroup', 'Regrouper'), text: t('When a column adds to 10 or more, carry to the next place. When the top digit is too small, borrow from the next place.', 'Quand une colonne fait 10 ou plus, reporte à la position suivante. Quand le chiffre du haut est trop petit, emprunte à la position suivante.') },
    ],
    examples: [
      { title: t('Example 1: add with a carry', 'Exemple 1 : addition avec retenue'), steps: [{ text: t('4 786 + 2 358: 6 + 8 = 14, write 4 and carry 1.', '4 786 + 2 358 : 6 + 8 = 14, écris 4 et retiens 1.') }, { text: t('Keep going left: the answer is 7 144.', 'Continue vers la gauche : la réponse est 7 144.') }] },
      { title: t('Example 2: subtract with a borrow', 'Exemple 2 : soustraction avec emprunt'), steps: [{ text: t('5 003 − 1 487: the zeros need to borrow from the thousands.', '5 003 − 1 487 : les zéros doivent emprunter aux milliers.') }, { text: t('The answer is 3 516.', 'La réponse est 3 516.') }] },
      { title: t('Example 3: decimals', 'Exemple 3 : nombres décimaux'), steps: [{ text: t('4.5 + 3.27: write 4.5 as 4.50 so the decimal points line up.', '4,5 + 3,27 : écris 4,5 sous la forme 4,50 pour aligner les virgules.') }, { text: t('4.50 + 3.27 = 7.77.', '4,50 + 3,27 = 7,77.') }] },
    ],
    tryIt: { skill: 'MS.G5.B2.4.a', tier: 1, seed: 6 },
  },
  {
    id: 'L.number.multiply-divide',
    skills: ['MS.G5.B2.2.a', 'MS.G5.B2.6.a', 'MS.G5.B2.7.a'],
    title: t('Multiplying and dividing whole numbers', 'Multiplier et diviser des nombres entiers'),
    intro: t('Multiplication and division undo each other, and the area model shows why.', 'La multiplication et la division s\'annulent l\'une l\'autre, et le modèle d\'aire montre pourquoi.'),
    definitions: [
      { term: t('Related facts', 'Faits reliés'), text: t('7 × 8 = 56 means 56 ÷ 8 = 7 and 56 ÷ 7 = 8.', '7 × 8 = 56 veut dire 56 ÷ 8 = 7 et 56 ÷ 7 = 8.') },
      { term: t('Area model', 'Modèle d\'aire'), text: t('Split each number into tens and ones and multiply every part by every part, then add.', 'Sépare chaque nombre en dizaines et unités et multiplie chaque partie par chaque partie, puis additionne.') },
      { term: t('Remainder', 'Reste'), text: t('What is left over after making equal groups. Whether you ignore it or round up depends on the question.', 'Ce qui reste après avoir fait des groupes égaux. Selon la question, on l\'ignore ou on arrondit vers le haut.') },
    ],
    examples: [
      { title: t('Example 1: a fact family', 'Exemple 1 : une famille de faits'), steps: [{ text: t('? × 6 = 42. Think 42 ÷ 6.', '? × 6 = 42. Pense à 42 ÷ 6.') }, { text: t('42 ÷ 6 = 7, so the missing number is 7.', '42 ÷ 6 = 7, donc le nombre manquant est 7.') }] },
      { title: t('Example 2: 23 × 14 with an area model', 'Exemple 2 : 23 × 14 avec un modèle d\'aire'), steps: [{ text: t('20×10 = 200, 20×4 = 80, 3×10 = 30, 3×4 = 12.', '20×10 = 200, 20×4 = 80, 3×10 = 30, 3×4 = 12.') }, { text: t('Add the four parts: 200 + 80 + 30 + 12 = 322.', 'Additionne les quatre parties : 200 + 80 + 30 + 12 = 322.') }] },
      { title: t('Example 3: a remainder in a story', 'Exemple 3 : un reste dans une histoire'), steps: [{ text: t('150 students, 24 per bus: 150 ÷ 24 = 6 remainder 6.', '150 élèves, 24 par autobus : 150 ÷ 24 = 6, reste 6.') }, { text: t('The 6 left over still need a bus, so 7 buses.', 'Les 6 élèves qui restent ont besoin d\'un autobus : 7 autobus.') }] },
    ],
    tryIt: { skill: 'MS.G5.B2.2.a', tier: 1, seed: 8 },
  },
  {
    id: 'L.number.properties-multistep',
    skills: ['MS.G5.B2.1.a', 'MS.G5.B2.1.b', 'MS.G6.B2.1.a'],
    title: t('Properties and multi-step problems', 'Propriétés et problèmes à plusieurs étapes'),
    intro: t('Break a problem into steps, and use properties to make the steps easy.', 'Décompose un problème en étapes, et utilise les propriétés pour les rendre faciles.'),
    definitions: [
      { term: t('Commutative, associative, distributive', 'Commutativité, associativité, distributivité'), text: t('Order does not matter for adding or multiplying, grouping does not matter, and a × (b + c) = a × b + a × c.', 'L\'ordre ne compte pas pour additionner ou multiplier, le regroupement non plus, et a × (b + c) = a × b + a × c.') },
      { term: t('Plan, then solve', 'Planifie, puis résous'), text: t('Decide what to find first, then what to do with it. Check that the answer makes sense.', 'Décide d\'abord ce qu\'il faut trouver, puis quoi en faire. Vérifie que la réponse est logique.') },
    ],
    examples: [
      { title: t('Example 1: use a property', 'Exemple 1 : utiliser une propriété'), steps: [{ text: t('25 × 12 = 25 × 4 × 3 by regrouping 12 as 4 × 3.', '25 × 12 = 25 × 4 × 3 en regroupant 12 sous la forme 4 × 3.') }, { text: t('25 × 4 = 100, and 100 × 3 = 300.', '25 × 4 = 100, et 100 × 3 = 300.') }] },
      { title: t('Example 2: two steps', 'Exemple 2 : deux étapes'), steps: [{ text: t('Boxes of 12 pencils: 4 boxes, then 9 given away. First 4 × 12 = 48.', 'Des boîtes de 12 crayons : 4 boîtes, puis 9 donnés. D\'abord 4 × 12 = 48.') }, { text: t('Then 48 − 9 = 39 pencils left.', 'Puis 48 − 9 = 39 crayons restants.') }] },
      { title: t('Example 3: with a percent', 'Exemple 3 : avec un pourcentage'), steps: [{ text: t('A 60 dollar jacket is 25% off. 25% of 60 is 15.', 'Un manteau de 60 dollars est à 25 % de rabais. 25 % de 60, c\'est 15.') }, { text: t('The sale price is 60 − 15 = 45 dollars.', 'Le prix en solde est 60 − 15 = 45 dollars.') }] },
    ],
    tryIt: { skill: 'MS.G5.B2.1.a', tier: 1, seed: 2 },
  },
  {
    id: 'L.number.unit-fractions',
    skills: ['MS.G5.B2.8.a', 'MS.G6.B2.9.a', 'MS.G6.B2.10.a'],
    title: t('Multiplying and dividing by fractions', 'Multiplier et diviser par des fractions'),
    intro: t('A fraction of a number is a share. Dividing by a fraction asks how many fit.', 'Une fraction d\'un nombre est un partage. Diviser par une fraction demande combien tiennent.'),
    definitions: [
      { term: t('A fraction of a number', 'Une fraction d\'un nombre'), text: t('Divide by the denominator to get one share, then multiply by the numerator.', 'Divise par le dénominateur pour obtenir une part, puis multiplie par le numérateur.'), visual: { type: 'fractionBar', n: 2, d: 3 } },
      { term: t('Dividing by a fraction', 'Diviser par une fraction'), text: t('Ask how many of that fraction fit. Multiply by the flipped fraction (the reciprocal).', 'Demande combien de cette fraction tiennent. Multiplie par la fraction retournée (l\'inverse).') },
    ],
    examples: [
      { title: t('Example 1: a unit fraction', 'Exemple 1 : une fraction unitaire'), steps: [{ text: t(`${m(`12 \\times ${frac(1, 4)}`)} is one share when 12 is split into 4 equal parts.`, `${m(`12 \\times ${frac(1, 4)}`)} est une part quand 12 est séparé en 4 parties égales.`) }, { text: t('12 ÷ 4 = 3.', '12 ÷ 4 = 3.') }] },
      { title: t('Example 2: a proper fraction', 'Exemple 2 : une fraction propre'), steps: [{ text: t(`${m(`18 \\times ${frac(2, 3)}`)}: one third of 18 is 6.`, `${m(`18 \\times ${frac(2, 3)}`)} : le tiers de 18 est 6.`) }, { text: t('Two thirds is 2 × 6 = 12.', 'Deux tiers, c\'est 2 × 6 = 12.') }] },
      { title: t('Example 3: dividing by a fraction', 'Exemple 3 : diviser par une fraction'), steps: [{ text: t(`${m(`6 \\div ${frac(2, 3)}`)}: how many two-thirds fit in 6?`, `${m(`6 \\div ${frac(2, 3)}`)} : combien de deux tiers tiennent dans 6 ?`) }, { text: t(`Flip and multiply: ${m(`6 \\times ${frac(3, 2)} = 9`)}.`, `Retourne et multiplie : ${m(`6 \\times ${frac(3, 2)} = 9`)}.`) }] },
    ],
    tryIt: { skill: 'MS.G5.B2.8.a', tier: 1, seed: 5 },
  },
  {
    id: 'L.number.ratios-percents',
    skills: ['MS.G5.B2.9.a', 'MS.G6.B2.3.a', 'MS.G6.B2.12.a'],
    title: t('Ratios, rates and percents', 'Rapports, taux et pourcentages'),
    intro: t('Equal ratios come from multiplying both terms by the same number. A percent is a ratio out of 100.', 'Les rapports égaux viennent de la multiplication des deux termes par le même nombre. Un pourcentage est un rapport sur 100.'),
    definitions: [
      { term: t('Equal ratios', 'Rapports égaux'), text: t('2:3 = 4:6 = 6:9. Multiply or divide both terms by the same number; never add the same number to both.', '2:3 = 4:6 = 6:9. Multiplie ou divise les deux termes par le même nombre ; n\'ajoute jamais le même nombre aux deux.') },
      { term: t('Unit rate', 'Taux unitaire'), text: t('The amount for one: price for one item, distance for one hour. Use it to compare.', 'La quantité pour un : prix d\'un article, distance d\'une heure. Sers-t\'en pour comparer.') },
      { term: t('Friendly percents', 'Pourcentages faciles'), text: t('10% is a tenth, 50% a half, 25% a quarter, 1% a hundredth. 5% is half of 10%, and 15% is 10% + 5%.', '10 %, c\'est un dixième, 50 % une moitié, 25 % un quart, 1 % un centième. 5 %, c\'est la moitié de 10 %, et 15 %, c\'est 10 % + 5 %.') },
    ],
    examples: [
      { title: t('Example 1: a missing term', 'Exemple 1 : un terme manquant'), steps: [{ text: t('2:3 = ?:12. The second term was multiplied by 4.', '2:3 = ?:12. Le deuxième terme a été multiplié par 4.') }, { text: t('2 × 4 = 8, so the missing number is 8.', '2 × 4 = 8, donc le nombre manquant est 8.') }] },
      { title: t('Example 2: a rate', 'Exemple 2 : un taux'), steps: [{ text: t('180 km in 3 hours is 60 km in 1 hour.', '180 km en 3 heures, c\'est 60 km en 1 heure.') }, { text: t('In 5 hours: 60 × 5 = 300 km.', 'En 5 heures : 60 × 5 = 300 km.') }] },
      { title: t('Example 3: 15% of 80', 'Exemple 3 : 15 % de 80'), steps: [{ text: t('10% of 80 is 8 and 5% of 80 is 4.', '10 % de 80, c\'est 8 et 5 % de 80, c\'est 4.') }, { text: t('15% of 80 is 8 + 4 = 12.', '15 % de 80, c\'est 8 + 4 = 12.') }] },
    ],
    tryIt: { skill: 'MS.G5.B2.9.a', tier: 1, seed: 9 },
  },
  {
    id: 'L.number.integers',
    skills: ['MS.G6.B1.2.a', 'MS.G6.B1.2.b', 'MS.G6.B1.3.a'],
    title: t('Integers and ordering numbers', 'Les entiers et l\'ordre des nombres'),
    intro: t('Integers include negative numbers. On a number line, numbers to the right are greater.', 'Les entiers comprennent les nombres négatifs. Sur une droite numérique, les nombres à droite sont plus grands.'),
    definitions: [
      { term: t('Integer', 'Entier'), text: t('A whole number or its opposite: …, −3, −2, −1, 0, 1, 2, 3, …', 'Un nombre entier ou son opposé : …, −3, −2, −1, 0, 1, 2, 3, …'), visual: { type: 'numberLine', min: -5, max: 5, ticks: 10, marks: [{ at: -3 }] } },
      { term: t('Opposites', 'Opposés'), text: t('Numbers the same distance from 0 on opposite sides, like 4 and −4.', 'Des nombres à la même distance de 0, de chaque côté, comme 4 et −4.') },
    ],
    examples: [
      { title: t('Example 1: read a mark', 'Exemple 1 : lire un point'), steps: [{ text: t('The mark is 3 units left of 0.', 'Le point est à 3 unités à gauche de 0.'), visual: { type: 'numberLine', min: -5, max: 5, ticks: 10, marks: [{ at: -3 }] } }, { text: t('Left of zero is negative: −3.', 'À gauche de zéro, c\'est négatif : −3.') }] },
      { title: t('Example 2: compare', 'Exemple 2 : comparer'), steps: [{ text: t('Compare −7 and −2. Which is further right?', 'Compare −7 et −2. Lequel est plus à droite ?') }, { text: t('−2 is further right, so −7 < −2.', '−2 est plus à droite, donc −7 < −2.') }] },
      { title: t('Example 3: order mixed numbers', 'Exemple 3 : ordonner des nombres variés'), steps: [{ text: t('Order −1.5, 1/4, 0.3 and −0.5. Negatives first.', 'Ordonne −1,5, 1/4, 0,3 et −0,5. Les négatifs d\'abord.') }, { text: t('−1.5 < −0.5 < 1/4 < 0.3 (since 1/4 = 0.25).', '−1,5 < −0,5 < 1/4 < 0,3 (puisque 1/4 = 0,25).') }] },
    ],
    tryIt: { skill: 'MS.G6.B1.2.a', tier: 1, seed: 3 },
  },
  {
    id: 'L.number.decimals-thousandths',
    skills: ['MS.G6.B1.4.a', 'MS.G6.B1.6.a', 'MS.G6.B2.7.a', 'MS.G6.B2.8.a', 'MS.G6.B2.11.a'],
    title: t('Decimals to thousandths and working with them', 'Les nombres décimaux au millième et leurs opérations'),
    intro: t('Thousandths are the third place after the decimal point. Fractions and decimals are two names for the same number.', 'Les millièmes sont la troisième position après la virgule. Les fractions et les nombres décimaux sont deux noms pour le même nombre.'),
    definitions: [
      { term: t('Thousandths', 'Millièmes'), text: t('One tenth is ten hundredths, and one hundredth is ten thousandths. 0.007 is 7 thousandths.', 'Un dixième vaut dix centièmes, et un centième vaut dix millièmes. 0,007 égale 7 millièmes.') },
      { term: t('Move the point', 'Déplacer la virgule'), text: t('Multiplying by 0.1 moves the point one place left. To divide by a tenth, multiply both numbers by 10 first.', 'Multiplier par 0,1 déplace la virgule d\'une position vers la gauche. Pour diviser par un dixième, multiplie d\'abord les deux nombres par 10.') },
    ],
    examples: [
      { title: t('Example 1: fraction to decimal', 'Exemple 1 : de la fraction au nombre décimal'), steps: [{ text: t('3/8 means 3 ÷ 8.', '3/8 signifie 3 ÷ 8.') }, { text: t('3 ÷ 8 = 0.375.', '3 ÷ 8 = 0,375.') }] },
      { title: t('Example 2: multiply by tenths', 'Exemple 2 : multiplier par des dixièmes'), steps: [{ text: t('345 × 0.6: multiply 345 × 6 = 2 070.', '345 × 0,6 : multiplie 345 × 6 = 2 070.') }, { text: t('One decimal place, so the answer is 207.0 = 207.', 'Une décimale, donc la réponse est 207,0 = 207.') }] },
      { title: t('Example 3: divide a decimal', 'Exemple 3 : diviser un nombre décimal'), steps: [{ text: t('4.56 ÷ 4: divide as if there were no point: 456 ÷ 4 = 114.', '4,56 ÷ 4 : divise comme s\'il n\'y avait pas de virgule : 456 ÷ 4 = 114.') }, { text: t('Put the point back in the same place: 1.14.', 'Remets la virgule au même endroit : 1,14.') }] },
    ],
    tryIt: { skill: 'MS.G6.B1.6.a', tier: 1, seed: 7 },
  },
  {
    id: 'L.number.factors-primes',
    skills: ['MS.G6.B2.2.a', 'MS.G6.B2.6.a'],
    title: t('Divisibility, primes and factor trees', 'Divisibilité, nombres premiers et arbres de facteurs'),
    intro: t('Rules let you test divisibility fast, and factor trees break a number into primes.', 'Des règles permettent de tester la divisibilité rapidement, et les arbres de facteurs décomposent un nombre en nombres premiers.'),
    definitions: [
      { term: t('Divisibility rules', 'Règles de divisibilité'), text: t('By 2: last digit even. By 3: digit sum divisible by 3. By 5: last digit 0 or 5. By 9: digit sum divisible by 9. By 10: last digit 0.', 'Par 2 : dernier chiffre pair. Par 3 : somme des chiffres divisible par 3. Par 5 : dernier chiffre 0 ou 5. Par 9 : somme des chiffres divisible par 9. Par 10 : dernier chiffre 0.') },
      { term: t('Prime and composite', 'Premier et composé'), text: t('A prime number has exactly two factors, 1 and itself. A composite number has more.', 'Un nombre premier a exactement deux facteurs, 1 et lui-même. Un nombre composé en a plus.') },
    ],
    examples: [
      { title: t('Example 1: test a number', 'Exemple 1 : tester un nombre'), steps: [{ text: t('Is 4 152 divisible by 3? Digit sum 4 + 1 + 5 + 2 = 12.', '4 152 est-il divisible par 3 ? Somme des chiffres 4 + 1 + 5 + 2 = 12.') }, { text: t('12 is divisible by 3, so 4 152 is too.', '12 est divisible par 3, donc 4 152 l\'est aussi.') }] },
      { title: t('Example 2: a factor tree', 'Exemple 2 : un arbre de facteurs'), steps: [{ text: t('36 = 4 × 9, and 4 = 2 × 2, 9 = 3 × 3.', '36 = 4 × 9, et 4 = 2 × 2, 9 = 3 × 3.') }, { text: t('The prime factorization is 2 × 2 × 3 × 3, or 2² × 3².', 'La factorisation première est 2 × 2 × 3 × 3, ou 2² × 3².') }] },
      { title: t('Example 3: the greatest prime factor', 'Exemple 3 : le plus grand facteur premier'), steps: [{ text: t('84 = 2 × 2 × 3 × 7.', '84 = 2 × 2 × 3 × 7.') }, { text: t('The greatest prime factor is 7.', 'Le plus grand facteur premier est 7.') }] },
    ],
    tryIt: { skill: 'MS.G6.B2.2.a', tier: 1, seed: 6 },
  },
];
